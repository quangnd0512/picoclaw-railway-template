import { useConfigQuery } from '../../hooks/useConfig'
import type { HermesMcpServer } from '../../types/config'

export function AuditMcpServers() {
  const { data: config } = useConfigQuery()

  const hermesMcpServers = config?.hermes?.mcp_servers || []
  const picoClawMcpServers = config?.tools?.mcp?.servers || {}

  const allServers: Array<{ name: string; type: 'command' | 'http'; value: string }> = []

  hermesMcpServers.forEach((server: HermesMcpServer) => {
    const serverType = server.url ? 'http' : 'command'
    const serverValue = server.url || server.command
    allServers.push({
      name: server.name,
      type: serverType,
      value: serverValue,
    })
  })

  Object.entries(picoClawMcpServers).forEach(([name, config]) => {
    if (typeof config === 'object' && config !== null) {
      const serverType = 'command' as const
      const serverValue = (config as { command?: string }).command || ''
      if (serverValue) {
        allServers.push({
          name,
          type: serverType,
          value: serverValue,
        })
      }
    }
  })

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
        MCP Servers ({allServers.length})
      </h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl overflow-hidden">
        {allServers.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            No MCP servers configured.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {allServers.map((server) => (
              <div
                key={server.name}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {server.name}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate mt-1">
                      {server.value}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded whitespace-nowrap">
                    {server.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
