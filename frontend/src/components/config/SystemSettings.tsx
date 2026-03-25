import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function SystemSettings({ config, onChange }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">System Settings</h2>

      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
        <h3 className="font-medium mb-3">Gateway</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Host</label>
            <Input
              type="text"
              value={config.gateway.host || ''}
              onChange={(e) => onChange('gateway.host', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Port</label>
            <Input
              type="number"
              value={config.gateway.port}
              onChange={(e) => onChange('gateway.port', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Heartbeat</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.heartbeat.enabled}
              onChange={(e) => onChange('heartbeat.enabled', e.target.checked)}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
          </label>
        </div>
        {config.heartbeat.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Interval (seconds)</label>
              <Input
                type="number"
                min="1"
                value={config.heartbeat.interval}
                onChange={(e) => onChange('heartbeat.interval', Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Devices</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
              checked={config.devices?.enabled || false}
              onChange={(e) => onChange('devices.enabled', e.target.checked)}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
          </label>
        </div>
        {config.devices?.enabled && (
          <div className="mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={config.devices?.monitor_usb || false}
                onChange={(e) => onChange('devices.monitor_usb', e.target.checked)}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Monitor USB Devices</span>
            </label>
          </div>
        )}
      </div>
    </section>
  );
}
