import { useContext, useEffect } from 'react'
import type { OperationContext } from 'urql'
import { LastPollContext } from '@/realtime/context/lastPollContext'

export function useRefetchOnPoll(
  reexecute: (context?: Partial<OperationContext>) => void,
  enabled = true,
) {
  const polledAt = useContext(LastPollContext)?.polledAt

  useEffect(() => {
    if (polledAt !== undefined && enabled) {
      reexecute({ requestPolicy: 'network-only' })
    }
  }, [polledAt, enabled, reexecute])
}
