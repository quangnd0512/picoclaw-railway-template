import { useMemo } from 'react'
import { useAuditQuery } from '../../hooks/useAudit'
import { HEATMAP_COLORS } from './chartUtils'

export function ActivityCalendar() {
  const { data } = useAuditQuery()
  const sessions = data?.sessions ?? []

  const { days, months, hasData } = useMemo(() => {
    const counts: Record<string, number> = {}
    let hasData = false
    sessions.forEach((s) => {
      const dateStr = new Date(s.date * 1000).toDateString()
      counts[dateStr] = (counts[dateStr] || 0) + 1
      hasData = true
    })

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    const days = []
    const months: { label: string; colIndex: number }[] = []
    let lastMonth = -1

    for (let i = 90; i >= 0; i--) {
      const d = new Date(todayDate.getTime() - i * 86400000)
      const dateStr = d.toDateString()
      const count = counts[dateStr] || 0

      days.push({
        date: d,
        formattedDate: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        count,
      })

      if (days.length % 7 === 1) {
        const currentMonth = d.getMonth()
        if (currentMonth !== lastMonth) {
          months.push({
            label: d.toLocaleDateString('en-US', { month: 'short' }),
            colIndex: Math.floor((days.length - 1) / 7),
          })
          lastMonth = currentMonth
        }
      }
    }

    return { days, months, hasData }
  }, [sessions])

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">No session data to display yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm overflow-x-auto">
      <div className="min-w-[520px]">
        {/* Months */}
        <div className="relative h-4 ml-[14px] text-[10px] text-gray-400 dark:text-gray-500 mb-1">
          {months.map((m, i) => (
            <span key={i} style={{ position: 'absolute', left: m.colIndex * 13 }}>
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col text-[9px] text-gray-400 dark:text-gray-500 w-[14px] pr-2 gap-[3px]">
            <div style={{ height: '10px', lineHeight: '10px' }}>S</div>
            <div style={{ height: '10px', lineHeight: '10px' }}>M</div>
            <div style={{ height: '10px', lineHeight: '10px' }}>T</div>
            <div style={{ height: '10px', lineHeight: '10px' }}>W</div>
            <div style={{ height: '10px', lineHeight: '10px' }}>T</div>
            <div style={{ height: '10px', lineHeight: '10px' }}>F</div>
            <div style={{ height: '10px', lineHeight: '10px' }}>S</div>
          </div>

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(7, 10px)',
              gridAutoFlow: 'column',
              gap: '3px',
            }}
          >
            {days.map((day, i) => {
              const intensity = Math.min(4, day.count)
              return (
                <div
                  key={i}
                  title={`${day.formattedDate}: ${day.count} sessions`}
                  className={`w-[10px] h-[10px] rounded-[2px] ${
                    intensity === 0 ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                  style={intensity > 0 ? { backgroundColor: HEATMAP_COLORS[intensity] } : {}}
                />
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-4 text-[10px] text-gray-500 dark:text-gray-400 gap-[3px]">
          <span className="mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className={`w-[10px] h-[10px] rounded-[2px] ${
                intensity === 0 ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              style={intensity > 0 ? { backgroundColor: HEATMAP_COLORS[intensity] } : {}}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </div>
  )
}
