import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Metric } from '@/components/charts/utils/formatMetrics'

type MetricSelectProps = {
  metrics: Metric[]
  value: Metric
  onChange: (metric: Metric) => void
}

export function MetricSelect({ metrics, value, onChange }: MetricSelectProps) {
  function handleChange(key: string) {
    const metric = metrics.find((item) => item.key === key)

    if (metric) {
      onChange(metric)
    }
  }

  return (
    <Select value={value.key} onValueChange={handleChange}>
      <SelectTrigger aria-label="Metric" className="w-full sm:w-80">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {metrics.map((metric) => (
          <SelectItem key={metric.key} value={metric.key}>
            {metric.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
