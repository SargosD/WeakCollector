import { render, screen, waitFor } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MeasurementValueType, TimeRange } from '@/types/graphql'
import { StateTimeline } from './StateTimeline'

const metric = {
  key: 'motion:motionDetected:BOOLEAN',
  type: 'motion',
  name: 'motionDetected',
  valueType: MeasurementValueType.Boolean,
  label: 'Motion · Motion',
}

function renderTimeline() {
  render(
    <Provider value={createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })}>
      <StateTimeline metric={metric} range={TimeRange.LastHour} />
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

describe('StateTimeline', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('shows each location with one cell per slot, true, false or without data', async () => {
    mockResponse({
      data: {
        measurementTrend: [
          { location: 'Kitchen', polledAt: '2026-11-24T09:00:00Z', value: 1 },
          { location: 'Garage', polledAt: '2026-11-24T09:00:00Z', value: 0 },
          { location: 'Kitchen', polledAt: '2026-11-24T09:01:00Z', value: 0 },
        ],
      },
    })
    renderTimeline()

    await screen.findByText('Garage')
    const cells = (location: string) =>
      screen
        .getAllByTitle(new RegExp(`^${location} · `))
        .map((cell) => cell.title.split(' · ').at(-1))

    expect(cells('Garage')).toEqual(['False', 'No data'])
    expect(cells('Kitchen')).toEqual(['True', 'False'])
  })

  it('requests whether the metric was on in each slot', async () => {
    mockResponse({ data: { measurementTrend: [] } })
    renderTimeline()

    await screen.findByText('No data in this period.')
    const url = new URL(String(vi.mocked(fetch).mock.calls[0][0]), 'http://localhost')

    expect(JSON.parse(url.searchParams.get('variables') ?? '{}')).toMatchObject({
      aggregate: 'MAX',
    })
  })

  it('shows an error when the request fails', async () => {
    mockResponse({ errors: [{ message: 'boom' }] }, 500)
    renderTimeline()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load the timeline.'),
    )
  })
})
