# Phase 1: Design Tokens (@neuron-ui/tokens)

> 实现设计令牌系统：tokens.json → CSS 变量 + TypeScript 常量 + Tailwind v4 集成。

---

## 依赖

- Phase 0 完成 (monorepo 已初始化)

## 设计来源

- `docs/base/shared-design-tokens.md` — Token 完整定义
- `docs/plan/05-architecture.md` § 4 — Token 系统实现方案

## 任务清单

### 1.1 创建 tokens.json (单一来源)

手动编写 `packages/tokens/tokens.json`，包含:

| Token 分类 | 数量 | 内容 |
|-----------|------|------|
| colors.gray | 14 级 | #5F5D57 → #FCFCFC |
| colors.accent | 10 种 | pink, yellow, lime, green, blue, purple, lavender 等 |
| colors.semantic | 3 种 | error (#E67853), warning (#E8A540), success (#6EC18E) |
| spacing | 10 级 | 4px → 64px |
| radius | 5 级 | 4px (sm) → 9999px (full) |
| typography.fontFamily | 2 组 | Asul (heading) + Swei Gothic CJK SC (body) |
| typography.fontSize | 7 级 | 12px → 48px |

> 完整格式参见 `docs/plan/05-architecture.md` § 4.1

### 1.2 编写 Token 生成脚本

`packages/tokens/scripts/generate-tokens.ts`:

- 读取 `tokens.json`
- 输出 CSS 文件:
  - `css/globals.css` — 完整入口 (变量 + @theme inline + base styles + @font-face)
  - `css/colors.css` — 色彩变量
  - `css/spacing.css` — 间距变量
  - `css/radius.css` — 圆角变量
  - `css/typography.css` — 字体相关
  - `css/animations.css` — 过渡/动画
- 输出 TypeScript 文件:
  - `src/colors.ts` — `export const colors = { gray: { ... }, accent: { ... }, semantic: { ... } } as const`
  - `src/spacing.ts`
  - `src/radius.ts`
  - `src/typography.ts`
  - `src/index.ts` — barrel export

### 1.3 globals.css 关键内容

三个关键部分:

**Part 1: CSS 变量 (:root)**
- 14 级暖灰 `--gray-01` 至 `--gray-14`
- 10 种辅助色 `--accent-*`
- 3 种语义色 `--color-error/warning/success`
- shadcn 语义变量映射 `--primary → var(--gray-01)` 等
- 间距 `--spacing-xs` 至 `--spacing-4xl`
- 圆角 `--radius-sm` 至 `--radius-full`
- 字体 `--font-heading`, `--font-body`
- 字号 `--font-size-display` 至 `--font-size-caption`

**Part 2: @theme inline (Tailwind v4 注册)**
- 将 CSS 变量注册为 Tailwind 工具类
- 如 `bg-gray-01`, `text-accent-blue`, `rounded-xl` 等

**Part 3: Base styles**
- `@font-face` 声明
- `body` 默认样式
- `*` 边框默认色

> 完整 CSS 参见 `docs/plan/05-architecture.md` § 4.2

### 1.4 Package 配置

```jsonc
// packages/tokens/package.json
{
  "name": "@neuron-ui/tokens",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./css/globals.css": "./css/globals.css",
    "./css/*": "./css/*"
  },
  "scripts": {
    "generate": "tsx scripts/generate-tokens.ts",
    "build": "tsc"
  }
}
```

### 1.5 验证

- [ ] 生成的 CSS 变量在浏览器中可正常渲染
- [ ] TypeScript 常量可被其他包 import
- [ ] Tailwind 工具类可正常使用 (bg-gray-12, text-accent-blue, rounded-xl 等)

## 交付物

| 文件 | 说明 |
|------|------|
| tokens.json | 设计令牌单一来源 |
| scripts/generate-tokens.ts | 生成脚本 |
| css/globals.css | 完整 CSS 入口 |
| css/colors.css, spacing.css, radius.css, typography.css | 分文件 CSS |
| src/index.ts + 各分类 ts | TypeScript 常量 |

## 验收标准

| # | 标准 |
|---|------|
| 1 | `pnpm generate:tokens` 正常执行 |
| 2 | 生成的 CSS 文件含全部 Token 变量 |
| 3 | 生成的 TS 文件含全部 Token 常量 (as const) |
| 4 | Tailwind v4 @theme inline 注册正确 |
| 5 | shadcn 语义变量正确映射到暖灰色系 |
| 6 | 修改 tokens.json 后重新生成，所有文件同步更新 |
