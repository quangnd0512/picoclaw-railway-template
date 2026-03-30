import { AuditCronJobs } from '../audit/AuditCronJobs'
import { AuditTools } from '../audit/AuditTools'
import { AuditSkills } from '../audit/AuditSkills'
import { AuditMcpServers } from '../audit/AuditMcpServers'
import { AuditSessions } from '../audit/AuditSessions'
import { useAuditQuery } from '../../hooks/useAudit'

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${accent}`} aria-hidden="true" />
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  )
}

export function AuditTab() {
  const { data } = useAuditQuery()
  const backend = data?.backend ?? 'picoclaw'
  const cronCount = data?.cron?.jobs?.length ?? 0
  const toolsCount = Object.keys(data?.tools ?? {}).length
  const skillsCount = data?.skills?.length ?? 0
  const mcpCount = data?.mcp_servers?.length ?? 0
  const sessionsCount = data?.sessions?.length ?? 0

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-blue-50 via-white to-sky-50 dark:from-blue-950/40 dark:via-gray-900 dark:to-sky-950/40 border border-blue-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">System Audit</p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
              Runtime Insights
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Snapshot of cron jobs, tools, skills, MCP servers, and sessions for the current backend.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-medium bg-white/70 border border-blue-200 text-blue-700 dark:bg-gray-900/70 dark:border-gray-700 dark:text-blue-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Backend: {backend}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Cron Jobs" value={cronCount} accent="bg-blue-500" />
        <StatCard label="Tools" value={toolsCount} accent="bg-emerald-500" />
        <StatCard label="Skills" value={skillsCount} accent="bg-violet-500" />
        <StatCard label="MCP Servers" value={mcpCount} accent="bg-cyan-500" />
        <StatCard label="Sessions" value={sessionsCount} accent="bg-amber-500" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AuditCronJobs />
          <AuditTools />
          <AuditSkills />
        </div>
        <div className="space-y-6">
          <AuditMcpServers />
          <AuditSessions />
        </div>
      </section>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Data refreshes every 30 seconds and updates immediately when switching backend.
      </div>
    </div>
  )
}
