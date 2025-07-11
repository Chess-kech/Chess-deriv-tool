import TradingDashboard from "@/components/trading-dashboard"
import { ThemeProvider } from "@/components/theme-provider"
import ProtectedRoute from "@/components/protected-route"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ProtectedRoute>
        <main className="flex min-h-screen flex-col">
          <TradingDashboard />
        </main>
      </ProtectedRoute>
    </ThemeProvider>
  )
}
