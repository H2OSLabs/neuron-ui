/**
 * Output format constraints — can be adjusted per LLM provider.
 */
export function getOutputFormat(): string {
  return `## 输出格式

你必须输出一个完整的 Page Schema JSON 对象，格式如下：

{
  "version": "1.0.0",
  "page": {
    "id": "page-id",
    "name": "页面名称",
    "description": "页面描述",
    "route": "/path/to/page"
  },
  "dataSources": {
    "sourceKey": {
      "api": "METHOD /api/endpoint",
      "method": "GET",
      "params": {},
      "autoFetch": true
    }
  },
  "tree": [
    {
      "id": "root",
      "component": "NResizable",
      "props": { "direction": "vertical" },
      "children": [...]
    }
  ]
}

### TreeNode 结构
每个节点包含：
- "id": 唯一标识（语义化命名）
- "component": 组件名（N前缀，如 "NCard", "NDataTable"）
- "props": 组件静态 props
- "binding": 数据绑定配置（可选）
  - "dataSource": 数据源 key
  - "field": 字段路径
  - "onChange"/"onClick"/"onSubmit"/"onConfirm": 触发的数据源操作
- "children": 子节点数组（可选）

### binding 协议
- GET 展示组件: 设置 "dataSource" 和 "field"
- POST/PUT 输入组件: 设置 "field" 和对应的 onChange/onSubmit
- DELETE 确认: 设置 "onConfirm"
- 编辑表单预填: 设置 "prefill.dataSource" 和 "prefill.fieldMap"

重要: 直接输出 JSON 对象，不要用 markdown 代码块包裹。`
}
