
interface TabNavProps {
  activeTab: 'config' | 'status';
  onTabChange: (tab: 'config' | 'status') => void;
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onTabChange('config')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
            activeTab === 'config'
              ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Configuration
        </button>
        <button
          type="button"
          onClick={() => onTabChange('status')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
            activeTab === 'status'
              ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Status
        </button>
      </div>
    </div>
  );
};
