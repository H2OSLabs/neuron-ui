import type { PageType } from '../types'

// Few-shot examples embedded as strings to avoid JSON import issues
const CRUD_EXAMPLE = {
  input: {
    apiList: 'GET /api/events - 获取赛事列表 (name, status, date, participants)\nPOST /api/events - 创建赛事 (name, type, date, description)\nPUT /api/events/:id - 更新赛事\nDELETE /api/events/:id - 删除赛事',
    taskCase: '赛事管理 CRUD 页面',
  },
  output: {
    version: '1.0.0',
    page: { id: 'event-management', name: '赛事管理', route: '/admin/events' },
    dataSources: {
      eventList: { api: 'GET /api/events', autoFetch: true },
      createEvent: { api: 'POST /api/events', method: 'POST' },
      updateEvent: { api: 'PUT /api/events/:id', method: 'PUT' },
      deleteEvent: { api: 'DELETE /api/events/:id', method: 'DELETE' },
    },
    tree: [{
      id: 'root', component: 'NResizable', props: { direction: 'vertical' },
      children: [
        { id: 'breadcrumb', component: 'NBreadcrumb', props: { items: [{ label: '首页', href: '/' }, { label: '赛事管理' }] } },
        {
          id: 'toolbar', component: 'NCard', props: {},
          children: [
            { id: 'search', component: 'NInputGroup', props: { icon: 'search' }, children: [{ id: 'search-input', component: 'NInput', props: { placeholder: '搜索赛事...' } }] },
            { id: 'create-btn', component: 'NButton', props: { label: '新建赛事', variant: 'default', icon: 'plus' } },
          ],
        },
        {
          id: 'event-table', component: 'NDataTable',
          props: { columns: [{ key: 'name', label: '赛事名称', sortable: true }, { key: 'type', label: '类型' }, { key: 'status', label: '状态' }, { key: 'date', label: '日期', sortable: true }, { key: 'participants', label: '参与人数' }] },
          binding: { dataSource: 'eventList', field: 'data' },
        },
        { id: 'pagination', component: 'NPagination', props: { currentPage: 1, totalPages: 1 }, binding: { dataSource: 'eventList' } },
        {
          id: 'create-dialog', component: 'NDialog', props: { title: '新建赛事' },
          children: [
            { id: 'create-name', component: 'NField', props: { label: '赛事名称', required: true }, children: [{ id: 'create-name-input', component: 'NInput', props: { placeholder: '请输入赛事名称' }, binding: { field: 'name' } }] },
            { id: 'create-type', component: 'NField', props: { label: '赛事类型', required: true }, children: [{ id: 'create-type-select', component: 'NSelect', props: { placeholder: '选择类型', options: [] }, binding: { field: 'type' } }] },
            { id: 'create-date', component: 'NField', props: { label: '日期' }, children: [{ id: 'create-date-picker', component: 'NDatePicker', props: {}, binding: { field: 'date' } }] },
            { id: 'create-desc', component: 'NField', props: { label: '描述' }, children: [{ id: 'create-desc-textarea', component: 'NTextarea', props: { placeholder: '赛事描述', rows: 3 }, binding: { field: 'description' } }] },
            { id: 'create-submit', component: 'NButton', props: { label: '创建', variant: 'default' }, binding: { onSubmit: 'createEvent' } },
          ],
        },
        {
          id: 'delete-confirm', component: 'NAlertDialog',
          props: { title: '确认删除', description: '删除后无法恢复，确定删除该赛事吗？', confirmLabel: '删除', cancelLabel: '取消', destructive: true },
          binding: { onConfirm: 'deleteEvent' },
        },
      ],
    }],
  },
}

const DASHBOARD_EXAMPLE = {
  input: {
    apiList: 'GET /api/stats/overview - 总览统计 (totalUsers, revenue, orders, conversionRate)\nGET /api/stats/chart - 趋势图数据\nGET /api/stats/recent - 最近订单列表',
    taskCase: '运营数据仪表盘',
  },
  output: {
    version: '1.0.0',
    page: { id: 'operations-dashboard', name: '运营仪表盘', route: '/dashboard' },
    dataSources: {
      overview: { api: 'GET /api/stats/overview', autoFetch: true },
      chart: { api: 'GET /api/stats/chart', autoFetch: true },
      recent: { api: 'GET /api/stats/recent', autoFetch: true },
    },
    tree: [{
      id: 'root', component: 'NResizable', props: { direction: 'vertical' },
      children: [
        { id: 'title', component: 'NText', props: { text: '运营仪表盘', size: 'heading', weight: 'bold' } },
        {
          id: 'stat-row', component: 'NResizable', props: { direction: 'horizontal' },
          children: [
            { id: 'stat-users', component: 'NCard', props: { title: '总用户数' }, children: [{ id: 'users-val', component: 'NText', props: { size: 'heading', weight: 'bold' }, binding: { dataSource: 'overview', field: 'totalUsers' } }] },
            { id: 'stat-revenue', component: 'NCard', props: { title: '总收入' }, children: [{ id: 'revenue-val', component: 'NText', props: { size: 'heading', weight: 'bold' }, binding: { dataSource: 'overview', field: 'revenue' } }] },
            { id: 'stat-orders', component: 'NCard', props: { title: '订单数' }, children: [{ id: 'orders-val', component: 'NText', props: { size: 'heading', weight: 'bold' }, binding: { dataSource: 'overview', field: 'orders' } }] },
            { id: 'stat-conversion', component: 'NCard', props: { title: '转化率' }, children: [{ id: 'conversion-val', component: 'NProgress', props: { max: 100 }, binding: { dataSource: 'overview', field: 'conversionRate' } }] },
          ],
        },
        { id: 'chart-card', component: 'NCard', props: { title: '趋势图' }, children: [{ id: 'trend-chart', component: 'NChart', props: { type: 'line' }, binding: { dataSource: 'chart', field: 'data' } }] },
        {
          id: 'recent-card', component: 'NCard', props: { title: '最近订单' },
          children: [{
            id: 'recent-table', component: 'NDataTable',
            props: { columns: [{ key: 'id', label: '订单号' }, { key: 'customer', label: '客户' }, { key: 'amount', label: '金额', sortable: true }, { key: 'status', label: '状态' }] },
            binding: { dataSource: 'recent', field: 'data' },
          }],
        },
      ],
    }],
  },
}

const DETAIL_EXAMPLE = {
  input: {
    apiList: 'GET /api/products/:id - 商品详情 (name, price, category, description, images, reviews)',
    taskCase: '商品详情页，需要图片展示、基本信息和评价列表',
  },
  output: {
    version: '1.0.0',
    page: { id: 'product-detail', name: '商品详情', route: '/products/:id' },
    dataSources: {
      product: { api: 'GET /api/products/:id', autoFetch: true },
    },
    tree: [{
      id: 'root', component: 'NResizable', props: { direction: 'vertical' },
      children: [
        { id: 'breadcrumb', component: 'NBreadcrumb', props: { items: [{ label: '首页', href: '/' }, { label: '商品列表', href: '/products' }, { label: '商品详情' }] } },
        {
          id: 'header', component: 'NCard', props: { variant: 'default' },
          children: [
            { id: 'product-name', component: 'NText', props: { size: 'heading', weight: 'bold' }, binding: { dataSource: 'product', field: 'name' } },
            { id: 'product-price', component: 'NText', props: { size: 'section', color: 'accent' }, binding: { dataSource: 'product', field: 'price' } },
            { id: 'product-category', component: 'NBadge', props: { color: 'blue' }, binding: { dataSource: 'product', field: 'category' } },
          ],
        },
        {
          id: 'detail-tabs', component: 'NTabs', props: { tabs: [{ id: 'info', label: '详情' }, { id: 'reviews', label: '评价' }], defaultValue: 'info' },
          children: [
            { id: 'info-card', component: 'NCard', props: {}, children: [{ id: 'product-desc', component: 'NText', props: { size: 'body' }, binding: { dataSource: 'product', field: 'description' } }] },
            { id: 'reviews-accordion', component: 'NAccordion', props: { items: [] }, binding: { dataSource: 'product', field: 'reviews' } },
          ],
        },
      ],
    }],
  },
}

/**
 * Select appropriate few-shot examples based on page type.
 */
export function selectExamples(pageType: PageType): string {
  const examples: Array<{ input: { apiList: string; taskCase: string }; output: unknown }> = []

  switch (pageType) {
    case 'crud':
      examples.push(CRUD_EXAMPLE, DASHBOARD_EXAMPLE)
      break
    case 'dashboard':
      examples.push(DASHBOARD_EXAMPLE, CRUD_EXAMPLE)
      break
    case 'detail':
      examples.push(DETAIL_EXAMPLE, CRUD_EXAMPLE)
      break
    case 'auto':
    default:
      examples.push(CRUD_EXAMPLE, DASHBOARD_EXAMPLE)
      break
  }

  let result = '## Few-shot 示例\n\n'
  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i]
    result += `### 示例 ${i + 1}\n`
    result += `**输入:**\n`
    result += `API 列表:\n${ex.input.apiList}\n`
    result += `任务描述: ${ex.input.taskCase}\n\n`
    result += `**输出:**\n${JSON.stringify(ex.output, null, 2)}\n\n`
  }

  return result
}
