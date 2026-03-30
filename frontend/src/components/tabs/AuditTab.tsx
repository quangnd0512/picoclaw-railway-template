import { AuditCronJobs } from '../audit/AuditCronJobs';
import { AuditTools } from '../audit/AuditTools';
import { AuditSkills } from '../audit/AuditSkills';
import { AuditMcpServers } from '../audit/AuditMcpServers';
import { AuditSessions } from '../audit/AuditSessions';

export function AuditTab() {
  return (
    <div className="space-y-6">
      <AuditCronJobs />
      <AuditTools />
      <AuditSkills />
      <AuditMcpServers />
      <AuditSessions />
    </div>
  );
}
