import { useQuery } from '@tanstack/react-query'
import { getStatus } from '../api/client'

export function useStatusQuery() {
  return useQuery({
    queryKey: ['status'],
    queryFn: getStatus,
    refetchInterval: 5000,
  })
}
