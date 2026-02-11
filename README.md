# neuron-ui

> AI 驱动的前端页面自动生成组件库 — 从任意格式的 API 列表和 TaskCase 自动生成可调整的页面

## 项目简介

neuron-ui 是一个基于 shadcn/ui 二次开发的组件库，核心能力是 **用户提供任意格式的 API 列表和 TaskCase，AI 理解内容后自动生成前端页面**，并支持拖拉拽可视化微调。

```
后端 API 列表 (任意格式) ──┐
                          ├──► AI 理解内容 ──► 拖拉拽编辑器 ──► 发布上线
产品 TaskCase (任意格式) ──┘   (参考组件映射规则)   (可视化调整)
```

### 四大目标

| # | 目标 | 说明 |
|---|------|------|
| 1 | **shadcn 二次开发** | 按暖灰色设计规范对 shadcn/ui 进行二次开发，产出 53 个 N-前缀组件 |
| 2 | **组件-接口类型映射** | 定义每个组件适用于哪种接口类型（GET/POST/PUT/DELETE），作为 AI 生成时的参考指南 |
| 3 | **AI 驱动页面生成** | 用户提供任意格式的 API 列表 + TaskCase → AI 理解内容 → 参考映射规则自动生成页面 |
| 4 | **拖拉拽细节调整** | 在 AI 生成的页面基础上，可视化编辑器进行人工微调 |

## 环境要求

- **Node.js** >= 20.0.0
- **pnpm** >= 9.15.0

## 快速开始

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd neuron-ui

# 安装所有依赖
pnpm install
```

### 开发

```bash
# 启动所有 dev 服务
pnpm dev

# 启动 Storybook 组件文档 (http://localhost:6006)
pnpm dev:storybook

# 启动可视化页面编辑器
pnpm dev:builder
```

### 构建 & 测试

```bash
# 构建所有包
pnpm build

# 运行所有测试 (244 test cases)
pnpm test

# 代码检查
pnpm lint
```

### 生成 & 脚手架

```bash
# 生成 Design Tokens (tokens.json → CSS + TypeScript)
pnpm generate:tokens

# 生成组件元数据清单
pnpm generate:manifest

# 创建新的 Neuron 组件脚手架
pnpm create-component
```

### 单包操作

```bash
# 运行指定包的测试
pnpm --filter @neuron-ui/components test

# 运行指定包的构建
pnpm --filter @neuron-ui/runtime build

# 代码生成 CLI
pnpm --filter @neuron-ui/codegen build
npx neuron-codegen <page-schema.json> -o ./output

# 启动 MCP Server
pnpm --filter @neuron-ui/mcp-server start
```

## 项目架构

### Monorepo 结构 (8 个包)

```
neuron-ui/
├── packages/
│   ├── tokens/         @neuron-ui/tokens        Layer 0: Design Tokens (CSS + TS + JSON)
│   ├── components/     @neuron-ui/components     Layer 1-2: shadcn 基础组件 + 53 个 N-组件
│   ├── metadata/       @neuron-ui/metadata       AI 元数据 (组件清单 + 映射规则 + Schema)
│   ├── generator/      @neuron-ui/generator      AI 页面生成引擎
│   ├── page-builder/   @neuron-ui/page-builder   拖拉拽可视化编辑器 (Web App)
│   ├── runtime/        @neuron-ui/runtime        运行时渲染器 (Catalog + Registry + Adapter)
│   ├── codegen/        @neuron-ui/codegen        CLI 代码生成器 (Page Schema → .tsx)
│   └── mcp-server/     @neuron-ui/mcp-server     MCP Server (Tools + Resources + Prompts)
├── scripts/                                      工具脚本 (组件脚手架等)
├── docs/                                         设计文档 & 开发计划
├── CLAUDE.md                                     Claude Code 指引
└── README.md
```

## 技术栈

| 层面 | 技术 |
|------|------|
| UI 基础 | shadcn/ui + Radix UI |
| 样式 | Tailwind CSS v4 (`@theme inline`) |
| 框架 | React 18+ / TypeScript 5.9 |
| 构建 | Vite 6 + pnpm workspace + Turborepo |
| 组件文档 | Storybook 8 |
| 拖拽 | dnd-kit |
| 状态管理 | Zustand + zundo (undo/redo) |
| Schema 校验 | Zod |
| 测试 | Vitest + Testing Library |
| AI 集成 | MCP Server (`@modelcontextprotocol/sdk`) |
| CI/CD | GitHub Actions (Node 20 + pnpm 9) |

## 组件-接口映射 (精选)

> 完整 53 个组件的 API 映射见 [目标 2 文档](./docs/plan/02-goal-component-api-mapping.md)



## 核心流程

```
1. 用户提供 API 列表 (Swagger、Postman、文字描述等任意格式)
2. 用户提供 TaskCase / 需求 (PRD、用户故事、一句话描述等任意格式)
3. AI 阅读并理解 API 列表 → 识别资源、操作、字段、类型
4. AI 阅读并理解 TaskCase → 识别页面意图、用户流程
5. AI 参考组件-接口映射规则自动选择组件:
   - GET    → DataTable, Card, Avatar, Badge (展示数据)
   - POST   → Dialog + Input, Textarea, Combobox (创建数据)
   - PUT    → Sheet + 表单组件 (编辑数据)
   - DELETE → AlertDialog 确认弹窗 (删除确认)
6. AI 生成 Page Schema (组件树 + 数据绑定 + 默认属性)
7. 用户在拖拉拽编辑器中可视化微调
8. 通过 Runtime 渲染或 CodeGen 生成代码发布上线
```

## 文档索引

| 文档 | 说明 |
|------|------|
| [总体规划](./docs/plan/00-overview.md) | 四大目标与依赖关系 |
| [组件设计规范](./docs/plan/01-goal-shadcn-design-system.md) | 53 个组件的设计详情 |
| [接口映射规则](./docs/plan/02-goal-component-api-mapping.md) | 字段类型 → 组件选择完整映射表 |
| [AI 生成引擎](./docs/plan/03-goal-auto-page-generation.md) | 自动生成引擎设计 |
| [拖拉拽编辑器](./docs/plan/04-goal-drag-drop-refinement.md) | 可视化编辑器规范 |
| [技术架构](./docs/plan/05-architecture.md) | 完整技术架构 |
| [页面消费模式](./docs/guides/page-consumption.md) | Runtime + CodeGen 消费设计 |
| [MCP Server](./docs/dev/09-phase8-mcp-server.md) | MCP Tools / Resources / Prompts 设计 |
| [开发进度](./docs/dev/PROGRESS.md) | 各阶段开发进度追踪 |

## 代码规范

- **ESLint** — TypeScript ESLint (flat config)
- **Prettier** — 无分号、单引号、尾逗号
- **组件命名** — Neuron 组件统一 `N` 前缀 (NButton, NCard, NDialog...)
- **组件结构** — `NComponent/NComponent.tsx` + `.types.ts` + `.test.tsx` + `.stories.tsx` + `index.ts`
- **CI** — GitHub Actions: build + test (Node 20 + pnpm 9)
