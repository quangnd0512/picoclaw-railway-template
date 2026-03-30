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
  Cell,
} from 'recharts'

export function MessagesPerSessionChart() {
  const { data } = useAuditQuery()
  const { gridColor, textColor } = useChartTheme()

  const sessions = data?.sessions ?? []

  const top10 = [...sessions]
    .filter((s) => s.message_count > 0)
    .sort((a, b) => b.message_count - a.message_count)
    .slice(0, 10)
    .map((s) => ({
      id: s.id.length > 12 ? s.id.substring(0, 12) + '…' : s.id,
      messages: s.message_count,
    }))

  if (top10.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Top Sessions by Message Count
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No sessions with messages found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Top Sessions by Message Count
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart layout="vertical" data={top10}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
          <XAxis type="number" tick={{ fill: textColor, fontSize: 10 }} tickLine={false} />
          <YAxis
            type="category"
            dataKey="id"
            width={90}
            tick={{ fill: textColor, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
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
          <Bar dataKey="messages" radius={[0, 4, 4, 0]}>
            {top10.map((entry) => (
              <Cell key={entry.id} fill={CHART_COLORS.success} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
