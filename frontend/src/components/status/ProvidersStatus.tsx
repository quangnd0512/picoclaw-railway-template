import { useStatusQuery } from '../../hooks/useStatus'

export function ProvidersStatus() {
  const { data: status } = useStatusQuery()

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Providers</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100/50 dark:bg-gray-800/50">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">
                Provider
              </th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(status?.providers || {}).map(([name, info]) => {
              let badgeClass = ''
              let badgeText = ''

              if (info.error) {
                badgeClass = 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                badgeText = 'Error'
              } else if (info.configured) {
                badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                badgeText = 'Configured'
              } else {
                badgeClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                badgeText = 'Not configured'
              }

              return (
                <tr key={name} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-4 py-2 capitalize">{name}</td>
                  <td className="px-4 py-2">
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full ${badgeClass}`}
                      title={info.error || undefined}
                    >
                      {badgeText}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
