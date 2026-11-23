import { render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocationSelectionProvider } from '../../contexts/LocationSelectionProvider'
import { useLocationSelection } from '../../contexts/locationSelection'
import { LatestReadings } from './LatestReadings'

const readings = [
  {
    id: 1,
    polledAt: '2026-11-20T12:00:00Z',
    type: 'energy',
    measurements: [{ id: 1, name: 'energy', value: '263.09', valueType: 'NUMBER' }],
  },
  {
    id: 2,
    polledAt: '2026-11-20T12:00:00Z',
    type: 'water_leak',
    measurements: [{ id: 2, name: 'zone', value: 'basement', valueType: 'TEXT' }],
  },
]

function SelectLocation({ id }: { id: number }) {
  const { selectLocation } = useLocationSelection()

  useEffect(() => {
    selectLocation(id)
  }, [id, selectLocation])

  return null
}

function renderReadings(selectedLocationId: number | null) {
  render(
    <Provider value={createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })}>
      <LocationSelectionProvider>
        {selectedLocationId !== null && <SelectLocation id={selectedLocationId} />}
        <LatestReadings />
      </LocationSelectionProvider>
    </Provider>,
  )
}

function mockResponse(body: unknown, status = 200) {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

describe('LatestReadings', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('asks for a location while none is selected and does not query', () => {
    renderReadings(null)

    expect(screen.getByText('Select a location.')).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('renders a card for each reading, formatting known types and showing unknown ones raw', async () => {
    mockResponse({ data: { latestMeterReadings: readings } })
    renderReadings(1)

    expect(await screen.findByRole('heading', { name: 'Energy' })).toBeInTheDocument()
    expect(screen.getByText('263.09 kWh')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'water_leak' })).toBeInTheDocument()
    expect(screen.getByText('basement')).toBeInTheDocument()
  })

  it('shows the poll time once for the whole section', async () => {
    mockResponse({ data: { latestMeterReadings: readings } })
    renderReadings(1)

    await screen.findByRole('heading', { name: 'Energy' })
    expect(screen.getAllByText(/Last polled at/)).toHaveLength(1)
  })

  it('queries the selected location', async () => {
    mockResponse({ data: { latestMeterReadings: readings } })
    renderReadings(7)

    await screen.findByRole('heading', { name: 'Energy' })
    const url = new URL(String(vi.mocked(fetch).mock.calls[0][0]), 'http://localhost')
    expect(JSON.parse(url.searchParams.get('variables') ?? '{}')).toEqual({ locationId: 7 })
  })

  it('shows a message when there are no readings', async () => {
    mockResponse({ data: { latestMeterReadings: [] } })
    renderReadings(1)

    expect(await screen.findByText('No readings have been collected yet.')).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    mockResponse({ errors: [{ message: 'boom' }] }, 500)
    renderReadings(1)

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load latest values.'),
    )
  })
})
