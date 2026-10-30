import { render, screen } from '@testing-library/react'
import App from './App.tsx'

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'WeakCollector' })).toBeInTheDocument()
  })
})
