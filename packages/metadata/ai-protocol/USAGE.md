# AI 元数据使用协议

> 本文档说明 AI 如何使用 `@neuron-ui/metadata` 中的元数据来生成页面。

## 元数据文件清单

| 文件 | 用途 | AI 使用场景 |
|------|------|------------|
| `component-manifest.json` | 53 个组件清单 | 了解可用组件及其 props、分类、嵌套规则 |
| `component-api-mapping.json` | 字段→组件映射 | 根据 API 字段类型自动选择展示/输入组件 |
| `composition-rules.json` | 组件嵌套约束 | 验证生成的组件树是否合法 |
| `schemas/*.schema.json` | 组件 Props Schema | 校验 props 值是否合法 |
| `page-schema/page.schema.json` | Page Schema 定义 | 输出格式规范 |
| `page-schema/examples/*.json` | 示例页面 | Few-shot 学习参考 |

## AI 生成流程

### Step 1: 解析 API
AI 接收任意格式的 API 文档，提取：
- HTTP 方法 (GET/POST/PUT/DELETE)
- 端点路径
- Request/Response 字段及类型

### Step 2: 匹配页面模式
根据 `apiPatternMapping` 匹配页面模式：
- `GET /list` → list-page (NDataTable 为主)
- `GET /:id` → detail-page (NCard + NTabs 为主)
- `GET /stats` → dashboard (NCard[] + NChart[])
- `POST /` → create-form (NDialog + NField[])
- `PUT /:id` → edit-form (NSheet + NField[])
- `DELETE /:id` → delete-confirm (NAlertDialog)
- CRUD 复合 → crud-page (全量组合)

### Step 3: 映射字段到组件
使用 `fieldTypeMapping` 的决策树：

**展示字段 (Response):**
```
array<object> → NDataTable
string:enum → NBadge
string:image → NAvatar
number:percentage → NProgress
array<number> → NChart
null / empty → NEmpty
其他 → NText
```

**输入字段 (Request):**
```
string:enum (≤5) → NSelect
string:enum (>5) → NCombobox
boolean → NSwitch
date → NDatePicker
number:range → NSlider
string:long → NTextarea
otp → NInputOTP
其他 → NInput
每个输入字段用 NField 包装
```

### Step 4: 构建组件树
按照 `composition-rules.json` 的嵌套规则构建组件树：
- 根容器: NResizable / NCard / NDialog / NSheet
- 最大嵌套深度: 6 层
- 颜色/间距必须使用 Token key

### Step 5: 生成 Page Schema
输出符合 `page.schema.json` 格式的 JSON，包含：
- `version`: "1.0.0"
- `page`: { id, name, description, route }
- `dataSources`: API 端点定义
- `tree`: 嵌套组件树

### Step 6: 校验
使用 `validatePageSchema()` 校验：
1. JSON 格式是否合法
2. 组件名是否在 manifest 中
3. 嵌套是否符合 composition-rules
4. binding 是否引用了已定义的 dataSource
5. 颜色/间距/尺寸值是否为 Token key

## 示例参考

参见 `page-schema/examples/` 目录：
- `crud-page.json` — 完整 CRUD 页面 (用户管理)
- `dashboard-page.json` — 仪表盘页面 (销售数据)
- `detail-page.json` — 详情页 (用户详情 + Tab 分区)
