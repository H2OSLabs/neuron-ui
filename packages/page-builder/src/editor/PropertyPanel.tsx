// ============================================================
// PropertyPanel — Right sidebar showing property editors for selected node
// ============================================================

import { useSelectionStore } from '../stores/selection-store'
import { useEditorStore, findNodeInTree } from '../stores/editor-store'
import { PropEditorFactory } from '../property-editors/PropEditorFactory'
import { Trash2, MousePointerClick } from 'lucide-react'

// Props that should be hidden from the editor (internal-only)
const HIDDEN_PROPS = new Set(['children', 'key', 'ref', 'className', 'style'])

export function PropertyPanel() {
  const selectedNodeId = useSelectionStore((s) => s.selectedNodeId)
  const deselect = useSelectionStore((s) => s.deselect)
  const tree = useEditorStore((s) => s.pageSchema.tree)
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps)
  const removeNode = useEditorStore((s) => s.removeNode)

  // Find the selected node in the tree
  const location = selectedNodeId ? findNodeInTree(tree, selectedNodeId) : null
  const selectedNode = location?.node ?? null

  // Handler for prop changes
  const handlePropChange = (propKey: string, value: unknown) => {
    if (!selectedNodeId) return
    updateNodeProps(selectedNodeId, { [propKey]: value })
  }

  // Handler for deleting the selected component
  const handleDelete = () => {
    if (!selectedNodeId) return
    removeNode(selectedNodeId)
    deselect()
  }

  // Empty state — no selection
  if (!selectedNode) {
    return (
      <div
        className="editor-panel flex h-full w-full flex-col items-center justify-center"
        style={{ background: 'var(--gray-13)' }}
      >
        <MousePointerClick
          size={32}
          strokeWidth={1}
          style={{ color: 'var(--gray-07)' }}
        />
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--gray-06)' }}
        >
          Select a component
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: 'var(--gray-07)' }}
        >
          to edit its properties
        </p>
      </div>
    )
  }

  // Get props to display (filter out hidden ones)
  const props = selectedNode.props ?? {}
  const propEntries = Object.entries(props).filter(
    ([key]) => !HIDDEN_PROPS.has(key),
  )

  return (
    <div
      className="editor-panel flex h-full w-full flex-col overflow-hidden"
      style={{ background: 'var(--gray-13)' }}
    >
      {/* Panel header with component name */}
      <div
        className="shrink-0 border-b px-3 py-2.5"
        style={{ borderColor: 'var(--gray-11)' }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-sm font-semibold"
            style={{ color: 'var(--gray-01)' }}
          >
            {selectedNode.component}
          </h2>
          <span
            className="rounded px-1.5 py-0.5 text-[10px]"
            style={{
              background: 'var(--blue)',
              color: 'var(--gray-01)',
            }}
          >
            {selectedNode.id}
          </span>
        </div>
      </div>

      {/* Properties list */}
      <div className="flex-1 overflow-y-auto p-3">
        {propEntries.length === 0 ? (
          <p
            className="py-4 text-center text-xs"
            style={{ color: 'var(--gray-06)' }}
          >
            No editable properties
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {propEntries.map(([key, value]) => (
              <PropEditorFactory
                key={key}
                propKey={key}
                value={value}
                onChange={(newValue) => handlePropChange(key, newValue)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div
        className="shrink-0 border-t p-3"
        style={{ borderColor: 'var(--gray-11)' }}
      >
        <button
          type="button"
          onClick={handleDelete}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors"
          style={{
            borderColor: 'var(--error)',
            color: 'var(--error)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--error)'
            e.currentTarget.style.color = 'var(--gray-14)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--error)'
          }}
        >
          <Trash2 size={14} />
          Delete Component
        </button>
      </div>
    </div>
  )
}
