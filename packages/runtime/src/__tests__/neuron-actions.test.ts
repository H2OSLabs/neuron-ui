import { describe, it, expect, vi } from 'vitest'
import { createDefaultActionHandlers } from '../catalog/neuron-actions'

describe('createDefaultActionHandlers', () => {
  it('creates all 9 handlers', () => {
    const handlers = createDefaultActionHandlers()
    expect(handlers.openDialog).toBeDefined()
    expect(handlers.closeDialog).toBeDefined()
    expect(handlers.openSheet).toBeDefined()
    expect(handlers.closeSheet).toBeDefined()
    expect(handlers.submitForm).toBeDefined()
    expect(handlers.deleteItem).toBeDefined()
    expect(handlers.refresh).toBeDefined()
    expect(handlers.navigate).toBeDefined()
    expect(handlers.toast).toBeDefined()
  })

  // Dialog / Sheet
  it('openDialog sets panel state', () => {
    const handlers = createDefaultActionHandlers()
    // Should not throw
    handlers.openDialog({ target: 'myDialog' })
  })

  it('closeDialog sets panel state', () => {
    const handlers = createDefaultActionHandlers()
    handlers.openDialog({ target: 'myDialog' })
    handlers.closeDialog({ target: 'myDialog' })
  })

  it('openSheet sets panel state', () => {
    const handlers = createDefaultActionHandlers()
    handlers.openSheet({ target: 'mySheet' })
  })

  it('closeSheet sets panel state', () => {
    const handlers = createDefaultActionHandlers()
    handlers.openSheet({ target: 'mySheet' })
    handlers.closeSheet({ target: 'mySheet' })
  })

  // submitForm
  it('submitForm sends POST request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })
    const handlers = createDefaultActionHandlers({ fetchFn: mockFetch, baseURL: 'http://api' })

    const result = await handlers.submitForm({ api: '/users', body: { name: 'test' } })
    expect(mockFetch).toHaveBeenCalledWith('http://api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test' }),
    })
    expect(result).toEqual({ id: 1 })
  })

  it('submitForm throws on error response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
    })
    const handlers = createDefaultActionHandlers({ fetchFn: mockFetch })

    await expect(handlers.submitForm({ api: '/users', body: {} })).rejects.toThrow('submitForm failed (400)')
  })

  it('submitForm handles text() failure gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('cannot read')),
    })
    const handlers = createDefaultActionHandlers({ fetchFn: mockFetch })

    await expect(handlers.submitForm({ api: '/users', body: {} })).rejects.toThrow('Unknown error')
  })

  // deleteItem
  it('deleteItem sends DELETE request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    const handlers = createDefaultActionHandlers({ fetchFn: mockFetch, baseURL: 'http://api' })

    await handlers.deleteItem({ api: '/users', id: '123' })
    expect(mockFetch).toHaveBeenCalledWith('http://api/users/123', { method: 'DELETE' })
  })

  it('deleteItem throws on error response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not found'),
    })
    const handlers = createDefaultActionHandlers({ fetchFn: mockFetch })

    await expect(handlers.deleteItem({ api: '/users', id: '999' })).rejects.toThrow('deleteItem failed (404)')
  })

  it('deleteItem handles text() failure gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('stream error')),
    })
    const handlers = createDefaultActionHandlers({ fetchFn: mockFetch })

    await expect(handlers.deleteItem({ api: '/x', id: '1' })).rejects.toThrow('Unknown error')
  })

  // refresh
  it('refresh is a no-op handler', () => {
    const handlers = createDefaultActionHandlers()
    expect(() => handlers.refresh({ dataSource: 'users' })).not.toThrow()
  })

  // navigate
  it('navigate uses onNavigate callback when provided', () => {
    const onNavigate = vi.fn()
    const handlers = createDefaultActionHandlers({ onNavigate })

    handlers.navigate({ target: '/users' })
    expect(onNavigate).toHaveBeenCalledWith('/users')
  })

  it('navigate falls back to location.assign', () => {
    const assign = vi.fn()
    const originalLocation = globalThis.location
    // @ts-expect-error mock location
    globalThis.location = { assign }

    const handlers = createDefaultActionHandlers()
    handlers.navigate({ target: '/about' })
    expect(assign).toHaveBeenCalledWith('/about')

    globalThis.location = originalLocation
  })

  // toast
  it('toast uses onToast callback when provided', () => {
    const onToast = vi.fn()
    const handlers = createDefaultActionHandlers({ onToast })

    handlers.toast({ message: 'Done!', variant: 'success' })
    expect(onToast).toHaveBeenCalledWith('Done!', 'success')
  })

  it('toast falls back to console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const handlers = createDefaultActionHandlers()

    handlers.toast({ message: 'Hello' })
    expect(spy).toHaveBeenCalledWith('[toast:info] Hello')

    spy.mockRestore()
  })

  it('toast defaults to info variant', () => {
    const onToast = vi.fn()
    const handlers = createDefaultActionHandlers({ onToast })

    handlers.toast({ message: 'Note' })
    expect(onToast).toHaveBeenCalledWith('Note', 'info')
  })
})
