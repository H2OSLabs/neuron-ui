# Phase 5: 可视化编辑器 (@neuron-ui/page-builder)

> AI 生成页面 → 编辑器加载 → 可视化微调 → 导出/发布。"最后一公里" 的交互工具。

---

## 依赖

- Phase 2 核心组件完成 (至少 P0-P2 批次)
- Phase 3 完成 (Page Schema 定义 + 校验器 + builder-registry)
- Phase 4 完成 (可生成 Page Schema 供编辑器加载)

## 设计来源

- `docs/plan/04-goal-drag-drop-refinement.md` — 编辑器完整设计
- `docs/plan/05-architecture.md` § 3, 8 — 目录结构 + 渲染器架构

## 包目录结构

```
packages/page-builder/
├── index.html
├── vite.config.ts            # app 模式
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── stores/
│   │   ├── editor-store.ts   # Zustand + temporal: page tree + undo/redo
│   │   └── selection-store.ts
│   ├── renderer/
│   │   ├── PageRenderer.tsx
│   │   ├── ComponentResolver.tsx
│   │   ├── PropResolver.ts
│   │   └── SlotRenderer.tsx
│   ├── editor/
│   │   ├── Canvas.tsx
│   │   ├── ComponentPanel.tsx
│   │   ├── PropertyPanel.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── Toolbar.tsx
│   ├── property-editors/
│   │   ├── TokenSelect.tsx
│   │   ├── SizeInput.tsx
│   │   ├── TextInput.tsx
│   │   ├── VariantSelect.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── SlotEditor.tsx
│   │   └── ToggleEditor.tsx
│   └── templates/
│       └── built-in/
│           ├── activity-page.json
│           └── leaderboard.json
```

## Phase 5A: PageRenderer 渲染器

> 与 Phase 4 的生成预览共用同一渲染器。

### 5A.1 ComponentResolver

```
"NButton" → lazy(() => import('@neuron-ui/components').then(m => m.NButton))
```

维护 COMPONENT_MAP 注册表，懒加载全部 53 个组件。

### 5A.2 PropResolver

Token key → CSS 变量值:

```
"blue" → "var(--accent-blue)"
"xl"   → "var(--radius-xl)"
"body" → "var(--font-size-body)"
```

### 5A.3 SlotRenderer

将 children 按 `slot` 字段分组，注入父组件的对应 slot prop。

### 5A.4 RenderNode (递归)

```
1. ComponentResolver: 解析组件类型
2. PropResolver: 解析 props (Token key → CSS 变量)
3. SlotRenderer: 按 slot 分组 children
4. 渲染: <Component {...resolvedProps}>{slottedChildren}</Component>
5. 递归渲染所有 children
```

## Phase 5B: 编辑器核心

### 5B.1 编辑器布局

```
┌──────────┬───────────────────┬────────────────────┐
│ 组件面板  │     画布区域       │     属性编辑面板    │
│ (可折叠)  │                   │                    │
│          │  [渲染的页面]      │  选中组件属性       │
│ [组件列表]│                   │  [替换组件]         │
│          │                   │  [列配置]           │
│          │                   │  [数据绑定]         │
├──────────┴───────────────────┴────────────────────┤
│  [撤销] [重做] | [预览] [导出JSON] [发布]           │
└───────────────────────────────────────────────────┘
```

### 5B.2 左侧: 组件面板 (ComponentPanel)

- 从 builder-registry 加载组件分类
- 分类: 展示 / 输入 / 操作 / 容器 / 反馈 / 导航 / 布局
- 拖拽到画布添加组件
- 受 composition-rules 约束 (不允许的拖放目标灰显)

### 5B.3 中间: 画布 (Canvas)

- 使用 PageRenderer 渲染当前 Page Schema
- dnd-kit 支持拖拽排序
- 选中组件高亮边框
- 悬停预览组件信息
- 层级面包屑导航

### 5B.4 右侧: 属性面板 (PropertyPanel)

基于组件 Schema 自动生成编辑器:

| Props 类型 | 编辑器组件 |
|-----------|-----------|
| Token (颜色) | TokenSelect (下拉, 仅 Token 值) |
| Token (间距/圆角) | TokenSelect (下拉) |
| enum (变体) | VariantSelect |
| enum (尺寸) | SizeInput |
| string (文案) | TextInput |
| boolean | ToggleEditor |
| slot | SlotEditor |

**核心原则: 颜色/间距/圆角只能从 Token 下拉选择，不提供自由输入。**

### 5B.5 状态管理

```typescript
// Zustand + temporal middleware
interface EditorStore {
  pageSchema: PageSchema
  // 节点操作
  updateNode: (nodeId: string, updates: Partial<SchemaNode>) => void
  addNode: (parentId: string, node: SchemaNode, index?: number) => void
  removeNode: (nodeId: string) => void
  moveNode: (nodeId: string, newParentId: string, index: number) => void
  replaceNode: (nodeId: string, newNode: SchemaNode) => void
  // undo/redo (temporal middleware 提供)
  undo: () => void
  redo: () => void
}

interface SelectionStore {
  selectedNodeId: string | null
  hoveredNodeId: string | null
  select: (nodeId: string) => void
  deselect: () => void
}
```

### 5B.6 支持的调整操作

**布局调整:**
- 拖拽排序 (改变组件排列顺序)
- 调整大小 (拖拽手柄改变宽高)
- 显示/隐藏 (切换组件可见性)
- 增删组件 (从组件面板拖入 / 选中删除)

**属性调整:**
- 修改文案 (按钮/标题/占位符)
- 修改颜色 (Token 下拉)
- 修改变体 (Dialog → Sheet)
- 修改尺寸 (md → lg)

**数据绑定调整:**
- 修改列映射 (表格列绑定的字段)
- 修改排序 (默认排序字段)
- 修改过滤 (过滤条件)
- 修改表单字段 (增删编辑表单中的字段)

**组件替换:**
- 整体替换 (NDataTable → NCard 网格)
  - 查询 component-api-mapping 推荐同类组件
  - 自动映射字段到新组件 slot
  - 保留 dataSource 绑定
- 子组件替换 (表格列内 NBadge → NSwitch)
- 子组件组合 (NAvatar + NText 组合显示)

## Phase 5C: 预览 + 导出

### 5C.1 预览模式

| 预览模式 | 宽度 |
|---------|------|
| 桌面 | 1440px |
| 平板 | 1288px |
| 手机 | 928px |

### 5C.2 导出

- JSON 导出: 导出 Page Schema JSON 文件
- HTML 导出: 渲染为独立 HTML (嵌入组件和样式)
- 模板保存: 保存为可复用模板

### 5C.3 重新生成

当 API 变化时支持:
- 全量重新生成 (丢弃手动调整)
- 增量合并 (保留手动调整, 添加新字段/组件)
- 对比预览 (新旧差异, 逐项决定)

## 交付物

| 模块 | 文件 |
|------|------|
| 渲染器 | PageRenderer, ComponentResolver, PropResolver, SlotRenderer |
| 编辑器 | Canvas, ComponentPanel, PropertyPanel, Breadcrumb, Toolbar |
| 属性编辑器 | TokenSelect, SizeInput, TextInput, VariantSelect 等 |
| 状态管理 | editor-store.ts, selection-store.ts |
| 模板 | 2+ 内置模板 |

## 验收标准

| # | 标准 |
|---|------|
| 1 | Page Schema 可在编辑器中正确渲染 |
| 2 | 运营人员 5 分钟内可完成页面微调 |
| 3 | 所有属性调整只能使用 Token 值 |
| 4 | 支持撤销/重做至少 50 步 |
| 5 | 修改后的 Page Schema 保留原有数据绑定 |
| 6 | 组件替换后自动映射字段到新组件 |
| 7 | 拖拽排序流畅无卡顿 |
| 8 | 三种预览模式正常工作 |
