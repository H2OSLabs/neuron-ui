# 目标 1: shadcn 二次开发

> 按设计规范对 shadcn/ui 进行二次开发，形成 neuron-ui 组件库

---

## 目标分析

### 做什么

将 shadcn/ui 作为底层原语，在其之上按照我们的暖灰色设计规范进行二次开发，产出一套 25+ 组件库。这些组件是后续目标 2（组件-接口映射）、目标 3（自动生成页面）、目标 4（拖拉拽编辑器）的基础。

### 为什么选 shadcn

| 优势 | 说明 |
|------|------|
| 代码完全可控 | 组件复制到项目中，不是 npm 依赖，可以自由修改 |
| Radix UI 底层 | 无障碍、键盘导航、ARIA 开箱即用 |
| Tailwind CSS | 与 Token 系统天然契合，`@theme inline` 注册变量即可 |
| 覆盖率高 | 25+ 组件中 ~80% 有 shadcn 对应，减少从零开发工作量 |
| 社区生态 | AI 工具对 shadcn 理解良好，便于后续自动化 |

### 关键约束

- 所有样式必须通过 Design Token（CSS 变量），禁止硬编码色值
- shadcn 原语层尽量少改，通过 CSS 变量映射 + neuron 包装层实现定制
- 每个组件必须有 TypeScript 类型定义（目标 2 需要从类型中提取 Props 元数据）
- 每个组件需要标注 `data-neuron-component` 属性（目标 3 生成引擎和目标 4 编辑器需要识别组件）

## 定制策略

### 三层定制模型

```
Tier A: CSS 变量重映射 (~80%)
    --primary → var(--gray-01)
    --border → var(--gray-09)
    所有 shadcn 组件自动获得暖灰色系

Tier B: shadcn 原语 class 微调 (~15%)
    h-10 → h-8 (按钮高度 32px)
    rounded-md → rounded-xl (按钮圆角 20px)
    记录在 SHADCN_OVERRIDES.md

Tier C: neuron 包装层 (~5%)
    NButton 包装 ui/button
    添加 capsule/circle 变体
    添加 icon slot, color prop 等
```

## 组件清单

> 参考 shadcn/ui 完整组件列表 (https://ui.shadcn.com/docs/components)，共 59 个组件。
> 下表按优先级分类，标注了 neuron 封装名、shadcn 对应、API 角色和额外开发工作。

### shadcn 完整组件对照表

#### P0 — 核心基础组件 (必须首批完成)

| neuron 组件 | shadcn 对应 | API 角色 | 额外工作 |
|------------|------------|---------|---------|
| NButton | button | POST/PUT/DELETE 触发 | 胶囊/圆形/异形变体, 5 级尺寸 |
| NBadge | badge | GET 状态展示 | 16/24px 两种高度 |
| NAvatar | avatar | GET 用户展示 | 圆形/圆角方形, 在线状态 |
| NInput | input | POST/PUT 输入 | 无效态, tag 创建 |
| NLabel | label | 表单辅助 | 与 NInput 配合 |
| NText | typography | GET 文本展示 | 7 级字号, 4 级字重 |
| NSeparator | separator | 布局 | 暖灰色分割线 |
| NSpinner | spinner | 加载状态 | 与 Token 色彩一致 |

#### P1 — 容器与导航组件

| neuron 组件 | shadcn 对应 | API 角色 | 额外工作 |
|------------|------------|---------|---------|
| NCard | card | GET 数据展示 | 5 种变体 (cover-left/top/full/profile/notification) |
| NDialog | dialog | POST/PUT 表单容器, DELETE 确认 | 九宫定位 |
| NAlertDialog | alert-dialog | DELETE 确认 | 强制确认，不可点外关闭 |
| NSheet | sheet | PUT 编辑面板 | 侧边推入 w:396px |
| NDrawer | drawer | POST/PUT 移动端表单 | 底部抽屉，移动端适配 |
| NAspectRatio | aspect-ratio | 布局 | 可展开收起 |
| NScrollArea | scroll-area | GET 列表滚动 | 水平/纵向 |
| NTabs | tabs | 视图切换 | 暖灰色 tab 样式 |
| NBreadcrumb | breadcrumb | 导航 | 页面层级导航 |
| NSidebar | sidebar | 导航布局 | 响应式收起/展开 |
| NCollapsible | collapsible | 布局 | 展开/收起内容区 |

#### P2 — 表单组件

| neuron 组件 | shadcn 对应 | API 角色 | 额外工作 |
|------------|------------|---------|---------|
| NInputGroup | input-group | POST/PUT 组合输入 | 搜索/tag/下拉组合 |
| NCombobox | combobox | POST/PUT 选择 | 单选/多选, 搜索, 分组 |
| NSelect | select | POST/PUT 选择 | 简单下拉选择 (比 Combobox 轻) |
| NCheckbox | checkbox | POST/PUT 多选 | 多选组合 |
| NRadioGroup | radio-group | POST/PUT 单选 | 禁用/警告态 |
| NSwitch | switch | POST/PUT 布尔 | 18x40px |
| NTextarea | textarea | POST/PUT 长文本 | 856x180px |
| NDatePicker | date-picker | POST/PUT 日期 | 日期/日期范围选择 |
| NSlider | slider | POST/PUT 数值范围 | 暖灰色滑轨 |
| NInputOTP | input-otp | POST 验证码 | 6 位验证码输入 |
| NField | field | 表单辅助 | Label + Input + Error 包装 |

#### P3 — 展示组件

| neuron 组件 | shadcn 对应 | API 角色 | 额外工作 |
|------------|------------|---------|---------|
| NDataTable | data-table + table | GET 列表展示 | 排序/过滤/分页/多变体 |
| NCalendar | calendar | GET 日历展示 | 日期标签 |
| NCarousel | carousel | GET 轮播展示 | 方向可调 |
| NDropdownMenu | dropdown-menu | 操作菜单 | icon+文本 |
| NContextMenu | context-menu | 操作菜单 | 右键菜单 |
| NEmpty | empty | GET 空数据 | 空状态 |
| NAccordion | accordion | GET 分组展示 | FAQ, 可折叠内容 |
| NAlert | alert | 反馈 | 状态提示条 (info/warning/error/success) |
| NProgress | progress | 反馈 | 上传/操作进度条 |
| NSkeleton | skeleton | 加载状态 | 数据加载占位 |
| NHoverCard | hover-card | GET 预览 | 悬停预览卡片 |
| NPagination | pagination | GET 分页 | 列表分页导航 |
| NChart | chart | GET 数据可视化 | 图表组件 (基于 Recharts) |

#### P4 — 辅助/功能组件

| neuron 组件 | shadcn 对应 | API 角色 | 额外工作 |
|------------|------------|---------|---------|
| NToast | toast/sonner | 操作反馈 | 可点击文字 |
| NToggle | toggle | 视图切换 | 颜色/大小变化 |
| NToggleGroup | toggle-group | 视图切换 | 横/纵排列 |
| NResizable | resizable | 布局 | 4 断点响应式 |
| NTooltip | tooltip | 辅助信息 | 悬停提示 |
| NPopover | popover | 辅助信息 | 弹出内容面板 |
| NCommand | command | 搜索/命令 | 命令面板 (Ctrl+K 搜索) |
| NMenubar | menubar | 导航 | 水平菜单栏 |
| NNavigationMenu | navigation-menu | 导航 | 站点顶部导航 |
| NKbd | kbd | 辅助信息 | 快捷键显示 |

#### 不封装 — 直接使用 shadcn 原语

以下组件功能过于基础或特殊，不需要 neuron 包装层，直接使用 shadcn 原语即可：

| shadcn 组件 | 理由 |
|------------|------|
| button-group | 可由多个 NButton 组合实现 |
| direction | RTL/LTR 支持，通过 CSS 全局配置 |
| item | 内部辅助组件，不独立使用 |
| native-select | 仅在无障碍降级场景使用 |

### 组件统计

| 分类 | 数量 |
|------|------|
| P0 核心基础 | 8 |
| P1 容器导航 | 11 |
| P2 表单 | 11 |
| P3 展示 | 13 |
| P4 辅助功能 | 10 |
| 不封装 | 4 |
| **neuron 组件总计** | **53** |

### 每个组件的标准产出

```
NButton/
├── NButton.tsx           # 组件实现
├── NButton.types.ts      # TypeScript Props 类型 (★ 目标 2 从此提取元数据)
├── NButton.test.tsx      # 单元测试
├── NButton.stories.tsx   # Storybook 文档
└── index.ts              # 导出
```

## 对后续目标的支撑

| 本目标产出 | 目标 2 如何消费 | 目标 3 如何消费 | 目标 4 如何消费 |
|-----------|---------------|---------------|---------------|
| 组件 TypeScript 类型 | 提取 Props → 建立组件-接口映射 | 数据绑定时的类型约束 | 属性面板自动生成 |
| `data-neuron-*` 属性 | — | 识别组件类型 | 画布上选中/编辑 |
| Design Tokens | — | — | 属性面板颜色/间距选择 |
| 组件渲染实现 | — | 预览生成结果 | 画布实时渲染 |

## 验收标准

| # | 标准 |
|---|------|
| 1 | 25+ 组件全部按设计规范开发完成 |
| 2 | 所有 CSS 中零硬编码色值 |
| 3 | 每个组件有完整 TypeScript Props 类型 |
| 4 | 每个组件有 Storybook story |
| 5 | 单元测试覆盖率 ≥ 80% |
