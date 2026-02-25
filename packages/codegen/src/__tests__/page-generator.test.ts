import { describe, it, expect } from 'vitest'
import { generatePageComponent } from '../generators/page-generator'
import type { PageSchema } from '@neuron-ui/metadata'

const CRUD_SCHEMA: PageSchema = {
  version: '1.0.0',
  page: { id: 'user-list', name: 'User List' },
  dataSources: {
    userList: { api: 'GET /api/users', autoFetch: true },
    createUser: { api: 'POST /api/users' },
    deleteUser: { api: 'DELETE /api/users/{id}' },
  },
  tree: [
    {
      id: 'root',
      component: 'NResizable',
      props: { direction: 'vertical' },
      children: [
        {
          id: 'table',
          component: 'NDataTable',
          props: {
            columns: [{ key: 'name', label: 'Name' }],
            data: [],
          },
          binding: { dataSource: 'userList' },
        },
        {
          id: 'create-btn',
          component: 'NButton',
          props: { label: '新增' },
          binding: { onClick: 'openDialog:create-dialog' },
        },
        {
          id: 'create-dialog',
          component: 'NDialog',
          props: { title: '新增用户' },
          children: [
            {
              id: 'name-input',
              component: 'NInput',
              props: { placeholder: '姓名' },
            },
          ],
        },
      ],
    },
  ],
}

describe('generatePageComponent', () => {
  it('should generate a valid component function', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    expect(code).toContain('export function UserListPage')
  })

  it('should import all used N-components from @neuron-ui/components', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    expect(code).toContain("from '@neuron-ui/components'")
    expect(code).toContain('NResizable')
    expect(code).toContain('NDataTable')
    expect(code).toContain('NButton')
    expect(code).toContain('NDialog')
    expect(code).toContain('NInput')
  })

  it('should import hooks from the companion hooks file', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    expect(code).toContain('.hooks')
    expect(code).toContain('useUserList')
    expect(code).toContain('useCreateUser')
    expect(code).toContain('useDeleteUser')
  })

  it('should generate dialog open state for NDialog nodes', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    expect(code).toContain('createDialogOpen')
    expect(code).toContain('setCreateDialogOpen')
  })

  it('should include data-neuron-component attributes', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    expect(code).toContain('data-neuron-component="root"')
    expect(code).toContain('data-neuron-component="table"')
    expect(code).toContain('data-neuron-component="create-btn"')
    expect(code).toContain('data-neuron-component="create-dialog"')
  })

  it('should include "use client" directive', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    expect(code).toContain("'use client'")
  })

  it('should wire up onClick binding to open dialogs', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    // The create-btn has binding.onClick = "openDialog:create-dialog"
    expect(code).toContain('setCreateDialogOpen(true)')
  })

  it('should render data binding for query data sources', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    // The table is bound to userList
    expect(code).toContain('userList')
  })

  it('should handle query and mutation hooks differently', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    // Query hooks destructure data/isLoading/refetch
    expect(code).toContain('data: userList')
    expect(code).toContain('isLoading')
    // Mutation hooks destructure mutate
    expect(code).toContain('mutate: createUser')
    expect(code).toContain('mutate: deleteUser')
  })

  it('should render static props from the schema', () => {
    const code = generatePageComponent(CRUD_SCHEMA)
    expect(code).toContain('direction="vertical"')
    expect(code).toContain('title="新增用户"')
    expect(code).toContain('placeholder="姓名"')
  })
})

describe('generatePageComponent with NAlertDialog', () => {
  const schemaWithAlert: PageSchema = {
    version: '1.0.0',
    page: { id: 'item-list', name: 'Item List' },
    tree: [
      {
        id: 'root',
        component: 'NResizable',
        children: [
          {
            id: 'delete-confirm',
            component: 'NAlertDialog',
            props: { title: '确认删除', description: '此操作不可恢复' },
          },
        ],
      },
    ],
  }

  it('should generate nullable state for NAlertDialog', () => {
    const code = generatePageComponent(schemaWithAlert)
    expect(code).toContain('useState<string | null>(null)')
  })

  it('should use double-negation pattern for NAlertDialog open prop', () => {
    const code = generatePageComponent(schemaWithAlert)
    expect(code).toContain('open={!!deleteConfirmOpen}')
    expect(code).toContain('setDeleteConfirmOpen(null)')
  })
})

describe('generatePageComponent with NSheet', () => {
  const schemaWithSheet: PageSchema = {
    version: '1.0.0',
    page: { id: 'edit-page', name: 'Edit Page' },
    tree: [
      {
        id: 'root',
        component: 'NResizable',
        children: [
          {
            id: 'edit-sheet',
            component: 'NSheet',
            props: { title: '编辑' },
            children: [
              { id: 'field', component: 'NInput', props: { placeholder: 'Name' } },
            ],
          },
        ],
      },
    ],
  }

  it('should generate boolean state for NSheet', () => {
    const code = generatePageComponent(schemaWithSheet)
    expect(code).toContain('editSheetOpen')
    expect(code).toContain('setEditSheetOpen')
    expect(code).toContain('useState(false)')
  })
})

describe('generatePageComponent with no dataSources', () => {
  const staticSchema: PageSchema = {
    version: '1.0.0',
    page: { id: 'about', name: 'About' },
    tree: [
      {
        id: 'root',
        component: 'NCard',
        props: { title: 'About Us' },
        children: [
          { id: 'text', component: 'NText', props: { children: 'Hello world' } },
        ],
      },
    ],
  }

  it('should not import from hooks file when no dataSources', () => {
    const code = generatePageComponent(staticSchema)
    expect(code).not.toContain('.hooks')
  })

  it('should still render the component tree', () => {
    const code = generatePageComponent(staticSchema)
    expect(code).toContain('NCard')
    expect(code).toContain('NText')
    expect(code).toContain('export function AboutPage')
  })
})
