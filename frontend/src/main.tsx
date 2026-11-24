import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as GraphQLProvider } from 'urql'
import './index.css'
import { App } from '@/App'
import { createGraphQLClient } from '@/graphql/client'
import { PollUpdatesProvider } from '@/live/PollUpdatesProvider'

const client = createGraphQLClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GraphQLProvider value={client}>
      <PollUpdatesProvider>
        <App />
      </PollUpdatesProvider>
    </GraphQLProvider>
  </StrictMode>,
)
