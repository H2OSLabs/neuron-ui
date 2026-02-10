# neuron-ui

> AI 驱动的前端页面自动生成组件库 — 从任意格式的 API 列表和 TaskCase 自动生成可调整的页面

## 项目目标

neuron-ui 是一个基于 shadcn/ui 二次开发的组件库，核心能力是 **用户提供任意格式的 API 列表和 TaskCase，AI 理解内容后自动生成前端页面**。

```
后端 API 列表 (任意格式) ──┐
                          ├──► AI 理解内容 ──► 拖拉拽编辑器 ──► 发布上线
产品 TaskCase (任意格式) ──┘   (参考组件映射规则)   (可视化调整)
```

### 四大目标

| # | 目标 | 说明 |
|---|------|------|
| 1 | **shadcn 二次开发** | 按暖灰色设计规范对 shadcn/ui 进行二次开发，产出 53 个组件 |
| 2 | **组件-接口类型映射** | 定义每个组件适用于哪种接口类型（GET/POST/PUT/DELETE），作为 AI 生成时的参考指南 |
| 3 | **AI 驱动页面生成** | 用户提供任意格式的 API 列表 + TaskCase → AI 理解内容 → 参考映射规则自动生成页面 |
| 4 | **拖拉拽细节调整** | 在 AI 生成的页面基础上，可视化编辑器进行人工微调 |

## 核心流程

```
1. 用户提供 API 列表 (任意格式: Swagger、Postman、文字描述均可)
2. 用户提供 TaskCase / 需求 (任意格式: PRD、用户故事、一句话描述均可)
3. AI 阅读并理解 API 列表 → 识别资源、操作、字段、类型
4. AI 阅读并理解 TaskCase → 识别页面意图、用户流程
5. AI 参考组件-接口映射规则自动选择组件:
   - GET  → DataTable, Card, Avatar, Badge (展示数据)
   - POST → Dialog + Input, Textarea, Combobox (创建数据)
   - PUT  → Sheet + 表单组件 (编辑数据)
   - DELETE → AlertDialog 确认弹窗 (删除确认)
6. AI 生成 Page Schema (组件树 + 数据绑定 + 默认属性)
7. 用户在拖拉拽编辑器中可视化微调
8. 发布上线
```

## 设计基础 (Design Tokens)

### 色彩体系

| 分类 | 色值 | 用途 |
|------|------|------|
| 灰阶 (Gray 01-14) | `#5F5D57` → `#FCFCFC` | 文字、边框、背景、禁用态等 14 级暖灰 |
| 辅助色 (Accent) | Pink / Yellow / Lime / Green / Blue / Purple / Lavender | 标签、状态指示 |
| 语义色 (Semantic) | Error `#E67853` / Warning `#E8A540` / Success `#6EC18E` | 操作反馈 |

### 字体 / 间距 / 圆角

- **字体**: Asul (英文标题) + Swei Gothic CJK SC (中文正文)
- **字号**: `48` / `36` / `28` / `24` / `18` / `14` / `12` px
- **间距**: `4` / `8` / `12` / `16` / `20` / `24` / `32` / `36` / `48` / `64` px
- **圆角**: `4`(标签) / `8`(输入框) / `12`(卡片) / `20`(按钮) / `50%`(头像) px

## 组件清单与接口映射 (精选)

> 完整 53 个组件的 API 映射见 [目标 2 文档](./docs/plan/02-goal-component-api-mapping.md)

| 角色 | 组件 | GET | POST | PUT | DELETE | 说明 |
|------|------|:---:|:----:|:---:|:------:|------|
| 展示 | **NDataTable** | ★ | — | — | — | 列表展示 + 分页 |
| 展示 | **NCard** | ★ | — | — | — | 数据卡片 |
| 展示 | **NChart** | ★ | — | — | — | 数据可视化 |
| 展示 | **NAvatar** | ★ | — | — | — | 用户信息 |
| 展示 | **NBadge** | ★ | — | — | — | 状态标签 |
| 输入 | **NInput** | — | ★ | ★ | — | 文本输入 |
| 输入 | **NTextarea** | — | ★ | ★ | — | 长文本输入 |
| 输入 | **NCombobox** | 辅 | ★ | ★ | — | 下拉选择 |
| 输入 | **NSelect** | 辅 | ★ | ★ | — | 简单下拉 |
| 输入 | **NDatePicker** | — | ★ | ★ | — | 日期选择 |
| 输入 | **NSwitch** | — | ★ | ★ | — | 布尔切换 |
| 容器 | **NDialog** | — | ★ | ★ | ★ | 表单弹窗 / 删除确认 |
| 容器 | **NAlertDialog** | — | — | — | ★ | 强制确认弹窗 |
| 容器 | **NSheet** | — | ★ | ★ | — | 侧边编辑面板 |
| 触发 | **NButton** | — | ★ | ★ | ★ | 操作触发 |
| 反馈 | **NToast** | — | ★ | ★ | ★ | 操作反馈 |
| 辅助 | **NEmpty** | ★ | — | — | — | 空数据状态 |
| 辅助 | **NSkeleton** | ★ | — | — | — | 加载占位 |

## 项目结构

```
neuron-ui/
├── docs/
│   ├── base/                           # 设计规范
│   │   ├── Agentour-base-desgin-ui.md
│   │   ├── synnovatour-bse-desgin-ui.csv
│   │   └── shared-design-tokens.md
│   └── plan/                           # 规划文档
│       ├── 00-overview.md              # 总体规划 (四大目标)
│       ├── 01-goal-shadcn-design-system.md
│       ├── 02-goal-component-api-mapping.md
│       ├── 03-goal-auto-page-generation.md
│       ├── 04-goal-drag-drop-refinement.md
│       └── 05-architecture.md          # 前端组件架构
├── packages/
│   ├── tokens/                         # @neuron-ui/tokens
│   ├── components/                     # @neuron-ui/components (shadcn 二次开发)
│   ├── metadata/                       # @neuron-ui/metadata (映射规则 + Schema)
│   ├── generator/                      # @neuron-ui/generator (自动生成引擎)
│   └── page-builder/                   # @neuron-ui/page-builder (拖拉拽编辑器)
├── README.md
└── CLAUDE.md
```

## 技术栈

| 层面 | 技术 |
|------|------|
| UI 基础 | shadcn/ui + Radix UI |
| 样式 | Tailwind CSS v4 |
| 框架 | React 18+ + TypeScript |
| 构建 | Vite + pnpm workspace + turborepo |
| 组件文档 | Storybook |
| 拖拽 | dnd-kit |
| 状态管理 | Zustand |
| 测试 | Vitest + Testing Library |
