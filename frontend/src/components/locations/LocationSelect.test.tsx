import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocationSelectionProvider } from '../../contexts/LocationSelectionProvider'
import { useLocationSelection } from '../../contexts/locationSelection'
import { LocationSelect } from './LocationSelect'

const locations = [
  { id: 1, name: 'Kitchen' },
  { id: 2, name: 'Garage' },
]

function createTestClient() {
  return createClient({
    url: '/graphql',
    exchanges: [cacheExchange, fetchExchange],
  })
}

function SelectionProbe() {
  const { selectedLocationId } = useLocationSelection()

  return <span data-testid="selected-location">{selectedLocationId ?? 'none'}</span>
}

function renderSelect() {
  render(
    <Provider value={createTestClient()}>
      <LocationSelectionProvider>
        <LocationSelect />
        <SelectionProbe />
      </LocationSelectionProvider>
    </Provider>,
  )
}

function mockLocationsResponse(data: unknown) {
  vi.mocked(fetch).mockResolvedValue(
    new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

describe('LocationSelect', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders locations and selects the first one by default', async () => {
    mockLocationsResponse({ locations })
    renderSelect()

    const select = await screen.findByRole('combobox', { name: 'Location' })
    expect(await screen.findByRole('option', { name: 'Garage' })).toBeInTheDocument()
    await waitFor(() => expect(select).toHaveValue('1'))
    await waitFor(() => expect(screen.getByTestId('selected-location')).toHaveTextContent('1'))
  })

  it('updates the global selection', async () => {
    mockLocationsResponse({ locations })
    renderSelect()

    const select = await screen.findByRole('combobox', { name: 'Location' })
    await waitFor(() => expect(screen.getByTestId('selected-location')).toHaveTextContent('1'))
    await waitFor(() => expect(select).toBeEnabled())

    fireEvent.change(select, { target: { value: '2' } })

    await waitFor(() => expect(screen.getByTestId('selected-location')).toHaveTextContent('2'))
    expect(select).toHaveValue('2')
  })

  it('shows the selector with a loading item while loading', () => {
    vi.mocked(fetch).mockReturnValue(new Promise<Response>(() => {}))
    renderSelect()

    const select = screen.getByRole('combobox', { name: 'Location' })
    expect(select).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Loading locations…' })).toBeInTheDocument()
  })

  it('shows a single error item when locations fail to load', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))
    renderSelect()

    const select = await screen.findByRole('combobox', { name: 'Location' })
    await waitFor(() => expect(select).toHaveTextContent('Could not load locations'))
    expect(select).toBeDisabled()
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })

  it('shows a single empty item when there are no locations', async () => {
    mockLocationsResponse({ locations: [] })
    renderSelect()

    const select = await screen.findByRole('combobox', { name: 'Location' })
    await waitFor(() => expect(select).toHaveTextContent('No locations have been collected yet.'))
    expect(select).toBeDisabled()
    expect(screen.getAllByRole('option')).toHaveLength(1)
  })
})
