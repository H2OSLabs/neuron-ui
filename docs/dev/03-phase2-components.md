# Phase 2: 组件库 (@neuron-ui/components)

> shadcn 原语 (Layer 1) + neuron 包装组件 (Layer 2)，分批次交付 53 个组件。

---

## 依赖

- Phase 1 完成 (tokens 包可用)

## 设计来源

- `docs/plan/01-goal-shadcn-design-system.md` — 53 组件完整清单与规格
- `docs/plan/05-architecture.md` § 5, 6 — 定制策略与开发模式

## Phase 2A: shadcn 原语层 (Layer 1)

### 任务

1. 配置 `components.json` (shadcn CLI, base color: stone)
2. 通过 `npx shadcn@latest add` 安装所有需要的原语到 `src/ui/`
3. 创建 `src/lib/utils.ts` (cn = clsx + tailwind-merge)
4. 确保 `@neuron-ui/tokens/css/globals.css` 被正确引入
5. 应用 Tier A 定制: CSS 变量已映射暖灰色系 (Phase 1 完成)
6. 应用 Tier B 定制: 在 ui/*.tsx 中做最小 class 调整
7. 创建 `SHADCN_OVERRIDES.md` 记录所有 Tier B 修改

**需安装的 shadcn 原语:**

```
button, badge, avatar, input, label, separator, card, dialog, alert-dialog,
sheet, drawer, aspect-ratio, scroll-area, tabs, breadcrumb, sidebar,
collapsible, combobox, select, checkbox, radio-group, switch, textarea,
calendar, carousel, dropdown-menu, context-menu, accordion, alert,
progress, skeleton, hover-card, pagination, chart, toast/sonner,
toggle, toggle-group, resizable, tooltip, popover, command, menubar,
navigation-menu, input-otp, slider, table, data-table
```

### Tier B 修改示例 (记录于 SHADCN_OVERRIDES.md)

| 文件 | 修改 | 原因 |
|------|------|------|
| ui/button.tsx | `h-10` → `h-8` | 按钮默认高度 32px |
| ui/button.tsx | `rounded-md` → `rounded-xl` | 按钮圆角 20px |

## Phase 2B: neuron 组件层 (Layer 2)

### 组件标准结构

每个组件严格遵循:

```
NComponent/
├── NComponent.tsx           # 实现: 包装 ui/component
├── NComponent.types.ts      # Props 接口 (目标 2 需要从此提取元数据)
├── NComponent.test.tsx      # Vitest 单测
├── NComponent.stories.tsx   # Storybook stories (覆盖所有变体)
└── index.ts                 # export
```

**必须遵守:**
- 所有颜色通过 Token，禁止硬编码色值
- 标注 `data-neuron-component="NButton"` 属性
- 标注 `data-neuron-variant`, `data-neuron-size` 属性
- 导出 Props TypeScript 类型

### 批次 1: P0 核心基础 (8 个)

最先开发，其他所有组件的基础。

| 组件 | shadcn 对应 | 关键规格 |
|------|------------|---------|
| **NButton** | button | 胶囊/圆形/异形变体, 5 级尺寸 (h: 20/24/32/36/48px), icon slot, color prop |
| **NBadge** | badge | 16/24px 两种高度, 4px 圆角 |
| **NAvatar** | avatar | 圆形/圆角方形, 描边/在线状态指示器 |
| **NInput** | input | h: 32px, 无效态样式, tag 创建模式 |
| **NLabel** | label | 与 NInput 配合使用 |
| **NText** | 无 (自建) | 7 级字号, 4 级字重, 多行支持 |
| **NSeparator** | separator | 暖灰分割线 |
| **NSpinner** | spinner | Token 色彩一致的加载指示器 |

### 批次 2: P1 容器与导航 (11 个)

| 组件 | 关键规格 |
|------|---------|
| **NCard** | 5 种变体 (cover-left/top/full/profile/notification), slot 系统 |
| **NDialog** | 九宫定位, 内边距 20px |
| **NAlertDialog** | 强制确认, 不可点外关闭 |
| **NSheet** | 侧边推入, w: 396px |
| **NDrawer** | 底部抽屉, 移动端适配 |
| **NAspectRatio** | 可展开收起 |
| **NScrollArea** | 水平/纵向, 行间距 8px |
| **NTabs** | 暖灰 tab 样式 |
| **NBreadcrumb** | 页面层级导航 |
| **NSidebar** | 响应式收起/展开 |
| **NCollapsible** | 展开/收起内容区 |

### 批次 3: P2 表单组件 (11 个)

| 组件 | 关键规格 |
|------|---------|
| **NInputGroup** | h: 36px, 搜索/tag/下拉组合 |
| **NCombobox** | 单选/多选, 搜索, 分组 |
| **NSelect** | 简单下拉 (比 Combobox 轻量) |
| **NCheckbox** | 内边距 8px, 行间距 8px |
| **NRadioGroup** | 禁用/警告态 |
| **NSwitch** | h: 18px, w: 40px |
| **NTextarea** | 856x180px, 内间距 16px |
| **NDatePicker** | 日期/日期范围选择 |
| **NSlider** | 暖灰色滑轨 |
| **NInputOTP** | 6 位验证码输入 |
| **NField** | Label + Input + Error 包装 |

### 批次 4: P3 展示组件 (13 个)

| 组件 | 关键规格 |
|------|---------|
| **NDataTable** | 排序/过滤/分页/多变体 |
| **NCalendar** | w: 328px, h: 324px |
| **NCarousel** | 方向可调 |
| **NDropdownMenu** | 内边距 16/8px, icon+文本 |
| **NContextMenu** | 右键菜单 |
| **NEmpty** | 居中, 行动按钮 136x32px |
| **NAccordion** | FAQ, 可折叠内容 |
| **NAlert** | 4 种状态 (info/warning/error/success) |
| **NProgress** | 上传/操作进度条 |
| **NSkeleton** | 数据加载占位 |
| **NHoverCard** | 悬停预览卡片 |
| **NPagination** | 列表分页导航 |
| **NChart** | 基于 Recharts 的图表 |

### 批次 5: P4 辅助/功能组件 (10 个)

| 组件 | 关键规格 |
|------|---------|
| **NToast** | 可点击文字 |
| **NToggle** | 颜色/大小变化 |
| **NToggleGroup** | 横/纵排列, icon 18x18px |
| **NResizable** | 4 断点响应式 (1440/1340/1288/928px) |
| **NTooltip** | 悬停提示 |
| **NPopover** | 弹出内容面板 |
| **NCommand** | Ctrl+K 搜索命令面板 |
| **NMenubar** | 水平菜单栏 |
| **NNavigationMenu** | 站点顶部导航 |
| **NKbd** | 快捷键显示 |

## Storybook 配置

- 在 `packages/components/.storybook/` 下配置
- 引入 `@neuron-ui/tokens/css/globals.css`
- 每个 neuron 组件必须有 story 覆盖所有变体

## Vite Library Mode 构建

```typescript
// packages/components/vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
})
```

## 交付物

| 交付物 | 数量 |
|--------|------|
| shadcn 原语 (src/ui/) | ~45 个文件 |
| neuron 组件 (src/neuron/) | 53 个组件目录 |
| SHADCN_OVERRIDES.md | 1 份 |
| Storybook stories | 53+ 个 |
| 单元测试 | 53+ 个 |
| src/index.ts (barrel) | 1 份 |

## 验收标准

| # | 标准 |
|---|------|
| 1 | 53 个 neuron 组件全部按设计规范完成 |
| 2 | 所有 CSS 中零硬编码色值 (全部通过 Token) |
| 3 | 每个组件有完整 TypeScript Props 类型 |
| 4 | 每个组件有 Storybook story |
| 5 | 单元测试覆盖率 ≥ 80% |
| 6 | `pnpm build --filter @neuron-ui/components` 通过 |
| 7 | 所有组件标注 `data-neuron-component` 属性 |
