# 目标 2: 拖拉拽页面搭建平台

## 核心问题

运营人员需要在不写代码的情况下，快速搭建出符合设计规范的页面。

| 问题 | 说明 |
|------|------|
| **运营不会写代码** | 需要纯可视化操作，零代码门槛 |
| **页面搭建效率低** | 当前依赖开发排期，一个活动页可能需要数天 |
| **设计一致性难保证** | 运营自行搭建时容易偏离设计规范 |
| **页面无法复用** | 每次活动都从零开始，没有模板沉淀 |

## 系统架构

```
┌──────────────────────────────────────────────────────┐
│                    页面搭建平台                        │
├──────────┬───────────────────┬───────────────────────┤
│ 组件面板  │     画布区域       │     属性编辑面板       │
│          │                   │                       │
│ [Button] │  ┌─────────────┐  │  组件: Card            │
│ [Card]   │  │   Header    │  │  ─────────────         │
│ [Input]  │  ├─────────────┤  │  宽度: [416px]         │
│ [Dialog] │  │   Content   │  │  圆角: [8px ▼]         │
│ [Table]  │  │   Area      │  │  背景: [○ Gray-12]     │
│ [...]    │  ├─────────────┤  │  图片: [上传]           │
│          │  │   Footer    │  │  标题: [输入文字]       │
│          │  └─────────────┘  │                       │
├──────────┴───────────────────┴───────────────────────┤
│              预览 / 导出 / 发布                         │
└──────────────────────────────────────────────────────┘
```

## 核心概念

### Page Schema（页面描述协议）

页面搭建平台和 AI 组装页面共享同一套 Page Schema。这是连接目标 1 和目标 2 的关键。

```jsonc
// 一个活动页的 Page Schema 示例
{
  "version": "1.0.0",
  "page": {
    "name": "燕缘·滴水湖站活动页",
    "width": 1440,
    "breakpoints": [1340, 1288, 928],
    "tokens": "default"
  },
  "tree": [
    {
      "component": "Resizable",
      "props": { "minWidth": 482 },
      "children": [
        {
          "component": "Card",
          "props": {
            "variant": "cover-top",
            "width": "416px",
            "height": "396px",
            "radius": "var(--radius-xl)"
          },
          "children": [
            {
              "component": "Image",
              "props": { "src": "cover.jpg", "height": "268px" }
            },
            {
              "component": "Text",
              "props": {
                "content": "第一届协创大赛",
                "fontSize": "var(--font-body)",
                "color": "var(--gray-01)"
              }
            },
            {
              "component": "Badge",
              "props": {
                "label": "进行中",
                "color": "var(--tag-lime-light)"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**关键设计决策：**

- Page Schema 中的所有样式值必须引用 Token（`var(--xxx)`），编辑器下拉选择而非自由输入
- 组件嵌套遵循 `composition-rules.json` 的约束，编辑器自动过滤不合法的子组件
- 同一份 Schema，AI 可以生成，运营可以拖拽编辑，开发可以手写

### 组件注册协议

每个组件向搭建平台注册时，需要提供：

```jsonc
{
  "name": "Card",
  "icon": "card-icon.svg",
  "category": "容器",                    // 组件面板分类
  "thumbnail": "card-thumb.png",         // 组件面板缩略图
  "schema": "./card.schema.json",        // Props 定义 → 生成属性编辑面板
  "defaultProps": {                      // 拖入画布时的默认值
    "variant": "cover-top",
    "width": "416px",
    "height": "268px",
    "radius": "var(--radius-lg)"
  },
  "editableProps": [                     // 属性面板展示哪些可编辑项
    { "prop": "width", "editor": "size-input" },
    { "prop": "height", "editor": "size-input" },
    { "prop": "radius", "editor": "token-select", "tokenGroup": "radius" },
    { "prop": "variant", "editor": "variant-select" }
  ],
  "resizable": true,                    // 画布上是否可以拖拽调大小
  "draggable": true                     // 是否可以拖拽移动
}
```

## 功能模块

### 模块 1: 组件面板

| 功能 | 说明 |
|------|------|
| 分类浏览 | 按类别展示：布局、容器、表单、展示、反馈 |
| 搜索 | 支持组件名搜索 |
| 缩略图预览 | 每个组件有预览图 |
| 拖拽到画布 | 从面板拖入画布，自动使用 defaultProps |

**组件分类：**

| 分类 | 组件 |
|------|------|
| 布局 | Resizable, AspectRatio, ScrollArea |
| 容器 | Card, Dialog, Sheet |
| 表单 | Input, InputGroup, Combobox, Checkbox, RadioGroup, Switch, Textarea |
| 操作 | Button, Toggle, ToggleGroup, Dropdown Menu |
| 展示 | Avatar, Badge, Calendar, Carousel, DataTable, Empty, Toast |

### 模块 2: 画布区域

| 功能 | 说明 |
|------|------|
| 可视化渲染 | 实时渲染 Page Schema 为真实组件 |
| 拖拽排序 | 拖动组件调整顺序 |
| 调整大小 | 拖拽手柄调整组件宽高 |
| 选中高亮 | 点击组件显示选中框和操作按钮 |
| 层级指示 | 面包屑显示当前选中组件的层级路径 |
| 响应式预览 | 切换不同断点宽度预览效果 |
| 撤销/重做 | Ctrl+Z / Ctrl+Y |

### 模块 3: 属性编辑面板

| 编辑器类型 | 说明 | 用于 |
|-----------|------|------|
| token-select | 下拉选择设计 Token | 颜色、间距、圆角、字号 |
| size-input | 数值+单位输入 | 宽度、高度 |
| text-input | 文本输入 | 标题、正文、标签文字 |
| variant-select | 变体选择 | 组件形态切换 |
| image-upload | 图片上传 | 封面、头像 |
| slot-editor | 插槽内容管理 | 管理子组件 |
| toggle | 开关 | 布尔属性 |

**核心设计原则：属性面板中不提供任何自由颜色选择器。** 所有颜色只能从 Token 下拉列表中选择，从源头保证设计一致性。

### 模块 4: 模板系统

| 功能 | 说明 |
|------|------|
| 保存为模板 | 将当前页面保存为可复用模板 |
| 模板市场 | 运营可以浏览和使用已有模板 |
| 模板分类 | 活动页、列表页、详情页、表单页 |
| 一键套用 | 选择模板后只需替换内容 |

### 模块 5: 预览与发布

| 功能 | 说明 |
|------|------|
| 实时预览 | 在新窗口中预览真实页面效果 |
| 多端预览 | 桌面 / 平板 / 手机 三种宽度 |
| 导出 JSON | 导出 Page Schema 供开发使用 |
| 导出 HTML | 导出静态 HTML 页面 |
| 发布上线 | 一键发布到 CDN / 页面服务 |

## 技术选型建议

| 层面 | 推荐方案 | 理由 |
|------|---------|------|
| 框架 | React + TypeScript | 组件库本身基于 React |
| 画布引擎 | 自研（React DnD / dnd-kit） | 灵活度高，适配自有组件 |
| 状态管理 | Zustand | 轻量，适合编辑器场景的 undo/redo |
| 属性面板 | 基于 Schema 自动生成 | 复用组件 Schema，减少重复开发 |
| 持久化 | Page Schema JSON + 后端 API | 标准格式，易于迁移 |

## 验收标准

| # | 标准 | 验证方法 |
|---|------|---------|
| 1 | 运营人员 10 分钟内能搭建一个活动页 | 用户测试 |
| 2 | 搭建的页面 100% 符合设计规范 | 因为只能选 Token 值，自动合规 |
| 3 | 页面在 1440/1340/1288/928px 断点下表现正常 | 响应式预览验证 |
| 4 | AI 生成的 Page Schema 可以直接在编辑器中打开和编辑 | 端到端测试 |
| 5 | 支持撤销/重做至少 50 步 | 功能测试 |

## 任务拆解

| 优先级 | 任务 | 依赖 |
|--------|------|------|
| P0 | 定义 Page Schema 格式 | 组件 Schema (目标 1) |
| P0 | 实现画布渲染引擎（Schema → React 组件） | 组件实现 (目标 3) |
| P0 | 实现拖拽排序 | 画布渲染引擎 |
| P1 | 实现组件面板 | 组件 Manifest (目标 1) |
| P1 | 实现属性编辑面板（基于 Schema 自动生成） | 组件 Schema (目标 1) |
| P1 | 实现选中/高亮/层级导航 | 画布渲染引擎 |
| P1 | 实现撤销/重做 | 状态管理 |
| P2 | 实现响应式预览 | 画布渲染引擎 |
| P2 | 实现模板保存和加载 | Page Schema + 后端 |
| P2 | 实现导出 JSON / HTML | 画布渲染引擎 |
| P3 | 实现发布流程 | 导出 + 后端 |
| P3 | 实现模板市场 | 模板系统 + 后端 |
