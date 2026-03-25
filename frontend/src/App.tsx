import { useState, useEffect } from 'react';
import { TabNav } from './components/layout/TabNav';
import { ConfigTab } from './components/ConfigTab';
import { StatusTab } from './components/StatusTab';

function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'status'>('config');

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

  return (
    <div className="bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦐</span>
            <h1 className="text-2xl font-bold tracking-tight">KKV Claw</h1>
          </div>
        </header>

        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'config' && <ConfigTab />}
        {activeTab === 'status' && <StatusTab />}
      </div>
    </div>
  );
}

export default App;
