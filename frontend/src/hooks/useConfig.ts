import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfig, saveConfig } from '../api/client'
import type { AppConfig } from '../types/config'

export function useConfigQuery() {
  return useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
  })
}

export function useSaveConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<AppConfig> & { _restartGateway: boolean }) =>
      saveConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })
}
