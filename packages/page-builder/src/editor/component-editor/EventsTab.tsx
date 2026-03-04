// ============================================================
// EventsTab — Event binding editor for ComponentEditor
// Supports navigate, callApi, refresh, show, hide, updateState
// ============================================================

import { useState } from 'react'
import { useEditorStore } from '../../stores/editor-store'
import type { PageSchemaTreeNode, PageSchema } from '../../types'
import type { EventAction } from '@neuron-ui/metadata'

const ACTION_TYPES = [
  { value: 'navigate', label: '导航到页面' },
  { value: 'callApi', label: '调用接口' },
  { value: 'refresh', label: '刷新组件' },
  { value: 'show', label: '显示组件' },
  { value: 'hide', label: '隐藏组件' },
  { value: 'updateState', label: '更新状态' },
]

// Common events per component type
const COMPONENT_EVENTS: Record<string, string[]> = {
  NButton: ['onClick'],
  NDataTable: ['onRowClick', 'onSort', 'onRefresh'],
  NForm: ['onSubmit', 'onChange'],
  NInput: ['onChange', 'onBlur'],
  NSelect: ['onChange'],
  NDialog: ['onConfirm', 'onCancel'],
  NAlertDialog: ['onConfirm', 'onCancel'],
  NCombobox: ['onChange'],
  NTextarea: ['onChange', 'onBlur'],
  default: ['onClick', 'onChange'],
}

interface EventsTabProps {
  node: PageSchemaTreeNode
  pageSchema: PageSchema
}

export function EventsTab({ node, pageSchema }: EventsTabProps) {
  const updateNode = useEditorStore((s) => s.updateNode)
  const events = node.events ?? {}
  const availableEvents = COMPONENT_EVENTS[node.component] ?? COMPONENT_EVENTS.default

  function updateEvent(eventName: string, action: EventAction | null) {
    const newEvents = { ...events }
    if (action === null) {
      delete newEvents[eventName]
    } else {
      newEvents[eventName] = action
    }
    updateNode(node.id, { events: newEvents })
  }

  return (
    <div className="space-y-4">
      {availableEvents.map((eventName) => (
        <EventRow
          key={eventName}
          eventName={eventName}
          action={events[eventName] ?? null}
          pageSchema={pageSchema}
          onChange={(action) => updateEvent(eventName, action)}
        />
      ))}
    </div>
  )
}

interface EventRowProps {
  eventName: string
  action: EventAction | null
  pageSchema: PageSchema
  onChange: (action: EventAction | null) => void
}

function EventRow({ eventName, action, pageSchema, onChange }: EventRowProps) {
  const [actionType, setActionType] = useState(action?.action ?? '')

  function handleActionTypeChange(type: string) {
    setActionType(type)
    if (!type) {
      onChange(null)
      return
    }
    // Initialize with minimal valid action
    const defaults: Record<string, EventAction> = {
      navigate: { action: 'navigate', target: '/' },
      callApi: { action: 'callApi', target: '' },
      refresh: { action: 'refresh', target: '' },
      show: { action: 'show', target: '' },
      hide: { action: 'hide', target: '' },
      updateState: { action: 'updateState', key: '', value: '' },
    }
    onChange(defaults[type] ?? null)
  }

  return (
    <div
      className="border rounded-lg p-3 space-y-2"
      style={{ borderColor: 'var(--gray-11)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: 'var(--gray-06)' }}>
          {eventName}
        </span>
      </div>

      <select
        value={actionType}
        onChange={(e) => handleActionTypeChange(e.target.value)}
        className="w-full text-xs border rounded px-2 py-1.5"
        style={{ borderColor: 'var(--gray-10)' }}
      >
        <option value="">暂无绑定</option>
        {ACTION_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Action-specific config */}
      {action && (
        <ActionConfig action={action} pageSchema={pageSchema} onChange={onChange} />
      )}
    </div>
  )
}

function ActionConfig({
  action,
  pageSchema,
  onChange,
}: {
  action: EventAction
  pageSchema: PageSchema
  onChange: (action: EventAction) => void
}) {
  switch (action.action) {
    case 'navigate':
      return (
        <div className="space-y-1">
          <label className="text-[10px]" style={{ color: 'var(--gray-07)' }}>
            目标路由
          </label>
          <input
            type="text"
            value={action.target}
            onChange={(e) => onChange({ ...action, target: e.target.value })}
            placeholder="/users/:id"
            className="w-full text-xs border rounded px-2 py-1.5"
            style={{ borderColor: 'var(--gray-10)' }}
          />
        </div>
      )
    case 'callApi':
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-[10px]" style={{ color: 'var(--gray-07)' }}>
              数据源
            </label>
            <select
              value={action.target}
              onChange={(e) => onChange({ ...action, target: e.target.value })}
              className="w-full text-xs border rounded px-2 py-1.5"
              style={{ borderColor: 'var(--gray-10)' }}
            >
              <option value="">选择数据源...</option>
              {Object.keys(pageSchema.dataSources ?? {}).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px]" style={{ color: 'var(--gray-07)' }}>
              成功后
            </label>
            <input
              type="text"
              value={action.onSuccess ?? ''}
              onChange={(e) => onChange({ ...action, onSuccess: e.target.value || undefined })}
              placeholder="refresh:component-id"
              className="w-full text-xs border rounded px-2 py-1.5"
              style={{ borderColor: 'var(--gray-10)' }}
            />
          </div>
        </div>
      )
    case 'refresh':
    case 'show':
    case 'hide':
      return (
        <div className="space-y-1">
          <label className="text-[10px]" style={{ color: 'var(--gray-07)' }}>
            目标组件
          </label>
          <select
            value={action.target}
            onChange={(e) => onChange({ ...action, target: e.target.value })}
            className="w-full text-xs border rounded px-2 py-1.5"
            style={{ borderColor: 'var(--gray-10)' }}
          >
            <option value="">选择目标...</option>
            {flattenNodes(pageSchema.tree).map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} ({n.component})
              </option>
            ))}
          </select>
        </div>
      )
    case 'updateState':
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-[10px]" style={{ color: 'var(--gray-07)' }}>
              状态 Key
            </label>
            <input
              type="text"
              value={action.key}
              onChange={(e) => onChange({ ...action, key: e.target.value })}
              placeholder="selectedId"
              className="w-full text-xs border rounded px-2 py-1.5"
              style={{ borderColor: 'var(--gray-10)' }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px]" style={{ color: 'var(--gray-07)' }}>
              值
            </label>
            <input
              type="text"
              value={String(action.value ?? '')}
              onChange={(e) => onChange({ ...action, value: e.target.value })}
              className="w-full text-xs border rounded px-2 py-1.5"
              style={{ borderColor: 'var(--gray-10)' }}
            />
          </div>
        </div>
      )
    default:
      return null
  }
}

/** Flatten the tree into a flat array for target selection */
function flattenNodes(nodes: PageSchemaTreeNode[]): PageSchemaTreeNode[] {
  const result: PageSchemaTreeNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children) {
      result.push(...flattenNodes(node.children))
    }
  }
  return result
}
