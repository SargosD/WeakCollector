/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function createGraphQLProxy(graphqlUrl: string): ProxyOptions {
  const url = new URL(graphqlUrl)
  const graphqlPath = url.pathname.replace(/\/$/, '')

  if (graphqlPath === '') {
    throw new Error('GRAPHQL_URL must include the GraphQL endpoint path')
  }

  return {
    target: url.origin,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/graphql/, graphqlPath),
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let graphqlProxy: Record<string, ProxyOptions> | undefined

  if (command === 'serve' && mode !== 'test') {
    if (!env.GRAPHQL_URL) {
      throw new Error('GRAPHQL_URL is required for the dev server')
    }

    if (!env.NOTIFIER_URL) {
      throw new Error('NOTIFIER_URL is required for the dev server')
    }

    graphqlProxy = {
      '/graphql': createGraphQLProxy(env.GRAPHQL_URL),
      '/hubs': { target: env.NOTIFIER_URL, changeOrigin: true, ws: true },
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: graphqlProxy,
    },
    preview: {
      proxy: graphqlProxy,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.ts'],
    },
  }
})
