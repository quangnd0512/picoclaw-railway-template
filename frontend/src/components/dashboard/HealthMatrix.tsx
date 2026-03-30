import { useStatusQuery } from '../../hooks/useStatus'

type HealthItem = {
  name: string
  type: 'channel' | 'provider'
  enabled: boolean
  configured: boolean
  error?: string
}

function getDotColor(item: HealthItem): string {
  if (item.error) return 'bg-red-500'
  if (item.enabled && item.configured) return 'bg-emerald-500'
  if (item.enabled && !item.configured) return 'bg-amber-500'
  return 'bg-gray-300 dark:bg-gray-600'
}

export function HealthMatrix() {
  const { data: status } = useStatusQuery()

  const channels = status?.channels ?? {}
  const providers = status?.providers ?? {}

  const items: HealthItem[] = [
    ...Object.entries(channels).map(([name, v]) => ({
      name,
      type: 'channel' as const,
      ...v,
    })),
    ...Object.entries(providers).map(([name, v]) => ({
      name,
      type: 'provider' as const,
      ...v,
    })),
  ]

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Provider &amp; Channel Health
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No channels or providers configured.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Provider &amp; Channel Health
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          {items.filter(i => i.enabled && i.configured).length} healthy
        </span>
        {' '} · {' '}
        <span className="text-red-600 dark:text-red-400 font-medium">
          {items.filter(i => i.error).length} error
        </span>
        {' '} · {' '}
        <span className="text-gray-500">
          {items.length} total
        </span>
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getDotColor(item)}`}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
              {item.name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto capitalize">
              {item.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
