import type { HermesChannelsConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { ChipInput } from '../ui/ChipInput';

export interface HermesChannelsProps {
  channels: HermesChannelsConfig;
  onChange: (channels: HermesChannelsConfig) => void;
}

export function HermesChannels({ channels, onChange }: HermesChannelsProps) {
  const updateChannel = <K extends keyof HermesChannelsConfig>(
    channel: K,
    updates: Partial<HermesChannelsConfig[K]>
  ) => {
    onChange({
      ...channels,
      [channel]: { ...channels[channel], ...updates },
    });
  };

  const stringToArray = (str?: string) => (str ? str.split(',').map(s => s.trim()).filter(Boolean) : []);
  const arrayToString = (arr: string[]) => arr.join(',');

  return (
    <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
      <div className="space-y-4">
        
        {/* Discord */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Discord</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.discord.enabled}
                onChange={(e) => updateChannel('discord', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.discord.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bot Token</label>
                <Input
                  type="password"
                  value={channels.discord.bot_token}
                  onChange={(e) => updateChannel('discord', { bot_token: e.target.value })}
                  placeholder="Token from Developer Portal"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Token</label>
                <Input
                  type="password"
                  value={channels.discord.token}
                  onChange={(e) => updateChannel('discord', { token: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allowed Users</label>
                <ChipInput
                  value={stringToArray(channels.discord.allowed_users)}
                  onChange={(arr) => updateChannel('discord', { allowed_users: arrayToString(arr) })}
                  placeholder="Add User ID and press Enter"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allow From</label>
                <ChipInput
                  value={channels.discord.allow_from || []}
                  onChange={(allow_from) => updateChannel('discord', { allow_from })}
                  placeholder="Add User ID and press Enter"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Free Response Channels</label>
                <Input
                  type="text"
                  value={channels.discord.free_response_channels}
                  onChange={(e) => updateChannel('discord', { free_response_channels: e.target.value })}
                  placeholder="Comma-separated channel IDs"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.discord.allow_bots}
                  onChange={(e) => updateChannel('discord', { allow_bots: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Allow Bots</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.discord.require_mention}
                  onChange={(e) => updateChannel('discord', { require_mention: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Require Mention</span>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.discord.auto_thread}
                  onChange={(e) => updateChannel('discord', { auto_thread: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Auto Thread</span>
              </div>
            </div>
          )}
        </div>

        {/* Telegram */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Telegram</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.telegram.enabled}
                onChange={(e) => updateChannel('telegram', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.telegram.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bot Token</label>
                <Input
                  type="password"
                  value={channels.telegram.bot_token}
                  onChange={(e) => updateChannel('telegram', { bot_token: e.target.value })}
                  placeholder="Token from @BotFather"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Token</label>
                <Input
                  type="password"
                  value={channels.telegram.token}
                  onChange={(e) => updateChannel('telegram', { token: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Channel</label>
                <Input
                  type="text"
                  value={channels.telegram.home_channel}
                  onChange={(e) => updateChannel('telegram', { home_channel: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Channel Name</label>
                <Input
                  type="text"
                  value={channels.telegram.home_channel_name}
                  onChange={(e) => updateChannel('telegram', { home_channel_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allowed Users</label>
                <ChipInput
                  value={stringToArray(channels.telegram.allowed_users)}
                  onChange={(arr) => updateChannel('telegram', { allowed_users: arrayToString(arr) })}
                  placeholder="Add User ID and press Enter"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allow From</label>
                <ChipInput
                  value={channels.telegram.allow_from || []}
                  onChange={(allow_from) => updateChannel('telegram', { allow_from })}
                  placeholder="Add User ID and press Enter"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.telegram.allow_all_users}
                  onChange={(e) => updateChannel('telegram', { allow_all_users: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Allow All Users</span>
              </div>
            </div>
          )}
        </div>

        {/* Slack */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Slack</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.slack.enabled}
                onChange={(e) => updateChannel('slack', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.slack.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bot Token</label>
                <Input
                  type="password"
                  value={channels.slack.bot_token}
                  onChange={(e) => updateChannel('slack', { bot_token: e.target.value })}
                  placeholder="xoxb-..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">App Token</label>
                <Input
                  type="password"
                  value={channels.slack.app_token}
                  onChange={(e) => updateChannel('slack', { app_token: e.target.value })}
                  placeholder="xapp-..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Channel</label>
                <Input
                  type="text"
                  value={channels.slack.home_channel}
                  onChange={(e) => updateChannel('slack', { home_channel: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Channel Name</label>
                <Input
                  type="text"
                  value={channels.slack.home_channel_name}
                  onChange={(e) => updateChannel('slack', { home_channel_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allowed Users</label>
                <ChipInput
                  value={stringToArray(channels.slack.allowed_users)}
                  onChange={(arr) => updateChannel('slack', { allowed_users: arrayToString(arr) })}
                  placeholder="Add User ID and press Enter"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.slack.allow_all_users}
                  onChange={(e) => updateChannel('slack', { allow_all_users: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Allow All Users</span>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">WhatsApp</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.whatsapp.enabled}
                onChange={(e) => updateChannel('whatsapp', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.whatsapp.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mode</label>
                <Input
                  type="text"
                  value={channels.whatsapp.mode}
                  onChange={(e) => updateChannel('whatsapp', { mode: e.target.value })}
                  placeholder="local"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allowed Users</label>
                <ChipInput
                  value={stringToArray(channels.whatsapp.allowed_users)}
                  onChange={(arr) => updateChannel('whatsapp', { allowed_users: arrayToString(arr) })}
                  placeholder="Add Number and press Enter"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.whatsapp.allow_all_users}
                  onChange={(e) => updateChannel('whatsapp', { allow_all_users: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Allow All Users</span>
              </div>
            </div>
          )}
        </div>

        {/* Signal */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Signal</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.signal.enabled}
                onChange={(e) => updateChannel('signal', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.signal.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">HTTP URL</label>
                <Input
                  type="text"
                  value={channels.signal.http_url}
                  onChange={(e) => updateChannel('signal', { http_url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Account</label>
                <Input
                  type="text"
                  value={channels.signal.account}
                  onChange={(e) => updateChannel('signal', { account: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Channel</label>
                <Input
                  type="text"
                  value={channels.signal.home_channel}
                  onChange={(e) => updateChannel('signal', { home_channel: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Channel Name</label>
                <Input
                  type="text"
                  value={channels.signal.home_channel_name}
                  onChange={(e) => updateChannel('signal', { home_channel_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Group Allowed Users</label>
                <ChipInput
                  value={stringToArray(channels.signal.group_allowed_users)}
                  onChange={(arr) => updateChannel('signal', { group_allowed_users: arrayToString(arr) })}
                  placeholder="Add Group ID and press Enter"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allowed Users</label>
                <ChipInput
                  value={stringToArray(channels.signal.allowed_users)}
                  onChange={(arr) => updateChannel('signal', { allowed_users: arrayToString(arr) })}
                  placeholder="Add Number and press Enter"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.signal.ignore_stories}
                  onChange={(e) => updateChannel('signal', { ignore_stories: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Ignore Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.signal.allow_all_users}
                  onChange={(e) => updateChannel('signal', { allow_all_users: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Allow All Users</span>
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Email</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.email.enabled}
                onChange={(e) => updateChannel('email', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.email.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Address</label>
                <Input
                  type="text"
                  value={channels.email.address}
                  onChange={(e) => updateChannel('email', { address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Password</label>
                <Input
                  type="password"
                  value={channels.email.password}
                  onChange={(e) => updateChannel('email', { password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">IMAP Host</label>
                <Input
                  type="text"
                  value={channels.email.imap_host}
                  onChange={(e) => updateChannel('email', { imap_host: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">SMTP Host</label>
                <Input
                  type="text"
                  value={channels.email.smtp_host}
                  onChange={(e) => updateChannel('email', { smtp_host: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">IMAP Port</label>
                <Input
                  type="number"
                  value={channels.email.imap_port}
                  onChange={(e) => updateChannel('email', { imap_port: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">SMTP Port</label>
                <Input
                  type="number"
                  value={channels.email.smtp_port}
                  onChange={(e) => updateChannel('email', { smtp_port: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Poll Interval (s)</label>
                <Input
                  type="number"
                  value={channels.email.poll_interval}
                  onChange={(e) => updateChannel('email', { poll_interval: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Address</label>
                <Input
                  type="text"
                  value={channels.email.home_address}
                  onChange={(e) => updateChannel('email', { home_address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Home Address Name</label>
                <Input
                  type="text"
                  value={channels.email.home_address_name}
                  onChange={(e) => updateChannel('email', { home_address_name: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Allowed Users</label>
                <ChipInput
                  value={stringToArray(channels.email.allowed_users)}
                  onChange={(arr) => updateChannel('email', { allowed_users: arrayToString(arr) })}
                  placeholder="Add Email and press Enter"
                />
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  checked={channels.email.allow_all_users}
                  onChange={(e) => updateChannel('email', { allow_all_users: e.target.checked })}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Allow All Users</span>
              </div>
            </div>
          )}
        </div>

        {/* HomeAssistant */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Home Assistant</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                checked={channels.homeassistant.enabled}
                onChange={(e) => updateChannel('homeassistant', { enabled: e.target.checked })}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
            </label>
          </div>
          {channels.homeassistant.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">URL</label>
                <Input
                  type="text"
                  value={channels.homeassistant.url}
                  onChange={(e) => updateChannel('homeassistant', { url: e.target.value })}
                  placeholder="http://homeassistant.local:8123"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Token</label>
                <Input
                  type="password"
                  value={channels.homeassistant.token}
                  onChange={(e) => updateChannel('homeassistant', { token: e.target.value })}
                  placeholder="Long-Lived Access Token"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
