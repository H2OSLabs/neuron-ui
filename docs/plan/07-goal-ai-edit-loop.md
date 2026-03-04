# 目标 5：AI 编辑闭环系统

> 文档来源：基于 2026-02-04 架构草图整理。描述在 neuron-ui 页面生成能力之上，构建完整的"可视化编辑 → AI 理解 → 代码生成 → PR → 热加载"闭环系统。

---

## 1. 系统愿景

用户在可视化编辑器（App-UI）中操作一个 component 或整个 page，通过 **Chat** 或 **属性面板** 表达编辑意图，系统自动完成：AI 理解意图 → 生成代码变更 → 创建 PR → 热加载回页面。

```
用户在 App-UI（Page Builder）中操作
    │
    ├─── 直接拖拽 / 属性面板编辑  ──────────────────────────────►  Schema 实时更新 + Hot-load
    │
    └─── Chat 输入意图  ──►  Claude (for-layout)  ──►  Schema diff  ──►  画布实时更新
                                    │
                                    ▼
                        for-component（属性面板完整状态）
                                    │
                                    ▼
                              Template（富结构 JSON）
                                    │
                                    ▼
                         Claude（for-component 代码生成）
                                    │
                            ┌───────┴───────┐
                            ▼               ▼
                        生成 .tsx         git commit
                            │               │
                            └──────┬────────┘
                                   ▼
                                  PR
                                   │
                            ┌──────┴──────┐
                            ▼             ▼
                       合并到主分支    Hot-load 预览
```

---

## 2. 核心概念定义

### 2.1 App-UI（Page Builder）

可视化编辑器，操作对象可以是：
- **单个 component**：选中画布中的某一节点
- **整个 page**：对整页布局、数据绑定进行调整

### 2.2 for-layout

Claude 对"布局意图"的理解层。输入：`{ message, currentSchema, selectedNodeId }`，输出：`Schema diff`（局部更新，不涉及源码）。

适用场景：调整布局、修改 className、重排组件顺序、更改 props 值。

### 2.3 for-component（属性面板）

Page Builder 右侧属性编辑面板。不只是展示当前 props，而是打包**组件的完整上下文**：
- 当前 props 值
- 所有可用 props（来自 Component Registry 的 Zod Schema）
- 组件源码位置
- 相关 Design Tokens
- 用户的编辑历史

### 2.4 Template（AI 输入的完整上下文）

属性面板 submit 后生成的富结构 JSON，是发给 Claude（代码生成层）的 prompt 主体。

```jsonc
{
  "version": "1.0.0",
  "instruction": "把表格改成暗色主题，增加行悬停高亮效果",
  "target": {
    "type": "component",        // "component" | "page"
    "nodeId": "task-table",
    "componentName": "NDataTable"
  },
  "pageSchema": {
    // 完整的当前 Page Schema（同 spec/schemas/*.json 格式）
  },
  "componentContext": {
    "name": "NDataTable",
    "sourceFile": "packages/components/src/neuron/NDataTable/NDataTable.tsx",
    "currentProps": {
      "columns": [...],
      "className": "flex-1"
    },
    "availableProps": {
      // 来自 neuronCatalog Zod Schema 的全量 props 定义
      "striped": { "type": "boolean", "default": false },
      "hoverable": { "type": "boolean", "default": false },
      "variant": { "type": "enum", "values": ["default", "compact", "comfortable"] }
    },
    "storyUrl": "http://localhost:6006/?path=/story/ndatatable--default",
    "examples": [
      // Few-shot 示例，来自 component-manifest.json
    ]
  },
  "designTokens": {
    "colors": { "background": "#FCFCFC", "foreground": "#1a1a1a" },
    "spacing": { "sm": "8px", "md": "16px", "lg": "24px" }
  },
  "cssContext": {
    "currentClasses": "flex-1",
    "tokenMap": {
      "bg-background": "#FCFCFC",
      "text-foreground": "#1a1a1a"
    }
  },
  "editHistory": [
    { "timestamp": "...", "change": "added className: flex-1", "author": "user" }
  ],
  "assets": {
    // 组件依赖的静态资源（图标、图片等）
  }
}
```

### 2.5 Hot-load

Schema 变更后，Page Builder 画布**无需刷新**即可看到变化。分两个级别：

| 级别 | 触发方式 | 机制 |
|---|---|---|
| Schema Hot-load | 属性面板 onChange / Chat 返回 schema diff | React 状态更新 → 画布重新渲染 |
| Component Hot-load | PR 合并 / Template 应用后的源码变更 | Vite HMR 推送新组件模块 |

---

## 3. 五个核心模块

### 模块 1：数据模型（Page Schema）

整个系统的中间语言。已在 `spec/schemas/` 中有完整示例。

**需满足的三个条件：**
1. **人可视化编辑** → 属性面板从 Schema 读写 props
2. **AI 可理解和修改** → 层级结构清晰，字段语义明确
3. **可转换成代码** → codegen CLI 从 Schema 生成 .tsx

Schema 格式定义见：[目标 3 文档](./03-goal-auto-page-generation.md)

---

### 模块 2：Component Registry（组件注册表）

系统的"知识库"，同时服务于人（属性面板）和 AI（prompt context）。

```typescript
interface ComponentRegistration {
  name: string                    // "NDataTable"
  category: string                // "数据展示"
  propsSchema: ZodObject          // 人和 AI 都能用的 props 定义
  render: React.ComponentType     // 画布渲染用
  storyUrl: string                // Storybook 预览 URL
  examples: SchemaExample[]       // AI few-shot 参考
  sourceFile: string              // 组件源码路径
}
```

**三个消费者：**
- **Page Builder** → 组件面板显示可拖拽组件列表
- **属性面板** → 读 `propsSchema` 自动渲染编辑项（input / select / color picker）
- **Template 生成器** → 把 `propsSchema` 打包进 AI context

已有基础：`@neuron-ui/metadata` 中的 `neuronCatalog`（Zod + catalog.prompt()）

---

### 模块 3：可视化编辑器（App-UI + for-component 属性面板）

**画布区域：**
- 读 Page Schema → 通过 Registry 映射 → 渲染 React 组件树
- 每个组件包裹 `EditorNodeWrapper`（click → `selectNode(id)`）
- Schema 变更 → 画布实时重渲染

**属性面板（for-component）：**
- 读 Registry 的 `propsSchema` → 自动渲染对应编辑控件
- `onChange` → 更新 Page Schema 对应节点的 props
- "Export to AI" 按钮 → 生成 Template JSON
- 显示 Storybook URL（可直接跳转查看组件文档）

**Chat 面板：**
- 输入自然语言意图
- 携带 `{ template, message }` 发送给 Claude
- 接收 `schema_update` 类型响应 → 应用到画布

**布局示意：**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Builder                                                │
│  ┌──────────┐  ┌────────────────────────┐  ┌─────────────┐  │
│  │ 组件面板  │  │        画  布           │  │  属性面板   │  │
│  │          │  │                        │  │(for-comp)   │  │
│  │ NButton  │  │  ┌──────────────────┐  │  │             │  │
│  │ NCard    │  │  │   NDataTable     │  │  │ className   │  │
│  │ NTable   │  │  │   (selected) ◄── │──│─►│ columns     │  │
│  │ NInput   │  │  └──────────────────┘  │  │ hoverable   │  │
│  │  ...     │  │                        │  │ variant     │  │
│  └──────────┘  └────────────────────────┘  │             │  │
│                                            │ [Export AI] │  │
│                                            └─────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Chat: "把表格改成暗色，增加行悬停效果"         [发送] │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 模块 4：AI 集成层（两个 Claude 实例）

#### Claude 实例 A：for-layout（布局意图理解）

**输入：** `{ message, currentSchema, selectedNodeId }`

**输出：** `schema_update` — 只修改 Schema，不涉及源码

```json
{
  "type": "schema_update",
  "changes": [
    {
      "nodeId": "task-table",
      "props": {
        "className": "flex-1 dark:bg-zinc-900",
        "hoverable": true
      }
    }
  ],
  "explanation": "已为表格添加暗色背景和悬停高亮效果"
}
```

**对应 MCP Tool：** `edit_layout`

#### Claude 实例 B：for-component（代码生成）

**输入：** Template JSON（完整上下文）

**输出：** `code_change` — 修改组件源码，走 git 流程

```json
{
  "type": "code_change",
  "files": [
    {
      "path": "packages/components/src/neuron/NDataTable/NDataTable.tsx",
      "diff": "...",
      "description": "添加 hoverable prop 和对应 CSS 类"
    }
  ],
  "schemaUpdate": {
    // 同步更新 Page Schema 中的 props 定义
  },
  "commitMessage": "feat(NDataTable): add hoverable prop with dark mode support"
}
```

**对应 MCP Tool：** `apply_component_edit`

---

### 模块 5：代码流水线（Code Pipeline）

```
Schema 变更（用户操作 / Chat 响应）
         │
         ▼
  Codegen（Schema → .tsx）
  ─────────────────────────
  NDataTable + { hoverable: true, binding: { dataSource: "list" } }
         ↓
  const { data } = useDataSource('list')
  return <NDataTable hoverable columns={columns} data={data.items} />
         │
         ▼
  git add / commit（自动，commit message 由 AI 生成）
         │
         ▼
  gh pr create（自动，PR description 包含 Schema diff）
         │
    ┌────┴────┐
    ▼         ▼
  CI/CD     Hot-load
  合并       （PR 前就能在画布中预览：
            Vite HMR 推送新模块）
```

**git diff / commit / branch / new PR** 的触发时机：
- 用户主动点击"提交变更"按钮
- 或 Chat 指令包含"帮我提交/创建 PR"

---

## 4. Template 的核心地位

Template 是连接"人的可视化操作"和"AI 代码生成"的桥梁。

```
人的操作  ──►  属性面板  ──►  Template  ──►  AI  ──►  代码
  │                               │
  └── Page Schema（视图状态）──────┘
      组件源码（代码状态）
      Design Tokens（设计状态）
      用户意图（自然语言）
```

**Template 与 Page Schema 的关系：**
- Page Schema = Template 的核心部分（`template.pageSchema`）
- Template = Page Schema + 组件上下文 + Token 上下文 + 编辑意图
- `spec/schemas/*.json` 中的示例就是 Template 中 `pageSchema` 字段的格式

---

## 5. 与现有 neuron-ui 架构的对应关系

| 图中概念 | neuron-ui 对应模块 | 状态 |
|---|---|---|
| App-UI（Page Builder）| `@neuron-ui/page-builder` | ✅ 部分完成 |
| Component Search | Storybook + 组件面板 | ✅ 有 |
| for-component（属性面板）| page-builder PropertyPanel | ⚠️ 需增强 |
| Template | 新增 TemplateBuilder 模块 | ❌ 待建 |
| Claude（for-layout）| MCP Tool: `edit_layout` | ❌ 待建 |
| Claude（代码生成）| MCP Tool: `apply_component_edit` | ❌ 待建 |
| Storybook URL 导航 | MCP Tool: `get_component_storybook_url` | ❌ 待建 |
| Page Schema | `spec/schemas/*.json` 格式 | ✅ 已定义 |
| Hot-load（Schema 级）| Zustand store → React 重渲染 | ⚠️ 部分 |
| Hot-load（组件级）| Vite HMR | ❌ 需接入 |
| Codegen | `@neuron-ui/codegen` | ✅ 部分完成 |
| PR 自动化 | `gh pr create` + MCP Tool | ❌ 待建 |

---

## 6. 实现优先级

```
P0 — 核心闭环（最小可用版本）
  Step 1: 完善属性面板（for-component）
          → 从 neuronCatalog 读取 Zod schema
          → 自动渲染所有 props 的编辑控件
          → onChange 实时更新 Page Schema + 画布重渲染

  Step 2: Template 格式定义 + 导出
          → "Export to AI" 按钮
          → 打包 pageSchema + componentContext + tokens

  Step 3: Chat Panel + for-layout（Claude 实例 A）
          → Chat UI 接入 Claude API
          → 返回 schema_update → 应用到画布

P1 — 代码生成闭环
  Step 4: MCP Tool: apply_component_edit（Claude 实例 B）
          → Template → 组件源码 diff

  Step 5: PR 自动化
          → 生成代码 → git commit → gh pr create

P2 — 热加载完善
  Step 6: Component-level Hot-load
          → PR 前预览：Vite HMR 推送新组件模块
          → 画布自动反映源码变更
```

---

## 7. 关键技术决策

| 决策点 | 选择 | 理由 |
|---|---|---|
| Schema 格式 | 嵌套 JSON tree（现有格式）| AI 最容易理解层级结构 |
| Props 类型系统 | Zod（现有 neuronCatalog）| 同时服务属性面板和 AI context |
| AI 接口 | Claude API (claude-sonnet-4-6) | 最强的结构化 JSON 理解能力 |
| AI 响应格式 | `schema_update` / `code_change` 两种类型 | 区分"布局调整"和"组件代码变更" |
| PR 自动化 | `gh pr create` | 最简单，无需自建 git 服务 |
| Hot-load（Schema）| Zustand + React 重渲染 | 已有状态管理，零额外成本 |
| Hot-load（组件）| Vite HMR API | Vite 原生支持，侵入性最小 |

---

## 8. 最核心的设计约束

> **Schema 的表达能力边界** 是整个系统的核心难点。
>
> Schema 必须足够简单让 AI 可靠地修改（结构不超过 3 层嵌套，props 都是 JSON 原始类型），又足够完整让任意业务页面都能被表达（支持数据绑定、条件渲染、事件处理）。
>
> 这个边界的设计，决定了系统能支持多复杂的页面，以及 AI 修改的成功率。

---

## 9. 参考文档

| 文档 | 内容 |
|---|---|
| `docs/plan/03-goal-auto-page-generation.md` | Page Schema 格式完整定义 |
| `docs/plan/04-goal-drag-drop-refinement.md` | 可视化编辑器设计规范 |
| `docs/dev/09-phase8-mcp-server.md` | MCP Tool 设计（`edit_layout` 等可扩展至此）|
| `spec/schemas/*.json` | Template 中 pageSchema 字段的格式示例 |
| `docs/plan/06-architecture-diagrams.md` | 系统架构图汇总 |
