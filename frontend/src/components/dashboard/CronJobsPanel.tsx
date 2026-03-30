import { useMemo } from 'react'
import { useAuditQuery } from '../../hooks/useAudit'
import type { AuditCronJob } from '../../types/audit'

/**
 * Format a relative time string from an ISO date string or null
 * - null/undefined → "—"
 * - past date → "5m ago", "2h ago", "3d ago"
 * - future date → "in 5m", "in 2h", "in 3d"
 */
function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '—'

  const date = new Date(isoString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSecs = Math.abs(Math.round(diffMs / 1000))

  if (diffSecs < 30) {
    return 'just now'
  }

  const mins = Math.floor(diffSecs / 60)
  if (mins < 60) {
    return diffMs > 0 ? `in ${mins}m` : `${mins}m ago`
  }

  const hours = Math.floor(diffSecs / 3600)
  if (hours < 24) {
    return diffMs > 0 ? `in ${hours}h` : `${hours}h ago`
  }

  const days = Math.floor(diffSecs / 86400)
  return diffMs > 0 ? `in ${days}d` : `${days}d ago`
}

/**
 * Get badge colors based on job status
 */
function getStatusBadgeClasses(status?: string): string {
  switch (status) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
    case 'failed':
    case 'error':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    case 'running':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

/**
 * CronJobsPanel component
 * Displays cron job status, schedule, and run times with a max of 8 jobs shown
 */
export function CronJobsPanel() {
  const { data: auditData } = useAuditQuery()

  const jobs = auditData?.cron.jobs ?? []
  const totalCount = auditData?.cron.count ?? 0

  // Slice to max 8 jobs; compute overflow count
  const displayedJobs = useMemo(() => {
    return jobs.slice(0, 8)
  }, [jobs])

  const overflowCount = Math.max(0, totalCount - 8)

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          ⏰ Cron Jobs
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          0 scheduled
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No cron jobs configured
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        ⏰ Cron Jobs
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {totalCount} scheduled
      </p>

      <ul className="space-y-3">
        {displayedJobs.map((job: AuditCronJob) => (
          <li
            key={job.name ?? `job-${jobs.indexOf(job)}`}
            className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {job.name ?? 'Unnamed Job'}
                </p>
                {job.schedule && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    {job.schedule}
                  </p>
                )}
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 whitespace-nowrap ${getStatusBadgeClasses(job.status)}`}
              >
                {job.status ?? 'unknown'}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              <p>Next: {formatRelativeTime(job.next_run)}</p>
              <p>Last: {job.last_run ? formatRelativeTime(job.last_run) : 'Never'}</p>
            </div>
          </li>
        ))}
      </ul>

      {overflowCount > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          +{overflowCount} more
        </p>
      )}
    </div>
  )
}
