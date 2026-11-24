import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePollUpdates } from './pollUpdates'
import { PollUpdatesProvider } from './PollUpdatesProvider'

const fake = vi.hoisted(() => {
  const events = new Map<string, (...args: unknown[]) => void>()

  return {
    events,
    connection: {
      on: (name: string, handler: (...args: unknown[]) => void) => events.set(name, handler),
      onreconnecting: (handler: () => void) => events.set('reconnecting', handler),
      onreconnected: (handler: () => void) => events.set('reconnected', handler),
      onclose: (handler: () => void) => events.set('close', handler),
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
  const { status, resync, lastPoll } = usePollUpdates()

  return (
    <output>
      {[status, resync, lastPoll?.polledAt ?? '-', lastPoll?.readings.length ?? '-'].join('|')}
    </output>
  )
}

function poll(polledAt: string, readingCount = 1) {
  return {
    pollId: 'poll',
    polledAt,
    readings: Array.from({ length: readingCount }, (_, index) => ({
      id: index + 1,
      location: `Room ${index + 1}`,
      type: 'energy',
      measurements: [{ id: index + 1, name: 'energy', value: '418.67', valueType: 'NUMBER' }],
    })),
  }
}

function emit(event: string, ...args: unknown[]) {
  act(() => fake.events.get(event)?.(...args))
}

async function renderProvider() {
  render(
    <PollUpdatesProvider>
      <Probe />
    </PollUpdatesProvider>,
  )
  await screen.findByText(/^live\|/)
}

describe('PollUpdatesProvider', () => {
  beforeEach(() => {
    fake.events.clear()
    fake.connection.start.mockClear()
  })

  it('is live once the connection starts', async () => {
    await renderProvider()

    expect(screen.getByRole('status')).toHaveTextContent('live|0|-|-')
  })

  it('takes the readings and time of a new poll', async () => {
    await renderProvider()

    emit('pollStored', poll('2026-11-24T12:26:00Z'))

    expect(screen.getByRole('status')).toHaveTextContent('live|0|2026-11-24T12:26:00Z|1')
  })

  it('ignores a poll that is not newer than the last one', async () => {
    await renderProvider()

    emit('pollStored', poll('2026-11-24T12:26:00Z'))
    emit('pollStored', poll('2026-11-24T12:25:00Z', 2))
    emit('pollStored', poll('2026-11-24T12:26:00Z', 3))

    expect(screen.getByRole('status')).toHaveTextContent('live|0|2026-11-24T12:26:00Z|1')
  })

  it('counts a reconnect so sections catch up', async () => {
    await renderProvider()

    emit('reconnecting')
    expect(screen.getByRole('status')).toHaveTextContent(/^reconnecting\|0/)

    emit('reconnected')
    expect(screen.getByRole('status')).toHaveTextContent(/^live\|1/)
  })

  it('is offline when the connection closes', async () => {
    await renderProvider()

    emit('close')

    expect(screen.getByRole('status')).toHaveTextContent(/^offline\|/)
  })

  it('is offline when the connection cannot start', async () => {
    fake.connection.start.mockImplementationOnce(() => Promise.reject(new Error('down')))

    render(
      <PollUpdatesProvider>
        <Probe />
      </PollUpdatesProvider>,
    )

    expect(await screen.findByText(/^offline\|/)).toBeInTheDocument()
  })
})
