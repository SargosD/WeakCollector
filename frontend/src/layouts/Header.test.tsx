import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LastPollContext, type PollStoredMessage } from '@/realtime/context/lastPollContext'
import { Header } from './Header'

function renderHeader(lastPoll: PollStoredMessage | null = null) {
  render(
    <LastPollContext.Provider value={lastPoll}>
      <Header />
    </LastPollContext.Provider>,
  )
}

describe('Header', () => {
  it('renders the title', () => {
    renderHeader()

    expect(screen.getByRole('heading', { name: 'WeakCollector' })).toBeInTheDocument()
  })

  it('shows the last poll time once a poll has arrived', () => {
    renderHeader({ pollId: 'poll', polledAt: '2026-11-24T12:26:00Z', readings: [] })

    expect(screen.getByRole('status')).toHaveTextContent(/Last poll .*\d{1,2}:26/)
  })

  it('shows no poll time before the first poll', () => {
    renderHeader()

    expect(screen.queryByText(/Last poll/)).not.toBeInTheDocument()
  })
})
