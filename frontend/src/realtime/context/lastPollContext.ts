import { createContext } from 'react'
import type { Reading } from '@/components/readings/types'

export type PollStoredMessage = {
  pollId: string
  polledAt: string
  readings: Omit<Reading, 'polledAt'>[]
}

export const LastPollContext = createContext<PollStoredMessage | null>(null)
