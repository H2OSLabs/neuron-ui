# Phase 0: 工程脚手架

> 初始化 monorepo 工程结构，确保 `pnpm install && pnpm build` 可运行。

---

## 依赖

无 — 最先启动。

## 任务清单

### 0.1 根目录初始化

- [ ] 初始化 `package.json` (workspace root, private: true)
- [ ] 创建 `pnpm-workspace.yaml` 定义 packages/*
- [ ] 创建 `turbo.json` 配置构建编排
- [ ] 创建 `tsconfig.base.json` 共享 TypeScript 配置
- [ ] 创建 `.eslintrc.cjs` 通用 lint 规则
- [ ] 创建 `.prettierrc` 格式化配置
- [ ] 创建 `.gitignore` (node_modules, dist, .turbo)
- [ ] 配置 `components.json` (shadcn CLI)

### 0.2 创建七个包骨架

每个包需要:
- `package.json` (name, version, dependencies, scripts)
- `tsconfig.json` (extends base)
- 空的 `src/index.ts`

```
packages/
├── tokens/           → @neuron-ui/tokens
├── components/       → @neuron-ui/components
├── metadata/         → @neuron-ui/metadata
├── generator/        → @neuron-ui/generator
├── page-builder/     → @neuron-ui/page-builder
├── runtime/          → @neuron-ui/runtime         ★ 运行时渲染器
├── codegen/          → @neuron-ui/codegen          ★ 代码生成 CLI
└── mcp-server/       → @neuron-ui/mcp-server       ★ MCP Server (AI 能力接口)
```

### 0.3 包依赖配置

```
@neuron-ui/tokens        → 无依赖
@neuron-ui/components    → 依赖 @neuron-ui/tokens
@neuron-ui/metadata      → 依赖 @neuron-ui/components (类型引用)
@neuron-ui/generator     → 依赖 @neuron-ui/metadata
@neuron-ui/page-builder  → 依赖 @neuron-ui/components, @neuron-ui/metadata
@neuron-ui/runtime       → 依赖 @neuron-ui/components (组件实现), @neuron-ui/metadata (PageSchema 类型)
@neuron-ui/codegen       → 依赖 @neuron-ui/components (类型引用), @neuron-ui/metadata (schema 定义)
@neuron-ui/mcp-server    → 依赖 @neuron-ui/metadata, @neuron-ui/runtime, @neuron-ui/generator, @neuron-ui/codegen, @neuron-ui/tokens
```

### 0.4 根 scripts 配置

```jsonc
{
  "scripts": {
    "dev": "turbo dev",
    "dev:storybook": "pnpm --filter @neuron-ui/components storybook",
    "dev:builder": "pnpm --filter @neuron-ui/page-builder dev",
    "build": "turbo build",
    "generate:tokens": "pnpm --filter @neuron-ui/tokens generate",
    "generate:manifest": "pnpm --filter @neuron-ui/metadata generate",
    "lint": "turbo lint",
    "test": "turbo test"
  }
}
```

### 0.5 turbo.json 构建编排

```jsonc
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {}
  }
}
```

### 0.6 组件代码模板生成脚本 (Scaffolding)

> **提效关键:** Phase 2 需要交付 53 个组件，每个组件 5 个文件 (共 265+ 文件)。手写样板代码效率极低，应在 Phase 0 就准备好组件生成脚本。

- [ ] 创建 `scripts/create-component.ts` 组件脚手架脚本

**脚本功能:**

```bash
# 用法示例
pnpm create-component NButton --category action --shadcn button
pnpm create-component NText --category display --no-shadcn
```

**自动生成的文件结构:**

```
packages/components/src/neuron/{NComponent}/
├── {NComponent}.tsx           # 实现骨架 (含 data-neuron-component 属性)
├── {NComponent}.types.ts      # Props 接口 (含 Token 类型引用)
├── {NComponent}.test.tsx      # Vitest 单测模板
├── {NComponent}.stories.tsx   # Storybook stories 模板
└── index.ts                   # barrel export
```

**脚本还应自动:**

- 将新组件追加到 `src/index.ts` barrel 导出
- 如指定 `--shadcn`，验证对应 shadcn 原语已安装
- 如指定 `--category`，在 stories 中标注正确分类
- Props 接口预填 Token 类型引用 (ColorToken, SizeToken 等)

**根 scripts 配置补充:**

```jsonc
{
  "scripts": {
    "create-component": "tsx scripts/create-component.ts"
  }
}
```

### 0.7 工具链安装

**根依赖 (devDependencies):**
- `turbo`
- `typescript`
- `eslint` + 相关插件
- `prettier`

**packages/components:**
- `react`, `react-dom` (peerDependencies)
- `vite`, `@vitejs/plugin-react`
- `tailwindcss` v4
- `clsx`, `tailwind-merge`
- `class-variance-authority`
- `vitest`, `@testing-library/react`
- `storybook` + `@storybook/react-vite`
- `@radix-ui/*` (按需)

**packages/page-builder:**
- `vite` (app 模式)
- `zustand`
- `@dnd-kit/core`, `@dnd-kit/sortable`

**packages/runtime:**
- `vite` (library 模式)
- `react`, `react-dom` (peerDependencies)
- `@json-render/core`, `@json-render/react` (json-render 渲染引擎)
- `zod` (Catalog 组件 props 校验)

**packages/codegen:**
- `commander` (CLI 参数解析)
- `handlebars` (模板引擎)
- `prettier` (代码格式化)
- `ts-morph` (AST 操作, merge 策略)
- `chalk`, `ora` (CLI 输出)

**packages/mcp-server:**
- `@modelcontextprotocol/sdk` (MCP 协议 TypeScript SDK)
- `tsup` (构建工具)
- `zod` (参数校验)

## 交付物

| 文件 | 状态 |
|------|------|
| pnpm-workspace.yaml | 创建 |
| turbo.json | 创建 |
| tsconfig.base.json | 创建 |
| packages/*/package.json | 8 个包 |
| packages/*/tsconfig.json | 8 个包 |
| scripts/create-component.ts | 创建 (组件脚手架脚本) |

## 验收标准

| # | 标准 |
|---|------|
| 1 | `pnpm install` 无报错 |
| 2 | `pnpm build` 全部通过 (空包) |
| 3 | `pnpm lint` 无报错 |
| 4 | `pnpm test` 无报错 (空测试) |
| 5 | 各包之间 workspace 依赖正确解析 |
| 6 | `pnpm create-component NExample --category display` 可正确生成 5 个文件 |
