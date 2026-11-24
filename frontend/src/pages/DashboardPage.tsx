import { ChartsSection } from '@/components/charts/ChartsSection'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { LatestReadings } from '@/components/readings/LatestReadings'
import { ReadingsTable } from '@/components/readings/ReadingsTable'

export function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <LatestReadings />
      <ChartsSection />
      <ReadingsTable />
    </>
  )
}
