import { useAuditQuery } from '../../hooks/useAudit';

export function AuditSkills() {
  const { data } = useAuditQuery();
  const skills = data?.skills ?? [];
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">
        Skills
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          ({skills.length})
        </span>
      </h2>

      {skills.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No skills installed.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 first:pt-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {skill.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {skill.description}
                  </p>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded whitespace-nowrap">
                  {skill.version}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
