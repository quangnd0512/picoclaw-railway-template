import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBackend, setBackend } from '../api/client'

export function useBackendQuery() {
  return useQuery({
    queryKey: ['backend'],
    queryFn: getBackend,
  })
}

export function useSwitchBackend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (backend: 'picoclaw' | 'hermes') => setBackend(backend),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
      queryClient.invalidateQueries({ queryKey: ['backend'] })
    },
  })
}
