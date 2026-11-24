import { AlertCircleIcon, InboxIcon } from 'lucide-react'
import { useQuery } from 'urql'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Spinner } from '@/components/ui/spinner'
import { LatestReadingsDocument } from '@/types/graphql'
import { LocationCard } from './LocationCard'
import { groupReadingsByLocation } from './utils/groupReadings'

export function LatestReadings() {
  const [{ data, error, fetching }] = useQuery({ query: LatestReadingsDocument })

  const readings = data?.latestMeterReadings ?? []

  return (
    <section aria-label="Latest values" className="flex min-h-64 items-center justify-center">
      {error && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-2 text-sm text-destructive"
        >
          <AlertCircleIcon aria-hidden="true" className="size-8" />
          <span>Could not load latest values.</span>
        </div>
      )}

      {!error && !data && fetching && (
        <Spinner aria-label="Loading latest values" className="size-5 text-muted-foreground" />
      )}

      {!error && data && readings.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <InboxIcon aria-hidden="true" className="size-8" />
          <span>No readings yet.</span>
        </div>
      )}

      {!error && readings.length > 0 && (
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent>
            {groupReadingsByLocation(readings).map(([location, locationReadings]) => (
              <CarouselItem key={location} className="basis-full sm:basis-1/2 lg:basis-1/3">
                <LocationCard location={location} readings={locationReadings} />
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
