import { describeMeasurement } from '@/components/readings/utils/formatReading'
import type { MeasurementValueType, MetricsQuery } from '@/types/graphql'

export type Metric = {
  key: string
  type: string
  name: string
  valueType: MeasurementValueType
  label: string
}

function metricLabel(type: string, name: string): string {
  const { typeTitle, label, unit } = describeMeasurement(type, name)

  return unit ? `${typeTitle} · ${label} (${unit})` : `${typeTitle} · ${label}`
}

export function metricOptions(metrics: MetricsQuery['metrics']): Metric[] {
  return metrics
    .map((metric) => ({
      key: `${metric.type}:${metric.name}:${metric.valueType}`,
      type: metric.type,
      name: metric.name,
      valueType: metric.valueType,
      label: metricLabel(metric.type, metric.name),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}
