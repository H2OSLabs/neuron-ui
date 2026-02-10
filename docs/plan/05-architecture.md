# neuron-ui 前端组件架构设计

> 基于 shadcn/ui 二次开发的 API 驱动页面生成组件库架构
>
> 更新说明：本文件从 `04-architecture.md` 重命名而来。
> Layer 0-2 (Token → shadcn → neuron 组件) 架构不变，仍然适用。
> 新增的 Layer 3 架构（自动生成引擎 + 拖拉拽编辑器）详见：
> - [目标 2: 组件-接口类型映射](./02-goal-component-api-mapping.md) — component-api-mapping.json
> - [目标 3: 自动生成引擎](./03-goal-auto-page-generation.md) — API 解析 → 映射匹配 → Page Schema 生成
> - [目标 4: 拖拉拽编辑器](./04-goal-drag-drop-refinement.md) — 编辑器界面和技术方案
>
> 架构层级（8 个包）：
> ```
> Layer 0: Design Tokens (@neuron-ui/tokens)
> Layer 1: shadcn 原语 (src/ui/)
> Layer 2: neuron 组件 (src/neuron/)
> Layer 3: AI 页面生成 (@neuron-ui/generator) + 拖拉拽编辑器 (@neuron-ui/page-builder)
> 消费层: 运行时渲染器 (@neuron-ui/runtime) + 代码生成 CLI (@neuron-ui/codegen)
> 集成层: MCP Server (@neuron-ui/mcp-server) — AI 能力标准化接口
> 侧面支撑: 组件-接口映射规则 (@neuron-ui/metadata) — 作为 AI 的参考指南
> ```
>
> 重要变更：
> - 生成引擎由确定性解析器改为 AI 驱动，输入不再要求固定格式。
> - 渲染统一使用 json-render (Catalog + Registry + Renderer)，编辑器和运行时共用同一套渲染机制。
> - 组件 props 校验统一使用 Zod (json-render Catalog 中的 Zod schema 为唯一定义源)。

---

## 1 / 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Page Builder (拖拉拽搭建平台)                       │
│  @neuron-ui/page-builder                                    │
│  EditorRenderer (json-render) · Canvas · PropertyPanel · ComponentPanel │
└──────────────────────────┬──────────────────────────────────┘
                           │ 消费
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 2: neuron 组件 (NButton, NCard, NDialog...)           │
│  packages/components/src/neuron/                            │
│  自定义变体 · 插槽系统 · 业务逻辑 · data-neuron 属性          │
└──────────────────────────┬──────────────────────────────────┘
                           │ 包装
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 1: shadcn/ui 原语 (button.tsx, card.tsx, dialog.tsx)  │
│  packages/components/src/ui/                                │
│  Radix UI 无障碍 · CVA 变体管理 · Tailwind 样式              │
└──────────────────────────┬──────────────────────────────────┘
                           │ 样式来自
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 0: Design Tokens                                     │
│  @neuron-ui/tokens                                          │
│  tokens.json → CSS 变量 + @theme inline + TypeScript 常量    │
└─────────────────────────────────────────────────────────────┘
```

**侧面支撑：**

```
┌───────────────────────────────────┐
│  @neuron-ui/metadata              │
│  component-manifest.json          │  ← AI Agent 入口: 53 组件清单
│  component-api-mapping.json       │  ← 字段类型 → 组件映射规则
│  composition-rules.json           │  ← 组合/嵌套约束
│  builder-registry/                │  ← 搭建平台: 分类/缩略图/默认值
└───────────────────────────────────┘
```

---

## 2 / 关键技术决策

| 决策               | 选择                              | 理由                                                      |
| ------------------ | --------------------------------- | --------------------------------------------------------- |
| 包管理             | pnpm workspace + turborepo        | 7 个包独立版本，并行构建                                  |
| 样式方案           | Tailwind CSS v4 (CSS-first)       | shadcn 原生方案，`@theme inline` 直接在 CSS 中注册变量    |
| UI 原语            | shadcn/ui (Radix UI)              | 无障碍、键盘导航、ARIA 开箱即用，组件代码完全可控         |
| shadcn 基色        | stone                             | 最接近暖灰色系，CSS 变量覆盖量最小                        |
| 组件命名           | N 前缀 (NButton, NCard)           | 明确区分 neuron 业务组件和 shadcn 原语                    |
| Token 单一来源     | tokens.json                       | 一份文件生成 CSS、TypeScript、JSON 三种格式               |
| Page Schema 值格式 | Token key 而非原始值              | `"color": "blue"` 而非 `"color": "#BEF1FF"`，强制设计合规 |
| Builder 状态管理   | Zustand + zundo (temporal) 中间件 | 轻量，天然支持 undo/redo                                  |
| 测试               | Vitest + Testing Library          | 快速，与 Vite 生态一致                                    |
| 组件文档           | Storybook                         | 业界标准，支持可视化浏览所有变体                          |

---

## 3 / 项目目录结构

```
neuron-ui/
│
├── pnpm-workspace.yaml                        # workspace 定义
├── package.json                               # workspace root scripts
├── turbo.json                                 # turborepo 构建编排
├── tsconfig.base.json                         # 共享 TS 配置
├── components.json                            # shadcn CLI 配置
├── CLAUDE.md                                  # AI Agent 项目入口指令
├── .eslintrc.cjs
├── .prettierrc
│
├── docs/                                      # 设计规范 & 规划文档
│   ├── base/
│   │   ├── Agentour-base-desgin-ui.md
│   │   ├── synnovatour-bse-desgin-ui.csv
│   │   └── shared-design-tokens.md
│   ├── plan/
│   │   ├── 00-overview.md                     # 四目标总览
│   │   ├── 01-goal-shadcn-design-system.md    # 目标 1: shadcn 二次开发
│   │   ├── 02-goal-component-api-mapping.md   # 目标 2: 组件-接口映射
│   │   ├── 03-goal-auto-page-generation.md    # 目标 3: AI 自动生成
│   │   ├── 04-goal-drag-drop-refinement.md    # 目标 4: 拖拉拽编辑器
│   │   ├── 05-architecture.md                 # ← 本文件
│   │   └── 06-architecture-diagrams.md        # 13 张架构图
│   ├── guides/
│   │   ├── project-overview.md                # 项目总览
│   │   └── page-consumption.md                # 页面消费方案
│   └── dev/
│       ├── 00-development-roadmap.md          # 开发计划总览
│       └── 01~08-phase*.md                    # Phase 0-7 详细计划
│
├── packages/
│   │
│   ├── tokens/                                # @neuron-ui/tokens
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tokens.json                        # ★ 单一来源
│   │   ├── css/
│   │   │   ├── globals.css                    # 主入口: 变量 + @theme inline + base styles
│   │   │   ├── colors.css                     # 色彩变量
│   │   │   ├── spacing.css                    # 间距变量
│   │   │   ├── radius.css                     # 圆角变量
│   │   │   ├── typography.css                 # @font-face + 字号变量
│   │   │   └── animations.css                 # 过渡/动画
│   │   ├── src/
│   │   │   ├── index.ts                       # barrel export
│   │   │   ├── colors.ts                      # export const colors = { ... } as const
│   │   │   ├── spacing.ts
│   │   │   ├── radius.ts
│   │   │   └── typography.ts
│   │   └── scripts/
│   │       └── generate-tokens.ts             # tokens.json → CSS + TS 生成脚本
│   │
│   ├── components/                            # @neuron-ui/components
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts                     # library mode 构建
│   │   ├── SHADCN_OVERRIDES.md                # 记录对 ui/ 文件的所有修改
│   │   ├── src/
│   │   │   ├── index.ts                       # barrel: 导出所有 neuron 组件
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   └── utils.ts                   # cn() = clsx + tailwind-merge
│   │   │   │
│   │   │   ├── ui/                            # Layer 1: shadcn 原语
│   │   │   │   ├── button.tsx                 #   从 shadcn CLI 复制
│   │   │   │   ├── badge.tsx                  #   仅做 Tier B 最小修改
│   │   │   │   ├── avatar.tsx                 #   修改记录在 SHADCN_OVERRIDES.md
│   │   │   │   ├── input.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── combobox.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── resizable.tsx
│   │   │   │   └── data-table.tsx
│   │   │   │
│   │   │   └── neuron/                        # Layer 2: neuron 组件
│   │   │       ├── NButton/
│   │   │       │   ├── NButton.tsx
│   │   │       │   ├── NButton.types.ts
│   │   │       │   ├── NButton.test.tsx
│   │   │       │   ├── NButton.stories.tsx
│   │   │       │   └── index.ts
│   │   │       ├── NBadge/
│   │   │       │   └── ...
│   │   │       ├── NAvatar/
│   │   │       │   └── ...
│   │   │       ├── NInput/
│   │   │       │   └── ...
│   │   │       ├── NText/
│   │   │       │   └── ...
│   │   │       ├── NCard/
│   │   │       │   ├── NCard.tsx
│   │   │       │   ├── NCard.types.ts
│   │   │       │   ├── variants/              # Card 5 种变体
│   │   │       │   │   ├── CardCoverLeft.tsx
│   │   │       │   │   ├── CardCoverTop.tsx
│   │   │       │   │   ├── CardCoverFull.tsx
│   │   │       │   │   ├── CardProfile.tsx
│   │   │       │   │   └── CardNotification.tsx
│   │   │       │   ├── NCard.test.tsx
│   │   │       │   ├── NCard.stories.tsx
│   │   │       │   └── index.ts
│   │   │       ├── NDialog/
│   │   │       │   └── ...
│   │   │       ├── NSheet/
│   │   │       │   └── ...
│   │   │       ├── NAspectRatio/
│   │   │       │   └── ...
│   │   │       ├── NScrollArea/
│   │   │       │   └── ...
│   │   │       ├── NInputGroup/
│   │   │       │   └── ...
│   │   │       ├── NCombobox/
│   │   │       │   └── ...
│   │   │       ├── NCheckbox/
│   │   │       │   └── ...
│   │   │       ├── NRadioGroup/
│   │   │       │   └── ...
│   │   │       ├── NSwitch/
│   │   │       │   └── ...
│   │   │       ├── NTextarea/
│   │   │       │   └── ...
│   │   │       ├── NCalendar/
│   │   │       │   └── ...
│   │   │       ├── NCarousel/
│   │   │       │   └── ...
│   │   │       ├── NDataTable/
│   │   │       │   └── ...
│   │   │       ├── NDropdownMenu/
│   │   │       │   └── ...
│   │   │       ├── NEmpty/
│   │   │       │   └── ...
│   │   │       ├── NToast/
│   │   │       │   └── ...
│   │   │       ├── NToggle/
│   │   │       │   └── ...
│   │   │       ├── NToggleGroup/
│   │   │       │   └── ...
│   │   │       └── NResizable/
│   │   │           └── ...
│   │   │
│   │   └── .storybook/
│   │       ├── main.ts
│   │       └── preview.ts
│   │
│   ├── metadata/                              # @neuron-ui/metadata
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── component-manifest.json            # AI 入口: 组件清单
│   │   ├── component-api-mapping.json         # 组件-接口映射规则 (目标 2 核心产物)
│   │   ├── composition-rules.json             # 组合规则
│   │   ├── schemas/                           # per-component schema
│   │   │   ├── _meta.schema.json              # schema 自身的 JSON Schema
│   │   │   ├── button.schema.json
│   │   │   ├── badge.schema.json
│   │   │   ├── card.schema.json
│   │   │   └── ... (每个组件一个)
│   │   ├── page-schema/
│   │   │   ├── page.schema.json               # Page Schema 的 JSON Schema
│   │   │   └── examples/
│   │   │       ├── activity-page.json
│   │   │       ├── leaderboard-page.json
│   │   │       └── form-page.json
│   │   ├── builder-registry/
│   │   │   ├── component-registry.json        # 搭建平台: 缩略图/分类/默认值
│   │   │   └── editor-types.json              # 属性编辑器类型映射
│   │   ├── ai-protocol/
│   │   │   ├── USAGE.md                       # AI 使用协议
│   │   │   └── prompt-templates/
│   │   │       ├── compose-page.md
│   │   │       └── modify-component.md
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── validator.ts                   # Schema 校验器
│   │   │   ├── page-schema-validator.ts       # Page Schema 校验器
│   │   │   └── types.ts                       # TypeScript 类型
│   │   └── scripts/
│   │       └── extract-schemas.ts             # 从组件类型自动提取 schema
│   │
│   ├── page-builder/                          # @neuron-ui/page-builder (app)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── stores/
│   │       │   ├── editor-store.ts            # Zustand + zundo: page tree + undo/redo
│   │       │   └── selection-store.ts         # 选中状态
│   │       ├── renderer/
│   │       │   └── EditorRenderer.tsx         # 基于 json-render Renderer + 编辑器交互层
│   │       ├── editor/
│   │       │   ├── Canvas.tsx                 # 拖拽画布
│   │       │   ├── ComponentPanel.tsx         # 左侧: 组件面板
│   │       │   ├── PropertyPanel.tsx          # 右侧: 属性编辑
│   │       │   ├── Breadcrumb.tsx             # 层级路径
│   │       │   └── Toolbar.tsx                # 撤销/重做/预览/导出
│   │       ├── property-editors/
│   │       │   ├── TokenSelect.tsx            # 从 tokens.json 加载的下拉
│   │       │   ├── SizeInput.tsx
│   │       │   ├── TextInput.tsx
│   │       │   ├── VariantSelect.tsx
│   │       │   ├── ImageUpload.tsx
│   │       │   ├── SlotEditor.tsx
│   │       │   └── ToggleEditor.tsx
│   │       └── templates/
│   │           └── built-in/
│   │               ├── activity-page.json
│   │               └── leaderboard.json
│   │
│   ├── generator/                             # @neuron-ui/generator
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts                     # library mode
│   │   └── src/
│   │       ├── index.ts                       # 导出 generatePage()
│   │       ├── generate.ts                    # 核心: 调用 AI API 生成 Page Schema
│   │       ├── prompts/
│   │       │   ├── system-prompt.ts           # System Prompt (可消费 neuronCatalog.prompt())
│   │       │   └── examples/                  # Few-shot 示例
│   │       │       ├── crud-example.json
│   │       │       ├── dashboard-example.json
│   │       │       └── detail-example.json
│   │       ├── context/
│   │       │   ├── load-mapping.ts            # 加载 component-api-mapping.json
│   │       │   ├── load-manifest.ts           # 加载 component-manifest.json
│   │       │   └── load-rules.ts              # 加载 composition-rules.json
│   │       ├── validator/
│   │       │   ├── schema-validator.ts        # 复用 runtime Catalog 的 Zod 校验
│   │       │   ├── binding-validator.ts       # 数据绑定完整性校验
│   │       │   └── composition-validator.ts   # 组件嵌套校验
│   │       └── types.ts
│   │
│   ├── runtime/                               # @neuron-ui/runtime
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts                     # library mode
│   │   └── src/
│   │       ├── index.ts                       # 导出 NeuronPage, neuronCatalog, registry 等
│   │       ├── NeuronPage.tsx                 # 顶层容器
│   │       ├── catalog/
│   │       │   ├── neuron-catalog.ts          # createCatalog(): 53 组件 Zod schema (唯一定义源)
│   │       │   ├── neuron-registry.ts         # defineRegistry(): N-组件 → React 实现
│   │       │   └── neuron-actions.ts          # action handlers 默认实现
│   │       ├── adapter/
│   │       │   ├── schema-adapter.ts          # Page Schema (树形) → json-render UITree (扁平)
│   │       │   ├── binding-adapter.ts         # binding 协议 → $path / ActionSchema
│   │       │   └── token-adapter.ts           # Token key → CSS 变量
│   │       ├── data/
│   │       │   ├── DataSourceLayer.tsx        # dataSources → API → DataProvider
│   │       │   └── createDataProvider.ts      # 快捷工厂
│   │       └── hooks/
│   │           ├── usePageSchema.ts           # 加载 Page Schema
│   │           └── useNeuronPage.ts           # 组合 Hook
│   │
│   ├── codegen/                               # @neuron-ui/codegen (CLI)
│   │   ├── package.json
│   │   ├── bin/
│   │   │   └── neuron-codegen.ts              # CLI 入口
│   │   └── src/
│           ├── index.ts
│           ├── cli.ts                         # commander 命令解析
│           ├── commands/
│           │   ├── generate.ts                # generate 命令
│           │   └── update.ts                  # update 命令 (增量更新)
│           ├── generators/
│           │   ├── page-generator.ts          # Page Schema → 页面组件 .tsx
│           │   ├── hooks-generator.ts         # Page Schema → 数据 hooks
│           │   ├── types-generator.ts         # Page Schema → TypeScript 类型
│           │   └── component-generator.ts     # 子节点 → 子组件文件
│           ├── templates/
│           │   ├── page.ts.hbs                # Handlebars 模板
│           │   ├── hooks-swr.ts.hbs
│           │   ├── hooks-query.ts.hbs
│           │   └── hooks-fetch.ts.hbs
│           ├── strategies/
│           │   ├── merge.ts                   # AST 级合并
│           │   ├── overwrite.ts               # 覆盖 (自动备份)
│           │   └── diff.ts                    # 差异对比
│           └── utils/
│   │           ├── schema-parser.ts
│   │           └── code-formatter.ts          # Prettier 格式化
│   │
│   └── mcp-server/                            # @neuron-ui/mcp-server (MCP 服务)
│       ├── package.json
│       ├── bin/
│       │   └── neuron-mcp.ts                  # CLI 入口 (stdio transport)
│       └── src/
│           ├── index.ts                       # createNeuronMcpServer()
│           ├── server.ts                      # MCP Server 主体
│           ├── tools/                         # 11 个 MCP Tool handlers
│           │   ├── metadata/                  # list-components, get-component, get-mapping, get-composition, get-tokens
│           │   ├── generation/                # analyze-api, generate-page, validate-schema, suggest-components
│           │   └── codegen/                   # generate-code, preview-code
│           ├── resources/                     # 12 个 MCP Resources (metadata/tokens/schemas/examples)
│           ├── prompts/                       # 3 个 MCP Prompt 模板
│           └── loaders/                       # 数据加载层 (metadata/tokens/catalog/examples)
│
└── scripts/                                   # workspace 级脚本
    ├── build-all.ts
    ├── generate-manifest.ts
    └── validate-tokens.ts
```

---

## 4 / Token 系统实现

### 4.1 单一来源: tokens.json

`packages/tokens/tokens.json` 是所有 Token 的唯一定义。生成脚本读取此文件，输出 CSS 和 TypeScript。

```jsonc
{
  "version": "1.0.0",
  "colors": {
    "gray": {
      "01": { "value": "#5F5D57", "usage": "主要文字/图标描边", "cssVar": "--gray-01" },
      "02": { "value": "#6D6B65", "usage": "标题", "cssVar": "--gray-02" },
      "03": { "value": "#7E7C76", "usage": "副标题", "cssVar": "--gray-03" },
      "04": { "value": "#8D8B85", "usage": "次要文字", "cssVar": "--gray-04" },
      "05": { "value": "#9B9993", "usage": "弱化文字", "cssVar": "--gray-05" },
      "06": { "value": "#A8A6A0", "usage": "占位符", "cssVar": "--gray-06" },
      "07": { "value": "#B9B7B1", "usage": "禁用状态", "cssVar": "--gray-07" },
      "08": { "value": "#CDCBC5", "usage": "分割线", "cssVar": "--gray-08" },
      "09": { "value": "#DCDAD4", "usage": "边框", "cssVar": "--gray-09" },
      "10": { "value": "#E8E5DE", "usage": "淡边框", "cssVar": "--gray-10" },
      "11": { "value": "#ECE9E3", "usage": "悬停状态", "cssVar": "--gray-11" },
      "12": { "value": "#F3F1ED", "usage": "卡片背景", "cssVar": "--gray-12" },
      "13": { "value": "#F9F8F6", "usage": "页面背景", "cssVar": "--gray-13" },
      "14": { "value": "#FCFCFC", "usage": "表面", "cssVar": "--gray-14" }
    },
    "accent": {
      "pink":          { "value": "#FFC4E1", "cssVar": "--accent-pink" },
      "pink-light":    { "value": "#FFD6D2", "cssVar": "--accent-pink-light" },
      "yellow":        { "value": "#FFF0CE", "cssVar": "--accent-yellow" },
      "yellow-bright": { "value": "#FFFBBC", "cssVar": "--accent-yellow-bright" },
      "lime":          { "value": "#EEFFAF", "cssVar": "--accent-lime" },
      "lime-light":    { "value": "#E1FFD0", "cssVar": "--accent-lime-light" },
      "green":         { "value": "#C1F2CE", "cssVar": "--accent-green" },
      "blue":          { "value": "#BEF1FF", "cssVar": "--accent-blue" },
      "purple":        { "value": "#E1E1FF", "cssVar": "--accent-purple" },
      "lavender":      { "value": "#F0E6FF", "cssVar": "--accent-lavender" }
    },
    "semantic": {
      "error":   { "value": "#E67853", "cssVar": "--color-error" },
      "warning": { "value": "#E8A540", "cssVar": "--color-warning" },
      "success": { "value": "#6EC18E", "cssVar": "--color-success" }
    }
  },
  "spacing": {
    "xs":  { "value": "4px",  "cssVar": "--spacing-xs" },
    "sm":  { "value": "8px",  "cssVar": "--spacing-sm" },
    "md-": { "value": "12px", "cssVar": "--spacing-md-" },
    "md":  { "value": "16px", "cssVar": "--spacing-md" },
    "lg-": { "value": "20px", "cssVar": "--spacing-lg-" },
    "lg":  { "value": "24px", "cssVar": "--spacing-lg" },
    "xl":  { "value": "32px", "cssVar": "--spacing-xl" },
    "2xl": { "value": "36px", "cssVar": "--spacing-2xl" },
    "3xl": { "value": "48px", "cssVar": "--spacing-3xl" },
    "4xl": { "value": "64px", "cssVar": "--spacing-4xl" }
  },
  "radius": {
    "sm":   { "value": "4px",    "usage": "标签/徽章", "cssVar": "--radius-sm" },
    "md":   { "value": "8px",    "usage": "输入框", "cssVar": "--radius-md" },
    "lg":   { "value": "12px",   "usage": "卡片/面板", "cssVar": "--radius-lg" },
    "xl":   { "value": "20px",   "usage": "按钮", "cssVar": "--radius-xl" },
    "full": { "value": "9999px", "usage": "头像/药丸", "cssVar": "--radius-full" }
  },
  "typography": {
    "fontFamily": {
      "heading": "Asul",
      "body": "Swei Gothic CJK SC",
      "fallback": "system-ui, -apple-system, sans-serif"
    },
    "fontSize": {
      "display":    { "value": "48px", "weight": 700, "lineHeight": 1.2 },
      "heading":    { "value": "36px", "weight": 700, "lineHeight": 1.3 },
      "subheading": { "value": "28px", "weight": 700, "lineHeight": 1.3 },
      "section":    { "value": "24px", "weight": 500, "lineHeight": 1.4 },
      "body-lg":    { "value": "18px", "weight": 400, "lineHeight": 1.6 },
      "body":       { "value": "14px", "weight": 400, "lineHeight": 1.6 },
      "caption":    { "value": "12px", "weight": 400, "lineHeight": 1.5 }
    }
  }
}
```

### 4.2 globals.css — Token 与 Tailwind v4 的桥梁

```css
@import "tailwindcss";

/* ================================================================
   FONT FACES
   ================================================================ */
@font-face {
  font-family: 'Swei Gothic CJK SC';
  src: url('https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.142/WebFont/CJK%20SC/SweiGothicCJKsc-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Swei Gothic CJK SC';
  src: url('https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.142/WebFont/CJK%20SC/SweiGothicCJKsc-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

/* ================================================================
   CSS VARIABLES
   ================================================================ */
:root {
  /* Gray Scale (14 级暖灰) */
  --gray-01: #5F5D57;
  --gray-02: #6D6B65;
  --gray-03: #7E7C76;
  --gray-04: #8D8B85;
  --gray-05: #9B9993;
  --gray-06: #A8A6A0;
  --gray-07: #B9B7B1;
  --gray-08: #CDCBC5;
  --gray-09: #DCDAD4;
  --gray-10: #E8E5DE;
  --gray-11: #ECE9E3;
  --gray-12: #F3F1ED;
  --gray-13: #F9F8F6;
  --gray-14: #FCFCFC;

  /* Accent Colors (10 种辅助色) */
  --accent-pink: #FFC4E1;
  --accent-pink-light: #FFD6D2;
  --accent-yellow: #FFF0CE;
  --accent-yellow-bright: #FFFBBC;
  --accent-lime: #EEFFAF;
  --accent-lime-light: #E1FFD0;
  --accent-green: #C1F2CE;
  --accent-blue: #BEF1FF;
  --accent-purple: #E1E1FF;
  --accent-lavender: #F0E6FF;

  /* Semantic Colors */
  --color-error: #E67853;
  --color-warning: #E8A540;
  --color-success: #6EC18E;

  /* ★ shadcn 语义变量 → 暖灰色系映射 */
  --background: var(--gray-13);
  --foreground: var(--gray-01);
  --card: var(--gray-14);
  --card-foreground: var(--gray-01);
  --popover: var(--gray-14);
  --popover-foreground: var(--gray-01);
  --primary: var(--gray-01);
  --primary-foreground: var(--gray-14);
  --secondary: var(--gray-12);
  --secondary-foreground: var(--gray-02);
  --muted: var(--gray-12);
  --muted-foreground: var(--gray-05);
  --accent: var(--gray-11);
  --accent-foreground: var(--gray-01);
  --destructive: var(--color-error);
  --destructive-foreground: var(--gray-14);
  --border: var(--gray-09);
  --input: var(--gray-09);
  --ring: var(--gray-05);

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md-: 12px;
  --spacing-md: 16px;
  --spacing-lg-: 20px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 36px;
  --spacing-3xl: 48px;
  --spacing-4xl: 64px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;
  --radius: 8px;

  /* Typography */
  --font-heading: 'Asul', serif;
  --font-body: 'Swei Gothic CJK SC', system-ui, -apple-system, sans-serif;
  --font-size-display: 48px;
  --font-size-heading: 36px;
  --font-size-subheading: 28px;
  --font-size-section: 24px;
  --font-size-body-lg: 18px;
  --font-size-body: 14px;
  --font-size-caption: 12px;
}

/* ================================================================
   TAILWIND v4: @theme inline — 注册 CSS 变量为 Tailwind 工具类
   ================================================================ */
@theme inline {
  /* shadcn 语义色 → Tailwind: bg-background, text-foreground, etc. */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* neuron 灰阶 → Tailwind: bg-gray-01, text-gray-05, etc. */
  --color-gray-01: var(--gray-01);
  --color-gray-02: var(--gray-02);
  --color-gray-03: var(--gray-03);
  --color-gray-04: var(--gray-04);
  --color-gray-05: var(--gray-05);
  --color-gray-06: var(--gray-06);
  --color-gray-07: var(--gray-07);
  --color-gray-08: var(--gray-08);
  --color-gray-09: var(--gray-09);
  --color-gray-10: var(--gray-10);
  --color-gray-11: var(--gray-11);
  --color-gray-12: var(--gray-12);
  --color-gray-13: var(--gray-13);
  --color-gray-14: var(--gray-14);

  /* neuron 辅助色 → Tailwind: bg-accent-pink, text-accent-blue, etc. */
  --color-accent-pink: var(--accent-pink);
  --color-accent-pink-light: var(--accent-pink-light);
  --color-accent-yellow: var(--accent-yellow);
  --color-accent-yellow-bright: var(--accent-yellow-bright);
  --color-accent-lime: var(--accent-lime);
  --color-accent-lime-light: var(--accent-lime-light);
  --color-accent-green: var(--accent-green);
  --color-accent-blue: var(--accent-blue);
  --color-accent-purple: var(--accent-purple);
  --color-accent-lavender: var(--accent-lavender);

  /* 语义色 */
  --color-error: var(--color-error);
  --color-warning: var(--color-warning);
  --color-success: var(--color-success);

  /* 圆角 → Tailwind: rounded-sm, rounded-xl, etc. */
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-full: var(--radius-full);

  /* 字体 → Tailwind: font-heading, font-body */
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
}

/* ================================================================
   BASE STYLES
   ================================================================ */
* {
  border-color: var(--border);
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  line-height: 1.6;
}
```

### 4.3 Tailwind 工具类使用效果

配置完成后，开发者可以直接使用：

```tsx
// neuron 自定义 Token 类
<div className="bg-gray-12 text-gray-01 rounded-lg p-4">
  <span className="text-gray-04 text-sm">次要信息</span>
  <Badge className="bg-accent-pink text-gray-01">标签</Badge>
</div>

// shadcn 语义类（已映射到暖灰）
<Button className="bg-primary text-primary-foreground">提交</Button>
```

---

## 5 / shadcn 定制策略

### 三层定制模型

```
┌──────────────────────────────────────────────────────────────┐
│ Tier A: 零接触 (CSS 变量重映射)                    覆盖 ~80%  │
│ 在 globals.css 中将 --primary/--border 等映射到暖灰          │
│ shadcn 组件中的 bg-primary/text-muted-foreground 自动生效     │
│ 无需修改任何组件文件                                          │
├──────────────────────────────────────────────────────────────┤
│ Tier B: 最小修改 (class 调整)                     覆盖 ~15%  │
│ 在 ui/*.tsx 中调整少量 Tailwind class                        │
│ 如: h-10 → h-8, p-4 → p-3                                   │
│ 每项修改记录在 SHADCN_OVERRIDES.md                            │
├──────────────────────────────────────────────────────────────┤
│ Tier C: 完整包装 (neuron 组件层)                   覆盖 ~5%   │
│ 在 neuron/NXxx/ 中包装 ui/xxx                                │
│ 添加: 自定义变体、插槽、业务逻辑、尺寸映射                      │
│ shadcn 升级完全不影响此层                                     │
└──────────────────────────────────────────────────────────────┘
```

### shadcn 升级流程

```
1. npx shadcn@latest diff              # 查看上游变化
2. 替换 src/ui/*.tsx                     # 覆盖原语文件
3. 重新应用 SHADCN_OVERRIDES.md 中的修改  # 恢复 Tier B 调整
4. neuron/ 层无需任何操作                 # Tier C 不受影响
5. 运行测试验证                           # pnpm test
```

---

## 6 / neuron 组件开发模式

### 每个组件的标准目录

```
NButton/
├── NButton.tsx           # 组件实现，包装 ui/button
├── NButton.types.ts      # TypeScript Props 类型定义
├── NButton.test.tsx      # Vitest 单元测试
├── NButton.stories.tsx   # Storybook story (所有变体)
└── index.ts              # export { NButton } from './NButton'
```

### 包装模式示例: NButton

**Types (`NButton.types.ts`):**

```typescript
import type { ReactNode } from "react"

export type NButtonVariant = "capsule" | "circle" | "custom"
export type NButtonSize = "xs" | "sm" | "md" | "lg" | "xl"
export type AccentColor = "pink" | "yellow" | "lime" | "green" | "blue" | "purple" | "lavender"

export interface NButtonProps {
  variant?: NButtonVariant
  size?: NButtonSize
  color?: AccentColor
  label?: string
  icon?: string // ★ JSON Serializable: 图标名称 (如 "plus", "search")
  iconPosition?: "left" | "right"
  disabled?: boolean
  className?: string
  onClick?: () => void
  children?: ReactNode
}
```

**Implementation (`NButton.tsx`):**

```tsx
import { Button as ShadcnButton } from "../../ui/button"
import { cn } from "../../lib/utils"
import type { NButtonProps } from "./NButton.types"
import { Archive, Plus, Search, Trash } from "lucide-react" // 示例图标

const sizeMap = {
  xs: "h-5",    // 20px
  sm: "h-6",    // 24px
  md: "h-8",    // 32px
  lg: "h-9",    // 36px
  xl: "h-12",   // 48px
} as const

const shapeMap = {
  capsule: "rounded-xl",                     // 20px radius
  circle:  "rounded-full aspect-square p-0", // 圆形
  custom:  "",
} as const

const colorMap: Record<string, string> = {
  pink:     "bg-accent-pink hover:bg-accent-pink/80 text-gray-01",
  yellow:   "bg-accent-yellow hover:bg-accent-yellow/80 text-gray-01",
  lime:     "bg-accent-lime hover:bg-accent-lime/80 text-gray-01",
  green:    "bg-accent-green hover:bg-accent-green/80 text-gray-01",
  blue:     "bg-accent-blue hover:bg-accent-blue/80 text-gray-01",
  purple:   "bg-accent-purple hover:bg-accent-purple/80 text-gray-01",
  lavender: "bg-accent-lavender hover:bg-accent-lavender/80 text-gray-01",
}

// ★ Icon Resolver: 字符串 → 组件映射
const iconMap: Record<string, React.ElementType> = {
  plus: Plus,
  search: Search,
  trash: Trash,
  archive: Archive,
}

export function NButton({
  variant = "capsule",
  size = "md",
  color,
  label,
  icon,
  iconPosition = "left",
  disabled = false,
  className,
  onClick,
  children,
  ...rest
}: NButtonProps) {
  const shadcnVariant = color ? undefined : "default"
  // ★ 解析图标
  const IconComponent = icon ? iconMap[icon] : null

  return (
    <ShadcnButton
      variant={shadcnVariant}
      className={cn(
        shapeMap[variant],
        sizeMap[size],
        color && colorMap[color],
        disabled && "text-gray-07 cursor-not-allowed opacity-60",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      data-neuron-component="NButton"
      data-neuron-variant={variant}
      data-neuron-size={size}
      {...rest}
    >
      {IconComponent && iconPosition === "left" && (
        <span className="inline-flex shrink-0 mr-2"><IconComponent className="w-4 h-4" /></span>
      )}
      {label || children}
      {IconComponent && iconPosition === "right" && (
        <span className="inline-flex shrink-0 ml-2"><IconComponent className="w-4 h-4" /></span>
      )}
    </ShadcnButton>
  )
}
```

### 组件开发清单 (按优先级)

| 优先级 | 组件          | 关键规格                            | shadcn 对应   |
| ------ | ------------- | ----------------------------------- | ------------- |
| **P0** | NButton       | 胶囊/圆形/异形, h: 20/24/32/36/48px | button        |
| **P0** | NBadge        | h: 16/24px, r: 4px                  | badge         |
| **P0** | NAvatar       | 圆形/圆角方形, 描边/在线状态        | avatar        |
| **P0** | NInput        | h: 32px, 无效态                     | input         |
| **P0** | NText         | 7 级字号, 4 级字重                  | 无 (自建)     |
| **P1** | NCard         | 5 种变体                            | card          |
| **P1** | NDialog       | 九宫定位, 内边距 20px               | dialog        |
| **P1** | NSheet        | 侧边推入, w: 396px                  | sheet         |
| **P1** | NAspectRatio  | w: 856px, 可展开收起                | aspect-ratio  |
| **P1** | NScrollArea   | 水平/纵向, 行间距 8px               | scroll-area   |
| **P2** | NInputGroup   | h: 36px, 搜索/tag/下拉              | 无 (自建)     |
| **P2** | NCombobox     | 单选/多选, 搜索, 分组               | combobox      |
| **P2** | NCheckbox     | 内边距 8px, 行间距 8px              | checkbox      |
| **P2** | NRadioGroup   | 禁用/警告态                         | radio-group   |
| **P2** | NSwitch       | h: 18px, w: 40px                    | switch        |
| **P2** | NTextarea     | 856x180px, 内间距 16px              | textarea      |
| **P3** | NCalendar     | w: 328px, h: 324px                  | calendar      |
| **P3** | NCarousel     | 方向可调                            | carousel      |
| **P3** | NDataTable    | 排序/过滤, 多变体                   | data-table    |
| **P3** | NDropdownMenu | 内边距 16/8px                       | dropdown-menu |
| **P3** | NEmpty        | 居中, 按钮 136x32px                 | 无 (自建)     |
| **P4** | NToast        | 可点击文字                          | toast         |
| **P4** | NToggle       | 颜色/大小变化                       | toggle        |
| **P4** | NToggleGroup  | 横/纵排列, icon 18x18px             | toggle-group  |
| **P4** | NResizable    | 断点: 1440/1340/1288/928px          | resizable     |

---

## 7 / AI 元数据系统

### 三个 JSON 文件 = AI 的完整认知

```
CLAUDE.md (AI 打开项目时自动读取)
    ↓ 指向
component-manifest.json (一个文件了解全部组件)
    ↓ 详细
schemas/*.schema.json (每个组件的 Props/约束/示例)
    ↓ 约束
composition-rules.json (组件嵌套规则)
```

### component-manifest.json 结构

```jsonc
{
  "version": "1.0.0",
  "library": "neuron-ui",
  "designTokensPath": "../tokens/tokens.json",
  "compositionRulesPath": "./composition-rules.json",
  "components": [
    {
      "name": "NButton",
      "displayName": "Button / 按钮",
      "description": "按钮组件，支持胶囊/圆形/异形三种变体，可插入 icon",
      "category": "action",
      "importPath": "@neuron-ui/components/neuron/NButton",
      "schemaPath": "./schemas/button.schema.json",
      "variants": ["capsule", "circle", "custom"],
      "sizes": ["xs", "sm", "md", "lg", "xl"],
      "slots": ["icon"],
      "canBeChildOf": ["NDialog", "NCard", "NTextarea", "NEmpty", "NAspectRatio"],
      "canContain": []
    }
    // ... 其余组件 (共 53 个)
  ]
}
```

### composition-rules.json 结构

```jsonc
{
  "version": "1.0.0",
  "rules": [
    {
      "parent": "NDialog",
      "allowedChildren": ["NCard", "NText", "NButton", "NInput", "NScrollArea"],
      "constraints": { "maxButtons": 3, "buttonPlacement": "bottom-center" }
    },
    {
      "parent": "NCard",
      "allowedChildren": ["NAspectRatio", "NText", "NBadge", "NAvatar", "NButton", "NSeparator"],
      "constraints": { "maxBadges": 3, "mediaPosition": ["top", "left", "full"] }
    },
    {
      "parent": "NScrollArea",
      "allowedChildren": ["NCard", "NAspectRatio", "NText", "NAvatar", "NBadge"],
      "constraints": { "direction": ["horizontal", "vertical"], "itemGap": "var(--spacing-sm)" }
    }
  ],
  "globalConstraints": {
    "colorsMustBeTokens": true,
    "spacingMustBeTokens": true,
    "maxNestingDepth": 6,
    "rootContainers": ["NResizable", "NAspectRatio", "NDialog", "NSheet"]
  }
}
```

---

## 8 / Page Schema 与渲染器

### Page Schema 格式

AI 生成和拖拉拽编辑器共享同一格式：

```jsonc
{
  "version": "1.0.0",
  "page": {
    "id": "activity-001",
    "name": "燕缘·滴水湖站活动页",
    "width": 1440,
    "breakpoints": { "desktop": 1440, "tablet": 1288, "compact": 928 }
  },
  "tree": [
    {
      "id": "root",
      "component": "NResizable",
      "props": { "minWidth": 482 },
      "children": [
        {
          "id": "card-1",
          "component": "NCard",
          "props": { "variant": "cover-top", "width": "416px", "radius": "xl" },
          "children": [
            { "id": "img-1", "component": "NAspectRatio", "slot": "media", "props": { "src": "cover.jpg", "ratio": "16/9" } },
            { "id": "title", "component": "NText", "slot": "body", "props": { "content": "第一届协创大赛", "fontSize": "body" } },
            { "id": "badge-1", "component": "NBadge", "slot": "badges", "props": { "label": "进行中", "color": "lime-light" } }
          ]
        }
      ]
    }
  ]
}
```

**设计约束：**
- `props` 中的颜色/圆角/字号只能使用 Token key（`"blue"`, `"xl"`, `"body"`），不允许原始值
- 组件嵌套必须符合 `composition-rules.json`
- 每个节点有稳定 `id`，供编辑器选中/编辑

### 统一渲染架构 (基于 json-render)

编辑器 (`@neuron-ui/page-builder`) 和运行时渲染器 (`@neuron-ui/runtime`) **共用同一套 json-render 渲染机制**，避免维护两套渲染系统：

```
json-render 渲染管线 (编辑器 + 运行时共用)
    │
    ├── neuron-catalog.ts (Zod Schema)
    │     53 个 N-组件的 props 定义 (唯一定义源)
    │     9 个 Action 定义
    │     catalog.prompt() → AI 系统提示词
    │     catalog.validateElement() → props 校验
    │
    ├── neuron-registry.ts (React 实现)
    │     NButton → <NButton ... />
    │     NDataTable → useDataValue() + <NDataTable ... />
    │     ... 53 个组件全部映射
    │
    ├── schema-adapter.ts (格式转换)
    │     Page Schema (嵌套树) → UITree (扁平邻接表)
    │     binding 协议 → $path / ActionSchema
    │     Token key → CSS 变量值
    │
    └── <Renderer tree={uiTree} registry={registry} />
          json-render 递归渲染 React 组件树
```

**编辑器额外包装层：** `EditorRenderer` 在 json-render `Renderer` 之上添加选中高亮、拖拽手柄、层级面包屑等编辑交互，但底层渲染完全复用 json-render。

---

## 9 / 构建流程

### 包依赖顺序

```
tokens (0 依赖)
  → components (依赖 tokens)
    → metadata (依赖 components)
      → generator (依赖 metadata + runtime)
    → runtime (依赖 components + metadata)
    → codegen (依赖 components + metadata)
  → page-builder (依赖 components + metadata + runtime)
  → mcp-server (依赖 metadata + runtime + generator + codegen + tokens)
```

### 构建命令

```jsonc
// 根 package.json scripts
{
  "dev": "turbo dev",
  "dev:storybook": "pnpm --filter @neuron-ui/components storybook",
  "dev:builder": "pnpm --filter @neuron-ui/page-builder dev",
  "build": "turbo build",
  "generate:tokens": "pnpm --filter @neuron-ui/tokens generate",
  "generate:manifest": "pnpm --filter @neuron-ui/metadata generate",
  "lint": "turbo lint",
  "test": "turbo test"
}
```

### Token 生成流程

```
tokens.json (手动维护)
    │
    ├──→ css/globals.css       (CSS 变量 + @theme inline)
    ├──→ css/colors.css        (色彩变量)
    ├──→ css/spacing.css       (间距变量)
    ├──→ css/radius.css        (圆角变量)
    ├──→ css/typography.css    (@font-face + 字号变量)
    │
    ├──→ src/colors.ts         (TypeScript 常量)
    ├──→ src/spacing.ts
    ├──→ src/radius.ts
    ├──→ src/typography.ts
    └──→ src/index.ts          (barrel export)
```

修改一个 Token 值 → 编辑 `tokens.json` → 运行 `pnpm generate:tokens` → 所有格式自动同步。

### 发布策略

```
@neuron-ui/tokens       → npm publish (CSS + TS 常量)
@neuron-ui/components   → npm publish (React 组件 + 样式)
@neuron-ui/metadata     → npm publish (JSON 元数据 + 校验器)
@neuron-ui/generator    → npm publish (AI 生成引擎)
@neuron-ui/runtime      → npm publish (json-render 运行时渲染器)
@neuron-ui/codegen      → npm publish (代码生成 CLI)
@neuron-ui/mcp-server   → npm publish (MCP Server, npx @neuron-ui/mcp-server 启动)
@neuron-ui/page-builder → 部署为 Web App (不发 npm)
```

### 下游消费

```bash
pnpm add @neuron-ui/tokens @neuron-ui/components
```

```tsx
// 入口 CSS
@import "@neuron-ui/tokens/css/globals.css";

// 使用组件
import { NButton, NCard, NBadge } from "@neuron-ui/components";
```

---

## 10 / 完整示例: Button 在各层的流转

### Layer 0: Token

`tokens.json` 定义 → 生成 `--radius-xl: 20px` CSS 变量 → `@theme inline` 注册 `rounded-xl` Tailwind 类

### Layer 1: shadcn 原语

`ui/button.tsx` 使用 `bg-primary` (→ `var(--gray-01)` → `#5F5D57`)，Tier B 修改 `h-10` → `h-8`

### Layer 2: neuron 包装

`NButton.tsx` 包装 `ui/button.tsx`，添加:
- `variant="capsule"` → `rounded-xl` (20px)
- `size="md"` → `h-8` (32px)
- `color="blue"` → `bg-accent-blue` → `#BEF1FF`

### Metadata: AI Schema

`button.schema.json` 描述 Props: variant (enum), size (enum + sizeMap), color (tokenRef)

### Metadata: Manifest

`component-manifest.json` 中 NButton 条目: canBeChildOf, canContain, variants, slots

### Page Schema: AI 使用

```json
{ "id": "btn-1", "component": "NButton", "props": { "variant": "capsule", "size": "md", "color": "blue", "label": "提交" } }
```

### json-render 渲染

json-render `registry("NButton")` → NButton React 实现 → Token key 透传 (NButton 内部解析) → 最终渲染 32px 高的蓝色胶囊按钮

### 视觉结果

32px 高 · 20px 圆角 · `#BEF1FF` 蓝色背景 · `#5F5D57` 文字 · 未来圆字体 14px
