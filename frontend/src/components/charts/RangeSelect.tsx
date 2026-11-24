import { Button } from '@/components/ui/button'
import { TimeRange } from '@/types/graphql'

const Ranges = [
  { value: TimeRange.LastHour, label: '1h' },
  { value: TimeRange.LastDay, label: '24h' },
  { value: TimeRange.LastWeek, label: '7d' },
  { value: TimeRange.LastMonth, label: '30d' },
]

type RangeSelectProps = {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export function RangeSelect({ value, onChange }: RangeSelectProps) {
  return (
    <div role="group" aria-label="Time range" className="flex gap-1">
      {Ranges.map((range) => (
        <Button
          key={range.value}
          size="sm"
          variant={range.value === value ? 'default' : 'outline'}
          aria-pressed={range.value === value}
          onClick={() => onChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}
