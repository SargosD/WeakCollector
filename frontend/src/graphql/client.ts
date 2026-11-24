import { cacheExchange, createClient, fetchExchange } from 'urql'

const GRAPHQL_ROUTE = '/graphql'

export function createGraphQLClient() {
  return createClient({
    url: GRAPHQL_ROUTE,
    exchanges: [cacheExchange, fetchExchange],
    requestPolicy: 'cache-and-network',
    preferGetMethod: false,
  })
}
