import { SessionVolumeChart } from '../dashboard/SessionVolumeChart'
import { MessagesPerSessionChart } from '../dashboard/MessagesPerSessionChart'
import { HealthMatrix } from '../dashboard/HealthMatrix'
import { GatewayKPIs } from '../dashboard/GatewayKPIs'
import { ToolsDonut } from '../dashboard/ToolsDonut'
import { ActivityCalendar } from '../dashboard/ActivityCalendar'
import { SessionTrendChart } from '../dashboard/SessionTrendChart'
import { WeeklyPatternChart } from '../dashboard/WeeklyPatternChart'
import { SkillsMCPPanel } from '../dashboard/SkillsMCPPanel'
import { CronJobsPanel } from '../dashboard/CronJobsPanel'

export function DashboardTab() {
  return (
    <div className="space-y-4">
      {/* Header — unchanged */}
      <section className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-blue-950/40 dark:via-gray-900 dark:to-indigo-950/40 border border-blue-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
          Overview
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          App usage overview — sessions, message activity, and system health.
        </p>
      </section>

      {/* KPIs — unchanged */}
      <GatewayKPIs />

      {/* Section: Activity */}
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mt-2">Activity</p>
      <ActivityCalendar />

      {/* Section: Trends */}
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mt-2">Trends</p>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SessionTrendChart />
        <WeeklyPatternChart />
      </section>

      {/* Section: Sessions */}
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mt-2">Sessions</p>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SessionVolumeChart />
        <MessagesPerSessionChart />
      </section>

      {/* Section: System */}
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mt-2">System</p>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HealthMatrix />
        <ToolsDonut />
      </section>

      {/* Section: Configuration */}
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mt-2">Configuration</p>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SkillsMCPPanel />
        <CronJobsPanel />
      </section>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Data refreshes automatically. Audit data: every 30s · Status data: every 5s.
        </p>
      </div>
    </div>
  )
}
