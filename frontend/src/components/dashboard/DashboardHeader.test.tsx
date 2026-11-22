import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DashboardHeader } from './DashboardHeader'

vi.mock('../locations/LocationSelect', () => ({
  LocationSelect: () => <div>Location select</div>,
}))

describe('DashboardHeader', () => {
  it('renders the title and the location select', () => {
    render(<DashboardHeader />)

    expect(screen.getByRole('heading', { name: 'WeakCollector' })).toBeInTheDocument()
    expect(screen.getByText('Location select')).toBeInTheDocument()
  })
})
