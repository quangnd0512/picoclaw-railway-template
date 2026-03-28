import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { FormField } from '../ui/FormField';

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export function Skills({ config, onChange }: Props) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Skills</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">ClawHub Registry</h3>
          <Toggle
            checked={config.tools.skills.registries.clawhub.enabled}
            onChange={(checked) => onChange('tools.skills.registries.clawhub.enabled', checked)}
          />
        </div>
        {config.tools.skills.registries.clawhub.enabled && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <FormField label="Base URL" id="base-url">
               <Input
                 type="text"
                 icon={<LinkIcon />}
                 value={config.tools.skills.registries.clawhub.base_url || ''}
                 onChange={(e) => onChange('tools.skills.registries.clawhub.base_url', e.target.value)}
               />
             </FormField>
             <FormField label="Search Path" id="search-path">
               <Input
                 type="text"
                 icon={<SearchIcon />}
                 value={config.tools.skills.registries.clawhub.search_path || ''}
                 onChange={(e) => onChange('tools.skills.registries.clawhub.search_path', e.target.value)}
               />
             </FormField>
             <FormField label="Skills Path" id="skills-path">
               <Input
                 type="text"
                 icon={<FolderIcon />}
                 value={config.tools.skills.registries.clawhub.skills_path || ''}
                 onChange={(e) => onChange('tools.skills.registries.clawhub.skills_path', e.target.value)}
               />
             </FormField>
             <FormField label="Download Path" id="download-path">
               <Input
                 type="text"
                 icon={<DownloadIcon />}
                 value={config.tools.skills.registries.clawhub.download_path || ''}
                 onChange={(e) => onChange('tools.skills.registries.clawhub.download_path', e.target.value)}
               />
             </FormField>
           </div>
         )}
      </div>
    </section>
  );
}
