import { useState, useEffect } from 'react';
import { useConfigQuery, useSaveConfig } from './hooks/useConfig';
import { useBackendQuery } from './hooks/useBackend';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';
import type { AppConfig } from './types/config';
import { Sidebar } from './components/layout/Sidebar';
import { Button } from './components/ui/Button';

import { ProvidersTab } from './components/tabs/ProvidersTab';
import { ChannelsTab } from './components/tabs/ChannelsTab';
import { AgentDefaultsTab } from './components/tabs/AgentDefaultsTab';
import { WebSearchTab } from './components/tabs/WebSearchTab';
import { McpTab } from './components/tabs/McpTab';
import { ExecToolTab } from './components/tabs/ExecToolTab';
import { CronTab } from './components/tabs/CronTab';
import { SkillsTab } from './components/tabs/SkillsTab';
import { SystemSettingsTab } from './components/tabs/SystemSettingsTab';
import { StatusTabWrapper } from './components/tabs/StatusTabWrapper';

import { FloatingApplyButton } from './components/FloatingApplyButton';
import { ReviewChangesModal } from './components/ReviewChangesModal';

export type TabType = 'providers' | 'channels' | 'agent' | 'websearch' | 'mcp' | 'exec' | 'cron' | 'skills' | 'system' | 'status';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('providers');
  const { data: configData, isLoading: isLoadingConfig } = useConfigQuery();
  const { data: backendData, isLoading: isLoadingBackend } = useBackendQuery();
  const { mutate: saveConfig, isPending: isSaving } = useSaveConfig();

  const [localConfig, setLocalConfig] = useState<AppConfig | null>(null);
  const [lastLoadedConfigString, setLastLoadedConfigString] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  if (configData) {
    const configString = JSON.stringify(configData);
    if (configString !== lastLoadedConfigString) {
      setLastLoadedConfigString(configString);
      setLocalConfig(JSON.parse(configString));
    }
  }

  const { isDirty, changeCount, dirtySections } = useUnsavedChanges(localConfig, configData ?? null);

  // Preserve dark mode initialization exactly as in original implementation
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyDarkMode = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => applyDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const backend = backendData?.backend;
  const isPageLoading = isLoadingConfig || isLoadingBackend;
  const showLoadingOverlay = isPageLoading || isSaving;

  // Reset activeTab if it's 'exec' and backend is 'hermes' (Exec Tool is PicoClaw only)
  useEffect(() => {
    if (backend === 'hermes' && activeTab === 'exec') {
      setActiveTab('providers');
    }
  }, [backend, activeTab]);

  const handleConfigChangePath = (path: string, value: unknown) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      const newConfig = { ...prev };
      const keys = path.split('.');
      const lastKey = keys.pop();
      if (!lastKey) return prev;
      
      let current: Record<string, unknown> = newConfig as unknown as Record<string, unknown>;
      for (const key of keys) {
        current[key] = { ...((current[key] as Record<string, unknown>) || {}) };
        current = current[key] as Record<string, unknown>;
      }
      current[lastKey] = value;
      return newConfig as AppConfig;
    });
  };

  const handleConfigChangeFull = (newConfig: AppConfig) => {
    setLocalConfig(newConfig);
  };

  const handleApplyClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);
  const handleApplyChanges = () => {
    setIsModalOpen(false);
    setShowRestartConfirm(true);
  };

  const handleConfirmSave = (restart: boolean) => {
    if (!localConfig) return;
    saveConfig({ ...localConfig, _restartGateway: restart }, {
      onSuccess: () => {
        setShowRestartConfirm(false);
      }
    });
  };

  const renderTabContent = () => {
    if (!localConfig || !backend) return null;

    switch (activeTab) {
      case 'providers':
        return <ProvidersTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'channels':
        return <ChannelsTab config={localConfig} backend={backend as any} onChange={handleConfigChangeFull} />;
      case 'agent':
        return <AgentDefaultsTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'websearch':
        return <WebSearchTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'mcp':
        return <McpTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'exec':
        return <ExecToolTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'cron':
        return <CronTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'skills':
        return <SkillsTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'system':
        return <SystemSettingsTab config={localConfig} backend={backend as any} onChange={handleConfigChangePath} />;
      case 'status':
        return <StatusTabWrapper />;
      default:
        return <div className="text-gray-500 dark:text-gray-400">Select a tab from the sidebar</div>;
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen flex relative">
      {showLoadingOverlay && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50/50 dark:bg-gray-950/50 z-[60]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {isSaving ? 'Saving configuration...' : 'Loading configuration...'}
            </p>
          </div>
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backend={backend}
        dirtySections={dirtySections}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-32">
          {renderTabContent()}
        </div>
      </main>

      <FloatingApplyButton
        isDirty={isDirty}
        changeCount={changeCount}
        onClick={handleApplyClick}
      />

      <ReviewChangesModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        dirtySections={dirtySections}
        onApply={handleApplyChanges}
      />

      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={() => !isSaving && setShowRestartConfirm(false)} />
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 relative flex flex-col z-10 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Restart Gateway?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Do you want to restart the gateway after saving? This ensures your new configuration takes effect immediately.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => handleConfirmSave(false)}
                disabled={isSaving}
              >
                No, just save
              </Button>
              <Button
                variant="primary"
                onClick={() => handleConfirmSave(true)}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Yes, restart'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
