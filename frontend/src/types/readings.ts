import type { LatestReadingsQuery } from './graphql'

export type Reading = LatestReadingsQuery['latestMeterReadings'][number]

export type Measurement = Reading['measurements'][number]

export type ReadingRow = { label: string; value: string }

export type FormattedReading = { title: string; rows: ReadingRow[] }

export type FieldSpec = {
  name: string
  label: string
  unit?: string
  labels?: Record<string, string>
}

export type TypeSpec = { title: string; fields: FieldSpec[] }
