import { useMemo } from 'react'
import { useAuditQuery } from '../../hooks/useAudit'

export function SkillsMCPPanel() {
  const { data: audit } = useAuditQuery()

  const skills = useMemo(() => audit?.skills ?? [], [audit?.skills])
  const mcp = useMemo(() => audit?.mcp_servers ?? [], [audit?.mcp_servers])

  const skillsDisplay = useMemo(
    () => skills.slice(0, 6),
    [skills]
  )
  const skillsOverflow = skills.length > 6 ? skills.length - 6 : 0

  const mcpDisplay = useMemo(
    () => mcp.slice(0, 6),
    [mcp]
  )
  const mcpOverflow = mcp.length > 6 ? mcp.length - 6 : 0

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Skills &amp; Extensions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🧠 Skills
            </span>
            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {skills.length}
            </span>
          </div>

          {skills.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No skills installed
            </p>
          ) : (
            <ul className="space-y-1.5">
              {skillsDisplay.map((skill) => (
                <li
                  key={skill.name}
                  className="flex flex-col p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {skill.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    v{skill.version}
                  </span>
                </li>
              ))}
              {skillsOverflow > 0 && (
                <li className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                  +{skillsOverflow} more
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="hidden sm:block border-l border-gray-200 dark:border-gray-700" />

        <div className="sm:pl-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              🔌 MCP Servers
            </span>
            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
              {mcp.length}
            </span>
          </div>

          {mcp.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No MCP servers configured
            </p>
          ) : (
            <ul className="space-y-1.5">
              {mcpDisplay.map((server) => (
                <li
                  key={server.name}
                  className="flex flex-col p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                      {server.name}
                    </span>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded whitespace-nowrap">
                      {server.type}
                    </span>
                  </div>
                </li>
              ))}
              {mcpOverflow > 0 && (
                <li className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1">
                  +{mcpOverflow} more
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
