# 目标 3: API + TaskCase 自动生成页面

> 后端给出 API 列表，产品给出 TaskCase，系统自动匹配组件生成完整页面

---

## 目标分析

### 核心问题

| 问题 | 说明 |
|------|------|
| **开发效率低** | 每个页面都要手动选组件、写布局、绑数据 |
| **重复劳动** | CRUD 页面模式高度相似，但每次都从零开始 |
| **API 和 UI 脱节** | 后端出接口、产品出需求、前端手动翻译成页面，信息传递有损失 |
| **一致性难保证** | 不同开发者对相同 API 模式的 UI 实现可能完全不同 |

### 解决方案

```
输入:
  1. API 列表 (Swagger/OpenAPI spec)    ← 后端提供
  2. TaskCase (用户故事/用例)            ← 产品提供

处理:
  3. API Schema 解析 → 提取资源/接口/字段
  4. TaskCase 解析 → 提取页面意图/用户流程
  5. 映射匹配 → API 类型 × 字段类型 → 组件选择
  6. 页面组装 → 按模式生成 Page Schema

输出:
  7. 完整的 Page Schema JSON → 可直接在编辑器中渲染和调整
```

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      自动生成引擎 (Page Generator)                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ API 解析器    │  │ TaskCase     │  │ 映射规则引擎           │  │
│  │              │  │ 解析器       │  │                       │  │
│  │ Swagger/     │  │              │  │ component-api-        │  │
│  │ OpenAPI      │  │ 结构化用例   │  │ mapping.json          │  │
│  │    ↓         │  │    ↓         │  │    ↓                  │  │
│  │ 资源列表     │  │ 页面意图     │  │ API类型→组件          │  │
│  │ 接口列表     │  │ 用户流程     │  │ 字段类型→组件          │  │
│  │ 字段Schema   │  │ 操作列表     │  │ API模式→页面模式       │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘  │
│         │                 │                       │              │
│         └────────────┬────┘───────────────────────┘              │
│                      ▼                                          │
│              ┌───────────────┐                                   │
│              │  页面组装器    │                                   │
│              │              │                                   │
│              │  选择页面模式  │                                   │
│              │  匹配组件     │                                   │
│              │  绑定数据     │                                   │
│              │  生成布局     │                                   │
│              └───────┬───────┘                                   │
│                      ▼                                          │
│              ┌───────────────┐                                   │
│              │  Page Schema  │  → 输出到拖拉拽编辑器 (目标 4)     │
│              │  JSON         │                                   │
│              └───────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 输入格式

### 输入 1: API 列表 (Swagger/OpenAPI)

后端提供的标准 OpenAPI 格式，系统从中提取关键信息：

```jsonc
// 原始 Swagger spec (后端提供)
{
  "paths": {
    "/api/competitions": {
      "get": {
        "summary": "获取赛事列表",
        "parameters": [
          { "name": "status", "in": "query", "schema": { "type": "string", "enum": ["draft", "active", "ended"] } },
          { "name": "keyword", "in": "query", "schema": { "type": "string" } },
          { "name": "page", "in": "query", "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "id": { "type": "integer" },
                          "name": { "type": "string", "description": "赛事名称" },
                          "status": { "type": "string", "enum": ["draft", "active", "ended"] },
                          "cover_image": { "type": "string", "format": "uri" },
                          "prize": { "type": "number" },
                          "start_date": { "type": "string", "format": "date" },
                          "end_date": { "type": "string", "format": "date" },
                          "created_by": {
                            "type": "object",
                            "properties": {
                              "id": { "type": "integer" },
                              "name": { "type": "string" },
                              "avatar": { "type": "string", "format": "uri" }
                            }
                          },
                          "tags": { "type": "array", "items": { "type": "string" } }
                        }
                      }
                    },
                    "total": { "type": "integer" }
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "创建赛事",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name", "start_date", "end_date"],
                "properties": {
                  "name": { "type": "string", "description": "赛事名称" },
                  "description": { "type": "string", "description": "赛事描述" },
                  "cover_image": { "type": "string", "format": "uri" },
                  "prize": { "type": "number" },
                  "start_date": { "type": "string", "format": "date" },
                  "end_date": { "type": "string", "format": "date" },
                  "status": { "type": "string", "enum": ["draft", "active"], "default": "draft" },
                  "tags": { "type": "array", "items": { "type": "string" } }
                }
              }
            }
          }
        }
      }
    },
    "/api/competitions/{id}": {
      "get": { "summary": "获取赛事详情" },
      "put": { "summary": "更新赛事" },
      "delete": { "summary": "删除赛事" }
    }
  }
}
```

### 解析后的结构化数据

```jsonc
// API 解析器输出
{
  "resources": [
    {
      "name": "competition",
      "displayName": "赛事",
      "basePath": "/api/competitions",
      "operations": {
        "list":   { "method": "GET",    "path": "/api/competitions",      "hasSearch": true, "hasFilter": true, "hasPagination": true },
        "detail": { "method": "GET",    "path": "/api/competitions/{id}" },
        "create": { "method": "POST",   "path": "/api/competitions" },
        "update": { "method": "PUT",    "path": "/api/competitions/{id}" },
        "delete": { "method": "DELETE", "path": "/api/competitions/{id}" }
      },
      "fields": [
        { "name": "id",          "type": "number",       "display": true,  "input": false, "label": "ID" },
        { "name": "name",        "type": "string",       "display": true,  "input": true,  "required": true, "label": "赛事名称" },
        { "name": "description", "type": "string:long",  "display": true,  "input": true,  "label": "赛事描述" },
        { "name": "status",      "type": "string:enum",  "display": true,  "input": true,  "options": ["draft", "active", "ended"], "label": "状态" },
        { "name": "cover_image", "type": "string:image", "display": true,  "input": true,  "label": "封面图" },
        { "name": "prize",       "type": "number",       "display": true,  "input": true,  "label": "奖金" },
        { "name": "start_date",  "type": "date",         "display": true,  "input": true,  "required": true, "label": "开始日期" },
        { "name": "end_date",    "type": "date",         "display": true,  "input": true,  "required": true, "label": "结束日期" },
        { "name": "created_by",  "type": "object:user",  "display": true,  "input": false, "label": "创建者" },
        { "name": "tags",        "type": "array:string", "display": true,  "input": true,  "label": "标签" }
      ],
      "queryParams": [
        { "name": "status",  "type": "string:enum", "options": ["draft", "active", "ended"], "label": "状态筛选" },
        { "name": "keyword", "type": "string",      "label": "关键词搜索" }
      ]
    }
  ]
}
```

### 输入 2: TaskCase (产品用例)

产品提供的结构化用例描述：

```jsonc
{
  "taskCase": {
    "id": "TC-001",
    "name": "赛事管理",
    "description": "管理员可以管理赛事的完整生命周期",
    "resource": "competition",
    "pages": [
      {
        "name": "赛事列表页",
        "intent": "list",
        "userStories": [
          "管理员可以查看所有赛事列表",
          "管理员可以按状态筛选赛事",
          "管理员可以搜索赛事",
          "管理员可以创建新赛事",
          "管理员可以编辑赛事信息",
          "管理员可以删除赛事"
        ],
        "requiredActions": ["list", "search", "filter", "create", "edit", "delete"]
      },
      {
        "name": "赛事详情页",
        "intent": "detail",
        "userStories": [
          "用户可以查看赛事详细信息",
          "用户可以查看赛事时间和奖金",
          "用户可以查看赛事标签"
        ],
        "requiredActions": ["detail"]
      }
    ]
  }
}
```

## 生成流程

### Step 1: 解析 API

```
Swagger/OpenAPI spec
    │
    ▼
API 解析器 (api-parser.ts)
    │
    ├── 识别资源: competition
    ├── 识别操作: GET list, GET detail, POST create, PUT update, DELETE
    ├── 提取字段: name(string), status(enum), prize(number)...
    ├── 提取查询参数: status(enum), keyword(string)
    └── 输出: 结构化 API Schema
```

### Step 2: 解析 TaskCase

```
TaskCase JSON
    │
    ▼
TaskCase 解析器 (taskcase-parser.ts)
    │
    ├── 识别页面: 赛事列表页, 赛事详情页
    ├── 识别意图: list, detail
    ├── 提取操作: list + search + filter + create + edit + delete
    └── 输出: 页面意图列表
```

### Step 3: 匹配组件

```
API Schema + 页面意图 + component-api-mapping.json
    │
    ▼
映射引擎 (mapping-engine.ts)
    │
    ├── 页面意图 = "list" + 操作 = CRUD
    │   └── 匹配模式: CRUD 复合模式
    │       ├── 主体: NDataTable (GET /list)
    │       ├── 工具栏: NInputGroup (search) + NCombobox (filter) + NButton (新建)
    │       ├── 创建弹窗: NDialog + 表单字段
    │       ├── 编辑面板: NSheet + 表单字段
    │       ├── 删除确认: NDialog
    │       └── 行操作: NDropdownMenu (编辑/删除)
    │
    ├── 字段 "name" (string) + display
    │   └── NDataTable column: NText
    │
    ├── 字段 "status" (string:enum) + display
    │   └── NDataTable column: NBadge
    │
    ├── 字段 "name" (string) + input
    │   └── 创建/编辑表单: NInput
    │
    ├── 字段 "status" (string:enum) + input
    │   └── 创建/编辑表单: NCombobox
    │
    └── 输出: 组件选择结果
```

### Step 4: 生成 Page Schema

```
组件选择结果
    │
    ▼
页面组装器 (page-assembler.ts)
    │
    ├── 选择布局模板: CRUD list layout
    ├── 填充组件
    ├── 绑定 API 数据源
    ├── 设置默认 Props (从映射规则 + Design Token)
    └── 输出: Page Schema JSON
```

### 生成结果示例

以"赛事管理列表页"为例，系统自动生成的 Page Schema：

```jsonc
{
  "version": "1.0.0",
  "page": {
    "id": "auto-competition-list",
    "name": "赛事管理",
    "generatedFrom": {
      "api": "/api/competitions",
      "taskCase": "TC-001"
    }
  },
  "dataSources": {
    "competitionList": {
      "api": "GET /api/competitions",
      "params": { "page": 1, "status": null, "keyword": null }
    }
  },
  "tree": [
    {
      "id": "page-root",
      "component": "NResizable",
      "props": { "minWidth": 928 },
      "children": [
        {
          "id": "toolbar",
          "component": "NInputGroup",
          "props": { "layout": "horizontal", "gap": "md" },
          "children": [
            {
              "id": "search-input",
              "component": "NInput",
              "props": { "placeholder": "搜索赛事...", "size": "md" },
              "binding": { "onChange": { "target": "competitionList.params.keyword" } }
            },
            {
              "id": "status-filter",
              "component": "NCombobox",
              "props": {
                "placeholder": "状态筛选",
                "options": [
                  { "label": "草稿", "value": "draft" },
                  { "label": "进行中", "value": "active" },
                  { "label": "已结束", "value": "ended" }
                ]
              },
              "binding": { "onChange": { "target": "competitionList.params.status" } }
            },
            {
              "id": "create-btn",
              "component": "NButton",
              "props": { "label": "创建赛事", "variant": "capsule", "color": "blue" },
              "binding": { "onClick": { "action": "openDialog", "target": "create-dialog" } }
            }
          ]
        },
        {
          "id": "data-table",
          "component": "NDataTable",
          "props": {},
          "binding": {
            "dataSource": "competitionList",
            "columns": [
              { "field": "name",       "header": "赛事名称", "component": "NText" },
              { "field": "status",     "header": "状态",     "component": "NBadge",  "colorMap": { "draft": "yellow", "active": "lime", "ended": "gray-07" } },
              { "field": "prize",      "header": "奖金",     "component": "NText",   "format": "currency" },
              { "field": "start_date", "header": "开始日期", "component": "NText",   "format": "date" },
              { "field": "end_date",   "header": "结束日期", "component": "NText",   "format": "date" },
              { "field": "created_by", "header": "创建者",   "component": "NAvatar", "props": { "withName": true } },
              { "field": "tags",       "header": "标签",     "component": "NBadge",  "multiple": true }
            ],
            "rowActions": {
              "component": "NDropdownMenu",
              "items": [
                { "label": "编辑", "action": "openSheet", "target": "edit-sheet" },
                { "label": "删除", "action": "openDialog", "target": "delete-dialog", "variant": "destructive" }
              ]
            }
          }
        },
        {
          "id": "create-dialog",
          "component": "NDialog",
          "props": { "title": "创建赛事" },
          "binding": { "onSubmit": { "api": "POST /api/competitions" } },
          "children": [
            { "id": "f-name",        "component": "NInput",    "props": { "label": "赛事名称", "required": true },  "binding": { "field": "name" } },
            { "id": "f-desc",        "component": "NTextarea", "props": { "label": "赛事描述" },                    "binding": { "field": "description" } },
            { "id": "f-status",      "component": "NCombobox", "props": { "label": "状态", "options": ["draft", "active"] }, "binding": { "field": "status" } },
            { "id": "f-prize",       "component": "NInput",    "props": { "label": "奖金", "type": "number" },      "binding": { "field": "prize" } },
            { "id": "f-start",       "component": "NCalendar", "props": { "label": "开始日期", "mode": "picker", "required": true }, "binding": { "field": "start_date" } },
            { "id": "f-end",         "component": "NCalendar", "props": { "label": "结束日期", "mode": "picker", "required": true }, "binding": { "field": "end_date" } },
            { "id": "f-tags",        "component": "NCombobox", "props": { "label": "标签", "multiple": true },      "binding": { "field": "tags" } },
            { "id": "f-submit",      "component": "NButton",   "props": { "label": "创建", "color": "blue" } }
          ]
        },
        {
          "id": "edit-sheet",
          "component": "NSheet",
          "props": { "title": "编辑赛事", "width": "396px" },
          "binding": { "onSubmit": { "api": "PUT /api/competitions/{id}" }, "prefill": { "api": "GET /api/competitions/{id}" } },
          "children": [
            { "id": "e-name",   "component": "NInput",    "props": { "label": "赛事名称" },   "binding": { "field": "name" } },
            { "id": "e-desc",   "component": "NTextarea", "props": { "label": "赛事描述" },   "binding": { "field": "description" } },
            { "id": "e-status", "component": "NCombobox", "props": { "label": "状态" },       "binding": { "field": "status" } },
            { "id": "e-submit", "component": "NButton",   "props": { "label": "保存", "color": "blue" } }
          ]
        },
        {
          "id": "delete-dialog",
          "component": "NDialog",
          "props": { "title": "确认删除", "variant": "destructive" },
          "binding": { "onConfirm": { "api": "DELETE /api/competitions/{id}" } },
          "children": [
            { "id": "d-text",    "component": "NText",   "props": { "content": "确定要删除这个赛事吗？此操作不可撤销。" } },
            { "id": "d-cancel",  "component": "NButton", "props": { "label": "取消", "variant": "capsule" } },
            { "id": "d-confirm", "component": "NButton", "props": { "label": "删除", "color": "pink" } }
          ]
        }
      ]
    }
  ]
}
```

## Page Schema 中的数据绑定协议

### binding 字段定义

```jsonc
{
  "binding": {
    // 数据源绑定 — 组件从哪个 API 获取数据
    "dataSource": "competitionList",

    // 字段绑定 — 表单输入绑定到 request body 的哪个字段
    "field": "name",

    // 变更绑定 — 输入变化时更新哪个参数
    "onChange": { "target": "competitionList.params.keyword" },

    // 点击绑定 — 点击时触发什么动作
    "onClick": { "action": "openDialog", "target": "create-dialog" },

    // 提交绑定 — 表单提交时调用哪个 API
    "onSubmit": { "api": "POST /api/competitions" },

    // 确认绑定 — 确认操作时调用哪个 API
    "onConfirm": { "api": "DELETE /api/competitions/{id}" },

    // 预填绑定 — 编辑时从哪个 API 获取现有数据
    "prefill": { "api": "GET /api/competitions/{id}" }
  }
}
```

## 验收标准

| # | 标准 |
|---|------|
| 1 | 输入一份标准 Swagger spec + TaskCase，5 秒内输出完整 Page Schema |
| 2 | 生成的 CRUD 列表页包含：表格、搜索、过滤、新建弹窗、编辑面板、删除确认 |
| 3 | 所有字段正确映射到对应组件 (string→NInput, enum→NCombobox, date→NCalendar) |
| 4 | 数据绑定正确：表格绑定 GET、表单绑定 POST/PUT、确认绑定 DELETE |
| 5 | 生成的 Page Schema 可直接在拖拉拽编辑器中打开和渲染 |
| 6 | 支持 CRUD 和 Dashboard 两种复合模式 |

## 任务拆解

| 优先级 | 任务 |
|--------|------|
| P0 | API 解析器 (Swagger/OpenAPI → 结构化数据) |
| P0 | TaskCase 解析器 (JSON → 页面意图) |
| P0 | 映射引擎 (API Schema + 映射规则 → 组件选择) |
| P0 | 页面组装器 (组件选择 → Page Schema) |
| P0 | Page Schema 格式定义 (含 dataSources + binding) |
| P1 | CRUD 复合模式模板 |
| P1 | Dashboard 复合模式模板 |
| P1 | 数据绑定校验器 |
| P2 | 支持更多 API 模式 (批量操作, 导入导出等) |
| P2 | 生成结果评分/质量检测 |
