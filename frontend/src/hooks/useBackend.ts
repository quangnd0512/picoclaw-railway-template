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
    mutationFn: async (backend: 'picoclaw' | 'hermes') => {
      await setBackend(backend)
      return backend
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['config'] })
      await queryClient.invalidateQueries({ queryKey: ['backend'] })
      await queryClient.refetchQueries({ queryKey: ['config'], exact: true })
    },
  })
}
