import { describe, it, expect, vi } from 'vitest'
import { createEventExecutor } from '../events/event-executor'

describe('createEventExecutor', () => {
  it('calls navigate handler for navigate action', async () => {
    const navigate = vi.fn()
    const executor = createEventExecutor({
      navigate,
      refresh: vi.fn(),
      dataProvider: null as any,
    })
    await executor.execute({ action: 'navigate', target: '/users/123' })
    expect(navigate).toHaveBeenCalledWith('/users/123')
  })

  it('replaces route params from eventParams in navigate action', async () => {
    const navigate = vi.fn()
    const executor = createEventExecutor({
      navigate,
      refresh: vi.fn(),
      dataProvider: null as any,
    })
    await executor.execute(
      { action: 'navigate', target: '/users/:id' },
      { id: '42' },
    )
    expect(navigate).toHaveBeenCalledWith('/users/42')
  })

  it('calls dataProvider.mutate for callApi action', async () => {
    const mutate = vi.fn().mockResolvedValue({ id: 1 })
    const executor = createEventExecutor({
      navigate: vi.fn(),
      refresh: vi.fn(),
      dataProvider: { fetch: vi.fn(), mutate },
      dataSources: {
        createUser: { api: 'POST /api/users' },
      },
    })
    await executor.execute({ action: 'callApi', target: 'createUser' })
    expect(mutate).toHaveBeenCalled()
  })

  it('calls refresh after successful callApi with onSuccess', async () => {
    const mutate = vi.fn().mockResolvedValue({ id: 1 })
    const refresh = vi.fn()
    const executor = createEventExecutor({
      navigate: vi.fn(),
      refresh,
      dataProvider: { fetch: vi.fn(), mutate },
      dataSources: {
        createUser: { api: 'POST /api/users' },
      },
    })
    await executor.execute({
      action: 'callApi',
      target: 'createUser',
      onSuccess: 'refresh:user-table',
    })
    expect(refresh).toHaveBeenCalledWith('user-table')
  })

  it('calls refresh handler for refresh action', async () => {
    const refresh = vi.fn()
    const executor = createEventExecutor({
      navigate: vi.fn(),
      refresh,
      dataProvider: null as any,
    })
    await executor.execute({ action: 'refresh', target: 'user-table' })
    expect(refresh).toHaveBeenCalledWith('user-table')
  })

  it('calls setVisibility(true) for show action', async () => {
    const setVisibility = vi.fn()
    const executor = createEventExecutor({
      navigate: vi.fn(),
      refresh: vi.fn(),
      dataProvider: null as any,
      setVisibility,
    })
    await executor.execute({ action: 'show', target: 'dialog-1' })
    expect(setVisibility).toHaveBeenCalledWith('dialog-1', true)
  })

  it('calls setVisibility(false) for hide action', async () => {
    const setVisibility = vi.fn()
    const executor = createEventExecutor({
      navigate: vi.fn(),
      refresh: vi.fn(),
      dataProvider: null as any,
      setVisibility,
    })
    await executor.execute({ action: 'hide', target: 'dialog-1' })
    expect(setVisibility).toHaveBeenCalledWith('dialog-1', false)
  })

  it('calls setPageState for updateState action', async () => {
    const setPageState = vi.fn()
    const executor = createEventExecutor({
      navigate: vi.fn(),
      refresh: vi.fn(),
      dataProvider: null as any,
      setPageState,
    })
    await executor.execute({ action: 'updateState', key: 'selectedId', value: '123' })
    expect(setPageState).toHaveBeenCalledWith('selectedId', '123')
  })
})
