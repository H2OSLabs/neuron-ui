# AI 编辑闭环系统设计文档

**日期：** 2026-03-04
**状态：** 已确认，待实现

---

## 一、系统定位

neuron-ui 不是一个预构建的通用组件库，而是一个**框架 + 方法论**：

> 给定任意项目的输入文档，AI 自动完成 shadcn 二次开发，生成该项目专属的 UI 组件库和页面，并提供可视化编辑器供产品/设计师日常迭代。

每个项目的组件都是独立生成的，风格完全由用户输入决定。

```
项目 A：输入 A  →  AI 二开 shadcn  →  A 专属组件 + 页面
项目 B：输入 B  →  AI 二开 shadcn  →  B 专属组件 + 页面
```

---

## 二、使用者

| 角色 | 职责 | 主要使用界面 |
|---|---|---|
| **开发者** | 项目初始化、提供输入文档、审查生成代码、维护组件源码 | MCP 客户端（Claude Code / Cursor）|
| **产品 / 设计师** | 日常迭代、调整属性、绑定事件、通过 AI 描述需求 | App-UI + Component Editor |

---

## 三、输入协议

用户提供的文档驱动 AI 生成，所有格式均可接受，AI 负责解析和标准化。

### 必选输入

| 输入 | 用途 | 可接受格式 |
|---|---|---|
| **数据源 / API** | 确定组件展示哪些字段、绑定哪些接口 | OpenAPI、Postman、cURL、文字描述 |
| **视觉风格** | 确定颜色、字体、间距、圆角等 shadcn 覆写变量 | Figma URL、Design Tokens、CSS 变量、截图、文字描述 |

### 推荐输入（显著提升质量）

| 输入 | 用途 | 可接受格式 |
|---|---|---|
| **Figma 设计稿** | 最直接的视觉参考，消除视觉歧义 | Figma URL、PNG/PDF、标注截图 |
| **TaskCase** | AI 理解组件用途而非仅看结构 | 任意文字或表格 |
| **User Journey** | AI 理解页面间流转，生成连贯体验 | 流程图、文字描述、Miro 截图 |
| **参考产品** | 快速对齐风格，"做成 Linear 风格"胜过逐一描述 | URL、截图 |

### 可选补充

| 输入 | 用途 |
|---|---|
| 现有代码示例 | AI 匹配团队编码规范 |
| 目标设备 / 平台 | 响应式策略决策 |
| 用户画像 | 影响交互复杂度 |
| 无障碍要求 | WCAG 合规的语义标签 |
| 性能要求 | 大数据量虚拟滚动等 |

---

## 四、核心架构：两层设计

```
┌──────────────────────────────────────────────────┐
│  Layer 1：组件层（项目专属，改动频率低）           │
│                                                  │
│  AI 基于 shadcn 二次开发生成的 .tsx 组件文件       │
│  UserTable.tsx / PageHeader.tsx / CreateDialog.tsx│
│  → 由开发者维护，通过 MCP + Chat 修改             │
└──────────────────────┬───────────────────────────┘
                       │ 组件注册
┌──────────────────────▼───────────────────────────┐
│  Layer 2：页面层（Page JSON，改动频率高）          │
│                                                  │
│  描述"哪些组件、在哪里、带什么 props、绑什么事件" │
│  由 Runtime 解析渲染                              │
│  → 由产品/设计师通过 Editor 和 MCP 修改           │
└──────────────────────┬───────────────────────────┘
                       │ 渲染
┌──────────────────────▼───────────────────────────┐
│  Runtime                                         │
│  读取 Page JSON → 使用 Layer 1 组件渲染完整页面   │
└──────────────────────────────────────────────────┘
```

**分层的价值：**
- 产品/设计师的日常操作只碰 Page JSON（Layer 2），不碰源码
- 开发者只需维护组件源码（Layer 1），页面编排由 AI 和产品负责
- AI 修改 Page JSON 比修改 TypeScript AST 更精准可控

---

## 五、Page JSON 格式

Page JSON 是系统的核心数据结构，既是页面描述，也是组件树的唯一真相。

```json
{
  "version": "1.0.0",
  "page": {
    "id": "user-management",
    "route": "/users",
    "label": "用户管理"
  },
  "dataSources": {
    "userList": {
      "api": "GET /api/users",
      "params": { "page": 1, "pageSize": 20 }
    },
    "createUser": {
      "api": "POST /api/users"
    }
  },
  "tree": [
    {
      "id": "page-header",
      "component": "PageHeader",
      "domAttr": "page-header",
      "props": {
        "title": "用户管理"
      }
    },
    {
      "id": "user-table",
      "component": "UserTable",
      "domAttr": "user-table",
      "props": {
        "columns": ["姓名", "邮箱", "角色", "操作"],
        "hoverable": true,
        "className": "flex-1"
      },
      "binding": {
        "dataSource": "userList",
        "fieldMap": {
          "user.name": "column:姓名",
          "user.email": "column:邮箱",
          "user.role": "column:角色"
        }
      },
      "events": {
        "onRowClick": {
          "action": "navigate",
          "target": "/users/:id"
        },
        "onSort": {
          "action": "callApi",
          "target": "userList",
          "merge": "params"
        }
      }
    },
    {
      "id": "create-dialog",
      "component": "CreateUserDialog",
      "domAttr": "create-dialog",
      "binding": {
        "dataSource": "createUser"
      },
      "events": {
        "onSubmit": {
          "action": "callApi",
          "onSuccess": "refresh:user-table"
        }
      }
    }
  ]
}
```

---

## 六、三个核心界面

### 6.1 App-UI（完整项目预览）

用户看到的是**跑起来的完整项目**，不是设计稿。

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌────────────────────────────────────┐   │
│  │ 页面导航      │  │          项目预览画布               │   │
│  │──────────────│  │                                    │   │
│  │ ▼ 用户管理   │  │  ┌────────────────────────────┐   │   │
│  │   └ PageHeader│  │  │ PageHeader                 │   │   │
│  │   └ UserTable │  │  │ [用户管理]       [+ 创建]  │   │   │
│  │   └ CreateDlg │  │  ├────────────────────────────┤   │   │
│  │               │  │  │ UserTable   ← hover 出现   │   │   │
│  │ ▶ 订单管理   │  │  │ ┌──────────────────────┐  │   │   │
│  │ ▶ 设置       │  │  │ │ [✎ 编辑] [◎ Chat]    │  │   │   │
│  │               │  │  │ └──────────────────────┘  │   │   │
│  │ [+ 添加页面] │  │  └────────────────────────────┘   │   │
│  └──────────────┘  └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**关键设计决策：**
- 左侧组件树直接读 **Page JSON tree**，不分析 DOM，100% 准确
- DOM 定位通过每个组件根元素的 `data-node-id` 属性实现（精准高亮）
- 点击 **[编辑]** → 进入 Component Editor
- 点击 **[Chat]** → 当前组件上下文自动同步给 MCP Server，用户在 AI 客户端里继续

---

### 6.2 Component Editor（单组件 / 页面编辑）

类似 Storybook 的隔离编辑体验，三个 Tab 覆盖所有编辑场景。

**Tab 1：属性**
```
┌──────────────────────────┐  ┌─────────────────────────┐
│      实时预览             │  │ 属性                     │
│                          │  │─────────────────────────│
│   UserTable              │  │ columns                 │
│   姓名  邮箱  角色        │  │  [姓名] [邮箱] [角色] + │
│                          │  │                         │
│                          │  │ hoverable   [ ● 开  ]   │
│                          │  │ striped     [ ○ 关  ]   │
│                          │  │ variant     [default ▼] │
│                          │  │ className   [flex-1   ] │
└──────────────────────────┘  └─────────────────────────┘
```

**Tab 2：事件**
```
┌─────────────────────────────────────────────────────┐
│ 事件            动作                                 │
│─────────────────────────────────────────────────────│
│ onRowClick  →  [导航到页面 ▼]   /users/:id           │
│                                                     │
│ onSort      →  [调用接口   ▼]   userList / 合并参数  │
│                                                     │
│ onRefresh   →  [暂无          + 添加]               │
│                                                     │
│ + 添加事件                                           │
└─────────────────────────────────────────────────────┘
```

事件面板的动作类型：

| 动作类型 | 说明 |
|---|---|
| 导航到页面 | 跳转到指定路由，支持动态参数 |
| 调用接口 | 触发 dataSource 中定义的 API |
| 刷新组件 | 重新加载指定组件的数据 |
| 显示 / 隐藏 | 控制另一个组件的可见性 |
| 更新状态 | 修改页面级共享状态 |

**Tab 3：数据绑定**
```
┌─────────────────────────────────────────────────────┐
│ 数据来源    [userList ▼]   GET /api/users            │
│ 参数        page: 1   pageSize: 20                  │
│                                                     │
│ 字段映射                                             │
│  API 字段        →   组件字段                        │
│  user.name       →   column: 姓名                   │
│  user.email      →   column: 邮箱                   │
│  user.role       →   column: 角色                   │
│  + 添加映射                                          │
└─────────────────────────────────────────────────────┘
```

---

### 6.3 MCP Server（AI 协作层）

系统不内嵌聊天 UI，而是暴露 MCP Server。用户使用自己偏好的 AI 客户端（Claude Code、Cursor、Windsurf）连接。

**Resources（AI 自动加载的上下文）：**

```
project://active-context          → 当前用户在 App-UI 选中的组件/页面
project://page-json/{pageId}      → 指定页面的完整 Page JSON
project://component/{name}        → 组件源码 .tsx
project://api-list                → 项目所有 API 端点
project://tokens                  → 设计 Token
project://manifest                → 所有页面和组件的注册表
```

**Tools（AI 可执行的操作）：**

```
generate_component      基于输入文档，shadcn 二开生成新组件 .tsx
edit_component          修改已有组件源码
register_component      将组件注册到 Runtime
create_page             生成新页面 Page JSON + 所需组件
update_page_json        更新页面的 props / events / binding
get_component_context   获取组件的完整上下文（源码 + props + 事件定义）
```

**App-UI 与 MCP 的联动：**

用户在 App-UI 选中组件 → App-UI 更新 `active-context` Resource → 用户在 AI 客户端里直接操作，AI 自动感知当前上下文，无需用户重复描述。

---

## 七、用户旅程

### 旅程 A：项目初始化（开发者，一次性）

```
提供输入文档
API list + Figma + TaskCase + User Journey + 参考产品
        ↓
AI 解析 & 标准化（统一转换成结构化上下文）
提取：数据字段 / 视觉规格 / 交互逻辑 / 页面流转
        ↓
AI 生成
→ 项目专属 .tsx 组件（shadcn 二开）
→ 每个页面的 Page JSON
→ 组件注册到 Runtime
        ↓
开发者在 App-UI 中审查生成结果
如有问题 → MCP 客户端中调整
        ↓
项目可用，移交给产品/设计师
```

### 旅程 B：日常属性迭代（产品/设计师，高频）

```
App-UI 中找到目标组件 → 悬停 → [编辑]
        ↓
Component Editor：调整属性 / 绑定事件 / 配置数据
        ↓
Page JSON 更新 → Runtime 热加载 → 画布实时更新
        ↓
满意后保存（可选：通知开发者 Review）
```

### 旅程 C：自然语言修改（产品/设计师，中频）

```
App-UI 中选中目标组件 → 悬停 → [Chat]
        ↓
active-context 自动同步到 MCP Server
        ↓
用户在 Claude Code（或 Cursor）里描述需求：
"把用户表格加一列创建时间，从 created_at 字段读取"
        ↓
AI 通过 MCP 调用：
  get_component_context("UserTable")  → 获取源码和 props
  edit_component(...)                 → 修改 .tsx 源码
  update_page_json(...)               → 更新 Page JSON
        ↓
Vite HMR 监听文件变更 → Runtime 重渲染 → App-UI 热加载
```

### 旅程 D：新增功能（开发者 + 产品协作）

```
产品在 MCP 客户端里：
"需要一个订单管理页面，API 是 GET /api/orders，
 参考附件的 Figma 截图"
        ↓
AI 调用 create_page + generate_component
→ 生成 OrderTable.tsx、OrderDetailDrawer.tsx
→ 生成 order-management 的 Page JSON
→ 自动注册到 Runtime
        ↓
App-UI 左侧导航出现"订单管理"页面
        ↓
产品在 Component Editor 微调细节
开发者 Review 源码，创建 PR
```

---

## 八、热加载机制

两种热加载，覆盖不同场景：

| 类型 | 触发 | 机制 | 速度 |
|---|---|---|---|
| **Page JSON 热加载** | Component Editor 修改属性/事件 | Runtime 监听 JSON 变更，重新解析渲染 | 即时 |
| **组件源码热加载** | AI 修改 .tsx 文件 | Vite HMR 推送新模块 | <1s |

两种热加载都不需要刷新页面，用户操作不中断。

---

## 九、AI 生成质量控制

AI 在生成和修改组件时，需要通过三个质量关卡：

```
1. 输入解析质量
   用户的 Figma / API / TaskCase 被正确理解
   → 标准化步骤：AI 先输出"我理解的需求是..."让用户确认

2. 组件生成质量
   .tsx 是否符合 shadcn 规范？
   Tailwind 类是否正确？
   是否正确覆写了 CSS 变量？
   → 验证规则 + 自动修复机制（参考现有 auto-fix.ts）

3. Page JSON 质量
   组件引用是否存在于注册表？
   事件动作是否合法？
   数据绑定字段是否匹配 API 结构？
   → Schema 校验器
```

---

## 十、关键设计约束

1. **Page JSON 是唯一真相** — 任何界面的修改都落地到 Page JSON，不存在 UI 状态和数据状态不一致的情况

2. **组件必须有 `data-node-id`** — 所有生成的组件根元素必须带此属性，否则 App-UI 的高亮定位失效

3. **Layer 1 和 Layer 2 的修改频率不同** — Layer 1（.tsx）改动应触发 Review 流程，Layer 2（Page JSON）改动可直接生效

4. **MCP Server 是系统的 AI 边界** — 所有 AI 操作通过 MCP Tools 执行，不直接操作文件系统，便于审计和回滚

---

## 十一、与现有 neuron-ui 的关系

| 现有模块 | 在本设计中的角色 |
|---|---|
| `@neuron-ui/components` | 参考实现，但每个项目生成自己的组件 |
| Page Schema 格式 | 直接复用，即本设计的 Page JSON |
| `@neuron-ui/runtime` | 直接复用，Layer 2 的渲染引擎 |
| `@neuron-ui/generator` | 扩展为通用生成引擎，支持任意风格 |
| `@neuron-ui/mcp-server` | 扩展为项目级 MCP Server |
| `@neuron-ui/codegen` | 扩展支持 Page JSON → .tsx 导出 |
| `@neuron-ui/page-builder` | 演进为本设计的 App-UI + Component Editor |
