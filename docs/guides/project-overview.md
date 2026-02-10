# neuron-ui 项目总体规划

> AI 驱动的前端页面自动生成组件库 — 从任意格式的 API 列表和 TaskCase 自动生成可调整的页面

---

## 一、项目愿景

neuron-ui 解决的核心问题：**前端页面开发中大量重复劳动**。后端出接口、产品出需求、前端手动翻译成页面——信息传递有损失，相同 API 模式的 UI 实现因人而异。

neuron-ui 的解法：

```
后端 API 列表 (任意格式) ──┐
                          ├──► AI 理解内容 ──► 拖拉拽编辑器 ──► 发布上线
产品 TaskCase (任意格式) ──┘   (参考组件映射规则)   (可视化调整)
```

关键特性：
- **输入零门槛**: API 列表和需求描述不要求固定格式 (Swagger、Postman、文字描述、一句话均可)
- **AI 驱动而非确定性解析**: 能理解语义和业务上下文，不是简单的模式匹配
- **设计合规**: 全链路强制使用 Design Token，保证一致的暖灰色系视觉风格
- **人机协作**: AI 负责 90% 的页面搭建，运营人员在可视化编辑器中完成最后 10% 的微调

---

## 二、四大目标

```
目标 1                    目标 2                     目标 3                    目标 4
shadcn 二次开发    ──►    组件-接口类型映射    ──►    API+TaskCase           ──►  拖拉拽细节调整
(地基)                    (桥梁)                    自动生成页面                  (最后一公里)
                                                    (核心引擎)
```

| # | 目标 | 核心产出 | 说明 |
|---|------|---------|------|
| 1 | **shadcn 二次开发** | 53 个组件库 | 按暖灰色设计规范对 shadcn/ui 二次开发 |
| 2 | **组件-接口类型映射** | 映射规则 JSON | 定义每个组件适用于哪种接口类型 (GET/POST/PUT/DELETE)，作为 AI 参考指南 |
| 3 | **AI 驱动页面生成** | AI 生成引擎 | 任意格式 API + TaskCase → AI 理解内容 → 参考映射规则 → 自动生成 Page Schema |
| 4 | **拖拉拽细节调整** | 可视化编辑器 | 在 AI 生成的页面上进行布局、属性、数据绑定、样式微调 |

**依赖链:**

```
目标 1 (组件库)           无依赖 — 地基
   ▼
目标 2 (组件-接口映射)    依赖目标 1 — 需要知道有哪些组件
   ▼
目标 3 (自动生成引擎)     依赖目标 1 + 2 — 需要组件 + 映射规则
   ▼
目标 4 (拖拉拽调整)       依赖目标 1 + 3 — 需要组件渲染 + 生成的页面
```

> 详细规划: [目标 1](../plan/01-goal-shadcn-design-system.md) · [目标 2](../plan/02-goal-component-api-mapping.md) · [目标 3](../plan/03-goal-auto-page-generation.md) · [目标 4](../plan/04-goal-drag-drop-refinement.md)

---

## 三、系统架构

### 3.1 四层组件架构

```
Layer 3: Page Builder (@neuron-ui/page-builder)  — 拖拉拽编辑器
Layer 3: Generator (@neuron-ui/generator)        — AI 页面生成引擎
         ↓ 消费
Layer 2: neuron 组件 (NButton, NCard...)          — N 前缀包装层, 自定义变体 + 插槽
         ↓ 包装
Layer 1: shadcn/ui 原语 (button, card...)         — Radix UI 无障碍 + CVA 变体
         ↓ 样式来自
Layer 0: Design Tokens (@neuron-ui/tokens)        — tokens.json 单一来源

侧面支撑: @neuron-ui/metadata                    — AI 的知识库 (清单 + 映射 + 约束)
```

### 3.2 七个包与构建顺序

```
@neuron-ui/tokens          → Layer 0: Design Token (CSS + TS + JSON)
@neuron-ui/components      → Layer 1-2: shadcn 原语 (src/ui/) + neuron 包装 (src/neuron/)
@neuron-ui/metadata        → Side: 组件清单 + 映射规则 + 组合约束 + Schema
@neuron-ui/generator       → Layer 3: AI 生成引擎
@neuron-ui/page-builder    → Layer 3: 拖拉拽编辑器 (Web App, 不发 npm)
@neuron-ui/runtime         → Consumer: 运行时渲染器 (目标项目动态渲染 Page Schema)
@neuron-ui/codegen         → Consumer: 代码生成 CLI (Page Schema → .tsx 源码)
@neuron-ui/mcp-server      → Integration: MCP 服务 (AI 能力标准化接口)
```

**构建顺序:**

```
tokens → components → metadata → generator / page-builder
                   ↘            ↗
                    runtime (依赖 components)
                    codegen (依赖 components + metadata)
                    mcp-server (依赖 metadata + runtime + generator + codegen + tokens)
```

### 3.3 技术栈

| 层面 | 技术 | 选择理由 |
|------|------|---------|
| 包管理 | pnpm workspace + turborepo | 7 个包独立版本，并行构建 |
| 构建 | Vite (library mode) | 快速，ES modules，shadcn 原生方案 |
| 框架 | React 18+ + TypeScript | 生态成熟，类型安全 |
| 样式 | Tailwind CSS v4 | `@theme inline` 直接注册 CSS 变量为工具类 |
| UI 原语 | shadcn/ui (Radix UI) | 无障碍开箱即用，组件代码完全可控 |
| 基色 | stone | 最接近暖灰色系，CSS 变量覆盖量最小 |
| 状态管理 | Zustand + zundo (temporal) middleware | 轻量，天然支持 undo/redo |
| 拖拽 | dnd-kit | React 拖拽库 |
| Runtime 渲染 | Vercel json-render | Catalog + Registry + Renderer，Zod 校验 |
| Schema 校验 | Zod | json-render Catalog 组件 props 类型安全 |
| 测试 | Vitest + Testing Library | 与 Vite 生态一致 |
| 组件文档 | Storybook | 可视化浏览所有组件变体 |

> 详细架构: [05-architecture.md](../plan/05-architecture.md) · [架构图汇总](../plan/06-architecture-diagrams.md)

---

## 四、Design Token 系统

所有组件样式的唯一来源：`tokens.json`，生成 CSS 变量 + TypeScript 常量 + Tailwind 工具类。

### 4.1 色彩体系

| 分类 | 数量 | 说明 |
|------|------|------|
| 灰阶 | 14 级 | `#5F5D57` (主文字) → `#FCFCFC` (表面)，暖灰色调 |
| 辅助色 | 10 种 | Pink / Yellow / Lime / Green / Blue / Purple / Lavender 等 |
| 语义色 | 3 种 | Error `#E67853` / Warning `#E8A540` / Success `#6EC18E` |

### 4.2 字体 / 字号 / 间距 / 圆角

| Token | 值 |
|-------|------|
| 字体 | Asul (英文标题) + Swei Gothic CJK SC (中文正文) |
| 字号 | 48 / 36 / 28 / 24 / 18 / **14** / **12** px (14px=正文, 12px=说明) |
| 间距 | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 36 / 48 / 64 px |
| 圆角 | 4 (标签) / 8 (输入框) / 12 (卡片) / 20 (按钮) / 50% (头像) px |

### 4.3 关键约束

- **Page Schema 中只允许 Token key** (如 `"color": "blue"`)，禁止原始色值 (如 `"color": "#BEF1FF"`)
- **编辑器属性面板只提供 Token 下拉选择**，不提供自由输入
- shadcn 语义变量映射到暖灰色系: `--primary → var(--gray-01)`, `--border → var(--gray-09)` 等

> 详细 Token 定义: [shared-design-tokens.md](../base/shared-design-tokens.md)

---

## 五、53 个组件

### 5.1 组件命名与结构

- 所有 neuron 组件使用 **N 前缀** (NButton, NCard, NDialog) 区分 shadcn 原语
- 标准目录结构:

```
NButton/
├── NButton.tsx           # 实现: 包装 ui/button
├── NButton.types.ts      # Props 接口 (AI 元数据从此提取)
├── NButton.test.tsx      # Vitest 单测
├── NButton.stories.tsx   # Storybook story (覆盖所有变体)
└── index.ts              # export
```

- 每个组件标注 `data-neuron-component` 属性供编辑器识别

### 5.2 shadcn 三层定制模型

```
Tier A (~80%): CSS 变量重映射 → 零接触，shadcn 升级不受影响
Tier B (~15%): Tailwind class 微调 → 记录在 SHADCN_OVERRIDES.md
Tier C (~5%):  neuron 包装层 → 完全隔离，添加自定义变体/插槽
```

### 5.3 按 API 角色分类

| 角色 | 数量 | 代表组件 |
|------|------|---------|
| 数据展示 (GET) | 15 | NDataTable, NCard, NChart, NAvatar, NBadge, NText, NAccordion |
| 数据输入 (POST/PUT) | 13 | NInput, NTextarea, NCombobox, NSelect, NSwitch, NDatePicker |
| 操作触发 | 3 | NButton, NDropdownMenu, NContextMenu |
| 容器 | 7 | NDialog, NAlertDialog, NSheet, NDrawer, NTabs |
| 反馈 | 3 | NToast, NAlert, NSpinner |
| 导航 | 5 | NBreadcrumb, NSidebar, NMenubar, NNavigationMenu, NCommand |
| 布局/辅助 | 7 | NSeparator, NResizable, NToggle, NTooltip, NPopover, NKbd |

> 完整组件清单及规格: [01-goal-shadcn-design-system.md](../plan/01-goal-shadcn-design-system.md)

---

## 六、组件-接口映射规则

映射规则是 AI 从 API 自动选择组件的**参考指南**。

### 6.1 字段类型 → 组件决策树

```
字段出现在 Response (GET)?
├── array<object>     → NDataTable / NAccordion
├── string:enum       → NBadge
├── string:image      → NAvatar / NCard media
├── number:percentage → NProgress
├── array<number>     → NChart
├── 空数据            → NEmpty
└── 其他              → NText

字段出现在 Request (POST/PUT)?
├── string:enum (≤5)  → NSelect / NRadioGroup
├── string:enum (>5)  → NCombobox
├── string:long       → NTextarea
├── boolean           → NSwitch
├── date              → NDatePicker
├── number:range      → NSlider
└── 其他 string/number→ NInput
    每个字段用 NField 包装 (NLabel + 输入组件 + 错误提示)
```

### 6.2 API 模式 → 页面模式

| API 模式 | 页面模式 | 主组件 | 辅助组件 |
|---------|---------|-------|---------|
| GET /list | 列表页 | NDataTable | NInputGroup + NPagination + NEmpty + NSkeleton |
| GET /:id | 详情页 | NCard | NTabs + NBadge + NAvatar + NBreadcrumb |
| GET /stats | 仪表盘 | NCard[] | NChart[] + NProgress |
| POST / | 创建表单 | NDialog | NField[] + NButton |
| PUT /:id | 编辑表单 | NSheet | NField[] + NButton (预填数据) |
| DELETE /:id | 删除确认 | NAlertDialog | NText + NButton |

### 6.3 复合模式

当同一资源有完整 CRUD 时，自动组合为完整页面:

```
CRUD 模式:
├── toolbar:      NButton(新建) + NInputGroup(搜索)
├── main:         NDataTable(列表) + NPagination
├── createModal:  NDialog + NField[] (POST 字段)
├── editPanel:    NSheet + NField[] (PUT 字段, 预填值)
├── deleteConfirm:NAlertDialog (确认弹窗)
├── rowActions:   NDropdownMenu (编辑/删除)
├── feedback:     NToast (操作结果)
├── loading:      NSkeleton (加载中)
└── empty:        NEmpty (无数据)
```

> 完整映射表: [02-goal-component-api-mapping.md](../plan/02-goal-component-api-mapping.md)

---

## 七、AI 驱动的页面生成

### 7.1 输入 — 任意格式

| 输入 | 支持的格式 |
|------|-----------|
| API 列表 | Swagger/OpenAPI、Postman Collection、cURL 集合、文字描述、表格 |
| TaskCase | 结构化 JSON、PRD 文档、用户故事、流程图、一句话描述 |

### 7.2 AI 的参考资料 (系统内置)

| 文件 | 作用 |
|------|------|
| component-api-mapping.json | 字段→组件映射 + API 模式→页面模板 |
| component-manifest.json | 53 个组件清单 (Props, 插槽, 嵌套约束) |
| composition-rules.json | 组件嵌套规则 |
| Design Tokens | 确保使用 Token key 而非硬编码色值 |

### 7.3 生成流程

```
1. 加载上下文 → 映射规则 + 组件清单 + 嵌套约束 + Token 列表
2. 构建 Prompt → System (规则+约束) + Few-shot (示例) + User (API+TaskCase)
3. 调用 AI API → 发送 Prompt → 获取 Page Schema JSON
4. 校验输出   → 格式 + 嵌套合规 + 绑定完整 + Token 合规
5. 校验失败?  → 自动修复 (常见问题) + 重试 (最多 2 次, 带错误反馈)
6. 返回 Page Schema → 交给编辑器加载
```

### 7.4 核心 API

```typescript
const pageSchema = await generatePage({
  apiList: "... (任意格式 API 信息)",
  taskCase: "... (任意格式需求描述)",
  preferences: {
    pageType: 'crud',        // crud | dashboard | detail | auto
    formContainer: 'dialog', // dialog | sheet | drawer | auto
  }
})
```

> 详细设计: [03-goal-auto-page-generation.md](../plan/03-goal-auto-page-generation.md)

---

## 八、Page Schema 格式

Page Schema 是 AI 生成引擎的**输出**，也是拖拉拽编辑器的**输入**。

### 8.1 结构

```jsonc
{
  "version": "1.0.0",
  "page": { "id": "...", "name": "..." },
  "dataSources": {
    "key": { "api": "GET /api/...", "params": {} }
  },
  "tree": [
    {
      "id": "root",
      "component": "NResizable",
      "props": { "minWidth": 928 },
      "binding": { "dataSource": "competitionList" },
      "children": [...]
    }
  ]
}
```

### 8.2 数据绑定协议

| 绑定 Key | 作用 | 示例 |
|---------|------|------|
| `dataSource` | 组件从哪个 API 获取数据 | `"competitionList"` |
| `field` | 表单输入绑定到 request body 的字段 | `"name"` |
| `onChange` | 输入变化时更新的参数 | `{ "target": "list.params.keyword" }` |
| `onClick` | 点击触发的动作 | `{ "action": "openDialog", "target": "..." }` |
| `onSubmit` | 表单提交调用的 API | `{ "api": "POST /api/competitions" }` |
| `onConfirm` | 确认操作调用的 API | `{ "api": "DELETE /api/competitions/{id}" }` |
| `prefill` | 编辑时预填数据的 API | `{ "api": "GET /api/competitions/{id}" }` |

### 8.3 设计约束

- `props` 中的颜色/圆角/字号只能使用 Token key (`"blue"`, `"xl"`, `"body"`)
- 组件嵌套必须符合 `composition-rules.json`
- 每个节点有稳定 `id`，供编辑器选中/编辑

---

## 九、拖拉拽编辑器

编辑器定位：**"最后一公里"的细节调整工具**，而非从零搭建。

### 9.1 编辑器布局

```
┌──────────┬───────────────────┬────────────────────┐
│ 组件面板  │     画布区域       │     属性编辑面板    │
│ (分类展示)│  (Page Schema     │  (选中组件属性)     │
│          │   渲染结果)        │                    │
│          │                   │  [替换组件]         │
│          │                   │  [列配置]           │
│          │                   │  [数据绑定]         │
├──────────┴───────────────────┴────────────────────┤
│  [撤销] [重做] | [预览 桌面/平板/紧凑] [导出] [发布] │
└───────────────────────────────────────────────────┘
```

### 9.2 支持的调整类型

| 类型 | 操作 | 示例 |
|------|------|------|
| 布局 | 拖拽排序、调整大小、显示/隐藏、增删组件 | 把"标签"列移到"状态"列前面 |
| 属性 | 修改文案、颜色(Token下拉)、变体、尺寸 | "创建赛事" → "发起新赛事" |
| 数据绑定 | 修改列映射、排序、过滤、表单字段 | 添加一列展示"参赛人数" |
| 样式 | 间距(Token下拉)、圆角(Token下拉)、对齐 | 间距从 16px 改为 24px |
| 组件替换 | 整体替换、子组件替换、子组件组合 | NDataTable → NCard 网格，保留数据绑定 |

### 9.3 组件替换机制

当用户点击"替换组件"时:
1. 查询 `component-api-mapping.json` 获取同 API 角色的组件
2. 展示可替换组件列表
3. 替换后自动映射字段到新组件的 slot
4. 保留原有 `dataSource` 绑定

### 9.4 状态管理

- **Zustand + zundo (temporal) middleware**: 原生 undo/redo，至少 50 步
- `editor-store.ts`: 页面树 (updateNode, addNode, removeNode, moveNode, replaceNode)
- `selection-store.ts`: 选中/悬停状态

> 详细设计: [04-goal-drag-drop-refinement.md](../plan/04-goal-drag-drop-refinement.md)

---

## 十、Page Schema 消费

AI 生成 Page Schema → 编辑器调整 → **交付给目标项目**。提供两种消费模式:

### 10.1 模式 A: Runtime 渲染器 (基于 json-render)

基于 Vercel **json-render** 框架 (`@json-render/core` + `@json-render/react`)。53 个 N-组件注册为 json-render Catalog (Zod 类型校验)，运行时动态渲染 Page Schema:

```tsx
import { NeuronPage, createDataProvider } from '@neuron-ui/runtime'
import schema from './schemas/competition-list.json'

<NeuronPage schema={schema} dataProvider={dataProvider} />
```

**内部架构:** Page Schema (嵌套树) → SchemaAdapter → json-render UITree (扁平) → Renderer + DataProvider + ActionProvider

**关键能力:** Zod props 校验、`catalog.prompt()` 自动生成 AI 提示词、SpecStream 流式渲染、内置 Action 确认弹窗

**适用:** CMS/运营后台、多租户 SaaS、活动页 — 修改 JSON 即时生效，无需重新部署。

### 10.2 模式 B: 代码生成 (@neuron-ui/codegen)

CLI 工具将 Page Schema 编译为真实 `.tsx` 源码:

```bash
npx neuron-codegen generate ./schemas/competition-list.json --outdir src/pages/competitions
```

生成完整的页面组件、数据 hooks、类型定义和子组件文件。

**适用:** 核心业务页面、复杂表单、开发者脚手架 — 可任意定制，IDE 完整支持。

### 10.3 两者共存

一个项目可以同时使用两种模式:
- 核心页面用 Code Gen (深度定制)
- 运营页面用 Runtime (热更新)

> 详细设计: [page-consumption.md](./page-consumption.md)

---

## 十一、MCP Server — AI 能力标准化接口

neuron-ui 的 AI 能力 (组件查询、页面生成、Schema 校验、代码生成) 通过 **MCP Server** (`@neuron-ui/mcp-server`) 封装为标准 [Model Context Protocol](https://modelcontextprotocol.io) 服务。

### 11.1 定位

```
neuron-ui 内部各包 (metadata/generator/runtime/codegen/tokens)
       ↓ 统一封装
@neuron-ui/mcp-server
       ↓ MCP 标准协议
任何 MCP 客户端 (Claude Code / Cursor / Windsurf / 自建 Agent)
```

**核心价值:** 一次封装，所有 AI 客户端通用; 服务端实时读取最新数据，无需手动同步参考文件。

### 11.2 暴露的能力

| 类型 | 名称 | 说明 |
|------|------|------|
| **Tool** | `neuron_list_components` | 列出 53 个组件 (支持分类/角色过滤) |
| **Tool** | `neuron_get_component` | 获取组件完整详情 (Props/变体/嵌套) |
| **Tool** | `neuron_get_mapping_rules` | 字段→组件映射 + API→页面映射 |
| **Tool** | `neuron_get_tokens` | Design Token 值 |
| **Tool** | `neuron_analyze_api` | 分析任意格式 API 文档 |
| **Tool** | `neuron_generate_page` | 生成 Page Schema |
| **Tool** | `neuron_validate_schema` | 校验 Page Schema |
| **Tool** | `neuron_suggest_components` | 为字段推荐组件 |
| **Tool** | `neuron_generate_code` | Page Schema → .tsx 源码 |
| **Resource** | `neuron://metadata/*` | 组件清单/映射/规则 JSON |
| **Resource** | `neuron://tokens/*` | Token 数据 |
| **Resource** | `neuron://examples/*` | 示例 Page Schema |
| **Prompt** | `neuron-page-generation` | 页面生成完整 Prompt 模板 |

### 11.3 使用方式

```jsonc
// .claude/mcp.json 或 .cursor/mcp.json
{
  "mcpServers": {
    "neuron-ui": {
      "command": "npx",
      "args": ["@neuron-ui/mcp-server"]
    }
  }
}
```

> 详细设计: [Phase 8: MCP Server](../dev/09-phase8-mcp-server.md)

---

## 十二、端到端流程

以"赛事管理 CRUD"为例:

```
Step 1: 用户粘贴 API 列表
        "赛事管理有列表、创建、编辑、删除接口，字段有名称、状态、奖金、日期..."

Step 2: 用户输入 TaskCase
        "帮我生成一个赛事管理的 CRUD 页面"

Step 3: AI 理解 + 参考映射规则
        识别 CRUD 复合模式 → 选择 NDataTable + NDialog + NSheet + NAlertDialog
        字段映射: name→NText, status→NBadge, prize→NText, start_date→NText

Step 4: AI 输出 Page Schema
        含表格、搜索、筛选、新建弹窗、编辑面板、删除确认、操作菜单

Step 5: 编辑器加载
        Page Schema 渲染到画布，运营人员可视化调整

Step 6: 微调
        修改列顺序、换按钮颜色、调间距、替换 NDataTable 为 NCard 网格...

Step 7: 交付到目标项目
        Runtime 模式: JSON → NeuronPage 动态渲染
        CodeGen 模式: Page Schema → .tsx 源码 → 开发者接管
```

---

## 十三、文档导航

| 分类 | 文档 | 说明 |
|------|------|------|
| **本文** | `docs/guides/project-overview.md` | 项目总体规划 (当前文档) |
| **消费指南** | `docs/guides/page-consumption.md` | Page Schema 消费方案 (Runtime + CodeGen) |
| **规划** | `docs/plan/00-overview.md` | 四大目标概述 |
| | `docs/plan/01-goal-shadcn-design-system.md` | 目标 1: 53 组件设计规格 |
| | `docs/plan/02-goal-component-api-mapping.md` | 目标 2: 字段→组件映射表 |
| | `docs/plan/03-goal-auto-page-generation.md` | 目标 3: AI 生成引擎设计 |
| | `docs/plan/04-goal-drag-drop-refinement.md` | 目标 4: 编辑器设计 |
| | `docs/plan/05-architecture.md` | 完整技术架构 |
| | `docs/plan/06-architecture-diagrams.md` | 架构图汇总 (13 张) |
| **设计** | `docs/base/shared-design-tokens.md` | 色彩/字号/间距/圆角完整定义 |
| **开发** | `docs/dev/00-development-roadmap.md` | 开发计划总览 (6 阶段 + 7 里程碑) |
| | `docs/dev/01-phase0-scaffold.md` | Phase 0: 工程脚手架 |
| | `docs/dev/02-phase1-tokens.md` | Phase 1: Token 包 |
| | `docs/dev/03-phase2-components.md` | Phase 2: 组件库 |
| | `docs/dev/04-phase3-metadata.md` | Phase 3: AI 元数据 |
| | `docs/dev/05-phase4-generator.md` | Phase 4: 生成引擎 |
| | `docs/dev/06-phase5-page-builder.md` | Phase 5: 编辑器 |
| | `docs/dev/07-phase6-integration.md` | Phase 6: 集成测试 |
| | `docs/dev/08-phase7-consumption.md` | Phase 7: 页面消费层 (Runtime + CodeGen) |
| | `docs/dev/09-phase8-mcp-server.md` | Phase 8: MCP Server (AI 能力标准化接口) |
