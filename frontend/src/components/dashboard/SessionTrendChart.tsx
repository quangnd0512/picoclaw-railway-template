import { useMemo } from 'react'
import { useAuditQuery } from '../../hooks/useAudit'
import { useChartTheme, CHART_COLORS } from './chartUtils'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts'

export function SessionTrendChart() {
  const { data } = useAuditQuery()
  const { gridColor, textColor } = useChartTheme()

  const sessions = data?.sessions ?? []

  const chartData = useMemo(() => {
    const today = Date.now()
    const thirtyDaysAgo = today - 30 * 24 * 60 * 60 * 1000

    const counts: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today - i * 86400000)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      counts[label] = 0
    }

    const filtered = sessions.filter((s) => s.date * 1000 >= thirtyDaysAgo)
    filtered.forEach((s) => {
      const label = new Date(s.date * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      if (counts[label] !== undefined) {
        counts[label]++
      }
    })

    const dataObj = Object.entries(counts).map(([date, count]) => ({ date, count }))
    return dataObj.map((item, i) => {
      let sum = 0
      const startIdx = Math.max(0, i - 6)
      const windowSize = Math.min(7, i + 1)
      for (let j = startIdx; j <= i; j++) {
        sum += dataObj[j].count
      }
      return {
        ...item,
        avg: sum / windowSize
      }
    })
  }, [sessions])

  const overallAvg = useMemo(() => {
    if (chartData.length === 0) return 0
    const sum = chartData.reduce((acc, curr) => acc + curr.count, 0)
    return sum / chartData.length
  }, [chartData])

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Session Trend (Last 30 Days)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No sessions recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Session Trend (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 10 }}
            tickLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: document.documentElement.classList.contains('dark')
                ? '#111827'
                : '#ffffff',
              borderColor: gridColor,
            }}
            labelStyle={{ color: textColor }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
          <Area
            type="monotone"
            dataKey="count"
            name="Sessions"
            fill={CHART_COLORS.primary}
            fillOpacity={0.15}
            stroke={CHART_COLORS.primary}
          />
          <Line
            type="monotone"
            dataKey="avg"
            name="7-day avg"
            stroke={CHART_COLORS.warning}
            strokeDasharray="4 4"
            dot={false}
            strokeWidth={2}
          />
          <ReferenceLine
            y={overallAvg}
            stroke={CHART_COLORS.muted}
            strokeDasharray="3 3"
            label={{ value: 'avg', position: 'right', fill: textColor, fontSize: 10 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
