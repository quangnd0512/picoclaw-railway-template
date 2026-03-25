import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startGateway, stopGateway, restartGateway } from '../api/client'

export function useStartGateway() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => startGateway(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
  })
}

export function useStopGateway() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => stopGateway(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
  })
}

export function useRestartGateway() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => restartGateway(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
  })
}
