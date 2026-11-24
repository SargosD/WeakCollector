import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContext } from 'react'
import { LastPollContext } from './lastPollContext'
import { LastPollProvider } from './LastPollProvider'

const fake = vi.hoisted(() => {
  const events = new Map<string, (...args: unknown[]) => void>()

  return {
    events,
    connection: {
      on: (name: string, handler: (...args: unknown[]) => void) => events.set(name, handler),
      start: vi.fn(() => Promise.resolve()),
      stop: vi.fn(() => Promise.resolve()),
    },
  }
})

vi.mock('@microsoft/signalr', () => ({
  LogLevel: { Warning: 3 },
  HubConnectionBuilder: class {
    withUrl() {
      return this
    }

    withAutomaticReconnect() {
      return this
    }

    configureLogging() {
      return this
    }

    build() {
      return fake.connection
    }
  },
}))

function Probe() {
  const lastPoll = useContext(LastPollContext)

  return <output>{[lastPoll?.polledAt ?? '-', lastPoll?.readings.length ?? '-'].join('|')}</output>
}

function poll(polledAt: string, readingCount = 1) {
  return {
    pollId: 'poll',
    polledAt,
    readings: Array.from({ length: readingCount }, (_, index) => ({
      id: index + 1,
      location: `Room ${index + 1}`,
      type: 'energy',
      measurements: [{ name: 'energy', value: '418.67', valueType: 'NUMBER' }],
    })),
  }
}

function emit(event: string, ...args: unknown[]) {
  act(() => fake.events.get(event)?.(...args))
}

function renderProvider() {
  render(
    <LastPollProvider>
      <Probe />
    </LastPollProvider>,
  )
}

describe('LastPollProvider', () => {
  beforeEach(() => {
    fake.events.clear()
    fake.connection.start.mockClear()
  })

  it('has no poll before the first message', () => {
    renderProvider()

    expect(screen.getByRole('status')).toHaveTextContent('-|-')
  })

  it('takes the readings and time of a new poll', () => {
    renderProvider()

    emit('pollStored', poll('2026-11-24T12:26:00Z'))

    expect(screen.getByRole('status')).toHaveTextContent('2026-11-24T12:26:00Z|1')
  })

  it('ignores a poll that is not newer than the last one', () => {
    renderProvider()

    emit('pollStored', poll('2026-11-24T12:26:00Z'))
    emit('pollStored', poll('2026-11-24T12:25:00Z', 2))
    emit('pollStored', poll('2026-11-24T12:26:00Z', 3))

    expect(screen.getByRole('status')).toHaveTextContent('2026-11-24T12:26:00Z|1')
  })
})
