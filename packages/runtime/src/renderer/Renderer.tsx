import React, { Suspense } from 'react'
import type {
  UITree,
  UIElement,
  ComponentRegistry,
  RendererProps,
  ActionSchema,
} from '../types'
import type { EventExecutor } from '../events/event-executor'
import { useActionContext } from './ActionContext'

function RenderElement({
  element,
  registry,
  tree,
  fallback: Fallback,
  eventExecutor,
  onNodeEvent,
}: {
  element: UIElement
  registry: ComponentRegistry
  tree: UITree
  fallback?: React.ComponentType<{ element: UIElement }>
  eventExecutor?: EventExecutor
  onNodeEvent?: (nodeId: string, eventName: string, params: Record<string, unknown>) => void
}) {
  const { dispatch } = useActionContext()

  // Handle virtual fragment root
  if (element.type === '__Fragment__') {
    return (
      <>
        {element.children?.map((childKey) => {
          const child = tree.elements[childKey]
          if (!child) return null
          return (
            <RenderElement
              key={childKey}
              element={child}
              registry={registry}
              tree={tree}
              fallback={Fallback}
              eventExecutor={eventExecutor}
              onNodeEvent={onNodeEvent}
            />
          )
        })}
      </>
    )
  }

  const Component = registry[element.type]
  if (!Component) {
    if (Fallback) return <Fallback element={element} />
    return (
      <div data-neuron-unknown={element.type}>
        Unknown component: {element.type}
      </div>
    )
  }

  // Render children recursively
  const childNodes = element.children?.map((childKey) => {
    const child = tree.elements[childKey]
    if (!child) return null
    return (
      <RenderElement
        key={childKey}
        element={child}
        registry={registry}
        tree={tree}
        fallback={Fallback}
        eventExecutor={eventExecutor}
        onNodeEvent={onNodeEvent}
      />
    )
  })

  const onAction = (action: ActionSchema) => dispatch(action)

  // Build event handlers from Page JSON events metadata
  const nodeEvents = element.props?.['__events'] as Record<string, unknown> | undefined
  if (nodeEvents && eventExecutor) {
    for (const [eventName, eventAction] of Object.entries(nodeEvents)) {
      const originalHandler = element.props[eventName]
      element.props[eventName] = async (...args: unknown[]) => {
        // Call original handler if exists
        if (typeof originalHandler === 'function') originalHandler(...args)
        // Execute event action
        await eventExecutor.execute(eventAction as any, args[0] as Record<string, unknown> ?? {})
        // Notify callback
        onNodeEvent?.(element.key, eventName, args[0] as Record<string, unknown> ?? {})
      }
    }
  }

  return (
    <Suspense fallback={null}>
      <Component props={element.props} onAction={onAction}>
        {childNodes && childNodes.length > 0 ? childNodes : undefined}
      </Component>
    </Suspense>
  )
}

export function Renderer({ tree, registry, fallback, eventExecutor, onNodeEvent }: RendererProps) {
  const rootElement = tree.elements[tree.root]
  if (!rootElement) return null

  return (
    <RenderElement
      element={rootElement}
      registry={registry}
      tree={tree}
      fallback={fallback}
      eventExecutor={eventExecutor}
      onNodeEvent={onNodeEvent}
    />
  )
}
