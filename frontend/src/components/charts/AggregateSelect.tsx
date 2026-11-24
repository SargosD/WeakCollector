import { Button } from '@/components/ui/button'
import { AggregateFunction } from '@/types/graphql'

const Functions = [
  { value: AggregateFunction.Avg, label: 'Avg' },
  { value: AggregateFunction.Min, label: 'Min' },
  { value: AggregateFunction.Max, label: 'Max' },
]

type AggregateSelectProps = {
  value: AggregateFunction
  onChange: (aggregate: AggregateFunction) => void
}

export function AggregateSelect({ value, onChange }: AggregateSelectProps) {
  return (
    <div role="group" aria-label="Aggregate function" className="flex gap-1">
      {Functions.map((item) => (
        <Button
          key={item.value}
          size="sm"
          variant={item.value === value ? 'default' : 'outline'}
          aria-pressed={item.value === value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  )
}
