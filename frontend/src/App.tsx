import { ChartsSection } from '@/components/charts/ChartsSection'
import { LatestReadings } from '@/components/readings/latest/LatestReadings'
import { ReadingsTable } from '@/components/readings/table/ReadingsTable'
import { AppLayout } from '@/layouts/AppLayout'

export function App() {
  return (
    <AppLayout>
      <LatestReadings />
      <ChartsSection />
      <ReadingsTable />
    </AppLayout>
  )
}
