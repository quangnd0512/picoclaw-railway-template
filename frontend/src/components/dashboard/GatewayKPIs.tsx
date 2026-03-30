import { useStatusQuery } from '../../hooks/useStatus'

export function GatewayKPIs() {
  const { data: status } = useStatusQuery()

  const uptime_seconds = status?.uptime_seconds
  const gateway = status?.gateway

  const uptimeHours = uptime_seconds ? Math.floor(uptime_seconds / 3600) : null
  const uptimeMins = uptime_seconds ? Math.floor((uptime_seconds % 3600) / 60) : null
  const uptimeLabel =
    uptimeHours !== null
      ? uptimeHours > 0
        ? `${uptimeHours}h ${uptimeMins}m`
        : `${uptimeMins}m`
      : '—'

  const stateColor: Record<string, string> = {
    running: 'text-emerald-600 dark:text-emerald-400',
    starting: 'text-amber-600 dark:text-amber-400',
    stopped: 'text-gray-500 dark:text-gray-400',
    error: 'text-red-600 dark:text-red-400',
  }

  const stateLabel = gateway?.state ?? 'unknown'
  const restartCount = gateway?.restart_count ?? 0

  return (
    <div className="flex flex-wrap gap-3">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex-1 min-w-[120px]">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Gateway State
        </p>
        <p className={`mt-1 text-2xl font-semibold ${stateColor[stateLabel] ?? ''}`}>
          {stateLabel}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex-1 min-w-[120px]">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Uptime</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {uptimeLabel}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex-1 min-w-[120px]">
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Restarts
        </p>
        <p
          className={`mt-1 text-2xl font-semibold ${
            restartCount > 0
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {restartCount}
        </p>
      </div>
    </div>
  )
}
