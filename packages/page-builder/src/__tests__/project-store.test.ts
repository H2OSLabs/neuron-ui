import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from '../stores/project-store'
import { useEditorStore } from '../stores/editor-store'
import type { ProjectSchema, PageSchema } from '@neuron-ui/metadata'

const PAGE_A: PageSchema = {
  version: '1.0.0',
  page: { id: 'page-a', name: 'Page A', route: '/a' },
  tree: [
    {
      id: 'root',
      component: 'NResizable',
      props: { direction: 'vertical' },
      children: [
        { id: 'title-a', component: 'NText', props: { text: 'A' } },
      ],
    },
  ],
}

const PAGE_B: PageSchema = {
  version: '1.0.0',
  page: { id: 'page-b', name: 'Page B', route: '/b' },
  tree: [
    {
      id: 'root',
      component: 'NResizable',
      props: { direction: 'vertical' },
      children: [
        { id: 'title-b', component: 'NText', props: { text: 'B' } },
      ],
    },
  ],
}

const TEST_PROJECT: ProjectSchema = {
  version: '1.0.0',
  project: { id: 'test', name: 'Test Project' },
  navigation: {
    type: 'sidebar',
    items: [
      { pageId: 'page-a', label: 'Page A' },
      { pageId: 'page-b', label: 'Page B' },
    ],
  },
  pages: [PAGE_A, PAGE_B],
}

describe('project-store', () => {
  beforeEach(() => {
    useProjectStore.getState().clearProject()
    useEditorStore.getState().setSchema({
      version: '1.0.0',
      page: { id: 'empty', name: 'Empty' },
      tree: [],
    })
  })

  it('should enter project mode', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    const state = useProjectStore.getState()
    expect(state.isProjectMode).toBe(true)
    expect(state.activePageIndex).toBe(0)
    expect(state.projectSchema?.pages).toHaveLength(2)

    // Editor should load first page
    const editorState = useEditorStore.getState()
    expect(editorState.pageSchema.page.id).toBe('page-a')
  })

  it('should switch active page', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    useProjectStore.getState().setActivePage(1)

    const state = useProjectStore.getState()
    expect(state.activePageIndex).toBe(1)

    const editorState = useEditorStore.getState()
    expect(editorState.pageSchema.page.id).toBe('page-b')
  })

  it('should not switch to invalid index', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    useProjectStore.getState().setActivePage(5)

    expect(useProjectStore.getState().activePageIndex).toBe(0)
  })

  it('should not switch to same page', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    useProjectStore.getState().setActivePage(0)
    expect(useProjectStore.getState().activePageIndex).toBe(0)
  })

  it('should add a page', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    const newPage: PageSchema = {
      version: '1.0.0',
      page: { id: 'page-c', name: 'Page C' },
      tree: [{ id: 'root', component: 'NResizable', props: {} }],
    }
    useProjectStore.getState().addPage(newPage)

    expect(useProjectStore.getState().projectSchema?.pages).toHaveLength(3)
  })

  it('should remove a page', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    useProjectStore.getState().removePage(1)

    const state = useProjectStore.getState()
    expect(state.projectSchema?.pages).toHaveLength(1)
    expect(state.projectSchema?.pages[0].page.id).toBe('page-a')
  })

  it('should not remove the last page', () => {
    const singlePageProject: ProjectSchema = {
      ...TEST_PROJECT,
      pages: [PAGE_A],
    }
    useProjectStore.getState().setProjectSchema(singlePageProject)
    useProjectStore.getState().removePage(0)

    expect(useProjectStore.getState().projectSchema?.pages).toHaveLength(1)
  })

  it('should rename a page', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    useProjectStore.getState().renamePage(0, 'Renamed')

    expect(useProjectStore.getState().projectSchema?.pages[0].page.name).toBe('Renamed')

    // Active page should also be updated in editor
    expect(useEditorStore.getState().pageSchema.page.name).toBe('Renamed')
  })

  it('should update navigation', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    useProjectStore.getState().updateNavigation({
      type: 'header',
      items: [{ pageId: 'page-a', label: 'Home' }],
    })

    expect(useProjectStore.getState().projectSchema?.navigation.type).toBe('header')
  })

  it('should export project schema with current page synced', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)

    // Modify current page in editor
    useEditorStore.getState().updateNodeProps('title-a', { text: 'Modified' })

    const exported = useProjectStore.getState().exportProjectSchema()
    expect(exported).not.toBeNull()
    expect(exported!.pages[0].tree[0].children?.[0].props?.text).toBe('Modified')
  })

  it('should clear project mode', () => {
    useProjectStore.getState().setProjectSchema(TEST_PROJECT)
    useProjectStore.getState().clearProject()

    const state = useProjectStore.getState()
    expect(state.isProjectMode).toBe(false)
    expect(state.projectSchema).toBeNull()
    expect(state.activePageIndex).toBe(0)
  })
})
