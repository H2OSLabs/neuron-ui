// ============================================================
// EditorBreadcrumb — Shows the selected node's path in the tree
// Displays ancestor chain: root > parent > ... > selected
// ============================================================

import React, { useMemo } from 'react'
import { useSelectionStore } from '../stores/selection-store'
import { useEditorStore } from '../stores/editor-store'
import type { PageSchemaTreeNode } from '../types'

/**
 * Build the path from the root of the tree to the node with the given ID.
 * Returns an array of { id, component } objects representing each ancestor
 * from root down to the target node, inclusive.
 */
function buildPathToNode(
  nodes: PageSchemaTreeNode[],
  targetId: string,
  currentPath: Array<{ id: string; component: string }> = [],
): Array<{ id: string; component: string }> | null {
  for (const node of nodes) {
    const pathWithCurrent = [...currentPath, { id: node.id, component: node.component }]

    if (node.id === targetId) {
      return pathWithCurrent
    }

    if (node.children && node.children.length > 0) {
      const found = buildPathToNode(node.children, targetId, pathWithCurrent)
      if (found) return found
    }
  }

  return null
}

/**
 * Displays a breadcrumb trail showing the path from root to the currently
 * selected node. Each segment is clickable to select that ancestor node.
 *
 * Renders nothing when no node is selected.
 */
export function EditorBreadcrumb() {
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId)
  const select = useSelectionStore((s) => s.select)
  const tree = useEditorStore((s) => s.pageSchema.tree)

  const path = useMemo(() => {
    if (!selectedNodeId) return null
    return buildPathToNode(tree, selectedNodeId)
  }, [tree, selectedNodeId])

  if (!selectedNodeId || !path || path.length === 0) {
    return null
  }

  return (
    <nav
      className="flex items-center gap-1 text-xs text-[var(--gray-06)] px-4 py-2 border-t border-[var(--gray-12)]"
      aria-label="Component tree path"
    >
      <span className="text-[var(--gray-08)] select-none">Path:</span>
      {path.map((segment, i) => (
        <React.Fragment key={segment.id}>
          {i > 0 && <span className="text-[var(--gray-10)] select-none">/</span>}
          <button
            onClick={() => select(segment.id)}
            className={`hover:text-[var(--gray-02)] transition-colors ${
              segment.id === selectedNodeId
                ? 'text-[var(--blue)] font-medium'
                : ''
            }`}
            title={`Select ${segment.component}`}
          >
            {segment.component}
          </button>
        </React.Fragment>
      ))}
    </nav>
  )
}
