# Project Lifecycle 测试用例

> **格式约定：** 每条用例仅描述「场景」与「预期结果」，不包含测试方法和执行过程。
>
> 本文件覆盖 Project 级别完整生命周期（创建 → 环境准备 → Task 定义 → 执行 → 提交 → 验证 → 归档），对应 User Journey UJ-PROJ-001 至 UJ-PROJ-008。

---

## 1 Journey 1：创建与初始化 Project

**TC-PROJ-001：创建新 Project（.elf 文件）**
用户通过 Elfiee 创建一个全新的 Project，系统生成对应的 `.elf` 文件（ZIP 归档），内部自动初始化 `_eventstore.db`（空事件日志）、`_snapshot`（空缓存）、`_blocks_hash` 和 `_blocks_relation` 等基础结构。创建完成后，该 Project 在 Project Library 中可见，并拥有稳定的唯一标识（UUID）。

**TC-PROJ-002：打开已有 Project**
用户打开一个已存在的 `.elf` 文件，系统启动对应的 Engine Actor（基于 tokio channel 的 mailbox 模式），从 `_eventstore.db` 回放全部事件重建内存状态（State Projection）。打开后，Project 进入 active 状态，后续所有 Command 均通过该 Actor 串行处理。

**TC-PROJ-003：Project 初始化事件记录机制**
创建或打开 Project 后，系统确保事件记录机制就绪：任何后续操作（创建 Block、授权 Grant、定义 Task 等）均以 EAVT 格式的 Event 原子性写入 `_eventstore.db`，每个 Event 包含 Entity（block_id/editor_id）、Attribute（`{editor_id}/{cap_id}`）、Value（JSON payload）和 Timestamp（vector clock）。

**TC-PROJ-004：Project 在 Project Library 中可见**
创建 Project 后，用户在 Project Library（项目列表）中可看到该 Project 条目，显示项目名称、创建时间等基本信息。同一用户可创建多个 Project，每个 Project 在列表中独立显示且互不干扰。

**TC-PROJ-005：Project 唯一标识的稳定性**
创建 Project 时系统分配唯一标识（UUID），该标识在 Project 的整个生命周期内不可变。关闭并重新打开同一 `.elf` 文件后，标识保持一致。所有归属于该 Project 的 Task、Block、Session 均通过此标识建立关联。

---

## 2 Journey 2：准备执行环境

**TC-ENV-001：将代码仓库引入 Project**
Dev 将外部代码仓库引入 Project 作为工作目录，系统在 `.elf` 归档内建立对应的 Block 目录结构（`block-{uuid}/`），使代码文件可被 Block 引用和管理。引入完成后，Project 具备可读写的代码上下文。

**TC-ENV-002：创建并启用 Agent**
在 Project 中创建一个 Agent（Editor 实体），系统为其分配 `editor_id`。通过 `core.grant` 能力为 Agent 授予在指定 Block 上的操作权限（CapabilitiesGrant 表）。Agent 创建后可作为 EAVT 事件中的 Attribute 主体参与后续操作。

**TC-ENV-003：创建并启用 Skill**
在 Project 中注册 Skill（Capability），每个 Skill 包含 `certificator`（权限校验逻辑）和 `handler`（执行逻辑）。注册完成后，Skill 在 CapabilityRegistry 中可查。Agent 可通过被授权的 Skill 执行对应操作。

**TC-ENV-004：AI 编程环境与 Project 建立连接**
重启或刷新外部 AI 编程环境后，该环境通过 Tauri IPC 与当前 Project 的 Engine Actor 建立通信连接。连接成功后，AI 编程环境可发送 Command 至 Engine，并接收 `state_changed` 事件广播，实现双向通信。

**TC-ENV-005：Agent 权限校验（CBAC）**
Agent 执行操作时，Engine 通过 CBAC（CapabilitiesGrant 表）验证其在目标 Block 上是否具有对应 Capability 的授权。仅当 Agent 为 Block 的 Owner 或持有显式 Grant 时操作被允许，否则 Engine 返回 `command_rejected` 事件。

---

## 3 Journey 3：定义 Task

**TC-TDEF-001：在 Project 中创建 Task**
PM 或 Dev 在 Project 中创建一个新 Task，系统通过 `core.create` 能力生成一个 Task Block（特定 block_type），Block.contents 以 JSON 格式存储任务目标、约束条件与验收标准。创建操作产生 `create` 类型 Event 并原子性写入 `_eventstore.db`。

**TC-TDEF-002：Task 作为 Project 中的一等对象**
创建后的 Task 拥有独立的 `block_id`，可被单独查询、引用和管理。Task Block 通过 `core.link` 与 Project 根 Block 建立父子关系（children relation），确保 Task 归属于当前 Project，并在 Block 关系图中可追溯。

**TC-TDEF-003：为 Task 指定 Task Type**
创建 Task 时指定明确的 Task Type（存储于 Block.contents），Task Type 作为后续实验分组与对比的依据。相同 Task Type 的多个 Task 可被按类检索和对比分析。

**TC-TDEF-004：引用历史 Task 作为参考上下文**
创建 Task 时可选择引用历史 Task（通过 `core.link` 建立 `reference` 类型关系），使新 Task 能访问已归档 Task 的定义、实现路径和验证结果，作为执行时的参考依据。

**TC-TDEF-005：引用 Skill 作为参考上下文**
创建 Task 时可选择关联已注册的 Skill（Capability），指明 Task 执行过程中预期使用的能力集合，为 Agent 和人类执行者提供操作范围的预期指引。

**TC-TDEF-006：未执行 Task 处于可理解的定义状态**
Task 创建后处于 `defined` 状态，此状态下 Task 可被阅读、修改定义、复制或删除，但不包含任何执行过程数据。Task 在此状态下具备完整的可理解性和可复用性。

---

## 4 Journey 4：执行 Task

**TC-TEXEC-001：在 AI 编程环境中启动 Task 执行**
Dev 在 AI 编程环境中选择一个已定义的 Task 开始执行，系统将 Task 状态从 `defined` 变更为 `executing`，该状态变更作为 Event 记录于 `_eventstore.db`。Task 与当前执行 Session 建立稳定绑定关系。

**TC-TEXEC-002：代码修改与 Task 建立明确关联**
Task 执行过程中，Dev 或 Agent 对 Block 的代码修改操作（如 `markdown.write`）通过 EAVT 事件中的 Attribute 字段（`{editor_id}/{cap_id}`）与当前 Task 建立明确关联，确保代码演进过程具备可追溯性。

**TC-TEXEC-003：多轮对话与澄清被自然沉淀**
Task 执行过程中 Dev 与 Agent 发生的多轮对话与澄清内容被记录为 Session 中的事件序列。澄清、返工、验证等行为作为历史记录被自然沉淀，可在 Task 回顾时完整检索。

**TC-TEXEC-004：验证结果的持续记录**
Dev 运行测试或编译以验证结果时，系统持续记录关键验证结果（测试通过/失败、编译输出等），这些验证事件与 Task 关联存储，作为 Task 逼近可提交状态的证据。

**TC-TEXEC-005：阶段性总结的确认与修订**
执行过程中，AI 生成的阶段性总结可由 Dev 确认或修订。修订操作产生新的 Event，保留原始总结与修订后版本，形成可对比的决策演进记录。

**TC-TEXEC-006：Task 与多 Session 的绑定关系**
一个 Task 可绑定一个或多个 Session（中断恢复、多日执行等场景），所有 Session 产生的 Event 均归属同一 Task。通过 Task 可完整回溯所有关联 Session 的执行历史。

---

## 5 Journey 5：提交 Task 结果

**TC-TCOMMIT-001：Dev 发起 Task 提交**
Dev 认为 Task 已完成，发起提交操作。系统将 Task 状态从 `executing` 变更为 `submitted`，该状态变更产生 Event 并原子性写入 `_eventstore.db`。

**TC-TCOMMIT-002：导出当前相关文件状态**
提交时，Project 导出当前与 Task 关联的所有 Block 文件状态，生成稳定快照。导出内容包含 Block 的完整 contents 和关联 resource，确保提交结果可被外部复现与验证。

**TC-TCOMMIT-003：生成稳定提交记录**
提交操作生成一次稳定的提交记录，包含提交时间戳（vector clock）、提交者信息（editor_id）、关联的 Task 定义与最终实现状态。提交记录不可篡改，作为 Task 执行周期的明确边界。

**TC-TCOMMIT-004：Task 状态转换至已提交**
提交完成后，Task 状态为 `submitted`。此状态下 Task 的执行内容被冻结，不可再追加修改（除非回到执行状态）。PM 或相关角色可基于此状态发起验收验证。

**TC-TCOMMIT-005：提交结果的可复现性**
已提交的 Task 成果可被外部复现：通过回放 `_eventstore.db` 中截至提交时刻的所有 Event，可重建与提交时完全一致的 Block 状态，确保结果具备可审计性。

---

## 6 Journey 6：PM 验证 Task 结果

**TC-TVERIFY-001：PM 打开已提交 Task 进行审查**
PM 打开一个状态为 `submitted` 的 Task，系统展示 Task 的原始定义（目标、约束、验收标准）与最终实现结果，PM 可直观对比定义与实现之间的差异。

**TC-TVERIFY-002：PM 查看关联验证信息**
PM 查看与 Task 关联的验证信息，包括执行过程中记录的测试结果、编译输出、阶段性总结等关键验证事件，作为判断 Task 是否满足验收条件的依据。

**TC-TVERIFY-003：PM 验证通过**
PM 判断 Task 满足验收条件，标记为「验证通过」。该操作产生验证 Event（包含 PM 的 `editor_id` 和验证结论），Task 状态变更为 `verified`。验证通过的 Task 具备进入归档阶段的前提条件。

**TC-TVERIFY-004：PM 验证未通过 — Task 回到可执行状态**
PM 判断 Task 不满足验收条件，标记为「验证未通过」并给出具体理由。Task 状态变更为 `needs_fix`，可被重新打开进入 `executing` 状态。原提交结果作为一次历史尝试被完整保留，不被覆盖。

**TC-TVERIFY-005：验证结论作为独立事件节点**
PM 的验证结论（通过/未通过及理由）作为 Task 生命周期中的一个独立 Event 节点存储，包含验证时间、验证者（editor_id）、结论和详细理由，不覆盖 Task 的任何已有信息。

**TC-TVERIFY-006：PM 明确否定 Task（Rejected）**
PM 认为 Task 存在根本性问题（方向性错误、遗漏关键约束、不符合业务预期），将 Task 标记为「Rejected」。Task 进入稳定的 `rejected` 状态，本次提交被视为一次完整但被否定的尝试。否定原因与对应实现路径被完整保留，可被未来检索、引用与分析。

**TC-TVERIFY-007：基于否定经验重新执行 Task**
新一轮 Task 执行开始前，执行者可访问历史被否定的 Task 及其否定原因。Dev 与 AI 在执行过程中主动规避已被否定的路径。新 Task 与被否定 Task 之间通过 `reference` 关系形成清晰的对照关系，避免重复走入已知错误路径。

---

## 7 Journey 7：归档完成的 Task

**TC-TARCH-001：对已验证 Task 发起归档**
Dev 对一个状态为 `verified` 的 Task 发起归档操作，系统将 Task 状态变更为 `archived`，产生归档 Event 写入 `_eventstore.db`。

**TC-TARCH-002：系统生成归档文档**
归档时系统自动生成 Task 的归档文档，汇总 Task 定义（目标、约束、验收标准）、实现路径、关键验证结果与关联关系（引用的 Block、Session、其他 Task）。归档文档作为 Block 存储于 Project 中。

**TC-TARCH-003：归档 Task 成为长期知识资产**
归档后的 Task 成为 Project 的长期知识资产，其完整生命周期数据（定义 → 执行 → 提交 → 验证 → 归档）不可被删除或篡改。归档内容可在未来被检索与引用。

**TC-TARCH-004：归档 Task 支持 Second-use 复用**
归档的成功 Task 可在同一 Task Type 的新 Task 创建或执行时被引用。系统呈现匹配的成功归档作为参考上下文，包括已验证有效的目标拆解方式、关键约束处理策略和成功实现路径，减少不必要的探索与澄清。

---

## 8 Journey 8：归档被否定的 Task

**TC-TARCH-010：将被否定 Task 归档为失败经验**
团队决定不再修复当前被否定的 Task，对其发起归档操作。系统生成一份「失败归档记录」，完整保留 Task 的原始目标与约束、实际采用的实现路径、PM 的否定结论与理由、关键失败节点与误判点。Task 状态变更为 `archived_rejected`。

**TC-TARCH-011：被否定 Task 不再进入执行状态**
归档后的被否定 Task 不可再被重新打开或进入执行状态，其生命周期被明确关闭。Task 不会再被误认为"未完成"或"中断状态"。

**TC-TARCH-012：失败原因成为可检索知识资产**
归档的失败 Task 的否定原因、失败路径和误判点成为显式的、可检索的知识资产。在同一 Task Type 的新 Task 中，可通过检索历史归档发现这些失败记录并加以参考。

**TC-TARCH-013：Second-use 引用失败归档进行纠偏**
新 Task 在定义或执行前，系统呈现历史失败归档作为参考上下文。执行过程中，若新实现路径接近历史失败点，可被及时识别与纠偏。AI 学到的不只是"怎么做"，还包括"哪些不能再做"和"为什么不能做"。

---

## 9 负向/边界

**TC-PROJ-900：打开不存在的 .elf 文件被拒绝**
用户尝试打开一个不存在的 `.elf` 文件路径，系统返回明确错误信息而非崩溃，Project Library 中不出现无效条目。

**TC-PROJ-901：打开损坏的 .elf 文件被拒绝**
用户尝试打开一个 ZIP 结构损坏或 `_eventstore.db` 数据不完整的 `.elf` 文件，系统检测到格式异常后返回错误信息，不进入不一致的工作状态。

**TC-TDEF-900：无权限 Editor 创建 Task 被拒绝**
一个未被授予 `core.create` 权限的 Editor 尝试创建 Task，Engine 通过 CBAC certificator 校验失败，返回 `command_rejected` 事件，Task 不被创建。

**TC-TEXEC-900：未定义的 Task 无法进入执行状态**
尝试将一个不存在或已被删除的 Task 标记为 `executing`，系统拒绝操作并返回错误，不产生无效的状态变更事件。

**TC-TCOMMIT-900：并发提交同一 Task 被拒绝**
两个 Editor 同时对同一 Task 发起提交操作，Engine Actor 串行处理 Command，第一个提交成功后 Task 状态变更，第二个提交因 vector clock 冲突被拒绝（返回 `command_rejected`）。

**TC-TVERIFY-900：非 PM 角色执行验证被拒绝**
一个不具备验证权限的 Editor 尝试对 Task 进行验证操作，系统通过 CBAC 校验拒绝该操作，返回权限不足错误。

**TC-TARCH-900：未验证 Task 无法归档**
尝试对一个状态为 `executing` 或 `submitted`（未经 PM 验证）的 Task 发起归档，系统拒绝操作，要求 Task 先完成验证流程。
