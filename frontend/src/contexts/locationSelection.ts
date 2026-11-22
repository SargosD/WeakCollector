import { createContext, useContext } from 'react'

export type LocationSelection = {
  selectedLocationId: number | null
  selectLocation: (id: number) => void
}

export const LocationSelectionContext = createContext<LocationSelection | null>(null)

export function useLocationSelection(): LocationSelection {
  const context = useContext(LocationSelectionContext)

  if (!context) {
    throw new Error('useLocationSelection must be used within LocationSelectionProvider')
  }

  return context
}
