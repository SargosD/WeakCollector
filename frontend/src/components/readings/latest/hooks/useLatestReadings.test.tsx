import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import type { Reading } from '@/components/readings/types'
import { LastPollContext, type PollStoredMessage } from '@/realtime/context/lastPollContext'
import { MeasurementValueType } from '@/types/graphql'
import { useLatestReadings } from './useLatestReadings'

function reading(
  id: number,
  location: string,
  type = 'energy',
  polledAt = '2026-11-20T12:00:00Z',
): Reading {
  return {
    id,
    location,
    type,
    polledAt,
    measurements: [{ name: 'energy', value: '1', valueType: MeasurementValueType.Number }],
  }
}

function poll(polledAt: string): PollStoredMessage {
  return {
    pollId: 'poll',
    polledAt,
    readings: [
      {
        id: 1,
        location: 'Office',
        type: 'energy',
        measurements: [{ name: 'energy', value: '1', valueType: MeasurementValueType.Number }],
      },
      {
        id: 2,
        location: 'Garage',
        type: 'energy',
        measurements: [{ name: 'energy', value: '1', valueType: MeasurementValueType.Number }],
      },
    ],
  }
}

function renderLatestReadings(queried: Reading[] | undefined, lastPoll: PollStoredMessage | null) {
  return renderHook(() => useLatestReadings(queried), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <LastPollContext.Provider value={lastPoll}>{children}</LastPollContext.Provider>
    ),
  })
}

describe('useLatestReadings', () => {
  it('returns the queried readings before the first poll', () => {
    const queried = [reading(1, 'Kitchen')]

    const { result } = renderLatestReadings(queried, null)

    expect(result.current.readings).toEqual(queried)
    expect(result.current.hasData).toBe(true)
  })

  it('has no data until the query loads or a poll arrives', () => {
    const { result } = renderLatestReadings(undefined, null)

    expect(result.current.readings).toEqual([])
    expect(result.current.hasData).toBe(false)
  })

  it('applies a newer poll with its time, sorted by location', () => {
    const { result } = renderLatestReadings([reading(1, 'Kitchen')], poll('2026-11-20T12:01:00Z'))

    expect(result.current.readings).toEqual([
      reading(2, 'Garage', 'energy', '2026-11-20T12:01:00Z'),
      reading(1, 'Office', 'energy', '2026-11-20T12:01:00Z'),
    ])
    expect(result.current.hasData).toBe(true)
  })

  it('applies a poll before the query has loaded', () => {
    const { result } = renderLatestReadings(undefined, poll('2026-11-20T12:01:00Z'))

    expect(result.current.readings).toHaveLength(2)
    expect(result.current.hasData).toBe(true)
  })

  it('keeps the queried readings when the poll is not newer', () => {
    const queried = [reading(1, 'Kitchen', 'energy', '2026-11-20T12:01:00Z')]

    const { result } = renderLatestReadings(queried, poll('2026-11-20T12:01:00Z'))

    expect(result.current.readings).toEqual(queried)
  })
})
