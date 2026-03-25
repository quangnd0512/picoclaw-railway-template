import { useState, useEffect } from 'react';
import { useStatusQuery } from '../../hooks/useStatus';
import { useBackendQuery, useSwitchBackend } from '../../hooks/useBackend';
import { useStartGateway, useStopGateway, useRestartGateway } from '../../hooks/useGateway';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import type { GatewayStatus as BaseGatewayStatus } from '../../types/status';

type ExtendedGatewayStatus = BaseGatewayStatus & {
  pid?: number;
  uptime?: number;
};

export function formatUptime(seconds?: number | null): string {
  if (seconds == null) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function GatewayStatus() {
  const { data: statusData } = useStatusQuery();
  const { data: backendData } = useBackendQuery();

  const startGateway = useStartGateway();
  const stopGateway = useStopGateway();
  const restartGateway = useRestartGateway();
  const switchBackend = useSwitchBackend();

  const gateway = statusData?.gateway as ExtendedGatewayStatus | undefined;
  const backend = backendData?.backend;

  const [localBackend, setLocalBackend] = useState<string>('');

  useEffect(() => {
    if (backend) {
      setLocalBackend(backend);
    }
  }, [backend]);

  const handleBackendChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBackend = e.target.value as 'picoclaw' | 'hermes';
    if (newBackend === backend) return;

    if (gateway?.state === 'running') {
      const confirmed = window.confirm('Switch backend will stop the gateway. Continue?');
      if (!confirmed) {
        setLocalBackend(backend || '');
        return;
      }
    }

    setLocalBackend(newBackend);
    switchBackend.mutate(newBackend);
  };

  const getStateColor = (state?: string) => {
    switch (state) {
      case 'running': return 'text-emerald-600 dark:text-emerald-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'starting':
      case 'stopping': return 'text-yellow-600 dark:text-yellow-400';
      case 'stopped': return 'text-gray-500 dark:text-gray-400';
      case 'restarting': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const availableBackends = (backendData as { available?: string[] })?.available || ['picoclaw', 'hermes'];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Gateway</h2>
        <div className="flex items-center gap-2">
          <Select
            value={localBackend}
            onChange={handleBackendChange}
            disabled={switchBackend.isPending}
            className="w-auto py-1 px-8 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full border-none cursor-pointer"
          >
            {availableBackends.map((b: string) => (
              <option key={b} value={b}>
                Backend: {b === 'picoclaw' ? '🐾 PicoClaw' : b === 'hermes' ? '🔮 Hermes' : `❓ ${b}`}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500">State</span>
              <p className={`font-medium capitalize ${getStateColor(gateway?.state)}`}>
                {gateway?.state || 'unknown'}
              </p>
            </div>

            {gateway?.pid != null && (
              <div>
                <span className="text-xs text-gray-500">PID</span>
                <p className="font-medium">{gateway.pid}</p>
              </div>
            )}

            {gateway?.uptime != null && (
              <div>
                <span className="text-xs text-gray-500">Uptime</span>
                <p className="font-medium">{formatUptime(gateway.uptime)}</p>
              </div>
            )}

            <div>
              <span className="text-xs text-gray-500">Restarts</span>
              <p className="font-medium">{gateway?.restart_count ?? 0}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => startGateway.mutate()}
              disabled={gateway?.state === 'running' || startGateway.isPending}
            >
              Start
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => stopGateway.mutate()}
              disabled={gateway?.state === 'stopped' || stopGateway.isPending}
            >
              Stop
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => restartGateway.mutate()}
              disabled={restartGateway.isPending}
            >
              Restart
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
