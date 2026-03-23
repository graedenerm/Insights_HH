import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Sidebar } from '@/components/layout/sidebar'
import { getCompanies } from '@/actions/runs'
import { EvaluatorProvider } from '@/lib/evaluator-context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Heinrich Huhn – Energie-Bewertung',
  description: 'Energie-Insights & Maßnahmen bewerten – Heinrich Huhn Deutschland GmbH',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const companies = await getCompanies().catch(() => [])

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <EvaluatorProvider>
          <TooltipProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Fixed sidebar */}
              <Sidebar companies={companies} />

              {/* Main content area */}
              <main className="ml-60 flex flex-1 flex-col overflow-y-auto bg-background">
                {children}
              </main>
            </div>
          </TooltipProvider>
        </EvaluatorProvider>
      </body>
    </html>
  )
}
