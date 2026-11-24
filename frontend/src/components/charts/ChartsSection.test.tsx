import { render, screen, waitFor } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChartsSection } from './ChartsSection'

function renderSection() {
  render(
    <Provider value={createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })}>
      <ChartsSection />
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

describe('ChartsSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('selects the first metric by label', async () => {
    mockResponse({
      data: {
        metrics: [
          { type: 'energy', name: 'energy', valueType: 'NUMBER' },
          { type: 'air_quality', name: 'co2', valueType: 'NUMBER' },
        ],
      },
    })
    renderSection()

    expect(await screen.findByRole('combobox', { name: 'Metric' })).toHaveTextContent(
      'Air quality · CO₂ (ppm)',
    )
  })

  it('starts with the average for a numeric metric', async () => {
    mockResponse({
      data: { metrics: [{ type: 'air_quality', name: 'co2', valueType: 'NUMBER' }] },
    })
    renderSection()

    expect(await screen.findByRole('button', { name: 'Avg' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('hides the function selector for an on/off metric', async () => {
    mockResponse({
      data: { metrics: [{ type: 'motion', name: 'motionDetected', valueType: 'BOOLEAN' }] },
    })
    renderSection()

    await screen.findByRole('combobox', { name: 'Metric' })

    expect(screen.queryByRole('group', { name: 'Aggregate function' })).not.toBeInTheDocument()
  })

  it('requests whether an on/off metric was on in each slot', async () => {
    mockResponse({
      data: { metrics: [{ type: 'motion', name: 'motionDetected', valueType: 'BOOLEAN' }] },
    })
    renderSection()

    await waitFor(() => {
      const trendCall = vi
        .mocked(fetch)
        .mock.calls.map(([url]) => new URL(String(url), 'http://localhost'))
        .find((url) => url.searchParams.get('operationName') === 'MeasurementTrend')

      expect(JSON.parse(trendCall?.searchParams.get('variables') ?? '{}')).toMatchObject({
        type: 'motion',
        name: 'motionDetected',
        aggregate: 'MAX',
      })
    })
  })

  it('starts with the last 24 hours', async () => {
    mockResponse({ data: { metrics: [] } })
    renderSection()

    expect(await screen.findByRole('button', { name: '24h' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('shows a message when no metrics have data in the period', async () => {
    mockResponse({ data: { metrics: [] } })
    renderSection()

    expect(await screen.findByText('No metrics in this period.')).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    mockResponse({ errors: [{ message: 'boom' }] }, 500)
    renderSection()

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load metrics.'),
    )
  })
})
