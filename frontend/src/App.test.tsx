import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { App } from '@/App'

vi.mock('@/components/readings/latest/LatestReadings', () => ({
  LatestReadings: () => <div>Latest readings</div>,
}))

vi.mock('@/components/charts/ChartsSection', () => ({
  ChartsSection: () => <div>Charts section</div>,
}))

vi.mock('@/components/readings/table/ReadingsTable', () => ({
  ReadingsTable: () => <div>Readings table</div>,
}))

describe('App', () => {
  it('renders the header and every dashboard section', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'WeakCollector' })).toBeInTheDocument()
    expect(screen.getByText('Latest readings')).toBeInTheDocument()
    expect(screen.getByText('Charts section')).toBeInTheDocument()
    expect(screen.getByText('Readings table')).toBeInTheDocument()
  })
})
