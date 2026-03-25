import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listPairings,
  approvePairing,
  revokePairing,
  clearPendingPairings,
} from '../api/client'

export function usePairingList() {
  return useQuery({
    queryKey: ['pairings'],
    queryFn: listPairings,
    enabled: false,
  })
}

export function useApprovePairing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ platform, code }: { platform: string; code: string }) => approvePairing(platform, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] })
    },
  })
}

export function useRevokePairing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ platform, userId }: { platform: string; userId: string }) => revokePairing(platform, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] })
    },
  })
}

export function useClearPendingPairings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => clearPendingPairings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pairings'] })
    },
  })
}
