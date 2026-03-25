import { useQuery } from '@tanstack/react-query'
import { getLogs } from '../api/client'

export function useLogsQuery() {
  return useQuery({
    queryKey: ['logs'],
    queryFn: getLogs,
    refetchInterval: 3000,
  })
}
