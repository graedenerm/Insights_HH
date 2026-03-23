'use client'

import { useState } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MetricRating, type MetricValue } from './metric-rating'
import { submitEvaluation } from '@/actions/evaluations'
import { useEvaluator } from '@/lib/evaluator-context'
import { cn } from '@/lib/utils'

type Impression = 'positive' | 'negative' | 'neutral'

interface InlineRatingProps {
  itemType: 'insight' | 'measure'
  itemId: string
  onSuccess?: () => void
}

function toDb(v: MetricValue | null): number | null {
  return v === null || v === 'na' ? null : v
}

const impressionConfig = [
  {
    value: 'positive' as const,
    icon: ThumbsUp,
    label: 'Positive',
    selected: 'bg-emerald-500 border-emerald-500 text-white',
    hover: 'hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600',
  },
  {
    value: 'neutral' as const,
    icon: Minus,
    label: 'Neutral',
    selected: 'bg-zinc-500 border-zinc-500 text-white',
    hover: 'hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-600',
  },
  {
    value: 'negative' as const,
    icon: ThumbsDown,
    label: 'Negative',
    selected: 'bg-red-500 border-red-500 text-white',
    hover: 'hover:border-red-400 hover:bg-red-50 hover:text-red-600',
  },
]

export function InlineRating({ itemType, itemId, onSuccess }: InlineRatingProps) {
  const { evaluatorName } = useEvaluator()
  const compact = false

  const [impression, setImpression] = useState<Impression | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Core ratings
  const [comprehensibility, setComprehensibility] = useState<MetricValue | null>(null)
  const [relevance, setRelevance] = useState<MetricValue | null>(null)
  const [plausibility, setPlausibility] = useState<MetricValue | null>(null)

  // Detailed ratings
  const [ratingTitle, setRatingTitle] = useState<MetricValue | null>(null)
  const [ratingDescription, setRatingDescription] = useState<MetricValue | null>(null)
  const [ratingHypotheses, setRatingHypotheses] = useState<MetricValue | null>(null)
  const [ratingReasoning, setRatingReasoning] = useState<MetricValue | null>(null)
  const [ratingQuestions, setRatingQuestions] = useState<MetricValue | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setImpression(null)
    setShowDetails(false)
    setComprehensibility(null)
    setRelevance(null)
    setPlausibility(null)
    setRatingTitle(null)
    setRatingDescription(null)
    setRatingHypotheses(null)
    setRatingReasoning(null)
    setRatingQuestions(null)
    setError(null)
    setSuccess(false)
  }

  if (!evaluatorName) {
    return (
      <p className="text-[11px] italic text-muted-foreground">
        Tragen Sie Ihren Namen oben ein, um zu bewerten.
      </p>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <CheckCircle2 className="size-3.5 shrink-0" />
          Submitted
        </div>
        <button
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          onClick={resetForm}
        >
          <RotateCcw className="size-3" />
          Rate again
        </button>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!impression) return
    setLoading(true)
    setError(null)
    const result = await submitEvaluation({
      itemType,
      itemId,
      evaluatorName,
      impression,
      comprehensibility: toDb(comprehensibility),
      relevance: toDb(relevance),
      plausibility: toDb(plausibility),
      ratingTitle: toDb(ratingTitle),
      ratingDescription: toDb(ratingDescription),
      ratingHypotheses: itemType === 'insight' ? toDb(ratingHypotheses) : undefined,
      ratingReasoning: itemType === 'measure' ? toDb(ratingReasoning) : undefined,
      ratingQuestions: itemType === 'measure' ? toDb(ratingQuestions) : undefined,
    })
    setLoading(false)
    if (result.success) {
      setSuccess(true)
      onSuccess?.()
    } else {
      setError(result.error ?? 'Submission failed.')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Overall impression ── */}
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Overall Impression
        </p>
        <div className="flex gap-1.5">
          {impressionConfig.map(({ value, icon: Icon, label, selected, hover }) => (
            <button
              key={value}
              type="button"
              onClick={() => setImpression(value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 rounded border py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                impression === value
                  ? selected
                  : cn('border-border bg-background text-muted-foreground', hover)
              )}
            >
              <Icon className="size-3 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Optional detailed ratings ── */}
      <button
        onClick={() => setShowDetails((p) => !p)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground self-start"
      >
        {showDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        {showDetails ? 'Hide details' : 'Add detailed ratings'}
      </button>

      {showDetails && (
        <div className="flex flex-col gap-2.5 border-t pt-2.5">
          {/* Core ratings */}
          <MetricRating
            label={compact ? 'Compreh.' : 'Comprehensibility'}
            description="Do you understand the explanation?"
            value={comprehensibility}
            onChange={setComprehensibility}
            compact={compact}
          />
          <MetricRating
            label="Relevance"
            description="Is this relevant & actionable?"
            value={relevance}
            onChange={setRelevance}
            compact={compact}
          />
          <MetricRating
            label={compact ? 'Plausibil.' : 'Plausibility'}
            description="Does this sound sensible and well-reasoned?"
            value={plausibility}
            onChange={setPlausibility}
            compact={compact}
          />

          {/* Detailed sub-ratings */}
          <div className="flex flex-col gap-2 border-t pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Detailed
            </p>
            <MetricRating
              label="Title"
              description="Is the title clear and fitting?"
              value={ratingTitle}
              onChange={setRatingTitle}
              compact={compact}
            />
            <MetricRating
              label={compact ? 'Descr.' : 'Description'}
              description="Is the description clear and complete?"
              value={ratingDescription}
              onChange={setRatingDescription}
              compact={compact}
            />
            {itemType === 'insight' && (
              <MetricRating
                label="Hypotheses"
                description="Are the hypotheses plausible?"
                value={ratingHypotheses}
                onChange={setRatingHypotheses}
                compact={compact}
              />
            )}
            {itemType === 'measure' && (
              <>
                <MetricRating
                  label="Reasoning"
                  description="Is the reasoning sound?"
                  value={ratingReasoning}
                  onChange={setRatingReasoning}
                  compact={compact}
                />
                <MetricRating
                  label="Questions"
                  description="Are the questions relevant?"
                  value={ratingQuestions}
                  onChange={setRatingQuestions}
                  compact={compact}
                />
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={!impression || loading}
        className="w-full"
      >
        {loading ? 'Submitting…' : 'Submit'}
      </Button>
    </div>
  )
}
