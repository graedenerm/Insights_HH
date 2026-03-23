'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Euro,
  Zap,
  MapPin,
  Wrench,
  Target,
  Info,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import { InlineRating } from '@/components/rating/inline-rating'
import type { InsightWithMeasures } from '@/lib/types'
import { MeasureList } from '@/components/measures/measure-list'

// ── Colors ────────────────────────────────────────────────────────────────────

function typeStyle(type: string) {
  if (type.includes('anomaly') || type === 'anomaly')
    return { bg: 'rgba(220,38,38,0.08)', text: '#dc2626', label: 'Anomalie', icon: 'anomaly' }
  if (type.includes('trend'))
    return { bg: 'rgba(168,85,247,0.08)', text: '#7c3aed', label: 'Trend', icon: 'trend' }
  return { bg: 'rgba(26,47,238,0.08)', text: '#1A2FEE', label: 'Strukturell', icon: 'structural' }
}

function confidenceStyle(c: number | null) {
  if (c === null) return null
  const pct = c > 1 ? c : c * 100
  if (pct >= 90) return { bg: 'rgba(5,150,105,0.08)', text: '#059669', label: `${pct.toFixed(0)} %` }
  if (pct >= 70) return { bg: 'rgba(234,179,8,0.08)', text: '#b45309', label: `${pct.toFixed(0)} %` }
  return { bg: 'rgba(220,38,38,0.06)', text: '#dc2626', label: `${pct.toFixed(0)} %` }
}

function hypothesisTypeStyle(type: string) {
  switch (type.toLowerCase()) {
    case 'problem':     return { bg: 'rgba(220,38,38,0.08)',  text: '#dc2626',  label: 'Problem' }
    case 'benign':      return { bg: 'rgba(5,150,105,0.08)',  text: '#059669',  label: 'Unproblematisch' }
    case 'opportunity': return { bg: 'rgba(26,47,238,0.08)', text: '#1A2FEE', label: 'Potential' }
    default:            return { bg: 'rgba(0,0,0,0.04)',      text: '#737373',  label: type }
  }
}

function formatEur(v: number | null) {
  if (v === null) return '—'
  return v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}
function formatKwh(v: number | null) {
  if (v === null) return '—'
  return v.toLocaleString('de-DE') + ' kWh'
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ImpressionPills({ evals }: { evals: InsightWithMeasures['evaluations'] }) {
  const pos = evals.filter((e) => e.impression === 'positive').length
  const neu = evals.filter((e) => e.impression === 'neutral').length
  const neg = evals.filter((e) => e.impression === 'negative').length
  if (evals.length === 0) return null
  return (
    <div className="flex items-center gap-2">
      {pos > 0 && (
        <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: '#059669' }}>
          <ThumbsUp className="size-3" />{pos}
        </span>
      )}
      {neu > 0 && (
        <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: '#737373' }}>
          <Minus className="size-3" />{neu}
        </span>
      )}
      {neg > 0 && (
        <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: '#dc2626' }}>
          <ThumbsDown className="size-3" />{neg}
        </span>
      )}
    </div>
  )
}

function JsonCollapsible({ title, value }: { title: string; value: unknown }) {
  const [open, setOpen] = useState(false)
  if (!value) return null
  const isEmpty = Array.isArray(value) ? value.length === 0 : typeof value === 'object' && Object.keys(value as object).length === 0
  if (isEmpty) return null
  return (
    <div className="overflow-hidden rounded-lg border" style={{ borderColor: '#E5E5E5' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-gray-50"
        style={{ backgroundColor: '#FAFAFA' }}
      >
        <span className="text-xs font-semibold" style={{ color: '#444444' }}>{title}</span>
        {open ? <ChevronUp className="size-3.5" style={{ color: '#AEAEAE' }} /> : <ChevronDown className="size-3.5" style={{ color: '#AEAEAE' }} />}
      </button>
      {open && (
        <pre className="max-h-48 overflow-auto px-3 py-2 text-[10px] leading-relaxed" style={{ color: '#737373' }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface InsightCardProps {
  insight: InsightWithMeasures
  index: number
  onEvaluationSubmitted?: () => void
}

export function InsightCard({ insight, index, onEvaluationSubmitted }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)

  const ts = typeStyle(insight.type)
  const cs = confidenceStyle(insight.confidence)

  const locationLabel = insight.location
    ? [insight.location.title, insight.location.street_name, insight.location.street_number].filter(Boolean).join(', ')
    : null

  const raw = insight.raw_json as Record<string, unknown>
  const hypotheses = Array.isArray(raw?.hypotheses)
    ? (raw.hypotheses as { type: string; explanation: string }[]).filter(h => h.type && h.explanation)
    : []
  const timeContext     = raw?.timeContext
  const findingDetail   = raw?.findingDetail
  const deviceAttr      = raw?.deviceAttribution
  const context         = raw?.context as Record<string, unknown> | undefined
  const meters          = Array.isArray(context?.meters) ? context.meters : null
  const callTranscripts = Array.isArray(context?.callTranscripts) ? context.callTranscripts : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: '#FFFFFF', borderColor: expanded ? '#1A2FEE' : '#E5E5E5',
        boxShadow: expanded ? '0 0 0 2px rgba(26,47,238,0.12)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s' }}
    >
      {/* ── Clickable header ── */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/60"
      >
        {/* Type icon */}
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: ts.bg }}>
          {ts.icon === 'anomaly'
            ? <AlertTriangle className="size-4" style={{ color: ts.text }} />
            : <TrendingUp className="size-4" style={{ color: ts.text }} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: ts.bg, color: ts.text }}>
              {ts.label}
            </span>
            {cs && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: cs.bg, color: cs.text }}>
                <Shield className="size-2.5" /> Konfidenz {cs.label}
              </span>
            )}
            {insight.savings_eur_per_year !== null && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'rgba(5,150,105,0.08)', color: '#059669' }}>
                <Euro className="size-2.5" /> {formatEur(insight.savings_eur_per_year)}/a
              </span>
            )}
            {insight.measures.length > 0 && (
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'rgba(26,47,238,0.06)', color: '#1A2FEE' }}>
                <Wrench className="size-2.5" /> {insight.measures.length} Maßnahme{insight.measures.length > 1 ? 'n' : ''}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold leading-snug" style={{ color: '#00095B' }}>
            {insight.title}
          </h3>

          {/* Description preview */}
          {insight.description && (
            <p className={`mt-1 text-xs leading-relaxed ${expanded ? '' : 'line-clamp-2'}`} style={{ color: '#737373' }}>
              {insight.description}
            </p>
          )}

          {/* Location */}
          {locationLabel && (
            <div className="mt-1.5 flex items-center gap-1" style={{ color: '#AEAEAE' }}>
              <MapPin className="size-3 shrink-0" />
              <span className="text-[11px]">{locationLabel}</span>
            </div>
          )}
        </div>

        {/* Right: eval summary + chevron */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <ImpressionPills evals={insight.evaluations} />
          {expanded
            ? <ChevronUp className="size-4" style={{ color: '#AEAEAE' }} />
            : <ChevronDown className="size-4" style={{ color: '#AEAEAE' }} />}
        </div>
      </button>

      {/* ── Expanded content ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t px-5 py-5 flex flex-col gap-5" style={{ borderColor: '#F0F0F0' }}>

              {/* Savings row */}
              {(insight.savings_eur_per_year !== null || insight.savings_kwh_per_year !== null) && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  {insight.savings_eur_per_year !== null && (
                    <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: '#F0F0F0' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Euro className="size-3" style={{ color: '#059669' }} />
                        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#AEAEAE' }}>Einsparung/Jahr</span>
                      </div>
                      <p className="text-base font-bold font-mono" style={{ color: '#059669' }}>{formatEur(insight.savings_eur_per_year)}</p>
                    </div>
                  )}
                  {insight.savings_kwh_per_year !== null && (
                    <div className="rounded-lg border px-3 py-2.5" style={{ borderColor: '#F0F0F0' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="size-3" style={{ color: '#1A2FEE' }} />
                        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#AEAEAE' }}>Energie/Jahr</span>
                      </div>
                      <p className="text-base font-bold font-mono" style={{ color: '#1A2FEE' }}>{formatKwh(insight.savings_kwh_per_year)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Full description */}
              {insight.description && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Target className="size-3.5" style={{ color: '#1A2FEE' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1A2FEE' }}>Analyse</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#444444' }}>{insight.description}</p>
                </div>
              )}

              {/* Hypotheses */}
              {hypotheses.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Info className="size-3.5" style={{ color: '#737373' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#737373' }}>Hypothesen</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {hypotheses.map((h, i) => {
                      const hs = hypothesisTypeStyle(h.type)
                      return (
                        <div key={i} className="flex gap-2.5 rounded-lg border px-3 py-2.5" style={{ borderColor: '#F0F0F0', backgroundColor: '#FAFAFA' }}>
                          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold self-start" style={{ backgroundColor: hs.bg, color: hs.text }}>
                            {hs.label}
                          </span>
                          <p className="text-[12px] leading-relaxed" style={{ color: '#444444' }}>{h.explanation}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* JSON collapsibles */}
              {(findingDetail || timeContext || deviceAttr || meters || callTranscripts) && (
                <div className="flex flex-col gap-2">
                  <JsonCollapsible title="Finding Detail" value={findingDetail} />
                  <JsonCollapsible title="Time Context" value={timeContext} />
                  <JsonCollapsible title="Device Attribution" value={deviceAttr} />
                  <JsonCollapsible title="Meters" value={meters} />
                  <JsonCollapsible title="Call Transcripts" value={callTranscripts} />
                </div>
              )}

              {/* Linked measures */}
              {insight.measures.length > 0 && (
                <div className="border-t pt-4" style={{ borderColor: '#F0F0F0' }}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Wrench className="size-3.5" style={{ color: '#1A2FEE' }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1A2FEE' }}>
                      Verknüpfte Maßnahmen ({insight.measures.length})
                    </span>
                  </div>
                  <MeasureList measures={insight.measures} onEvaluationSubmitted={onEvaluationSubmitted} />
                </div>
              )}

              {/* Rating section */}
              <div className="border-t pt-4" style={{ borderColor: '#F0F0F0' }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <FileText className="size-3.5" style={{ color: '#1A2FEE' }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1A2FEE' }}>
                    Diesen Insight bewerten
                  </span>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}>
                  <InlineRating itemType="insight" itemId={insight.id} onSuccess={onEvaluationSubmitted} />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
