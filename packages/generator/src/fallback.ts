import type { PageSchema, ValidationError } from '@neuron-ui/metadata'
import type { PageType, GeneratePageResult } from './types'

/**
 * Generate a minimal skeleton Page Schema as a fallback when AI generation fails.
 */
export function fallbackGenerate(
  apiList: string,
  taskCase: string,
  pageType: PageType,
  retries: number,
  errors: ValidationError[],
): GeneratePageResult {
  const skeleton = generateSkeleton(pageType, taskCase)

  return {
    pageSchema: skeleton,
    metadata: {
      generatedBy: 'ai',
      apiResource: apiList.slice(0, 200),
      taskCase,
      retries,
      degraded: true,
      degradeReason: errors,
      suggestedActions: [
        '在编辑器中手动添加缺失的组件',
        '检查 API 格式是否可被 AI 正确理解',
        '尝试简化 TaskCase 描述后重新生成',
      ],
    },
  }
}

function generateSkeleton(pageType: PageType, taskCase: string): PageSchema {
  const pageId = taskCase
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30)
    || 'page'

  switch (pageType) {
    case 'crud':
      return {
        version: '1.0.0',
        page: { id: `${pageId}-crud`, name: taskCase, description: '自动生成骨架（需手动完善）' },
        dataSources: {
          list: { api: 'GET /api/resource', autoFetch: true },
          create: { api: 'POST /api/resource', method: 'POST' },
          update: { api: 'PUT /api/resource/:id', method: 'PUT' },
          remove: { api: 'DELETE /api/resource/:id', method: 'DELETE' },
        },
        tree: [{
          id: 'root', component: 'NResizable', props: { direction: 'vertical' },
          children: [
            {
              id: 'toolbar', component: 'NCard', props: {},
              children: [
                { id: 'search', component: 'NInputGroup', props: { icon: 'search' }, children: [{ id: 'search-input', component: 'NInput', props: { placeholder: '搜索...' } }] },
                { id: 'create-btn', component: 'NButton', props: { label: '新建', variant: 'default', icon: 'plus' } },
              ],
            },
            { id: 'data-table', component: 'NDataTable', props: { columns: [], data: [] }, binding: { dataSource: 'list', field: 'data' } },
            { id: 'pagination', component: 'NPagination', props: { currentPage: 1, totalPages: 1 } },
            { id: 'create-dialog', component: 'NDialog', props: { title: '新建' }, children: [] },
            { id: 'delete-confirm', component: 'NAlertDialog', props: { title: '确认删除', description: '确定删除吗？', destructive: true }, binding: { onConfirm: 'remove' } },
          ],
        }],
      }

    case 'dashboard':
      return {
        version: '1.0.0',
        page: { id: `${pageId}-dashboard`, name: taskCase, description: '自动生成骨架（需手动完善）' },
        dataSources: {
          stats: { api: 'GET /api/stats', autoFetch: true },
        },
        tree: [{
          id: 'root', component: 'NResizable', props: { direction: 'vertical' },
          children: [
            { id: 'title', component: 'NText', props: { text: taskCase, size: 'heading', weight: 'bold' } },
            {
              id: 'stat-row', component: 'NResizable', props: { direction: 'horizontal' },
              children: [
                { id: 'stat-1', component: 'NCard', props: { title: '指标 1' }, children: [{ id: 'val-1', component: 'NText', props: { size: 'heading', weight: 'bold', text: '--' } }] },
                { id: 'stat-2', component: 'NCard', props: { title: '指标 2' }, children: [{ id: 'val-2', component: 'NText', props: { size: 'heading', weight: 'bold', text: '--' } }] },
              ],
            },
            { id: 'chart-card', component: 'NCard', props: { title: '图表' }, children: [{ id: 'chart', component: 'NChart', props: { type: 'bar' } }] },
          ],
        }],
      }

    case 'detail':
      return {
        version: '1.0.0',
        page: { id: `${pageId}-detail`, name: taskCase, description: '自动生成骨架（需手动完善）' },
        dataSources: {
          detail: { api: 'GET /api/resource/:id', autoFetch: true },
        },
        tree: [{
          id: 'root', component: 'NCard', props: { variant: 'default' },
          children: [
            { id: 'title', component: 'NText', props: { size: 'heading', weight: 'bold' }, binding: { dataSource: 'detail', field: 'name' } },
            {
              id: 'tabs', component: 'NTabs', props: { tabs: [{ id: 'info', label: '基本信息' }], defaultValue: 'info' },
              children: [
                { id: 'info-content', component: 'NText', props: { size: 'body', text: '请在编辑器中添加详情字段' } },
              ],
            },
          ],
        }],
      }

    case 'auto':
    default:
      return {
        version: '1.0.0',
        page: { id: `${pageId}-auto`, name: taskCase, description: '自动生成骨架（需手动完善）' },
        dataSources: {},
        tree: [{
          id: 'root', component: 'NResizable', props: { direction: 'vertical' },
          children: [
            { id: 'title', component: 'NText', props: { text: taskCase, size: 'heading', weight: 'bold' } },
            { id: 'placeholder', component: 'NCard', props: { title: '页面内容' }, children: [{ id: 'help-text', component: 'NText', props: { text: '请在编辑器中继续完善此页面', size: 'body', color: 'muted' } }] },
          ],
        }],
      }
  }
}
