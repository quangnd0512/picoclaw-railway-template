import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { FormField } from '../ui/FormField';
import { FormSection } from '../ui/FormSection';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function SystemSettings({ config, backend, onChange }: Props) {
  const h = config.hermes;

  return (
    <section className="mb-8 space-y-4">
      <h2 className="text-lg font-semibold">System Settings</h2>

      <FormSection title="Gateway">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Host">
            <Input
              type="text"
              value={config.gateway.host || ''}
              onChange={(e) => onChange('gateway.host', e.target.value)}
            />
          </FormField>
          <FormField label="Port">
            <Input
              type="number"
              value={config.gateway.port}
              onChange={(e) => onChange('gateway.port', Number(e.target.value))}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Heartbeat">
        <div className="space-y-4">
          <Toggle
            label="Enabled"
            checked={config.heartbeat.enabled}
            onChange={(checked) => onChange('heartbeat.enabled', checked)}
          />
          <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
            config.heartbeat.enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}>
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Interval (seconds)">
                  <Input
                    type="number"
                    min="1"
                    value={config.heartbeat.interval}
                    onChange={(e) => onChange('heartbeat.interval', Number(e.target.value))}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Devices">
        <div className="space-y-4">
          <Toggle
            label="Enabled"
            checked={config.devices?.enabled || false}
            onChange={(checked) => onChange('devices.enabled', checked)}
          />
          <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
            config.devices?.enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}>
            <div className="overflow-hidden">
              <Toggle
                label="Monitor USB Devices"
                checked={config.devices?.monitor_usb || false}
                onChange={(checked) => onChange('devices.monitor_usb', checked)}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {backend === 'hermes' && (
        <>
          {/* Terminal */}
          <FormSection title="Terminal">
            <div className="space-y-4">
              <FormField label="Backend">
                <Select
                  value={h.terminal?.backend || 'native'}
                  onChange={(e) => onChange('hermes.terminal.backend', e.target.value)}
                >
                  <option value="native">Native</option>
                  <option value="docker">Docker</option>
                  <option value="ssh">SSH</option>
                </Select>
              </FormField>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Working Directory (CWD)">
                  <Input
                    type="text"
                    placeholder="e.g. /app"
                    value={h.terminal?.cwd || ''}
                    onChange={(e) => onChange('hermes.terminal.cwd', e.target.value)}
                  />
                </FormField>
                <FormField label="Timeout (seconds)">
                  <Input
                    type="number"
                    value={h.terminal?.timeout || 60}
                    onChange={(e) => onChange('hermes.terminal.timeout', Number(e.target.value))}
                  />
                </FormField>
              </div>

              {/* Docker Settings */}
              <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
                h.terminal?.backend === 'docker' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}>
                <div className="overflow-hidden">
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Docker Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Docker Image">
                        <Input
                          type="text"
                          placeholder="e.g. ubuntu:latest"
                          value={h.terminal?.docker_image || ''}
                          onChange={(e) => onChange('hermes.terminal.docker_image', e.target.value)}
                        />
                      </FormField>
                      <FormField label="CPU Limit">
                        <Input
                          type="text"
                          placeholder="e.g. 1.0"
                          value={h.terminal?.container_cpu || ''}
                          onChange={(e) => onChange('hermes.terminal.container_cpu', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Memory Limit">
                        <Input
                          type="text"
                          placeholder="e.g. 512m"
                          value={h.terminal?.container_memory || ''}
                          onChange={(e) => onChange('hermes.terminal.container_memory', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Disk Limit">
                        <Input
                          type="text"
                          placeholder="e.g. 10g"
                          value={h.terminal?.container_disk || ''}
                          onChange={(e) => onChange('hermes.terminal.container_disk', e.target.value)}
                        />
                      </FormField>
                    </div>
                    <Toggle
                      label="Persistent Container"
                      checked={h.terminal?.container_persistent || false}
                      onChange={(checked) => onChange('hermes.terminal.container_persistent', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* SSH Settings */}
              <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
                h.terminal?.backend === 'ssh' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}>
                <div className="overflow-hidden">
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">SSH Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Host">
                        <Input
                          type="text"
                          placeholder="e.g. 192.168.1.10"
                          value={h.terminal?.ssh_host || ''}
                          onChange={(e) => onChange('hermes.terminal.ssh_host', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Port">
                        <Input
                          type="number"
                          value={h.terminal?.ssh_port || 22}
                          onChange={(e) => onChange('hermes.terminal.ssh_port', Number(e.target.value))}
                        />
                      </FormField>
                      <FormField label="User">
                        <Input
                          type="text"
                          placeholder="e.g. root"
                          value={h.terminal?.ssh_user || ''}
                          onChange={(e) => onChange('hermes.terminal.ssh_user', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Key Path">
                        <Input
                          type="text"
                          placeholder="e.g. ~/.ssh/id_rsa"
                          value={h.terminal?.ssh_key_path || ''}
                          onChange={(e) => onChange('hermes.terminal.ssh_key_path', e.target.value)}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Display */}
          <FormSection title="Display">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Toggle
                label="Compact Mode"
                checked={h.display?.compact || false}
                onChange={(checked) => onChange('hermes.display.compact', checked)}
              />
              <Toggle
                label="Bell on Complete"
                checked={h.display?.bell_on_complete || false}
                onChange={(checked) => onChange('hermes.display.bell_on_complete', checked)}
              />
              <Toggle
                label="Show Reasoning"
                checked={h.display?.show_reasoning || false}
                onChange={(checked) => onChange('hermes.display.show_reasoning', checked)}
              />
              <FormField label="Personality">
                <Input
                  type="text"
                  placeholder="kawaii"
                  value={h.display?.personality || ''}
                  onChange={(e) => onChange('hermes.display.personality', e.target.value)}
                />
              </FormField>
              <FormField label="Resume Display">
                <Select
                  value={h.display?.resume_display || 'full'}
                  onChange={(e) => onChange('hermes.display.resume_display', e.target.value)}
                >
                  <option value="full">Full</option>
                  <option value="compact">Compact</option>
                  <option value="none">None</option>
                </Select>
              </FormField>
              <FormField label="Skin">
                <Input
                  type="text"
                  placeholder="e.g. default"
                  value={h.display?.skin || ''}
                  onChange={(e) => onChange('hermes.display.skin', e.target.value)}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Security */}
          <FormSection title="Security">
            <div className="space-y-4">
              <Toggle
                label="Redact Secrets"
                checked={h.security?.redact_secrets || false}
                onChange={(checked) => onChange('hermes.security.redact_secrets', checked)}
              />
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Tirith Integration</h4>
                  <Toggle
                    label="Enabled"
                    checked={h.security?.tirith_enabled || false}
                    onChange={(checked) => onChange('hermes.security.tirith_enabled', checked)}
                  />
                </div>
                
                <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
                  h.security?.tirith_enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}>
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Tirith Path">
                        <Input
                          type="text"
                          placeholder="e.g. /usr/local/bin/tirith"
                          value={h.security?.tirith_path || ''}
                          onChange={(e) => onChange('hermes.security.tirith_path', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Timeout (seconds)">
                        <Input
                          type="number"
                          value={h.security?.tirith_timeout || 5}
                          onChange={(e) => onChange('hermes.security.tirith_timeout', Number(e.target.value))}
                        />
                      </FormField>
                      <div className="md:col-span-2">
                        <Toggle
                          label="Fail Open (allow execution if Tirith fails)"
                          checked={h.security?.tirith_fail_open || false}
                          onChange={(checked) => onChange('hermes.security.tirith_fail_open', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>
        </>
      )}
    </section>
  );
}
