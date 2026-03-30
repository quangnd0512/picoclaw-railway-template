import type { TabType } from '../../App';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  backend?: 'picoclaw' | 'hermes';
  dirtySections: string[];
}

const TAB_TO_CONFIG_SECTIONS: Record<TabType, string[]> = {
  providers: ['providers'],
  channels: ['channels'],
  agent: ['agents'],
  websearch: ['tools.web'],
  mcp: ['tools.mcp'],
  exec: ['tools.exec'],
  cron: ['tools.cron'],
  skills: ['tools.skills'],
  system: ['gateway', 'heartbeat', 'devices', 'hermes'],
  status: [],
  audit: [],
};

export function Sidebar({ activeTab, onTabChange, backend, dirtySections }: SidebarProps) {
  const isTabDirty = (tabId: TabType): boolean => {
    const configSections = TAB_TO_CONFIG_SECTIONS[tabId];
    return configSections.some((section) => dirtySections.includes(section));
  };

  const tabs: { id: TabType; label: string; icon: string; hideOnHermes?: boolean }[] = [
    { id: 'status', label: 'Status', icon: '📊' },
    { id: 'audit', label: 'Audit', icon: '🔍' },
    { id: 'providers', label: 'Providers', icon: '🔑' },
    { id: 'channels', label: 'Channels', icon: '📡' },
    { id: 'agent', label: 'Agent Defaults', icon: '🤖' },
    { id: 'websearch', label: 'Web Search', icon: '🔍' },
    { id: 'mcp', label: 'MCP Servers', icon: '🔌' },
    { id: 'exec', label: 'Exec Tool', icon: '⚡', hideOnHermes: true },
    { id: 'cron', label: 'Cron Jobs', icon: '⏰' },
    { id: 'skills', label: 'Skills', icon: '🛠️' },
    { id: 'system', label: 'System Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col h-screen overflow-hidden">
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label="logo">🦐</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {backend === 'hermes' ? 'Hermes Claw' : 'PicoClaw'}
          </h1>
        </div>
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role */}
      <nav className="flex-1 flex flex-col gap-1" role="tablist" aria-label="Configuration tabs">
        {tabs.map((tab) => {
          if (tab.hideOnHermes && backend === 'hermes') {
            return null;
          }

          const isActive = activeTab === tab.id;
          const isDirty = isTabDirty(tab.id);

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm motion-safe:transition-colors motion-safe:duration-150 text-left w-full ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg" role="img" aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </span>
              {isDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
