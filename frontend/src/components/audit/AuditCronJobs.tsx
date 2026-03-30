import { useAuditQuery } from '../../hooks/useAudit';

export function AuditCronJobs() {
  const { data } = useAuditQuery();

  const jobs = data?.cron?.jobs ?? [];

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">
        Cron Jobs
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({jobs.length})</span>
      </h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        {jobs.map((job, i) => (
          <div
            key={job.name ?? i}
            className="text-sm py-2 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 first:pt-0"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{job.name}</span>
              <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs">
                {job.status}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Schedule: {job.schedule}</span>
              <div className="flex gap-4">
                <span>Last: {job.last_run}</span>
                <span>Next: {job.next_run}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
