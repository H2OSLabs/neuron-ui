// Built-in templates
import type { PageSchema, ProjectSchema } from '@neuron-ui/metadata'
import activityPage from './built-in/activity-page.json'
import leaderboard from './built-in/leaderboard.json'
import projectLibrary from '../../../../spec/schemas/project-library.schema.json'
import taskManagement from '../../../../spec/schemas/task-management.schema.json'
import taskExecution from '../../../../spec/schemas/task-execution.schema.json'

export interface Template {
  id: string
  name: string
  description: string
  schema: PageSchema
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  schema: ProjectSchema
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

export const builtInProjectTemplates: ProjectTemplate[] = [
  {
    id: 'elf-project-manager',
    name: 'ELF Project 管理',
    description: 'Project Library + Task 管理 + Task 执行 (3页)',
    schema: {
      version: '1.0.0',
      project: {
        id: 'elf-project-manager',
        name: 'ELF Project 管理',
        description: 'Project Library、Task 管理与执行',
      },
      navigation: {
        type: 'sidebar',
        items: [
          { pageId: 'project-library', label: 'Project Library', icon: 'folder' },
          { pageId: 'task-management', label: 'Task 管理', icon: 'list-checks' },
          { pageId: 'task-execution', label: 'Task 执行', icon: 'play' },
        ],
      },
      pages: [
        projectLibrary as PageSchema,
        taskManagement as PageSchema,
        taskExecution as PageSchema,
      ],
    },
  },
]
