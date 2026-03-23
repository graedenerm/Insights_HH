import { getRunDetail } from '@/actions/runs'
import { CustomerHeader } from '@/components/layout/customer-header'
import { RunDetailClient } from '@/components/run-detail-client'

// Hardcoded Huhn run — uploaded 2026-03-23
const HUHN_RUN_ID = 'd7981f4a-3c0a-4b5a-a58b-7e833803bd4d'

export default async function Page() {
  const run = await getRunDetail(HUHN_RUN_ID)

  if (!run) {
    return (
      <div className="flex min-h-screen flex-col">
        <CustomerHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Daten konnten nicht geladen werden. Bitte Seite neu laden.
          </p>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(run.run_date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const measureCount = run.insights.reduce((acc, i) => acc + i.measures.length, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CustomerHeader />

      {/* Run info bar */}
      <div className="border-b border-border bg-muted/40 px-6 py-3">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-base font-semibold text-foreground">
            Analyse-Ergebnisse – {formattedDate}
          </h1>
          <p className="text-sm text-muted-foreground">
            {run.insights.length} Erkenntnisse · {measureCount} Maßnahmen
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <RunDetailClient run={run} />
      </main>
    </div>
  )
}
