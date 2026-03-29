import type { HermesChannelsConfig } from '../../types/config';
import { Toggle } from '../ui/Toggle';
import { PasswordInput } from '../ui/PasswordInput';
import { CopyButton } from '../ui/CopyButton';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { ChipInput } from '../ui/ChipInput';
import { FormSection } from '../ui/FormSection';

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

  return (
    <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
      <div className="space-y-4">
        <FormSection title="Discord" collapsible defaultOpen={channels.discord.enabled}>
          <div className="space-y-4">
            <FormField label="Enabled" id="hermes-discord-enabled">
              <Toggle
                id="hermes-discord-enabled"
                checked={channels.discord.enabled}
                onChange={(checked) => updateChannel('discord', { enabled: checked })}
              />
            </FormField>

            {channels.discord.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Bot Token" id="hermes-discord-bot-token">
                  <div className="relative">
                    <PasswordInput
                      value={channels.discord.bot_token}
                      onChange={(e) => updateChannel('discord', { bot_token: e.target.value })}
                      placeholder="Token from Developer Portal"
                    />
                    {channels.discord.bot_token && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.discord.bot_token} />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Token" id="hermes-discord-token">
                  <div className="relative">
                    <PasswordInput
                      value={channels.discord.token}
                      onChange={(e) => updateChannel('discord', { token: e.target.value })}
                    />
                    {channels.discord.token && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.discord.token} />
                      </div>
                    )}
                  </div>
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Allowed Users" id="hermes-discord-allowed-users">
                    <ChipInput
                      value={channels.discord.allowed_users || []}
                      onChange={(allowed_users) => updateChannel('discord', { allowed_users })}
                      placeholder="Add User ID and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Allow From" id="hermes-discord-allow-from">
                    <ChipInput
                      value={channels.discord.allow_from || []}
                      onChange={(allow_from) => updateChannel('discord', { allow_from })}
                      placeholder="Add User ID and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Free Response Channels" id="hermes-discord-free-response-channels">
                    <Input
                      type="text"
                      value={channels.discord.free_response_channels}
                      onChange={(e) => updateChannel('discord', { free_response_channels: e.target.value })}
                      placeholder="Comma-separated channel IDs"
                    />
                  </FormField>
                </div>

                <FormField label="Allow Bots" id="hermes-discord-allow-bots">
                  <Toggle
                    id="hermes-discord-allow-bots"
                    checked={channels.discord.allow_bots}
                    onChange={(checked) => updateChannel('discord', { allow_bots: checked })}
                  />
                </FormField>

                <FormField label="Require Mention" id="hermes-discord-require-mention">
                  <Toggle
                    id="hermes-discord-require-mention"
                    checked={channels.discord.require_mention}
                    onChange={(checked) => updateChannel('discord', { require_mention: checked })}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Auto Thread" id="hermes-discord-auto-thread">
                    <Toggle
                      id="hermes-discord-auto-thread"
                      checked={channels.discord.auto_thread}
                      onChange={(checked) => updateChannel('discord', { auto_thread: checked })}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Telegram" collapsible defaultOpen={channels.telegram.enabled}>
          <div className="space-y-4">
            <FormField label="Enabled" id="hermes-telegram-enabled">
              <Toggle
                id="hermes-telegram-enabled"
                checked={channels.telegram.enabled}
                onChange={(checked) => updateChannel('telegram', { enabled: checked })}
              />
            </FormField>

            {channels.telegram.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Bot Token" id="hermes-telegram-bot-token">
                  <div className="relative">
                    <PasswordInput
                      value={channels.telegram.bot_token}
                      onChange={(e) => updateChannel('telegram', { bot_token: e.target.value })}
                      placeholder="Token from @BotFather"
                    />
                    {channels.telegram.bot_token && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.telegram.bot_token} />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Token" id="hermes-telegram-token">
                  <div className="relative">
                    <PasswordInput
                      value={channels.telegram.token}
                      onChange={(e) => updateChannel('telegram', { token: e.target.value })}
                    />
                    {channels.telegram.token && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.telegram.token} />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Home Channel" id="hermes-telegram-home-channel">
                  <Input
                    type="text"
                    value={channels.telegram.home_channel}
                    onChange={(e) => updateChannel('telegram', { home_channel: e.target.value })}
                  />
                </FormField>

                <FormField label="Home Channel Name" id="hermes-telegram-home-channel-name">
                  <Input
                    type="text"
                    value={channels.telegram.home_channel_name}
                    onChange={(e) => updateChannel('telegram', { home_channel_name: e.target.value })}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Allowed Users" id="hermes-telegram-allowed-users">
                    <ChipInput
                      value={channels.telegram.allowed_users || []}
                      onChange={(allowed_users) => updateChannel('telegram', { allowed_users })}
                      placeholder="Add User ID and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Allow From" id="hermes-telegram-allow-from">
                    <ChipInput
                      value={channels.telegram.allow_from || []}
                      onChange={(allow_from) => updateChannel('telegram', { allow_from })}
                      placeholder="Add User ID and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Allow All Users" id="hermes-telegram-allow-all-users">
                    <Toggle
                      id="hermes-telegram-allow-all-users"
                      checked={channels.telegram.allow_all_users}
                      onChange={(checked) => updateChannel('telegram', { allow_all_users: checked })}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Slack" collapsible defaultOpen={channels.slack.enabled}>
          <div className="space-y-4">
            <FormField label="Enabled" id="hermes-slack-enabled">
              <Toggle
                id="hermes-slack-enabled"
                checked={channels.slack.enabled}
                onChange={(checked) => updateChannel('slack', { enabled: checked })}
              />
            </FormField>

            {channels.slack.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Bot Token" id="hermes-slack-bot-token">
                  <div className="relative">
                    <PasswordInput
                      value={channels.slack.bot_token}
                      onChange={(e) => updateChannel('slack', { bot_token: e.target.value })}
                      placeholder="xoxb-..."
                    />
                    {channels.slack.bot_token && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.slack.bot_token} />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="App Token" id="hermes-slack-app-token">
                  <div className="relative">
                    <PasswordInput
                      value={channels.slack.app_token}
                      onChange={(e) => updateChannel('slack', { app_token: e.target.value })}
                      placeholder="xapp-..."
                    />
                    {channels.slack.app_token && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.slack.app_token} />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Home Channel" id="hermes-slack-home-channel">
                  <Input
                    type="text"
                    value={channels.slack.home_channel}
                    onChange={(e) => updateChannel('slack', { home_channel: e.target.value })}
                  />
                </FormField>

                <FormField label="Home Channel Name" id="hermes-slack-home-channel-name">
                  <Input
                    type="text"
                    value={channels.slack.home_channel_name}
                    onChange={(e) => updateChannel('slack', { home_channel_name: e.target.value })}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Allowed Users" id="hermes-slack-allowed-users">
                    <ChipInput
                      value={channels.slack.allowed_users || []}
                      onChange={(allowed_users) => updateChannel('slack', { allowed_users })}
                      placeholder="Add User ID and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Allow All Users" id="hermes-slack-allow-all-users">
                    <Toggle
                      id="hermes-slack-allow-all-users"
                      checked={channels.slack.allow_all_users}
                      onChange={(checked) => updateChannel('slack', { allow_all_users: checked })}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="WhatsApp" collapsible defaultOpen={channels.whatsapp.enabled}>
          <div className="space-y-4">
            <FormField label="Enabled" id="hermes-whatsapp-enabled">
              <Toggle
                id="hermes-whatsapp-enabled"
                checked={channels.whatsapp.enabled}
                onChange={(checked) => updateChannel('whatsapp', { enabled: checked })}
              />
            </FormField>

            {channels.whatsapp.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Mode" id="hermes-whatsapp-mode">
                  <Input
                    type="text"
                    value={channels.whatsapp.mode}
                    onChange={(e) => updateChannel('whatsapp', { mode: e.target.value })}
                    placeholder="local"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Allowed Users" id="hermes-whatsapp-allowed-users">
                    <ChipInput
                      value={channels.whatsapp.allowed_users || []}
                      onChange={(allowed_users) => updateChannel('whatsapp', { allowed_users })}
                      placeholder="Add Number and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Allow All Users" id="hermes-whatsapp-allow-all-users">
                    <Toggle
                      id="hermes-whatsapp-allow-all-users"
                      checked={channels.whatsapp.allow_all_users}
                      onChange={(checked) => updateChannel('whatsapp', { allow_all_users: checked })}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Signal" collapsible defaultOpen={channels.signal.enabled}>
          <div className="space-y-4">
            <FormField label="Enabled" id="hermes-signal-enabled">
              <Toggle
                id="hermes-signal-enabled"
                checked={channels.signal.enabled}
                onChange={(checked) => updateChannel('signal', { enabled: checked })}
              />
            </FormField>

            {channels.signal.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="HTTP URL" id="hermes-signal-http-url">
                  <Input
                    type="text"
                    value={channels.signal.http_url}
                    onChange={(e) => updateChannel('signal', { http_url: e.target.value })}
                  />
                </FormField>

                <FormField label="Account" id="hermes-signal-account">
                  <Input
                    type="text"
                    value={channels.signal.account}
                    onChange={(e) => updateChannel('signal', { account: e.target.value })}
                  />
                </FormField>

                <FormField label="Home Channel" id="hermes-signal-home-channel">
                  <Input
                    type="text"
                    value={channels.signal.home_channel}
                    onChange={(e) => updateChannel('signal', { home_channel: e.target.value })}
                  />
                </FormField>

                <FormField label="Home Channel Name" id="hermes-signal-home-channel-name">
                  <Input
                    type="text"
                    value={channels.signal.home_channel_name}
                    onChange={(e) => updateChannel('signal', { home_channel_name: e.target.value })}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Group Allowed Users" id="hermes-signal-group-allowed-users">
                    <ChipInput
                      value={channels.signal.group_allowed_users || []}
                      onChange={(group_allowed_users) => updateChannel('signal', { group_allowed_users })}
                      placeholder="Add Group ID and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Allowed Users" id="hermes-signal-allowed-users">
                    <ChipInput
                      value={channels.signal.allowed_users || []}
                      onChange={(allowed_users) => updateChannel('signal', { allowed_users })}
                      placeholder="Add Number and press Enter"
                    />
                  </FormField>
                </div>

                <FormField label="Ignore Stories" id="hermes-signal-ignore-stories">
                  <Toggle
                    id="hermes-signal-ignore-stories"
                    checked={channels.signal.ignore_stories}
                    onChange={(checked) => updateChannel('signal', { ignore_stories: checked })}
                  />
                </FormField>

                <FormField label="Allow All Users" id="hermes-signal-allow-all-users">
                  <Toggle
                    id="hermes-signal-allow-all-users"
                    checked={channels.signal.allow_all_users}
                    onChange={(checked) => updateChannel('signal', { allow_all_users: checked })}
                  />
                </FormField>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Email" collapsible defaultOpen={channels.email.enabled}>
          <div className="space-y-4">
            <FormField label="Enabled" id="hermes-email-enabled">
              <Toggle
                id="hermes-email-enabled"
                checked={channels.email.enabled}
                onChange={(checked) => updateChannel('email', { enabled: checked })}
              />
            </FormField>

            {channels.email.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Address" id="hermes-email-address">
                  <Input
                    type="text"
                    value={channels.email.address}
                    onChange={(e) => updateChannel('email', { address: e.target.value })}
                  />
                </FormField>

                <FormField label="Password" id="hermes-email-password">
                  <div className="relative">
                    <PasswordInput
                      value={channels.email.password}
                      onChange={(e) => updateChannel('email', { password: e.target.value })}
                    />
                    {channels.email.password && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.email.password} />
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="IMAP Host" id="hermes-email-imap-host">
                  <Input
                    type="text"
                    value={channels.email.imap_host}
                    onChange={(e) => updateChannel('email', { imap_host: e.target.value })}
                  />
                </FormField>

                <FormField label="SMTP Host" id="hermes-email-smtp-host">
                  <Input
                    type="text"
                    value={channels.email.smtp_host}
                    onChange={(e) => updateChannel('email', { smtp_host: e.target.value })}
                  />
                </FormField>

                <FormField label="IMAP Port" id="hermes-email-imap-port">
                  <Input
                    type="number"
                    value={channels.email.imap_port}
                    onChange={(e) => updateChannel('email', { imap_port: Number(e.target.value) })}
                  />
                </FormField>

                <FormField label="SMTP Port" id="hermes-email-smtp-port">
                  <Input
                    type="number"
                    value={channels.email.smtp_port}
                    onChange={(e) => updateChannel('email', { smtp_port: Number(e.target.value) })}
                  />
                </FormField>

                <FormField label="Poll Interval (s)" id="hermes-email-poll-interval">
                  <Input
                    type="number"
                    value={channels.email.poll_interval}
                    onChange={(e) => updateChannel('email', { poll_interval: Number(e.target.value) })}
                  />
                </FormField>

                <FormField label="Home Address" id="hermes-email-home-address">
                  <Input
                    type="text"
                    value={channels.email.home_address}
                    onChange={(e) => updateChannel('email', { home_address: e.target.value })}
                  />
                </FormField>

                <FormField label="Home Address Name" id="hermes-email-home-address-name">
                  <Input
                    type="text"
                    value={channels.email.home_address_name}
                    onChange={(e) => updateChannel('email', { home_address_name: e.target.value })}
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Allowed Users" id="hermes-email-allowed-users">
                    <ChipInput
                      value={channels.email.allowed_users || []}
                      onChange={(allowed_users) => updateChannel('email', { allowed_users })}
                      placeholder="Add Email and press Enter"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Allow All Users" id="hermes-email-allow-all-users">
                    <Toggle
                      id="hermes-email-allow-all-users"
                      checked={channels.email.allow_all_users}
                      onChange={(checked) => updateChannel('email', { allow_all_users: checked })}
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Home Assistant" collapsible defaultOpen={channels.homeassistant.enabled}>
          <div className="space-y-4">
            <FormField label="Enabled" id="hermes-homeassistant-enabled">
              <Toggle
                id="hermes-homeassistant-enabled"
                checked={channels.homeassistant.enabled}
                onChange={(checked) => updateChannel('homeassistant', { enabled: checked })}
              />
            </FormField>

            {channels.homeassistant.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="URL" id="hermes-homeassistant-url">
                  <Input
                    type="text"
                    value={channels.homeassistant.url}
                    onChange={(e) => updateChannel('homeassistant', { url: e.target.value })}
                    placeholder="http://homeassistant.local:8123"
                  />
                </FormField>

                <FormField label="Token" id="hermes-homeassistant-token">
                  <div className="relative">
                    <PasswordInput
                      value={channels.homeassistant.token}
                      onChange={(e) => updateChannel('homeassistant', { token: e.target.value })}
                      placeholder="Long-Lived Access Token"
                    />
                    {channels.homeassistant.token && (
                      <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <CopyButton text={channels.homeassistant.token} />
                      </div>
                    )}
                  </div>
                </FormField>
              </div>
            )}
          </div>
        </FormSection>

      </div>
    </div>
  );
}
