import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { LatestReadings } from '../components/readings/LatestReadings'

export function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <LatestReadings />
    </>
  )
}
