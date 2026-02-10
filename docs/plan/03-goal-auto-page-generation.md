# 目标 3: AI 驱动的页面自动生成

> 用户提供任意格式的 API 列表和 TaskCase，AI 理解其内容，参考组件-接口映射规则，自动生成 Page Schema

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
输入 (任意格式):
  1. API 列表          ← 后端提供 (Swagger、Postman、文本文档、表格、口头描述均可)
  2. TaskCase / 需求   ← 产品提供 (PRD、用户故事、流程图、文字描述均可)

处理 (AI 驱动):
  3. AI 阅读并理解 API 列表 → 识别资源、接口、字段、类型
  4. AI 阅读并理解 TaskCase → 识别页面意图、用户流程
  5. AI 参考 component-api-mapping 规则 → 选择合适的组件
  6. AI 生成 Page Schema JSON → 包含组件树 + 数据绑定

输出:
  7. 完整的 Page Schema JSON → 在拖拉拽编辑器中渲染，用户进行可视化调整
```

### 为什么用 AI 而不是确定性解析器

| 对比维度 | 确定性解析器 | AI 驱动 (我们的方案) |
|---------|------------|-------------------|
| 输入格式 | 必须是标准 Swagger/OpenAPI | 任意格式: 文档、表格、文字描述 |
| TaskCase 格式 | 必须是结构化 JSON | 任意格式: PRD、用户故事、流程图 |
| 理解深度 | 只能做模式匹配 | 理解语义和业务上下文 |
| 字段类型判断 | 依赖 schema 中的 type 标注 | 能从字段名推断 (如 "avatar" → 图片, "status" → 枚举) |
| 页面意图识别 | 依赖预定义模式 | 能理解"管理员需要批量审核"这类语义需求 |
| 扩展性 | 每种新格式需要写新解析器 | 天然支持任何新格式 |
| 开发成本 | 需要开发多个解析器 | 只需维护 Prompt + 映射规则 |

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AI 驱动的页面生成系统                                  │
│                                                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────────────────────┐  │
│  │ 用户输入     │   │ 用户输入     │   │ 系统内置 (AI 参考资料)         │  │
│  │             │   │             │   │                               │  │
│  │ API 列表    │   │ TaskCase    │   │ component-api-mapping.json   │  │
│  │ (任意格式)  │   │ (任意格式)  │   │ component-manifest.json      │  │
│  │             │   │             │   │ composition-rules.json        │  │
│  │ · Swagger   │   │ · PRD 文档  │   │ Page Schema 格式定义          │  │
│  │ · Postman   │   │ · 用户故事  │   │ Design Token 约束             │  │
│  │ · 文本/表格 │   │ · 流程图    │   │                               │  │
│  │ · cURL 集合 │   │ · 文字描述  │   │                               │  │
│  └──────┬──────┘   └──────┬──────┘   └───────────────┬───────────────┘  │
│         │                 │                           │                  │
│         └────────────┬────┘───────────────────────────┘                  │
│                      ▼                                                   │
│         ┌────────────────────────┐                                       │
│         │         AI             │                                       │
│         │                        │                                       │
│         │  1. 阅读 API 列表      │                                       │
│         │     → 理解资源/接口/   │                                       │
│         │       字段/数据类型    │                                       │
│         │                        │                                       │
│         │  2. 阅读 TaskCase      │                                       │
│         │     → 理解页面意图/    │                                       │
│         │       用户流程/操作    │                                       │
│         │                        │                                       │
│         │  3. 参考映射规则       │                                       │
│         │     → 按字段类型选组件 │                                       │
│         │     → 按 API 模式选   │                                       │
│         │       页面模板         │                                       │
│         │                        │                                       │
│         │  4. 生成 Page Schema   │                                       │
│         │     → 组件树 + 数据绑定│                                       │
│         │     → 遵守 Token 约束  │                                       │
│         └────────────┬───────────┘                                       │
│                      ▼                                                   │
│         ┌────────────────────────┐                                       │
│         │     Page Schema JSON   │ → 输出到拖拉拽编辑器 (目标 4)          │
│         └────────────────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## AI 的输入与上下文

### 输入 1: API 列表 (任意格式)

AI 不要求固定格式，以下均可：

**示例 A — Swagger/OpenAPI spec:**
```jsonc
{
  "paths": {
    "/api/competitions": {
      "get": { "summary": "获取赛事列表", "parameters": [...], "responses": {...} },
      "post": { "summary": "创建赛事", "requestBody": {...} }
    },
    "/api/competitions/{id}": {
      "get": { "summary": "获取赛事详情" },
      "put": { "summary": "更新赛事" },
      "delete": { "summary": "删除赛事" }
    }
  }
}
```

**示例 B — Postman Collection 导出:**
```
赛事管理 API
├── GET  /api/competitions       获取赛事列表 (支持分页、状态筛选、关键词搜索)
├── POST /api/competitions       创建赛事
├── GET  /api/competitions/:id   获取赛事详情
├── PUT  /api/competitions/:id   更新赛事
└── DELETE /api/competitions/:id  删除赛事
```

**示例 C — 文字描述:**
```
后端有一组赛事管理的接口:
- 赛事列表，可以按状态筛选，支持搜索
- 创建赛事 (名称、描述、封面图、奖金、开始/结束日期、状态、标签)
- 编辑赛事
- 删除赛事
- 赛事详情

每个赛事有: id, 名称, 描述, 状态(草稿/进行中/已结束), 封面图, 奖金, 开始日期, 结束日期, 创建者(头像+名字), 标签列表
```

**以上三种格式，AI 都能理解并生成相同质量的 Page Schema。**

### 输入 2: TaskCase (任意格式)

**示例 A — 结构化 JSON:**
```jsonc
{
  "taskCase": {
    "name": "赛事管理",
    "pages": [
      { "name": "赛事列表页", "intent": "list", "requiredActions": ["list", "search", "filter", "create", "edit", "delete"] },
      { "name": "赛事详情页", "intent": "detail" }
    ]
  }
}
```

**示例 B — PRD 文档片段:**
```
## 赛事管理模块

管理员可以管理赛事的完整生命周期：
- 查看所有赛事列表，可以按状态筛选，可以搜索
- 点击"新建"按钮，弹窗填写赛事信息后创建
- 每行有操作菜单，可以编辑赛事或删除赛事
- 点击赛事名称进入详情页查看完整信息
```

**示例 C — 一句话描述:**
```
帮我生成一个赛事管理的 CRUD 页面
```

**AI 能从简到繁理解各种级别的需求描述。**

### AI 的参考资料 (系统内置)

AI 在生成时自动参考以下文件，用户无需关心：

| 文件 | 作用 |
|------|------|
| `component-api-mapping.json` | 字段类型 → 组件的映射规则，API 模式 → 页面模板 |
| `component-manifest.json` | 53 个可用组件清单，含 Props、插槽、嵌套约束 |
| `composition-rules.json` | 组件嵌套规则 (哪些组件可以放在哪些容器内) |
| `Page Schema 格式定义` | 输出的 JSON 格式标准 |
| `Design Tokens` | 确保使用 Token key 而非硬编码色值 |

### AI Prompt 结构

```
┌─────────────────────────────────────────────────────────────────────┐
│ System Prompt                                                       │
│                                                                     │
│ 你是 neuron-ui 页面生成助手。                                        │
│ 你的任务是根据用户提供的 API 列表和 TaskCase，                        │
│ 生成符合规范的 Page Schema JSON。                                    │
│                                                                     │
│ 参考以下规则:                                                        │
│ 1. component-api-mapping.json  (字段→组件映射)                       │
│ 2. component-manifest.json     (组件清单)                            │
│ 3. composition-rules.json      (嵌套约束)                            │
│ 4. Page Schema 格式            (输出标准)                            │
│ 5. Design Tokens               (样式约束)                            │
│                                                                     │
│ 输出要求:                                                            │
│ - 输出标准 Page Schema JSON                                          │
│ - props 中只使用 Token key, 不使用原始色值                            │
│ - 所有数据绑定必须完整 (dataSource, field, onChange, onClick...)      │
│ - 遵守 composition-rules 的嵌套约束                                  │
├─────────────────────────────────────────────────────────────────────┤
│ User Prompt                                                         │
│                                                                     │
│ API 列表:                                                            │
│ {用户提供的任意格式 API 信息}                                         │
│                                                                     │
│ TaskCase / 需求:                                                     │
│ {用户提供的任意格式需求描述}                                           │
├─────────────────────────────────────────────────────────────────────┤
│ AI Output                                                           │
│                                                                     │
│ {标准 Page Schema JSON}                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## AI 的生成逻辑 (内化的决策过程)

AI 在生成 Page Schema 时，内部遵循以下逻辑:

### Step 1: 理解 API

```
AI 阅读 API 列表 (无论何种格式)
    │
    ├── 识别资源: competition (赛事)
    ├── 识别操作: GET list, GET detail, POST create, PUT update, DELETE
    ├── 推断字段: name(string), status(enum: draft/active/ended), prize(number)...
    ├── 推断查询参数: status(筛选), keyword(搜索)
    └── 判断: 同一资源有完整 CRUD → 应用 CRUD 复合模式
```

### Step 2: 理解 TaskCase

```
AI 阅读 TaskCase (无论何种格式)
    │
    ├── 识别页面: 赛事列表页, 赛事详情页
    ├── 识别意图: 管理员管理赛事完整生命周期
    ├── 提取操作: 查看列表 + 筛选 + 搜索 + 创建 + 编辑 + 删除
    └── 理解优先级: 列表页是主页面, 详情页是辅助页面
```

### Step 3: 参考映射规则选择组件

```
AI 查阅 component-api-mapping.json
    │
    ├── CRUD 复合模式 → 页面模板:
    │   ├── 主体: NDataTable + NPagination
    │   ├── 工具栏: NButton(新建) + NInputGroup(搜索)
    │   ├── 创建: NDialog + NField[]
    │   ├── 编辑: NSheet + NField[]
    │   ├── 删除: NAlertDialog
    │   └── 行操作: NDropdownMenu
    │
    ├── 字段 → 展示组件 (表格列):
    │   ├── name (string)        → NText
    │   ├── status (string:enum) → NBadge
    │   ├── prize (number)       → NText (format: currency)
    │   ├── start_date (date)    → NText (format: date)
    │   ├── created_by (object:user) → NAvatar + NText
    │   └── tags (array:string)  → NBadge (multiple)
    │
    └── 字段 → 输入组件 (表单):
        ├── name (string)        → NInput
        ├── description (string:long) → NTextarea
        ├── status (string:enum, 3 选项) → NSelect
        ├── prize (number)       → NInput (type: number)
        ├── start_date (date)    → NDatePicker
        └── tags (array:string)  → NCombobox (multiple)
```

### Step 4: 生成 Page Schema

AI 输出完整的 Page Schema JSON (见下文示例)。

## 生成结果示例

以"赛事管理列表页"为例，AI 自动生成的 Page Schema：

```jsonc
{
  "version": "1.0.0",
  "page": {
    "id": "auto-competition-list",
    "name": "赛事管理",
    "generatedBy": "AI",
    "generatedFrom": {
      "apiResource": "competition",
      "taskCase": "赛事管理 CRUD"
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
              "component": "NSelect",
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
            { "id": "f-name",   "component": "NField", "children": [{ "component": "NInput",      "props": { "label": "赛事名称", "required": true } }], "binding": { "field": "name" } },
            { "id": "f-desc",   "component": "NField", "children": [{ "component": "NTextarea",   "props": { "label": "赛事描述" } }],                    "binding": { "field": "description" } },
            { "id": "f-status", "component": "NField", "children": [{ "component": "NSelect",     "props": { "label": "状态", "options": ["draft", "active"] } }], "binding": { "field": "status" } },
            { "id": "f-prize",  "component": "NField", "children": [{ "component": "NInput",      "props": { "label": "奖金", "type": "number" } }],      "binding": { "field": "prize" } },
            { "id": "f-start",  "component": "NField", "children": [{ "component": "NDatePicker", "props": { "label": "开始日期", "required": true } }],   "binding": { "field": "start_date" } },
            { "id": "f-end",    "component": "NField", "children": [{ "component": "NDatePicker", "props": { "label": "结束日期", "required": true } }],   "binding": { "field": "end_date" } },
            { "id": "f-tags",   "component": "NField", "children": [{ "component": "NCombobox",   "props": { "label": "标签", "multiple": true } }],       "binding": { "field": "tags" } },
            { "id": "f-submit", "component": "NButton", "props": { "label": "创建", "color": "blue" } }
          ]
        },
        {
          "id": "edit-sheet",
          "component": "NSheet",
          "props": { "title": "编辑赛事", "width": "396px" },
          "binding": { "onSubmit": { "api": "PUT /api/competitions/{id}" }, "prefill": { "api": "GET /api/competitions/{id}" } },
          "children": [
            { "id": "e-name",   "component": "NField", "children": [{ "component": "NInput",    "props": { "label": "赛事名称" } }],   "binding": { "field": "name" } },
            { "id": "e-desc",   "component": "NField", "children": [{ "component": "NTextarea", "props": { "label": "赛事描述" } }],   "binding": { "field": "description" } },
            { "id": "e-status", "component": "NField", "children": [{ "component": "NSelect",   "props": { "label": "状态" } }],       "binding": { "field": "status" } },
            { "id": "e-submit", "component": "NButton", "props": { "label": "保存", "color": "blue" } }
          ]
        },
        {
          "id": "delete-dialog",
          "component": "NAlertDialog",
          "props": { "title": "确认删除" },
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

## 用户使用流程

```
用户操作:

1. 打开页面生成器 (page-builder 中的生成入口)
2. 粘贴/上传 API 列表 (任意格式)
3. 输入 TaskCase / 需求描述 (任意格式)
4. 点击 "生成页面"
5. AI 生成 Page Schema → 自动加载到编辑器画布
6. 用户在编辑器中可视化调整 (目标 4)
7. 预览 → 发布

整个过程用户无需:
- 将 API 转换为 Swagger 格式
- 将需求转换为结构化 JSON
- 手动选择组件
- 手动配置数据绑定
```

## @neuron-ui/generator 包的职责

generator 包不再是确定性解析引擎，而是 **AI 调用编排层**:

```
@neuron-ui/generator/
├── src/
│   ├── index.ts              # 导出生成 API
│   ├── generate.ts           # 核心: 调用 AI API 生成 Page Schema
│   ├── prompts/
│   │   ├── system-prompt.ts  # System Prompt 模板 (注入映射规则等)
│   │   └── examples/         # Few-shot 示例 (帮助 AI 理解输出格式)
│   │       ├── crud-example.json
│   │       ├── dashboard-example.json
│   │       └── detail-example.json
│   ├── context/
│   │   ├── load-mapping.ts   # 加载 component-api-mapping.json
│   │   ├── load-manifest.ts  # 加载 component-manifest.json
│   │   ├── load-rules.ts     # 加载 composition-rules.json
│   │   └── load-tokens.ts    # 加载 Design Token 约束
│   ├── validator/
│   │   ├── schema-validator.ts    # 校验 AI 输出的 Page Schema 是否合法
│   │   ├── binding-validator.ts   # 校验数据绑定是否完整
│   │   └── composition-validator.ts # 校验组件嵌套是否合规
│   └── types.ts              # TypeScript 类型
├── package.json
└── tsconfig.json
```

### 核心 API

```typescript
import { generatePage } from '@neuron-ui/generator'

const pageSchema = await generatePage({
  // 用户输入 (任意格式字符串)
  apiList: "... (用户粘贴的 API 信息)",
  taskCase: "... (用户输入的需求描述)",

  // 可选: 指定生成偏好
  preferences: {
    pageType: "crud",      // 可选: crud | dashboard | detail | auto (默认)
    formContainer: "dialog", // 可选: dialog | sheet | drawer | auto (默认)
  }
})

// pageSchema 是校验过的标准 Page Schema JSON
// 直接交给 page-builder 的编辑器加载
```

### 生成流程

```
generatePage() 调用流程:

1. 加载上下文
   ├── component-api-mapping.json
   ├── component-manifest.json
   ├── composition-rules.json
   └── Design Tokens

2. 构建 Prompt
   ├── System Prompt (规则 + 约束 + 格式要求)
   ├── Few-shot 示例 (2-3 个高质量示例)
   └── User Prompt (API 列表 + TaskCase)

3. 调用 AI API
   └── 发送 Prompt → 获取 Page Schema JSON

4. 校验输出
   ├── JSON 格式校验
   ├── Page Schema 结构校验
   ├── 组件嵌套合规校验
   ├── 数据绑定完整性校验
   └── Token 使用合规校验

5. 校验失败?
   ├── 自动修复 (常见问题)
   └── 重试 (最多 2 次)

6. 返回 Page Schema
```

## 验收标准

| # | 标准 |
|---|------|
| 1 | 支持任意格式的 API 列表输入 (Swagger, Postman, 文字描述等) |
| 2 | 支持任意格式的 TaskCase 输入 (JSON, PRD, 一句话描述等) |
| 3 | 生成的 CRUD 列表页包含：表格、搜索、过滤、新建弹窗、编辑面板、删除确认 |
| 4 | 所有字段正确映射到对应组件 (AI 参考 component-api-mapping 规则) |
| 5 | 数据绑定正确：表格绑定 GET、表单绑定 POST/PUT、确认绑定 DELETE |
| 6 | 生成的 Page Schema 通过格式校验 + 嵌套规则校验 + Token 合规校验 |
| 7 | 生成的 Page Schema 可直接在拖拉拽编辑器中打开和渲染 |
| 8 | 支持 CRUD、Dashboard、Detail-with-tabs 三种复合模式 |

## 任务拆解

| 优先级 | 任务 |
|--------|------|
| P0 | 设计 AI System Prompt (注入映射规则 + 组件清单 + 格式要求) |
| P0 | 准备 Few-shot 示例 (CRUD / Dashboard / Detail 各一个) |
| P0 | 实现 generatePage() 核心调用逻辑 |
| P0 | Page Schema 格式定义 (含 dataSources + binding 协议) |
| P1 | Page Schema 校验器 (格式 + 嵌套 + 绑定 + Token) |
| P1 | 生成偏好支持 (页面类型、表单容器选择) |
| P1 | 自动修复 + 重试机制 |
| P2 | 生成质量评分 (对比映射规则的匹配度) |
| P2 | 支持增量生成 (在已有 Page Schema 基础上添加页面/组件) |
| P2 | 生成历史记录与版本对比 |
