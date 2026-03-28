import type { PicoCawChannelsConfig } from '../../types/config';
import { Toggle } from '../ui/Toggle';
import { PasswordInput } from '../ui/PasswordInput';
import { CopyButton } from '../ui/CopyButton';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { ChipInput } from '../ui/ChipInput';
import { FormSection } from '../ui/FormSection';

export interface PicoClawChannelsProps {
  channels: PicoCawChannelsConfig;
  onChange: (channels: PicoCawChannelsConfig) => void;
}

export function PicoClawChannels({ channels, onChange }: PicoClawChannelsProps) {
  const updateChannel = <K extends keyof PicoCawChannelsConfig>(
    channel: K,
    updates: Partial<PicoCawChannelsConfig[K]>
  ) => {
    onChange({
      ...channels,
      [channel]: { ...channels[channel], ...updates },
    });
  };

  const SecretField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <FormField label={label}>
      <div className="flex items-center gap-2">
        <PasswordInput value={value} onChange={(e) => onChange(e.target.value)} />
        <CopyButton text={value} className="shrink-0" />
      </div>
    </FormField>
  );

  return (
    <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
      <div className="space-y-4">
        {/* Feishu */}
        <FormSection title="Feishu">
          <div className="space-y-4">
            <Toggle
              id="feishu-enabled"
              label="Enabled"
              checked={channels.feishu.enabled}
              onChange={(checked) => updateChannel('feishu', { enabled: checked })}
            />
            <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
              channels.feishu.enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="App ID">
                    <Input
                      type="text"
                      value={channels.feishu.app_id}
                      onChange={(e) => updateChannel('feishu', { app_id: e.target.value })}
                    />
                  </FormField>
                  <SecretField
                    label="App Secret"
                    value={channels.feishu.app_secret}
                    onChange={(value) => updateChannel('feishu', { app_secret: value })}
                  />
                  <SecretField
                    label="Encrypt Key"
                    value={channels.feishu.encrypt_key}
                    onChange={(value) => updateChannel('feishu', { encrypt_key: value })}
                  />
                  <SecretField
                    label="Verification Token"
                    value={channels.feishu.verification_token}
                    onChange={(value) => updateChannel('feishu', { verification_token: value })}
                  />
                  <div className="md:col-span-2">
                    <FormField label="Allow From">
                      <ChipInput
                        value={channels.feishu.allow_from || []}
                        onChange={(allow_from) => updateChannel('feishu', { allow_from })}
                        placeholder="Add user ID and press Enter"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Dingtalk */}
        <FormSection title="Dingtalk">
          <div className="space-y-4">
            <Toggle
              id="dingtalk-enabled"
              label="Enabled"
              checked={channels.dingtalk.enabled}
              onChange={(checked) => updateChannel('dingtalk', { enabled: checked })}
            />
            <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
              channels.dingtalk.enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Client ID">
                    <Input
                      type="text"
                      value={channels.dingtalk.client_id}
                      onChange={(e) => updateChannel('dingtalk', { client_id: e.target.value })}
                    />
                  </FormField>
                  <SecretField
                    label="Client Secret"
                    value={channels.dingtalk.client_secret}
                    onChange={(value) => updateChannel('dingtalk', { client_secret: value })}
                  />
                  <div className="md:col-span-2">
                    <FormField label="Allow From">
                      <ChipInput
                        value={channels.dingtalk.allow_from || []}
                        onChange={(allow_from) => updateChannel('dingtalk', { allow_from })}
                        placeholder="Add user ID and press Enter"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* QQ */}
        <FormSection title="QQ">
          <div className="space-y-4">
            <Toggle
              id="qq-enabled"
              label="Enabled"
              checked={channels.qq.enabled}
              onChange={(checked) => updateChannel('qq', { enabled: checked })}
            />
            <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
              channels.qq.enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="App ID">
                    <Input
                      type="text"
                      value={channels.qq.app_id}
                      onChange={(e) => updateChannel('qq', { app_id: e.target.value })}
                    />
                  </FormField>
                  <SecretField
                    label="App Secret"
                    value={channels.qq.app_secret}
                    onChange={(value) => updateChannel('qq', { app_secret: value })}
                  />
                  <div className="md:col-span-2">
                    <FormField label="Allow From">
                      <ChipInput
                        value={channels.qq.allow_from || []}
                        onChange={(allow_from) => updateChannel('qq', { allow_from })}
                        placeholder="Add user ID and press Enter"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Line */}
        <FormSection title="Line">
          <div className="space-y-4">
            <Toggle
              id="line-enabled"
              label="Enabled"
              checked={channels.line.enabled}
              onChange={(checked) => updateChannel('line', { enabled: checked })}
            />
            <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
              channels.line.enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SecretField
                    label="Channel Secret"
                    value={channels.line.channel_secret}
                    onChange={(value) => updateChannel('line', { channel_secret: value })}
                  />
                  <SecretField
                    label="Channel Access Token"
                    value={channels.line.channel_access_token}
                    onChange={(value) => updateChannel('line', { channel_access_token: value })}
                  />
                  <FormField label="Webhook Host">
                    <Input
                      type="text"
                      value={channels.line.webhook_host}
                      onChange={(e) => updateChannel('line', { webhook_host: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Webhook Port">
                    <Input
                      type="number"
                      value={channels.line.webhook_port}
                      onChange={(e) => updateChannel('line', { webhook_port: Number(e.target.value) })}
                    />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Webhook Path">
                      <Input
                        type="text"
                        value={channels.line.webhook_path}
                        onChange={(e) => updateChannel('line', { webhook_path: e.target.value })}
                      />
                    </FormField>
                  </div>
                  <div className="md:col-span-2">
                    <FormField label="Allow From">
                      <ChipInput
                        value={channels.line.allow_from || []}
                        onChange={(allow_from) => updateChannel('line', { allow_from })}
                        placeholder="Add user ID and press Enter"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Maixcam */}
        <FormSection title="Maixcam">
          <div className="space-y-4">
            <Toggle
              id="maixcam-enabled"
              label="Enabled"
              checked={channels.maixcam.enabled}
              onChange={(checked) => updateChannel('maixcam', { enabled: checked })}
            />
            <div className={`grid transition-[grid-template-rows] motion-safe:duration-200 ${
              channels.maixcam.enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Host">
                    <Input
                      type="text"
                      value={channels.maixcam.host}
                      onChange={(e) => updateChannel('maixcam', { host: e.target.value })}
                    />
                  </FormField>
                  <FormField label="Port">
                    <Input
                      type="number"
                      value={channels.maixcam.port}
                      onChange={(e) => updateChannel('maixcam', { port: Number(e.target.value) })}
                    />
                  </FormField>
                  <div className="md:col-span-2">
                    <FormField label="Allow From">
                      <ChipInput
                        value={channels.maixcam.allow_from || []}
                        onChange={(allow_from) => updateChannel('maixcam', { allow_from })}
                        placeholder="Add user ID and press Enter"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormSection>

      </div>
    </div>
  );
}
