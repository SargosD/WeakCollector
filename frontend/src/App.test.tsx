import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App.tsx'

vi.mock('./pages/DashboardPage', () => ({
  DashboardPage: () => <div>Dashboard page</div>,
}))

describe('App', () => {
  it('renders the dashboard', () => {
    render(<App />)
    expect(screen.getByText('Dashboard page')).toBeInTheDocument()
  })
})
