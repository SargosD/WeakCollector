import { describe, expect, it } from 'vitest'
import { MeasurementValueType } from '@/types/graphql'
import { formatMetrics } from './formatMetrics'

describe('formatMetrics', () => {
  it('labels known metrics with their type, name and unit', () => {
    const options = formatMetrics([
      { type: 'air_quality', name: 'co2', valueType: MeasurementValueType.Number },
    ])

    expect(options).toEqual([
      {
        key: 'air_quality:co2:NUMBER',
        type: 'air_quality',
        name: 'co2',
        valueType: MeasurementValueType.Number,
        label: 'Air quality · CO₂ (ppm)',
      },
    ])
  })

  it('labels a metric without a unit by its type and name only', () => {
    const options = formatMetrics([
      { type: 'motion', name: 'motionDetected', valueType: MeasurementValueType.Boolean },
    ])

    expect(options.map((option) => option.label)).toEqual(['Motion · Motion'])
  })

  it('shows unknown metrics with their raw names', () => {
    const options = formatMetrics([
      { type: 'water_leak', name: 'leak', valueType: MeasurementValueType.Boolean },
    ])

    expect(options.map((option) => option.label)).toEqual(['water_leak · leak'])
  })

  it('sorts metrics by label', () => {
    const options = formatMetrics([
      { type: 'energy', name: 'energy', valueType: MeasurementValueType.Number },
      { type: 'air_quality', name: 'pm25', valueType: MeasurementValueType.Number },
      { type: 'air_quality', name: 'co2', valueType: MeasurementValueType.Number },
    ])

    expect(options.map((option) => option.label)).toEqual([
      'Air quality · CO₂ (ppm)',
      'Air quality · PM2.5 (µg/m³)',
      'Energy · Energy (kWh)',
    ])
  })
})
