// ============================================================
// createDataProvider: Factory for API data provider
// ============================================================

import type { DataProvider, DataProviderConfig } from '../types'

/** Parse "METHOD /path" into { method, path } */
export function parseApi(api: string): { method: string; path: string } {
  const match = api.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/)
  if (!match) return { method: 'GET', path: api }
  return { method: match[1], path: match[2] }
}

/** Create a DataProvider with configured base URL and headers */
export function createDataProvider(config: DataProviderConfig): DataProvider {
  const { baseURL, headers = {}, fetchFn = fetch } = config

  async function request(
    req: { method: string; path: string },
    bodyOrParams?: unknown,
  ): Promise<unknown> {
    const url = new URL(req.path, baseURL)
    const isGet = req.method === 'GET'

    // For GET, append params as query string
    if (isGet && bodyOrParams && typeof bodyOrParams === 'object') {
      for (const [key, value] of Object.entries(bodyOrParams as Record<string, unknown>)) {
        if (value != null) url.searchParams.set(key, String(value))
      }
    }

    const response = await fetchFn(url.toString(), {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: !isGet && bodyOrParams ? JSON.stringify(bodyOrParams) : undefined,
    })

    if (!response.ok) {
      throw new Error(`API ${req.method} ${req.path} failed: ${response.status}`)
    }

    return response.json()
  }

  return {
    fetch: (req, params) => request(req, params),
    mutate: (req, body) => request(req, body),
  }
}
