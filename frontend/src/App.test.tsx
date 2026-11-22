import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App.tsx'

vi.mock('./pages/DashboardPage', () => ({
  DashboardPage: () => <div>Dashboard page</div>,
}))

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'WeakCollector' })).toBeInTheDocument()
  })
})
