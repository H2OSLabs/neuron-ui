# Page Schema 消费方案：目标项目如何使用生成的页面

> AI 生成 Page Schema → 编辑器调整 → **然后呢？** 本文档定义 Page Schema 在目标项目中的两种消费模式。

---

## 核心问题

```
neuron-ui 系统                              目标项目 (用户的 React App)
┌──────────────────────┐                    ┌──────────────────────┐
│ API + TaskCase       │                    │                      │
│    ↓                 │                    │  如何把生成的页面     │
│ AI 生成 Page Schema  │ ──── ??? ────►    │  变成可运行的 UI？    │
│    ↓                 │                    │                      │
│ 编辑器调整           │                    └──────────────────────┘
│    ↓                 │
│ 最终 Page Schema JSON│
└──────────────────────┘
```

**方案: 提供两种消费模式，按场景选择。**

---

## 模式 A: Runtime 渲染器 (基于 json-render)

> 基于 Vercel **json-render** 框架，目标项目安装 `@neuron-ui/runtime`，运行时将 Page Schema 动态渲染为 React 组件树。

### 为什么选 json-render

| 评估维度 | json-render | 自研渲染器 |
|---------|-------------|-----------|
| 组件注册 | `createCatalog` + Zod 校验，类型安全 | 需自建注册表 |
| AI 输出校验 | `catalog.validateElement()` 内置 | 需自建校验器 |
| Action 系统 | `ActionProvider` + 确认弹窗 + 成功/失败回调 | 需自建事件分发 |
| 数据绑定 | `DataProvider` + `useDataValue` + `$path` 表达式 | 需自建数据层 |
| 条件渲染 | `visible` 条件 (path/auth/逻辑表达式) | 需自建 |
| 流式渲染 | `SpecStream` 支持 AI 流式输出渐进渲染 | 需自建 |
| Prompt 生成 | `catalog.prompt()` 自动生成系统提示词 | 需手动维护 |
| 社区维护 | Vercel 团队维护，MIT 协议 | 完全自负 |

### 适用场景

- **CMS / 运营后台**: 页面由运营人员在编辑器中调整，调整后立即生效，无需重新部署
- **低代码平台**: 页面配置存在数据库中，按需加载渲染
- **多租户 SaaS**: 不同租户有不同的页面配置
- **快速原型**: 需要快速看到效果，不需要深度定制

### 架构

```
@neuron-ui/runtime 内部架构
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Page Schema (neuron-ui 树形格式)                    │
│       ↓                                             │
│  SchemaAdapter: 树形 Page Schema → json-render UITree│
│       ↓                                             │
│  ┌─────────────── json-render 层 ──────────────┐    │
│  │                                              │    │
│  │  Catalog (53 个 N-组件 Zod 定义)             │    │
│  │       ↓                                      │    │
│  │  Registry (N-组件 → React 实现)              │    │
│  │       ↓                                      │    │
│  │  <Renderer tree={uiTree} registry={...} />   │    │
│  │       ↓                                      │    │
│  │  DataProvider (响应式数据模型)                │    │
│  │  ActionProvider (事件处理)                    │    │
│  │                                              │    │
│  └──────────────────────────────────────────────┘    │
│       ↓                                             │
│  DataSourceLayer: dataSources 声明 → API 请求 →      │
│                   数据注入 DataProvider              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 核心 API

```tsx
import '@neuron-ui/tokens/css/globals.css'
import { NeuronPage } from '@neuron-ui/runtime'

function CompetitionPage() {
  return (
    <NeuronPage
      schema={pageSchema}
      // 数据提供者: 将 Page Schema 中的 dataSources 连接到真实 API
      dataProvider={{
        fetch: async (api, params) => {
          // api = { method: "GET", path: "/api/competitions" }
          const response = await fetch(`${BASE_URL}${api.path}`, { params })
          return response.json()
        },
        mutate: async (api, body) => {
          // api = { method: "POST", path: "/api/competitions" }
          const response = await fetch(`${BASE_URL}${api.path}`, {
            method: api.method,
            body: JSON.stringify(body)
          })
          return response.json()
        }
      }}
      // 事件处理覆盖 (可选)
      onAction={{
        navigate: (target) => router.push(target),
        toast: (message) => customToast(message),
      }}
    />
  )
}
```

### @neuron-ui/runtime 包结构

```
packages/runtime/
├── package.json               # @neuron-ui/runtime
├── vite.config.ts             # library mode
├── src/
│   ├── index.ts               # 导出 NeuronPage, usePageSchema, createDataProvider
│   │
│   ├── NeuronPage.tsx         # 顶层容器: 组装 DataProvider + ActionProvider + Renderer
│   │
│   ├── catalog/
│   │   ├── neuron-catalog.ts  # createCatalog() 注册 53 个 N-组件 Zod schema
│   │   ├── neuron-registry.ts # defineRegistry() 映射到实际 React 组件
│   │   └── neuron-actions.ts  # 自定义 action 定义 (openDialog, refresh 等)
│   │
│   ├── adapter/
│   │   ├── schema-adapter.ts  # Page Schema (树形) → json-render UITree (扁平)
│   │   ├── binding-adapter.ts # neuron binding 协议 → json-render $path 表达式
│   │   └── action-adapter.ts  # neuron binding.onClick/onSubmit → json-render ActionSchema
│   │
│   ├── data/
│   │   ├── DataSourceLayer.tsx # 读取 dataSources 声明 → 调用 dataProvider → 注入数据模型
│   │   └── createDataProvider.ts # 快捷创建 dataProvider 的工厂函数
│   │
│   ├── hooks/
│   │   ├── usePageSchema.ts   # 加载 Page Schema (URL/文件/内联)
│   │   └── useNeuronPage.ts   # 组合 Hook: schema + adapter + render
│   │
│   └── types.ts
├── tsconfig.json
└── __tests__/
```

### 三层适配架构

#### 层 1: Catalog + Registry (组件注册)

```typescript
// catalog/neuron-catalog.ts
import { createCatalog, ActionSchema } from '@json-render/core'
import { z } from 'zod'

// Token 枚举 (与 @neuron-ui/tokens 中的设计规范一致)
// 10 个强调色 + 3 个语义色
const ColorToken = z.enum([
  'pink', 'yellow', 'lime', 'green', 'blue', 'purple',
  'lavender', 'pink-light', 'yellow-bright', 'lime-light',
  'error', 'warning', 'success'
])
const SizeToken = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])

export const neuronCatalog = createCatalog({
  name: 'neuron-ui',
  components: {
    NButton: {
      props: z.object({
        label: z.string(),
        color: ColorToken.optional(),
        variant: z.enum(['capsule', 'outline', 'ghost', 'link']).optional(),
        size: SizeToken.optional(),
        action: ActionSchema.optional(),
      }),
      description: '按钮组件，支持多种变体和颜色',
    },
    NDataTable: {
      props: z.object({
        columns: z.array(z.object({
          field: z.string(),
          header: z.string(),
          sortable: z.boolean().optional(),
        })),
        dataPath: z.string(),  // $path 到数据模型中的数据
      }),
      hasChildren: false,
      description: '数据表格，支持排序、分页',
    },
    NDialog: {
      props: z.object({
        title: z.string(),
        triggerAction: z.string().optional(), // 哪个 action 触发打开
      }),
      hasChildren: true,
      description: '模态弹窗容器',
    },
    NCard: {
      props: z.object({
        title: z.string().optional(),
        padding: SizeToken.optional(),
      }),
      hasChildren: true,
      description: '卡片容器',
    },
    // ... 53 个组件全部注册
  },
  actions: {
    openDialog:   { params: z.object({ target: z.string() }), description: '打开指定弹窗' },
    closeDialog:  { params: z.object({ target: z.string() }), description: '关闭指定弹窗' },
    openSheet:    { params: z.object({ target: z.string() }), description: '打开侧边面板' },
    closeSheet:   { params: z.object({ target: z.string() }), description: '关闭侧边面板' },
    submitForm:   { params: z.object({ api: z.string(), body: z.any() }), description: '提交表单' },
    deleteItem:   { params: z.object({ api: z.string(), id: z.string() }), description: '删除确认' },
    refresh:      { params: z.object({ dataSource: z.string() }), description: '刷新数据源' },
    navigate:     { params: z.object({ target: z.string() }), description: '路由跳转' },
    toast:        { params: z.object({ message: z.string(), variant: z.enum(['success', 'error', 'info']) }), description: '通知提示' },
  },
  validation: 'strict',
})
```

```typescript
// catalog/neuron-registry.ts
import { defineRegistry } from '@json-render/react'
import { NButton, NDataTable, NDialog, NCard, ... } from '@neuron-ui/components'
import { neuronCatalog } from './neuron-catalog'

export const { registry } = defineRegistry(neuronCatalog, {
  components: {
    NButton: ({ props, onAction }) => (
      <NButton
        color={props.color}
        variant={props.variant}
        size={props.size}
        onClick={() => props.action && onAction?.(props.action)}
      >
        {props.label}
      </NButton>
    ),
    NDataTable: ({ props }) => {
      const data = useDataValue(props.dataPath)
      return <NDataTable data={data} columns={props.columns} />
    },
    NDialog: ({ props, children }) => (
      <NDialog title={props.title}>{children}</NDialog>
    ),
    NCard: ({ props, children }) => (
      <NCard title={props.title} padding={props.padding}>{children}</NCard>
    ),
    // ... 53 个组件映射
  },
})
```

#### 层 2: Schema Adapter (格式转换)

neuron-ui 的 Page Schema 使用**嵌套树**格式 (AI 生成更友好)，json-render 使用**扁平邻接表** (渲染更高效)。Adapter 负责一次性转换:

```typescript
// adapter/schema-adapter.ts

// neuron-ui Page Schema (嵌套树，AI 输出格式)
interface PageSchemaNode {
  id: string
  component: string      // "NButton", "NDataTable"...
  props: Record<string, any>
  binding?: BindingProtocol
  children?: PageSchemaNode[]
}

// json-render UITree (扁平邻接表，渲染器消费格式)
interface UITree {
  root: string
  elements: Record<string, UIElement>
}

export function pageSchemaToUITree(pageSchema: PageSchema): UITree {
  const elements: Record<string, UIElement> = {}

  function flattenNode(node: PageSchemaNode): string {
    const childKeys = (node.children || []).map(child => flattenNode(child))

    elements[node.id] = {
      key: node.id,
      type: node.component,
      props: adaptProps(node.props, node.binding),
      children: childKeys.length > 0 ? childKeys : undefined,
      visible: adaptVisibility(node),
    }

    return node.id
  }

  const rootId = flattenNode(pageSchema.tree[0])
  return { root: rootId, elements }
}
```

#### 层 3: DataSourceLayer (API 数据获取)

json-render 的 `DataProvider` 管理响应式数据模型，neuron-ui 在此之上增加一层 **DataSourceLayer** 将 Page Schema 的 `dataSources` 声明转化为 API 请求:

```typescript
// data/DataSourceLayer.tsx
function DataSourceLayer({ schema, dataProvider, children }) {
  const [dataModel, setDataModel] = useState({})

  // 初始化: 遍历 dataSources 声明, 逐个请求
  useEffect(() => {
    const init = async () => {
      const model = {}
      for (const [key, ds] of Object.entries(schema.dataSources)) {
        // "competitionList": { api: "GET /api/competitions", params: {...} }
        // → DataProvider 数据路径: /dataSources/competitionList
        const { method, path } = parseApi(ds.api)
        const data = await dataProvider.fetch({ method, path }, ds.params)
        model[`/dataSources/${key}`] = data
      }
      setDataModel(model)
    }
    init()
  }, [schema.dataSources])

  return (
    <DataProvider initialData={dataModel}>
      <ActionProvider handlers={buildActionHandlers(schema, dataProvider)}>
        {children}
      </ActionProvider>
    </DataProvider>
  )
}
```

### 数据流

```
Page Schema JSON
    │
    ├── dataSources 声明
    │     ↓
    │   DataSourceLayer: 遍历 dataSources → dataProvider.fetch() → 数据注入
    │     ↓
    │   DataProvider initialData = { /dataSources/competitionList: [...] }
    │
    ├── tree (嵌套)
    │     ↓
    │   SchemaAdapter: pageSchemaToUITree() → 扁平 UITree
    │     ↓
    │   <Renderer tree={uiTree} registry={neuronRegistry} />
    │     ↓
    │   json-render 递归渲染: type → Registry → React 组件
    │     ↓
    │   NDataTable 通过 useDataValue('/dataSources/competitionList') 获取数据
    │
    └── binding 协议
          ↓
        ActionAdapter: onClick → json-render Action { name: 'openDialog', params: {...} }
                       onSubmit → json-render Action { name: 'submitForm', params: {...} }
                       onChange → json-render setState { path: '...', value: '...' }
```

### 优点

| 优点 | 说明 |
|------|------|
| **即时更新** | 修改 Page Schema JSON → 页面立即变化，无需重新构建部署 |
| **类型安全** | json-render Catalog 的 Zod 校验保证所有组件 props 类型正确 |
| **AI 友好** | `catalog.prompt()` 自动生成系统提示词，与 generator 无缝衔接 |
| **流式渲染** | `SpecStream` 支持 AI 流式输出时渐进显示 UI |
| **条件渲染** | json-render 内置 `visible` 条件系统，支持路径/认证/逻辑表达式 |
| **Action 确认** | 删除等危险操作自动弹出确认对话框 (json-render `action.confirm`) |
| **非技术人员可操作** | 运营在编辑器中调整 → 保存到 CMS → 线上页面自动更新 |

### 局限

| 局限 | 说明 |
|------|------|
| **无法深度定制** | 不能在组件间插入自定义业务逻辑 |
| **额外依赖** | 引入 json-render (~100KB) + zod 运行时 |
| **Schema 格式差异** | neuron Page Schema ↔ json-render UITree 需要 adapter 层 |
| **不适合复杂交互** | 跨组件联动、复杂表单校验等需要代码实现 → 用 Mode B |

---

## 模式 B: Code Generation (代码生成)

> CLI 工具将 Page Schema 编译为真实的 `.tsx` 源码文件，开发者拿到代码后可任意定制。

### 适用场景

- **开发者主导**: 需要在生成的页面基础上添加大量自定义逻辑
- **复杂交互**: 跨组件联动、条件渲染、复杂表单校验
- **性能敏感**: 不想要运行时解析开销
- **代码脚手架**: AI 生成初始代码，开发者接管后续迭代

### 架构

```
目标项目
├── package.json
│   dependencies:
│     @neuron-ui/tokens
│     @neuron-ui/components
│   devDependencies:
│     @neuron-ui/codegen        # ★ 代码生成 CLI (新包)
│
├── schemas/                    # Page Schema 源文件
│   └── competition-list.json
│
└── src/pages/
    └── competitions/           # ★ CLI 生成的代码
        ├── CompetitionListPage.tsx     # 页面组件
        ├── CompetitionListPage.hooks.ts # 数据获取 hooks
        ├── CompetitionListPage.types.ts # 类型定义
        └── components/
            ├── CompetitionTable.tsx     # 表格区域
            ├── CreateCompetitionDialog.tsx # 创建弹窗
            ├── EditCompetitionSheet.tsx   # 编辑面板
            └── DeleteConfirmDialog.tsx    # 删除确认
```

### CLI 使用

```bash
# 从 Page Schema 生成代码
npx neuron-codegen generate ./schemas/competition-list.json \
  --outdir src/pages/competitions \
  --style hooks        # hooks | swr | react-query
  --api-client axios   # axios | fetch | ky

# 批量生成
npx neuron-codegen generate ./schemas/*.json --outdir src/pages/

# 查看变更 (不写入文件)
npx neuron-codegen generate ./schemas/competition-list.json --dry-run

# 更新 (保留手动修改, 只添加新字段/组件)
npx neuron-codegen update ./schemas/competition-list.json \
  --outdir src/pages/competitions \
  --strategy merge     # merge | overwrite | diff
```

### 生成的代码示例

**CompetitionListPage.tsx:**

```tsx
import '@neuron-ui/tokens/css/globals.css'
import { NDataTable, NButton, NInput, NSelect, NDialog, NSheet,
         NAlertDialog, NField, NTextarea, NCombobox, NDatePicker,
         NText, NBadge, NAvatar, NDropdownMenu, NPagination,
         NEmpty, NSkeleton } from '@neuron-ui/components'
import { useCompetitionList, useCreateCompetition, useUpdateCompetition,
         useDeleteCompetition } from './CompetitionListPage.hooks'

export function CompetitionListPage() {
  const { data, isLoading, params, setParams } = useCompetitionList()
  const createMutation = useCreateCompetition()
  const updateMutation = useUpdateCompetition()
  const deleteMutation = useDeleteCompetition()

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // ★ 开发者可以在这里添加自定义逻辑
  // 例如: 权限控制、条件渲染、复杂校验...

  if (isLoading) return <NSkeleton />
  if (!data?.length) return <NEmpty />

  return (
    <div className="flex flex-col gap-lg">
      {/* 工具栏 */}
      <div className="flex items-center gap-md">
        <NInput
          placeholder="搜索赛事..."
          value={params.keyword}
          onChange={(v) => setParams({ ...params, keyword: v })}
        />
        <NSelect
          placeholder="状态筛选"
          options={[
            { label: '草稿', value: 'draft' },
            { label: '进行中', value: 'active' },
            { label: '已结束', value: 'ended' },
          ]}
          value={params.status}
          onChange={(v) => setParams({ ...params, status: v })}
        />
        <NButton variant="capsule" color="blue" onClick={() => setCreateOpen(true)}>
          创建赛事
        </NButton>
      </div>

      {/* 数据表格 */}
      <NDataTable
        data={data}
        columns={[
          { field: 'name', header: '赛事名称', render: (v) => <NText>{v}</NText> },
          { field: 'status', header: '状态', render: (v) => (
            <NBadge color={statusColorMap[v]}>{statusLabelMap[v]}</NBadge>
          )},
          { field: 'prize', header: '奖金', render: (v) => <NText>{formatCurrency(v)}</NText> },
          { field: 'created_by', header: '创建者', render: (v) => (
            <NAvatar src={v.avatar} name={v.name} />
          )},
          { field: '_actions', header: '操作', render: (_, row) => (
            <NDropdownMenu items={[
              { label: '编辑', onClick: () => setEditTarget(row.id) },
              { label: '删除', variant: 'destructive', onClick: () => setDeleteTarget(row.id) },
            ]} />
          )},
        ]}
      />

      <NPagination
        total={data.total}
        page={params.page}
        onChange={(p) => setParams({ ...params, page: p })}
      />

      {/* 创建弹窗 */}
      <CreateCompetitionDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createMutation.mutateAsync}
      />

      {/* 编辑面板 */}
      {editTarget && (
        <EditCompetitionSheet
          id={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={updateMutation.mutateAsync}
        />
      )}

      {/* 删除确认 */}
      {deleteTarget && (
        <DeleteConfirmDialog
          id={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteMutation.mutateAsync}
        />
      )}
    </div>
  )
}
```

**CompetitionListPage.hooks.ts:**

```typescript
// 根据 --style 选项生成不同的数据获取实现
// 此为 react-query 版本

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'  // 目标项目的 API 客户端

export function useCompetitionList() {
  const [params, setParams] = useState({ page: 1, status: null, keyword: null })

  const { data, isLoading } = useQuery({
    queryKey: ['competitions', params],
    queryFn: () => apiClient.get('/api/competitions', { params }),
  })

  return { data, isLoading, params, setParams }
}

export function useCreateCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body) => apiClient.post('/api/competitions', body),
    onSuccess: () => queryClient.invalidateQueries(['competitions']),
  })
}

// ... useUpdateCompetition, useDeleteCompetition
```

### @neuron-ui/codegen 包结构

```
packages/codegen/
├── package.json              # @neuron-ui/codegen (CLI)
├── bin/
│   └── neuron-codegen.ts     # CLI 入口
├── src/
│   ├── index.ts
│   ├── commands/
│   │   ├── generate.ts       # generate 命令
│   │   └── update.ts         # update 命令 (增量更新)
│   ├── generators/
│   │   ├── page-generator.ts       # Page Schema → 页面组件 .tsx
│   │   ├── hooks-generator.ts      # Page Schema → 数据 hooks
│   │   ├── types-generator.ts      # Page Schema → TypeScript 类型
│   │   └── component-generator.ts  # Page Schema 子节点 → 子组件文件
│   ├── templates/
│   │   ├── page.ts.hbs       # 页面组件模板 (Handlebars)
│   │   ├── hooks-swr.ts.hbs  # SWR 版本 hooks 模板
│   │   ├── hooks-query.ts.hbs # React Query 版本
│   │   └── hooks-fetch.ts.hbs # 原生 fetch 版本
│   ├── strategies/
│   │   ├── merge.ts          # 增量合并策略 (保留手动修改)
│   │   ├── overwrite.ts      # 覆盖策略
│   │   └── diff.ts           # 差异对比策略
│   └── utils/
│       ├── schema-parser.ts  # 解析 Page Schema
│       └── code-formatter.ts # Prettier 格式化输出
└── tsconfig.json
```

### 优点

| 优点 | 说明 |
|------|------|
| **完全可控** | 生成的是真实 .tsx，可以任意修改 |
| **IDE 支持** | 类型补全、跳转、重构全部可用 |
| **零运行时开销** | 编译时生成，无需运行时解析 |
| **可深度定制** | 可插入自定义业务逻辑、条件渲染、复杂校验 |
| **标准 React** | 生成的代码就是普通 React 组件，无额外抽象 |

### 局限

| 局限 | 说明 |
|------|------|
| **单向过程** | 生成后修改代码，无法同步回 Page Schema |
| **需要开发者** | 不适合非技术人员独立操作 |
| **更新成本** | API 变更后需重新生成，可能与手动修改冲突 |

---

## 两种模式对比

| 维度 | Runtime (json-render) | Code Generation |
|------|----------------------|-----------------|
| **使用者** | 运营 / 产品 / 低代码用户 | 开发者 |
| **底层技术** | json-render Catalog + Renderer | Handlebars 模板 + Prettier |
| **定制深度** | Catalog 定义范围内的属性 | 无限 (是真实代码) |
| **页面更新** | 修改 JSON → 即时生效 | 修改代码 → 重新构建部署 |
| **IDE 支持** | 无 | 完整 (类型、补全、跳转) |
| **运行时开销** | 有 (json-render + adapter) | 无 |
| **AI 集成** | catalog.prompt() 自动生成提示词 | 手动维护模板 |
| **流式渲染** | 支持 (SpecStream) | 不适用 |
| **复杂交互** | 受限 (binding 协议范围内) | 无限 (可写任意逻辑) |
| **技术门槛** | 低 | 需要 React 开发能力 |

### 推荐选择

```
场景判断:

需要运营实时调整页面?               → Runtime (json-render)
   ├── CMS 管理后台
   ├── 多租户 SaaS
   └── 活动页/营销页 (频繁变更)

需要深度定制和复杂业务逻辑?         → Code Generation
   ├── 核心业务页面
   ├── 复杂表单 (跨字段校验、联动)
   └── 开发者脚手架 (AI 生成初始代码)

两者共存:                           → 一个项目可以同时用两种模式
   ├── 核心页面: Code Gen (深度定制)
   └── 运营页面: Runtime (热更新)
```

---

## 目标项目集成示例

### 快速开始 (Runtime)

```bash
# 1. 安装依赖
pnpm add @neuron-ui/tokens @neuron-ui/components @neuron-ui/runtime

# 2. 引入样式 (入口文件)
# import '@neuron-ui/tokens/css/globals.css'

# 3. 放置 Page Schema 文件
# public/schemas/competition-list.json

# 4. 使用 NeuronPage 组件
```

```tsx
// src/pages/Competitions.tsx
import { NeuronPage, createDataProvider } from '@neuron-ui/runtime'
import schema from '../schemas/competition-list.json'

const dataProvider = createDataProvider({
  baseURL: 'https://api.example.com',
  headers: { Authorization: `Bearer ${token}` },
})

export default function Competitions() {
  return <NeuronPage schema={schema} dataProvider={dataProvider} />
}
```

### 快速开始 (Code Gen)

```bash
# 1. 安装依赖
pnpm add @neuron-ui/tokens @neuron-ui/components
pnpm add -D @neuron-ui/codegen

# 2. 生成代码
npx neuron-codegen generate ./schemas/competition-list.json \
  --outdir src/pages/competitions \
  --style react-query \
  --api-client axios

# 3. 在路由中使用
```

```tsx
// src/App.tsx
import { CompetitionListPage } from './pages/competitions/CompetitionListPage'

<Route path="/competitions" element={<CompetitionListPage />} />
```

---

## 与 AI 生成引擎的协同

### Runtime 模式: catalog.prompt() 自动化

json-render 的 `catalog.prompt()` 可自动从 Catalog 定义生成系统提示词。这意味着 `@neuron-ui/generator` 可以直接消费 neuronCatalog 生成 Prompt，不再需要手动维护 system-prompt.ts 中的组件清单部分:

```typescript
// packages/generator/src/prompts/system-prompt.ts
import { neuronCatalog } from '@neuron-ui/runtime'

const componentContext = neuronCatalog.prompt()
// 自动包含: 53 个组件的 props schema + action 定义 + 可用变体
```

### 校验一致性

Catalog 的 Zod 校验可同时用于:
1. **AI 生成后校验**: `catalog.validateElement()` 替代部分手写校验逻辑
2. **编辑器属性面板**: Zod schema → 自动生成属性编辑器控件
3. **Runtime 渲染前校验**: 确保 Page Schema 合法

---

## 新增包总结

| 包 | 类型 | 核心依赖 | 说明 |
|---|------|---------|------|
| **@neuron-ui/runtime** | npm 包 | `@json-render/core` + `@json-render/react` | json-render 基础上的 Runtime 渲染器 |
| **@neuron-ui/codegen** | npm 包 (CLI) | `commander` + `handlebars` + `prettier` | 代码生成器 (Page Schema → .tsx 源码) |

这两个包扩展了原有 5 个包的架构:

```
@neuron-ui/tokens       → Layer 0: Design Token
@neuron-ui/components   → Layer 1-2: 组件库
@neuron-ui/metadata     → Side: AI 元数据
@neuron-ui/generator    → Layer 3: AI 生成引擎 (可消费 neuronCatalog.prompt())
@neuron-ui/page-builder → Layer 3: 拖拉拽编辑器
@neuron-ui/runtime      → ★ 新增: json-render 渲染器 (Catalog + Registry + Adapter)
@neuron-ui/codegen      → ★ 新增: 代码生成 CLI (Page Schema → .tsx)
```

**构建顺序更新:**

```
tokens → components → metadata → generator / page-builder
                   ↘            ↗
                    runtime (依赖 components + json-render)
                    codegen (依赖 components + metadata)
```
