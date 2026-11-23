import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as GraphQLProvider } from 'urql'
import './index.css'
import App from './App.tsx'
import { createGraphQLClient } from './graphql/client.ts'

const client = createGraphQLClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GraphQLProvider value={client}>
      <App />
    </GraphQLProvider>
  </StrictMode>,
)
