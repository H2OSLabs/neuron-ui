# Phase 3: AI 元数据 (@neuron-ui/metadata)

> 构建 AI 的知识库：组件清单 + 接口映射 + 组合规则 + Page Schema 定义。

---

## 依赖

- Phase 2 (至少 P0-P2 批次组件完成，可开始编写元数据)
- 可与 Phase 2 后期批次并行

## 设计来源

- `docs/plan/02-goal-component-api-mapping.md` — 完整映射表 + JSON 格式
- `docs/plan/05-architecture.md` § 7 — 元数据系统设计

## Phase 3A: 组件清单 + Schema

### 3A.1 component-manifest.json

53 个组件的结构化清单，AI 读取此文件理解可用组件。

每个组件条目:
```jsonc
{
  "name": "NButton",
  "displayName": "Button / 按钮",
  "description": "按钮组件，支持胶囊/圆形/异形三种变体",
  "category": "action",                          // display | input | action | container | feedback | navigation | layout
  "importPath": "@neuron-ui/components/neuron/NButton",
  "schemaPath": "./schemas/button.schema.json",
  "variants": ["capsule", "circle", "custom"],
  "sizes": ["xs", "sm", "md", "lg", "xl"],
  "slots": ["icon"],
  "canBeChildOf": ["NDialog", "NCard", ...],
  "canContain": []
}
```

### 3A.2 per-component Schema

`schemas/*.schema.json`: 每个组件的 Props JSON Schema，作为**外部文档参考**。

> **重要说明:** 运行时的 props 校验统一使用 `@neuron-ui/runtime` 中 neuronCatalog 的 **Zod schema** (Single Source of Truth)。此处的 JSON Schema 文件仅供外部工具消费 (如 JSON 编辑器的智能提示)，不作为运行时校验依据。未来可考虑从 Zod schema 自动生成 JSON Schema 以保持同步。

```
schemas/
├── _meta.schema.json       # Schema 格式自身的 JSON Schema
├── button.schema.json
├── badge.schema.json
├── card.schema.json
├── input.schema.json
├── ...                     # 53 个
```

### 3A.3 Schema 提取脚本 (可选)

`scripts/extract-schemas.ts`: 从组件 `.types.ts` 自动生成部分 JSON Schema 骨架。

## Phase 3B: 组件-接口映射规则

### 3B.1 component-api-mapping.json

> 完整格式参见 `docs/plan/02-goal-component-api-mapping.md` "映射规则 JSON 格式" 章节

三大部分:

**1) fieldTypeMapping.display — Response 字段 → 展示组件**

| 字段类型 | 组件 | 示例 |
|---------|------|------|
| string | NText | 用户名、标题 |
| string:image | NAvatar | 头像 |
| string:enum | NBadge | 状态标签 |
| number:percentage | NProgress | 完成度 |
| array:object | NDataTable | 列表数据 |
| array:number | NChart | 图表数据 |
| null / empty | NEmpty | 空数据 |
| loading | NSkeleton | 加载占位 |

**2) fieldTypeMapping.input — Request 字段 → 输入组件**

| 字段类型 | 组件 | 说明 |
|---------|------|------|
| string | NInput | 短文本 |
| string:long | NTextarea | 长文本 |
| string:enum (≤5) | NSelect / NRadioGroup | 少量选项 |
| string:enum (>5) | NCombobox | 可搜索 |
| boolean | NSwitch | 布尔值 |
| date | NDatePicker | 日期 |
| number:range | NSlider | 数值范围 |

**3) apiPatternMapping — API 模式 → 页面模式**

| API 模式 | 页面模式 | 主要组件 |
|---------|---------|---------|
| GET /list | list-page | NDataTable + NPagination |
| GET /:id | detail-page | NCard + NTabs |
| GET /stats | dashboard | NCard[] + NChart[] |
| POST / | create-form | NDialog + NField[] |
| PUT /:id | edit-form | NSheet + NField[] |
| DELETE /:id | delete-confirm | NAlertDialog |
| CRUD (复合) | crud-page | 全量组合 |
| Dashboard (复合) | dashboard-page | 统计卡片 + 图表 + 表格 |

## Phase 3C: 组合规则 + Page Schema 定义

### 3C.1 composition-rules.json

组件嵌套约束:

```jsonc
{
  "rules": [
    {
      "parent": "NDialog",
      "allowedChildren": ["NCard", "NText", "NButton", "NInput", "NScrollArea"],
      "constraints": { "maxButtons": 3, "buttonPlacement": "bottom-center" }
    },
    // ...
  ],
  "globalConstraints": {
    "colorsMustBeTokens": true,
    "spacingMustBeTokens": true,
    "maxNestingDepth": 6,
    "rootContainers": ["NResizable", "NAspectRatio", "NDialog", "NSheet"]
  }
}
```

### 3C.2 Page Schema 定义

`page-schema/page.schema.json`: Page Schema 的 JSON Schema 定义。

```
page-schema/
├── page.schema.json          # JSON Schema 定义
└── examples/
    ├── crud-page.json        # CRUD 列表页示例
    ├── dashboard-page.json   # 仪表盘页示例
    └── detail-page.json      # 详情页示例
```

### 3C.3 校验器

```typescript
// src/validator.ts         — component-manifest 校验
// src/page-schema-validator.ts — Page Schema 校验 (格式 + 嵌套 + 绑定 + Token)
// src/types.ts             — TypeScript 类型定义
```

校验器需验证:
1. JSON 格式是否合法
2. 组件名是否在 manifest 中
3. props 是否符合组件 schema
4. 嵌套是否符合 composition-rules
5. binding 是否完整 (dataSource, field, onChange 等)
6. 颜色/间距/圆角值是否为 Token key (非原始值)

### 3C.4 builder-registry

为 Page Builder 提供组件注册信息:

```
builder-registry/
├── component-registry.json   # 缩略图、分类、默认 props
└── editor-types.json         # Props → 属性编辑器类型映射
```

### 3C.5 AI 协议

```
ai-protocol/
├── USAGE.md                  # AI 如何使用这些元数据
└── prompt-templates/
    ├── compose-page.md       # 生成整页的 prompt 模板
    └── modify-component.md   # 修改单组件的 prompt 模板
```

## 交付物

| 文件 | 说明 |
|------|------|
| component-manifest.json | 53 个组件清单 |
| component-api-mapping.json | 字段→组件 + API模式→页面 映射 |
| composition-rules.json | 嵌套约束 |
| schemas/*.schema.json | 53 个组件 Props Schema |
| page-schema/page.schema.json | Page Schema 定义 |
| page-schema/examples/*.json | 3+ 示例 |
| src/page-schema-validator.ts | Page Schema 校验器 |
| builder-registry/ | 编辑器注册信息 |
| ai-protocol/ | AI 使用协议 |

## 验收标准

| # | 标准 |
|---|------|
| 1 | 全部 53 个组件在 manifest 中有条目 |
| 2 | 全部 53 个组件有对应的 Props Schema |
| 3 | 每种 API 字段类型都有对应的展示/输入组件映射 |
| 4 | 字段→组件决策树逻辑清晰，可编程执行 |
| 5 | CRUD / Dashboard / Detail 三种复合模式已定义 |
| 6 | Page Schema 校验器能正确识别: 格式错误、嵌套违规、绑定缺失、Token 违规 |
| 7 | 三个示例 Page Schema 全部通过校验 |
