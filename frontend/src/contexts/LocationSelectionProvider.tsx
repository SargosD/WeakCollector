import { useMemo, useState, type ReactNode } from 'react'
import { LocationSelectionContext } from './locationSelection'

export function LocationSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)

  const value = useMemo(
    () => ({ selectedLocationId, selectLocation: setSelectedLocationId }),
    [selectedLocationId],
  )

  return (
    <LocationSelectionContext.Provider value={value}>{children}</LocationSelectionContext.Provider>
  )
}
