// ============================================================
// EditorRenderer — Visual editor renderer with interaction overlays
// Wraps each component from the UITree with selection/hover behavior
// ============================================================

import React, { useMemo, useCallback, Suspense } from 'react'
import { pageSchemaToUITree, createNeuronRegistry, FRAGMENT_TYPE } from '@neuron-ui/runtime'
import type { UITree, ComponentRegistry } from '@neuron-ui/runtime'
import { useEditorStore } from '../stores/editor-store'
import { useSelectionStore } from '../stores/selection-store'

// Singleton registry — created once and reused
const registry = createNeuronRegistry()

// ---- EditorNodeWrapper ----

interface EditorNodeWrapperProps {
  elementKey: string
  componentType: string
  children: React.ReactNode
}

/**
 * Wraps a rendered component with editor interaction behavior:
 * - Click to select (with stopPropagation to prevent parent selection)
 * - Hover highlight via onMouseEnter/onMouseLeave
 * - CSS class `editor-node-wrapper` with data attributes for styling
 * - Selection label shown above the component when selected
 */
function EditorNodeWrapper({ elementKey, componentType, children }: EditorNodeWrapperProps) {
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId)
  const hoveredNodeId = useSelectionStore((s) => s.hoveredNodeId)
  const select = useSelectionStore((s) => s.select)
  const hover = useSelectionStore((s) => s.hover)

  const isSelected = selectedNodeId === elementKey
  const isHovered = hoveredNodeId === elementKey

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      select(elementKey)
    },
    [elementKey, select],
  )

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      hover(elementKey)
    },
    [elementKey, hover],
  )

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      hover(null)
    },
    [hover],
  )

  return (
    <div
      className="editor-node-wrapper"
      data-selected={isSelected ? 'true' : undefined}
      data-hovered={isHovered ? 'true' : undefined}
      data-component-name={componentType}
      data-node-id={elementKey}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

// ---- RenderElement (recursive) ----

interface RenderElementProps {
  elementKey: string
  tree: UITree
  registry: ComponentRegistry
  editable: boolean
}

/**
 * Recursively renders a single UIElement from the tree.
 * In edit mode, wraps each element in an EditorNodeWrapper.
 * In preview mode, renders components directly without wrappers.
 */
function RenderElement({ elementKey, tree, registry: reg, editable }: RenderElementProps) {
  const element = tree.elements[elementKey]
  if (!element) return null

  // Handle the virtual __Fragment__ root (multiple root nodes)
  if (element.type === FRAGMENT_TYPE) {
    return (
      <>
        {element.children?.map((childKey) => (
          <RenderElement
            key={childKey}
            elementKey={childKey}
            tree={tree}
            registry={reg}
            editable={editable}
          />
        ))}
      </>
    )
  }

  const Component = reg[element.type]
  if (!Component) {
    const unknownContent = (
      <div
        data-neuron-unknown={element.type}
        className="p-2 border border-dashed border-[var(--gray-09)] rounded text-xs text-[var(--gray-06)]"
      >
        Unknown component: {element.type}
      </div>
    )

    if (!editable) return unknownContent

    return (
      <EditorNodeWrapper elementKey={elementKey} componentType={element.type}>
        {unknownContent}
      </EditorNodeWrapper>
    )
  }

  // Recursively render children
  const childNodes = element.children?.map((childKey) => (
    <RenderElement
      key={childKey}
      elementKey={childKey}
      tree={tree}
      registry={reg}
      editable={editable}
    />
  ))

  const rendered = (
    <Suspense fallback={null}>
      <Component props={element.props}>
        {childNodes && childNodes.length > 0 ? childNodes : undefined}
      </Component>
    </Suspense>
  )

  // In preview mode, render without wrapper
  if (!editable) return rendered

  // In edit mode, wrap with editor node
  return (
    <EditorNodeWrapper elementKey={elementKey} componentType={element.type}>
      {rendered}
    </EditorNodeWrapper>
  )
}

// ---- EditorRenderer ----

export interface EditorRendererProps {
  /** Whether to show edit overlays (false in preview mode) */
  editable?: boolean
}

/**
 * The core editor renderer. Reads the page schema from the editor store,
 * converts it to a flat UITree, then recursively renders each element
 * with editor interaction wrappers (selection, hover, component labels).
 *
 * This intentionally does NOT use the runtime's <Renderer> component,
 * because we need to inject EditorNodeWrapper around each component.
 */
export function EditorRenderer({ editable = true }: EditorRendererProps) {
  const pageSchema = useEditorStore((s) => s.pageSchema)

  // Convert nested PageSchema tree to flat UITree
  const tree = useMemo(() => {
    if (!pageSchema.tree || pageSchema.tree.length === 0) return null
    return pageSchemaToUITree(pageSchema)
  }, [pageSchema])

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-[var(--gray-08)]">
        <div className="text-center">
          <p className="text-sm">No components yet</p>
          <p className="text-xs mt-1 text-[var(--gray-10)]">
            Drag components from the panel or use AI to generate a page
          </p>
        </div>
      </div>
    )
  }

  const rootElement = tree.elements[tree.root]
  if (!rootElement) return null

  return (
    <div className="editor-renderer" data-editable={editable ? 'true' : undefined}>
      <RenderElement
        elementKey={tree.root}
        tree={tree}
        registry={registry}
        editable={editable}
      />
    </div>
  )
}
