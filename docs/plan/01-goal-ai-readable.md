# 目标 1: 让 AI 快速阅读和正确使用组件库

## 核心问题

AI（如 Claude、GPT）在使用组件库时，面临以下挑战：

| 问题 | 说明 |
|------|------|
| **不知道有哪些组件** | 无法快速获取组件清单，只能逐文件扫描 |
| **不理解组件能力** | 不清楚每个组件的 Props、插槽、变体、约束 |
| **不清楚组合规则** | 不知道哪些组件可以嵌套在哪些组件内 |
| **不了解设计约束** | 可能使用规范外的颜色、间距、字号 |
| **缺少用法示例** | 没有结构化的代码模板可以参考 |

## 实现方案

### 1. 组件清单 Manifest

创建一个机器可读的 `component-manifest.json`，AI 通过读取这一个文件就能了解整个组件库的全貌。

```
neuron-ui/
├── component-manifest.json       ← AI 入口文件
```

**manifest 结构示例：**

```jsonc
{
  "version": "1.0.0",
  "designTokens": "./tokens/tokens.json",
  "components": [
    {
      "name": "Button",
      "description": "按钮组件，支持胶囊、圆形、异形三种变体",
      "category": "action",
      "importPath": "@neuron-ui/button",
      "schema": "./components/button/button.schema.json",
      "variants": ["capsule", "circle", "custom"],
      "sizes": ["20px", "24px", "32px", "36px", "48px"],
      "slots": ["icon", "label"],
      "canBeChildOf": ["Dialog", "Card", "Textarea", "Empty", "AspectRatio"],
      "canContain": ["Icon"]
    }
    // ...其他组件
  ]
}
```

### 2. 组件 Schema（per-component）

每个组件有独立的 JSON Schema 文件，描述其完整的 Props 和约束。

```jsonc
// components/button/button.schema.json
{
  "name": "Button",
  "props": {
    "variant": {
      "type": "enum",
      "values": ["capsule", "circle", "custom"],
      "default": "capsule",
      "description": "按钮形状变体"
    },
    "size": {
      "type": "enum",
      "values": ["20px", "24px", "32px", "36px", "48px"],
      "default": "32px",
      "description": "按钮高度"
    },
    "color": {
      "type": "token-ref",
      "tokenGroup": "accent-colors",
      "description": "按钮颜色，必须引用设计 Token"
    },
    "label": {
      "type": "string",
      "description": "按钮文本"
    },
    "icon": {
      "type": "slot",
      "accepts": ["Icon"],
      "position": "left | right",
      "description": "图标插槽"
    }
  }
}
```

### 3. 组合规则（Composition Rules）

定义组件之间的嵌套关系，防止 AI 生成无效的组件组合。

```jsonc
// composition-rules.json
{
  "rules": [
    {
      "parent": "Dialog",
      "allowedChildren": ["Card", "Text", "Button", "Input", "ScrollArea"],
      "constraints": {
        "maxButtons": 3,
        "buttonPosition": "bottom-center"
      }
    },
    {
      "parent": "Card",
      "allowedChildren": ["Image", "Text", "Badge", "Avatar", "Button", "Icon"],
      "constraints": {
        "maxBadges": 2,
        "imagePosition": "top | left"
      }
    },
    {
      "parent": "ScrollArea",
      "allowedChildren": ["Card", "Image", "Icon", "Text"],
      "constraints": {
        "direction": "horizontal | vertical"
      }
    }
  ]
}
```

### 4. Design Tokens 机器可读格式

将设计 Token 输出为 JSON，AI 在生成代码时只允许引用这些值。

```jsonc
// tokens/tokens.json
{
  "colors": {
    "gray": {
      "01": { "value": "#5F5D57", "usage": "主要文字" },
      "02": { "value": "#6D6B65", "usage": "标题" }
      // ...
    },
    "accent": {
      "pink": { "value": "#FFC4E1", "usage": "标签" }
      // ...
    },
    "semantic": {
      "error": { "value": "#E67853" },
      "warning": { "value": "#E8A540" },
      "success": { "value": "#6EC18E" }
    }
  },
  "spacing": {
    "xs": "4px", "sm": "8px", "md-": "12px", "md": "16px",
    "lg-": "20px", "lg": "24px", "xl": "32px", "2xl": "36px",
    "3xl": "48px", "4xl": "64px"
  },
  "radius": {
    "sm": "4px", "md": "8px", "lg": "12px", "xl": "20px", "full": "50%"
  },
  "fontSize": {
    "display": "48px", "heading": "36px", "subheading": "28px",
    "section": "24px", "bodyLarge": "18px", "body": "14px", "caption": "12px"
  }
}
```

### 5. AI Prompt 协议

提供标准化的 Prompt 模板，让 AI 知道如何正确使用组件库。

```markdown
# neuron-ui AI 使用协议

## 第一步：读取 manifest
读取 component-manifest.json 获取组件清单。

## 第二步：理解约束
读取 tokens.json 了解可用的设计 Token。
读取 composition-rules.json 了解组件嵌套规则。

## 第三步：生成页面
使用 Page Schema 格式输出页面结构（见目标 2）。
所有颜色/间距/圆角必须引用 Token，不允许硬编码。

## 第四步：验证
通过 Schema 校验器验证生成结果是否合规。
```

### 6. CLAUDE.md 项目指令

在项目根目录放置 `CLAUDE.md`，当 AI Agent（如 Claude Code）打开此项目时，自动获取上下文。

```markdown
# CLAUDE.md
本项目是 neuron-ui 组件库。

## 快速上手
- 组件清单: component-manifest.json
- 设计 Token: tokens/tokens.json
- 组合规则: composition-rules.json

## 开发规范
- 颜色/间距/圆角必须使用 CSS 变量 (--gray-xx, --spacing-xx, --radius-xx)
- 不允许硬编码色值
- 组件 Props 必须有 TypeScript 类型定义
```

## 文件结构

```
neuron-ui/
├── CLAUDE.md                          ← AI Agent 自动读取的项目指令
├── component-manifest.json            ← 组件清单入口
├── composition-rules.json             ← 组件组合规则
├── tokens/
│   └── tokens.json                    ← 设计 Token（机器可读）
├── components/
│   ├── button/
│   │   ├── Button.tsx                 ← 组件实现
│   │   ├── button.schema.json         ← 组件 Schema
│   │   └── button.stories.tsx         ← 使用示例
│   ├── card/
│   │   ├── Card.tsx
│   │   ├── card.schema.json
│   │   └── card.stories.tsx
│   └── ...
```

## 验收标准

| # | 标准 | 验证方法 |
|---|------|---------|
| 1 | AI 读取 manifest 后能列出所有组件及其能力 | 给 AI 一个 manifest，让它列出组件清单 |
| 2 | AI 生成的页面代码只使用 Token 内的值 | 自动化 Schema 校验 |
| 3 | AI 生成的组件嵌套关系符合 composition-rules | 自动化组合规则校验 |
| 4 | AI 能根据一句话需求生成完整页面 | Prompt 测试："生成一个活动详情页" |
| 5 | CLAUDE.md 被 AI Agent 正确读取 | 在 Claude Code 中打开项目验证 |

## 任务拆解

| 优先级 | 任务 | 预估产出 |
|--------|------|---------|
| P0 | 定义 component-manifest.json 格式 | JSON Schema |
| P0 | 定义 per-component schema 格式 | JSON Schema |
| P0 | 将设计 Token 输出为 tokens.json | JSON 文件 |
| P1 | 定义 composition-rules.json | JSON 文件 |
| P1 | 编写 CLAUDE.md | Markdown |
| P1 | 为每个组件编写 schema.json | 25+ JSON 文件 |
| P2 | 编写 Schema 校验器 | TypeScript 工具 |
| P2 | 编写 AI Prompt 模板 | Markdown |
| P2 | AI 端到端测试（给需求 → 生成页面 → 校验） | 测试用例 |
