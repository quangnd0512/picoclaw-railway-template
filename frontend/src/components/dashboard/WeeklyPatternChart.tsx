import { useMemo } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useAuditQuery } from '../../hooks/useAudit'
import { CHART_COLORS, useChartTheme } from './chartUtils'

export function WeeklyPatternChart() {
  const { data } = useAuditQuery()
  const { gridColor, textColor } = useChartTheme()

  const chartData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]
    
    if (data?.sessions) {
      data.sessions.forEach(s => {
        const day = new Date(s.date * 1000).getDay()
        counts[day]++
      })
    }

    return [
      { day: 'Mon', sessions: counts[1] },
      { day: 'Tue', sessions: counts[2] },
      { day: 'Wed', sessions: counts[3] },
      { day: 'Thu', sessions: counts[4] },
      { day: 'Fri', sessions: counts[5] },
      { day: 'Sat', sessions: counts[6] },
      { day: 'Sun', sessions: counts[0] },
    ]
  }, [data?.sessions])

  const hasData = chartData.some(d => d.sessions > 0)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Session Activity by Day
      </h3>
      
      <div style={{ height: 220 }}>
        {!data ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : !hasData ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No session data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis 
                dataKey="day" 
                tick={{ fill: textColor, fontSize: 11 }} 
              />
              <PolarRadiusAxis 
                tick={{ fill: textColor, fontSize: 9 }} 
                axisLine={false} 
              />
              <Radar
                dataKey="sessions"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.25}
              />
              <Tooltip 
                formatter={(v: number) => [`${v} sessions`, 'Count']}
                contentStyle={{
                  backgroundColor: isDark() ? '#1f2937' : '#ffffff',
                  borderColor: isDark() ? '#374151' : '#e5e7eb',
                  color: isDark() ? '#f9fafb' : '#111827',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}
