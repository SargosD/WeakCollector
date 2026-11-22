import 'dotenv/config'
import type { CodegenConfig } from '@graphql-codegen/cli'

const graphqlUrl = process.env.GRAPHQL_URL

if (!graphqlUrl) {
  throw new Error('GRAPHQL_URL is required to generate GraphQL types')
}

const config: CodegenConfig = {
  schema: graphqlUrl,
  documents: 'src/**/*.graphql',
  generates: {
    'src/types/graphql/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        useTypeImports: true,
        scalars: {
          Long: 'number',
          DateTime: 'string',
          UUID: 'string',
        },
      },
    },
  },
}

export default config
