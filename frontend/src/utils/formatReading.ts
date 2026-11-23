import { MeasurementValueType } from '../types/graphql'
import type {
  FieldSpec,
  FormattedReading,
  Measurement,
  Reading,
  ReadingRow,
  TypeSpec,
} from '../types/readings'

const KnownTypes: Record<string, TypeSpec> = {
  energy: {
    title: 'Energy',
    fields: [{ name: 'energy', label: 'Energy', unit: 'kWh' }],
  },
  air_quality: {
    title: 'Air quality',
    fields: [
      { name: 'co2', label: 'CO₂', unit: 'ppm' },
      { name: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
      { name: 'humidity', label: 'Humidity', unit: '%' },
    ],
  },
  motion: {
    title: 'Motion',
    fields: [
      { name: 'motionDetected', label: 'Motion', labels: { true: 'Detected', false: 'None' } },
    ],
  },
}

function formatValue(field: FieldSpec, measurement: Measurement): string {
  if (measurement.valueType === MeasurementValueType.Number && field.unit) {
    return `${measurement.value} ${field.unit}`
  }

  if (measurement.valueType === MeasurementValueType.Boolean && field.labels) {
    return field.labels[measurement.value] ?? measurement.value
  }

  return measurement.value
}

function rawRow(measurement: Measurement): ReadingRow {
  return { label: measurement.name, value: measurement.value }
}

export function formatReading(reading: Reading): FormattedReading {
  if (!Object.hasOwn(KnownTypes, reading.type)) {
    return { title: reading.type, rows: reading.measurements.map(rawRow) }
  }

  const spec = KnownTypes[reading.type]

  const known = spec.fields.map((field) => {
    const measurement = reading.measurements.find((item) => item.name === field.name)

    return {
      label: field.label,
      value: measurement ? formatValue(field, measurement) : '–',
    }
  })

  const extra = reading.measurements
    .filter((measurement) => !spec.fields.some((field) => field.name === measurement.name))
    .map(rawRow)

  return { title: spec.title, rows: [...known, ...extra] }
}
