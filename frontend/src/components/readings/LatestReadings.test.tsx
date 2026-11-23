import { render, screen, waitFor } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LatestReadings } from './LatestReadings'

const readings = [
  {
    id: 1,
    location: 'Kitchen',
    polledAt: '2026-11-20T12:00:00Z',
    type: 'energy',
    measurements: [{ id: 1, name: 'energy', value: '263.09', valueType: 'NUMBER' }],
  },
  {
    id: 2,
    location: 'Kitchen',
    polledAt: '2026-11-20T12:00:00Z',
    type: 'water_leak',
    measurements: [{ id: 2, name: 'zone', value: 'basement', valueType: 'TEXT' }],
  },
  {
    id: 3,
    location: 'Garage',
    polledAt: '2026-11-20T12:00:00Z',
    type: 'air_quality',
    measurements: [{ id: 3, name: 'co2', value: '667', valueType: 'NUMBER' }],
  },
]

function renderReadings() {
  render(
    <Provider value={createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })}>
      <LatestReadings />
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

  it('groups readings into one card per location', async () => {
    mockResponse({ data: { latestMeterReadings: readings } })
    renderReadings()

    expect(await screen.findByRole('heading', { name: 'Kitchen' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Garage' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByText('water_leak')).toBeInTheDocument()
    expect(screen.getByText('Air quality')).toBeInTheDocument()
  })

  it('formats known values and shows unknown ones raw', async () => {
    mockResponse({ data: { latestMeterReadings: readings } })
    renderReadings()

    expect(await screen.findByText('263.09 kWh')).toBeInTheDocument()
    expect(screen.getByText('basement')).toBeInTheDocument()
    expect(screen.getByText('667 ppm')).toBeInTheDocument()
  })

  it('queries without a location variable', async () => {
    mockResponse({ data: { latestMeterReadings: readings } })
    renderReadings()

    await screen.findByText('263.09 kWh')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url) + String(init?.body)).not.toContain('locationId')
  })

  it('shows a message when there are no readings', async () => {
    mockResponse({ data: { latestMeterReadings: [] } })
    renderReadings()

    expect(await screen.findByText('Could not load latest values.')).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    mockResponse({ errors: [{ message: 'boom' }] }, 500)
    renderReadings()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load latest values.'),
    )
  })
})
