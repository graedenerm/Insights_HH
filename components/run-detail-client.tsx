'use client'

import { useRouter } from 'next/navigation'
import { InsightList } from '@/components/insights/insight-list'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useState, useMemo } from 'react'
import type { RunDetail } from '@/lib/types'

interface RunDetailClientProps {
  run: RunDetail
}

export function RunDetailClient({ run }: RunDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('all')

  const locationMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const loc of run.locations) map.set(loc.id, loc.title)
    return map
  }, [run.locations])

  const locationIds = useMemo(() => {
    const ids = new Set<string>()
    for (const insight of run.insights) ids.add(insight.location_id)
    return Array.from(ids)
  }, [run.insights])

  const hasMultipleLocations = locationIds.length > 1

  const handleEvaluationSubmitted = () => router.refresh()

  if (run.insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center m-6" style={{ borderColor: '#E5E5E5' }}>
        <p className="text-sm font-medium" style={{ color: '#737373' }}>
          Keine Erkenntnisse für diesen Durchlauf verfügbar.
        </p>
      </div>
    )
  }

  if (!hasMultipleLocations) {
    return (
      <div className="p-6 max-w-6xl mx-auto w-full">
        <InsightList insights={run.insights} onEvaluationSubmitted={handleEvaluationSubmitted} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Alle ({run.insights.length})</TabsTrigger>
          {locationIds.map((locId) => {
            const title = locationMap.get(locId) ?? locId
            const count = run.insights.filter((i) => i.location_id === locId).length
            return (
              <TabsTrigger key={locId} value={locId}>
                {title} ({count})
              </TabsTrigger>
            )
          })}
        </TabsList>
        <TabsContent value="all">
          <InsightList insights={run.insights} onEvaluationSubmitted={handleEvaluationSubmitted} />
        </TabsContent>
        {locationIds.map((locId) => (
          <TabsContent key={locId} value={locId}>
            <InsightList
              insights={run.insights.filter((i) => i.location_id === locId)}
              onEvaluationSubmitted={handleEvaluationSubmitted}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
