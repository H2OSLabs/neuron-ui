---
name: neuron-generate-page
description: Generate neuron-ui Page Schema from arbitrary API lists and TaskCase descriptions. Use when users ask to create pages, generate UI from APIs, build CRUD/dashboard/detail pages, or convert API specs into visual interfaces. Triggers on requests like "generate a page for this API", "create a CRUD page", "build a dashboard from these endpoints", or any task requiring API-to-UI conversion using neuron-ui components.
---

# Neuron Generate Page

Read arbitrary API lists and TaskCase descriptions (any format), reference component-API mapping rules, and generate valid Page Schema JSON for the neuron-ui page builder.

## Workflow

```
1. Analyze API input    → Understand resources, endpoints, fields, types
2. Analyze TaskCase     → Understand page intent, user flows, required actions
3. Select page pattern  → Match to CRUD / Dashboard / Detail-with-tabs / custom
4. Map fields to components → Reference component-api-mapping rules
5. Generate Page Schema → Output valid JSON with component tree + data bindings
6. Validate output      → Check format, composition rules, binding completeness
```

## Step 1: Analyze API Input

Accept any format. Extract:
- **Resources**: What entities exist (e.g., "competition", "user")
- **Endpoints**: HTTP methods + paths (GET list, GET detail, POST, PUT, DELETE)
- **Fields**: Name, inferred type, constraints
- **Query params**: Filters, search, pagination

Field type inference from names:
| Name pattern | Inferred type |
|---|---|
| `*_at`, `*_date`, `created`, `updated` | date/datetime |
| `avatar`, `image`, `cover`, `logo`, `*_url` (image context) | string:image |
| `status`, `state`, `type`, `role`, `level` | string:enum |
| `description`, `content`, `bio`, `body` | string:long |
| `email`, `url`, `link`, `website` | string:url |
| `tags`, `labels`, `categories` | array:string |
| `is_*`, `has_*`, `enabled`, `active` | boolean |
| `price`, `amount`, `score`, `count` | number |
| `progress`, `completion`, `percentage`, `ratio` | number:percentage |

## Step 2: Analyze TaskCase

Accept any format (PRD, user story, one-liner). Extract:
- **Pages needed**: List page, detail page, etc.
- **User intent**: CRUD management, data viewing, analytics, auth
- **Required actions**: Create, edit, delete, filter, search, export
- **Priority**: Which page is primary

## Step 3: Select Page Pattern

Read [references/component-api-mapping.md](references/component-api-mapping.md) for full mapping rules.

Quick pattern selection:
| Signal | Pattern |
|---|---|
| Same resource has GET+POST+PUT+DELETE | CRUD (list + create dialog + edit sheet + delete confirm) |
| Multiple GET /stats endpoints | Dashboard (cards + charts + summary table) |
| GET /:id with many data dimensions | Detail-with-tabs (header card + tabbed content) |
| POST /auth, POST /login | Auth form (card + input + OTP) |

## Step 4: Map Fields to Components

For each field, determine display component (table columns, detail view) and input component (create/edit forms) using the mapping rules in `references/component-api-mapping.md`.

Key decision points:
- enum with <=5 options → NSelect or NRadioGroup; >5 → NCombobox
- array:string with <=10 options → NCheckbox; >10 → NCombobox(multiple)
- Create form → NDialog; Edit form → NSheet

## Step 5: Generate Page Schema

Output format:
```jsonc
{
  "version": "1.0.0",
  "page": { "id": "...", "name": "...", "generatedBy": "AI" },
  "dataSources": {
    "sourceKey": { "api": "GET /api/...", "params": {} }
  },
  "tree": [
    {
      "id": "unique-id",
      "component": "NComponentName",
      "props": { /* use Token keys, not raw values */ },
      "binding": { /* data bindings */ },
      "children": []
    }
  ]
}
```

### Binding protocol

| Binding type | Usage | Example |
|---|---|---|
| `dataSource` | Component reads from API | `"dataSource": "competitionList"` |
| `field` | Form input binds to request field | `"field": "name"` |
| `onChange` | Input change updates param | `"onChange": {"target": "list.params.keyword"}` |
| `onClick` | Click triggers action | `"onClick": {"action": "openDialog", "target": "create-dialog"}` |
| `onSubmit` | Form submit calls API | `"onSubmit": {"api": "POST /api/..."}` |
| `onConfirm` | Confirm calls API | `"onConfirm": {"api": "DELETE /api/.../{id}"}` |
| `prefill` | Edit form loads existing data | `"prefill": {"api": "GET /api/.../{id}"}` |

### Props constraints

- Use Token keys for colors: `"blue"`, `"pink"`, `"lime"` — never hex values
- Use Token keys for sizes: `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`
- Use Token keys for radius: `"sm"`, `"md"`, `"lg"`, `"xl"`

### Visual Layout 规则（必须遵守）

#### 1. 页面根容器必须有 className

根节点 NResizable 必须包含页面级样式，否则内容无 padding、无背景、贴边显示：

```json
{
  "id": "root",
  "component": "NResizable",
  "props": { "direction": "vertical", "className": "p-6 min-h-screen bg-background gap-6" }
}
```

#### 2. 模态组件不参与布局流

NDialog、NAlertDialog、NSheet、NDrawer 是覆盖层组件。它们可以出现在 tree 中（用于接收触发事件），但必须放在所有可见内容节点之后，不得影响布局。

- ✅ **正确**：通过 `binding.onClick: "openDialog:dialog-id"` 触发，NDialog 放在 tree 末尾
- ❌ **错误**：将 NDialog/NAlertDialog 插在 NDataTable 或 NEmpty 之间

#### 3. 常用 className 模式

| 场景 | 组件 | className |
|------|------|-----------|
| 页面根容器 | NResizable vertical | `"p-6 min-h-screen bg-background gap-6"` |
| 页面 Header 行（标题 + 操作按钮） | NResizable horizontal | `"items-center justify-between mb-2"` |
| 操作按钮组（搜索 + 新建并排） | NResizable horizontal | `"items-center gap-3"` |
| 统计卡片行（Dashboard） | NResizable horizontal | `"items-stretch gap-4"` |
| 表格（占满剩余区域） | NDataTable | `"flex-1"` |
| 表单字段堆叠 | NResizable vertical | `"gap-4"` |
| 分隔线区域 | NSeparator | （无需 className） |

#### 4. NEmpty 与 NDataTable 互斥显示

编辑器中两者都会显示（无条件判断），因此生成 schema 时：
- 页面内容区只放 NDataTable
- NEmpty 的语义通过 NDataTable 的空态 props 表达，而不是添加独立 NEmpty 节点

## Step 6: Validate

Before returning, verify:
1. All `component` values are valid neuron components (N-prefixed)
2. All `id` values are unique within the tree
3. All `dataSource` references exist in `dataSources`
4. All `binding.field` values match API fields
5. Component nesting follows composition rules (e.g., NField wraps input components)
6. No hardcoded color values in props

## CRUD Example (condensed)

For a "competition management" CRUD:
```json
{
  "tree": [
    {
      "id": "root",
      "component": "NResizable",
      "props": { "direction": "vertical", "className": "p-6 min-h-screen bg-background gap-6" },
      "children": [
        {
          "id": "header",
          "component": "NResizable",
          "props": { "direction": "horizontal", "className": "items-center justify-between" },
          "children": [
            { "id": "title", "component": "NText", "props": { "text": "竞赛管理", "size": "subheading", "weight": "bold" } },
            {
              "id": "toolbar",
              "component": "NResizable",
              "props": { "direction": "horizontal", "className": "items-center gap-3" },
              "children": [
                { "id": "search", "component": "NInput", "props": { "placeholder": "搜索..." } },
                { "id": "create-btn", "component": "NButton", "props": { "label": "新建竞赛", "variant": "default" }, "binding": { "onClick": "openDialog:create-dialog" } }
              ]
            }
          ]
        },
        { "id": "separator", "component": "NSeparator", "props": {} },
        {
          "id": "table",
          "component": "NDataTable",
          "props": { "columns": [...], "className": "flex-1" },
          "binding": { "dataSource": "competitionList", "field": "items" }
        },
        { "id": "create-dialog", "component": "NDialog", "props": { "title": "新建竞赛" }, "children": [...] },
        { "id": "edit-sheet", "component": "NSheet", "props": { "title": "编辑竞赛", "side": "right" }, "children": [...] },
        { "id": "delete-confirm", "component": "NAlertDialog", "props": { "title": "确认删除", "confirmLabel": "删除", "destructive": true }, "binding": { "onConfirm": "deleteCompetition" } }
      ]
    }
  ]
}
```

## Resources

### references/
- **component-api-mapping.md** — Complete field-type-to-component and API-pattern-to-page mapping rules. Always read this before generating.
