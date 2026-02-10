# Phase 7: 页面消费层 (@neuron-ui/runtime + @neuron-ui/codegen)

> "最后一公里"的交付：Page Schema 生成后，如何在目标项目中真正运行起来。

---

## 依赖

- Phase 2 核心组件完成 (至少 P0-P2 批次)
- Phase 3 完成 (Page Schema 定义 + 校验器)

## 设计来源

- `docs/guides/page-consumption.md` — 两种消费模式完整设计

## 技术选型: json-render

Runtime 渲染器基于 Vercel **json-render** 框架 (`@json-render/core` + `@json-render/react`)，而非从零自研。

**选择理由:**

| 能力 | json-render 提供 | 否则需自研 |
|------|------------------|-----------|
| 组件 Catalog | `createCatalog()` + Zod schema | 自建注册表 + 类型校验 |
| 组件 Registry | `defineRegistry()` 映射 React 实现 | 自建 ComponentResolver |
| 渲染引擎 | `<Renderer tree={} registry={} />` | 自建 PageRenderer 递归渲染 |
| 数据模型 | `DataProvider` + `useDataValue` + `$path` 表达式 | 自建响应式数据层 |
| Action 系统 | `ActionProvider` + 确认弹窗 + onSuccess/onError | 自建 ActionDispatcher |
| 条件渲染 | `visible` (path/auth/逻辑表达式) | 自建条件引擎 |
| 流式渲染 | `SpecStream` 渐进渲染 | 自建 chunk parser |
| AI Prompt | `catalog.prompt()` 自动生成 | 手动维护 system-prompt |
| 校验 | `catalog.validateElement()` | 自建校验器 |

**额外收益:** `catalog.prompt()` 可与 `@neuron-ui/generator` 联动，自动生成 AI 的系统提示词 (组件清单 + props schema + action 列表)，替代手工维护的 component-manifest 部分。

---

## Phase 7A: Runtime 渲染器 (@neuron-ui/runtime)

> 基于 json-render，将 Page Schema 动态渲染为 React 组件树。

### 7A.1 包目录结构

```
packages/runtime/
├── package.json               # @neuron-ui/runtime
├── vite.config.ts             # library mode
├── src/
│   ├── index.ts               # 导出 NeuronPage, usePageSchema, createDataProvider, neuronCatalog
│   │
│   ├── NeuronPage.tsx         # 顶层容器: DataSourceLayer + DataProvider + ActionProvider + Renderer
│   │
│   ├── catalog/
│   │   ├── neuron-catalog.ts  # ★ createCatalog(): 53 个 N-组件 Zod schema + 9 个 actions
│   │   ├── neuron-registry.ts # ★ defineRegistry(): N-组件 → React 实现映射
│   │   └── neuron-actions.ts  # action handlers 默认实现
│   │
│   ├── adapter/
│   │   ├── schema-adapter.ts  # ★ Page Schema (树形) → json-render UITree (扁平邻接表)
│   │   ├── binding-adapter.ts # neuron binding 协议 → json-render $path / ActionSchema
│   │   └── token-adapter.ts   # Token key → CSS 变量值 (复用 @neuron-ui/tokens)
│   │
│   ├── data/
│   │   ├── DataSourceLayer.tsx # dataSources 声明 → API 请求 → 注入 DataProvider 数据模型
│   │   └── createDataProvider.ts # 快捷工厂: baseURL + headers → fetch/mutate
│   │
│   ├── hooks/
│   │   ├── usePageSchema.ts   # 加载 Page Schema (URL/文件/内联)
│   │   └── useNeuronPage.ts   # 组合 Hook: schema + adapter + render
│   │
│   └── types.ts
├── tsconfig.json
└── __tests__/
    ├── schema-adapter.test.ts
    ├── neuron-catalog.test.ts
    ├── DataSourceLayer.test.tsx
    └── NeuronPage.test.tsx
```

### 7A.2 Catalog: 组件注册 (neuron-catalog.ts)

使用 json-render 的 `createCatalog()` 注册全部 53 个 N-组件:

```typescript
import { createCatalog, ActionSchema } from '@json-render/core'
import { z } from 'zod'

// Token 枚举 (与 @neuron-ui/tokens 中的 Token 定义一致)
const ColorToken = z.enum([
  'blue', 'green', 'pink', 'yellow', 'lime', 'purple',
  'lavender', 'coral', 'sand', 'mint',
  'error', 'warning', 'success'
])
const SizeToken = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])
const RadiusToken = z.enum(['tag', 'input', 'card', 'button', 'avatar'])

export const neuronCatalog = createCatalog({
  name: 'neuron-ui',
  components: {
    // ── 展示组件 (GET 响应) ──
    NDataTable: {
      props: z.object({
        columns: z.array(z.object({ field: z.string(), header: z.string(), sortable: z.boolean().optional() })),
        dataPath: z.string(), // $path 引用 DataProvider 数据
        pageSize: z.number().optional(),
      }),
      description: '数据表格，支持排序、分页、自定义列渲染',
    },
    NCard: {
      props: z.object({ title: z.string().optional(), padding: SizeToken.optional() }),
      hasChildren: true,
      description: '卡片容器',
    },
    NText: {
      props: z.object({ content: z.string(), size: SizeToken.optional(), color: ColorToken.optional() }),
      description: '文本显示',
    },
    NBadge: {
      props: z.object({ label: z.string(), color: ColorToken.optional(), variant: z.enum(['solid', 'outline', 'subtle']).optional() }),
      description: '状态标签',
    },
    NAvatar: {
      props: z.object({ src: z.string().optional(), name: z.string(), size: SizeToken.optional() }),
      description: '用户头像',
    },
    // ... (53 个组件全部注册，此处省略)

    // ── 输入组件 (POST/PUT 请求) ──
    NInput: {
      props: z.object({ placeholder: z.string().optional(), statePath: z.string().optional() }),
      description: '文本输入框',
    },
    NSelect: {
      props: z.object({ placeholder: z.string().optional(), options: z.array(z.object({ label: z.string(), value: z.string() })), statePath: z.string().optional() }),
      description: '下拉选择 (≤5 个选项)',
    },
    NSwitch: {
      props: z.object({ label: z.string().optional(), statePath: z.string().optional() }),
      description: '开关切换',
    },

    // ── 操作组件 ──
    NButton: {
      props: z.object({
        label: z.string(),
        color: ColorToken.optional(),
        variant: z.enum(['capsule', 'outline', 'ghost', 'link']).optional(),
        size: SizeToken.optional(),
        action: ActionSchema.optional(),
      }),
      description: '按钮，支持多种变体和颜色',
    },

    // ── 容器组件 ──
    NDialog: {
      props: z.object({ title: z.string(), triggerAction: z.string().optional() }),
      hasChildren: true,
      description: '模态弹窗',
    },
    NSheet: {
      props: z.object({ title: z.string(), side: z.enum(['left', 'right']).optional() }),
      hasChildren: true,
      description: '侧边面板',
    },
    NAlertDialog: {
      props: z.object({ title: z.string(), description: z.string(), confirmAction: ActionSchema.optional() }),
      description: '确认弹窗 (危险操作)',
    },
  },

  // ── Action 定义 ──
  actions: {
    openDialog:  { params: z.object({ target: z.string() }), description: '打开弹窗' },
    closeDialog: { params: z.object({ target: z.string() }), description: '关闭弹窗' },
    openSheet:   { params: z.object({ target: z.string() }), description: '打开侧边面板' },
    closeSheet:  { params: z.object({ target: z.string() }), description: '关闭侧边面板' },
    submitForm:  {
      params: z.object({ api: z.string(), body: z.record(z.any()) }),
      description: '提交表单到 API',
    },
    deleteItem:  {
      params: z.object({ api: z.string(), id: z.string() }),
      description: '删除条目 (自动弹出确认)',
    },
    refresh:     { params: z.object({ dataSource: z.string() }), description: '刷新数据源' },
    navigate:    { params: z.object({ target: z.string() }), description: '路由跳转' },
    toast:       { params: z.object({ message: z.string(), variant: z.enum(['success', 'error', 'info']) }), description: '通知提示' },
  },

  validation: 'strict',
})
```

**关键产出:** `neuronCatalog.prompt()` 自动生成 AI 系统提示词，可供 `@neuron-ui/generator` 直接消费。

### 7A.3 Registry: 组件实现映射 (neuron-registry.ts)

```typescript
import { defineRegistry, useDataValue } from '@json-render/react'
import { NButton, NDataTable, NDialog, NCard, NText, NBadge, ... } from '@neuron-ui/components'
import { neuronCatalog } from './neuron-catalog'

export const { registry } = defineRegistry(neuronCatalog, {
  components: {
    NButton: ({ props, onAction }) => (
      <NButton
        color={props.color} variant={props.variant} size={props.size}
        onClick={() => props.action && onAction?.(props.action)}
      >
        {props.label}
      </NButton>
    ),

    NDataTable: ({ props }) => {
      const data = useDataValue(props.dataPath) // 从 DataProvider 获取数据
      return <NDataTable data={data} columns={props.columns} pageSize={props.pageSize} />
    },

    NInput: ({ props }) => {
      const [value, setValue] = useDataBinding(props.statePath)
      return <NInput placeholder={props.placeholder} value={value} onChange={setValue} />
    },

    NDialog: ({ props, children }) => <NDialog title={props.title}>{children}</NDialog>,
    NCard:   ({ props, children }) => <NCard title={props.title} padding={props.padding}>{children}</NCard>,
    NText:   ({ props }) => <NText size={props.size} color={props.color}>{props.content}</NText>,
    NBadge:  ({ props }) => <NBadge color={props.color} variant={props.variant}>{props.label}</NBadge>,
    // ... 53 个组件全部映射
  },
})
```

### 7A.4 Schema Adapter: 格式转换

neuron-ui Page Schema 使用**嵌套树** (AI 生成友好)，json-render 使用**扁平邻接表** (渲染高效)。Adapter 负责一次性转换:

```typescript
// adapter/schema-adapter.ts
import type { PageSchema } from '@neuron-ui/metadata'
import type { UITree } from '@json-render/core'

export function pageSchemaToUITree(schema: PageSchema): UITree {
  const elements: Record<string, UIElement> = {}

  function flatten(node: SchemaNode): string {
    const childKeys = (node.children || []).map(c => flatten(c))
    elements[node.id] = {
      key: node.id,
      type: node.component,
      props: mergePropsAndBinding(node.props, node.binding),
      children: childKeys.length > 0 ? childKeys : undefined,
    }
    return node.id
  }

  const rootId = flatten(schema.tree[0])
  return { root: rootId, elements }
}
```

**Binding 适配规则:**

| neuron-ui binding | json-render 等价 |
|-------------------|-----------------|
| `binding.dataSource: "list"` | `props.dataPath: "/dataSources/list"` |
| `binding.field: "name"` | `props.statePath: "/form/name"` |
| `binding.onChange: { target: "list.params.keyword" }` | `on.change → setState { path: "/dataSources/list/params/keyword" }` |
| `binding.onClick: { action: "openDialog", target: "create" }` | `props.action: { name: "openDialog", params: { target: "create" } }` |
| `binding.onSubmit: { api: "POST /api/..." }` | `props.action: { name: "submitForm", params: { api: "POST /api/..." } }` |
| `binding.onConfirm: { api: "DELETE /api/.../{id}" }` | `props.confirmAction: { name: "deleteItem", params: { ... }, confirm: { title: "确认删除", variant: "danger" } }` |

### 7A.5 DataSourceLayer: API 数据获取

json-render 的 `DataProvider` 管理内存中的响应式数据模型。neuron-ui 在其上增加 `DataSourceLayer`，将 Page Schema 的 `dataSources` 声明转化为 API 请求并注入数据模型:

```typescript
// data/DataSourceLayer.tsx
import { DataProvider, ActionProvider } from '@json-render/react'

export function DataSourceLayer({ schema, dataProvider, actionOverrides, children }) {
  const [dataModel, setDataModel] = useState({})

  // 初始化: 遍历 dataSources 声明, 逐个请求
  useEffect(() => {
    const init = async () => {
      const model = {}
      for (const [key, ds] of Object.entries(schema.dataSources)) {
        const { method, path } = parseApi(ds.api)
        const data = await dataProvider.fetch({ method, path }, ds.params)
        model[`dataSources/${key}`] = { data, params: ds.params }
      }
      setDataModel(model)
    }
    init()
  }, [schema.dataSources])

  // Action handlers: 将 neuron-ui actions 映射到 dataProvider 的 fetch/mutate
  const handlers = {
    submitForm: async ({ api, body }) => {
      const { method, path } = parseApi(api)
      await dataProvider.mutate({ method, path }, body)
    },
    deleteItem: async ({ api, id }) => {
      const { method, path } = parseApi(api.replace('{id}', id))
      await dataProvider.mutate({ method, path })
    },
    refresh: async ({ dataSource }) => {
      const ds = schema.dataSources[dataSource]
      const data = await dataProvider.fetch(parseApi(ds.api), ds.params)
      // 更新 DataProvider 中对应路径
    },
    navigate: actionOverrides?.navigate || ((params) => window.location.href = params.target),
    toast: actionOverrides?.toast || ((params) => console.log(params.message)),
    ...actionOverrides,
  }

  return (
    <DataProvider initialData={dataModel}>
      <ActionProvider handlers={handlers}>
        {children}
      </ActionProvider>
    </DataProvider>
  )
}
```

### 7A.6 NeuronPage: 顶层组装

```typescript
// NeuronPage.tsx
import { Renderer } from '@json-render/react'
import { registry } from './catalog/neuron-registry'
import { pageSchemaToUITree } from './adapter/schema-adapter'
import { DataSourceLayer } from './data/DataSourceLayer'

export function NeuronPage({ schema, dataProvider, onAction }) {
  const uiTree = useMemo(() => pageSchemaToUITree(schema), [schema])

  return (
    <DataSourceLayer schema={schema} dataProvider={dataProvider} actionOverrides={onAction}>
      <Renderer
        tree={uiTree}
        registry={registry}
        fallback={({ element }) => <div>未知组件: {element.type}</div>}
      />
    </DataSourceLayer>
  )
}
```

---

## Phase 7B: 代码生成器 (@neuron-ui/codegen)

> CLI 工具将 Page Schema 编译为真实 `.tsx` 源码文件，开发者拿到代码后可任意定制。

### 7B.1 包目录结构

```
packages/codegen/
├── package.json              # @neuron-ui/codegen
├── bin/
│   └── neuron-codegen.ts     # CLI 入口 (#!/usr/bin/env node)
├── src/
│   ├── index.ts              # 编程方式调用导出
│   ├── cli.ts                # CLI 命令解析 (commander)
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
│   │   ├── merge.ts          # 增量合并 (AST 级, 保留手动修改)
│   │   ├── overwrite.ts      # 覆盖 (自动备份 .bak)
│   │   └── diff.ts           # 差异对比 (开发者逐项确认)
│   └── utils/
│       ├── schema-parser.ts  # 解析 Page Schema
│       └── code-formatter.ts # Prettier 格式化
├── tsconfig.json
└── __tests__/
    ├── generate.test.ts
    ├── page-generator.test.ts
    └── merge-strategy.test.ts
```

### 7B.2 CLI 命令

```bash
# 生成代码
npx neuron-codegen generate <schema-file> [options]
  --outdir <dir>       # 输出目录
  --style <type>       # hooks | swr | react-query (默认: hooks)
  --api-client <type>  # axios | fetch | ky (默认: fetch)
  --dry-run            # 只输出预览，不写入文件

# 批量生成
npx neuron-codegen generate ./schemas/*.json --outdir src/pages/

# 更新已有代码
npx neuron-codegen update <schema-file> [options]
  --outdir <dir>
  --strategy <type>    # merge | overwrite | diff (默认: merge)
```

### 7B.3 生成产物

```
src/pages/competitions/
├── CompetitionListPage.tsx          # 页面主组件
├── CompetitionListPage.hooks.ts     # 数据获取 hooks
├── CompetitionListPage.types.ts     # TypeScript 类型定义
└── components/
    ├── CreateCompetitionDialog.tsx   # 创建弹窗
    ├── EditCompetitionSheet.tsx      # 编辑面板
    └── DeleteConfirmDialog.tsx       # 删除确认
```

### 7B.4 代码生成策略

| 模板选项 | 说明 |
|---------|------|
| `--style hooks` | 纯 React hooks (useState + useEffect + fetch) |
| `--style swr` | SWR hooks (useSWR + useSWRMutation) |
| `--style react-query` | TanStack Query (useQuery + useMutation) |
| `--api-client fetch` | 原生 fetch API |
| `--api-client axios` | axios 实例 |
| `--api-client ky` | ky HTTP 客户端 |

### 7B.5 增量更新策略

| 策略 | 行为 |
|------|------|
| `merge` | AST 级别合并: 保留手动添加的代码, 仅更新自动生成的部分 |
| `overwrite` | 完全覆盖 (生成前自动备份 `.bak`) |
| `diff` | 输出 diff 对比, 由开发者逐项确认 |

### 7B.6 工具依赖

```
dependencies:
  commander          # CLI 参数解析
  handlebars         # 模板引擎
  prettier           # 代码格式化
  ts-morph           # TypeScript AST 操作 (merge 策略)
  chalk              # CLI 输出着色
  ora                # CLI loading spinner
```

---

## 与 generator 的协同: catalog.prompt()

json-render 的 `catalog.prompt()` 从 Catalog 定义自动生成 Markdown 格式的 AI 系统提示词。这为 `@neuron-ui/generator` 提供了关键优化:

```
之前 (手动维护):
  generator/src/prompts/system-prompt.ts → 手写组件清单 + props 描述 + action 列表
  generator/src/context/load-manifest.ts → 加载 component-manifest.json

之后 (json-render 自动):
  runtime/src/catalog/neuron-catalog.ts → createCatalog() 定义所有组件
  generator/src/prompts/system-prompt.ts → neuronCatalog.prompt() 自动生成
```

**影响:**
- `@neuron-ui/metadata` 中的 `component-manifest.json` 仍然需要 (编辑器用)，但 AI prompt 不再需要手动同步
- Catalog 的 Zod schema 成为组件 props 的**唯一定义源** (Single Source of Truth)
- generator 增加对 `@neuron-ui/runtime` 的依赖 (获取 neuronCatalog)

---

## 两种模式选择指南

```
场景判断:

需要运营实时调整页面?               → @neuron-ui/runtime (json-render)
   ├── CMS 管理后台
   ├── 多租户 SaaS
   └── 活动页/营销页 (频繁变更)

需要深度定制和复杂业务逻辑?         → @neuron-ui/codegen
   ├── 核心业务页面
   ├── 复杂表单 (跨字段校验、联动)
   └── 开发者脚手架 (AI 生成初始代码)

两者共存:                           → 一个项目可同时使用
   ├── 核心页面: Code Gen (深度定制)
   └── 运营页面: Runtime (热更新)
```

---

## 交付物

### Phase 7A (Runtime)

| 模块 | 文件 | 说明 |
|------|------|------|
| Catalog | neuron-catalog.ts | 53 个 N-组件 Zod 定义 + 9 个 action |
| Registry | neuron-registry.ts | N-组件 → React 实现映射 |
| Adapter | schema-adapter.ts, binding-adapter.ts, token-adapter.ts | Page Schema → UITree 转换 |
| 数据层 | DataSourceLayer.tsx, createDataProvider.ts | dataSources → API → DataProvider |
| 顶层 | NeuronPage.tsx | 组装 Adapter + DataSource + Renderer |
| Hooks | usePageSchema.ts, useNeuronPage.ts | Schema 加载 + 组合 |

### Phase 7B (CodeGen)

| 模块 | 文件 |
|------|------|
| CLI | neuron-codegen.ts, cli.ts |
| 命令 | generate.ts, update.ts |
| 生成器 | page-generator, hooks-generator, types-generator, component-generator |
| 模板 | page.ts.hbs, hooks-*.ts.hbs |
| 更新策略 | merge.ts, overwrite.ts, diff.ts |

---

## 验收标准

### 7A: Runtime 渲染器 (基于 json-render)

| # | 标准 |
|---|------|
| 1 | `<NeuronPage schema={...} />` 可正确渲染 CRUD / Dashboard / Detail 页面 |
| 2 | neuronCatalog 成功注册 53 个组件，`catalog.validateElement()` 可校验 |
| 3 | SchemaAdapter 正确转换嵌套 Page Schema → 扁平 UITree |
| 4 | DataSourceLayer 正确将 dataSources 映射到 API 请求并注入数据 |
| 5 | ActionProvider 正确处理 openDialog/submitForm/deleteItem/refresh/navigate/toast |
| 6 | `neuronCatalog.prompt()` 输出可用的 AI 系统提示词 |
| 7 | 运行时性能: Page Schema 加载 + adapter + 渲染 ≤ 1 秒 |

### 7B: 代码生成器

| # | 标准 |
|---|------|
| 1 | `npx neuron-codegen generate` 可从 CRUD Page Schema 生成完整 .tsx 文件集 |
| 2 | 生成的代码可直接编译运行 (无类型错误) |
| 3 | 支持三种 style (hooks/swr/react-query) + 三种 api-client (fetch/axios/ky) |
| 4 | `--dry-run` 正确输出预览不写文件 |
| 5 | `update --strategy merge` 可保留手动修改并添加新字段 |
| 6 | 生成的代码使用 Prettier 格式化 |
| 7 | 复杂 Page Schema (含表格、弹窗、面板) 生成代码结构清晰，组件拆分合理 |
