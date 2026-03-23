'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InlineRating } from '@/components/rating/inline-rating'
import type { Measure, Evaluation } from '@/lib/types'
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useViewMode } from '@/lib/view-mode-context'

interface MeasureCardProps {
  measure: Measure & { evaluations: Evaluation[] }
  onEvaluationSubmitted?: () => void
}

function formatEur(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

function formatKwh(value: number | null): string {
  if (value === null) return '—'
  return value.toLocaleString('de-DE') + ' kWh'
}

const effortColors: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
}

const investmentColors: Record<string, string> = {
  LOW_INTENSITY: 'bg-blue-50 text-blue-700 border-blue-200',
  MEDIUM_INTENSITY: 'bg-purple-50 text-purple-700 border-purple-200',
  HIGH_INTENSITY: 'bg-orange-50 text-orange-700 border-orange-200',
}

function impressionSummary(evals: Evaluation[]) {
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
  if (total === 0) return <span className="text-xs text-muted-foreground">No evaluations yet</span>
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
        <span className="text-xs text-muted-foreground">· {avg.toFixed(1)}/5</span>
      )}
    </div>
  )
}

/** Collapsible raw-JSON section */
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

function QuestionsSection({ items }: { items: unknown[] }) {
  if (!items || items.length === 0) return null
  const typed = items.filter(
    (q): q is { question: string; suggestedAnswers?: { answer: string }[] } =>
      typeof q === 'object' && q !== null && 'question' in q
  )
  if (typed.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Questions
      </p>
      <div className="flex flex-col gap-3">
        {typed.map((q, i) => (
          <div key={i} className="flex flex-col gap-1.5 rounded-md border border-border bg-muted/20 p-2.5">
            <p className="text-xs font-medium text-foreground leading-snug">
              {q.question}
            </p>
            {q.suggestedAnswers && q.suggestedAnswers.length > 0 && (
              <ul className="flex flex-col gap-1 pl-1">
                {q.suggestedAnswers.map((a, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <span className="mt-[5px] size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    {a.answer}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MeasureCard({ measure, onEvaluationSubmitted }: MeasureCardProps) {
  const { viewMode } = useViewMode()
  const { pos, neu, neg, avg, total } = impressionSummary(measure.evaluations)

  // Raw JSON fields
  const raw = measure.raw_json as Record<string, unknown>
  const reasoning = typeof raw?.reasoning === 'string' ? raw.reasoning : null
  const questions = Array.isArray(raw?.questions) ? raw.questions as unknown[] : null
  const evidences = Array.isArray(raw?.evidences)
    ? (raw.evidences as unknown[]).filter((e): e is string => typeof e === 'string')
    : null

  return (
    <Card size="sm" className="overflow-hidden border-l-4 border-l-purple-300">
      {/* Two-column layout */}
      <div className="flex min-h-0">
        {/* ── Left: measure content ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <CardHeader>
            {/* Title */}
            <CardTitle className="text-sm leading-snug">{measure.title}</CardTitle>

            {/* Short description always shown */}
            {measure.short_description && (
              <p className={cn('text-xs text-muted-foreground', viewMode === 'compact' && 'line-clamp-2')}>
                {measure.short_description}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {measure.effort_level && (
                <span
                  className={cn(
                    'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium',
                    effortColors[measure.effort_level] ??
                      'bg-zinc-50 text-zinc-600 border-zinc-200'
                  )}
                >
                  {measure.effort_level.replace('_', ' ')} effort
                </span>
              )}
              {measure.investment_type && (
                <span
                  className={cn(
                    'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium',
                    investmentColors[measure.investment_type] ??
                      'bg-zinc-50 text-zinc-600 border-zinc-200'
                  )}
                >
                  {measure.investment_type.replace('_', ' ')}
                </span>
              )}
              {measure.category && (
                <Badge variant="outline" className="text-[10px]">
                  {measure.category}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {/* ── Compact: only eval summary ── */}
            {viewMode === 'compact' && (
              <div className="flex items-center gap-2">
                <ImpressionBadges pos={pos} neu={neu} neg={neg} avg={avg} total={total} />
              </div>
            )}

            {/* ── Detailed: all fields ── */}
            {viewMode === 'detailed' && (
              <>
                {/* Financial metrics grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {(measure.yearly_savings_eur_from !== null || measure.yearly_savings_eur_to !== null) && (
                    <div>
                      <span className="text-muted-foreground">Savings EUR/yr</span>
                      <p className="font-medium text-emerald-700">
                        {formatEur(measure.yearly_savings_eur_from)} – {formatEur(measure.yearly_savings_eur_to)}
                      </p>
                    </div>
                  )}
                  {(measure.yearly_savings_kwh_from !== null || measure.yearly_savings_kwh_to !== null) && (
                    <div>
                      <span className="text-muted-foreground">Savings kWh/yr</span>
                      <p className="font-medium">
                        {formatKwh(measure.yearly_savings_kwh_from)} – {formatKwh(measure.yearly_savings_kwh_to)}
                      </p>
                    </div>
                  )}
                  {(measure.investment_from !== null || measure.investment_to !== null) && (
                    <div>
                      <span className="text-muted-foreground">Investment</span>
                      <p className="font-medium">
                        {formatEur(measure.investment_from)} – {formatEur(measure.investment_to)}
                      </p>
                    </div>
                  )}
                  {measure.amortisation_months !== null && (
                    <div>
                      <span className="text-muted-foreground">Payback</span>
                      <p className="font-medium">{measure.amortisation_months} months</p>
                    </div>
                  )}
                  {measure.confidence !== null && (
                    <div>
                      <span className="text-muted-foreground">Confidence</span>
                      <p className="font-medium">{measure.confidence.toFixed(0)}%</p>
                    </div>
                  )}
                </div>

                {/* Full description */}
                {measure.description && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {measure.description}
                    </p>
                  </div>
                )}

                {/* Reasoning */}
                {reasoning && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Reasoning
                    </p>
                    <p className="text-xs text-foreground/80 whitespace-pre-wrap leading-relaxed">
                      {reasoning}
                    </p>
                  </div>
                )}

                {/* Evidences */}
                {evidences && evidences.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Evidence
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {evidences.map((e, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions */}
                {questions && <QuestionsSection items={questions} />}

                {/* Original insight ID */}
                {measure.original_insight_id && (
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Insight: {measure.original_insight_id}
                  </p>
                )}

                {/* Eval summary */}
                <div className="flex items-center gap-2 border-t pt-2">
                  <ImpressionBadges pos={pos} neu={neu} neg={neg} avg={avg} total={total} />
                  {total > 0 && (
                    <span className="text-xs text-muted-foreground">
                      · {total} eval{total !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </div>

        {/* ── Right: rating panel ── */}
        <div className="w-64 shrink-0 border-l bg-muted/20">
          <div className="flex flex-col gap-3 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Rate Measure
            </p>
            <InlineRating
              itemType="measure"
              itemId={measure.id}
              onSuccess={onEvaluationSubmitted}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
