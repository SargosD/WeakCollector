import type { Reading } from '../../../types/readings'

export function groupReadingsByLocation(readings: Reading[]) {
  const groups = new Map<string, Reading[]>()

  for (const reading of readings) {
    const group = groups.get(reading.location)

    if (group) {
      group.push(reading)
    } else {
      groups.set(reading.location, [reading])
    }
  }

  return [...groups]
}
