import React, { Suspense } from 'react'
import type {
  UITree,
  UIElement,
  ComponentRegistry,
  RendererProps,
  ActionSchema,
} from '../types'
import { useActionContext } from './ActionContext'

function RenderElement({
  element,
  registry,
  tree,
  fallback: Fallback,
}: {
  element: UIElement
  registry: ComponentRegistry
  tree: UITree
  fallback?: React.ComponentType<{ element: UIElement }>
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
      />
    )
  })

  const onAction = (action: ActionSchema) => dispatch(action)

  return (
    <Suspense fallback={null}>
      <Component props={element.props} onAction={onAction}>
        {childNodes && childNodes.length > 0 ? childNodes : undefined}
      </Component>
    </Suspense>
  )
}

export function Renderer({ tree, registry, fallback }: RendererProps) {
  const rootElement = tree.elements[tree.root]
  if (!rootElement) return null

  return (
    <RenderElement
      element={rootElement}
      registry={registry}
      tree={tree}
      fallback={fallback}
    />
  )
}
