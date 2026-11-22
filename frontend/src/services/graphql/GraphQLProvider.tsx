import { useMemo, type ReactNode } from 'react'
import { Provider } from 'urql'
import { createGraphQLClient } from './client'

type GraphQLProviderProps = {
  children: ReactNode
  client?: ReturnType<typeof createGraphQLClient>
}

export function GraphQLProvider({ children, client }: GraphQLProviderProps) {
  const value = useMemo(() => client ?? createGraphQLClient(), [client])

  return <Provider value={value}>{children}</Provider>
}
