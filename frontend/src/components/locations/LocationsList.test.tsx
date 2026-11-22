import { render, screen } from '@testing-library/react'
import { Provider, cacheExchange, createClient, fetchExchange } from 'urql'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocationsList } from './LocationsList'

function createTestClient() {
  return createClient({
    url: '/graphql',
    exchanges: [cacheExchange, fetchExchange],
  })
}

describe('LocationsList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('renders the locations returned by the API', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            locations: [
              { id: 1, name: 'Kitchen' },
              { id: 2, name: 'Garage' },
            ],
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    render(
      <Provider value={createTestClient()}>
        <LocationsList />
      </Provider>,
    )

    expect(await screen.findByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Garage')).toBeInTheDocument()
  })

  it('shows an error when the request fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))

    render(
      <Provider value={createTestClient()}>
        <LocationsList />
      </Provider>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load locations')
  })
})
