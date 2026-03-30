import { useAuditQuery } from '../../hooks/useAudit'

export function AuditTools() {
  const { data } = useAuditQuery()

  const tools = data?.tools ?? {}
  const entries = Object.entries(tools)

  if (entries.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">Tools</h2>
        <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl overflow-hidden p-4">
          <p className="text-gray-400 dark:text-gray-600 text-sm">Not available for this backend.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Tools</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100/50 dark:bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                Tool
              </th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, info]) => (
              <tr key={name} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-2 capitalize">{name}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        info.enabled
                          ? 'bg-emerald-500'
                          : 'bg-gray-400 dark:bg-gray-600'
                      }`}
                      title={info.enabled ? 'Enabled' : 'Disabled'}
                    />
                    <span className="text-gray-600 dark:text-gray-400 text-xs">
                      {info.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
