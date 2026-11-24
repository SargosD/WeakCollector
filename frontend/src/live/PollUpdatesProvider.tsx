import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { type ReactNode, useEffect, useState } from 'react'
import {
  InitialPollUpdates,
  type PollStoredMessage,
  type PollUpdates,
  PollUpdatesContext,
} from './pollUpdates'

const HubUrl = '/hubs/polls'

export function PollUpdatesProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState(InitialPollUpdates)

  useEffect(() => {
    let active = true
    const update = (change: (current: PollUpdates) => PollUpdates) => {
      if (active) {
        setUpdates(change)
      }
    }

    const connection = new HubConnectionBuilder()
      .withUrl(HubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on('pollStored', (poll: PollStoredMessage) =>
      update((c) =>
        c.lastPoll && Date.parse(poll.polledAt) <= Date.parse(c.lastPoll.polledAt)
          ? c
          : { ...c, lastPoll: poll },
      ),
    )
    connection.onreconnecting(() => update((c) => ({ ...c, status: 'reconnecting' })))
    connection.onreconnected(() => update((c) => ({ ...c, status: 'live', resync: c.resync + 1 })))
    connection.onclose(() => update((c) => ({ ...c, status: 'offline' })))

    connection.start().then(
      () => update((c) => ({ ...c, status: 'live' })),
      () => update((c) => ({ ...c, status: 'offline' })),
    )

    return () => {
      active = false
      void connection.stop()
    }
  }, [])

  return <PollUpdatesContext.Provider value={updates}>{children}</PollUpdatesContext.Provider>
}
