import { useQuery } from '@tanstack/react-query'
import { getAudit } from '../api/client'

export function useAuditQuery() {
  return useQuery({
    queryKey: ['audit'],
    queryFn: getAudit,
    refetchInterval: 30_000,
  })
}
