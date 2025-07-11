"use client"
import { ThemeProvider } from "@/components/theme-provider"
import ProtectedRoute from "@/components/protected-route"
import { DigitFlowAnalyzer } from "@/components/digit-flow-analyzer"

export default function AnalyzerPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ProtectedRoute>
        <main className="flex min-h-screen flex-col items-center justify-between">
          <DigitFlowAnalyzer />
        </main>
      </ProtectedRoute>
    </ThemeProvider>
  )
}
