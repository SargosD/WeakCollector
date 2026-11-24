import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InitialPollUpdates, PollUpdatesContext } from '@/live/pollUpdates'
import { ReadingsTable } from './ReadingsTable'

function reading(id: number, location: string) {
  return {
    id,
    location,
    polledAt: '2026-11-24T12:26:00Z',
    type: 'energy',
    measurements: [{ id, name: 'energy', value: '418.67', valueType: 'NUMBER' }],
  }
}

function page(nodes: unknown[], totalCount: number, hasNextPage = false) {
  return {
    data: {
      allReadings: {
        totalCount,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: false,
          startCursor: 'start',
          endCursor: 'end',
        },
        nodes,
      },
    },
  }
}

function renderTable() {
  render(
    <Provider value={createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })}>
      <ReadingsTable />
    </Provider>,
  )
}

function mockResponse(body: unknown, status = 200) {
  vi.mocked(fetch).mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  )
}

function lastVariables() {
  const calls = vi.mocked(fetch).mock.calls
  const url = new URL(String(calls[calls.length - 1][0]), 'http://localhost')
  return JSON.parse(url.searchParams.get('variables') ?? '{}')
}

describe('ReadingsTable', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('shows each reading with its location, type and formatted values', async () => {
    mockResponse(page([reading(1, 'Office')], 1))
    renderTable()

    expect(await screen.findByRole('cell', { name: 'Office' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Energy' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Energy 418.67 kWh' })).toBeInTheDocument()
    expect(screen.getByText('1–1 of 1')).toBeInTheDocument()
  })

  it('loads the newest readings first, grouped by location and type', async () => {
    mockResponse(page([], 0))
    renderTable()

    await screen.findByText('No readings found.')

    expect(lastVariables()).toEqual({
      order: [{ polledAt: 'DESC' }, { location: 'ASC' }, { type: 'ASC' }, { id: 'DESC' }],
      first: 20,
    })
  })

  it('searches by location after typing stops', async () => {
    mockResponse(page([], 0))
    renderTable()

    fireEvent.change(await screen.findByRole('searchbox', { name: 'Search location' }), {
      target: { value: ' Kit ' },
    })

    await waitFor(() =>
      expect(lastVariables()).toMatchObject({ where: { location: { contains: 'Kit' } } }),
    )
  })

  it('moves to the next page with the end cursor', async () => {
    mockResponse(page([reading(1, 'Office')], 25, true))
    renderTable()

    fireEvent.click(await screen.findByRole('button', { name: 'Next' }))

    await waitFor(() => expect(lastVariables()).toMatchObject({ first: 20, after: 'end' }))
    expect(await screen.findByText('21–21 of 25')).toBeInTheDocument()
  })

  it('offers a way back to the newest readings instead of refetching a later page', async () => {
    mockResponse(page([reading(1, 'Office')], 25, true))
    const client = createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })
    const table = (polledAt: string | null) => (
      <Provider value={client}>
        <PollUpdatesContext.Provider
          value={{
            ...InitialPollUpdates,
            lastPoll: polledAt ? { pollId: 'poll', polledAt, readings: [] } : null,
          }}
        >
          <ReadingsTable />
        </PollUpdatesContext.Provider>
      </Provider>
    )
    const { rerender } = render(table(null))
    fireEvent.click(await screen.findByRole('button', { name: 'Next' }))
    await screen.findByText('21–21 of 25')
    const callsOnPageTwo = vi.mocked(fetch).mock.calls.length

    rerender(table('2026-11-24T12:27:00Z'))

    fireEvent.click(await screen.findByRole('button', { name: 'New readings – back to top' }))
    await waitFor(() => {
      expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(callsOnPageTwo)
      expect(lastVariables()).not.toHaveProperty('after')
    })
  })

  it('shows an error when the request fails', async () => {
    mockResponse({ errors: [{ message: 'boom' }] }, 500)
    renderTable()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load readings.'),
    )
  })
})
