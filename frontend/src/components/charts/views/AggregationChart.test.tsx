import { render, screen, waitFor } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AggregateFunction, MeasurementValueType, TimeRange } from '@/types/graphql'
import { AggregationChart } from './AggregationChart'
import type { Metric } from '@/components/charts/utils/formatMetrics'

const co2: Metric = {
  key: 'air_quality:co2:NUMBER',
  type: 'air_quality',
  name: 'co2',
  valueType: MeasurementValueType.Number,
  label: 'Air quality · CO₂ (ppm)',
}

const motion: Metric = {
  key: 'motion:motionDetected:BOOLEAN',
  type: 'motion',
  name: 'motionDetected',
  valueType: MeasurementValueType.Boolean,
  label: 'Motion · Motion',
}

function renderChart(metric: Metric) {
  render(
    <Provider value={createClient({ url: '/graphql', exchanges: [cacheExchange, fetchExchange] })}>
      <AggregationChart
        metric={metric}
        range={TimeRange.LastDay}
        aggregate={AggregateFunction.Min}
      />
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

function requestVariables() {
  const url = new URL(String(vi.mocked(fetch).mock.calls[0][0]), 'http://localhost')
  return JSON.parse(url.searchParams.get('variables') ?? '{}')
}

describe('AggregationChart', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('requests the selected function for a numeric metric', async () => {
    mockResponse({ data: { aggregation: [] } })
    renderChart(co2)

    await screen.findByText('No data in this period.')

    expect(requestVariables()).toEqual({
      type: 'air_quality',
      name: 'co2',
      range: 'LAST_DAY',
      aggregate: 'MIN',
    })
  })

  it('requests the share of time on for an on/off metric', async () => {
    mockResponse({ data: { aggregation: [] } })
    renderChart(motion)

    await screen.findByText('No data in this period.')

    expect(requestVariables()).toMatchObject({ aggregate: 'AVG' })
  })

  it('shows a chart for the metric when there is data', async () => {
    mockResponse({ data: { aggregation: [{ location: 'Kitchen', value: 510 }] } })
    renderChart(co2)

    expect(
      await screen.findByRole('figure', { name: 'Air quality · CO₂ (ppm) by location' }),
    ).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    mockResponse({ errors: [{ message: 'boom' }] }, 500)
    renderChart(co2)

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not load the aggregation.'),
    )
  })
})
