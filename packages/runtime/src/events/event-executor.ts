// ============================================================
// Event Executor — Executes Page JSON event actions
// Handles: navigate, callApi, refresh, show, hide, updateState
// ============================================================

import type { EventAction } from '@neuron-ui/metadata'
import type { DataProvider } from '../types'

export interface EventExecutorContext {
  navigate: (path: string) => void
  refresh: (componentId: string) => void
  dataProvider: DataProvider
  dataSources?: Record<string, { api: string; params?: Record<string, unknown> }>
  pageState?: Record<string, unknown>
  setPageState?: (key: string, value: unknown) => void
  visibilityState?: Record<string, boolean>
  setVisibility?: (componentId: string, visible: boolean) => void
}

export interface EventExecutor {
  execute: (action: EventAction, eventParams?: Record<string, unknown>) => Promise<void>
}

export function createEventExecutor(ctx: EventExecutorContext): EventExecutor {
  return {
    async execute(action, eventParams = {}) {
      switch (action.action) {
        case 'navigate': {
          // Replace :param placeholders with eventParams values
          const path = action.target.replace(/:(\w+)/g, (_, key) =>
            String(eventParams[key] ?? `:${key}`),
          )
          ctx.navigate(path)
          break
        }
        case 'callApi': {
          const source = ctx.dataSources?.[action.target]
          if (!source) break
          const [method, endpoint] = source.api.split(' ')
          const body =
            action.merge === 'body'
              ? { ...source.params, ...eventParams }
              : eventParams
          const params =
            action.merge === 'params'
              ? { ...source.params, ...eventParams }
              : source.params
          await ctx.dataProvider.mutate(
            { method, path: endpoint },
            body || params,
          )
          if (action.onSuccess) {
            const [successAction, successTarget] = action.onSuccess.split(':')
            if (successAction === 'refresh') ctx.refresh(successTarget)
          }
          break
        }
        case 'refresh':
          ctx.refresh(action.target)
          break
        case 'show':
          ctx.setVisibility?.(action.target, true)
          break
        case 'hide':
          ctx.setVisibility?.(action.target, false)
          break
        case 'updateState':
          ctx.setPageState?.(action.key, action.value)
          break
      }
    },
  }
}
