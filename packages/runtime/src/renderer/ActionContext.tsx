import { createContext, useContext, useCallback, useMemo } from 'react'
import type { ActionContextValue, ActionHandlers, ActionSchema } from '../types'

const ActionContext = createContext<ActionContextValue | null>(null)

export function useActionContext(): ActionContextValue {
  const ctx = useContext(ActionContext)
  if (!ctx) throw new Error('useActionContext must be used within ActionProvider')
  return ctx
}

export function ActionProvider({
  handlers,
  children,
}: {
  handlers: ActionHandlers
  children: React.ReactNode
}) {
  const dispatch = useCallback(
    (action: ActionSchema) => {
      const handler = handlers[action.name]
      if (!handler) {
        console.warn(`[neuron-ui] Unknown action: ${action.name}`)
        return
      }
      return handler(action.params)
    },
    [handlers],
  )

  const value = useMemo(() => ({ dispatch }), [dispatch])

  return (
    <ActionContext.Provider value={value}>{children}</ActionContext.Provider>
  )
}

export { ActionContext }
