import { describe, it, expect } from 'vitest'
import { generateHooksFile } from '../generators/hooks-generator'
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
      children: [
        {
          id: 'table',
          component: 'NDataTable',
          binding: { dataSource: 'userList' },
        },
      ],
    },
  ],
}

describe('generateHooksFile — hooks style (default)', () => {
  it('should generate plain useState + useEffect hooks', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'hooks', 'fetch')
    expect(code).toContain('import { useState, useEffect, useCallback }')
    expect(code).toContain('export function useUserList()')
    expect(code).toContain('useState')
    expect(code).toContain('useEffect')
    expect(code).toContain('useCallback')
  })

  it('should generate query hooks with refetch', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'hooks', 'fetch')
    expect(code).toContain('return { data, isLoading, error, refetch: fetchData }')
  })

  it('should generate mutation hooks with mutate', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'hooks', 'fetch')
    expect(code).toContain('export function useCreateUser()')
    expect(code).toContain('export function useDeleteUser()')
    expect(code).toContain('return { mutate, isLoading, error }')
  })

  it('should use fetch() API by default', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'hooks', 'fetch')
    expect(code).toContain("fetch('/api/users')")
  })

  it('should use axios when apiClient is axios', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'hooks', 'axios')
    expect(code).toContain("import axios from 'axios'")
    expect(code).toContain("axios.get('/api/users')")
    expect(code).toContain("axios.post('/api/users'")
    expect(code).toContain("axios.delete('/api/users/{id}'")
  })

  it('should use ky when apiClient is ky', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'hooks', 'ky')
    expect(code).toContain("import ky from 'ky'")
    expect(code).toContain("ky.get('/api/users').json()")
  })
})

describe('generateHooksFile — swr style', () => {
  it('should import useSWR and useSWRMutation', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'swr', 'fetch')
    expect(code).toContain("import { useSWR, useSWRMutation } from 'swr'")
  })

  it('should generate query hooks using useSWR', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'swr', 'fetch')
    expect(code).toContain('export function useUserList()')
    expect(code).toContain('return useSWR(')
  })

  it('should generate mutation hooks using useSWRMutation', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'swr', 'fetch')
    expect(code).toContain('export function useCreateUser()')
    expect(code).toContain('return useSWRMutation(')
  })
})

describe('generateHooksFile — react-query style', () => {
  it('should import from @tanstack/react-query', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'react-query', 'fetch')
    expect(code).toContain("from '@tanstack/react-query'")
    expect(code).toContain('useQuery')
    expect(code).toContain('useMutation')
    expect(code).toContain('useQueryClient')
  })

  it('should generate query hooks using useQuery', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'react-query', 'fetch')
    expect(code).toContain('export function useUserList()')
    expect(code).toContain('return useQuery({')
    expect(code).toContain("queryKey: ['userList']")
  })

  it('should generate mutation hooks using useMutation', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'react-query', 'fetch')
    expect(code).toContain('export function useCreateUser()')
    expect(code).toContain('return useMutation({')
  })

  it('should invalidate related queries on mutation success', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'react-query', 'fetch')
    // createUser should invalidate userList
    expect(code).toContain('invalidateQueries')
    expect(code).toContain("queryKey: ['userList']")
  })

  it('should use axios as api client when specified', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'react-query', 'axios')
    expect(code).toContain("import axios from 'axios'")
    expect(code).toContain("axios.get('/api/users')")
  })
})

describe('generateHooksFile — empty dataSources', () => {
  const noDataSchema: PageSchema = {
    version: '1.0.0',
    page: { id: 'about', name: 'About' },
    tree: [{ id: 'root', component: 'NCard' }],
  }

  it('should generate an empty export for schemas with no dataSources', () => {
    const code = generateHooksFile(noDataSchema)
    expect(code).toContain('No data sources defined')
    expect(code).toContain('export {}')
  })
})

describe('generateHooksFile — file header', () => {
  it('should include auto-generated header comment', () => {
    const code = generateHooksFile(CRUD_SCHEMA, 'hooks', 'fetch')
    expect(code).toContain('UserListPage.hooks.ts')
    expect(code).toContain('Auto-generated by @neuron-ui/codegen')
  })
})
