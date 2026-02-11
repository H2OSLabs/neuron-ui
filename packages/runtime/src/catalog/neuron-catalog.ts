// ============================================================
// neuronCatalog — The complete neuron-ui component catalog
// 53 N-components + 9 actions, all validated with Zod schemas
// ============================================================

import { z } from 'zod'
import type { CatalogComponentDef, CatalogActionDef } from '../types'
import { createCatalog } from './create-catalog'

// ---- Shared Token Enums ----

const ColorToken = z.enum([
  'pink', 'pink-light',
  'yellow', 'yellow-bright',
  'lime', 'lime-light',
  'green',
  'blue',
  'purple', 'lavender',
  'error', 'warning', 'success',
])

const SizeToken = z.enum(['xs', 'sm', 'md', 'lg', 'xl'])

// ---- Shared Sub-Schemas ----

const OptionSchema = z.object({
  label: z.string(),
  value: z.string(),
})

const MenuItemSchema = z.object({
  label: z.string(),
  action: z.string().optional(),
  variant: z.string().optional(),
  separator: z.boolean().optional(),
})

const MenuItemBasicSchema = z.object({
  label: z.string(),
  action: z.string().optional(),
  separator: z.boolean().optional(),
})

// ============================================================
// Display Components (15)
// ============================================================

const displayComponents: Record<string, CatalogComponentDef> = {
  NText: {
    props: z.object({
      text: z.string(),
      size: SizeToken.optional(),
      weight: z.enum(['normal', 'medium', 'semibold', 'bold']).optional(),
      color: ColorToken.optional(),
      as: z.enum(['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']).optional(),
    }),
    description: '文本展示组件，支持 7 级字号和 4 级字重',
  },

  NBadge: {
    props: z.object({
      label: z.string(),
      color: ColorToken.optional(),
      variant: z.enum(['solid', 'outline', 'subtle']).optional(),
      size: SizeToken.optional(),
    }),
    description: '标签/徽章组件，用于状态展示、枚举值渲染',
  },

  NAvatar: {
    props: z.object({
      src: z.string().optional(),
      name: z.string(),
      size: SizeToken.optional(),
      shape: z.enum(['circle', 'square']).optional(),
      status: z.enum(['online', 'offline', 'busy', 'away']).optional(),
    }),
    description: '头像组件，支持图片/首字母回退，可显示在线状态',
  },

  NDataTable: {
    props: z.object({
      columns: z.array(z.object({
        key: z.string(),
        label: z.string(),
        sortable: z.boolean().optional(),
        width: z.string().optional(),
      })),
      data: z.array(z.record(z.any())),
      pageSize: z.number().optional(),
      selectable: z.boolean().optional(),
    }),
    hasChildren: false,
    description: '数据表格组件，支持排序、分页、行选择',
  },

  NChart: {
    props: z.object({
      type: z.enum(['bar', 'line', 'pie', 'area', 'radar', 'scatter']),
      data: z.array(z.object({
        label: z.string(),
        value: z.number(),
        color: ColorToken.optional(),
      })),
      width: z.number().optional(),
      height: z.number().optional(),
      showLegend: z.boolean().optional(),
    }),
    description: '图表组件，支持柱状图、折线图、饼图、面积图、雷达图、散点图',
  },

  NProgress: {
    props: z.object({
      value: z.number(),
      max: z.number().optional(),
      color: ColorToken.optional(),
      size: SizeToken.optional(),
      showLabel: z.boolean().optional(),
    }),
    description: '进度条组件，用于展示百分比/进度数据',
  },

  NCalendar: {
    props: z.object({
      mode: z.enum(['single', 'range', 'multiple']).optional(),
      selected: z.string().optional(),
    }),
    description: '日历组件，支持单选、范围选择、多选模式',
  },

  NCarousel: {
    props: z.object({
      items: z.array(z.object({
        src: z.string(),
        alt: z.string().optional(),
      })),
      autoPlay: z.boolean().optional(),
      interval: z.number().optional(),
    }),
    description: '轮播组件，支持自动播放',
  },

  NEmpty: {
    props: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
    description: '空状态组件，用于无数据时的占位展示',
  },

  NAccordion: {
    props: z.object({
      items: z.array(z.object({
        title: z.string(),
        content: z.string(),
      })),
      type: z.enum(['single', 'multiple']).optional(),
      defaultOpen: z.array(z.string()).optional(),
    }),
    hasChildren: false,
    description: '手风琴组件，可折叠展开多个内容面板',
  },

  NSkeleton: {
    props: z.object({
      width: z.string().optional(),
      height: z.string().optional(),
      variant: z.enum(['text', 'circular', 'rectangular']).optional(),
    }),
    description: '骨架屏组件，用于加载状态占位',
  },

  NPagination: {
    props: z.object({
      total: z.number(),
      pageSize: z.number().optional(),
      current: z.number().optional(),
    }),
    description: '分页组件',
  },

  NKbd: {
    props: z.object({
      keys: z.array(z.string()),
    }),
    description: '键盘按键展示组件，用于快捷键提示',
  },

  NAlert: {
    props: z.object({
      title: z.string(),
      description: z.string().optional(),
      variant: z.enum(['default', 'destructive', 'info', 'warning', 'success']).optional(),
    }),
    description: '警告提示组件，用于重要信息展示',
  },

  NSeparator: {
    props: z.object({
      orientation: z.enum(['horizontal', 'vertical']).optional(),
      decorative: z.boolean().optional(),
    }),
    description: '分割线组件，水平或垂直方向',
  },
}

// ============================================================
// Input Components (13)
// ============================================================

const inputComponents: Record<string, CatalogComponentDef> = {
  NInput: {
    props: z.object({
      placeholder: z.string().optional(),
      type: z.enum(['text', 'email', 'password', 'number', 'url', 'tel']).optional(),
      size: SizeToken.optional(),
      disabled: z.boolean().optional(),
    }),
    description: '输入框组件，支持多种类型（文本、邮箱、密码、数字等）',
  },

  NSelect: {
    props: z.object({
      placeholder: z.string().optional(),
      options: z.array(OptionSchema),
      size: SizeToken.optional(),
      disabled: z.boolean().optional(),
    }),
    description: '下拉选择组件，适用于选项 <=5 的枚举字段',
  },

  NCombobox: {
    props: z.object({
      placeholder: z.string().optional(),
      options: z.array(OptionSchema),
      searchable: z.boolean().optional(),
    }),
    description: '组合框组件，支持搜索过滤，适用于选项 >5 的枚举字段',
  },

  NCheckbox: {
    props: z.object({
      label: z.string().optional(),
      disabled: z.boolean().optional(),
    }),
    description: '复选框组件',
  },

  NRadioGroup: {
    props: z.object({
      options: z.array(OptionSchema),
      orientation: z.enum(['horizontal', 'vertical']).optional(),
    }),
    description: '单选框组组件，支持水平/垂直排列',
  },

  NSwitch: {
    props: z.object({
      label: z.string().optional(),
      disabled: z.boolean().optional(),
    }),
    description: '开关组件，用于布尔值切换',
  },

  NTextarea: {
    props: z.object({
      placeholder: z.string().optional(),
      rows: z.number().optional(),
      maxLength: z.number().optional(),
    }),
    description: '多行文本输入组件',
  },

  NDatePicker: {
    props: z.object({
      placeholder: z.string().optional(),
      mode: z.enum(['single', 'range']).optional(),
    }),
    description: '日期选择组件，支持单日期和日期范围',
  },

  NSlider: {
    props: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      step: z.number().optional(),
      defaultValue: z.number().optional(),
    }),
    description: '滑块组件，用于数值范围选择',
  },

  NInputOTP: {
    props: z.object({
      length: z.number().optional(),
    }),
    description: 'OTP 验证码输入组件',
  },

  NInputGroup: {
    props: z.object({
      label: z.string().optional(),
      description: z.string().optional(),
    }),
    hasChildren: true,
    description: '输入组合组件，可包含多个输入控件',
  },

  NField: {
    props: z.object({
      label: z.string(),
      description: z.string().optional(),
      error: z.string().optional(),
      required: z.boolean().optional(),
    }),
    hasChildren: true,
    description: '表单字段容器，提供标签、描述、错误信息',
  },

  NToggle: {
    props: z.object({
      label: z.string().optional(),
      variant: z.enum(['default', 'outline']).optional(),
      size: SizeToken.optional(),
    }),
    description: '切换按钮组件，可按下/弹起两种状态',
  },
}

// ============================================================
// Action Components (3)
// ============================================================

const actionComponents: Record<string, CatalogComponentDef> = {
  NButton: {
    props: z.object({
      label: z.string(),
      color: ColorToken.optional(),
      variant: z.enum(['capsule', 'outline', 'ghost', 'link']).optional(),
      size: SizeToken.optional(),
      disabled: z.boolean().optional(),
    }),
    description: '按钮组件，胶囊形为默认变体，支持 5 级尺寸和 10 种色彩',
  },

  NDropdownMenu: {
    props: z.object({
      trigger: z.string(),
      items: z.array(MenuItemSchema),
    }),
    description: '下拉菜单组件，点击触发器展示操作列表',
  },

  NContextMenu: {
    props: z.object({
      items: z.array(MenuItemBasicSchema),
    }),
    hasChildren: true,
    description: '右键上下文菜单组件，包裹子元素提供右键菜单',
  },
}

// ============================================================
// Container Components (7)
// ============================================================

const containerComponents: Record<string, CatalogComponentDef> = {
  NCard: {
    props: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      variant: z.enum(['default', 'outline', 'elevated']).optional(),
    }),
    hasChildren: true,
    description: '卡片容器组件，用于数据展示分组',
  },

  NDialog: {
    props: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
    hasChildren: true,
    description: '模态弹窗组件，用于表单编辑、详情查看',
  },

  NAlertDialog: {
    props: z.object({
      title: z.string(),
      description: z.string(),
      confirmLabel: z.string().optional(),
      cancelLabel: z.string().optional(),
    }),
    description: '确认弹窗组件，用于删除等危险操作的二次确认',
  },

  NSheet: {
    props: z.object({
      title: z.string(),
      description: z.string().optional(),
      side: z.enum(['left', 'right', 'top', 'bottom']).optional(),
    }),
    hasChildren: true,
    description: '侧边面板组件，从屏幕边缘推入',
  },

  NDrawer: {
    props: z.object({
      title: z.string(),
      description: z.string().optional(),
    }),
    hasChildren: true,
    description: '抽屉组件，底部弹出，适合移动端',
  },

  NScrollArea: {
    props: z.object({
      orientation: z.enum(['vertical', 'horizontal', 'both']).optional(),
      maxHeight: z.string().optional(),
    }),
    hasChildren: true,
    description: '滚动区域组件，提供自定义滚动条',
  },

  NAspectRatio: {
    props: z.object({
      ratio: z.number(),
    }),
    hasChildren: true,
    description: '宽高比容器组件，固定子元素的宽高比例',
  },
}

// ============================================================
// Feedback Components (3)
// ============================================================

const feedbackComponents: Record<string, CatalogComponentDef> = {
  NToast: {
    props: z.object({
      title: z.string(),
      description: z.string().optional(),
      variant: z.enum(['default', 'success', 'error', 'warning', 'info']).optional(),
    }),
    description: '轻提示组件，用于操作结果反馈',
  },

  NSpinner: {
    props: z.object({
      size: SizeToken.optional(),
      color: ColorToken.optional(),
    }),
    description: '加载旋转器组件',
  },

  NTooltip: {
    props: z.object({
      content: z.string(),
      side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
    }),
    hasChildren: true,
    description: '文字提示组件，悬停时显示提示信息',
  },
}

// ============================================================
// Navigation Components (5)
// ============================================================

const navigationComponents: Record<string, CatalogComponentDef> = {
  NTabs: {
    props: z.object({
      items: z.array(OptionSchema),
      defaultValue: z.string().optional(),
    }),
    hasChildren: false,
    description: '标签页切换组件，NTabs 自行管理内容面板',
  },

  NBreadcrumb: {
    props: z.object({
      items: z.array(z.object({
        label: z.string(),
        href: z.string().optional(),
      })),
    }),
    description: '面包屑导航组件，显示页面层级路径',
  },

  NMenubar: {
    props: z.object({
      menus: z.array(z.object({
        label: z.string(),
        items: z.array(MenuItemBasicSchema),
      })),
    }),
    description: '菜单栏组件，顶部水平菜单',
  },

  NNavigationMenu: {
    props: z.object({
      items: z.array(z.object({
        label: z.string(),
        href: z.string().optional(),
        children: z.array(z.object({
          label: z.string(),
          href: z.string().optional(),
        })).optional(),
      })),
    }),
    description: '导航菜单组件，支持多级导航结构',
  },

  NSidebar: {
    props: z.object({
      title: z.string().optional(),
      collapsible: z.boolean().optional(),
    }),
    hasChildren: true,
    description: '侧边栏组件，支持响应式收起/展开',
  },
}

// ============================================================
// Layout Components (7)
// ============================================================

const layoutComponents: Record<string, CatalogComponentDef> = {
  NResizable: {
    props: z.object({
      direction: z.enum(['horizontal', 'vertical']).optional(),
      defaultSizes: z.array(z.number()).optional(),
    }),
    hasChildren: true,
    description: '可调整大小的面板容器组件，子面板可拖拽调整比例',
  },

  NCollapsible: {
    props: z.object({
      title: z.string(),
      defaultOpen: z.boolean().optional(),
    }),
    hasChildren: true,
    description: '可折叠组件，点击标题展开/收起内容',
  },

  NToggleGroup: {
    props: z.object({
      items: z.array(OptionSchema),
      type: z.enum(['single', 'multiple']).optional(),
    }),
    description: '切换按钮组组件，单选或多选模式',
  },

  NLabel: {
    props: z.object({
      text: z.string(),
      htmlFor: z.string().optional(),
    }),
    description: '标签组件，与表单控件配合使用',
  },

  NPopover: {
    props: z.object({
      trigger: z.string().optional(),
    }),
    hasChildren: true,
    description: '弹出框组件，点击触发器展示浮层内容',
  },

  NHoverCard: {
    props: z.object({
      trigger: z.string(),
    }),
    hasChildren: true,
    description: '悬停卡片组件，鼠标悬停时展示预览信息',
  },

  NCommand: {
    props: z.object({
      placeholder: z.string().optional(),
      items: z.array(z.object({
        label: z.string(),
        value: z.string(),
        group: z.string().optional(),
      })),
    }),
    description: '命令面板组件，支持搜索和分组的命令列表',
  },
}

// ============================================================
// Actions (9)
// ============================================================

const neuronActions: Record<string, CatalogActionDef> = {
  openDialog: {
    params: z.object({ target: z.string() }),
    description: '打开弹窗',
  },
  closeDialog: {
    params: z.object({ target: z.string() }),
    description: '关闭弹窗',
  },
  openSheet: {
    params: z.object({ target: z.string() }),
    description: '打开侧边面板',
  },
  closeSheet: {
    params: z.object({ target: z.string() }),
    description: '关闭侧边面板',
  },
  submitForm: {
    params: z.object({ api: z.string(), body: z.record(z.any()) }),
    description: '提交表单到 API',
  },
  deleteItem: {
    params: z.object({ api: z.string(), id: z.string() }),
    description: '删除条目',
  },
  refresh: {
    params: z.object({ dataSource: z.string() }),
    description: '刷新数据源',
  },
  navigate: {
    params: z.object({ target: z.string() }),
    description: '路由跳转',
  },
  toast: {
    params: z.object({
      message: z.string(),
      variant: z.enum(['success', 'error', 'info']),
    }),
    description: '通知提示',
  },
}

// ============================================================
// Assemble and export the neuron catalog
// ============================================================

/**
 * The complete neuron-ui component catalog.
 *
 * - 53 N-components across 7 categories
 *   (Display, Input, Action, Container, Feedback, Navigation, Layout)
 * - 9 dispatchable actions
 *   (openDialog, closeDialog, openSheet, closeSheet, submitForm, deleteItem, refresh, navigate, toast)
 */
export const neuronCatalog = createCatalog({
  name: 'neuron-ui',
  components: {
    // Display (15)
    ...displayComponents,
    // Input (13)
    ...inputComponents,
    // Action (3)
    ...actionComponents,
    // Container (7)
    ...containerComponents,
    // Feedback (3)
    ...feedbackComponents,
    // Navigation (5)
    ...navigationComponents,
    // Layout (7)
    ...layoutComponents,
  },
  actions: neuronActions,
})
