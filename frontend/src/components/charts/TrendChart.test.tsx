import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InitialPollUpdates, PollUpdatesContext } from '@/live/pollUpdates'
import { AggregateFunction, MeasurementValueType, TimeRange } from '@/types/graphql'
import { TrendChart } from './TrendChart'

const metric = {
  key: 'air_quality:co2:NUMBER',
  type: 'air_quality',
  name: 'co2',
  valueType: MeasurementValueType.Number,
  label: 'Air quality · CO₂ (ppm)',
}

function renderChart() {
  render(
    <Provider value={createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })}>
      <TrendChart metric={metric} range={TimeRange.LastHour} aggregate={AggregateFunction.Max} />
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

describe('TrendChart', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('lists each location once, sorted by name', async () => {
    mockResponse({
      data: {
        measurementTrend: [
          { location: 'Kitchen', polledAt: '2026-11-24T09:00:00Z', value: 590 },
          { location: 'Garage', polledAt: '2026-11-24T09:00:00Z', value: 330 },
          { location: 'Kitchen', polledAt: '2026-11-24T09:01:00Z', value: 600 },
        ],
      },
    })
    renderChart()

    const locations = await screen.findByRole('group', { name: 'Locations' })

    expect([...locations.querySelectorAll('button')].map((button) => button.textContent)).toEqual([
      'Garage',
      'Kitchen',
    ])
  })

  it('hides and shows a location when its legend entry is clicked', async () => {
    mockResponse({
      data: {
        measurementTrend: [{ location: 'Kitchen', polledAt: '2026-11-24T09:00:00Z', value: 590 }],
      },
    })
    renderChart()

    const kitchen = await screen.findByRole('button', { name: 'Kitchen' })
    expect(kitchen).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(kitchen)
    expect(kitchen).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(kitchen)
    expect(kitchen).toHaveAttribute('aria-pressed', 'true')
  })

  it('requests the trend for the metric, range and function', async () => {
    mockResponse({ data: { measurementTrend: [] } })
    renderChart()

    await screen.findByText('No data in this period.')
    const url = new URL(String(vi.mocked(fetch).mock.calls[0][0]), 'http://localhost')

    expect(JSON.parse(url.searchParams.get('variables') ?? '{}')).toEqual({
      type: 'air_quality',
      name: 'co2',
      range: 'LAST_HOUR',
      aggregate: 'MAX',
    })
  })

  it('refetches when a new poll arrives', async () => {
    mockResponse({ data: { measurementTrend: [] } })
    const client = createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })
    const chart = (polledAt: string | null) => (
      <Provider value={client}>
        <PollUpdatesContext.Provider
          value={{
            ...InitialPollUpdates,
            lastPoll: polledAt ? { pollId: 'poll', polledAt, readings: [] } : null,
          }}
        >
          <TrendChart
            metric={metric}
            range={TimeRange.LastHour}
            aggregate={AggregateFunction.Max}
          />
        </PollUpdatesContext.Provider>
      </Provider>
    )
    const { rerender } = render(chart(null))
    await screen.findByText('No data in this period.')

    rerender(chart('2026-11-24T12:26:00Z'))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
  })

  it('shows a message when there is no data in the period', async () => {
    mockResponse({ data: { measurementTrend: [] } })
    renderChart()

    expect(await screen.findByText('No data in this period.')).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    mockResponse({ errors: [{ message: 'boom' }] }, 500)
    renderChart()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load the trend.'),
    )
  })
})
