import { describe, it, expect } from 'vitest'
import { adaptBinding } from '../adapter/binding-adapter'

describe('adaptBinding', () => {
  it('should adapt dataSource to __dataPath', () => {
    const result = adaptBinding({ dataSource: 'list' })
    expect(result.__dataPath).toBe('/dataSources/list')
  })

  it('should adapt field to __statePath', () => {
    const result = adaptBinding({ field: 'name' })
    expect(result.__statePath).toBe('/form/name')
  })

  it('should adapt onSubmit to submitForm action', () => {
    const result = adaptBinding({ onSubmit: 'POST /api/users' })
    expect(result.__action).toEqual({
      name: 'submitForm',
      params: { api: 'POST /api/users' },
    })
  })

  it('should adapt onConfirm to deleteItem action', () => {
    const result = adaptBinding({ onConfirm: 'DELETE /api/users/{id}' })
    expect(result.__action).toEqual({
      name: 'deleteItem',
      params: { api: 'DELETE /api/users/{id}', confirm: true },
    })
  })

  it('should adapt prefill', () => {
    const result = adaptBinding({
      prefill: { dataSource: 'user', fieldMap: { name: 'userName' } },
    })
    expect(result.__prefill).toEqual({
      dataSource: 'user',
      fieldMap: { name: 'userName' },
    })
  })

  it('should combine multiple binding fields', () => {
    const result = adaptBinding({
      dataSource: 'list',
      field: 'data',
    })
    expect(result.__dataPath).toBe('/dataSources/list')
    expect(result.__statePath).toBe('/form/data')
  })

  it('should return empty object for empty binding', () => {
    const result = adaptBinding({})
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('should adapt onChange to __onChange with data source path', () => {
    const result = adaptBinding({ onChange: 'list.params.keyword' })
    expect(result.__onChange).toEqual({ path: '/dataSources/list/params/keyword' })
  })

  it('should adapt onClick with action:target format', () => {
    const result = adaptBinding({ onClick: 'openDialog:create' })
    expect(result.__action).toEqual({
      name: 'openDialog',
      params: { target: 'create' },
    })
  })

  it('should adapt onClick with navigate action', () => {
    const result = adaptBinding({ onClick: 'navigate:/users/{id}' })
    expect(result.__action).toEqual({
      name: 'navigate',
      params: { target: '/users/{id}' },
    })
  })

  it('should adapt onClick without target (single word)', () => {
    const result = adaptBinding({ onClick: 'refresh' })
    expect(result.__action).toEqual({
      name: 'refresh',
      params: {},
    })
  })

  it('should have onSubmit override onClick when both present', () => {
    const result = adaptBinding({
      onClick: 'openDialog:form',
      onSubmit: 'POST /api/submit',
    })
    expect(result.__action).toEqual({
      name: 'submitForm',
      params: { api: 'POST /api/submit' },
    })
  })

  it('should have onConfirm override earlier actions', () => {
    const result = adaptBinding({
      onClick: 'openDialog:form',
      onSubmit: 'POST /api/submit',
      onConfirm: 'DELETE /api/item/1',
    })
    expect(result.__action).toEqual({
      name: 'deleteItem',
      params: { api: 'DELETE /api/item/1', confirm: true },
    })
  })
})
