import { useQuery } from 'urql'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { QueryState } from '@/components/shared/QueryState'
import { LatestReadingsDocument } from '@/types/graphql'
import { useLatestReadings } from './hooks/useLatestReadings'
import { LocationCard } from './LocationCard'
import { groupReadingsByLocation } from './utils/groupReadings'

export function LatestReadings() {
  const [{ data, error, fetching }] = useQuery({ query: LatestReadingsDocument })
  const { readings, hasData } = useLatestReadings(data?.latestMeterReadings)

  return (
    <section aria-label="Latest values" className="flex min-h-64 items-center justify-center">
      <QueryState
        result={{ error, fetching, data: hasData ? readings : undefined }}
        isEmpty={readings.length === 0}
        messages={{
          error: 'Could not load latest values.',
          loading: 'Loading latest values',
          empty: 'No readings yet.',
        }}
      >
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent>
            {groupReadingsByLocation(readings).map(([location, locationReadings]) => (
              <CarouselItem
                key={location}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <LocationCard location={location} readings={locationReadings} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </QueryState>
    </section>
  )
}
