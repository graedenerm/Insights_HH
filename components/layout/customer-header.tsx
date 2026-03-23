'use client'

import { Zap, User } from 'lucide-react'
import { useEvaluator } from '@/lib/evaluator-context'

export function CustomerHeader() {
  const { evaluatorName, setEvaluatorName } = useEvaluator()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-blue-500">
            <Zap className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">
              Heinrich Huhn Deutschland GmbH
            </p>
            <p className="text-xs text-muted-foreground">Energie-Analyse · Bewertungsportal</p>
          </div>
        </div>

        {/* Evaluator name input */}
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          <div className="flex flex-col items-end gap-0.5">
            <input
              type="text"
              placeholder="Ihr Name zum Bewerten…"
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              className="w-48 rounded-md border border-input bg-background px-2.5 py-1 text-sm text-foreground placeholder-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {evaluatorName && (
              <p className="text-[11px] text-emerald-600">
                Bewertet als: <span className="font-medium">{evaluatorName}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
