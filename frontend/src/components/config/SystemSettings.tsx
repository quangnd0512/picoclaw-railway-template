import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function SystemSettings({ config, backend, onChange }: Props) {
  const h = config.hermes;

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

      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
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

      {backend === 'hermes' && (
        <>
          {/* Terminal */}
          <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="font-medium mb-3">Terminal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Backend</label>
                <Select
                  value={h.terminal?.backend || 'native'}
                  onChange={(e) => onChange('hermes.terminal.backend', e.target.value)}
                >
                  <option value="native">Native</option>
                  <option value="docker">Docker</option>
                  <option value="ssh">SSH</option>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Working Directory (CWD)</label>
                  <Input
                    type="text"
                    placeholder="e.g. /app"
                    value={h.terminal?.cwd || ''}
                    onChange={(e) => onChange('hermes.terminal.cwd', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Timeout (seconds)</label>
                  <Input
                    type="number"
                    value={h.terminal?.timeout || 60}
                    onChange={(e) => onChange('hermes.terminal.timeout', Number(e.target.value))}
                  />
                </div>
              </div>

              {h.terminal?.backend === 'docker' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-sm">Docker Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Docker Image</label>
                      <Input
                        type="text"
                        placeholder="e.g. ubuntu:latest"
                        value={h.terminal?.docker_image || ''}
                        onChange={(e) => onChange('hermes.terminal.docker_image', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">CPU Limit</label>
                      <Input
                        type="text"
                        placeholder="e.g. 1.0"
                        value={h.terminal?.container_cpu || ''}
                        onChange={(e) => onChange('hermes.terminal.container_cpu', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Memory Limit</label>
                      <Input
                        type="text"
                        placeholder="e.g. 512m"
                        value={h.terminal?.container_memory || ''}
                        onChange={(e) => onChange('hermes.terminal.container_memory', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Disk Limit</label>
                      <Input
                        type="text"
                        placeholder="e.g. 10g"
                        value={h.terminal?.container_disk || ''}
                        onChange={(e) => onChange('hermes.terminal.container_disk', e.target.value)}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                      checked={h.terminal?.container_persistent || false}
                      onChange={(e) => onChange('hermes.terminal.container_persistent', e.target.checked)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Persistent Container</span>
                  </label>
                </div>
              )}

              {h.terminal?.backend === 'ssh' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-sm">SSH Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Host</label>
                      <Input
                        type="text"
                        placeholder="e.g. 192.168.1.10"
                        value={h.terminal?.ssh_host || ''}
                        onChange={(e) => onChange('hermes.terminal.ssh_host', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Port</label>
                      <Input
                        type="number"
                        value={h.terminal?.ssh_port || 22}
                        onChange={(e) => onChange('hermes.terminal.ssh_port', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">User</label>
                      <Input
                        type="text"
                        placeholder="e.g. root"
                        value={h.terminal?.ssh_user || ''}
                        onChange={(e) => onChange('hermes.terminal.ssh_user', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Key Path</label>
                      <Input
                        type="text"
                        placeholder="e.g. ~/.ssh/id_rsa"
                        value={h.terminal?.ssh_key_path || ''}
                        onChange={(e) => onChange('hermes.terminal.ssh_key_path', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display */}
          <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4 mb-4">
            <h3 className="font-medium mb-3">Display</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={h.display?.compact || false}
                  onChange={(e) => onChange('hermes.display.compact', e.target.checked)}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Compact Mode</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={h.display?.bell_on_complete || false}
                  onChange={(e) => onChange('hermes.display.bell_on_complete', e.target.checked)}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Bell on Complete</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={h.display?.show_reasoning || false}
                  onChange={(e) => onChange('hermes.display.show_reasoning', e.target.checked)}
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Show Reasoning</label>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Personality</label>
                <Input
                  type="text"
                  placeholder="kawaii"
                  value={h.display?.personality || ''}
                  onChange={(e) => onChange('hermes.display.personality', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Resume Display</label>
                <Select
                  value={h.display?.resume_display || 'full'}
                  onChange={(e) => onChange('hermes.display.resume_display', e.target.value)}
                >
                  <option value="full">Full</option>
                  <option value="compact">Compact</option>
                  <option value="none">None</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Skin</label>
                <Input
                  type="text"
                  placeholder="e.g. default"
                  value={h.display?.skin || ''}
                  onChange={(e) => onChange('hermes.display.skin', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
            <h3 className="font-medium mb-3">Security</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={h.security?.redact_secrets || false}
                  onChange={(e) => onChange('hermes.security.redact_secrets', e.target.checked)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Redact Secrets</span>
              </label>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Tirith Integration</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                      checked={h.security?.tirith_enabled || false}
                      onChange={(e) => onChange('hermes.security.tirith_enabled', e.target.checked)}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
                  </label>
                </div>
                
                {h.security?.tirith_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tirith Path</label>
                      <Input
                        type="text"
                        placeholder="e.g. /usr/local/bin/tirith"
                        value={h.security?.tirith_path || ''}
                        onChange={(e) => onChange('hermes.security.tirith_path', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Timeout (seconds)</label>
                      <Input
                        type="number"
                        value={h.security?.tirith_timeout || 5}
                        onChange={(e) => onChange('hermes.security.tirith_timeout', Number(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                          checked={h.security?.tirith_fail_open || false}
                          onChange={(e) => onChange('hermes.security.tirith_fail_open', e.target.checked)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Fail Open (allow execution if Tirith fails)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
