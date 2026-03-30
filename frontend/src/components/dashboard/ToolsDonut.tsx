import { useAuditQuery } from '../../hooks/useAudit'
import { useChartTheme, CHART_COLORS } from './chartUtils'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function ToolsDonut() {
  const { data } = useAuditQuery()
  const { gridColor, textColor } = useChartTheme()

  const tools = data?.tools ?? {}
  const entries = Object.entries(tools)
  const enabled = entries.filter(([, v]) => v.enabled).length
  const disabled = entries.length - enabled

  const chartData = [
    { name: 'Enabled', value: enabled },
    { name: 'Disabled', value: disabled },
  ].filter((d) => d.value > 0)

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tools Overview
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No tools configured.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tools Overview</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              paddingAngle={3}
            >
              <Cell fill={CHART_COLORS.success} />
              <Cell fill={CHART_COLORS.muted} />
            </Pie>
            <Tooltip
              formatter={(v) => [`${v} tools`, '']}
              contentStyle={{
                backgroundColor: document.documentElement.classList.contains('dark')
                  ? '#111827'
                  : '#ffffff',
                borderColor: gridColor,
                color: textColor,
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: textColor }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-500 dark:text-gray-400">{entries.length} total</span>
        </div>
      </div>
    </div>
  )
}
