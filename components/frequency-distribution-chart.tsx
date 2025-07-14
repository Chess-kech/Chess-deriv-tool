"use client"
import { Card } from "@/components/ui/card"

interface DigitDatum {
  digit: number
  percentage: number
}

export interface FrequencyDistributionChartProps {
  digitData: DigitDatum[]
  recentDigits: number[]
  isConnected: boolean
  className?: string
}

export default function FrequencyDistributionChart({ digitData, className }: FrequencyDistributionChartProps) {
  return (
    <Card className={className ?? ""}>
      <div className="p-4 text-sm font-medium">Frequency Distribution (stub)</div>
      <div className="grid grid-cols-10 gap-2 p-4">
        {digitData.map((d) => (
          <div key={d.digit} className="flex flex-col items-center">
            <div className="h-24 w-4 bg-primary/10 relative">
              <div className="absolute bottom-0 left-0 w-full bg-primary" style={{ height: `${d.percentage}%` }} />
            </div>
            <span className="mt-1 text-xs">{d.digit}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
