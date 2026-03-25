import { useEffect, useRef } from 'react'
import { useLogsQuery } from '../../hooks/useLogs'

export function LogViewer() {
  const { data, isLoading } = useLogsQuery()
  const logViewerRef = useRef<HTMLDivElement>(null)

  const logs = Array.isArray(data) ? data : []

  useEffect(() => {
    const el = logViewerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recent Logs</h2>
        <span className="text-xs text-gray-500">
          {logs.length} lines
        </span>
      </div>
      <div
        className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 log-viewer h-96 overflow-y-auto font-mono"
        ref={logViewerRef}
      >
        {logs.map((line: string, i: number) => (
           <div
            key={`log-${i}`}
            className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all"
           >
            {line}
           </div>
        ))}
        {logs.length === 0 && !isLoading && (
          <div className="text-gray-400 dark:text-gray-600 text-sm">
            No logs yet
          </div>
        )}
      </div>
    </section>
  )
}
