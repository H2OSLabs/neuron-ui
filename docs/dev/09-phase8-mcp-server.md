# Phase 8: MCP Server (@neuron-ui/mcp-server)

> 将 neuron-ui 的全部 AI 能力封装为标准化 MCP 服务，任何 MCP 兼容的 AI 助手都能直接消费。

---

## 定位

```
现状: neuron-ui 的 AI 能力分散在多个包中
  @neuron-ui/generator  → 页面生成 API
  @neuron-ui/metadata   → 组件清单、映射规则、校验器
  @neuron-ui/runtime    → Catalog (Zod schema + prompt 生成)
  @neuron-ui/codegen    → 代码生成 CLI
  @neuron-ui/tokens     → Design Token

问题:
  1. 外部 AI 工具无法直接消费这些能力 (需手动复制到 prompt)
  2. 每次 Skill 更新需手动同步 .claude/skills/ 中的参考文件
  3. 不同 AI 客户端 (Claude, Cursor, Windsurf, Copilot) 需要各自适配

方案: MCP Server — 标准化服务接口
  ┌────────────────────────────────────────────────────────────┐
  │                   @neuron-ui/mcp-server                     │
  │                                                            │
  │  统一封装 metadata + generator + runtime + codegen + tokens  │
  │  暴露为 MCP Tools / Resources / Prompts                     │
  │                                                            │
  │  任何 MCP 客户端 → 标准协议调用 → 获得 neuron-ui 全部能力    │
  └────────────────────────────────────────────────────────────┘
```

**核心价值:**

| 维度 | 现在 (Skills 方式) | MCP Server 方式 |
|------|-------------------|----------------|
| AI 客户端支持 | 仅 Claude Code | Claude / Cursor / Windsurf / 任何 MCP 客户端 |
| 知识同步 | 手动复制 JSON 到 skill markdown | 服务端实时读取，永远最新 |
| 能力边界 | 只能提供参考信息，执行在客户端 | 服务端直接执行生成/校验/codegen |
| 交互模式 | 单轮 (prompt → 输出) | 多轮工具调用，组合使用 |
| 扩展性 | 每增加能力需新建 skill | 新增 Tool 即可，客户端自动发现 |

---

## 依赖

```
Phase 2 核心组件完成 (至少 P0-P2 批次)   → 组件库可渲染
Phase 3 完成 (metadata JSON 文件就绪)     → 映射规则、组件清单、校验器
Phase 7A 完成 (runtime Catalog)           → Zod schema + catalog.prompt()
Phase 7B 完成 (codegen CLI)               → 代码生成能力
```

> 可与 Phase 4 (generator) 并行开发: 先暴露 metadata 类 Tools，generator 完成后再接入生成类 Tools。

---

## 系统架构

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        @neuron-ui/mcp-server                              │
│                                                                          │
│  ┌──────────────── MCP Protocol Layer ──────────────────────────────┐    │
│  │                                                                   │    │
│  │  Transport: stdio (CLI) / Streamable HTTP (远程)                  │    │
│  │  Protocol:  JSON-RPC 2.0 over MCP                                │    │
│  │                                                                   │    │
│  └───────────────────────────┬───────────────────────────────────────┘    │
│                              │                                            │
│  ┌──────────── Tool Handlers ┼──────────────────────────────────────┐    │
│  │                           │                                       │    │
│  │  ┌─────────────────┐ ┌──────────────────┐ ┌───────────────────┐  │    │
│  │  │ Metadata Tools  │ │ Generation Tools │ │ Codegen Tools     │  │    │
│  │  │                 │ │                  │ │                   │  │    │
│  │  │ list_components │ │ analyze_api      │ │ generate_code     │  │    │
│  │  │ get_component   │ │ generate_page    │ │ preview_code      │  │    │
│  │  │ get_mapping     │ │ validate_schema  │ │                   │  │    │
│  │  │ get_composition │ │ suggest_component│ │                   │  │    │
│  │  │ get_tokens      │ │                  │ │                   │  │    │
│  │  └────────┬────────┘ └────────┬─────────┘ └─────────┬─────────┘  │    │
│  │           │                   │                      │            │    │
│  └───────────┼───────────────────┼──────────────────────┼────────────┘    │
│              │                   │                      │                  │
│  ┌───────────┼───────────────────┼──────────────────────┼────────────┐    │
│  │           ▼                   ▼                      ▼            │    │
│  │  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐   │    │
│  │  │ @neuron-ui/  │  │ @neuron-ui/      │  │ @neuron-ui/       │   │    │
│  │  │ metadata     │  │ generator        │  │ codegen           │   │    │
│  │  │              │  │                  │  │                   │   │    │
│  │  │ manifest     │  │ generatePage()   │  │ generate()        │   │    │
│  │  │ mapping      │  │ validateSchema() │  │ update()          │   │    │
│  │  │ rules        │  │                  │  │                   │   │    │
│  │  │ schemas      │  │                  │  │                   │   │    │
│  │  └──────────────┘  └──────────────────┘  └───────────────────┘   │    │
│  │          ▲                   ▲                                    │    │
│  │  ┌───────┴───────┐  ┌───────┴────────┐                          │    │
│  │  │ @neuron-ui/   │  │ @neuron-ui/    │                          │    │
│  │  │ tokens        │  │ runtime        │                          │    │
│  │  │               │  │                │                          │    │
│  │  │ Token values  │  │ neuronCatalog  │                          │    │
│  │  │               │  │ .prompt()      │                          │    │
│  │  │               │  │ .validate()    │                          │    │
│  │  └───────────────┘  └────────────────┘                          │    │
│  │                                                                  │    │
│  │  ══════════ neuron-ui Internal Packages ═══════════════════════  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────── Resource Providers ──────────────────────────────────┐    │
│  │                                                                   │    │
│  │  neuron://metadata/component-manifest                             │    │
│  │  neuron://metadata/component-api-mapping                          │    │
│  │  neuron://metadata/composition-rules                              │    │
│  │  neuron://tokens/{category}                                       │    │
│  │  neuron://schemas/page-schema-spec                                │    │
│  │  neuron://examples/{name}                                         │    │
│  │  neuron://catalog/prompt                                          │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────── Prompt Templates ────────────────────────────────────┐    │
│  │                                                                   │    │
│  │  neuron-page-generation      → 页面生成完整 Prompt                 │    │
│  │  neuron-component-selection   → 组件选择辅助 Prompt                 │    │
│  │  neuron-schema-review         → Schema 审查改进 Prompt              │    │
│  │                                                                   │    │
│  └───────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 包目录结构

```
packages/mcp-server/
├── package.json               # @neuron-ui/mcp-server
├── tsconfig.json
├── vite.config.ts             # library mode (也可用 tsup)
│
├── bin/
│   └── neuron-mcp.ts          # CLI 入口 (#!/usr/bin/env node)
│                              # npx @neuron-ui/mcp-server
│
├── src/
│   ├── index.ts               # 编程方式导出 (createServer)
│   ├── server.ts              # MCP Server 主体 (创建 + 注册所有 handlers)
│   │
│   ├── tools/                 # MCP Tool 定义与实现
│   │   ├── index.ts           # 统一注册入口
│   │   │
│   │   ├── metadata/          # 元数据查询类 Tools
│   │   │   ├── list-components.ts      # 列出组件 (支持按分类/角色过滤)
│   │   │   ├── get-component.ts        # 获取单个组件详情
│   │   │   ├── get-mapping-rules.ts    # 获取字段→组件映射规则
│   │   │   ├── get-composition-rules.ts # 获取组件嵌套约束
│   │   │   └── get-tokens.ts           # 获取 Design Token 值
│   │   │
│   │   ├── generation/        # 生成类 Tools
│   │   │   ├── analyze-api.ts          # 分析任意格式 API 文档
│   │   │   ├── generate-page.ts        # 生成 Page Schema
│   │   │   ├── validate-schema.ts      # 校验 Page Schema
│   │   │   └── suggest-components.ts   # 为字段推荐组件
│   │   │
│   │   └── codegen/           # 代码生成类 Tools
│   │       ├── generate-code.ts        # Page Schema → .tsx 源码
│   │       └── preview-code.ts         # 预览生成代码 (dry-run)
│   │
│   ├── resources/             # MCP Resource 定义
│   │   ├── index.ts           # 统一注册入口
│   │   ├── metadata-resources.ts       # 组件清单/映射/规则
│   │   ├── token-resources.ts          # Design Token
│   │   ├── schema-resources.ts         # Page Schema 规格
│   │   └── example-resources.ts        # 示例 Page Schema
│   │
│   ├── prompts/               # MCP Prompt 模板
│   │   ├── index.ts           # 统一注册入口
│   │   ├── page-generation.ts          # 页面生成 Prompt
│   │   ├── component-selection.ts      # 组件选择 Prompt
│   │   └── schema-review.ts            # Schema 审查 Prompt
│   │
│   ├── loaders/               # 数据加载层 (读取 neuron-ui 内部包数据)
│   │   ├── metadata-loader.ts          # 加载 manifest/mapping/rules JSON
│   │   ├── token-loader.ts             # 加载 tokens.json
│   │   ├── catalog-loader.ts           # 加载 neuronCatalog (from runtime)
│   │   └── example-loader.ts           # 加载示例 Page Schema
│   │
│   └── types.ts               # TypeScript 类型定义
│
├── __tests__/
│   ├── tools/
│   │   ├── list-components.test.ts
│   │   ├── generate-page.test.ts
│   │   ├── validate-schema.test.ts
│   │   └── generate-code.test.ts
│   ├── resources/
│   │   └── metadata-resources.test.ts
│   └── server.test.ts         # 端到端服务测试
│
└── README.md                  # 使用文档
```

---

## 技术选型

| 技术 | 选择 | 理由 |
|------|------|------|
| MCP SDK | `@modelcontextprotocol/sdk` | Anthropic 官方 TypeScript SDK，MCP 协议标准实现 |
| Transport | stdio + Streamable HTTP | stdio 用于本地 CLI 集成; HTTP 用于远程部署 (page-builder 等) |
| 构建 | tsup | 适合 Node.js CLI 包，输出 ESM + CJS，零配置 |
| 运行时 | Node.js 18+ | MCP Server 是 Node 进程，不在浏览器运行 |
| 校验 | Zod | 复用 neuronCatalog 的 Zod schema |

---

## 8.1 MCP Tools 详细设计

### 8.1.1 元数据查询 Tools

#### `neuron_list_components`

列出所有可用组件，支持按分类和 API 角色过滤。

```typescript
// tools/metadata/list-components.ts
export const listComponentsTool = {
  name: 'neuron_list_components',
  description: '列出 neuron-ui 可用组件。可按分类 (display/input/action/container/feedback/navigation/layout) 或 API 角色 (GET/POST/PUT/DELETE) 过滤。',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['display', 'input', 'action', 'container', 'feedback', 'navigation', 'layout'],
        description: '按组件分类过滤',
      },
      apiRole: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        description: '按 API 角色过滤 (该组件适用于哪种 HTTP 方法)',
      },
    },
  },
}

// Handler 返回示例:
{
  total: 53,
  filtered: 15,
  components: [
    {
      name: 'NDataTable',
      displayName: '数据表格',
      category: 'display',
      apiRole: ['GET'],
      description: '数据表格，支持排序、分页、自定义列渲染',
      variants: ['default', 'compact', 'striped'],
      sizes: ['sm', 'md', 'lg'],
    },
    // ...
  ]
}
```

#### `neuron_get_component`

获取单个组件的完整详情，包括 Props Schema、变体、嵌套规则、示例。

```typescript
export const getComponentTool = {
  name: 'neuron_get_component',
  description: '获取指定 neuron-ui 组件的完整详情: Props 定义、变体、尺寸、可嵌套关系、使用示例。',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '组件名称 (N 前缀)，如 "NButton", "NDataTable"',
      },
    },
    required: ['name'],
  },
}

// Handler 返回示例:
{
  name: 'NButton',
  displayName: 'Button / 按钮',
  category: 'action',
  description: '按钮组件，支持胶囊/圆形/异形三种变体',
  props: {
    label: { type: 'string', required: true, description: '按钮文案' },
    variant: { type: 'enum', values: ['capsule', 'circle', 'custom'], default: 'capsule' },
    size: { type: 'enum', values: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' },
    color: { type: 'tokenRef', values: ['pink', 'yellow', 'lime', 'green', 'blue', 'purple', 'lavender'] },
    icon: { type: 'string', description: '图标名称 (lucide-react)' },
    iconPosition: { type: 'enum', values: ['left', 'right'], default: 'left' },
    disabled: { type: 'boolean', default: false },
  },
  canBeChildOf: ['NDialog', 'NCard', 'NSheet', 'NAlertDialog', 'NDrawer', 'NTabs'],
  canContain: [],
  pageSchemaExample: {
    id: 'btn-1',
    component: 'NButton',
    props: { label: '提交', variant: 'capsule', color: 'blue', size: 'md' },
    binding: { onClick: { action: 'submitForm', target: 'create-dialog' } },
  },
}
```

#### `neuron_get_mapping_rules`

获取字段类型到组件的映射规则，或 API 模式到页面模式的映射。

```typescript
export const getMappingRulesTool = {
  name: 'neuron_get_mapping_rules',
  description: '获取 neuron-ui 的字段类型→组件映射规则，或 API 模式→页面模式映射。用于理解什么类型的字段应该用什么组件展示/编辑。',
  inputSchema: {
    type: 'object',
    properties: {
      context: {
        type: 'string',
        enum: ['display', 'input', 'api-pattern', 'all'],
        default: 'all',
        description: 'display=GET 响应展示映射, input=POST/PUT 输入映射, api-pattern=API 模式→页面模式',
      },
      fieldType: {
        type: 'string',
        description: '过滤特定字段类型的映射规则，如 "string:enum", "boolean", "date"',
      },
    },
  },
}
```

#### `neuron_get_composition_rules`

获取组件嵌套/组合约束。

```typescript
export const getCompositionRulesTool = {
  name: 'neuron_get_composition_rules',
  description: '获取组件嵌套约束: 哪些组件可以放在哪些容器内，子组件数量限制等。',
  inputSchema: {
    type: 'object',
    properties: {
      parent: {
        type: 'string',
        description: '查询指定父组件的嵌套规则，如 "NDialog", "NCard"',
      },
    },
  },
}
```

#### `neuron_get_tokens`

获取 Design Token 值。

```typescript
export const getTokensTool = {
  name: 'neuron_get_tokens',
  description: '获取 neuron-ui Design Token 值: 颜色 (14 级暖灰 + 10 辅助色 + 3 语义色)、间距、圆角、字体。Page Schema 中只允许使用 Token key。',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['colors', 'spacing', 'radius', 'typography', 'all'],
        default: 'all',
        description: '获取指定分类的 Token',
      },
    },
  },
}
```

### 8.1.2 生成类 Tools

#### `neuron_analyze_api`

分析任意格式的 API 文档，输出结构化理解。

```typescript
export const analyzeApiTool = {
  name: 'neuron_analyze_api',
  description: '分析任意格式的 API 文档 (Swagger/OpenAPI、Postman、cURL、文字描述、表格)，输出结构化的资源/接口/字段分析。这是生成页面的第一步。',
  inputSchema: {
    type: 'object',
    properties: {
      apiText: {
        type: 'string',
        description: '任意格式的 API 文档内容',
      },
      format: {
        type: 'string',
        enum: ['auto', 'swagger', 'openapi', 'postman', 'curl', 'text', 'table'],
        default: 'auto',
        description: '指定 API 文档格式，auto 为自动检测',
      },
    },
    required: ['apiText'],
  },
}

// Handler 返回示例:
{
  resources: [
    {
      name: 'competition',
      displayName: '赛事',
      endpoints: [
        { method: 'GET', path: '/api/competitions', summary: '获取赛事列表', params: ['page', 'status', 'keyword'] },
        { method: 'POST', path: '/api/competitions', summary: '创建赛事' },
        { method: 'GET', path: '/api/competitions/:id', summary: '获取赛事详情' },
        { method: 'PUT', path: '/api/competitions/:id', summary: '更新赛事' },
        { method: 'DELETE', path: '/api/competitions/:id', summary: '删除赛事' },
      ],
      fields: [
        { name: 'id', type: 'string', inResponse: true, inRequest: false },
        { name: 'name', type: 'string', inResponse: true, inRequest: true, required: true },
        { name: 'status', type: 'string:enum', values: ['draft', 'active', 'ended'], inResponse: true, inRequest: true },
        { name: 'prize', type: 'number', inResponse: true, inRequest: true },
        { name: 'start_date', type: 'date', inResponse: true, inRequest: true },
        { name: 'created_by', type: 'object:user', inResponse: true, inRequest: false },
        { name: 'tags', type: 'array:string', inResponse: true, inRequest: true },
      ],
      pattern: 'CRUD',
    }
  ],
}
```

#### `neuron_generate_page`

从 API 分析结果 + TaskCase 生成 Page Schema。

```typescript
export const generatePageTool = {
  name: 'neuron_generate_page',
  description: '根据 API 列表和 TaskCase 生成 neuron-ui Page Schema JSON。自动选择组件、配置数据绑定、遵守 Token 约束和嵌套规则。生成结果经过自动校验。',
  inputSchema: {
    type: 'object',
    properties: {
      apiList: {
        type: 'string',
        description: '任意格式的 API 列表/文档',
      },
      taskCase: {
        type: 'string',
        description: '任意格式的需求描述/TaskCase',
      },
      preferences: {
        type: 'object',
        properties: {
          pageType: {
            type: 'string',
            enum: ['crud', 'dashboard', 'detail', 'form', 'auto'],
            default: 'auto',
          },
          formContainer: {
            type: 'string',
            enum: ['dialog', 'sheet', 'drawer', 'auto'],
            default: 'auto',
          },
        },
        description: '生成偏好 (可选)',
      },
    },
    required: ['apiList', 'taskCase'],
  },
}
```

#### `neuron_validate_schema`

校验 Page Schema 的合法性。

```typescript
export const validateSchemaTool = {
  name: 'neuron_validate_schema',
  description: '校验 neuron-ui Page Schema 的合法性: 格式、组件嵌套约束、数据绑定完整性、Token 使用合规性。返回错误列表和自动修复建议。',
  inputSchema: {
    type: 'object',
    properties: {
      schema: {
        type: 'object',
        description: 'Page Schema JSON 对象',
      },
    },
    required: ['schema'],
  },
}

// Handler 返回示例:
{
  valid: false,
  errors: [
    {
      path: 'tree[0].children[2].component',
      message: 'NDataTable 不能嵌套在 NCard 内',
      rule: 'composition',
      autoFix: { action: 'move', description: '将 NDataTable 移到 page-root 下' },
    },
    {
      path: 'tree[0].children[0].props.color',
      message: '"#FF0000" 不是合法的 Token key，应使用 Token 名称',
      rule: 'token',
      autoFix: { action: 'replace', value: 'pink', description: '替换为最接近的 Token "pink"' },
    },
  ],
  warnings: [
    {
      path: 'tree[0].children[3]',
      message: 'NAlertDialog 建议至少有 2 个 NButton 子组件 (取消 + 确认)',
      rule: 'best-practice',
    },
  ],
  summary: {
    totalNodes: 24,
    errors: 2,
    warnings: 1,
    autoFixable: 2,
  },
}
```

#### `neuron_suggest_components`

为给定字段推荐最合适的组件。

```typescript
export const suggestComponentsTool = {
  name: 'neuron_suggest_components',
  description: '为给定字段类型推荐最合适的 neuron-ui 组件，提供带权重的推荐列表。支持展示和输入两种场景。',
  inputSchema: {
    type: 'object',
    properties: {
      fieldName: {
        type: 'string',
        description: '字段名称 (用于语义推断)，如 "status", "avatar", "tags"',
      },
      fieldType: {
        type: 'string',
        description: '字段数据类型，如 "string", "string:enum", "boolean", "date", "array:object"',
      },
      context: {
        type: 'string',
        enum: ['display', 'input'],
        description: 'display = GET 响应中的展示; input = POST/PUT 请求中的输入',
      },
      enumValues: {
        type: 'array',
        items: { type: 'string' },
        description: '如果字段是枚举类型，提供可选值列表 (影响组件选择: ≤5 用 NSelect, >5 用 NCombobox)',
      },
    },
    required: ['fieldName', 'fieldType', 'context'],
  },
}

// Handler 返回示例 (fieldName: "status", fieldType: "string:enum", context: "display"):
{
  recommendations: [
    { component: 'NBadge', confidence: 0.95, reason: '枚举字段在展示场景首选 NBadge 标签展示' },
    { component: 'NText', confidence: 0.6, reason: '也可用纯文本展示枚举值' },
    { component: 'NSwitch', confidence: 0.3, reason: '如果枚举只有 2 个值 (如 active/inactive)，可用开关展示' },
  ],
  usage: {
    component: 'NBadge',
    propsExample: {
      label: '${status}',
      color: 'lime',
      variant: 'solid',
    },
    colorMapSuggestion: {
      draft: 'yellow',
      active: 'lime',
      ended: 'gray-07',
    },
  },
}
```

### 8.1.3 代码生成 Tools

#### `neuron_generate_code`

从 Page Schema 生成 .tsx 源码。

```typescript
export const generateCodeTool = {
  name: 'neuron_generate_code',
  description: '将 Page Schema 编译为 React .tsx 源码文件。支持 hooks/swr/react-query 风格和 fetch/axios/ky API 客户端。',
  inputSchema: {
    type: 'object',
    properties: {
      schema: {
        type: 'object',
        description: 'Page Schema JSON 对象',
      },
      style: {
        type: 'string',
        enum: ['hooks', 'swr', 'react-query'],
        default: 'hooks',
        description: '数据获取风格',
      },
      apiClient: {
        type: 'string',
        enum: ['fetch', 'axios', 'ky'],
        default: 'fetch',
        description: 'API 客户端',
      },
    },
    required: ['schema'],
  },
}

// Handler 返回示例:
{
  files: [
    {
      path: 'CompetitionListPage.tsx',
      content: '// 生成的页面组件代码...',
      description: '页面主组件',
    },
    {
      path: 'CompetitionListPage.hooks.ts',
      content: '// 数据获取 hooks...',
      description: '数据层 hooks',
    },
    {
      path: 'CompetitionListPage.types.ts',
      content: '// TypeScript 类型定义...',
      description: '类型定义',
    },
    {
      path: 'components/CreateCompetitionDialog.tsx',
      content: '// 创建弹窗组件...',
      description: '子组件: 创建弹窗',
    },
  ],
  dependencies: {
    required: ['@neuron-ui/tokens', '@neuron-ui/components'],
    optional: ['@tanstack/react-query'],
  },
}
```

#### `neuron_preview_code`

预览代码生成结果 (不实际写入文件，仅返回目录结构和代码摘要)。

```typescript
export const previewCodeTool = {
  name: 'neuron_preview_code',
  description: '预览 Page Schema 代码生成结果: 输出文件列表、目录结构、代码概要，不写入文件。用于确认生成方案。',
  inputSchema: {
    type: 'object',
    properties: {
      schema: {
        type: 'object',
        description: 'Page Schema JSON 对象',
      },
      style: {
        type: 'string',
        enum: ['hooks', 'swr', 'react-query'],
        default: 'hooks',
      },
    },
    required: ['schema'],
  },
}
```

---

## 8.2 MCP Resources 详细设计

Resources 是 MCP 协议中的**只读数据源**，AI 客户端可以在需要时主动读取。

```typescript
// resources/index.ts

const resources = [
  // ── 元数据 ──
  {
    uri: 'neuron://metadata/component-manifest',
    name: 'neuron-ui 组件清单',
    description: '53 个 N-前缀组件的完整清单，含分类、变体、尺寸、嵌套规则',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://metadata/component-api-mapping',
    name: '组件-接口映射规则',
    description: '字段类型→组件映射 + API 模式→页面模式映射 (AI 生成页面的参考指南)',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://metadata/composition-rules',
    name: '组件组合约束',
    description: '组件嵌套规则: 哪些组件可以放在哪些容器内，数量限制等',
    mimeType: 'application/json',
  },

  // ── Design Token ──
  {
    uri: 'neuron://tokens/all',
    name: 'neuron-ui Design Tokens (全部)',
    description: '全部 Token: 14 级暖灰 + 10 辅助色 + 3 语义色 + 间距 + 圆角 + 字体',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://tokens/colors',
    name: 'Token: 颜色',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://tokens/spacing',
    name: 'Token: 间距',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://tokens/radius',
    name: 'Token: 圆角',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://tokens/typography',
    name: 'Token: 字体',
    mimeType: 'application/json',
  },

  // ── Schema 规格 ──
  {
    uri: 'neuron://schemas/page-schema-spec',
    name: 'Page Schema 格式规范',
    description: 'Page Schema JSON 结构定义: version, page, dataSources, tree, binding 协议',
    mimeType: 'application/json',
  },

  // ── 示例 ──
  {
    uri: 'neuron://examples/crud-page',
    name: '示例: CRUD 列表页',
    description: '赛事管理 CRUD 页面的完整 Page Schema (表格+搜索+新建+编辑+删除)',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://examples/dashboard-page',
    name: '示例: 仪表盘页',
    description: '统计概览仪表盘的 Page Schema (多卡片+图表+进度条)',
    mimeType: 'application/json',
  },
  {
    uri: 'neuron://examples/detail-page',
    name: '示例: 详情页',
    description: '资源详情页的 Page Schema (信息卡片+标签页+关联数据)',
    mimeType: 'application/json',
  },

  // ── Catalog Prompt ──
  {
    uri: 'neuron://catalog/prompt',
    name: 'AI 系统提示词 (catalog.prompt())',
    description: '由 neuronCatalog.prompt() 自动生成的完整 AI 系统提示词，包含所有组件 schema + action 定义',
    mimeType: 'text/plain',
  },
]
```

### Resource URI 模板

使用 URI Template 支持动态参数:

```typescript
const resourceTemplates = [
  {
    uriTemplate: 'neuron://components/{componentName}',
    name: '组件详情',
    description: '获取指定组件的完整 schema (等同于 neuron_get_component tool)',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'neuron://tokens/{category}',
    name: 'Token 分类',
    description: '获取指定分类的 Token (colors/spacing/radius/typography)',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'neuron://examples/{name}',
    name: 'Page Schema 示例',
    description: '获取指定名称的示例 Page Schema',
    mimeType: 'application/json',
  },
]
```

---

## 8.3 MCP Prompts 详细设计

Prompts 是 MCP 协议中的**可参数化提示词模板**，AI 客户端可以直接获取并使用。

### `neuron-page-generation`

页面生成的完整 Prompt 模板。

```typescript
export const pageGenerationPrompt = {
  name: 'neuron-page-generation',
  description: '生成 neuron-ui 页面的完整 Prompt，包含组件清单、映射规则、嵌套约束、Token 限制和输出格式要求。',
  arguments: [
    {
      name: 'apiList',
      description: '任意格式的 API 文档',
      required: true,
    },
    {
      name: 'taskCase',
      description: '任意格式的需求描述',
      required: true,
    },
    {
      name: 'pageType',
      description: '页面类型偏好: crud / dashboard / detail / form / auto',
      required: false,
    },
  ],
}

// Handler: 动态组装 Prompt
function buildPageGenerationPrompt(args) {
  const catalogPrompt = neuronCatalog.prompt()          // 组件 schema + action 列表
  const mappingRules = loadMappingRules()                // 字段→组件映射
  const compositionRules = loadCompositionRules()        // 嵌套约束
  const tokenConstraints = loadTokenConstraints()        // Token 列表
  const fewShotExamples = loadExamples(args.pageType)    // 对应类型的示例

  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `
你是 neuron-ui 页面生成助手。根据用户提供的 API 列表和需求描述，生成标准 Page Schema JSON。

## 可用组件
${catalogPrompt}

## 字段→组件映射规则
${JSON.stringify(mappingRules, null, 2)}

## 组件嵌套约束
${JSON.stringify(compositionRules, null, 2)}

## Token 约束
${JSON.stringify(tokenConstraints, null, 2)}
props 中的颜色/间距/圆角/字号只能使用 Token key，禁止原始值。

## 输出格式
标准 Page Schema JSON (含 version, page, dataSources, tree)。
每个节点必须有唯一 id、component、props。
数据绑定使用 binding 字段 (dataSource/field/onChange/onClick/onSubmit/onConfirm/prefill)。

## 示例
${fewShotExamples}

---

API 列表:
${args.apiList}

需求描述:
${args.taskCase}

${args.pageType ? `页面类型偏好: ${args.pageType}` : ''}

请生成 Page Schema JSON:
`,
        },
      },
    ],
  }
}
```

### `neuron-component-selection`

辅助 AI 选择组件的 Prompt。

```typescript
export const componentSelectionPrompt = {
  name: 'neuron-component-selection',
  description: '辅助选择合适的 neuron-ui 组件的 Prompt，适用于用户描述了一个 UI 需求但不确定该用什么组件时。',
  arguments: [
    {
      name: 'requirement',
      description: '用户的 UI 需求描述',
      required: true,
    },
  ],
}
```

### `neuron-schema-review`

审查并改进 Page Schema 的 Prompt。

```typescript
export const schemaReviewPrompt = {
  name: 'neuron-schema-review',
  description: '审查 Page Schema 的质量并提出改进建议: 组件选择合理性、数据绑定完整性、Token 合规性、用户体验优化。',
  arguments: [
    {
      name: 'schema',
      description: 'Page Schema JSON 字符串',
      required: true,
    },
  ],
}
```

---

## 8.4 实现细节

### Server 主体

```typescript
// src/server.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

// Tool handlers
import { registerMetadataTools } from './tools/metadata'
import { registerGenerationTools } from './tools/generation'
import { registerCodegenTools } from './tools/codegen'

// Resource providers
import { registerResources } from './resources'

// Prompt templates
import { registerPrompts } from './prompts'

export function createNeuronMcpServer() {
  const server = new McpServer({
    name: 'neuron-ui',
    version: '1.0.0',
  })

  // 注册所有 Tools
  registerMetadataTools(server)
  registerGenerationTools(server)
  registerCodegenTools(server)

  // 注册所有 Resources
  registerResources(server)

  // 注册所有 Prompts
  registerPrompts(server)

  return server
}
```

### CLI 入口

```typescript
// bin/neuron-mcp.ts
#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createNeuronMcpServer } from '../src/server'

const server = createNeuronMcpServer()
const transport = new StdioServerTransport()
await server.connect(transport)
```

### HTTP 入口 (可选，用于远程部署)

```typescript
// src/http-server.ts
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express from 'express'
import { createNeuronMcpServer } from './server'

const app = express()
app.use(express.json())

app.post('/mcp', async (req, res) => {
  const server = createNeuronMcpServer()
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  res.writeHead(200, { 'Content-Type': 'application/json' })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

app.listen(3100, () => {
  console.log('neuron-ui MCP Server running on http://localhost:3100/mcp')
})
```

### 数据加载

```typescript
// loaders/metadata-loader.ts
import manifestJson from '@neuron-ui/metadata/component-manifest.json'
import mappingJson from '@neuron-ui/metadata/component-api-mapping.json'
import rulesJson from '@neuron-ui/metadata/composition-rules.json'

export function loadManifest() { return manifestJson }
export function loadMapping() { return mappingJson }
export function loadRules() { return rulesJson }
```

```typescript
// loaders/catalog-loader.ts
import { neuronCatalog } from '@neuron-ui/runtime'

export function getCatalogPrompt() {
  return neuronCatalog.prompt()
}

export function validateElement(element: unknown) {
  return neuronCatalog.validateElement(element)
}
```

---

## 8.5 使用方式

### 在 Claude Code 中使用

在项目的 `.claude/mcp.json` 中注册:

```jsonc
{
  "mcpServers": {
    "neuron-ui": {
      "command": "npx",
      "args": ["@neuron-ui/mcp-server"]
    }
  }
}
```

或本地开发:

```jsonc
{
  "mcpServers": {
    "neuron-ui": {
      "command": "node",
      "args": ["./packages/mcp-server/dist/bin/neuron-mcp.js"]
    }
  }
}
```

### 在 Cursor 中使用

在 `.cursor/mcp.json` 中注册:

```jsonc
{
  "mcpServers": {
    "neuron-ui": {
      "command": "npx",
      "args": ["@neuron-ui/mcp-server"]
    }
  }
}
```

### 在其他 MCP 客户端中使用

任何支持 MCP 协议的客户端均可通过 stdio 或 HTTP 连接:

```bash
# stdio 模式 (本地)
npx @neuron-ui/mcp-server

# HTTP 模式 (远程)
npx @neuron-ui/mcp-server --transport http --port 3100
```

### 典型使用流程

```
用户 (在 AI 客户端中):
  "分析这些 API 并生成一个赛事管理页面"

AI 助手自动调用 MCP Tools:

  1. neuron_analyze_api({ apiText: "..." })
     → 结构化 API 分析 (资源、接口、字段、类型)

  2. neuron_suggest_components({ fieldName: "status", fieldType: "string:enum", context: "display" })
     → 推荐 NBadge (0.95) / NText (0.6) / NSwitch (0.3)

  3. neuron_generate_page({ apiList: "...", taskCase: "赛事管理 CRUD", preferences: { pageType: "crud" } })
     → 完整 Page Schema JSON

  4. neuron_validate_schema({ schema: {...} })
     → { valid: true, errors: [], warnings: [...] }

  5. neuron_generate_code({ schema: {...}, style: "react-query", apiClient: "axios" })
     → 5 个 .tsx 文件
```

---

## 8.6 与现有 Skills 的关系

MCP Server 上线后，现有 `.claude/skills/` 中的三个 neuron skills 关系如下:

```
现有:
  .claude/skills/neuron-analyze-api/     → 静态 markdown 参考 + prompt 模板
  .claude/skills/neuron-generate-page/   → 静态 markdown 参考 + prompt 模板
  .claude/skills/neuron-validate-schema/ → 静态 markdown 参考 + prompt 模板

MCP Server:
  neuron_analyze_api     → 服务端实时执行，返回结构化数据
  neuron_generate_page   → 服务端调用 @neuron-ui/generator，执行真正的生成逻辑
  neuron_validate_schema → 服务端使用 Zod + composition rules 执行真正的校验

迁移策略:
  Phase 1: MCP Server 与 Skills 并存
    - Skills 用于 Claude Code (已配置)
    - MCP Server 用于其他客户端 + 高级能力 (codegen, 真实校验)

  Phase 2: Skills 退化为入口指向
    - Skills 的 prompt 中引导 AI 优先使用 MCP Tools
    - 仍保留 Skills 作为 fallback (MCP 不可用时)

  Phase 3 (可选): Skills 完全迁移到 MCP
    - 删除 Skills 中的静态参考文件
    - 所有知识从 MCP Resources 获取
    - Prompt 从 MCP Prompts 获取
```

---

## 8.7 包依赖配置

```jsonc
// packages/mcp-server/package.json
{
  "name": "@neuron-ui/mcp-server",
  "version": "0.1.0",
  "description": "neuron-ui MCP Server — 将组件库的 AI 能力暴露为标准 MCP 服务",
  "type": "module",
  "bin": {
    "neuron-mcp": "./dist/bin/neuron-mcp.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts src/bin/neuron-mcp.ts --format esm --dts",
    "dev": "tsup --watch",
    "test": "vitest",
    "start": "node dist/bin/neuron-mcp.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "@neuron-ui/metadata": "workspace:*",
    "@neuron-ui/tokens": "workspace:*",
    "@neuron-ui/runtime": "workspace:*",
    "@neuron-ui/generator": "workspace:*",
    "@neuron-ui/codegen": "workspace:*",
    "zod": "^3.x"
  },
  "devDependencies": {
    "tsup": "^8.x",
    "vitest": "^2.x",
    "typescript": "^5.x"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

### 在 monorepo 中的位置

```
packages/
├── tokens/           → @neuron-ui/tokens
├── components/       → @neuron-ui/components
├── metadata/         → @neuron-ui/metadata
├── generator/        → @neuron-ui/generator
├── page-builder/     → @neuron-ui/page-builder
├── runtime/          → @neuron-ui/runtime
├── codegen/          → @neuron-ui/codegen
└── mcp-server/       → @neuron-ui/mcp-server     ★ 新增: MCP 服务
```

### 构建顺序更新

```
tokens → components → metadata → runtime → generator
                                         ↘
                                          mcp-server (依赖 metadata + runtime + generator + codegen + tokens)
                                         ↗
                              codegen ───┘
```

`mcp-server` 是所有包的**下游消费者**，依赖最重，构建最晚。

---

## 交付物

| 模块 | 文件 | 说明 |
|------|------|------|
| Server | server.ts | MCP Server 创建 + handler 注册 |
| CLI | bin/neuron-mcp.ts | stdio 传输 CLI 入口 |
| Metadata Tools | list-components.ts, get-component.ts, get-mapping-rules.ts, get-composition-rules.ts, get-tokens.ts | 5 个元数据查询 Tool |
| Generation Tools | analyze-api.ts, generate-page.ts, validate-schema.ts, suggest-components.ts | 4 个生成类 Tool |
| Codegen Tools | generate-code.ts, preview-code.ts | 2 个代码生成 Tool |
| Resources | metadata-resources.ts, token-resources.ts, schema-resources.ts, example-resources.ts | 12 个 MCP Resource |
| Prompts | page-generation.ts, component-selection.ts, schema-review.ts | 3 个 Prompt 模板 |
| Loaders | metadata-loader.ts, token-loader.ts, catalog-loader.ts, example-loader.ts | 4 个数据加载器 |
| Tests | tools/*.test.ts, resources/*.test.ts, server.test.ts | 单元测试 + 端到端测试 |

---

## 验收标准

| # | 标准 |
|---|------|
| 1 | `npx @neuron-ui/mcp-server` 可启动 stdio MCP Server，无报错 |
| 2 | Claude Code 注册后可通过 `neuron_list_components` 获取 53 个组件列表 |
| 3 | `neuron_get_component({ name: "NButton" })` 返回完整 Props schema + 嵌套规则 |
| 4 | `neuron_get_mapping_rules({ context: "display" })` 返回字段→展示组件映射 |
| 5 | `neuron_get_tokens({ category: "colors" })` 返回全部颜色 Token |
| 6 | `neuron_analyze_api` 可分析 Swagger/文字描述/Postman 三种格式 |
| 7 | `neuron_generate_page` 可为 CRUD API 生成完整 Page Schema |
| 8 | `neuron_validate_schema` 可检出嵌套违规 + Token 违规 + 绑定缺失 |
| 9 | `neuron_suggest_components` 为 "status:string:enum" 推荐 NBadge (>0.9) |
| 10 | `neuron_generate_code` 可从 Page Schema 生成编译通过的 .tsx 文件 |
| 11 | MCP Resources 可读取所有 12 个静态资源 |
| 12 | MCP Prompts 的 `neuron-page-generation` 可动态组装完整生成 Prompt |
| 13 | Cursor / Windsurf 注册后可正常调用全部 Tools |
| 14 | 测试覆盖: 每个 Tool handler 至少 2 个测试用例 |

---

## 任务拆解

| 优先级 | 任务 | 依赖 |
|--------|------|------|
| **P0** | Server 框架搭建 (MCP SDK + stdio transport) | 无 |
| **P0** | 5 个 Metadata Tools 实现 | metadata JSON 文件就绪 |
| **P0** | 12 个 Resources 注册 | metadata + tokens 就绪 |
| **P1** | `neuron_analyze_api` Tool | generator 分析能力 |
| **P1** | `neuron_validate_schema` Tool | runtime Catalog + composition rules |
| **P1** | `neuron_suggest_components` Tool | mapping rules |
| **P1** | 3 个 Prompt Templates | catalog.prompt() 可用 |
| **P2** | `neuron_generate_page` Tool | generator 包完成 |
| **P2** | `neuron_generate_code` + `neuron_preview_code` Tools | codegen 包完成 |
| **P2** | HTTP Transport (Streamable HTTP) | Server 框架 |
| **P3** | Skills 迁移指引 | MCP Server 稳定 |
| **P3** | 性能优化 (缓存 Catalog prompt + lazy loading) | 全部 Tools 完成 |
