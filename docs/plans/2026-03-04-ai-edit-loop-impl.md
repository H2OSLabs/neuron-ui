# AI 编辑闭环系统 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建完整的 AI 编辑闭环系统：用户提供输入文档 → AI 生成项目专属组件 + Page JSON → App-UI 可视化预览和编辑 → MCP Server 供 AI 客户端操作。

**Architecture:** 两层设计：Layer 1（项目专属 .tsx 组件，shadcn 二开）+ Layer 2（Page JSON，由 Runtime 渲染）。Page JSON 是唯一真相，组件树从 JSON 读取而非 DOM 分析。MCP Server 暴露 6 个 Tools 和 6 个 Resources，供 Claude Code / Cursor 等 AI 客户端操作。

**Tech Stack:** React 18 + TypeScript + Tailwind CSS v4、Zustand（状态管理）、Zod（Schema 校验）、`@modelcontextprotocol/sdk`（MCP）、Vite HMR（热加载）、`@neuron-ui/runtime`（渲染引擎）

---

## 依赖关系

```
Phase 1（Page JSON 扩展）
    ↓
Phase 2（事件执行引擎）← 依赖 Phase 1
    ↓
Phase 3（App-UI hover 层）← 依赖 Phase 1
    ↓
Phase 4（Component Editor 扩展）← 依赖 Phase 1 + 3
    ↓
Phase 5（MCP Server）← 依赖 Phase 1 + 4
    ↓
Phase 6（AI 生成流水线）← 依赖 Phase 1 + 5
```

---

## Phase 1：扩展 Page JSON Schema

**目标：** 在现有 `PageSchema` 基础上增加 `domAttr`、`events`、`binding.fieldMap`，并为事件动作类型建立 Zod 校验。

### Task 1.1：扩展 PageSchemaTreeNode 类型

**Files:**
- Modify: `packages/metadata/src/types.ts`
- Test: `packages/metadata/src/__tests__/types.test.ts`（新建）

**Step 1: 写失败的测试**

```typescript
// packages/metadata/src/__tests__/types.test.ts
import { describe, it, expect } from 'vitest'
import { pageSchemaTreeNodeSchema } from '../schemas'

describe('PageSchemaTreeNode events', () => {
  it('accepts navigate event action', () => {
    const node = {
      id: 'btn',
      component: 'NButton',
      props: {},
      domAttr: 'btn',
      events: {
        onClick: { action: 'navigate', target: '/users/:id' }
      }
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(true)
  })

  it('accepts callApi event action', () => {
    const node = {
      id: 'table',
      component: 'NDataTable',
      props: {},
      events: {
        onSort: { action: 'callApi', target: 'userList', merge: 'params' }
      }
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(true)
  })

  it('rejects unknown event action', () => {
    const node = {
      id: 'btn',
      component: 'NButton',
      props: {},
      events: {
        onClick: { action: 'unknownAction' }
      }
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(false)
  })
})
```

**Step 2: 运行测试确认失败**

```bash
pnpm --filter @neuron-ui/metadata test
```
期望：FAIL — `pageSchemaTreeNodeSchema` 不存在或缺少 events 字段

**Step 3: 扩展类型定义**

在 `packages/metadata/src/types.ts` 中增加：

```typescript
// 事件动作类型
export type EventAction =
  | { action: 'navigate'; target: string; params?: Record<string, string> }
  | { action: 'callApi'; target: string; merge?: 'params' | 'body'; onSuccess?: string; onError?: string }
  | { action: 'refresh'; target: string }
  | { action: 'show'; target: string }
  | { action: 'hide'; target: string }
  | { action: 'updateState'; key: string; value: unknown }

// 扩展 PageSchemaTreeNode，增加 domAttr 和 events
// 在现有 PageSchemaTreeNode 接口中添加：
//   domAttr?: string
//   events?: Record<string, EventAction>
// 在现有 binding 中添加：
//   fieldMap?: Record<string, string>
```

**Step 4: 导出 Zod Schema**

在 `packages/metadata/src/schemas.ts`（或新建此文件）中：

```typescript
import { z } from 'zod'

export const eventActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('navigate'), target: z.string(), params: z.record(z.string()).optional() }),
  z.object({ action: z.literal('callApi'), target: z.string(), merge: z.enum(['params', 'body']).optional(), onSuccess: z.string().optional(), onError: z.string().optional() }),
  z.object({ action: z.literal('refresh'), target: z.string() }),
  z.object({ action: z.literal('show'), target: z.string() }),
  z.object({ action: z.literal('hide'), target: z.string() }),
  z.object({ action: z.literal('updateState'), key: z.string(), value: z.unknown() }),
])

export const pageSchemaTreeNodeSchema: z.ZodType<PageSchemaTreeNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    component: z.string(),
    props: z.record(z.unknown()).optional().default({}),
    domAttr: z.string().optional(),
    binding: z.object({
      dataSource: z.string().optional(),
      field: z.string().optional(),
      onChange: z.string().optional(),
      onClick: z.string().optional(),
      onSubmit: z.string().optional(),
      onConfirm: z.string().optional(),
      prefill: z.string().optional(),
      fieldMap: z.record(z.string()).optional(),
    }).optional(),
    events: z.record(eventActionSchema).optional(),
    children: z.array(pageSchemaTreeNodeSchema).optional(),
  })
)
```

**Step 5: 运行测试确认通过**

```bash
pnpm --filter @neuron-ui/metadata test
```
期望：PASS

**Step 6: 提交**

```bash
git add packages/metadata/src/
git commit -m "feat(metadata): extend PageSchemaTreeNode with domAttr, events, fieldMap"
```

---

### Task 1.2：更新现有 spec/schemas 示例文件

**Files:**
- Modify: `spec/schemas/task-management.schema.json`
- Modify: `spec/schemas/task-execution.schema.json`

**Step 1: 在 task-management.schema.json 的 task-table 节点增加 domAttr 和 events**

```json
{
  "id": "task-table",
  "component": "NDataTable",
  "domAttr": "task-table",
  "events": {
    "onRowClick": { "action": "navigate", "target": "/projects/:projectId/tasks/:id" }
  }
}
```

**Step 2: 验证 JSON 格式有效**

```bash
node -e "JSON.parse(require('fs').readFileSync('spec/schemas/task-management.schema.json','utf8')); console.log('OK')"
```

**Step 3: 提交**

```bash
git add spec/schemas/
git commit -m "feat(schemas): add domAttr and events to example schemas"
```

---

## Phase 2：事件执行引擎

**目标：** Runtime 能够读取 Page JSON 中的 `events` 定义并真正执行动作（navigate、callApi、refresh、show/hide、updateState）。

### Task 2.1：事件执行器核心

**Files:**
- Create: `packages/runtime/src/events/event-executor.ts`
- Create: `packages/runtime/src/events/index.ts`
- Test: `packages/runtime/src/__tests__/event-executor.test.ts`

**Step 1: 写失败的测试**

```typescript
// packages/runtime/src/__tests__/event-executor.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createEventExecutor } from '../events/event-executor'

describe('createEventExecutor', () => {
  it('calls navigate handler for navigate action', async () => {
    const navigate = vi.fn()
    const executor = createEventExecutor({ navigate, refresh: vi.fn(), dataProvider: null as any })
    await executor.execute({ action: 'navigate', target: '/users/123' })
    expect(navigate).toHaveBeenCalledWith('/users/123')
  })

  it('calls dataProvider.mutate for callApi action', async () => {
    const mutate = vi.fn().mockResolvedValue({ id: 1 })
    const executor = createEventExecutor({
      navigate: vi.fn(),
      refresh: vi.fn(),
      dataProvider: { fetch: vi.fn(), mutate }
    })
    await executor.execute({ action: 'callApi', target: 'createUser' })
    expect(mutate).toHaveBeenCalled()
  })

  it('calls refresh handler for refresh action', async () => {
    const refresh = vi.fn()
    const executor = createEventExecutor({ navigate: vi.fn(), refresh, dataProvider: null as any })
    await executor.execute({ action: 'refresh', target: 'user-table' })
    expect(refresh).toHaveBeenCalledWith('user-table')
  })
})
```

**Step 2: 运行测试确认失败**

```bash
pnpm --filter @neuron-ui/runtime test
```

**Step 3: 实现事件执行器**

```typescript
// packages/runtime/src/events/event-executor.ts
import type { EventAction } from '@neuron-ui/metadata'
import type { DataProvider } from '../types'

interface EventExecutorContext {
  navigate: (path: string) => void
  refresh: (componentId: string) => void
  dataProvider: DataProvider
  dataSources?: Record<string, { api: string; params?: Record<string, unknown> }>
  pageState?: Record<string, unknown>
  setPageState?: (key: string, value: unknown) => void
  visibilityState?: Record<string, boolean>
  setVisibility?: (componentId: string, visible: boolean) => void
}

export interface EventExecutor {
  execute: (action: EventAction, eventParams?: Record<string, unknown>) => Promise<void>
}

export function createEventExecutor(ctx: EventExecutorContext): EventExecutor {
  return {
    async execute(action, eventParams = {}) {
      switch (action.action) {
        case 'navigate': {
          // Replace :param with eventParams
          const path = action.target.replace(/:(\w+)/g, (_, key) =>
            String(eventParams[key] ?? `:${key}`)
          )
          ctx.navigate(path)
          break
        }
        case 'callApi': {
          const source = ctx.dataSources?.[action.target]
          if (!source) break
          const [method, endpoint] = source.api.split(' ')
          const body = action.merge === 'body' ? { ...source.params, ...eventParams } : eventParams
          const params = action.merge === 'params' ? { ...source.params, ...eventParams } : source.params
          await ctx.dataProvider.mutate({ method, path: endpoint }, body || params)
          if (action.onSuccess) {
            const [successAction, successTarget] = action.onSuccess.split(':')
            if (successAction === 'refresh') ctx.refresh(successTarget)
          }
          break
        }
        case 'refresh':
          ctx.refresh(action.target)
          break
        case 'show':
          ctx.setVisibility?.(action.target, true)
          break
        case 'hide':
          ctx.setVisibility?.(action.target, false)
          break
        case 'updateState':
          ctx.setPageState?.(action.key, action.value)
          break
      }
    }
  }
}
```

**Step 4: 运行测试确认通过**

```bash
pnpm --filter @neuron-ui/runtime test
```

**Step 5: 提交**

```bash
git add packages/runtime/src/events/
git commit -m "feat(runtime): add event executor for Page JSON events"
```

---

### Task 2.2：将事件执行器集成到 Runtime 渲染器

**Files:**
- Modify: `packages/runtime/src/renderer/index.ts`
- Modify: `packages/runtime/src/types.ts`

**Step 1: 在 RendererProps 中增加事件上下文**

在 `packages/runtime/src/types.ts` 的 `RendererProps` 中添加：

```typescript
export interface RendererProps {
  tree: UITree
  registry: ComponentRegistry
  fallback?: React.ComponentType<{ element: UIElement }>
  // 新增
  eventExecutor?: EventExecutor
  onNodeEvent?: (nodeId: string, eventName: string, params: Record<string, unknown>) => void
}
```

**Step 2: Renderer 在渲染每个节点时将事件处理器传入组件**

每个注册组件接收 `onEvent` prop，触发时调用 `eventExecutor.execute(eventAction, params)`。

**Step 3: 构建验证**

```bash
pnpm --filter @neuron-ui/runtime build
```
期望：无 TypeScript 错误

**Step 4: 提交**

```bash
git add packages/runtime/src/
git commit -m "feat(runtime): wire event executor into renderer"
```

---

## Phase 3：App-UI hover 层与 data-node-id

**目标：** 画布中每个渲染的组件根元素有 `data-node-id` 属性，鼠标悬停时显示 [编辑] [Chat] 浮层。

### Task 3.1：EditorNodeWrapper 注入 data-node-id

**Files:**
- Modify: `packages/page-builder/src/renderer/EditorRenderer.tsx`

**Step 1: 读取现有 EditorRenderer 实现**

```bash
cat packages/page-builder/src/renderer/EditorRenderer.tsx
```

**Step 2: 在 wrapper div 上添加 data-node-id**

找到 EditorNodeWrapper 渲染节点的地方，确保 `data-node-id={node.id}` 被添加到根元素：

```tsx
<div
  data-node-id={node.id}
  data-neuron-component={node.component}
  className={`editor-node-wrapper relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
  onClick={handleClick}
>
  {children}
</div>
```

**Step 3: 构建验证**

```bash
pnpm --filter @neuron-ui/page-builder build
```

**Step 4: 提交**

```bash
git add packages/page-builder/src/renderer/
git commit -m "feat(page-builder): add data-node-id attribute to EditorNodeWrapper"
```

---

### Task 3.2：Hover 浮层（编辑 + Chat 按钮）

**Files:**
- Modify: `packages/page-builder/src/renderer/EditorRenderer.tsx`
- Create: `packages/page-builder/src/renderer/NodeHoverToolbar.tsx`

**Step 1: 创建 NodeHoverToolbar 组件**

```tsx
// packages/page-builder/src/renderer/NodeHoverToolbar.tsx
import { Pencil, MessageCircle } from 'lucide-react'

interface NodeHoverToolbarProps {
  nodeId: string
  onEdit: (nodeId: string) => void
  onChat: (nodeId: string) => void
}

export function NodeHoverToolbar({ nodeId, onEdit, onChat }: NodeHoverToolbarProps) {
  return (
    <div className="absolute top-1 right-1 z-50 hidden group-hover:flex gap-1 bg-white border border-gray-200 rounded shadow-sm p-0.5">
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(nodeId) }}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
        title="编辑"
      >
        <Pencil size={12} />
        编辑
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onChat(nodeId) }}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
        title="Chat"
      >
        <MessageCircle size={12} />
        Chat
      </button>
    </div>
  )
}
```

**Step 2: 在 EditorNodeWrapper 中渲染 NodeHoverToolbar**

```tsx
<div
  data-node-id={node.id}
  className="relative group ..."
>
  <NodeHoverToolbar
    nodeId={node.id}
    onEdit={handleEnterComponentEditor}
    onChat={handleActivateChatContext}
  />
  {children}
</div>
```

**Step 3: 在 App 状态中增加 componentEditorNodeId 和 activeChatNodeId**

在 `packages/page-builder/src/stores/editor-store.ts` 中增加：

```typescript
componentEditorNodeId: string | null
activeChatNodeId: string | null
openComponentEditor: (nodeId: string) => void
closeCom ponentEditor: () => void
setActiveChatContext: (nodeId: string | null) => void
```

**Step 4: 构建验证**

```bash
pnpm --filter @neuron-ui/page-builder build
```

**Step 5: 提交**

```bash
git add packages/page-builder/src/
git commit -m "feat(page-builder): add hover toolbar with edit and chat buttons"
```

---

### Task 3.3：左侧组件树高亮当前选中节点

**Files:**
- Modify: `packages/page-builder/src/editor/PageListPanel.tsx`

**Step 1: 当组件树中某项被点击时，通过 data-node-id 找到对应 DOM 并滚动高亮**

```typescript
function scrollToNode(nodeId: string) {
  const el = document.querySelector(`[data-node-id="${nodeId}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-blue-400')
    setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400'), 1500)
  }
}
```

**Step 2: 提交**

```bash
git add packages/page-builder/src/editor/
git commit -m "feat(page-builder): scroll and highlight node from component tree"
```

---

## Phase 4：Component Editor（三 Tab 扩展）

**目标：** 将现有 PropertyPanel 扩展为三个 Tab：属性 / 事件 / 数据绑定，并在独立的 ComponentEditor 路由/面板中展示。

### Task 4.1：创建 ComponentEditor 容器

**Files:**
- Create: `packages/page-builder/src/editor/ComponentEditor.tsx`

```tsx
// packages/page-builder/src/editor/ComponentEditor.tsx
import { useState } from 'react'
import { PropsTab } from './component-editor/PropsTab'
import { EventsTab } from './component-editor/EventsTab'
import { DataTab } from './component-editor/DataTab'
import { useEditorStore } from '../stores/editor-store'
import { useSelectionStore } from '../stores/selection-store'
import { ArrowLeft } from 'lucide-react'

type Tab = 'props' | 'events' | 'data'

export function ComponentEditor() {
  const [activeTab, setActiveTab] = useState<Tab>('props')
  const nodeId = useEditorStore(s => s.componentEditorNodeId)
  const closeComponentEditor = useEditorStore(s => s.closeComponentEditor)
  const pageSchema = useEditorStore(s => s.pageSchema)

  if (!nodeId) return null

  // Find node in page schema tree
  const node = findNodeById(pageSchema.tree, nodeId)
  if (!node) return null

  return (
    <div className="fixed inset-0 z-40 flex bg-white">
      {/* Left: Preview */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
        <ComponentPreview node={node} />
      </div>

      {/* Right: Tabs */}
      <div className="w-80 border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <button onClick={closeComponentEditor} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-medium">正在编辑：{node.component}</span>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {(['props', 'events', 'data'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {{ props: '属性', events: '事件', data: '数据' }[tab]}
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
```

**Step 2: 提交**

```bash
git add packages/page-builder/src/editor/ComponentEditor.tsx
git commit -m "feat(page-builder): add ComponentEditor container with three tabs"
```

---

### Task 4.2：EventsTab — 事件面板

**Files:**
- Create: `packages/page-builder/src/editor/component-editor/EventsTab.tsx`

```tsx
// packages/page-builder/src/editor/component-editor/EventsTab.tsx
import { useState } from 'react'
import { useEditorStore } from '../../stores/editor-store'
import type { PageSchemaTreeNode, EventAction } from '@neuron-ui/metadata'
import type { PageSchema } from '../../types'

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
  default: ['onClick', 'onChange'],
}

interface EventsTabProps {
  node: PageSchemaTreeNode
  pageSchema: PageSchema
}

export function EventsTab({ node, pageSchema }: EventsTabProps) {
  const updateNode = useEditorStore(s => s.updateNode)
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
      {availableEvents.map(eventName => (
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
    if (!type) { onChange(null); return }
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
    <div className="border border-gray-100 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-gray-500">{eventName}</span>
      </div>

      <select
        value={actionType}
        onChange={e => handleActionTypeChange(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
      >
        <option value="">暂无绑定</option>
        {ACTION_TYPES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Action-specific config */}
      {action && <ActionConfig action={action} pageSchema={pageSchema} onChange={onChange} />}
    </div>
  )
}

function ActionConfig({ action, pageSchema, onChange }: {
  action: EventAction
  pageSchema: PageSchema
  onChange: (action: EventAction) => void
}) {
  switch (action.action) {
    case 'navigate':
      return (
        <input
          type="text"
          value={action.target}
          onChange={e => onChange({ ...action, target: e.target.value })}
          placeholder="/users/:id"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        />
      )
    case 'callApi':
    case 'refresh':
    case 'show':
    case 'hide':
      return (
        <select
          value={action.target}
          onChange={e => onChange({ ...action, target: e.target.value })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        >
          <option value="">选择目标...</option>
          {action.action === 'callApi'
            ? Object.keys(pageSchema.dataSources ?? {}).map(k => (
                <option key={k} value={k}>{k}</option>
              ))
            : pageSchema.tree.map(n => (
                <option key={n.id} value={n.id}>{n.id} ({n.component})</option>
              ))
          }
        </select>
      )
    default:
      return null
  }
}
```

**Step 2: 构建验证**

```bash
pnpm --filter @neuron-ui/page-builder build
```

**Step 3: 提交**

```bash
git add packages/page-builder/src/editor/component-editor/
git commit -m "feat(page-builder): add EventsTab to ComponentEditor"
```

---

### Task 4.3：DataTab — 数据绑定面板

**Files:**
- Create: `packages/page-builder/src/editor/component-editor/DataTab.tsx`

```tsx
// packages/page-builder/src/editor/component-editor/DataTab.tsx
import { useEditorStore } from '../../stores/editor-store'
import type { PageSchemaTreeNode } from '@neuron-ui/metadata'
import type { PageSchema } from '../../types'

interface DataTabProps {
  node: PageSchemaTreeNode
  pageSchema: PageSchema
}

export function DataTab({ node, pageSchema }: DataTabProps) {
  const updateNode = useEditorStore(s => s.updateNode)
  const binding = node.binding ?? {}
  const dataSources = pageSchema.dataSources ?? {}

  function updateBinding(patch: Partial<typeof binding>) {
    updateNode(node.id, { binding: { ...binding, ...patch } })
  }

  return (
    <div className="space-y-6">
      {/* Data source selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">数据来源</label>
        <select
          value={binding.dataSource ?? ''}
          onChange={e => updateBinding({ dataSource: e.target.value || undefined })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        >
          <option value="">无</option>
          {Object.entries(dataSources).map(([key, ds]) => (
            <option key={key} value={key}>
              {key} — {ds.api}
            </option>
          ))}
        </select>
      </div>

      {/* Field mapping */}
      {binding.dataSource && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">字段映射</label>
          <p className="text-xs text-gray-400">API 字段 → 组件字段</p>
          <FieldMapEditor
            fieldMap={binding.fieldMap ?? {}}
            onChange={fieldMap => updateBinding({ fieldMap })}
          />
        </div>
      )}
    </div>
  )
}

function FieldMapEditor({
  fieldMap,
  onChange
}: {
  fieldMap: Record<string, string>
  onChange: (map: Record<string, string>) => void
}) {
  const entries = Object.entries(fieldMap)

  function addEntry() {
    onChange({ ...fieldMap, '': '' })
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
            onChange={e => updateEntry(key, e.target.value, value)}
            placeholder="api.field"
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
          />
          <span className="text-gray-400 text-xs">→</span>
          <input
            value={value}
            onChange={e => updateEntry(key, key, e.target.value)}
            placeholder="column:姓名"
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
          />
          <button onClick={() => removeEntry(key)} className="text-red-400 hover:text-red-600 text-xs px-1">×</button>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
      >
        + 添加映射
      </button>
    </div>
  )
}
```

**Step 2: 将 ComponentEditor 接入 App.tsx**

在 `App.tsx` 中渲染 `<ComponentEditor />` 覆盖层：

```tsx
{/* ComponentEditor overlay */}
{componentEditorNodeId && <ComponentEditor />}
```

**Step 3: 构建验证**

```bash
pnpm --filter @neuron-ui/page-builder build
```

**Step 4: 提交**

```bash
git add packages/page-builder/src/
git commit -m "feat(page-builder): add DataTab and wire ComponentEditor into App"
```

---

## Phase 5：MCP Server

**目标：** 实现 6 个 Resources 和 6 个 Tools，并与 App-UI 通过 `active-context.json` 文件联动。

### Task 5.1：active-context 文件联动

**Files:**
- Create: `packages/page-builder/src/utils/active-context-sync.ts`

**Step 1: App-UI 在选中节点时写入 active-context.json**

```typescript
// packages/page-builder/src/utils/active-context-sync.ts
export interface ActiveContext {
  pageId: string | null
  componentId: string | null
  componentType: string | null
  timestamp: number
}

// In browser: write to a known endpoint (dev server) or localStorage
// The MCP server reads this file from disk
export function syncActiveContext(ctx: ActiveContext) {
  // During dev: POST to a local endpoint that writes the file
  // The MCP dev server listens on a small HTTP endpoint
  fetch('http://localhost:7878/active-context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctx),
  }).catch(() => {/* ignore if MCP server not running */})
}
```

**Step 2: 在 selection-store 的 selectNode 中调用 syncActiveContext**

```typescript
// In packages/page-builder/src/stores/selection-store.ts
import { syncActiveContext } from '../utils/active-context-sync'

// Inside selectNode action:
syncActiveContext({
  pageId: currentPageId,
  componentId: nodeId,
  componentType: nodeComponent,
  timestamp: Date.now(),
})
```

**Step 3: 提交**

```bash
git add packages/page-builder/src/
git commit -m "feat(page-builder): sync active-context to MCP server on node select"
```

---

### Task 5.2：MCP Server — Resources

**Files:**
- Create: `packages/mcp-server/src/resources/index.ts`
- Create: `packages/mcp-server/src/resources/active-context.ts`
- Create: `packages/mcp-server/src/resources/page-json.ts`
- Create: `packages/mcp-server/src/resources/component-source.ts`

**Step 1: active-context Resource**

```typescript
// packages/mcp-server/src/resources/active-context.ts
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export function createActiveContextResource(projectRoot: string) {
  return {
    uri: 'project://active-context',
    name: 'Active Context',
    description: '当前用户在 App-UI 中选中的组件/页面',
    mimeType: 'application/json',
    async read() {
      const filePath = join(projectRoot, '.neuron', 'active-context.json')
      if (!existsSync(filePath)) {
        return JSON.stringify({ pageId: null, componentId: null, componentType: null })
      }
      return readFileSync(filePath, 'utf-8')
    }
  }
}
```

**Step 2: page-json Resource**

```typescript
// packages/mcp-server/src/resources/page-json.ts
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

export function createPageJsonResource(projectRoot: string) {
  return {
    uriPattern: 'project://page-json/{pageId}',
    name: 'Page JSON',
    description: '指定页面的完整 Page JSON',
    mimeType: 'application/json',
    async read(pageId: string) {
      // Look for page JSON files in src/pages/ or .neuron/pages/
      const candidates = [
        join(projectRoot, 'src', 'pages', `${pageId}.json`),
        join(projectRoot, '.neuron', 'pages', `${pageId}.json`),
      ]
      for (const p of candidates) {
        if (existsSync(p)) return readFileSync(p, 'utf-8')
      }
      return JSON.stringify({ error: `Page ${pageId} not found` })
    }
  }
}
```

**Step 3: 提交**

```bash
git add packages/mcp-server/src/resources/
git commit -m "feat(mcp-server): add active-context and page-json resources"
```

---

### Task 5.3：MCP Server — Tools

**Files:**
- Create: `packages/mcp-server/src/tools/index.ts`
- Create: `packages/mcp-server/src/tools/update-page-json.ts`
- Create: `packages/mcp-server/src/tools/get-component-context.ts`
- Create: `packages/mcp-server/src/tools/edit-component.ts`
- Create: `packages/mcp-server/src/tools/generate-component.ts`

**Step 1: update_page_json Tool**

```typescript
// packages/mcp-server/src/tools/update-page-json.ts
import { z } from 'zod'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export const updatePageJsonTool = {
  name: 'update_page_json',
  description: '更新页面中某个节点的 props、events 或 binding。精确修改，不影响其他节点。',
  inputSchema: z.object({
    pageId: z.string().describe('页面 ID，如 user-management'),
    nodeId: z.string().describe('要修改的节点 ID'),
    patch: z.object({
      props: z.record(z.unknown()).optional(),
      events: z.record(z.any()).optional(),
      binding: z.record(z.unknown()).optional(),
    }).describe('要合并的变更，只需提供要改变的字段'),
  }),
  async execute({ pageId, nodeId, patch }: { pageId: string; nodeId: string; patch: Record<string, unknown> }, projectRoot: string) {
    const filePath = join(projectRoot, 'src', 'pages', `${pageId}.json`)
    if (!existsSync(filePath)) {
      return { success: false, error: `Page file not found: ${filePath}` }
    }

    const schema = JSON.parse(readFileSync(filePath, 'utf-8'))

    function patchNode(nodes: unknown[]): boolean {
      for (const node of nodes as Record<string, unknown>[]) {
        if (node['id'] === nodeId) {
          if (patch.props) node['props'] = { ...(node['props'] as object ?? {}), ...patch.props }
          if (patch.events) node['events'] = { ...(node['events'] as object ?? {}), ...patch.events }
          if (patch.binding) node['binding'] = { ...(node['binding'] as object ?? {}), ...patch.binding }
          return true
        }
        if (node['children'] && patchNode(node['children'] as unknown[])) return true
      }
      return false
    }

    const found = patchNode(schema.tree)
    if (!found) return { success: false, error: `Node ${nodeId} not found in page ${pageId}` }

    writeFileSync(filePath, JSON.stringify(schema, null, 2), 'utf-8')
    return { success: true, message: `Updated node ${nodeId} in page ${pageId}` }
  }
}
```

**Step 2: get_component_context Tool**

```typescript
// packages/mcp-server/src/tools/get-component-context.ts
import { z } from 'zod'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

export const getComponentContextTool = {
  name: 'get_component_context',
  description: '获取一个组件的完整上下文：源码、props 定义、当前在哪些页面被使用。',
  inputSchema: z.object({
    componentName: z.string().describe('组件名，如 UserTable 或 PageHeader'),
  }),
  async execute({ componentName }: { componentName: string }, projectRoot: string) {
    // Find source file
    const patterns = [
      `src/components/${componentName}.tsx`,
      `src/components/${componentName}/${componentName}.tsx`,
    ]

    let sourceCode = null
    let sourceFile = null
    for (const pattern of patterns) {
      const fullPath = join(projectRoot, pattern)
      if (existsSync(fullPath)) {
        sourceCode = readFileSync(fullPath, 'utf-8')
        sourceFile = pattern
        break
      }
    }

    return {
      componentName,
      sourceFile,
      sourceCode,
      found: !!sourceCode,
    }
  }
}
```

**Step 3: MCP Server 主入口注册所有 Resources 和 Tools**

```typescript
// packages/mcp-server/src/index.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createActiveContextResource } from './resources/active-context.js'
import { createPageJsonResource } from './resources/page-json.js'
import { updatePageJsonTool } from './tools/update-page-json.js'
import { getComponentContextTool } from './tools/get-component-context.js'

export async function startMcpServer(projectRoot: string) {
  const server = new McpServer({
    name: 'neuron-ui',
    version: '0.1.0',
  })

  // Register Resources
  const activeCtxResource = createActiveContextResource(projectRoot)
  server.resource(activeCtxResource.uri, activeCtxResource.name, async (uri) => ({
    contents: [{ uri: uri.href, text: await activeCtxResource.read(), mimeType: 'application/json' }]
  }))

  // Register Tools
  server.tool(
    updatePageJsonTool.name,
    updatePageJsonTool.description,
    updatePageJsonTool.inputSchema.shape,
    async (args) => {
      const result = await updatePageJsonTool.execute(args as any, projectRoot)
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }
  )

  server.tool(
    getComponentContextTool.name,
    getComponentContextTool.description,
    getComponentContextTool.inputSchema.shape,
    async (args) => {
      const result = await getComponentContextTool.execute(args as any, projectRoot)
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }
  )

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('neuron-ui MCP Server running')
}
```

**Step 4: 构建验证**

```bash
pnpm --filter @neuron-ui/mcp-server build
```

**Step 5: 提交**

```bash
git add packages/mcp-server/src/
git commit -m "feat(mcp-server): implement Resources and Tools for AI collaboration"
```

---

## Phase 6：AI 生成流水线（输入解析 + 组件生成）

**目标：** 接收任意格式的输入文档（API list、Style、Figma、TaskCase 等），AI 解析后生成项目专属的 .tsx 组件和 Page JSON。

### Task 6.1：输入文档解析器

**Files:**
- Create: `packages/generator/src/input-parser/index.ts`
- Create: `packages/generator/src/input-parser/api-parser.ts`
- Create: `packages/generator/src/input-parser/style-parser.ts`
- Test: `packages/generator/src/__tests__/input-parser.test.ts`

**Step 1: 写失败的测试**

```typescript
// packages/generator/src/__tests__/input-parser.test.ts
import { describe, it, expect } from 'vitest'
import { parseApiInput, parseStyleInput } from '../input-parser'

describe('parseApiInput', () => {
  it('extracts endpoints from plain text description', () => {
    const input = `
      GET /api/users - 获取用户列表，返回 { items: User[], total: number }
      POST /api/users - 创建用户，请求体 { name: string, email: string }
    `
    const result = parseApiInput(input)
    expect(result.endpoints).toHaveLength(2)
    expect(result.endpoints[0].method).toBe('GET')
    expect(result.endpoints[0].path).toBe('/api/users')
    expect(result.endpoints[1].method).toBe('POST')
  })

  it('extracts color tokens from style description', () => {
    const input = 'Primary color: #2563EB, Background: #F8FAFC, Text: #1E293B'
    const result = parseStyleInput(input)
    expect(result.colors).toHaveProperty('primary')
    expect(result.colors.primary).toBe('#2563EB')
  })
})
```

**Step 2: 运行测试确认失败**

```bash
pnpm --filter @neuron-ui/generator test
```

**Step 3: 实现解析器（使用 Claude API）**

```typescript
// packages/generator/src/input-parser/api-parser.ts
import Anthropic from '@anthropic-ai/sdk'

export interface ParsedEndpoint {
  method: string
  path: string
  description: string
  requestBody?: Record<string, unknown>
  responseShape?: Record<string, unknown>
}

export interface ParsedApiInput {
  endpoints: ParsedEndpoint[]
  rawInput: string
}

export async function parseApiInput(input: string): Promise<ParsedApiInput> {
  const client = new Anthropic()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `Parse the following API documentation and extract all endpoints as structured JSON.

Input:
${input}

Return ONLY a JSON array of endpoints with shape:
[{ "method": "GET|POST|PUT|DELETE", "path": "/path", "description": "...", "responseShape": {...}, "requestBody": {...} }]`
    }]
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const endpoints = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    return { endpoints, rawInput: input }
  } catch {
    return { endpoints: [], rawInput: input }
  }
}
```

**Step 4: 运行测试确认通过**

```bash
pnpm --filter @neuron-ui/generator test
```

**Step 5: 提交**

```bash
git add packages/generator/src/input-parser/
git commit -m "feat(generator): add input parser for API and style documents"
```

---

### Task 6.2：组件生成器（shadcn 二开）

**Files:**
- Create: `packages/generator/src/component-generator/index.ts`
- Create: `packages/generator/src/component-generator/prompts.ts`

```typescript
// packages/generator/src/component-generator/prompts.ts

export function buildComponentGenerationPrompt(params: {
  componentName: string
  description: string
  propsDefinition: Record<string, string>
  styleContext: {
    primaryColor?: string
    backgroundColor?: string
    fontFamily?: string
    borderRadius?: string
    cssVariables?: Record<string, string>
  }
  apiContext?: {
    dataFields: string[]
    endpoint: string
  }
}): string {
  return `你是一个 React + TypeScript + Tailwind CSS + shadcn/ui 组件开发专家。

任务：基于 shadcn/ui 进行二次开发，生成一个名为 ${params.componentName} 的 React 组件。

## 组件描述
${params.description}

## Props 定义
${JSON.stringify(params.propsDefinition, null, 2)}

## 视觉风格
- 主色：${params.styleContext.primaryColor ?? '继承 shadcn 默认'}
- 背景色：${params.styleContext.backgroundColor ?? 'white'}
- 字体：${params.styleContext.fontFamily ?? '系统字体'}
- 圆角：${params.styleContext.borderRadius ?? '8px'}
${params.styleContext.cssVariables
  ? `- CSS 变量覆写：\n${Object.entries(params.styleContext.cssVariables).map(([k, v]) => `  ${k}: ${v}`).join('\n')}`
  : ''}

## 数据字段
${params.apiContext ? params.apiContext.dataFields.join(', ') : '无'}

## 要求
1. 必须在组件根元素上添加 data-node-id prop（由父层传入）
2. 使用 Tailwind CSS v4 工具类，不写内联样式
3. 从 shadcn/ui 导入基础组件，进行二次封装
4. 导出 Props interface 和组件
5. 组件必须是纯展示性的（逻辑由父层通过 props 传入）

请直接输出 TypeScript 代码，不要解释。`
}
```

**Step 2: 提交**

```bash
git add packages/generator/src/component-generator/
git commit -m "feat(generator): add component generator with shadcn 二开 prompt"
```

---

### Task 6.3：MCP Tool: generate_component + create_page

**Files:**
- Create: `packages/mcp-server/src/tools/generate-component.ts`
- Create: `packages/mcp-server/src/tools/create-page.ts`
- Modify: `packages/mcp-server/src/index.ts`

**Step 1: generate_component Tool**

```typescript
// packages/mcp-server/src/tools/generate-component.ts
import { z } from 'zod'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { buildComponentGenerationPrompt } from '@neuron-ui/generator'

export const generateComponentTool = {
  name: 'generate_component',
  description: '基于用户输入文档，生成项目专属的 shadcn 二次开发 React 组件。',
  inputSchema: z.object({
    componentName: z.string().describe('组件名，PascalCase，如 UserTable'),
    description: z.string().describe('组件的功能描述'),
    propsDefinition: z.record(z.string()).describe('props 名称 → 类型描述'),
    styleContext: z.object({
      primaryColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      borderRadius: z.string().optional(),
    }).optional(),
    outputPath: z.string().optional().describe('输出路径，默认 src/components/{componentName}.tsx'),
  }),
  async execute(args: { componentName: string; description: string; propsDefinition: Record<string, string>; styleContext?: object; outputPath?: string }, projectRoot: string) {
    const client = new Anthropic()
    const prompt = buildComponentGenerationPrompt({
      componentName: args.componentName,
      description: args.description,
      propsDefinition: args.propsDefinition,
      styleContext: args.styleContext ?? {},
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const code = response.content[0].type === 'text' ? response.content[0].text : ''
    const outputPath = args.outputPath ?? `src/components/${args.componentName}.tsx`
    const fullPath = join(projectRoot, outputPath)

    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, code, 'utf-8')

    return {
      success: true,
      outputPath,
      message: `组件 ${args.componentName} 已生成到 ${outputPath}`,
    }
  }
}
```

**Step 2: 注册新 Tools 到 MCP Server**

在 `packages/mcp-server/src/index.ts` 中 import 并注册 `generateComponentTool`。

**Step 3: 构建验证**

```bash
pnpm --filter @neuron-ui/mcp-server build
```

**Step 4: 提交**

```bash
git add packages/mcp-server/src/ packages/generator/src/
git commit -m "feat: add generate_component and create_page MCP tools"
```

---

## 验收标准

每个 Phase 完成后验证：

| Phase | 验证方式 |
|---|---|
| Phase 1 | `pnpm --filter @neuron-ui/metadata test` 全绿 |
| Phase 2 | `pnpm --filter @neuron-ui/runtime test` 全绿 |
| Phase 3 | 在 page-builder 中 hover 任意组件，看到 [编辑] [Chat] 浮层 |
| Phase 4 | 点击 [编辑] → 打开 ComponentEditor，三个 Tab 均可交互，属性改变热加载 |
| Phase 5 | `pnpm --filter @neuron-ui/mcp-server build` 无错误；Claude Code 接入后可调用 `update_page_json` |
| Phase 6 | 提供 API 描述文本，调用 `generate_component` MCP Tool，能生成 .tsx 文件 |

---

## 注意事项

- **data-node-id 必须存在**：Phase 3 的高亮依赖它，如果组件没有此属性，Chat 上下文同步会失效
- **Page JSON 是唯一真相**：不要在 Zustand store 里维护独立的事件/绑定状态，所有数据都从 Page JSON 读写
- **MCP Server 不直接操作 DOM**：所有 Tools 只操作文件系统（.tsx 源码 + .json 页面），不调用浏览器 API
- **generate_component 需要 ANTHROPIC_API_KEY 环境变量**
