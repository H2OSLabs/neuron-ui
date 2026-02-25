// ============================================================
// @neuron-ui/runtime - Schema Adapter
// Converts nested PageSchema tree → flat UITree (adjacency map)
// ============================================================

import type { PageSchema, PageSchemaTreeNode } from '@neuron-ui/metadata'
import type { UITree, UIElement } from '../types'
import { adaptBinding } from './binding-adapter'

/** Virtual root element key used when a PageSchema has multiple root nodes */
export const VIRTUAL_ROOT_KEY = '__root__'

/** Virtual fragment type used as wrapper for multiple root nodes */
export const FRAGMENT_TYPE = '__Fragment__'

/**
 * Convert a nested PageSchema into a flat UITree.
 *
 * The UITree uses an adjacency-map structure where each element references
 * its children by key. This flat format is what the renderer consumes.
 *
 * If the schema has a single root node, it becomes the UITree root directly.
 * If the schema has multiple root nodes, they are wrapped in a virtual
 * `__Fragment__` container.
 */
export function pageSchemaToUITree(schema: PageSchema): UITree {
  const elements: Record<string, UIElement> = {}

  function flatten(node: PageSchemaTreeNode): string {
    // Recursively flatten children first so they exist in the map
    const childKeys = (node.children || []).map(child => flatten(child))

    // Build adapted props: start with static props, then merge binding
    const adaptedProps: Record<string, unknown> = { ...(node.props || {}) }

    if (node.binding) {
      Object.assign(adaptedProps, adaptBinding(node.binding))
    }

    elements[node.id] = {
      key: node.id,
      type: node.component,
      props: adaptedProps,
      children: childKeys.length > 0 ? childKeys : undefined,
    }

    return node.id
  }

  // Handle single root vs. multiple roots
  if (schema.tree.length === 1) {
    const rootId = flatten(schema.tree[0])
    return { root: rootId, elements }
  }

  // Multiple roots: wrap in a virtual fragment container
  const childKeys = schema.tree.map(node => flatten(node))
  elements[VIRTUAL_ROOT_KEY] = {
    key: VIRTUAL_ROOT_KEY,
    type: FRAGMENT_TYPE,
    props: {},
    children: childKeys,
  }

  return { root: VIRTUAL_ROOT_KEY, elements }
}

/**
 * Extract all unique component type names used in a PageSchema tree.
 *
 * Useful for pre-validating that all required components are registered
 * in the catalog before attempting to render.
 */
export function extractComponentNames(tree: PageSchemaTreeNode[]): string[] {
  const names = new Set<string>()

  function walk(nodes: PageSchemaTreeNode[]): void {
    for (const node of nodes) {
      names.add(node.component)
      if (node.children) {
        walk(node.children)
      }
    }
  }

  walk(tree)
  return Array.from(names)
}
