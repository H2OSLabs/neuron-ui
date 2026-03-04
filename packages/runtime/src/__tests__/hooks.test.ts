import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePageSchema } from '../hooks/usePageSchema'
import { useNeuronPage } from '../hooks/useNeuronPage'
import type { PageSchema } from '../types'

const mockSchema: PageSchema = {
  version: '1.0.0',
  page: { id: 'test', name: 'Test Page' },
  tree: [{ id: 'root', component: 'NCard', props: { title: 'Hello' } }],
}

describe('usePageSchema', () => {
  it('loads inline schema immediately', async () => {
    const { result } = renderHook(() =>
      usePageSchema({ type: 'inline', schema: mockSchema }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.schema).toEqual(mockSchema)
    expect(result.current.error).toBeNull()
  })

  it('loads JSON string schema', async () => {
    const json = JSON.stringify(mockSchema)
    const { result } = renderHook(() =>
      usePageSchema({ type: 'json', json }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.schema).toEqual(mockSchema)
  })

  it('sets error for invalid JSON', async () => {
    const { result } = renderHook(() =>
      usePageSchema({ type: 'json', json: 'not valid json' }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.schema).toBeNull()
  })

  it('loads schema from URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSchema),
    })
    vi.stubGlobal('fetch', mockFetch)

    const { result } = renderHook(() =>
      usePageSchema({ type: 'url', url: 'http://api.test/schema' }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.schema).toEqual(mockSchema)
    expect(mockFetch).toHaveBeenCalledWith('http://api.test/schema')

    vi.unstubAllGlobals()
  })

  it('sets error for failed URL fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))

    const { result } = renderHook(() =>
      usePageSchema({ type: 'url', url: 'http://api.test/missing' }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('404')

    vi.unstubAllGlobals()
  })
})

describe('useNeuronPage', () => {
  it('returns tree for valid inline schema', async () => {
    const { result } = renderHook(() =>
      useNeuronPage({ type: 'inline', schema: mockSchema }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tree).not.toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('returns null tree while loading', () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})))

    const { result } = renderHook(() =>
      useNeuronPage({ type: 'url', url: 'http://api.test/slow' }),
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.tree).toBeNull()

    vi.unstubAllGlobals()
  })

  it('returns null tree on error', async () => {
    const { result } = renderHook(() =>
      useNeuronPage({ type: 'json', json: 'invalid' }),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.tree).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
  })
})
