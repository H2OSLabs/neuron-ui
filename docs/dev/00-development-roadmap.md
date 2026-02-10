# neuron-ui 开发计划总览

> 基于 `docs/plan/` 规划文档整理的可执行开发计划。按阶段拆分，每个阶段有明确的交付物、验收标准和依赖关系。

---

## 项目现状

- 规划文档: 完成 (6 份规划 + 2 份设计基础)
- 源代码: 未初始化 (无 package.json、无 packages/ 目录)
- 当前进度: **Phase 0 — 待启动**

## 开发阶段总览

```
Phase 0: 工程脚手架 (Monorepo 初始化)                 ← 无依赖，立即启动
    │
Phase 1: Design Tokens 包 (@neuron-ui/tokens)        ← 依赖 Phase 0
    │
Phase 2: 组件库 (@neuron-ui/components)               ← 依赖 Phase 1
    │   ├── 2A: shadcn 原语 (Layer 1)
    │   └── 2B: neuron 组件 (Layer 2) — 分 P0→P4 批次
    │
Phase 3: AI 元数据 (@neuron-ui/metadata)              ← 依赖 Phase 2
    │   ├── 3A: 组件清单 + Schema
    │   ├── 3B: 组件-接口映射规则
    │   └── 3C: 组合规则 + Page Schema 定义
    │
Phase 4: AI 生成引擎 (@neuron-ui/generator)           ← 依赖 Phase 3
    │   ├── 4A: Prompt + Few-shot
    │   ├── 4B: generatePage() 核心 API
    │   └── 4C: 校验器 + 自动修复
    │
Phase 5: 可视化编辑器 (@neuron-ui/page-builder)       ← 依赖 Phase 2 + 3
    │   ├── 5A: PageRenderer 渲染器
    │   ├── 5B: 拖拽画布 + 属性面板
    │   └── 5C: 预览 + 导出
    │
Phase 6: 集成测试 + 端到端验证                         ← 依赖 Phase 0-5
    │
Phase 7: 页面消费层                                    ← 依赖 Phase 2 + 3 + 5A
    │   ├── 7A: Runtime 渲染器 (@neuron-ui/runtime)
    │   └── 7B: 代码生成 CLI (@neuron-ui/codegen)
    │
Phase 8: 全链路验收                                    ← 依赖全部
```

## 关键里程碑

| 里程碑 | 阶段 | 交付物 | 验证方式 |
|--------|------|--------|---------|
| M0 - 工程可运行 | Phase 0 | `pnpm install && pnpm build` 通过 | CI 绿色 |
| M1 - Token 可消费 | Phase 1 | CSS 变量 + TS 常量可 import | Storybook 基础页渲染 |
| M2 - P0 组件完成 | Phase 2 (P0) | NButton/NBadge/NAvatar/NInput/NText 可用 | Storybook + 单测 |
| M3 - 核心组件完成 | Phase 2 (P0-P2) | 32 个核心组件完成 | Storybook 全覆盖 |
| M4 - 映射规则就绪 | Phase 3 | 三个 JSON 文件 + 校验器 | 校验器单测通过 |
| M5 - AI 可生成页面 | Phase 4 | CRUD 页面可自动生成 | 生成结果通过校验 |
| M6 - 编辑器可用 | Phase 5 | 生成页面可在编辑器中渲染和编辑 | 端到端演示 |
| M7 - 全链路打通 | Phase 6 | API → AI 生成 → 编辑器调整 → 导出 | 端到端测试 |
| M8 - Runtime 可用 | Phase 7A | `<NeuronPage>` 可渲染 Page Schema | CRUD 页面动态渲染 |
| M9 - CodeGen 可用 | Phase 7B | CLI 可生成 .tsx 源码 | 生成代码可编译运行 |

## 各阶段详情

- [Phase 0: 工程脚手架](./01-phase0-scaffold.md)
- [Phase 1: Design Tokens](./02-phase1-tokens.md)
- [Phase 2: 组件库](./03-phase2-components.md)
- [Phase 3: AI 元数据](./04-phase3-metadata.md)
- [Phase 4: AI 生成引擎](./05-phase4-generator.md)
- [Phase 5: 可视化编辑器](./06-phase5-page-builder.md)
- [Phase 6: 集成测试](./07-phase6-integration.md)
- [Phase 7: 页面消费层](./08-phase7-consumption.md)

## 并行策略

```
Phase 0 ─────►
Phase 1 ──────────►
Phase 2A ──────────────►
Phase 2B (P0-P2) ───────────────────────────────►
Phase 3A-3B ───────────────────────────────►         (可与 Phase 2B 并行，先用已有组件)
Phase 4A ───────────────────────────────────────►    (Prompt 设计可提前)
Phase 4B-4C ──────────────────────────────────────────►
Phase 5A ──────────────────────────────────────────────►  (依赖 Phase 2 核心组件)
Phase 5B-5C ────────────────────────────────────────────────────►
Phase 6 ──────────────────────────────────────────────────────────────►
Phase 7A ──────────────────────────────────────────────────────────►   (依赖 Phase 2 + 5A 渲染器)
Phase 7B ─────────────────────────────────────────────────────────────────►  (依赖 Phase 3 metadata)
Phase 8 ────────────────────────────────────────────────────────────────────►
```
