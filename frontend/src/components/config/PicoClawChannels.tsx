import type { PicoCawChannelsConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { ChipInput } from '../ui/ChipInput';

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

  return (
    <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
      <div className="space-y-4">
        {/* Feishu */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Feishu</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.feishu.enabled}
                onChange={(e) => updateChannel('feishu', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.feishu.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">App ID</label>
                <Input
                  type="text"
                  value={channels.feishu.app_id}
                  onChange={(e) => updateChannel('feishu', { app_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">App Secret</label>
                <Input
                  type="password"
                  value={channels.feishu.app_secret}
                  onChange={(e) => updateChannel('feishu', { app_secret: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Encrypt Key</label>
                <Input
                  type="password"
                  value={channels.feishu.encrypt_key}
                  onChange={(e) => updateChannel('feishu', { encrypt_key: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Verification Token</label>
                <Input
                  type="password"
                  value={channels.feishu.verification_token}
                  onChange={(e) => updateChannel('feishu', { verification_token: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allow From</label>
                <ChipInput
                  value={channels.feishu.allow_from || []}
                  onChange={(allow_from) => updateChannel('feishu', { allow_from })}
                  placeholder="Add user ID and press Enter"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dingtalk */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Dingtalk</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.dingtalk.enabled}
                onChange={(e) => updateChannel('dingtalk', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.dingtalk.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Client ID</label>
                <Input
                  type="text"
                  value={channels.dingtalk.client_id}
                  onChange={(e) => updateChannel('dingtalk', { client_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Client Secret</label>
                <Input
                  type="password"
                  value={channels.dingtalk.client_secret}
                  onChange={(e) => updateChannel('dingtalk', { client_secret: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allow From</label>
                <ChipInput
                  value={channels.dingtalk.allow_from || []}
                  onChange={(allow_from) => updateChannel('dingtalk', { allow_from })}
                  placeholder="Add user ID and press Enter"
                />
              </div>
            </div>
          )}
        </div>

        {/* QQ */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">QQ</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.qq.enabled}
                onChange={(e) => updateChannel('qq', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.qq.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">App ID</label>
                <Input
                  type="text"
                  value={channels.qq.app_id}
                  onChange={(e) => updateChannel('qq', { app_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">App Secret</label>
                <Input
                  type="password"
                  value={channels.qq.app_secret}
                  onChange={(e) => updateChannel('qq', { app_secret: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allow From</label>
                <ChipInput
                  value={channels.qq.allow_from || []}
                  onChange={(allow_from) => updateChannel('qq', { allow_from })}
                  placeholder="Add user ID and press Enter"
                />
              </div>
            </div>
          )}
        </div>

        {/* Line */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Line</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.line.enabled}
                onChange={(e) => updateChannel('line', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.line.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Channel Secret</label>
                <Input
                  type="password"
                  value={channels.line.channel_secret}
                  onChange={(e) => updateChannel('line', { channel_secret: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Channel Access Token</label>
                <Input
                  type="password"
                  value={channels.line.channel_access_token}
                  onChange={(e) => updateChannel('line', { channel_access_token: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Webhook Host</label>
                <Input
                  type="text"
                  value={channels.line.webhook_host}
                  onChange={(e) => updateChannel('line', { webhook_host: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Webhook Port</label>
                <Input
                  type="number"
                  value={channels.line.webhook_port}
                  onChange={(e) => updateChannel('line', { webhook_port: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Webhook Path</label>
                <Input
                  type="text"
                  value={channels.line.webhook_path}
                  onChange={(e) => updateChannel('line', { webhook_path: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allow From</label>
                <ChipInput
                  value={channels.line.allow_from || []}
                  onChange={(allow_from) => updateChannel('line', { allow_from })}
                  placeholder="Add user ID and press Enter"
                />
              </div>
            </div>
          )}
        </div>

        {/* Maixcam */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Maixcam</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.maixcam.enabled}
                onChange={(e) => updateChannel('maixcam', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.maixcam.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Host</label>
                <Input
                  type="text"
                  value={channels.maixcam.host}
                  onChange={(e) => updateChannel('maixcam', { host: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Port</label>
                <Input
                  type="number"
                  value={channels.maixcam.port}
                  onChange={(e) => updateChannel('maixcam', { port: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allow From</label>
                <ChipInput
                  value={channels.maixcam.allow_from || []}
                  onChange={(allow_from) => updateChannel('maixcam', { allow_from })}
                  placeholder="Add user ID and press Enter"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
