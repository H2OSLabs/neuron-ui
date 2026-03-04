import { describe, it, expect } from 'vitest'
import { pageSchemaTreeNodeSchema, eventActionSchema } from '../schemas'

describe('EventAction schema', () => {
  it('accepts navigate event action', () => {
    const result = eventActionSchema.safeParse({
      action: 'navigate',
      target: '/users/:id',
    })
    expect(result.success).toBe(true)
  })

  it('accepts callApi event action', () => {
    const result = eventActionSchema.safeParse({
      action: 'callApi',
      target: 'userList',
      merge: 'params',
    })
    expect(result.success).toBe(true)
  })

  it('accepts refresh event action', () => {
    const result = eventActionSchema.safeParse({
      action: 'refresh',
      target: 'user-table',
    })
    expect(result.success).toBe(true)
  })

  it('accepts show event action', () => {
    const result = eventActionSchema.safeParse({
      action: 'show',
      target: 'dialog-1',
    })
    expect(result.success).toBe(true)
  })

  it('accepts hide event action', () => {
    const result = eventActionSchema.safeParse({
      action: 'hide',
      target: 'dialog-1',
    })
    expect(result.success).toBe(true)
  })

  it('accepts updateState event action', () => {
    const result = eventActionSchema.safeParse({
      action: 'updateState',
      key: 'selectedId',
      value: '123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects unknown event action', () => {
    const result = eventActionSchema.safeParse({
      action: 'unknownAction',
    })
    expect(result.success).toBe(false)
  })
})

describe('PageSchemaTreeNode schema', () => {
  it('accepts node with domAttr and events', () => {
    const node = {
      id: 'btn',
      component: 'NButton',
      props: {},
      domAttr: 'btn',
      events: {
        onClick: { action: 'navigate', target: '/users/:id' },
      },
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(true)
  })

  it('accepts node with callApi event and onSuccess', () => {
    const node = {
      id: 'table',
      component: 'NDataTable',
      props: {},
      events: {
        onSort: { action: 'callApi', target: 'userList', merge: 'params' },
      },
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(true)
  })

  it('accepts node with binding fieldMap', () => {
    const node = {
      id: 'table',
      component: 'NDataTable',
      props: {},
      binding: {
        dataSource: 'userList',
        fieldMap: {
          'user.name': 'column:姓名',
          'user.email': 'column:邮箱',
        },
      },
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(true)
  })

  it('rejects node with unknown event action', () => {
    const node = {
      id: 'btn',
      component: 'NButton',
      props: {},
      events: {
        onClick: { action: 'unknownAction' },
      },
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(false)
  })

  it('accepts node without optional fields', () => {
    const node = {
      id: 'btn',
      component: 'NButton',
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(true)
  })

  it('accepts nested children', () => {
    const node = {
      id: 'root',
      component: 'NResizable',
      children: [
        {
          id: 'child-1',
          component: 'NButton',
          props: { label: 'Click me' },
          events: {
            onClick: { action: 'navigate', target: '/home' },
          },
        },
      ],
    }
    const result = pageSchemaTreeNodeSchema.safeParse(node)
    expect(result.success).toBe(true)
  })
})
