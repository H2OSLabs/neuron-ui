// Built-in templates
import type { PageSchema } from '../types'
import activityPage from './built-in/activity-page.json'
import leaderboard from './built-in/leaderboard.json'

export interface Template {
  id: string
  name: string
  description: string
  schema: PageSchema
}

export const builtInTemplates: Template[] = [
  {
    id: 'activity-page',
    name: '活动列表',
    description: '活动管理 CRUD 列表页',
    schema: activityPage as PageSchema,
  },
  {
    id: 'leaderboard',
    name: '排行榜',
    description: '数据排行榜展示页',
    schema: leaderboard as PageSchema,
  },
]
