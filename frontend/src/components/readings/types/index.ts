import type { LatestReadingsQuery } from '@/types/graphql'

export type Reading = LatestReadingsQuery['latestMeterReadings'][number]

export type Measurement = Reading['measurements'][number]

export type ReadingRow = { label: string; value: string }

export type FormattedReading = { title: string; rows: ReadingRow[] }
