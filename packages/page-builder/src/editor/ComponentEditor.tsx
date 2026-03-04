// ============================================================
// ComponentEditor — Full-screen component editor with 3 tabs
// Props / Events / Data Binding
// ============================================================

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useEditorStore, findNodeInTree } from '../stores/editor-store'
import { PropsTab } from './component-editor/PropsTab'
import { EventsTab } from './component-editor/EventsTab'
import { DataTab } from './component-editor/DataTab'
import type { PageSchemaTreeNode } from '../types'

type Tab = 'props' | 'events' | 'data'

const TAB_LABELS: Record<Tab, string> = {
  props: '属性',
  events: '事件',
  data: '数据',
}

export function ComponentEditor() {
  const [activeTab, setActiveTab] = useState<Tab>('props')
  const nodeId = useEditorStore((s) => s.componentEditorNodeId)
  const closeComponentEditor = useEditorStore((s) => s.closeComponentEditor)
  const pageSchema = useEditorStore((s) => s.pageSchema)

  if (!nodeId) return null

  // Find node in page schema tree
  const location = findNodeInTree(pageSchema.tree, nodeId)
  if (!location) return null
  const node = location.node

  return (
    <div className="fixed inset-0 z-40 flex bg-white">
      {/* Left: Preview */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--gray-14)' }}
      >
        <ComponentPreview node={node} />
      </div>

      {/* Right: Tabs */}
      <div className="w-80 border-l flex flex-col" style={{ borderColor: 'var(--gray-11)' }}>
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b"
          style={{ borderColor: 'var(--gray-11)' }}
        >
          <button
            onClick={closeComponentEditor}
            className="hover:opacity-70 transition-opacity"
            style={{ color: 'var(--gray-06)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--gray-02)' }}>
            {node.component}
          </span>
          <span className="text-xs" style={{ color: 'var(--gray-07)' }}>
            #{node.id}
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b" style={{ borderColor: 'var(--gray-11)' }}>
          {(['props', 'events', 'data'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 text-xs font-medium transition-colors"
              style={{
                color: activeTab === tab ? 'var(--blue)' : 'var(--gray-06)',
                borderBottom: activeTab === tab ? '2px solid var(--blue)' : '2px solid transparent',
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'props' && <PropsTab node={node} />}
          {activeTab === 'events' && <EventsTab node={node} pageSchema={pageSchema} />}
          {activeTab === 'data' && <DataTab node={node} pageSchema={pageSchema} />}
        </div>
      </div>
    </div>
  )
}

/** Simple preview of the node's info */
function ComponentPreview({ node }: { node: PageSchemaTreeNode }) {
  return (
    <div
      className="max-w-md w-full rounded-xl border p-6"
      style={{ borderColor: 'var(--gray-11)', background: 'white' }}
    >
      <div className="text-center space-y-3">
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: 'var(--blue)' + '15', color: 'var(--blue)' }}
        >
          {node.component}
        </div>
        <div className="text-sm font-mono" style={{ color: 'var(--gray-05)' }}>
          id: {node.id}
        </div>
        {node.domAttr && (
          <div className="text-xs" style={{ color: 'var(--gray-07)' }}>
            domAttr: {node.domAttr}
          </div>
        )}
        <div className="text-left mt-4">
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--gray-05)' }}>
            Props
          </div>
          <pre
            className="text-[10px] p-3 rounded overflow-auto max-h-48"
            style={{ background: 'var(--gray-14)', color: 'var(--gray-05)' }}
          >
            {JSON.stringify(node.props ?? {}, null, 2)}
          </pre>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="text-xs" style={{ color: 'var(--gray-07)' }}>
            {node.children.length} 个子节点
          </div>
        )}
      </div>
    </div>
  )
}
