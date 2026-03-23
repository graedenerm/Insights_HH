import { MeasureCard } from './measure-card'
import type { Measure, Evaluation } from '@/lib/types'

interface MeasureListProps {
  measures: (Measure & { evaluations: Evaluation[] })[]
  onEvaluationSubmitted?: () => void
}

export function MeasureList({ measures, onEvaluationSubmitted }: MeasureListProps) {
  if (measures.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No measures linked to this insight.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {measures.map((measure) => (
        <MeasureCard
          key={measure.id}
          measure={measure}
          onEvaluationSubmitted={onEvaluationSubmitted}
        />
      ))}
    </div>
  )
}
