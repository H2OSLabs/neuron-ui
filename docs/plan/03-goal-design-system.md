# 目标 3: 按设计规范开发组件库

## 核心问题

| 问题 | 说明 |
|------|------|
| **设计规范只存在于文档中** | Token 没有落地为代码，开发时靠手动查阅 |
| **颜色/间距硬编码** | 开发容易写死数值，后续改规范时无法批量更新 |
| **组件质量不一致** | 缺少统一的开发规范和校验机制 |
| **没有视觉回归测试** | 组件修改后无法自动检测视觉是否正确 |
| **组件文档缺失** | 其他开发者/AI 无法快速了解组件用法 |

## 实现方案

### 1. Design Tokens 包

将设计规范转化为代码可消费的 Token 包，所有组件开发只允许引用 Token。

**目录结构：**

```
tokens/
├── colors.css          ← CSS 变量定义
├── spacing.css         ← 间距变量
├── radius.css          ← 圆角变量
├── typography.css      ← 字体/字号变量
├── index.css           ← 统一入口
├── tokens.json         ← 机器可读格式（供 AI 和搭建平台使用）
└── tokens.ts           ← TypeScript 常量（供组件代码使用）
```

**colors.css：**

```css
:root {
  /* Gray Scale */
  --gray-01: #5F5D57;
  --gray-02: #6D6B65;
  --gray-03: #7E7C76;
  --gray-04: #8D8B85;
  --gray-05: #9B9993;
  --gray-06: #A8A6A0;
  --gray-07: #B9B7B1;
  --gray-08: #CDCBC5;
  --gray-09: #DCDAD4;
  --gray-10: #E8E5DE;
  --gray-11: #ECE9E3;
  --gray-12: #F3F1ED;
  --gray-13: #F9F8F6;
  --gray-14: #FCFCFC;

  /* Accent Colors */
  --accent-pink: #FFC4E1;
  --accent-pink-light: #FFD6D2;
  --accent-yellow: #FFF0CE;
  --accent-yellow-bright: #FFFBBC;
  --accent-lime: #EEFFAF;
  --accent-lime-light: #E1FFD0;
  --accent-green: #C1F2CE;
  --accent-blue: #BEF1FF;
  --accent-purple: #E1E1FF;
  --accent-lavender: #F0E6FF;

  /* Semantic Colors */
  --color-error: #E67853;
  --color-warning: #E8A540;
  --color-success: #6EC18E;
}
```

**tokens.ts：**

```typescript
export const colors = {
  gray: {
    '01': '#5F5D57',
    '02': '#6D6B65',
    // ...
  },
  accent: {
    pink: '#FFC4E1',
    // ...
  },
  semantic: {
    error: '#E67853',
    warning: '#E8A540',
    success: '#6EC18E',
  },
} as const;

export const spacing = {
  xs: '4px', sm: '8px', 'md-': '12px', md: '16px',
  'lg-': '20px', lg: '24px', xl: '32px', '2xl': '36px',
  '3xl': '48px', '4xl': '64px',
} as const;

export const radius = {
  sm: '4px', md: '8px', lg: '12px', xl: '20px', full: '50%',
} as const;

export const fontSize = {
  display: '48px', heading: '36px', subheading: '28px',
  section: '24px', bodyLarge: '18px', body: '14px', caption: '12px',
} as const;
```

### 2. 组件开发规范

每个组件的标准目录结构：

```
components/
├── button/
│   ├── Button.tsx               ← 组件实现
│   ├── Button.module.css        ← 样式（只用 Token 变量）
│   ├── Button.types.ts          ← TypeScript 类型定义
│   ├── Button.test.tsx          ← 单元测试
│   ├── Button.stories.tsx       ← Storybook 文档
│   ├── button.schema.json       ← 组件 Schema（供 AI 和搭建平台）
│   └── index.ts                 ← 导出入口
```

**组件实现规范：**

```tsx
// Button.tsx — 示例
import styles from './Button.module.css';
import type { ButtonProps } from './Button.types';

export function Button({
  variant = 'capsule',
  size = '32px',
  color,
  label,
  icon,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      style={{
        height: size,                          // ✅ 使用 size prop
        backgroundColor: color,                // ✅ 颜色由外部传入 Token 值
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label}
    </button>
  );
}
```

**CSS 规范（只使用 Token 变量）：**

```css
/* Button.module.css */
.button {
  border: none;
  cursor: pointer;
  font-family: var(--font-primary), var(--font-cjk), sans-serif;
  font-size: var(--font-body);              /* ✅ Token 引用 */
  padding: 0 var(--spacing-md);             /* ✅ Token 引用 */
  border-radius: var(--radius-xl);          /* ✅ Token 引用 */
  color: var(--gray-01);                    /* ✅ Token 引用 */
  transition: background-color 0.15s ease;
}

.button:hover {
  background-color: var(--gray-11);         /* ✅ Token 引用 */
}

.button:disabled {
  color: var(--gray-07);                    /* ✅ Token 引用 */
  cursor: not-allowed;
}

/* ❌ 禁止硬编码
.button {
  color: #5F5D57;
  padding: 0 16px;
  border-radius: 20px;
}
*/
```

### 3. 组件开发清单

按组件规范文档的定义，逐一开发。优先级根据搭建平台的依赖排序。

| 优先级 | 组件 | 关键规格 |
|--------|------|---------|
| **P0 — 基础组件** | | |
| P0 | Button | 胶囊/圆形/异形, h: 20/24/32/36/48px |
| P0 | Badge | h: 16/24px, r: 4px |
| P0 | Avatar | 圆形(个人)/圆角方形(团队), 描边/在线状态/标签 |
| P0 | Input | h: 32px, 话题/tag 创建, 无效态 |
| P0 | Text | 7 级字号, 4 级字重 |
| **P1 — 容器组件** | | |
| P1 | Card | 5 种变体 (cover-left/cover-top/cover-full/profile/notification) |
| P1 | Dialog | 九宫定位, 内边距 20px, 按钮间距 36px |
| P1 | Sheet | 侧边推入, w: 396px |
| P1 | AspectRatio | w: 856px, 可展开收起 |
| P1 | ScrollArea | 水平/纵向, 行间距 8px |
| **P2 — 表单组件** | | |
| P2 | InputGroup | h: 36px, 支持搜索/tag/下拉 |
| P2 | Combobox | 单选/多选, 搜索, 分组 |
| P2 | Checkbox | 内边距 8px, 行间距 8px |
| P2 | RadioGroup | 内边距 8px, 支持禁止/警告态 |
| P2 | Switch | h: 18px, w: 40px, 描边 2px |
| P2 | Textarea | 856x180px, 内间距 16px |
| **P3 — 展示组件** | | |
| P3 | Calendar | w: 328px, h: 324px |
| P3 | Carousel | h: 32px, 方向可调 |
| P3 | DataTable | 排序/过滤, 多变体 |
| P3 | DropdownMenu | 内边距 16/8px, 内容 92x32px |
| P3 | Empty | 居中布局, 按钮 136x32px |
| **P4 — 辅助组件** | | |
| P4 | Toast | 可点击文字带下划线 |
| P4 | Toggle | 颜色变化, 大小可变 |
| P4 | ToggleGroup | 横/纵排列, icon 18x18px |
| P4 | Resizable | 断点: 1440/1340/1288/928px |

### 4. Storybook 组件文档

每个组件有 Storybook story，展示所有变体和状态。

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button',
  argTypes: {
    variant: { control: 'select', options: ['capsule', 'circle', 'custom'] },
    size: { control: 'select', options: ['20px', '24px', '32px', '36px', '48px'] },
    color: { control: 'select', options: ['var(--accent-pink)', 'var(--accent-blue)', 'var(--accent-lime)'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { label: '默认按钮', variant: 'capsule', size: '32px' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
      {['20px', '24px', '32px', '36px', '48px'].map(size => (
        <Button key={size} label={size} size={size} />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { label: '禁用', disabled: true },
};
```

### 5. 质量保障

| 层面 | 工具 | 作用 |
|------|------|------|
| Token 校验 | Stylelint 自定义规则 | 禁止 CSS 中出现硬编码色值/间距 |
| 类型安全 | TypeScript strict mode | Props 必须有完整类型定义 |
| 单元测试 | Vitest + Testing Library | 组件行为测试 |
| 视觉回归 | Chromatic / Storybook Test | 截图对比，检测视觉变化 |
| 代码规范 | ESLint + Prettier | 代码风格统一 |

**Stylelint 自定义规则示例（禁止硬编码色值）：**

```json
{
  "rules": {
    "color-no-hex": true,
    "declaration-property-value-allowed-list": {
      "color": ["/^var\\(--/"],
      "background-color": ["/^var\\(--/"],
      "border-color": ["/^var\\(--/"]
    }
  }
}
```

## 项目初始化工具链

| 工具 | 用途 |
|------|------|
| Vite | 构建工具 |
| React 18+ | UI 框架 |
| TypeScript | 类型系统 |
| CSS Modules | 样式隔离 |
| Storybook | 组件文档和开发环境 |
| Vitest | 单元测试 |
| Stylelint | CSS 规范检查 |
| ESLint + Prettier | 代码风格 |
| Changesets | 版本管理和发布 |

## 验收标准

| # | 标准 | 验证方法 |
|---|------|---------|
| 1 | 组件 CSS 中零硬编码色值 | Stylelint 校验通过 |
| 2 | 所有组件 Props 有完整 TypeScript 类型 | tsc --noEmit 通过 |
| 3 | 每个组件有 Storybook story 覆盖所有变体 | Storybook 浏览验证 |
| 4 | 组件视觉与设计规范一致 | Chromatic 视觉对比 |
| 5 | 组件尺寸/间距与规范文档完全对应 | 像素级对比 |
| 6 | 单元测试覆盖率 ≥ 80% | Vitest coverage 报告 |

## 任务拆解

| 优先级 | 任务 | 产出 |
|--------|------|------|
| P0 | 项目脚手架搭建 (Vite + React + TS) | 可运行的空项目 |
| P0 | Design Tokens 包 (CSS + TS + JSON) | tokens/ 目录 |
| P0 | Storybook 配置 | 可运行的 Storybook |
| P0 | Stylelint / ESLint 规则配置 | lint 配置文件 |
| P0 | P0 基础组件开发 (Button, Badge, Avatar, Input, Text) | 5 个组件 |
| P1 | P1 容器组件开发 (Card, Dialog, Sheet, AspectRatio, ScrollArea) | 5 个组件 |
| P2 | P2 表单组件开发 (InputGroup, Combobox, Checkbox, RadioGroup, Switch, Textarea) | 6 个组件 |
| P3 | P3 展示组件开发 (Calendar, Carousel, DataTable, DropdownMenu, Empty) | 5 个组件 |
| P4 | P4 辅助组件开发 (Toast, Toggle, ToggleGroup, Resizable) | 4 个组件 |
| P2 | 视觉回归测试配置 (Chromatic) | CI 流程 |
| P2 | 单元测试补全 | 覆盖率达标 |
