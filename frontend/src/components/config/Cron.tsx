import type { AppConfig } from '../../types/config';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ExtendedCronConfig {
  exec_timeout_minutes: number;
  jobs?: Array<{ schedule: string; command: string }>;
}

interface Props {
  config: AppConfig;
  backend: 'picoclaw' | 'hermes';
  onChange: (path: string, value: unknown) => void;
}

export function Cron({ config, onChange }: Props) {
  const cronConfig = config.tools.cron as unknown as ExtendedCronConfig;
  const jobs = cronConfig.jobs || [];

  const updateJob = (index: number, field: string, value: string) => {
    const newJobs = [...jobs];
    const updatedJob = { ...newJobs[index] };
    if (field === 'schedule') {
      updatedJob.schedule = value;
    } else if (field === 'command') {
      updatedJob.command = value;
    }
    newJobs[index] = updatedJob;
    onChange('tools.cron.jobs', newJobs);
  };

  const addJob = () => {
    onChange('tools.cron.jobs', [...jobs, { schedule: '', command: '' }]);
  };

  const removeJob = (index: number) => {
    const newJobs = [...jobs];
    newJobs.splice(index, 1);
    onChange('tools.cron.jobs', newJobs);
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Cron</h2>
      <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Execution Timeout (minutes)
            </label>
            <Input
              type="number"
              min="0"
              value={config.tools.cron.exec_timeout_minutes}
              onChange={(e) => onChange('tools.cron.exec_timeout_minutes', Number(e.target.value))}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Execution timeout in minutes. 0 = no limit.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Cron Jobs</h3>
            <Button type="button" size="sm" onClick={addJob} variant="secondary">
              + Add Job
            </Button>
          </div>
          
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Schedule</label>
                  <Input
                    type="text"
                    value={job.schedule}
                    onChange={(e) => updateJob(index, 'schedule', e.target.value)}
                    placeholder="* * * * *"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-xs text-gray-500 mb-1">Command</label>
                  <Input
                    type="text"
                    value={job.command}
                    onChange={(e) => updateJob(index, 'command', e.target.value)}
                    placeholder="echo 'hello'"
                  />
                </div>
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => removeJob(index)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                    title="Remove Job"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No cron jobs configured.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
