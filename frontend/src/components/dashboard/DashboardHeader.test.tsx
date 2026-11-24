import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InitialPollUpdates, type PollUpdates, PollUpdatesContext } from '@/live/pollUpdates'
import { DashboardHeader } from './DashboardHeader'

function renderHeader(updates: Partial<PollUpdates> = {}) {
  render(
    <PollUpdatesContext.Provider value={{ ...InitialPollUpdates, ...updates }}>
      <DashboardHeader />
    </PollUpdatesContext.Provider>,
  )
}

describe('DashboardHeader', () => {
  it('renders the title', () => {
    renderHeader()

    expect(screen.getByRole('heading', { name: 'WeakCollector' })).toBeInTheDocument()
  })

  it.each([
    ['connecting', 'Connecting…'],
    ['live', 'Live'],
    ['reconnecting', 'Reconnecting…'],
    ['offline', 'Offline'],
  ] as const)('shows the %s connection state', (status, label) => {
    renderHeader({ status })

    expect(screen.getByRole('status')).toHaveTextContent(label)
  })

  it('shows the last poll time once a poll has arrived', () => {
    renderHeader({
      status: 'live',
      lastPoll: { pollId: 'poll', polledAt: '2026-11-24T12:26:00Z', readings: [] },
    })

    expect(screen.getByRole('status')).toHaveTextContent(/Last poll \d{1,2}:26/)
  })

  it('shows no poll time before the first poll', () => {
    renderHeader({ status: 'live' })

    expect(screen.getByRole('status')).not.toHaveTextContent('Last poll')
  })
})
