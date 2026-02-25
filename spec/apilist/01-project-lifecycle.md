# Project Lifecycle API List

> **格式约定：**
>
> - 本文件列出支撑 `spec/testcase/01-project-lifecycle.md` 所有测试用例所需的 API。
> - 每条 API 包含：接口层级（Tauri Command / Capability / Tauri Event）、名称、说明、关联 TC、状态（已实现 / 待实现）。
> - Tauri Command 是前端通过 IPC 调用的入口；Capability 是 Engine 内部通过 `execute_command` 分发的能力处理器；Tauri Event 是后端向前端广播的事件。

---

## 接口层级说明

| 层级 | 调用方式 | 说明 |
|------|---------|------|
| **Tauri Command** | 前端 `invoke('command_name', {...})` | 前后端 IPC 入口，由 `#[tauri::command] #[specta]` 导出 |
| **Capability** | 通过 `execute_command` 分发至 `CapabilityHandler` | Engine Actor 内部处理，遵循 certificator → handler → events 流程 |
| **Tauri Event** | 前端 `listen('event_name', callback)` | 后端广播至前端的异步通知 |

---

## 1 Journey 1：创建与初始化 Project

### API-PROJ-01：create_file — 创建新 Project

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-PROJ-001, TC-PROJ-003, TC-PROJ-004, TC-PROJ-005 |

**说明**
创建一个新的 `.elf` 文件（ZIP 归档），自动初始化内部 `_eventstore.db`、`_snapshot`、`_blocks_hash`、`_blocks_relation`。创建后为该文件启动 Engine Actor，分配唯一标识（UUID），并将文件注册到 EngineManager。

**请求**

```typescript
invoke('create_file', {
  path: string,     // 文件保存路径
  name: string,     // Project 名称
})
```

**响应**

```typescript
Result<FileInfo, string>
// FileInfo: { file_id: string, name: string, path: string, created_at: string }
```

---

### API-PROJ-02：open_file — 打开已有 Project

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-PROJ-002, TC-PROJ-003, TC-PROJ-005, TC-PROJ-900, TC-PROJ-901 |

**说明**
打开一个已存在的 `.elf` 文件，启动 Engine Actor，从 `_eventstore.db` 回放所有事件重建内存状态（State Projection）。打开后 Project 进入 active 状态。若文件不存在或格式损坏则返回错误。

**请求**

```typescript
invoke('open_file', {
  path: string,     // .elf 文件路径
})
```

**响应**

```typescript
Result<FileInfo, string>
// 成功：返回文件信息
// 失败：文件不存在 / ZIP 损坏 / eventstore 不完整
```

---

### API-PROJ-03：list_open_files — 列出 Project Library

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-PROJ-004 |

**说明**
返回当前 EngineManager 中所有已打开的 Project 列表，包含每个 Project 的唯一标识、名称、路径和创建时间。

**请求**

```typescript
invoke('list_open_files')
```

**响应**

```typescript
Result<FileInfo[], string>
```

---

### API-PROJ-04：get_file_info — 获取 Project 信息

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-PROJ-005 |

**说明**
返回指定 Project 的元信息，包含 file_id（UUID）、名称、路径、创建时间等。用于验证 Project 唯一标识的稳定性。

**请求**

```typescript
invoke('get_file_info', {
  fileId: string,
})
```

**响应**

```typescript
Result<FileInfo, string>
```

---

### API-PROJ-05：close_file — 关闭 Project

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-PROJ-005 |

**说明**
关闭指定的 Project，停止对应 Engine Actor，将最终状态持久化到 `.elf` 文件。用于 TC-PROJ-005 验证关闭后重新打开标识的一致性。

**请求**

```typescript
invoke('close_file', {
  fileId: string,
})
```

**响应**

```typescript
Result<null, string>
```

---

## 2 Journey 2：准备执行环境

### API-ENV-01：execute_command (directory.import) — 引入代码仓库

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现 |
| **关联 TC** | TC-ENV-001 |

**说明**
通过 `directory.import` 能力将外部代码仓库引入 Project，在 `.elf` 归档内建立对应的 Block 目录结构。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,          // UUID
    editor_id: string,
    cap_id: 'directory.import',
    block_id: string,        // 目标 Block ID
    payload: {
      path: string,          // 外部仓库路径
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
```

---

### API-ENV-02：create_editor — 创建 Agent（Editor）

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-ENV-002 |

**说明**
在 Project 中创建一个新的 Editor 实体（人类或 Agent），分配唯一 `editor_id`。Agent 类型的 Editor 通过 `editor_type: "Bot"` 标识。

**请求**

```typescript
invoke('create_editor', {
  fileId: string,
  name: string,
  editorType: 'Human' | 'Bot',
})
```

**响应**

```typescript
Result<Editor, string>
// Editor: { editor_id: string, name: string, editor_type: 'Human' | 'Bot' }
```

---

### API-ENV-03：execute_command (core.grant) — 为 Agent 授权

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现 |
| **关联 TC** | TC-ENV-002, TC-ENV-005 |

**说明**
通过 `core.grant` 能力为指定 Editor 授予在特定 Block 上的 Capability 权限。支持 `block_id = "*"` 进行通配授权。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,       // 授权发起者（需为 Owner 或 Admin）
    cap_id: 'core.grant',
    block_id: string,        // 任意已有 Block（grant 操作的锚点）
    payload: {
      target_editor: string, // 被授权的 editor_id
      capability: string,    // 被授予的 cap_id（如 'markdown.write'）
      target_block: string,  // 授权范围 Block ID 或 "*"
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// 成功：产生 grant Event
// 失败：授权者权限不足 → command_rejected
```

---

### API-ENV-04：agent_enable — 启用 Agent

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-ENV-002, TC-ENV-004 |

**说明**
启用已创建的 Agent，使其在 Project 中具备活跃状态，可参与 Command 的执行。启用时可自动为 Agent 授予默认的 Capability 集合。

**请求**

```typescript
invoke('agent_enable', {
  fileId: string,
  editorId: string,
})
```

**响应**

```typescript
Result<null, string>
```

---

### API-ENV-05：check_permission — 检查 CBAC 权限

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-ENV-005, TC-TDEF-900, TC-TVERIFY-900 |

**说明**
检查指定 Editor 是否具备在指定 Block 上执行指定 Capability 的权限。不产生事件，仅返回布尔结果。

**请求**

```typescript
invoke('check_permission', {
  fileId: string,
  editorId: string,
  capId: string,
  blockId: string,
})
```

**响应**

```typescript
Result<boolean, string>
```

---

### API-ENV-06：list_grants — 查询授权列表

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-ENV-005 |

**说明**
列出当前 Project 中所有的 CapabilitiesGrant 记录，用于审查 Agent 和 Editor 的权限分配情况。

**请求**

```typescript
invoke('list_grants', {
  fileId: string,
})
```

**响应**

```typescript
Result<Grant[], string>
// Grant: { editor_id: string, cap_id: string, block_id: string }
```

---

## 3 Journey 3：定义 Task

### API-TDEF-01：execute_command (core.create) — 创建 Task Block

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现 |
| **关联 TC** | TC-TDEF-001, TC-TDEF-002, TC-TDEF-003, TC-TDEF-006, TC-TDEF-900 |

**说明**
通过 `core.create` 创建一个 `block_type = "task"` 的 Block，Block.contents 存储任务目标、约束条件、验收标准和 Task Type。创建后 Task 处于 `defined` 状态。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'core.create',
    block_id: '',              // 新建时为空
    payload: {
      name: string,            // Task 名称
      block_type: 'task',
      source: 'outline',
      metadata: {
        task_type: string,     // Task Type（实验分组依据）
        objective: string,     // 任务目标
        constraints: string[], // 约束条件
        acceptance: string[],  // 验收标准
      }
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// 成功：create Event，entity 为新 block_id
// 失败：权限不足 → command_rejected
```

---

### API-TDEF-02：execute_command (core.link) — 将 Task 挂载到 Project

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现 |
| **关联 TC** | TC-TDEF-002 |

**说明**
通过 `core.link` 将 Task Block 与 Project 根 Block 建立 `implement` 类型的父子关系，确保 Task 归属于当前 Project。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'core.link',
    block_id: string,          // 父 Block（Project 根）
    payload: {
      relation: 'implement',
      target_id: string,       // Task Block ID
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
```

---

### API-TDEF-03：execute_command (task.write) — 编写 / 修改 Task 定义

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现 |
| **关联 TC** | TC-TDEF-003, TC-TDEF-005, TC-TDEF-006 |

**说明**
通过 `task.write` 更新 Task Block 的 contents（目标、约束、验收标准、关联 Skill 列表等）。仅在 Task 处于 `defined` 或 `needs_fix` 状态时允许修改定义。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.write',
    block_id: string,          // Task Block ID
    payload: {
      content: string,         // Task 定义内容（JSON 序列化）
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
```

---

### API-TDEF-04：execute_command (core.link) — 引用历史 Task

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 需扩展（当前 relation 仅支持 `implement`，需增加 `reference` 类型） |
| **关联 TC** | TC-TDEF-004, TC-TVERIFY-007 |

**说明**
通过 `core.link` 建立 `reference` 类型关系，将新 Task 与历史 Task（成功归档或失败归档）关联，使执行者可访问历史上下文。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'core.link',
    block_id: string,          // 当前 Task Block ID
    payload: {
      relation: 'reference',   // ⚠️ 待扩展：当前仅支持 'implement'
      target_id: string,       // 被引用的历史 Task Block ID
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
```

---

### API-TDEF-05：get_block — 读取 Task 定义

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-TDEF-006, TC-TVERIFY-001, TC-TVERIFY-002 |

**说明**
读取指定 Block 的完整信息（含 contents、children、metadata），可用于获取 Task 的定义状态和内容。

**请求**

```typescript
invoke('get_block', {
  fileId: string,
  blockId: string,
})
```

**响应**

```typescript
Result<Block, string>
// Block: { block_id, name, block_type, contents, children, owner, metadata }
```

---

## 4 Journey 4：执行 Task

### API-TEXEC-01：task.start — 启动 Task 执行

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TEXEC-001, TC-TEXEC-900 |

**说明**
将 Task 状态从 `defined`（或 `needs_fix`）变更为 `executing`，同时创建一个 Session 并将其与 Task 绑定。产生 `task.start` 事件记录状态变更。若 Task 不存在或已被删除，则拒绝操作。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.start',
    block_id: string,          // Task Block ID
    payload: {
      session_id: string,     // 新建 Session 的标识
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// 成功：task.start Event（state: defined → executing, session_id 绑定）
// 失败：Task 不存在 / 状态不允许启动
```

---

### API-TEXEC-02：execute_command (各 Capability) — 关联代码修改

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现（EAVT 模型天然支持） |
| **关联 TC** | TC-TEXEC-002 |

**说明**
Task 执行过程中，所有通过 `execute_command` 发起的操作（`markdown.write`、`code.write` 等）自动在 Event.attribute 中记录 `{editor_id}/{cap_id}`，天然与当前 Task 关联（通过 Session 绑定和事件时间线）。无需额外 API。

---

### API-TEXEC-03：task.record — 记录执行过程事件

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TEXEC-003, TC-TEXEC-004 |

**说明**
记录 Task 执行过程中的澄清、对话、验证结果等非代码类事件。这些事件与 Task 关联存储，作为执行过程的审计线索。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.record',
    block_id: string,           // Task Block ID
    payload: {
      record_type: 'conversation' | 'clarification' | 'verification' | 'test_result',
      content: string,          // 记录内容（JSON 或 Markdown）
      result?: 'pass' | 'fail', // 仅 verification / test_result 类型
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
```

---

### API-TEXEC-04：task.summarize — 提交 / 修订阶段性总结

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TEXEC-005 |

**说明**
AI 或 Dev 提交阶段性总结，Dev 可确认或修订。修订时保留原始版本和修订版本，形成可对比的决策演进记录。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.summarize',
    block_id: string,           // Task Block ID
    payload: {
      action: 'create' | 'confirm' | 'revise',
      summary: string,          // 总结内容
      original_event_id?: string, // revise 时指向被修订的总结事件
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
```

---

### API-TEXEC-05：task.bind_session — 绑定 Session 到 Task

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TEXEC-006 |

**说明**
将一个新的 Session 绑定到已处于 `executing` 状态的 Task（用于中断恢复、多日执行场景）。一个 Task 可绑定多个 Session。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.bind_session',
    block_id: string,           // Task Block ID
    payload: {
      session_id: string,      // 新 Session 标识
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
```

---

## 5 Journey 5：提交 Task 结果

### API-TCOMMIT-01：task.commit — 提交 Task

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现 |
| **关联 TC** | TC-TCOMMIT-001, TC-TCOMMIT-003, TC-TCOMMIT-004, TC-TCOMMIT-900 |

**说明**
将 Task 状态从 `executing` 变更为 `submitted`，生成包含提交时间戳（vector clock）和提交者信息的 Commit Event。提交后 Task 执行内容被冻结。并发提交时，Engine Actor 串行处理，后到的 Command 因 vector clock 冲突被拒绝。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.commit',
    block_id: string,           // Task Block ID
    payload: {},
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// 成功：task.commit Event（state: executing → submitted）
// 失败：vector clock 冲突 → command_rejected
```

---

### API-TCOMMIT-02：task.export_snapshot — 导出 Task 快照

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TCOMMIT-002, TC-TCOMMIT-005 |

**说明**
导出与 Task 关联的所有 Block 的当前文件状态，生成稳定快照。快照包含 Block.contents 和关联 resource 的完整数据，可用于外部复现和验证。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.export_snapshot',
    block_id: string,           // Task Block ID
    payload: {
      output_path?: string,    // 可选导出路径
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// Event.value 包含快照摘要信息
```

---

### API-TCOMMIT-03：get_state_at_event — 回放至指定事件时刻

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-TCOMMIT-005 |

**说明**
根据指定的 Event ID，回放 `_eventstore.db` 中截至该事件时刻的所有 Event，重建彼时的完整 Block 状态。用于验证提交结果的可复现性。

**请求**

```typescript
invoke('get_state_at_event', {
  fileId: string,
  eventId: string,
})
```

**响应**

```typescript
Result<{ blocks: Block[], editors: Editor[], grants: Grant[] }, string>
```

---

## 6 Journey 6：PM 验证 Task 结果

### API-TVERIFY-01：task.read — 读取 Task 完整信息

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | 已实现 |
| **关联 TC** | TC-TVERIFY-001, TC-TVERIFY-002 |

**说明**
读取 Task Block 的完整信息，包含原始定义（目标、约束、验收标准）和当前实现状态。PM 用此接口审查已提交 Task。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.read',
    block_id: string,           // Task Block ID
    payload: {},
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// Event.value 包含 Task 完整内容
```

---

### API-TVERIFY-02：get_all_events — 获取 Task 关联事件历史

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现 |
| **关联 TC** | TC-TVERIFY-002, TC-TVERIFY-005 |

**说明**
获取 Project 的完整事件历史。前端可按 Task Block ID 过滤，获取与 Task 关联的所有验证事件、阶段性总结和执行过程记录。

**请求**

```typescript
invoke('get_all_events', {
  fileId: string,
})
```

**响应**

```typescript
Result<Event[], string>
// 前端按 Event.entity 过滤特定 Task 的事件
```

---

### API-TVERIFY-03：task.verify — PM 验证 Task

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TVERIFY-003, TC-TVERIFY-004, TC-TVERIFY-005, TC-TVERIFY-900 |

**说明**
PM 对已提交的 Task 进行验证，给出 `approved` 或 `needs_fix` 结论。验证通过时 Task 状态变更为 `verified`；验证未通过时变更为 `needs_fix`，可回到 `executing` 状态。验证结论作为独立 Event 节点存储。仅具备验证权限的 Editor 可执行此操作。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,          // PM 的 editor_id
    cap_id: 'task.verify',
    block_id: string,           // Task Block ID
    payload: {
      verdict: 'approved' | 'needs_fix',
      reason: string,           // 验证理由
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// 成功：task.verify Event（包含 verdict 和 reason）
// 失败：权限不足 → command_rejected
```

---

### API-TVERIFY-04：task.reject — PM 明确否定 Task

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TVERIFY-006, TC-TVERIFY-007 |

**说明**
PM 认为 Task 存在根本性问题，将其标记为 `rejected`。与 `needs_fix` 不同，`rejected` 表示该实现路径被彻底否定。否定原因和实现路径被完整保留，可被未来新 Task 引用作为失败经验。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,          // PM 的 editor_id
    cap_id: 'task.reject',
    block_id: string,           // Task Block ID
    payload: {
      reason: string,           // 否定理由
      failure_points: string[], // 关键失败节点
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// task.reject Event（state: submitted → rejected）
```

---

## 7 Journey 7：归档完成的 Task

### API-TARCH-01：task.archive — 归档 Task

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TARCH-001, TC-TARCH-002, TC-TARCH-003, TC-TARCH-900 |

**说明**
对已验证（`verified`）的 Task 发起归档。系统自动生成归档文档（汇总定义、实现、验证与关联关系），Task 状态变更为 `archived`。归档后 Task 不可再被修改，成为长期知识资产。若 Task 未经验证（非 `verified` 状态），操作被拒绝。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.archive',
    block_id: string,           // Task Block ID
    payload: {},
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// task.archive Event（state: verified → archived）
// Event.value 包含归档文档摘要
```

---

### API-TARCH-02：get_all_blocks (filter: task, archived) — 检索归档 Task

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | 已实现（需前端按条件过滤） |
| **关联 TC** | TC-TARCH-004 |

**说明**
获取 Project 中所有可见 Block，前端按 `block_type = "task"` 和归档状态过滤，用于检索同一 Task Type 的成功归档作为 Second-use 参考。

**请求**

```typescript
invoke('get_all_blocks', {
  fileId: string,
})
```

**响应**

```typescript
Result<Block[], string>
// 前端过滤：block_type === 'task' && contents.status === 'archived'
```

---

## 8 Journey 8：归档被否定的 Task

### API-TARCH-03：task.archive_rejected — 归档被否定 Task

| 属性 | 值 |
|------|-----|
| **层级** | Capability（通过 `execute_command` 调用） |
| **状态** | **待实现** |
| **关联 TC** | TC-TARCH-010, TC-TARCH-011, TC-TARCH-012 |

**说明**
对被否定（`rejected`）的 Task 发起归档。系统生成「失败归档记录」，完整保留原始目标、实现路径、否定理由和关键失败节点。Task 状态变更为 `archived_rejected`，不可再进入执行状态。

**请求**

```typescript
invoke('execute_command', {
  fileId: string,
  cmd: {
    cmd_id: string,
    editor_id: string,
    cap_id: 'task.archive_rejected',
    block_id: string,           // Task Block ID（状态为 rejected）
    payload: {
      failure_analysis?: string, // 可选附加失败分析
    },
    timestamp: string,
  }
})
```

**响应**

```typescript
Result<Event[], string>
// task.archive_rejected Event（state: rejected → archived_rejected）
```

---

### API-TARCH-04：task.search_archives — 检索历史归档

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Command |
| **状态** | **待实现** |
| **关联 TC** | TC-TARCH-004, TC-TARCH-012, TC-TARCH-013 |

**说明**
按 Task Type 和归档状态检索历史归档 Task，返回匹配的成功归档和失败归档列表。用于 Second-use 场景中呈现参考上下文。

**请求**

```typescript
invoke('task_search_archives', {
  fileId: string,
  taskType: string,              // 筛选条件：Task Type
  archiveStatus?: 'archived' | 'archived_rejected' | 'all', // 默认 'all'
})
```

**响应**

```typescript
Result<Block[], string>
// 返回匹配的归档 Task Block 列表，按归档时间倒序排列
```

---

## 9 Tauri Events（后端 → 前端广播）

### EVENT-01：state_changed — 状态变更通知

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Event |
| **状态** | 已实现 |
| **关联 TC** | TC-PROJ-003, TC-ENV-004, TC-TEXEC-002 |

**说明**
Engine Actor 在 Commit 事件后向所有连接的前端广播 `state_changed` 事件，携带变更的 Event 列表。前端据此更新 UI 状态。

**Payload**

```typescript
{
  file_id: string,
  events: Event[],
}
```

---

### EVENT-02：command_rejected — 命令被拒绝

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Event |
| **状态** | 已实现 |
| **关联 TC** | TC-ENV-005, TC-TDEF-900, TC-TCOMMIT-900, TC-TVERIFY-900, TC-TARCH-900 |

**说明**
当 Engine Actor 拒绝 Command 执行（权限校验失败或状态冲突）时广播此事件，携带拒绝原因。

**Payload**

```typescript
{
  file_id: string,
  cmd_id: string,
  reason: string,
}
```

---

### EVENT-03：command_failed — 命令执行失败

| 属性 | 值 |
|------|-----|
| **层级** | Tauri Event |
| **状态** | 已实现 |
| **关联 TC** | TC-PROJ-900, TC-PROJ-901, TC-TEXEC-900 |

**说明**
当 Command 通过了权限校验但在 handler 执行过程中发生错误时广播此事件。

**Payload**

```typescript
{
  file_id: string,
  cmd_id: string,
  error: string,
}
```

---

## 10 API 与 TC 交叉索引

| API ID | API 名称 | 关联 TC |
|--------|---------|---------|
| API-PROJ-01 | `create_file` | TC-PROJ-001, 003, 004, 005 |
| API-PROJ-02 | `open_file` | TC-PROJ-002, 003, 005, 900, 901 |
| API-PROJ-03 | `list_open_files` | TC-PROJ-004 |
| API-PROJ-04 | `get_file_info` | TC-PROJ-005 |
| API-PROJ-05 | `close_file` | TC-PROJ-005 |
| API-ENV-01 | `directory.import` | TC-ENV-001 |
| API-ENV-02 | `create_editor` | TC-ENV-002 |
| API-ENV-03 | `core.grant` | TC-ENV-002, 005 |
| API-ENV-04 | `agent_enable` | TC-ENV-002, 004 |
| API-ENV-05 | `check_permission` | TC-ENV-005, TC-TDEF-900, TC-TVERIFY-900 |
| API-ENV-06 | `list_grants` | TC-ENV-005 |
| API-TDEF-01 | `core.create` (task) | TC-TDEF-001, 002, 003, 006, 900 |
| API-TDEF-02 | `core.link` (implement) | TC-TDEF-002 |
| API-TDEF-03 | `task.write` | TC-TDEF-003, 005, 006 |
| API-TDEF-04 | `core.link` (reference) | TC-TDEF-004, TC-TVERIFY-007 |
| API-TDEF-05 | `get_block` | TC-TDEF-006, TC-TVERIFY-001, 002 |
| API-TEXEC-01 | `task.start` | TC-TEXEC-001, 900 |
| API-TEXEC-02 | `execute_command` (通用) | TC-TEXEC-002 |
| API-TEXEC-03 | `task.record` | TC-TEXEC-003, 004 |
| API-TEXEC-04 | `task.summarize` | TC-TEXEC-005 |
| API-TEXEC-05 | `task.bind_session` | TC-TEXEC-006 |
| API-TCOMMIT-01 | `task.commit` | TC-TCOMMIT-001, 003, 004, 900 |
| API-TCOMMIT-02 | `task.export_snapshot` | TC-TCOMMIT-002, 005 |
| API-TCOMMIT-03 | `get_state_at_event` | TC-TCOMMIT-005 |
| API-TVERIFY-01 | `task.read` | TC-TVERIFY-001, 002 |
| API-TVERIFY-02 | `get_all_events` | TC-TVERIFY-002, 005 |
| API-TVERIFY-03 | `task.verify` | TC-TVERIFY-003, 004, 005, 900 |
| API-TVERIFY-04 | `task.reject` | TC-TVERIFY-006, 007 |
| API-TARCH-01 | `task.archive` | TC-TARCH-001, 002, 003, 900 |
| API-TARCH-02 | `get_all_blocks` | TC-TARCH-004 |
| API-TARCH-03 | `task.archive_rejected` | TC-TARCH-010, 011, 012 |
| API-TARCH-04 | `task_search_archives` | TC-TARCH-004, 012, 013 |
| EVENT-01 | `state_changed` | TC-PROJ-003, TC-ENV-004, TC-TEXEC-002 |
| EVENT-02 | `command_rejected` | TC-ENV-005, TC-TDEF-900, TC-TCOMMIT-900, TC-TVERIFY-900, TC-TARCH-900 |
| EVENT-03 | `command_failed` | TC-PROJ-900, 901, TC-TEXEC-900 |

---

## 11 实现状态汇总

| 状态 | 数量 | API 列表 |
|------|------|---------|
| **已实现** | 17 | create_file, open_file, list_open_files, get_file_info, close_file, directory.import, create_editor, core.grant, agent_enable, check_permission, list_grants, core.create, core.link (implement), task.write, task.read, task.commit, get_block, get_all_blocks, get_all_events, get_state_at_event, state_changed, command_rejected, command_failed |
| **待实现** | 8 | task.start, task.record, task.summarize, task.bind_session, task.export_snapshot, task.verify, task.reject, task.archive, task.archive_rejected, task_search_archives |
| **需扩展** | 1 | core.link（增加 `reference` 关系类型） |

---

## 12 Task 状态机

```
               ┌──────────────┐
               │   defined    │ ← core.create (block_type=task)
               └──────┬───────┘
                      │ task.start
                      ▼
               ┌──────────────┐
          ┌───►│  executing   │◄────────────────┐
          │    └──────┬───────┘                  │
          │           │ task.commit              │ task.start
          │           ▼                          │ (重新执行)
          │    ┌──────────────┐                  │
          │    │  submitted   │                  │
          │    └──┬───────┬───┘                  │
          │       │       │                      │
          │       │       │ task.verify          │
          │       │       │ (needs_fix)          │
          │       │       ▼                      │
          │       │  ┌──────────┐                │
          │       │  │needs_fix │────────────────┘
          │       │  └──────────┘
          │       │
          │       ├─ task.verify (approved)
          │       │       │
          │       │       ▼
          │       │  ┌──────────┐    task.archive
          │       │  │ verified │───────────────►┌──────────┐
          │       │  └──────────┘                │ archived │
          │       │                              └──────────┘
          │       │
          │       └─ task.reject
          │               │
          │               ▼
          │       ┌───────────┐  task.archive_rejected
          │       │ rejected  │──────────────►┌────────────────────┐
          │       └───────────┘               │ archived_rejected  │
          │                                   └────────────────────┘
          │
          └── (不可从 archived / archived_rejected 回退)
```
