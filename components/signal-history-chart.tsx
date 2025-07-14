"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"

interface Signal {
  id: string
  confidence: number
  timestamp: number
}

interface SignalHistoryChartProps {
  signals: Signal[]
}

export function SignalHistoryChart({ signals }: SignalHistoryChartProps) {
  const stats = useMemo(() => {
    if (signals.length === 0) return null

    const totalSignals = signals.length
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / totalSignals

    return {
      totalSignals,
      avgConfidence,
    }
  }, [signals])

  if (!stats) {
    return <Card className="p-4 text-sm text-muted-foreground">No signals generated yet...</Card>
  }

  return <Card className="p-4 text-sm text-muted-foreground">{stats.totalSignals} signals (history stub)</Card>
}
