// ============================================================
// PropsTab — Property editing tab (reuses existing PropertyPanel logic)
// ============================================================

import { useEditorStore } from '../../stores/editor-store'
import type { PageSchemaTreeNode } from '../../types'

interface PropsTabProps {
  node: PageSchemaTreeNode
}

export function PropsTab({ node }: PropsTabProps) {
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps)
  const props = node.props ?? {}

  function handlePropChange(key: string, value: unknown) {
    updateNodeProps(node.id, { [key]: value })
  }

  return (
    <div className="space-y-3">
      {/* domAttr */}
      <div className="space-y-1">
        <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
          domAttr
        </label>
        <input
          type="text"
          value={node.domAttr ?? ''}
          onChange={(e) => {
            useEditorStore.getState().updateNode(node.id, { domAttr: e.target.value || undefined })
          }}
          placeholder="DOM 标识"
          className="w-full text-xs border rounded px-2 py-1.5"
          style={{ borderColor: 'var(--gray-10)' }}
        />
      </div>

      {/* className */}
      {props.className !== undefined && (
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
            className
          </label>
          <input
            type="text"
            value={String(props.className ?? '')}
            onChange={(e) => handlePropChange('className', e.target.value)}
            className="w-full text-xs border rounded px-2 py-1.5"
            style={{ borderColor: 'var(--gray-10)' }}
          />
        </div>
      )}

      {/* Generic props editor */}
      {Object.entries(props).map(([key, value]) => {
        if (key === 'className') return null
        if (typeof value === 'boolean') {
          return (
            <div key={key} className="flex items-center justify-between">
              <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
                {key}
              </label>
              <button
                onClick={() => handlePropChange(key, !value)}
                className="text-xs px-2 py-0.5 rounded border"
                style={{
                  borderColor: value ? 'var(--blue)' : 'var(--gray-10)',
                  color: value ? 'var(--blue)' : 'var(--gray-07)',
                  background: value ? 'var(--blue)' + '10' : 'transparent',
                }}
              >
                {value ? '开' : '关'}
              </button>
            </div>
          )
        }
        if (typeof value === 'string') {
          return (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handlePropChange(key, e.target.value)}
                className="w-full text-xs border rounded px-2 py-1.5"
                style={{ borderColor: 'var(--gray-10)' }}
              />
            </div>
          )
        }
        if (typeof value === 'number') {
          return (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
                {key}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => handlePropChange(key, Number(e.target.value))}
                className="w-full text-xs border rounded px-2 py-1.5"
                style={{ borderColor: 'var(--gray-10)' }}
              />
            </div>
          )
        }
        // Complex types: show as read-only JSON
        return (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
              {key}
            </label>
            <pre
              className="text-[10px] p-2 rounded overflow-auto max-h-24"
              style={{ background: 'var(--gray-13)', color: 'var(--gray-05)' }}
            >
              {JSON.stringify(value, null, 2)}
            </pre>
          </div>
        )
      })}
    </div>
  )
}
