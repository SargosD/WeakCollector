import { createContext, useContext, useEffect } from 'react'
import type { OperationContext } from 'urql'
import type { Reading } from '@/types/readings'

export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting' | 'offline'

export type PollStoredMessage = {
  pollId: string
  polledAt: string
  readings: Omit<Reading, 'polledAt'>[]
}

export type PollUpdates = {
  status: ConnectionStatus
  lastPoll: PollStoredMessage | null
  resync: number
}

export const InitialPollUpdates: PollUpdates = {
  status: 'connecting',
  lastPoll: null,
  resync: 0,
}

export const PollUpdatesContext = createContext<PollUpdates>(InitialPollUpdates)

export function usePollUpdates(): PollUpdates {
  return useContext(PollUpdatesContext)
}

export function useRefetchOnPoll(
  reexecute: (context?: Partial<OperationContext>) => void,
  enabled = true,
) {
  const { lastPoll, resync } = usePollUpdates()
  const polledAt = lastPoll?.polledAt

  useEffect(() => {
    if ((polledAt !== undefined || resync > 0) && enabled) {
      reexecute({ requestPolicy: 'network-only' })
    }
  }, [polledAt, resync, enabled, reexecute])
}
