import { GatewayStatus } from './status/GatewayStatus'
import { ProvidersStatus } from './status/ProvidersStatus'
import { ChannelsStatus } from './status/ChannelsStatus'
import { PairingOps } from './status/PairingOps'
import { LogViewer } from './status/LogViewer'
import { useBackendQuery } from '../hooks/useBackend'
import { useStatusQuery } from '../hooks/useStatus'

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${accent}`} aria-hidden="true" />
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  )
}

export function StatusTab() {
  const { data: backendData } = useBackendQuery()
  const { data: statusData } = useStatusQuery()

  const backend = backendData?.backend
  const providersCount = Object.keys(statusData?.providers ?? {}).length
  const channelsCount = Object.keys(statusData?.channels ?? {}).length
  const gatewayState = statusData?.gateway?.state ?? 'unknown'
  const hasGatewayIssues = gatewayState === 'error' ? 1 : 0
  const backendIsHermes = backend === 'hermes' ? 1 : 0

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-emerald-50 via-white to-cyan-50 dark:from-emerald-950/30 dark:via-gray-900 dark:to-cyan-950/30 border border-emerald-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">System Status</p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              Live Health Overview
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Monitor gateway state, provider and channel readiness, pairing operations, and live logs.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-medium bg-white/70 border border-emerald-200 text-emerald-700 dark:bg-gray-900/70 dark:border-gray-700 dark:text-emerald-300">
            <span
              className={`w-2 h-2 rounded-full ${gatewayState === 'running' ? 'bg-emerald-500' : gatewayState === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}
              aria-hidden="true"
            />
            Gateway: {gatewayState}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Providers" value={providersCount} accent="bg-blue-500" />
        <StatCard label="Channels" value={channelsCount} accent="bg-cyan-500" />
        <StatCard label="Gateway Issues" value={hasGatewayIssues} accent="bg-red-500" />
        <StatCard label="Hermes Mode" value={backendIsHermes} accent="bg-violet-500" />
      </section>

      <GatewayStatus />

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProvidersStatus />
        <ChannelsStatus />
      </section>

      {backend === 'hermes' && <PairingOps />}

      <LogViewer />

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Status data refreshes every 5 seconds.
      </div>
    </div>
  )
}
