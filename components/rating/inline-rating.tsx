'use client'

import { useState } from 'react'
import {
  ThumbsUp, ThumbsDown, Minus,
  ChevronDown, ChevronUp, CheckCircle2, RotateCcw,
} from 'lucide-react'
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
    label: 'Positiv',
    selectedBg: '#059669',
    selectedBorder: '#059669',
    hoverClass: 'hover:border-emerald-400 hover:bg-emerald-50',
    hoverText: '#059669',
  },
  {
    value: 'neutral' as const,
    icon: Minus,
    label: 'Neutral',
    selectedBg: '#52525b',
    selectedBorder: '#52525b',
    hoverClass: 'hover:border-zinc-400 hover:bg-zinc-50',
    hoverText: '#52525b',
  },
  {
    value: 'negative' as const,
    icon: ThumbsDown,
    label: 'Negativ',
    selectedBg: '#dc2626',
    selectedBorder: '#dc2626',
    hoverClass: 'hover:border-red-400 hover:bg-red-50',
    hoverText: '#dc2626',
  },
]

export function InlineRating({ itemType, itemId, onSuccess }: InlineRatingProps) {
  const { evaluatorName } = useEvaluator()

  const [impression, setImpression] = useState<Impression | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const [comprehensibility, setComprehensibility] = useState<MetricValue | null>(null)
  const [relevance, setRelevance]                 = useState<MetricValue | null>(null)
  const [plausibility, setPlausibility]           = useState<MetricValue | null>(null)
  const [ratingTitle, setRatingTitle]             = useState<MetricValue | null>(null)
  const [ratingDescription, setRatingDescription] = useState<MetricValue | null>(null)
  const [ratingHypotheses, setRatingHypotheses]   = useState<MetricValue | null>(null)
  const [ratingReasoning, setRatingReasoning]     = useState<MetricValue | null>(null)
  const [ratingQuestions, setRatingQuestions]     = useState<MetricValue | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setImpression(null); setShowDetails(false)
    setComprehensibility(null); setRelevance(null); setPlausibility(null)
    setRatingTitle(null); setRatingDescription(null); setRatingHypotheses(null)
    setRatingReasoning(null); setRatingQuestions(null)
    setError(null); setSuccess(false)
  }

  if (!evaluatorName) {
    return (
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <p className="text-xs leading-snug" style={{ color: '#AEAEAE' }}>
          Tragen Sie Ihren Namen oben ein,<br />um zu bewerten.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <CheckCircle2 className="size-10" style={{ color: '#059669' }} />
        <p className="text-sm font-semibold" style={{ color: '#059669' }}>Bewertung gespeichert!</p>
        <button
          onClick={resetForm}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
          style={{ borderColor: '#E5E5E5', color: '#737373' }}
        >
          <RotateCcw className="size-3" /> Erneut bewerten
        </button>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!impression) return
    setLoading(true); setError(null)
    const result = await submitEvaluation({
      itemType, itemId, evaluatorName, impression,
      comprehensibility: toDb(comprehensibility),
      relevance: toDb(relevance),
      plausibility: toDb(plausibility),
      ratingTitle: toDb(ratingTitle),
      ratingDescription: toDb(ratingDescription),
      ratingHypotheses: itemType === 'insight' ? toDb(ratingHypotheses) : undefined,
      ratingReasoning:  itemType === 'measure' ? toDb(ratingReasoning)  : undefined,
      ratingQuestions:  itemType === 'measure' ? toDb(ratingQuestions)  : undefined,
    })
    setLoading(false)
    if (result.success) { setSuccess(true); onSuccess?.() }
    else setError(result.error ?? 'Fehler beim Speichern.')
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Big impression buttons ── */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#AEAEAE' }}>
          Gesamteindruck
        </p>
        <div className="flex flex-col gap-2">
          {impressionConfig.map(({ value, icon: Icon, label, selectedBg, selectedBorder, hoverClass, hoverText }) => {
            const isSelected = impression === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setImpression(value)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all',
                  isSelected ? '' : cn('border-gray-200 bg-white text-gray-500', hoverClass),
                )}
                style={isSelected ? {
                  backgroundColor: selectedBg,
                  borderColor: selectedBorder,
                  color: '#ffffff',
                } : { color: hoverText }}
              >
                <Icon className="size-5 shrink-0" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Optional detailed ratings ── */}
      <button
        onClick={() => setShowDetails((p) => !p)}
        className="flex items-center gap-1.5 self-start rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
        style={{ borderColor: '#E5E5E5', color: '#737373' }}
      >
        {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        {showDetails ? 'Details ausblenden' : 'Detailbewertung hinzufügen'}
      </button>

      {showDetails && (
        <div className="flex flex-col gap-3 rounded-xl border p-3" style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}>
          <MetricRating label="Verständlichkeit" description="Ist die Erklärung klar?" value={comprehensibility} onChange={setComprehensibility} />
          <MetricRating label="Relevanz"          description="Ist es relevant & umsetzbar?" value={relevance}          onChange={setRelevance} />
          <MetricRating label="Plausibilität"     description="Klingt es schlüssig?"         value={plausibility}      onChange={setPlausibility} />

          <div className="border-t pt-3" style={{ borderColor: '#E5E5E5' }}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#AEAEAE' }}>Details</p>
            <div className="flex flex-col gap-2.5">
              <MetricRating label="Titel"       description="Ist der Titel treffend?"           value={ratingTitle}       onChange={setRatingTitle} />
              <MetricRating label="Beschreibung" description="Ist die Beschreibung vollständig?" value={ratingDescription} onChange={setRatingDescription} />
              {itemType === 'insight' && (
                <MetricRating label="Hypothesen" description="Sind die Hypothesen plausibel?" value={ratingHypotheses} onChange={setRatingHypotheses} />
              )}
              {itemType === 'measure' && (
                <>
                  <MetricRating label="Begründung" description="Ist die Begründung nachvollziehbar?" value={ratingReasoning} onChange={setRatingReasoning} />
                  <MetricRating label="Fragen"      description="Sind die Fragen relevant?"           value={ratingQuestions} onChange={setRatingQuestions} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}

      {/* ── Submit ── */}
      <button
        onClick={handleSubmit}
        disabled={!impression || loading}
        className="w-full rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-40"
        style={{
          backgroundColor: impression ? '#1A2FEE' : '#E5E5E5',
          color: impression ? '#ffffff' : '#AEAEAE',
        }}
      >
        {loading ? 'Wird gespeichert…' : 'Bewertung absenden'}
      </button>

    </div>
  )
}
