import { AlertCircleIcon } from 'lucide-react'
import { useQuery } from 'urql'
import { LatestReadingsDocument, type LatestReadingsQuery } from '../../types/graphql'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Spinner } from '@/components/ui/spinner'
import { formatReading } from './utils/formatReading'
import { groupReadingsByLocation } from './utils/groupReadings'

export function LatestReadings() {
  const [result] = useQuery<LatestReadingsQuery>({ query: LatestReadingsDocument })

  const readings = result.data?.latestMeterReadings ?? []
  const locations = groupReadingsByLocation(readings)
  const hasError = Boolean(result.error) || (Boolean(result.data) && readings.length === 0)

  return (
    <section
      aria-label="Latest values"
      className="flex min-h-64 items-center justify-center"
    >
      {hasError && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-2 text-sm text-destructive"
        >
          <AlertCircleIcon aria-hidden="true" className="size-8" />
          <span>Could not load latest values.</span>
        </div>
      )}

      {result.fetching && !result.data && (
        <Spinner aria-label="Loading latest values" className="size-5 text-muted-foreground" />
      )}

      {!hasError && readings.length > 0 && (
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent>
            {locations.map(([location, locationReadings]) => (
              <CarouselItem
                key={location}
                className="basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <article className="h-full">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <h3 className="text-sm font-semibold">{location}</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {locationReadings.map((reading, index) => {
                        const { title, rows } = formatReading(reading)

                        return (
                          <section
                            key={reading.id}
                            className={index > 0 ? 'border-t border-border pt-3' : ''}
                          >
                            <h4 className="mb-1 text-xs text-muted-foreground">{title}</h4>
                            <dl className="space-y-1">
                              {rows.map((row) => (
                                <div
                                  key={row.label}
                                  className="flex justify-between gap-3 text-sm"
                                >
                                  <dt className="text-muted-foreground">{row.label}</dt>
                                  <dd className="font-medium tabular-nums">{row.value}</dd>
                                </div>
                              ))}
                            </dl>
                          </section>
                        )
                      })}
                    </CardContent>
                  </Card>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </section>
  )
}
