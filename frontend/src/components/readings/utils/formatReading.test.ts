import { describe, expect, it } from 'vitest'
import { MeasurementValueType } from '../../../types/graphql'
import type { Reading } from '../../../types/readings'
import { formatReading } from './formatReading'

function measurement(
  id: number,
  name: string,
  value: string,
  valueType: MeasurementValueType,
): Reading['measurements'][number] {
  return { id, name, value, valueType }
}

function reading(type: string, measurements: Reading['measurements']): Reading {
  return { id: 1, location: 'Kitchen', polledAt: '2026-11-20T12:00:00Z', type, measurements }
}

describe('formatReading', () => {
  it('formats an energy reading', () => {
    const result = formatReading(
      reading('energy', [measurement(1, 'energy', '263.09', MeasurementValueType.Number)]),
    )

    expect(result).toEqual({
      title: 'Energy',
      rows: [{ label: 'Energy', value: '263.09 kWh' }],
    })
  })

  it('formats an air quality reading in the order of its fields', () => {
    const result = formatReading(
      reading('air_quality', [
        measurement(3, 'humidity', '69', MeasurementValueType.Number),
        measurement(1, 'co2', '667', MeasurementValueType.Number),
        measurement(2, 'pm25', '9', MeasurementValueType.Number),
      ]),
    )

    expect(result).toEqual({
      title: 'Air quality',
      rows: [
        { label: 'CO₂', value: '667 ppm' },
        { label: 'PM2.5', value: '9 µg/m³' },
        { label: 'Humidity', value: '69 %' },
      ],
    })
  })

  it.each([
    ['true', 'Detected'],
    ['false', 'None'],
  ])('formats motion %s as %s', (value, expected) => {
    const result = formatReading(
      reading('motion', [measurement(1, 'motionDetected', value, MeasurementValueType.Boolean)]),
    )

    expect(result.rows).toEqual([{ label: 'Motion', value: expected }])
  })

  it('shows a dash for a known field that is missing', () => {
    const result = formatReading(
      reading('air_quality', [measurement(1, 'co2', '667', MeasurementValueType.Number)]),
    )

    expect(result.rows).toEqual([
      { label: 'CO₂', value: '667 ppm' },
      { label: 'PM2.5', value: '–' },
      { label: 'Humidity', value: '–' },
    ])
  })

  it('shows the raw value when a known field changed its value type', () => {
    const result = formatReading(
      reading('energy', [measurement(1, 'energy', 'n/a', MeasurementValueType.Text)]),
    )

    expect(result.rows).toEqual([{ label: 'Energy', value: 'n/a' }])
  })

  it('appends measurements a known type does not define', () => {
    const result = formatReading(
      reading('energy', [
        measurement(1, 'energy', '10.50', MeasurementValueType.Number),
        measurement(2, 'voltage', '230', MeasurementValueType.Number),
      ]),
    )

    expect(result.rows).toEqual([
      { label: 'Energy', value: '10.50 kWh' },
      { label: 'voltage', value: '230' },
    ])
  })

  it('shows an unknown type with its name and raw measurements', () => {
    const result = formatReading(
      reading('water_leak', [
        measurement(1, 'leak', 'true', MeasurementValueType.Boolean),
        measurement(2, 'zone', 'basement', MeasurementValueType.Text),
      ]),
    )

    expect(result).toEqual({
      title: 'water_leak',
      rows: [
        { label: 'leak', value: 'true' },
        { label: 'zone', value: 'basement' },
      ],
    })
  })

  it('does not treat object prototype names as known types', () => {
    const result = formatReading(reading('constructor', []))

    expect(result).toEqual({ title: 'constructor', rows: [] })
  })
})
