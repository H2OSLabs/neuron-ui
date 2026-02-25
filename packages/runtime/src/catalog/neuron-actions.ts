// ============================================================
// Default action handler implementations for the neuron catalog
// ============================================================

import type { ActionHandler, ActionHandlers } from '../types'

/** Options for creating the default set of action handlers */
export interface DefaultActionHandlerOptions {
  /** Custom navigation handler (e.g. react-router navigate) */
  onNavigate?: (target: string) => void
  /** Custom toast / notification handler */
  onToast?: (message: string, variant: string) => void
  /** Custom fetch function for API calls (defaults to globalThis.fetch) */
  fetchFn?: typeof fetch
  /** Base URL prepended to API paths in submitForm / deleteItem */
  baseURL?: string
}

/**
 * Create a complete set of default action handlers for all 9 neuron actions.
 *
 * Dialog / Sheet state is tracked with a simple Map<string, boolean> so the
 * handlers are self-contained and work without external state management.
 * Consumers can override individual handlers by merging their own map on top.
 */
export function createDefaultActionHandlers(
  options: DefaultActionHandlerOptions = {},
): ActionHandlers {
  const {
    onNavigate,
    onToast,
    fetchFn = globalThis.fetch,
    baseURL = '',
  } = options

  // Internal state for dialog / sheet open tracking
  const panelState = new Map<string, boolean>()

  // Listeners that can be subscribed to for panel state changes
  const panelListeners = new Set<(target: string, open: boolean) => void>()

  function setPanelOpen(target: string, open: boolean) {
    panelState.set(target, open)
    for (const listener of panelListeners) {
      listener(target, open)
    }
  }

  const handlers: ActionHandlers = {
    // ---- Dialog ----
    openDialog: ((params: Record<string, unknown>) => {
      const target = params.target as string
      setPanelOpen(target, true)
    }) as ActionHandler,

    closeDialog: ((params: Record<string, unknown>) => {
      const target = params.target as string
      setPanelOpen(target, false)
    }) as ActionHandler,

    // ---- Sheet ----
    openSheet: ((params: Record<string, unknown>) => {
      const target = params.target as string
      setPanelOpen(target, true)
    }) as ActionHandler,

    closeSheet: ((params: Record<string, unknown>) => {
      const target = params.target as string
      setPanelOpen(target, false)
    }) as ActionHandler,

    // ---- Form ----
    submitForm: (async (params: Record<string, unknown>) => {
      const api = params.api as string
      const body = params.body as Record<string, unknown>
      const url = `${baseURL}${api}`

      const response = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error')
        throw new Error(`submitForm failed (${response.status}): ${text}`)
      }

      return response.json()
    }) as ActionHandler,

    // ---- Delete ----
    deleteItem: (async (params: Record<string, unknown>) => {
      const api = params.api as string
      const id = params.id as string
      const url = `${baseURL}${api}/${id}`

      const response = await fetchFn(url, { method: 'DELETE' })

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error')
        throw new Error(`deleteItem failed (${response.status}): ${text}`)
      }
    }) as ActionHandler,

    // ---- Refresh ----
    refresh: ((params: Record<string, unknown>) => {
      // Refresh is typically handled by the data layer.
      // This default implementation is a no-op placeholder.
      // The runtime's NeuronPage component should intercept this action
      // and trigger a re-fetch of the named dataSource.
      const _dataSource = params.dataSource as string
      void _dataSource
    }) as ActionHandler,

    // ---- Navigate ----
    navigate: ((params: Record<string, unknown>) => {
      const target = params.target as string
      if (onNavigate) {
        onNavigate(target)
      } else {
        // Fallback: browser navigation
        globalThis.location?.assign(target)
      }
    }) as ActionHandler,

    // ---- Toast ----
    toast: ((params: Record<string, unknown>) => {
      const message = params.message as string
      const variant = (params.variant as string) ?? 'info'
      if (onToast) {
        onToast(message, variant)
      } else {
        // Fallback: console
        // eslint-disable-next-line no-console
        console.log(`[toast:${variant}] ${message}`)
      }
    }) as ActionHandler,
  }

  return handlers
}
