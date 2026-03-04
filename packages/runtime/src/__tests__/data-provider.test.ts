import { describe, it, expect, vi } from 'vitest'
import { parseApi, createDataProvider } from '../data/createDataProvider'

describe('parseApi', () => {
  it('parses GET /path format', () => {
    expect(parseApi('GET /api/users')).toEqual({ method: 'GET', path: '/api/users' })
  })

  it('parses POST /path format', () => {
    expect(parseApi('POST /api/users')).toEqual({ method: 'POST', path: '/api/users' })
  })

  it('parses DELETE /path format', () => {
    expect(parseApi('DELETE /api/users/1')).toEqual({ method: 'DELETE', path: '/api/users/1' })
  })

  it('parses PUT /path format', () => {
    expect(parseApi('PUT /api/users/1')).toEqual({ method: 'PUT', path: '/api/users/1' })
  })

  it('parses PATCH /path format', () => {
    expect(parseApi('PATCH /api/users/1')).toEqual({ method: 'PATCH', path: '/api/users/1' })
  })

  it('defaults to GET for plain paths', () => {
    expect(parseApi('/api/users')).toEqual({ method: 'GET', path: '/api/users' })
  })
})

describe('createDataProvider', () => {
  function createMockFetch(data: unknown, ok = true, status = 200) {
    return vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(data),
    })
  }

  it('creates a provider with fetch and mutate', () => {
    const mockFetch = createMockFetch([])
    const provider = createDataProvider({ baseURL: 'http://api.test', fetchFn: mockFetch })
    expect(provider.fetch).toBeDefined()
    expect(provider.mutate).toBeDefined()
  })

  it('fetch sends GET request with query params', async () => {
    const mockFetch = createMockFetch([{ id: 1 }])
    const provider = createDataProvider({ baseURL: 'http://api.test', fetchFn: mockFetch })

    const result = await provider.fetch(
      { method: 'GET', path: '/users' },
      { page: 1, limit: 10 },
    )

    expect(result).toEqual([{ id: 1 }])
    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('/users')
    expect(calledUrl).toContain('page=1')
    expect(calledUrl).toContain('limit=10')
  })

  it('fetch omits null/undefined query params', async () => {
    const mockFetch = createMockFetch([])
    const provider = createDataProvider({ baseURL: 'http://api.test', fetchFn: mockFetch })

    await provider.fetch(
      { method: 'GET', path: '/users' },
      { page: 1, filter: null, sort: undefined },
    )

    const calledUrl = mockFetch.mock.calls[0][0]
    expect(calledUrl).toContain('page=1')
    expect(calledUrl).not.toContain('filter')
    expect(calledUrl).not.toContain('sort')
  })

  it('mutate sends POST request with JSON body', async () => {
    const mockFetch = createMockFetch({ id: 1, name: 'test' })
    const provider = createDataProvider({ baseURL: 'http://api.test', fetchFn: mockFetch })

    await provider.mutate(
      { method: 'POST', path: '/users' },
      { name: 'test' },
    )

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      }),
    )
  })

  it('includes custom headers', async () => {
    const mockFetch = createMockFetch({})
    const provider = createDataProvider({
      baseURL: 'http://api.test',
      fetchFn: mockFetch,
      headers: { Authorization: 'Bearer token123' },
    })

    await provider.fetch({ method: 'GET', path: '/me' })

    const options = mockFetch.mock.calls[0][1]
    expect(options.headers.Authorization).toBe('Bearer token123')
  })

  it('throws on non-ok response', async () => {
    const mockFetch = createMockFetch(null, false, 404)
    const provider = createDataProvider({ baseURL: 'http://api.test', fetchFn: mockFetch })

    await expect(
      provider.fetch({ method: 'GET', path: '/missing' }),
    ).rejects.toThrow('API GET /missing failed: 404')
  })
})
