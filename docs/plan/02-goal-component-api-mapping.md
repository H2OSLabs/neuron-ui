# 目标 2: 组件-接口类型映射

> 定义每个组件适用于哪种类型的接口（GET / POST / PUT / DELETE）

---

## 目标分析

### 核心思路

每个前端组件天然与某种 API 交互模式关联：
- **展示数据的组件**（DataTable, Card）→ 消费 **GET** 接口的响应
- **创建数据的组件**（Input, Form, Textarea）→ 构造 **POST** 接口的请求体
- **修改数据的组件**（编辑表单, Switch）→ 构造 **PUT/PATCH** 接口的请求体
- **删除数据的组件**（确认弹窗）→ 触发 **DELETE** 接口调用

将这种关联关系 **显式化、结构化**，就形成了从 API 列表自动匹配组件的桥梁。

### 为什么需要这个映射

```
没有映射:  API 列表 → ??? → 手动选组件 → 手动写页面
有了映射:  API 列表 → 映射规则自动匹配 → 自动生成页面 → 人工微调
```

## 组件-接口分类体系

> 以下映射表覆盖目标 1 中全部 53 个 neuron 组件，按 API 交互角色分类标注。

### 完整映射表

#### 数据展示组件 (GET consumer)

| 组件 | GET (读取) | POST (创建) | PUT (更新) | DELETE (删除) | 说明 |
|------|:---------:|:----------:|:---------:|:------------:|------|
| **NDataTable** | ★ 主要 | — | — | — | 列表数据展示，消费 GET /list 响应 |
| **NCard** | ★ 主要 | — | — | — | 单条/多条数据展示，消费 GET 响应 |
| **NCalendar** | ★ 主要 | — | — | — | 日历/时间数据展示 |
| **NCarousel** | ★ 主要 | — | — | — | 轮播数据展示 |
| **NScrollArea** | ★ 主要 | — | — | — | 滚动列表展示 |
| **NAvatar** | ★ 主要 | — | — | — | 用户信息展示 |
| **NBadge** | ★ 主要 | — | — | — | 状态标签展示 |
| **NText** | ★ 主要 | — | — | — | 文本展示 |
| **NEmpty** | ★ 主要 | — | — | — | GET 返回空数据时的展示 |
| **NChart** | ★ 主要 | — | — | — | 数据可视化图表 (基于 Recharts) |
| **NHoverCard** | ★ 主要 | — | — | — | 悬停预览卡片，展示 GET 详情 |
| **NAccordion** | ★ 主要 | — | — | — | 分组数据展示 (FAQ、可折叠内容) |
| **NSkeleton** | ★ 主要 | — | — | — | GET 加载中占位 |
| **NPagination** | ★ 辅助 | — | — | — | 列表分页导航 (配合 GET /list) |
| **NProgress** | ★ 辅助 | — | — | — | 上传/操作进度展示 |

#### 数据输入组件 (POST/PUT producer)

| 组件 | GET (读取) | POST (创建) | PUT (更新) | DELETE (删除) | 说明 |
|------|:---------:|:----------:|:---------:|:------------:|------|
| **NInput** | — | ★ 主要 | ★ 主要 | — | 文本输入字段 (创建/编辑) |
| **NInputGroup** | 辅助 | ★ 主要 | ★ 主要 | — | 搜索/过滤输入 (也用于 GET 查询参数) |
| **NTextarea** | — | ★ 主要 | ★ 主要 | — | 长文本输入 |
| **NCombobox** | 辅助 | ★ 主要 | ★ 主要 | — | 下拉选择 (选项来自 GET, 值用于 POST/PUT) |
| **NSelect** | 辅助 | ★ 主要 | ★ 主要 | — | 简单下拉选择 (比 Combobox 轻量) |
| **NCheckbox** | — | ★ 主要 | ★ 主要 | — | 多选字段 |
| **NRadioGroup** | — | ★ 主要 | ★ 主要 | — | 单选字段 |
| **NSwitch** | — | ★ 主要 | ★ 主要 | — | 布尔切换字段 |
| **NDatePicker** | — | ★ 主要 | ★ 主要 | — | 日期/日期范围选择 |
| **NSlider** | — | ★ 主要 | ★ 主要 | — | 数值范围选择 |
| **NInputOTP** | — | ★ 主要 | — | — | 验证码输入 (仅用于 POST 验证) |
| **NField** | — | ★ 辅助 | ★ 辅助 | — | Label + Input + Error 包装 (表单字段容器) |
| **NLabel** | — | ★ 辅助 | ★ 辅助 | — | 表单字段标签 (配合输入组件) |

#### 操作触发组件 (POST/PUT/DELETE trigger)

| 组件 | GET (读取) | POST (创建) | PUT (更新) | DELETE (删除) | 说明 |
|------|:---------:|:----------:|:---------:|:------------:|------|
| **NButton** | — | ★ 提交 | ★ 保存 | ★ 删除触发 | 操作触发按钮 |
| **NDropdownMenu** | — | 辅助 | 辅助 | 辅助 | 操作菜单 (包含编辑/删除等多种操作入口) |
| **NContextMenu** | — | 辅助 | 辅助 | 辅助 | 右键操作菜单 (同 DropdownMenu 角色) |

#### 容器组件 (form container / confirm container)

| 组件 | GET (读取) | POST (创建) | PUT (更新) | DELETE (删除) | 说明 |
|------|:---------:|:----------:|:---------:|:------------:|------|
| **NDialog** | — | ★ 创建弹窗 | ★ 编辑弹窗 | ★ 确认弹窗 | 表单容器 / 删除确认 |
| **NAlertDialog** | — | — | — | ★ 主要 | 强制确认弹窗 (不可点外关闭，用于删除等危险操作) |
| **NSheet** | — | ★ 创建面板 | ★ 编辑面板 | — | 侧边表单容器 |
| **NDrawer** | — | ★ 创建面板 | ★ 编辑面板 | — | 底部抽屉 (移动端表单容器) |
| **NTabs** | ★ 辅助 | — | — | — | 视图/数据分类切换 (Tab 内承载 GET 数据) |
| **NCollapsible** | ★ 辅助 | — | — | — | 展开/收起内容区 |
| **NPopover** | ★ 辅助 | 辅助 | 辅助 | — | 弹出内容面板 (轻量级容器) |

#### 反馈组件 (response feedback)

| 组件 | GET (读取) | POST (创建) | PUT (更新) | DELETE (删除) | 说明 |
|------|:---------:|:----------:|:---------:|:------------:|------|
| **NToast** | — | ★ 成功提示 | ★ 成功提示 | ★ 成功提示 | 操作反馈通知 |
| **NAlert** | — | 辅助 | 辅助 | 辅助 | 状态提示条 (info/warning/error/success) |
| **NSpinner** | ★ 辅助 | ★ 辅助 | ★ 辅助 | ★ 辅助 | 加载状态指示 (请求进行中) |

#### 导航组件 (navigation)

| 组件 | GET (读取) | POST (创建) | PUT (更新) | DELETE (删除) | 说明 |
|------|:---------:|:----------:|:---------:|:------------:|------|
| **NBreadcrumb** | ★ 辅助 | — | — | — | 页面层级导航 |
| **NSidebar** | ★ 辅助 | — | — | — | 应用导航布局 (响应式收起/展开) |
| **NMenubar** | — | — | — | — | 水平菜单栏 |
| **NNavigationMenu** | — | — | — | — | 站点顶部导航 |
| **NCommand** | ★ 辅助 | — | — | — | 命令面板 (Ctrl+K 搜索，消费 GET 搜索结果) |

#### 布局/辅助组件 (无直接 API 关联)

| 组件 | GET (读取) | POST (创建) | PUT (更新) | DELETE (删除) | 说明 |
|------|:---------:|:----------:|:---------:|:------------:|------|
| **NSeparator** | — | — | — | — | 分割线 |
| **NAspectRatio** | — | — | — | — | 宽高比容器 |
| **NResizable** | — | — | — | — | 可拖拽调整尺寸 |
| **NToggle** | — | — | — | — | 视图切换 |
| **NToggleGroup** | — | — | — | — | 视图/模式切换 |
| **NTooltip** | — | — | — | — | 悬停提示 |
| **NKbd** | — | — | — | — | 快捷键显示 |

### 组件统计 (按 API 角色)

| 角色分类 | 数量 | 组件 |
|---------|------|------|
| 数据展示 | 15 | NDataTable, NCard, NCalendar, NCarousel, NScrollArea, NAvatar, NBadge, NText, NEmpty, NChart, NHoverCard, NAccordion, NSkeleton, NPagination, NProgress |
| 数据输入 | 13 | NInput, NInputGroup, NTextarea, NCombobox, NSelect, NCheckbox, NRadioGroup, NSwitch, NDatePicker, NSlider, NInputOTP, NField, NLabel |
| 操作触发 | 3 | NButton, NDropdownMenu, NContextMenu |
| 容器 | 7 | NDialog, NAlertDialog, NSheet, NDrawer, NTabs, NCollapsible, NPopover |
| 反馈 | 3 | NToast, NAlert, NSpinner |
| 导航 | 5 | NBreadcrumb, NSidebar, NMenubar, NNavigationMenu, NCommand |
| 布局/辅助 | 7 | NSeparator, NAspectRatio, NResizable, NToggle, NToggleGroup, NTooltip, NKbd |
| **总计** | **53** | |

## API 字段类型 → 组件映射

当自动生成引擎解析 API 的 request/response schema 时，需要将每个字段的数据类型映射到具体的输入/展示组件：

### Response 字段 → 展示组件

| 字段类型 | 展示组件 | 示例 |
|---------|---------|------|
| `string` (短文本) | NText | 用户名、标题 |
| `string` (长文本) | NText (多行) | 描述、简介 |
| `string` (URL/image) | NCard media slot / NAvatar | 封面图、头像 |
| `string` (enum/status) | NBadge | 状态:"进行中"/"已结束" |
| `number` | NText | 积分、价格 |
| `number` (percentage) | NProgress | 完成度、进度 |
| `boolean` | NBadge / NSwitch (只读) | 是否启用 |
| `date/datetime` | NText (格式化) / NCalendar | 创建时间、截止日期 |
| `array<object>` | NDataTable / NAccordion | 列表数据 / 分组数据 |
| `array<object>` (timeline) | NCarousel | 时间线/轮播数据 |
| `object` (用户) | NAvatar + NText | 作者信息 |
| `object` (nested) | NHoverCard / NCard | 嵌套对象预览 |
| `array<string>` (tags) | NBadge[] | 标签列表 |
| `array<number>` (chart) | NChart | 图表数据序列 |
| 空数据 (`null` / `[]`) | NEmpty | 无数据占位 |
| 加载中 | NSkeleton | 数据加载占位 |

### Request 字段 → 输入组件

| 字段类型 | 输入组件 | 示例 |
|---------|---------|------|
| `string` (短文本) | NInput + NLabel (via NField) | 名称、标题输入 |
| `string` (长文本) | NTextarea | 描述、内容输入 |
| `string` (enum, ≤5 选项) | NRadioGroup / NSelect | 类型选择、状态选择 |
| `string` (enum, >5 选项) | NCombobox | 可搜索下拉选择 |
| `number` | NInput (type=number) | 价格、数量 |
| `number` (range) | NSlider | 数值范围 (如 0-100) |
| `boolean` | NSwitch / NCheckbox | 是否启用 |
| `date` | NDatePicker | 日期选择 |
| `datetime` | NDatePicker (含时间) | 日期时间选择 |
| `date-range` | NDatePicker (range mode) | 开始-结束日期 |
| `file/image` | NInput (type=file) | 图片上传 |
| `array<string>` (≤10) | NCheckbox | 多标签勾选 |
| `array<string>` (>10) | NCombobox (多选) | 可搜索多选 |
| `array<object>` | 动态表单 (NInputGroup[]) | 多条目输入 |
| `otp/验证码` | NInputOTP | 6 位验证码输入 |

### 字段 → 组件决策树

```
字段出现在 Response (GET)?
├── Yes → 展示组件
│   ├── 类型是 array<object>? → NDataTable (列表) / NAccordion (分组)
│   ├── 类型是 string:enum? → NBadge
│   ├── 类型是 string:image? → NAvatar / NCard media
│   ├── 类型是 number (percentage)? → NProgress
│   ├── 类型是 array<number>? → NChart
│   ├── 数据为空? → NEmpty
│   └── 其他 → NText
│
└── No → 出现在 Request (POST/PUT)?
    ├── Yes → 输入组件
    │   ├── 类型是 string:enum?
    │   │   ├── 选项 ≤ 5? → NRadioGroup / NSelect
    │   │   └── 选项 > 5? → NCombobox
    │   ├── 类型是 boolean? → NSwitch
    │   ├── 类型是 date? → NDatePicker
    │   ├── 类型是 number:range? → NSlider
    │   ├── 类型是 string:long? → NTextarea
    │   ├── 类型是 otp? → NInputOTP
    │   └── 其他 string/number → NInput
    └── 每个输入字段用 NField 包装 (NLabel + 输入组件 + 错误提示)
```

## 映射规则 JSON 格式

### component-api-mapping.json

```jsonc
{
  "version": "2.0.0",
  "fieldTypeMapping": {
    "display": {
      "string":           { "component": "NText", "props": {} },
      "string:long":      { "component": "NText", "props": { "multiline": true } },
      "string:url":       { "component": "NCard", "slot": "media" },
      "string:image":     { "component": "NAvatar", "props": {} },
      "string:enum":      { "component": "NBadge", "props": {} },
      "number":           { "component": "NText", "props": {} },
      "number:percentage":{ "component": "NProgress", "props": {} },
      "boolean":          { "component": "NBadge", "props": { "variant": "status" } },
      "date":             { "component": "NText", "props": { "format": "date" } },
      "datetime":         { "component": "NText", "props": { "format": "datetime" } },
      "array:object":     { "component": "NDataTable", "props": {} },
      "array:object:grouped": { "component": "NAccordion", "props": {} },
      "array:string":     { "component": "NBadge", "props": { "multiple": true } },
      "array:number":     { "component": "NChart", "props": {} },
      "object:user":      { "component": "NAvatar", "props": { "withName": true } },
      "object:nested":    { "component": "NHoverCard", "props": {} },
      "null":             { "component": "NEmpty", "props": {} },
      "loading":          { "component": "NSkeleton", "props": {} }
    },
    "input": {
      "string":           { "component": "NInput", "wrapper": "NField", "props": {} },
      "string:long":      { "component": "NTextarea", "wrapper": "NField", "props": {} },
      "string:enum:few":  { "component": "NSelect", "props": {}, "note": "≤5 选项用 NSelect 或 NRadioGroup" },
      "string:enum":      { "component": "NCombobox", "props": {}, "note": ">5 选项用 NCombobox (可搜索)" },
      "number":           { "component": "NInput", "wrapper": "NField", "props": { "type": "number" } },
      "number:range":     { "component": "NSlider", "props": {} },
      "boolean":          { "component": "NSwitch", "props": {} },
      "date":             { "component": "NDatePicker", "props": {} },
      "datetime":         { "component": "NDatePicker", "props": { "showTime": true } },
      "date-range":       { "component": "NDatePicker", "props": { "mode": "range" } },
      "file":             { "component": "NInput", "props": { "type": "file" } },
      "array:string:few": { "component": "NCheckbox", "props": {}, "note": "≤10 选项用 NCheckbox" },
      "array:string":     { "component": "NCombobox", "props": { "multiple": true }, "note": ">10 选项用多选 NCombobox" },
      "array:object":     { "component": "NInputGroup", "props": { "dynamic": true } },
      "otp":              { "component": "NInputOTP", "props": { "length": 6 } }
    }
  },
  "apiPatternMapping": {
    "GET /list": {
      "pagePattern": "list-page",
      "primaryComponent": "NDataTable",
      "supportComponents": ["NInputGroup", "NButton", "NBadge", "NDropdownMenu", "NPagination", "NEmpty", "NSkeleton"],
      "description": "列表页：表格展示 + 搜索过滤 + 操作按钮 + 分页 + 空状态 + 加载骨架"
    },
    "GET /:id": {
      "pagePattern": "detail-page",
      "primaryComponent": "NCard",
      "supportComponents": ["NText", "NBadge", "NAvatar", "NButton", "NTabs", "NAccordion", "NBreadcrumb", "NHoverCard"],
      "description": "详情页：卡片展示 + 状态标签 + Tab 分区 + 面包屑导航"
    },
    "GET /stats": {
      "pagePattern": "dashboard",
      "primaryComponent": "NCard",
      "supportComponents": ["NChart", "NProgress", "NText", "NBadge"],
      "description": "仪表盘：统计卡片 + 图表 + 进度展示"
    },
    "POST /": {
      "pagePattern": "create-form",
      "primaryComponent": "NDialog",
      "supportComponents": ["NField", "NInput", "NTextarea", "NCombobox", "NSelect", "NSwitch", "NDatePicker", "NCheckbox", "NRadioGroup", "NSlider", "NButton"],
      "description": "创建表单：弹窗 + 输入字段 + 提交按钮"
    },
    "POST /auth": {
      "pagePattern": "auth-form",
      "primaryComponent": "NCard",
      "supportComponents": ["NInput", "NInputOTP", "NButton", "NField"],
      "description": "认证表单：登录/注册/验证码"
    },
    "PUT /:id": {
      "pagePattern": "edit-form",
      "primaryComponent": "NSheet",
      "supportComponents": ["NField", "NInput", "NTextarea", "NCombobox", "NSelect", "NSwitch", "NDatePicker", "NCheckbox", "NRadioGroup", "NSlider", "NButton"],
      "description": "编辑表单：侧边面板 + 预填字段 + 保存按钮"
    },
    "DELETE /:id": {
      "pagePattern": "delete-confirm",
      "primaryComponent": "NAlertDialog",
      "supportComponents": ["NText", "NButton"],
      "description": "删除确认：强制确认弹窗 + 警告文案 + 确认/取消按钮"
    }
  },
  "compositePatterns": {
    "CRUD": {
      "description": "当同一资源同时有 GET/POST/PUT/DELETE 时，生成完整 CRUD 页面",
      "layout": {
        "navigation": "NBreadcrumb (页面层级)",
        "main": "NDataTable (GET /list) + NPagination",
        "toolbar": "NButton (新建) + NInputGroup (搜索)",
        "createModal": "NDialog (POST /) + NField[] (表单字段)",
        "editPanel": "NSheet (PUT /:id) + NField[] (表单字段)",
        "deleteConfirm": "NAlertDialog (DELETE /:id)",
        "rowActions": "NDropdownMenu / NContextMenu (编辑/删除)",
        "feedback": "NToast (操作结果)",
        "loading": "NSkeleton (数据加载中)",
        "empty": "NEmpty (无数据)"
      }
    },
    "dashboard": {
      "description": "多个 GET 接口聚合成仪表盘",
      "layout": {
        "navigation": "NSidebar (侧边导航) + NBreadcrumb",
        "cards": "NCard[] (各指标卡片) + NProgress",
        "charts": "NChart[] (图表组件)",
        "table": "NDataTable (最近数据) + NPagination",
        "loading": "NSkeleton (加载中)"
      }
    },
    "detail-with-tabs": {
      "description": "详情页包含多个数据维度时，用 Tab 分区展示",
      "layout": {
        "navigation": "NBreadcrumb (返回列表)",
        "header": "NCard (基本信息) + NAvatar + NBadge",
        "tabs": "NTabs (数据分区)",
        "tabContent": "NDataTable / NAccordion / NCard[] (各 Tab 内容)",
        "actions": "NButton + NDropdownMenu"
      }
    }
  }
}
```

## 验收标准

| # | 标准 |
|---|------|
| 1 | 全部 53 个 neuron 组件都有明确的 API 角色标注 |
| 2 | 每种 API 字段类型都有对应的展示/输入组件映射 |
| 3 | 字段 → 组件决策树逻辑清晰，支持按选项数量自动选择组件 |
| 4 | 常见 API 模式 (CRUD, Dashboard, Detail-with-tabs, Auth) 都有预定义的页面模式 |
| 5 | 映射规则以 JSON 格式存储 (v2.0.0)，可被生成引擎直接消费 |
| 6 | 映射支持扩展 — 可添加新的字段类型和 API 模式 |

## 任务拆解

| 优先级 | 任务 |
|--------|------|
| P0 | 完成 53 个组件的接口类型标注 (已完成) |
| P0 | 定义字段类型 → 组件映射规则 (含决策树) |
| P0 | 定义 API 模式 → 页面模式映射 (含 GET /stats, POST /auth) |
| P1 | 实现 component-api-mapping.json v2.0.0 格式和 JSON Schema 校验 |
| P1 | 定义复合模式 (CRUD, Dashboard, Detail-with-tabs) |
| P1 | 实现字段 → 组件决策树的可执行逻辑 |
| P2 | 映射规则可视化文档 |
| P2 | 添加更多 compositePatterns (列表+详情联动、表单向导等) |
