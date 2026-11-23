import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardHeader } from './DashboardHeader'

describe('DashboardHeader', () => {
  it('renders the title', () => {
    render(<DashboardHeader />)

    expect(screen.getByRole('heading', { name: 'WeakCollector' })).toBeInTheDocument()
  })
})
