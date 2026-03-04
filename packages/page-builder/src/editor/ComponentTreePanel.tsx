// ============================================================
// ComponentTreePanel — Shows current page's component tree hierarchy
// Clicking a node scrolls to it in the canvas and highlights it
// ============================================================

import { useCallback } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { useEditorStore } from '../stores/editor-store'
import { useSelectionStore } from '../stores/selection-store'
import type { PageSchemaTreeNode } from '../types'

function scrollToNode(nodeId: string) {
  const el = document.querySelector(`[data-node-id="${nodeId}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-[var(--blue)]')
    setTimeout(() => el.classList.remove('ring-2', 'ring-[var(--blue)]'), 1500)
  }
}

interface TreeNodeItemProps {
  node: PageSchemaTreeNode
  depth: number
}

function TreeNodeItem({ node, depth }: TreeNodeItemProps) {
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId)
  const select = useSelectionStore((s) => s.select)
  const isSelected = selectedNodeId === node.id
  const hasChildren = node.children && node.children.length > 0

  const handleClick = useCallback(() => {
    select(node.id)
    scrollToNode(node.id)
  }, [node.id, select])

  return (
    <div>
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-1 px-2 py-1 text-left text-xs transition-colors rounded-sm"
        style={{
          paddingLeft: `${depth * 12 + 8}px`,
          background: isSelected ? 'var(--gray-12)' : 'transparent',
          color: isSelected ? 'var(--gray-02)' : 'var(--gray-05)',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'var(--gray-13)'
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent'
        }}
      >
        {hasChildren ? (
          <ChevronDown size={10} className="shrink-0" style={{ color: 'var(--gray-07)' }} />
        ) : (
          <ChevronRight size={10} className="shrink-0 opacity-0" />
        )}
        <span className="truncate font-mono">{node.id}</span>
        <span
          className="ml-auto shrink-0 text-[10px]"
          style={{ color: 'var(--gray-08)' }}
        >
          {node.component.replace(/^N/, '')}
        </span>
      </button>
      {hasChildren &&
        node.children!.map((child) => (
          <TreeNodeItem key={child.id} node={child} depth={depth + 1} />
        ))}
    </div>
  )
}

export function ComponentTreePanel() {
  const tree = useEditorStore((s) => s.pageSchema.tree)

  if (tree.length === 0) {
    return (
      <div className="p-3 text-xs" style={{ color: 'var(--gray-07)' }}>
        暂无组件
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div
        className="sticky top-0 z-10 border-b px-3 py-2"
        style={{
          background: 'var(--gray-13)',
          borderColor: 'var(--gray-11)',
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--gray-03)' }}
        >
          Tree
        </h2>
      </div>
      <div className="py-1">
        {tree.map((node) => (
          <TreeNodeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  )
}
