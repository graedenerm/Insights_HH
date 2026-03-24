import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { EvaluatorProvider } from '@/lib/evaluator-context'
import { PasswordGate } from '@/components/password-gate'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Heinrich Huhn – Energie-Bewertung',
  description: 'Energie-Insights & Maßnahmen bewerten – Heinrich Huhn Deutschland GmbH',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="antialiased">
        <PasswordGate>
          <EvaluatorProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </EvaluatorProvider>
        </PasswordGate>
      </body>
    </html>
  )
}
