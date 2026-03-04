import { describe, it, expect } from 'vitest'
import type { ProjectSchema } from '@neuron-ui/metadata'
import { generateRouterFile } from '../generators/router-generator'
import { generateLayoutFile } from '../generators/layout-generator'
import { generateAppFile } from '../generators/app-generator'

const TEST_PROJECT: ProjectSchema = {
  version: '1.0.0',
  project: {
    id: 'test-project',
    name: 'Test Project',
    description: 'A test project',
  },
  navigation: {
    type: 'sidebar',
    items: [
      { pageId: 'page-a', label: 'Page A', icon: 'folder' },
      { pageId: 'page-b', label: 'Page B', icon: 'list-checks' },
    ],
  },
  pages: [
    {
      version: '1.0.0',
      page: { id: 'page-a', name: 'Page A', route: '/a' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: { direction: 'vertical' },
          children: [
            { id: 'title', component: 'NText', props: { text: 'A' } },
          ],
        },
      ],
    },
    {
      version: '1.0.0',
      page: { id: 'page-b', name: 'Page B', route: '/b' },
      tree: [
        {
          id: 'root',
          component: 'NResizable',
          props: { direction: 'vertical' },
          children: [
            { id: 'title', component: 'NText', props: { text: 'B' } },
          ],
        },
      ],
    },
  ],
}

describe('router-generator', () => {
  it('should generate lazy imports for each page', () => {
    const code = generateRouterFile(TEST_PROJECT)
    expect(code).toContain("import { lazy } from 'react'")
    expect(code).toContain("const PageAPage = lazy(() => import('./pages/PageAPage/PageAPage'))")
    expect(code).toContain("const PageBPage = lazy(() => import('./pages/PageBPage/PageBPage'))")
  })

  it('should generate route config with paths', () => {
    const code = generateRouterFile(TEST_PROJECT)
    expect(code).toContain("path: '/a'")
    expect(code).toContain("path: '/b'")
    expect(code).toContain('element: <PageAPage />')
    expect(code).toContain('element: <PageBPage />')
  })

  it('should fallback to page id as path when route is missing', () => {
    const schema: ProjectSchema = {
      ...TEST_PROJECT,
      pages: [
        {
          version: '1.0.0',
          page: { id: 'no-route', name: 'No Route' },
          tree: [{ id: 'root', component: 'NResizable', props: {} }],
        },
      ],
    }
    const code = generateRouterFile(schema)
    expect(code).toContain("path: '/no-route'")
  })
})

describe('layout-generator', () => {
  it('should generate sidebar layout', () => {
    const code = generateLayoutFile(TEST_PROJECT)
    expect(code).toContain("import { Outlet, NavLink } from 'react-router-dom'")
    expect(code).toContain('export function AppLayout()')
    expect(code).toContain('<Outlet />')
    expect(code).toContain('Test Project')
    expect(code).toContain('Page A')
    expect(code).toContain('Page B')
  })

  it('should import lucide-react icons', () => {
    const code = generateLayoutFile(TEST_PROJECT)
    expect(code).toContain("import { Folder, ListChecks } from 'lucide-react'")
  })

  it('should generate header layout when type is header', () => {
    const headerProject: ProjectSchema = {
      ...TEST_PROJECT,
      navigation: { ...TEST_PROJECT.navigation, type: 'header' },
    }
    const code = generateLayoutFile(headerProject)
    expect(code).toContain('<header')
    expect(code).toContain('export function AppLayout()')
  })

  it('should use NavLink with routes from page schemas', () => {
    const code = generateLayoutFile(TEST_PROJECT)
    expect(code).toContain('to="/a"')
    expect(code).toContain('to="/b"')
  })
})

describe('app-generator', () => {
  it('should generate App with BrowserRouter and Suspense', () => {
    const code = generateAppFile(TEST_PROJECT)
    expect(code).toContain("import { Suspense } from 'react'")
    expect(code).toContain("import { BrowserRouter, useRoutes } from 'react-router-dom'")
    expect(code).toContain("import { routes } from './routes'")
    expect(code).toContain("import { AppLayout } from './AppLayout'")
    expect(code).toContain('export function App()')
    expect(code).toContain('<BrowserRouter>')
    expect(code).toContain('<Suspense')
    expect(code).toContain('<AppRoutes />')
  })

  it('should generate AppRoutes function with layout wrapper', () => {
    const code = generateAppFile(TEST_PROJECT)
    expect(code).toContain('function AppRoutes()')
    expect(code).toContain('useRoutes([{ element: <AppLayout />, children: routes }])')
  })
})
