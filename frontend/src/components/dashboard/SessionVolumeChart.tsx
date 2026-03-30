import { useAuditQuery } from '../../hooks/useAudit'
import { useChartTheme, CHART_COLORS } from './chartUtils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function SessionVolumeChart() {
  const { data } = useAuditQuery()
  const { gridColor, textColor } = useChartTheme()

  const sessions = data?.sessions ?? []

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Session Volume (Last 30 Days)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No sessions recorded yet.</p>
      </div>
    )
  }

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

  const chartData = Object.entries(counts).map(([date, count]) => ({ date, count }))

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Session Volume (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
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
          <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
