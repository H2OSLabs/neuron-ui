# 共享设计基础 / Shared Design Tokens

> 从 Agentour 设计规范与 Synnovatour 组件规范中提取的共同设计基础。

---

## 01 / 色彩体系

两个文档共享同一套色彩系统，组件中使用的颜色均来源于设计 Token 定义。

### 灰阶 (Gray Scale)

| Token | HEX | 组件中的使用场景 |
|-------|-----|-----------------|
| Gray 01 | `#5F5D57` | 主要文字、图标描边色 |
| Gray 02 | `#6D6B65` | 标题 |
| Gray 03 | `#7E7C76` | 副标题 |
| Gray 04 | `#8D8B85` | 次要文字 |
| Gray 05 | `#9B9993` | 弱化文字 |
| Gray 06 | `#A8A6A0` | 占位符 |
| Gray 07 | `#B9B7B1` | 禁用状态（Switch、Input 等组件的不可用态） |
| Gray 08 | `#CDCBC5` | 分割线 |
| Gray 09 | `#DCDAD4` | 边框（Input、Card 等组件的描边） |
| Gray 10 | `#E8E5DE` | 淡边框 |
| Gray 11 | `#ECE9E3` | 悬停状态（Dropdown Menu、Combobox 的 Hover 背景） |
| Gray 12 | `#F3F1ED` | 卡片背景（Card 组件） |
| Gray 13 | `#F9F8F6` | 页面背景 |
| Gray 14 | `#FCFCFC` | 表面 |

### 辅助色 (Accent Colors)

| Token | HEX | 组件中的使用场景 |
|-------|-----|-----------------|
| Pink | `#FFC4E1` | Badge/Tag 标签 |
| Pink Light | `#FFD6D2` | 提醒、Alert |
| Yellow | `#FFF0CE` | 高亮 |
| Yellow Bright | `#FFFBBC` | 草稿状态 |
| Lime | `#EEFFAF` | 成功状态 |
| Lime Light | `#E1FFD0` | 进行中状态 |
| Green | `#C1F2CE` | 已发布状态 |
| Blue | `#BEF1FF` | 信息提示（Toast、Card 通知） |
| Purple | `#E1E1FF` | 技术标签 |
| Lavender | `#F0E6FF` | 特殊标签 |

### 语义色 (Semantic Colors)

| Token | HEX | 组件中的使用场景 |
|-------|-----|-----------------|
| Error | `#E67853` | Input/Combobox 无效状态、Dialog 危险操作按钮 |
| Warning | `#E8A540` | Radio Group 警告提示、注意提示 |
| Success | `#6EC18E` | 成功反馈、Card 通知中的"可用"状态 |

---

## 02 / 字号体系

设计规范定义 7 级字号，组件中高频使用 `14px` 和 `12px`。

| 字号 | 角色 | 字重 | 组件中的使用 |
|------|------|------|-------------|
| 48px | 展示标题 | 700 | — |
| 36px | 主标题 | 700 | — |
| 28px | 副标题 | 700 | — |
| 24px | 区块标题 | 500 | — |
| 18px | 正文大字 | 400 | Data Table 主标题 |
| **14px** | **正文** | **400** | Card 标题、Input 文字、Button 文字、Data Table 内容 |
| **12px** | **说明文字** | **400** | Card 正文、Badge 标签文字、Dropdown Menu 文字、Data Table 标签 |

### 共享字体

| 类型 | 字体 |
|------|------|
| 英文主字体 | Asul |
| 中文字体 | Swei Gothic CJK SC (未来圆) |

---

## 03 / 间距体系

设计规范定义 10 级间距，组件规范中的内边距、行间距、元素间距完全遵循此体系。

| 间距 | 变量 | 组件中的使用 |
|------|------|-------------|
| 4px | `--spacing-xs` | Badge 标签间距、Card 图片拼接间距 |
| 8px | `--spacing-sm` | Checkbox/Radio Group 行间距、Scroll Area 行间距、Card 内边距、Avatar 标签边距 |
| 12px | `--spacing-md-` | Dropdown Menu 内容间距、Card 文字边距、Button 输入框内边距 |
| 16px | `--spacing-md` | Dialog 主文区域边距/行间距、Calendar 标签间距、Card 标题间距、Textarea 内间距 |
| 20px | `--spacing-lg-` | Dialog 内边距 |
| 24px | `--spacing-lg` | Dialog 标题与主文间距、Input Group icon 与文字间距 |
| 32px | `--spacing-xl` | Empty 表情与按钮间距、Input 高度 |
| 36px | `--spacing-2xl` | Dialog 按钮间距、Sheet 内间距、Input Group 输入框高度 |
| 48px | `--spacing-3xl` | — |
| 64px | `--spacing-4xl` | — |

---

## 04 / 圆角体系

设计规范定义 5 级圆角，与组件中实际使用完全对应。

| 圆角 | 变量 | 设计规范用途 | 组件中的使用 |
|------|------|-------------|-------------|
| 4px | `--radius-sm` | 标签/徽章 | Badge 标签、Calendar 日期标签、Data Table 热度标签 |
| 8px | `--radius-md` | 输入框 | Input/Combobox 输入框、Card 图片圆角、Dropdown Menu 下拉面板 |
| 12px | `--radius-lg` | 卡片/面板 | Card 卡片 |
| 20px | `--radius-xl` | 按钮 | Button 胶囊按钮、Card 大圆角变体 |
| 50% | `--radius-full` | 头像/药丸 | Avatar 圆形头像、Button 圆形按钮 |

---

## 05 / 图标尺寸

设计规范定义 3 档图标尺寸，组件中统一使用。

| 尺寸 | 设计规范 | 组件中的使用 |
|------|---------|-------------|
| 16px | 小图标 | Badge 内标签 |
| 18px | — | Toggle Group icon |
| 20px | 中图标 | — |
| 24px | 大图标 | Dropdown Menu icon、Card 通知图标 |

图标风格统一为 **Heist 描边风格**，圆角端点，描边色为 Gray-01 (`#5F5D57`)。

---

## 06 / 组件可组合性

两个文档共同体现的核心设计原则：**所有组件都支持灵活的内容插入**。

| 可插入内容 | 支持该内容的组件 |
|-----------|----------------|
| **文本** | Dialog, Aspect Ratio, Card, Input, Textarea, Toast, Empty, Dropdown Menu, Data Table |
| **图片** | Aspect Ratio, Card, Input Group, Dropdown Menu, Radio Group, Scroll Area, Empty |
| **Icon** | Button, Dropdown Menu, Toggle Group, Input Group, Card, Empty, Scroll Area |
| **Tag/Badge** | Avatar, Card, Calendar, Data Table, Input, Input Group |
| **头像 (Avatar)** | Card, Checkbox, Radio Group, Data Table |
| **按钮 (Button)** | Dialog, Card, Textarea, Empty, Input Group |

这种一致的可插拔设计使得 AI Agent 可以通过标准化接口，将任意内容注入任意组件，快速组装出完整页面。

---

## CSS Variables 汇总

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
  --tag-pink: #FFC4E1;
  --tag-pink-light: #FFD6D2;
  --tag-yellow: #FFF0CE;
  --tag-yellow-bright: #FFFBBC;
  --tag-lime: #EEFFAF;
  --tag-lime-light: #E1FFD0;
  --tag-green: #C1F2CE;
  --tag-blue: #BEF1FF;
  --tag-purple: #E1E1FF;
  --tag-lavender: #F0E6FF;

  /* Semantic Colors */
  --color-error: #E67853;
  --color-warning: #E8A540;
  --color-success: #6EC18E;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md-: 12px;
  --spacing-md: 16px;
  --spacing-lg-: 20px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 36px;
  --spacing-3xl: 48px;
  --spacing-4xl: 64px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 50%;
}
```
