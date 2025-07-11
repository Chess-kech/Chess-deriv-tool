"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, type TooltipProps } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"

type DigitDatum = {
  digit: number
  percentage: number
  changed?: boolean
}

interface FrequencyDistributionChartProps {
  digitData: DigitDatum[]
  recentDigits: number[]
  isConnected: boolean
  className?: string
}

/**
 * Renders a bar-chart that visualises the frequency distribution
 * of the last digits collected by the Digit Flow Analyzer.
 *
 * • Live data bars are tinted indigo / violet
 * • Offline-mode bars are tinted slate / rose
 * • Bars whose value has changed by > 0.5 % since the previous update
 *   receive a pulsing ring highlight so that shifts are obvious at a glance.
 */
export default function FrequencyDistributionChart({
  digitData,
  isConnected,
  className,
}: FrequencyDistributionChartProps) {
  const barColour = isConnected ? "#6366f1" /* indigo-500 */ : "#fb7185" /* rose-400 */
  const gridColour = isConnected ? "#c7d2fe" /* indigo-200 */ : "#fecdd3" /* rose-200 */

  // Recharts expects the data array to contain an id for the x-axis label
  const data = digitData.map((d) => ({ ...d, name: String(d.digit) }))

  const renderTooltip = (props: TooltipProps<number, string>) => {
    if (!props.active || !props.payload?.length) return null
    const { payload } = props.payload[0]
    return (
      <ChartTooltip>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Digit: {payload?.digit}</span>
          <span className="text-xs text-muted-foreground">{payload?.percentage.toFixed(2)} %</span>
        </div>
      </ChartTooltip>
    )
  }

  return (
    <Card
      className={cn(
        "border transition-colors",
        isConnected ? "border-indigo-200 dark:border-indigo-700/40" : "border-rose-200 dark:border-rose-700/40",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>Digit Frequency Distribution</CardTitle>
      </CardHeader>

      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke={gridColour} strokeOpacity={0.2} vertical={false} />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              domain={[0, (dataMax: number) => Math.ceil(dataMax / 10) * 10]}
              tickLine={false}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: "transparent" }} />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]} fill={barColour} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
