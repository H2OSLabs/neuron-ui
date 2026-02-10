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
├── runtime/          → @neuron-ui/runtime         ★ 新增: 运行时渲染器
└── codegen/          → @neuron-ui/codegen          ★ 新增: 代码生成 CLI
```

### 0.3 包依赖配置

```
@neuron-ui/tokens        → 无依赖
@neuron-ui/components    → 依赖 @neuron-ui/tokens
@neuron-ui/metadata      → 依赖 @neuron-ui/components (类型引用)
@neuron-ui/generator     → 依赖 @neuron-ui/metadata
@neuron-ui/page-builder  → 依赖 @neuron-ui/components, @neuron-ui/metadata
@neuron-ui/runtime       → 依赖 @neuron-ui/components (渲染器 + 组件)
@neuron-ui/codegen       → 依赖 @neuron-ui/components (类型引用), @neuron-ui/metadata (schema 定义)
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

### 0.6 工具链安装

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

## 交付物

| 文件 | 状态 |
|------|------|
| pnpm-workspace.yaml | 创建 |
| turbo.json | 创建 |
| tsconfig.base.json | 创建 |
| packages/*/package.json | 7 个包 |
| packages/*/tsconfig.json | 7 个包 |

## 验收标准

| # | 标准 |
|---|------|
| 1 | `pnpm install` 无报错 |
| 2 | `pnpm build` 全部通过 (空包) |
| 3 | `pnpm lint` 无报错 |
| 4 | `pnpm test` 无报错 (空测试) |
| 5 | 各包之间 workspace 依赖正确解析 |
