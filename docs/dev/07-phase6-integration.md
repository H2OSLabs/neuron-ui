# Phase 6: 集成测试 + 端到端验证 + 全链路验收

> 全链路打通：API 输入 → AI 生成 → 编辑器渲染 → 可视化调整 → 消费层渲染/代码生成 → 导出。
> 本阶段同时承担全链路验收职责 (原 Phase 8 合并至此)。

---

## 依赖

- 全部 Phase 0-5 + Phase 7 完成

## 端到端测试场景

### 场景 1: CRUD 列表页 (主场景)

**输入:**
- API: 赛事管理 CRUD 接口 (GET/POST/PUT/DELETE)
- TaskCase: "帮我生成一个赛事管理的 CRUD 页面"

**验证:**

| 步骤 | 预期结果 |
|------|---------|
| AI 生成 | Page Schema 含 NDataTable + NDialog(创建) + NSheet(编辑) + NAlertDialog(删除) |
| 校验通过 | 格式合法, 嵌套合规, 绑定完整, Token 合规 |
| 编辑器加载 | 页面在画布中正确渲染 |
| 调整文案 | 修改按钮文字, 实时预览 |
| 调整颜色 | Token 下拉选择, 生效 |
| 拖拽排序 | 表格列顺序改变 |
| 组件替换 | NDataTable → NCard 网格, 数据绑定保留 |
| 撤销/重做 | 操作可撤销 |
| 导出 JSON | 输出合法 Page Schema |

### 场景 2: Dashboard 仪表盘

**输入:**
- API: 多个 GET 统计接口
- TaskCase: "生成一个数据统计仪表盘"

**验证:**

| 步骤 | 预期结果 |
|------|---------|
| AI 生成 | NCard[] + NChart[] + NProgress |
| 编辑器加载 | 卡片和图表正确渲染 |
| 调整布局 | 拖拽调整卡片位置 |

### 场景 3: 任意格式输入

**验证 AI 对不同格式的处理:**

| 输入格式 | API | TaskCase |
|---------|-----|---------|
| Swagger JSON | OpenAPI spec | 结构化 JSON |
| Postman Collection | Postman 导出 | PRD 文档 |
| 文字描述 | "有一组赛事管理接口..." | "帮我生成 CRUD 页面" |
| cURL 集合 | cURL 命令列表 | 一句话描述 |
| 表格 | Markdown/CSV 表格 | 流程图描述 |

生成质量应当一致。

### 场景 4: 错误处理

| 输入 | 预期行为 |
|------|---------|
| 空 API 列表 | 友好错误提示 |
| 不含 API 的文本 | AI 尽力理解或报告无法识别 |
| 生成结果校验失败 | 自动修复 + 重试 |
| 组件嵌套违规 | 校验器报告具体位置和修复建议 |

## 性能验证

| 指标 | 目标 |
|------|------|
| AI 生成时间 | ≤ 30 秒 (含重试) |
| Page Schema 加载到编辑器 | ≤ 1 秒 |
| 拖拽操作延迟 | ≤ 16ms (60fps) |
| 撤销/重做响应 | ≤ 50ms |
| 组件懒加载 | 按需, 首屏 ≤ 3 秒 |

## 测试策略

采用 **自动化单元测试 + 手动 QA** 的双轨模式：

### 自动化测试框架

| 层面 | 工具 | 说明 |
|------|------|------|
| 单元测试 | **Vitest** + Testing Library | 与 Vite 生态一致，对组件/hooks/工具函数进行单元级覆盖 |
| 组件测试 | Vitest + `@testing-library/react` | 渲染组件 → 断言 DOM 输出 + 交互行为 |
| Schema 校验测试 | Vitest | 验证 Page Schema 校验器 (Zod) 的正确性，覆盖合法/非法输入 |
| 快照测试 | Vitest snapshot | 对关键渲染结果做快照回归，防止意外变更 |
| 端到端自动化 | **Playwright** | 浏览器级自动化测试: 编辑器画布交互、拖拽、导出等全链路场景 |

### 自动化测试覆盖范围

```
packages/tokens/          → Vitest: Token 生成脚本输出正确性
packages/components/      → Vitest + Testing Library: 53 组件渲染 + 交互 (覆盖率 ≥ 80%)
packages/metadata/        → Vitest: 校验器对合法/非法 Schema 的判断
packages/runtime/         → Vitest: Catalog 注册、SchemaAdapter 转换、DataSourceLayer 数据注入
packages/generator/       → Vitest: AI 输出解析、校验器、自动修复逻辑
packages/codegen/         → Vitest: 模板生成、代码格式化、merge 策略
packages/page-builder/    → Playwright: 画布渲染、拖拽排序、属性编辑、撤销/重做、导出
```

### 手动 QA 检查清单

以下场景需人工验证 (自动化难以覆盖的体验/视觉层面)：

- [ ] 运营人员 5 分钟内可完成对自动生成页面的微调 (可用性)
- [ ] 拖拽操作流畅无卡顿 (性能体感)
- [ ] 三种预览模式 (桌面/平板/多功能区收起) 视觉正确
- [ ] 非技术人员可独立理解编辑器界面 (UX)
- [ ] AI 对不同格式输入的生成质量一致性 (主观评判)

## 回归测试

每次修改后 CI 自动运行:

- [ ] `pnpm test` — 全部 Vitest 单元/组件测试通过
- [ ] `pnpm lint` — 代码风格无错误
- [ ] Token 生成脚本正常运行
- [ ] 所有组件 Storybook 渲染正确
- [ ] Page Schema 校验器 (Zod) 正确工作
- [ ] AI 生成 → 校验 → 编辑器加载 全链路通过
- [ ] 撤销/重做正确
- [ ] 组件替换保留数据绑定
- [ ] Runtime `<NeuronPage>` 可正确渲染 Page Schema
- [ ] CodeGen 生成的 .tsx 可编译运行

## CI/CD 配置

### GitHub Actions 流水线

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test -- --coverage

  e2e:
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: npx playwright install --with-deps
      - run: pnpm --filter @neuron-ui/page-builder test:e2e
```

### CI 触发规则

| 事件 | 运行内容 |
|------|---------|
| Push to main | lint + test + e2e + Storybook 构建 |
| Pull Request | lint + test |
| Release tag | lint + test + e2e + npm publish |

## 最终验收标准

| # | 标准 |
|---|------|
| 1 | 从任意格式 API + TaskCase 到可视化页面, 全链路 5 分钟内完成 |
| 2 | 53 个组件均可在编辑器中使用 |
| 3 | CRUD / Dashboard / Detail 三种页面类型均可自动生成 |
| 4 | 非技术人员可独立完成页面微调 |
| 5 | 设计 Token 在全链路中被严格遵守 |
| 6 | Page Schema 可导出为标准 JSON |
| 7 | `<NeuronPage>` 可正确渲染 CRUD/Dashboard/Detail 页面 (Runtime) |
| 8 | `neuron-codegen generate` 可生成可编译运行的 .tsx (CodeGen) |
| 9 | 所有自动化测试通过 (Vitest 覆盖率 ≥ 80%, Playwright E2E 通过) |
