import { GatewayStatus } from './status/GatewayStatus'
import { ProvidersStatus } from './status/ProvidersStatus'
import { ChannelsStatus } from './status/ChannelsStatus'
import { CronJobs } from './status/CronJobs'
import { PairingOps } from './status/PairingOps'
import { LogViewer } from './status/LogViewer'
import { useBackendQuery } from '../hooks/useBackend'

export function StatusTab() {
  const { data: backendData } = useBackendQuery()
  const backend = backendData?.backend

  return (
    <div className="space-y-6">
      <GatewayStatus />
      <ProvidersStatus />
      <ChannelsStatus />
      <CronJobs />
      {backend === 'hermes' && <PairingOps />}
      <LogViewer />
    </div>
  )
}
