import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { type ReactNode, useEffect, useState } from 'react'
import { LastPollContext, type PollStoredMessage } from './lastPollContext'

const HubUrl = '/hubs/polls'

export function LastPollProvider({ children }: { children: ReactNode }) {
  const [lastPoll, setLastPoll] = useState<PollStoredMessage | null>(null)

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('pollStored', (poll: PollStoredMessage) =>
      setLastPoll((current) =>
        current && Date.parse(poll.polledAt) <= Date.parse(current.polledAt) ? current : poll,
      ),
    )

    connection.start().catch(() => undefined)

    return () => {
      void connection.stop()
    }
  }, [])

  return <LastPollContext.Provider value={lastPoll}>{children}</LastPollContext.Provider>
}
