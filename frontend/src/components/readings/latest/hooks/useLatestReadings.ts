import { useContext, useMemo } from 'react'
import type { Reading } from '@/components/readings/types'
import { LastPollContext } from '@/realtime/context/lastPollContext'

export function useLatestReadings(queried: Reading[] | undefined) {
  const lastPoll = useContext(LastPollContext)

  return useMemo(() => {
    const readings = queried ?? []
    const hasData = queried !== undefined

    if (lastPoll === null) {
      return { readings, hasData }
    }

    const pushed = lastPoll.readings
      .map((reading) => ({ ...reading, polledAt: lastPoll.polledAt }))
      .sort((a, b) => a.location.localeCompare(b.location) || a.type.localeCompare(b.type))

    const pushedIsNewer =
      readings.length === 0 || Date.parse(lastPoll.polledAt) > Date.parse(readings[0].polledAt)

    return pushedIsNewer ? { readings: pushed, hasData: true } : { readings, hasData }
  }, [queried, lastPoll])
}
