// ============================================================
// DataTab — Data binding editor for ComponentEditor
// Data source selector + field mapping editor
// ============================================================

import { useEditorStore } from '../../stores/editor-store'
import type { PageSchemaTreeNode, PageSchema } from '../../types'

interface DataTabProps {
  node: PageSchemaTreeNode
  pageSchema: PageSchema
}

export function DataTab({ node, pageSchema }: DataTabProps) {
  const updateNode = useEditorStore((s) => s.updateNode)
  const binding = node.binding ?? {}
  const dataSources = pageSchema.dataSources ?? {}

  function updateBinding(patch: Partial<typeof binding>) {
    updateNode(node.id, { binding: { ...binding, ...patch } })
  }

  return (
    <div className="space-y-6">
      {/* Data source selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
          数据来源
        </label>
        <select
          value={binding.dataSource ?? ''}
          onChange={(e) => updateBinding({ dataSource: e.target.value || undefined })}
          className="w-full text-xs border rounded px-2 py-1.5"
          style={{ borderColor: 'var(--gray-10)' }}
        >
          <option value="">无</option>
          {Object.entries(dataSources).map(([key, ds]) => (
            <option key={key} value={key}>
              {key} — {ds.api}
            </option>
          ))}
        </select>
      </div>

      {/* Field path */}
      {binding.dataSource && (
        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
            字段路径
          </label>
          <input
            type="text"
            value={binding.field ?? ''}
            onChange={(e) => updateBinding({ field: e.target.value || undefined })}
            placeholder="items"
            className="w-full text-xs border rounded px-2 py-1.5"
            style={{ borderColor: 'var(--gray-10)' }}
          />
        </div>
      )}

      {/* Field mapping */}
      {binding.dataSource && (
        <div className="space-y-2">
          <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
            字段映射
          </label>
          <p className="text-[10px]" style={{ color: 'var(--gray-08)' }}>
            API 字段 → 组件字段
          </p>
          <FieldMapEditor
            fieldMap={binding.fieldMap ?? {}}
            onChange={(fieldMap) => updateBinding({ fieldMap })}
          />
        </div>
      )}

      {/* Data source info */}
      {binding.dataSource && dataSources[binding.dataSource] && (
        <div className="space-y-1">
          <label className="text-xs font-medium" style={{ color: 'var(--gray-05)' }}>
            数据源详情
          </label>
          <pre
            className="text-[10px] p-2 rounded overflow-auto max-h-32"
            style={{ background: 'var(--gray-14)', color: 'var(--gray-06)' }}
          >
            {JSON.stringify(dataSources[binding.dataSource], null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

function FieldMapEditor({
  fieldMap,
  onChange,
}: {
  fieldMap: Record<string, string>
  onChange: (map: Record<string, string>) => void
}) {
  const entries = Object.entries(fieldMap)

  function addEntry() {
    const newKey = `field_${entries.length}`
    onChange({ ...fieldMap, [newKey]: '' })
  }

  function updateEntry(oldKey: string, newKey: string, value: string) {
    const next = { ...fieldMap }
    if (oldKey !== newKey) delete next[oldKey]
    next[newKey] = value
    onChange(next)
  }

  function removeEntry(key: string) {
    const next = { ...fieldMap }
    delete next[key]
    onChange(next)
  }

  return (
    <div className="space-y-1">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-1">
          <input
            value={key}
            onChange={(e) => updateEntry(key, e.target.value, value)}
            placeholder="api.field"
            className="flex-1 text-xs border rounded px-2 py-1"
            style={{ borderColor: 'var(--gray-10)' }}
          />
          <span className="text-xs" style={{ color: 'var(--gray-08)' }}>
            →
          </span>
          <input
            value={value}
            onChange={(e) => updateEntry(key, key, e.target.value)}
            placeholder="column:名称"
            className="flex-1 text-xs border rounded px-2 py-1"
            style={{ borderColor: 'var(--gray-10)' }}
          />
          <button
            onClick={() => removeEntry(key)}
            className="text-xs px-1 hover:opacity-70"
            style={{ color: 'var(--error)' }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="text-xs mt-1 hover:opacity-80"
        style={{ color: 'var(--blue)' }}
      >
        + 添加映射
      </button>
    </div>
  )
}
