# Phase 4: AI 生成引擎 (@neuron-ui/generator)

> AI 调用编排层：接受任意格式 API + TaskCase → 生成通过校验的 Page Schema。

---

## 依赖

- Phase 3 完成 (metadata 包可用: 映射规则 + 校验器)
- Phase 4A (Prompt 设计) 可与 Phase 3 并行提前启动

## 设计来源

- `docs/plan/03-goal-auto-page-generation.md` — 完整生成引擎设计

## 包目录结构

```
packages/generator/
├── src/
│   ├── index.ts                # 导出 generatePage API
│   ├── generate.ts             # 核心: 调用 AI API
│   ├── prompts/
│   │   ├── system-prompt.ts    # System Prompt 模板
│   │   └── examples/           # Few-shot 示例
│   │       ├── crud-example.json
│   │       ├── dashboard-example.json
│   │       └── detail-example.json
│   ├── context/
│   │   ├── load-mapping.ts     # 加载 component-api-mapping.json
│   │   ├── load-manifest.ts    # 加载 component-manifest.json
│   │   ├── load-rules.ts       # 加载 composition-rules.json
│   │   └── load-tokens.ts      # 加载 Design Token 约束
│   ├── validator/
│   │   ├── schema-validator.ts      # Page Schema 格式校验
│   │   ├── binding-validator.ts     # 数据绑定完整性校验
│   │   └── composition-validator.ts # 嵌套合规校验
│   └── types.ts
├── package.json
└── tsconfig.json
```

## Phase 4A: Prompt 设计 + Few-shot 示例

### 4A.1 System Prompt 设计

`src/prompts/system-prompt.ts`: 构建注入完整上下文的 System Prompt。

**Prompt 结构:**

```
1. 角色定义: 你是 neuron-ui 页面生成助手
2. 参考规则: (注入以下 JSON)
   - component-api-mapping.json (字段→组件映射)
   - component-manifest.json (组件清单, 精简版)
   - composition-rules.json (嵌套约束)
3. 输出格式: Page Schema JSON 规范
4. 约束:
   - props 只使用 Token key, 不使用原始色值
   - 所有数据绑定必须完整
   - 遵守 composition-rules 嵌套约束
5. Few-shot 示例 (2-3 个)
```

### 4A.2 Prompt 迭代空间设计

> **关键认知:** Prompt 工程是一个需要反复调优的过程，不可能一次性完成。设计时应预留充分的迭代空间。

**Prompt 模块化架构:**

```
system-prompt.ts
├── base-role.ts          # 角色定义 (稳定层，极少变动)
├── context-injection.ts  # 规则注入 (从 JSON 文件动态加载)
├── output-format.ts      # 输出格式约束 (可按 LLM 调整)
├── constraints.ts        # 约束条件 (可渐进式增删)
└── example-selector.ts   # Few-shot 选择器 (按 pageType 动态选择)
```

**迭代策略:**

| 阶段 | Prompt 策略 | 目标 |
|------|------------|------|
| 初始版本 | 基础 Prompt + 2 个 Few-shot | 能生成结构正确的 Page Schema |
| 迭代 1 | 增加约束条件 + 更多 Few-shot | 提升字段映射准确率 |
| 迭代 2 | 针对不同 LLM (Claude/GPT) 调整 output-format | 多模型兼容 |
| 迭代 3 | 引入 `catalog.prompt()` 替代手动组件清单 | 与 Runtime Catalog 同步 |

**多 LLM 兼容考量:**
- 不同 LLM 对 JSON 输出的遵循度不同，`output-format.ts` 应可按 provider 配置
- Claude 倾向于结构化输出，GPT 可能需要更明确的 JSON 边界标记
- 本地模型 (如 Llama) 可能需要更简化的 Prompt 和更多 Few-shot

### 4A.3 Few-shot 示例

至少准备三个高质量示例:

| 示例 | 输入 | 输出 |
|------|------|------|
| CRUD 列表页 | 赛事管理 API + 一句话 TaskCase | 含 NDataTable + 创建弹窗 + 编辑面板 + 删除确认 |
| Dashboard | 数据统计 API + 仪表盘需求 | 含 NCard[] + NChart[] + NProgress |
| Detail 详情页 | 资源详情 API + Tab 分区需求 | 含 NCard + NTabs + NAccordion |

> CRUD 示例完整 JSON 见 `docs/plan/03-goal-auto-page-generation.md` "生成结果示例" 章节

## Phase 4B: generatePage() 核心 API

### 4B.1 API 签名

```typescript
interface GeneratePageOptions {
  apiList: string        // 任意格式的 API 列表
  taskCase: string       // 任意格式的需求描述
  preferences?: {
    pageType?: 'crud' | 'dashboard' | 'detail' | 'auto'  // 默认 'auto'
    formContainer?: 'dialog' | 'sheet' | 'drawer' | 'auto' // 默认 'auto'
  }
  /** Human-in-the-loop: 生成前是否先输出 AI 的理解摘要供人工确认 */
  confirmBeforeGenerate?: boolean  // 默认 false
}

interface GeneratePageResult {
  pageSchema: PageSchema   // 通过校验的 Page Schema
  metadata: {
    generatedBy: 'ai'
    apiResource: string
    taskCase: string
    retries: number        // 重试次数
  }
}

/** AI 对输入的理解摘要 (human-in-the-loop 确认步骤使用) */
interface GenerationPreview {
  detectedApis: Array<{ method: string; path: string; description: string }>
  suggestedPageType: 'crud' | 'dashboard' | 'detail'
  suggestedComponents: string[]
  suggestedLayout: string  // 布局描述
  confirm: () => Promise<GeneratePageResult>  // 确认后继续生成
  abort: () => void                           // 取消生成
}

export async function generatePage(options: GeneratePageOptions): Promise<GeneratePageResult>
/** Human-in-the-loop 模式: 先返回预览，人工确认后再生成完整 Page Schema */
export async function previewGeneration(options: GeneratePageOptions): Promise<GenerationPreview>
```

### 4B.2 调用流程

```
generatePage() 执行步骤:

1. 加载上下文
   ├── component-api-mapping.json
   ├── component-manifest.json (精简版)
   ├── composition-rules.json
   └── Design Token 列表

2. 构建 Prompt
   ├── System Prompt (模板 + 注入上下文)
   ├── Few-shot 示例 (根据 preferences.pageType 选择)
   └── User Prompt (apiList + taskCase)

2.5 [可选] Human-in-the-loop 确认 (confirmBeforeGenerate = true 时)
   ├── AI 先分析输入, 输出理解摘要 (识别到的 API、建议页面类型、建议组件)
   ├── 用户确认摘要正确 → 继续步骤 3
   └── 用户修正 → 更新 Prompt 后继续步骤 3

3. 调用 AI API
   └── 发送 messages → 获取文本响应

4. 解析 JSON
   └── 从 AI 响应中提取 JSON (处理 markdown 包裹等)

5. 校验
   ├── JSON 格式校验
   ├── Page Schema 结构校验
   ├── 组件嵌套合规校验
   ├── 数据绑定完整性校验
   └── Token 使用合规校验

6. 校验失败?
   ├── 尝试自动修复 (常见问题)
   └── 重试 (最多 2 次, 带校验错误反馈)

7. 重试全部失败? → 降级方案 (见 4C.4)

8. 返回 Page Schema
```

**Human-in-the-loop 使用场景:**
- 输入格式为非结构化文本描述时 (AI 理解可能偏差)
- 页面类型不明确时 (CRUD vs Dashboard)
- MCP Server / Page Builder 的交互场景 (用户可实时确认)
- 批量生成时，对第一个页面做确认，后续页面自动生成

### 4B.3 AI Provider 抽象

```typescript
// 支持不同 AI 提供商
interface AIProvider {
  generate(messages: Message[]): Promise<string>
}

// 默认使用 Anthropic Claude
class ClaudeProvider implements AIProvider { ... }
// 可扩展: OpenAI, local model 等
```

## Phase 4C: 校验器 + 自动修复

### 4C.1 校验器

复用 `@neuron-ui/metadata` 的 `page-schema-validator`:

```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  path: string          // JSON path, 如 "tree[0].children[2].props.color"
  code: string          // 错误码
  message: string       // 可读消息
  severity: 'error' | 'warning'
  autoFixable: boolean
}
```

**校验规则:**

| 规则 | 说明 | 可自动修复 |
|------|------|-----------|
| INVALID_JSON | JSON 格式错误 | 否 |
| UNKNOWN_COMPONENT | 组件名不在 manifest 中 | 否 |
| INVALID_PROP | props 不符合组件 schema | 部分可以 |
| NESTING_VIOLATION | 嵌套违反 composition-rules | 否 |
| MISSING_BINDING | 缺少必要的 binding | 否 |
| RAW_COLOR_VALUE | 使用了原始色值而非 Token key | 是 |
| RAW_SPACING_VALUE | 使用了原始间距值而非 Token key | 是 |
| MISSING_ID | 节点缺少 id | 是 (自动生成) |
| DUPLICATE_ID | 存在重复 id | 是 (自动去重) |

### 4C.2 自动修复

```typescript
function autoFix(schema: PageSchema, errors: ValidationError[]): PageSchema {
  // 修复 RAW_COLOR_VALUE: "#BEF1FF" → "blue"
  // 修复 RAW_SPACING_VALUE: "16px" → "md"
  // 修复 MISSING_ID: 自动生成唯一 id
  // 修复 DUPLICATE_ID: 追加后缀
}
```

### 4C.3 重试机制

```typescript
async function generateWithRetry(options, maxRetries = 2): Promise<GeneratePageResult> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await callAI(options)
    const validation = validate(result)

    if (validation.valid) return result

    // 自动修复
    const fixed = autoFix(result, validation.errors)
    const revalidation = validate(fixed)
    if (revalidation.valid) return fixed

    // 重试: 将校验错误作为反馈注入下一轮 prompt
    options = appendValidationFeedback(options, validation.errors)
  }

  // 重试全部失败 → 降级方案
  return fallbackGenerate(options, lastErrors)
}
```

### 4C.4 降级方案 (重试失败后)

> 当 AI 生成 + 自动修复 + 2 次重试全部失败后，不应直接抛出错误，而应返回一个最小可用的 Page Schema 骨架，让用户在编辑器中手动完善。

```typescript
function fallbackGenerate(options, errors): GeneratePageResult {
  // 基于已识别的 API 和 pageType，生成最小骨架
  const skeleton = generateSkeleton(options)

  return {
    pageSchema: skeleton,
    metadata: {
      generatedBy: 'ai',
      apiResource: options.apiList,
      taskCase: options.taskCase,
      retries: maxRetries,
      degraded: true,                    // 标记为降级结果
      degradeReason: errors,             // 附带失败原因
      suggestedActions: [                // 给用户的修复建议
        '在编辑器中手动添加缺失的组件',
        '检查 API 格式是否可被 AI 正确理解',
        '尝试简化 TaskCase 描述后重新生成'
      ]
    }
  }
}
```

**骨架生成策略:**

| pageType | 骨架内容 |
|----------|---------|
| crud | NResizable + NCard(搜索区) + NDataTable(空列) + NDialog(空表单) |
| dashboard | NResizable + NCard[] (空卡片) |
| detail | NCard + NTabs(空 tab) |
| auto (无法判断) | NResizable + NCard + NText("请在编辑器中继续完善此页面") |

**降级结果在编辑器中的表现:**
- 页面顶部显示黄色提示条: "此页面为 AI 降级生成，请手动完善"
- 空的组件区域高亮显示，引导用户填充内容
- 属性面板提供"重新生成"按钮，允许用户修改输入后再次尝试
```

## 交付物

| 文件 | 说明 |
|------|------|
| src/generate.ts | 核心生成逻辑 |
| src/prompts/system-prompt.ts | System Prompt 模板 |
| src/prompts/examples/*.json | 3 个 Few-shot 示例 |
| src/context/*.ts | 上下文加载器 |
| src/validator/*.ts | 校验器 (格式 + 绑定 + 嵌套) |
| src/types.ts | TypeScript 类型 |

## 验收标准

| # | 标准 |
|---|------|
| 1 | 支持任意格式的 API 列表输入 (Swagger, Postman, 文字描述) |
| 2 | 支持任意格式的 TaskCase 输入 (JSON, PRD, 一句话描述) |
| 3 | 生成的 CRUD 页面包含: 表格 + 搜索 + 新建弹窗 + 编辑面板 + 删除确认 |
| 4 | 所有字段正确映射到对应组件 |
| 5 | 数据绑定正确: GET→表格, POST→表单, DELETE→确认 |
| 6 | 生成结果通过 Page Schema 校验 (格式 + 嵌套 + Token) |
| 7 | 自动修复能处理常见错误 (原始色值、缺少 id 等) |
| 8 | 重试机制在校验失败时能带反馈重试 |
| 9 | `previewGeneration()` 返回正确的 AI 理解摘要 (human-in-the-loop) |
| 10 | 重试全部失败后降级返回最小可用骨架 (不抛错) |
| 11 | Prompt 模块化架构支持独立替换各部分 (role/context/format/constraints) |
