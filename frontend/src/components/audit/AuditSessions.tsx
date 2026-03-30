import { useAuditQuery } from '../../hooks/useAudit';

export function AuditSessions() {
  const { data } = useAuditQuery();

  const sessions = data?.sessions || [];

  if (!sessions || sessions.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">Sessions</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">No sessions found.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">
        Sessions
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({sessions.length})</span>
      </h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="text-sm py-2 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 first:pt-0"
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                  {session.id.length > 20 ? `${session.id.substring(0, 20)}...` : session.id}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(session.date * 1000).toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {session.message_count} messages
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
