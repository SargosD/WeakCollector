import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { Reading } from '@/types/readings'
import { formatReading } from './utils/formatReading'

type LocationCardProps = {
  location: string
  readings: Reading[]
}

export function LocationCard({ location, readings }: LocationCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <h2 className="text-sm font-semibold">{location}</h2>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {readings.map((reading) => (
          <ReadingSection key={reading.id} reading={reading} />
        ))}
      </CardContent>
    </Card>
  )
}

function ReadingSection({ reading }: { reading: Reading }) {
  const { title, rows } = formatReading(reading)

  return (
    <section className="py-3 first:pt-0 last:pb-0">
      <h3 className="mb-1 text-xs text-muted-foreground">{title}</h3>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
