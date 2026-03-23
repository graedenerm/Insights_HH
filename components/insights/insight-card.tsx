'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InlineRating } from '@/components/rating/inline-rating'
import { MeasureList } from '@/components/measures/measure-list'
import type { InsightWithMeasures } from '@/lib/types'
import { ChevronDown, ChevronUp, MapPin, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useViewMode } from '@/lib/view-mode-context'

interface InsightCardProps {
  insight: InsightWithMeasures
  onEvaluationSubmitted?: () => void
}

const typeColors: Record<string, string> = {
  baseload_structural: 'bg-blue-50 text-blue-700 border-blue-200',
  baseload_anomaly: 'bg-orange-50 text-orange-700 border-orange-200',
  daily_anomaly: 'bg-red-50 text-red-700 border-red-200',
  period_anomaly: 'bg-pink-50 text-pink-700 border-pink-200',
  baseload_trend: 'bg-purple-50 text-purple-700 border-purple-200',
}

const typeLabels: Record<string, string> = {
  baseload_structural: 'Baseload Structural',
  baseload_anomaly: 'Baseload Anomaly',
  daily_anomaly: 'Daily Anomaly',
  period_anomaly: 'Period Anomaly',
  baseload_trend: 'Baseload Trend',
}

function formatEur(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

function formatKwh(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString('de-DE') + ' kWh'
}

function impressionSummary(evals: InsightWithMeasures['evaluations']) {
  const pos = evals.filter((e) => e.impression === 'positive').length
  const neu = evals.filter((e) => e.impression === 'neutral').length
  const neg = evals.filter((e) => e.impression === 'negative').length
  const coreValues: number[] = []
  for (const e of evals) {
    if (e.comprehensibility !== null) coreValues.push(e.comprehensibility)
    if (e.relevance !== null) coreValues.push(e.relevance)
    if (e.plausibility !== null) coreValues.push(e.plausibility)
  }
  const avg =
    coreValues.length > 0 ? coreValues.reduce((a, b) => a + b, 0) / coreValues.length : null
  return { pos, neu, neg, avg, total: evals.length }
}

function ImpressionBadges({
  pos,
  neu,
  neg,
  avg,
  total,
}: {
  pos: number
  neu: number
  neg: number
  avg: number | null
  total: number
}) {
  if (total === 0) return <span className="text-xs text-muted-foreground">Not yet evaluated</span>
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <ThumbsUp className="size-3 text-emerald-600" />
        <span className="text-xs font-medium tabular-nums">{pos}</span>
      </div>
      <div className="flex items-center gap-1">
        <Minus className="size-3 text-zinc-500" />
        <span className="text-xs font-medium tabular-nums">{neu}</span>
      </div>
      <div className="flex items-center gap-1">
        <ThumbsDown className="size-3 text-red-500" />
        <span className="text-xs font-medium tabular-nums">{neg}</span>
      </div>
      {avg !== null && (
        <span className="text-xs text-muted-foreground">
          · {avg.toFixed(1)}/5
        </span>
      )}
    </div>
  )
}

/** Collapsible section for raw JSON objects / arrays */
function JsonSection({ title, value }: { title: string; value: unknown }) {
  const [open, setOpen] = useState(false)
  if (value === undefined || value === null) return null
  const isEmpty = Array.isArray(value)
    ? value.length === 0
    : typeof value === 'object' && Object.keys(value as object).length === 0
  if (isEmpty) return null
  return (
    <div className="overflow-hidden rounded border border-border text-xs">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between bg-muted/50 px-3 py-1.5 text-left font-medium hover:bg-muted"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>
      {open && (
        <pre className="max-h-48 overflow-auto bg-background px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  )
}

const hypothesisTypeStyles: Record<string, string> = {
  problem:     'bg-red-50 text-red-700 border-red-200',
  benign:      'bg-green-50 text-green-700 border-green-200',
  opportunity: 'bg-blue-50 text-blue-700 border-blue-200',
}

function HypothesesSection({ items }: { items: unknown[] }) {
  if (!items || items.length === 0) return null
  const typed = items.filter(
    (h): h is { type: string; explanation: string } =>
      typeof h === 'object' && h !== null && 'type' in h && 'explanation' in h
  )
  if (typed.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Hypotheses
      </p>
      <div className="flex flex-col gap-2">
        {typed.map((h, i) => {
          const styleKey = h.type.toLowerCase()
          const badgeClass =
            hypothesisTypeStyles[styleKey] ?? 'bg-zinc-50 text-zinc-600 border-zinc-200'
          return (
            <div
              key={i}
              className="flex gap-2.5 rounded-md border border-border bg-muted/20 p-2.5"
            >
              <span
                className={cn(
                  'inline-flex shrink-0 self-start items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  badgeClass
                )}
              >
                {h.type}
              </span>
              <p className="text-xs leading-relaxed text-foreground/80">
                {h.explanation}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function InsightCard({ insight, onEvaluationSubmitted }: InsightCardProps) {
  const { viewMode } = useViewMode()
  const [expanded, setExpanded] = useState(false)

  const { pos, neu, neg, avg, total } = impressionSummary(insight.evaluations)
  const typeLabel = typeLabels[insight.type] ?? insight.type
  const typeColor =
    typeColors[insight.type] ?? 'bg-zinc-50 text-zinc-700 border-zinc-200'

  const locationLabel = insight.location
    ? [
        insight.location.title,
        insight.location.street_name,
        insight.location.street_number,
      ]
        .filter(Boolean)
        .join(', ')
    : null

  // Raw JSON fields
  const raw = insight.raw_json as Record<string, unknown>
  const timeContext = raw?.timeContext
  const findingDetail = raw?.findingDetail
  const hypotheses = Array.isArray(raw?.hypotheses) ? (raw.hypotheses as unknown[]) : null
  const deviceAttribution = raw?.deviceAttribution
  const context = raw?.context as Record<string, unknown> | undefined
  const meters = Array.isArray(context?.meters) ? context.meters as unknown[] : null
  const callTranscripts = Array.isArray(context?.callTranscripts)
    ? context.callTranscripts as unknown[]
    : null

  return (
    <Card className="overflow-hidden">
      {/* Two-column layout: content left | rating right */}
      <div className="flex min-h-0">
        {/* ── Left: insight content ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <CardHeader className="border-b">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
                  typeColor
                )}
              >
                {typeLabel}
              </span>
              {insight.priority_score !== null && (
                <Badge variant="secondary" className="text-xs">
                  Priority: {(insight.priority_score * 100).toFixed(0)}%
                </Badge>
              )}
              {insight.confidence !== null && (
                <Badge variant="outline" className="text-xs">
                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                </Badge>
              )}
              {insight.original_id && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  {insight.original_id}
                </span>
              )}
            </div>

            {/* Title */}
            <CardTitle className={cn('leading-snug', viewMode === 'compact' ? 'text-sm' : 'text-base')}>
              {insight.title}
            </CardTitle>

            {/* Location */}
            {locationLabel && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                {locationLabel}
              </div>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {/* ── Compact: evaluation summary only ── */}
            {viewMode === 'compact' && (
              <div className="flex items-center gap-3 py-1">
                <ImpressionBadges pos={pos} neu={neu} neg={neg} avg={avg} total={total} />
              </div>
            )}

            {/* ── Detailed: all fields ── */}
            {viewMode === 'detailed' && (
              <>
                {/* Savings metrics */}
                {(insight.savings_eur_per_year !== null || insight.savings_kwh_per_year !== null) && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    {insight.savings_eur_per_year !== null && (
                      <div>
                        <span className="text-xs text-muted-foreground">Savings EUR/yr</span>
                        <p className="font-semibold text-emerald-700">
                          {formatEur(insight.savings_eur_per_year)}
                        </p>
                      </div>
                    )}
                    {insight.savings_kwh_per_year !== null && (
                      <div>
                        <span className="text-xs text-muted-foreground">Savings kWh/yr</span>
                        <p className="font-semibold">{formatKwh(insight.savings_kwh_per_year)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {insight.description && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Description
                    </p>
                    <CardDescription className="text-sm text-foreground/80 whitespace-pre-wrap">
                      {insight.description}
                    </CardDescription>
                  </div>
                )}

                {/* Hypotheses */}
                {hypotheses && <HypothesesSection items={hypotheses} />}

                {/* Finding detail, time context, device attribution, meters, call transcripts */}
                <div className="flex flex-col gap-2">
                  <JsonSection title="Finding Detail" value={findingDetail} />
                  <JsonSection title="Time Context" value={timeContext} />
                  <JsonSection title="Device Attribution" value={deviceAttribution} />
                  <JsonSection title="Meters" value={meters} />
                  <JsonSection title="Call Transcripts" value={callTranscripts} />
                </div>

                {/* Evaluation summary */}
                <div className="flex items-center gap-3 border-t pt-2">
                  <ImpressionBadges pos={pos} neu={neu} neg={neg} avg={avg} total={total} />
                  {total > 0 && (
                    <span className="text-xs text-muted-foreground">
                      · {total} eval{total !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Measures toggle */}
            {insight.measures.length > 0 && (
              <div className="border-t pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded((p) => !p)}
                  className="gap-1 -ml-1"
                >
                  {expanded ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                  {insight.measures.length} Measure{insight.measures.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </CardContent>
        </div>

        {/* ── Right: rating panel ── */}
        <div className="w-72 shrink-0 border-l bg-muted/20">
          <div className="flex flex-col gap-3 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rate Insight
              </p>
            </div>
            <InlineRating
              itemType="insight"
              itemId={insight.id}
              onSuccess={onEvaluationSubmitted}
            />
          </div>
        </div>
      </div>

      {/* ── Measures — full-width below ── */}
      {expanded && insight.measures.length > 0 && (
        <div className="border-t bg-muted/10 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Linked Measures
          </p>
          <MeasureList
            measures={insight.measures}
            onEvaluationSubmitted={onEvaluationSubmitted}
          />
        </div>
      )}
    </Card>
  )
}
