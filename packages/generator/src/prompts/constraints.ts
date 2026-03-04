import type { PageType, FormContainer } from '../types'

/**
 * Generation constraints — can be progressively added/removed during iteration.
 */
export function getConstraints(preferences?: {
  pageType?: PageType
  formContainer?: FormContainer
}): string {
  const lines: string[] = [
    '## 约束条件',
    '',
    '### 必须遵守',
    '1. 根节点必须是 rootContainer 之一: NResizable, NCard, NDialog, NSheet, NAspectRatio',
    '2. 最大嵌套深度不超过 6 层',
    '3. 颜色值只能使用 Token key (如 "blue", "green", "pink")，不能使用 hex/rgb 值',
    '4. 尺寸值只能使用 Token key (如 "sm", "md", "lg")，不能使用像素值',
    '5. NField 只能包含一个输入子组件',
    '6. NDialog 中 NButton 不超过 3 个',
    '7. 每个 dataSources 中定义的数据源必须至少被一个组件的 binding 引用',
    '8. 每个展示数据的组件（NDataTable, NText 等绑定数据的）必须有 binding.dataSource',
    '',
    '### Visual Layout 规则（视觉必须遵守）',
    '9. 页面根容器必须包含 className，提供页面级 padding 和背景:',
    '   NResizable root: props.className = "p-6 min-h-screen bg-background gap-6"',
    '10. NDialog / NAlertDialog / NSheet / NDrawer 是覆盖层组件，必须放在所有可见内容节点之后',
    '    它们不参与 flex 布局流，不能插在 NDataTable / NText / NCard 等可见组件之间',
    '11. 页面内容区只放 NDataTable，不同时放 NEmpty（编辑器无法条件渲染）',
    '12. 布局容器 className 规范:',
    '    - Header 行 (horizontal): "items-center justify-between"',
    '    - 操作按钮组 (horizontal): "items-center gap-3"',
    '    - 统计卡片行 (horizontal): "items-stretch gap-4"',
    '    - NDataTable 占满区域: className = "flex-1"',
    '    - 表单字段堆叠 (vertical): "gap-4"',
  ]

  if (preferences?.pageType && preferences.pageType !== 'auto') {
    lines.push('')
    lines.push(`### 页面类型偏好: ${preferences.pageType}`)
    switch (preferences.pageType) {
      case 'crud':
        lines.push('- 必须包含: NDataTable(列表) + NDialog/NSheet(创建/编辑表单) + NAlertDialog(删除确认) + NPagination')
        lines.push('- 工具栏包含: NButton(新建) + NInputGroup(搜索)')
        break
      case 'dashboard':
        lines.push('- 必须包含: 多个 NCard(统计卡片) + NChart(至少一个图表)')
        lines.push('- 可选包含: NDataTable(最近数据) + NProgress(指标进度)')
        break
      case 'detail':
        lines.push('- 必须包含: NCard(头部信息) + NTabs(数据分区)')
        lines.push('- 头部信息包含: NAvatar + NText + NBadge')
        break
    }
  }

  if (preferences?.formContainer && preferences.formContainer !== 'auto') {
    lines.push('')
    lines.push(`### 表单容器偏好: ${preferences.formContainer}`)
    lines.push(`- 创建/编辑表单使用 N${preferences.formContainer.charAt(0).toUpperCase() + preferences.formContainer.slice(1)} 作为容器`)
  }

  return lines.join('\n')
}
