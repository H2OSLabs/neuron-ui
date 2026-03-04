// ============================================================
// Project Store — Project-level state for multi-page editing
// ============================================================

import { create } from 'zustand'
import type { ProjectSchema, ProjectNavigation, PageSchema } from '@neuron-ui/metadata'
import { useEditorStore } from './editor-store'

export interface ProjectState {
  /** Full project schema (null when not in project mode) */
  projectSchema: ProjectSchema | null
  /** Index of the currently active page */
  activePageIndex: number
  /** Whether we are in project mode */
  isProjectMode: boolean
}

export interface ProjectActions {
  /** Enter project mode with a project schema */
  setProjectSchema: (schema: ProjectSchema) => void
  /** Switch active page (saves current, loads target) */
  setActivePage: (index: number) => void
  /** Add a new page to the project */
  addPage: (page: PageSchema) => void
  /** Remove a page by index */
  removePage: (index: number) => void
  /** Rename a page */
  renamePage: (index: number, name: string) => void
  /** Update navigation config */
  updateNavigation: (nav: ProjectNavigation) => void
  /** Sync current editor state back into project pages[] */
  syncCurrentPage: () => void
  /** Exit project mode */
  clearProject: () => void
  /** Export the full project schema (with current page synced) */
  exportProjectSchema: () => ProjectSchema | null
}

export const useProjectStore = create<ProjectState & ProjectActions>()(
  (set, get) => ({
    // State
    projectSchema: null,
    activePageIndex: 0,
    isProjectMode: false,

    // Actions
    setProjectSchema: (schema: ProjectSchema) => {
      set({
        projectSchema: schema,
        activePageIndex: 0,
        isProjectMode: true,
      })
      // Load first page into editor
      if (schema.pages.length > 0) {
        useEditorStore.getState().setSchema(schema.pages[0])
      }
    },

    setActivePage: (index: number) => {
      const { projectSchema, activePageIndex } = get()
      if (!projectSchema || index < 0 || index >= projectSchema.pages.length) return
      if (index === activePageIndex) return

      // Save current page from editor back to project
      const currentSchema = useEditorStore.getState().pageSchema
      const updatedPages = [...projectSchema.pages]
      updatedPages[activePageIndex] = currentSchema

      // Load target page into editor
      set({
        projectSchema: { ...projectSchema, pages: updatedPages },
        activePageIndex: index,
      })
      useEditorStore.getState().setSchema(updatedPages[index])
    },

    addPage: (page: PageSchema) => {
      const { projectSchema } = get()
      if (!projectSchema) return

      // Sync current page first
      get().syncCurrentPage()

      const updatedSchema = {
        ...projectSchema,
        pages: [...projectSchema.pages, page],
      }
      set({ projectSchema: updatedSchema })
    },

    removePage: (index: number) => {
      const { projectSchema, activePageIndex } = get()
      if (!projectSchema || projectSchema.pages.length <= 1) return

      const updatedPages = projectSchema.pages.filter((_, i) => i !== index)
      const updatedSchema = { ...projectSchema, pages: updatedPages }

      let newActiveIndex = activePageIndex
      if (index <= activePageIndex) {
        newActiveIndex = Math.max(0, activePageIndex - 1)
      }
      if (newActiveIndex >= updatedPages.length) {
        newActiveIndex = updatedPages.length - 1
      }

      set({
        projectSchema: updatedSchema,
        activePageIndex: newActiveIndex,
      })
      useEditorStore.getState().setSchema(updatedPages[newActiveIndex])
    },

    renamePage: (index: number, name: string) => {
      const { projectSchema } = get()
      if (!projectSchema) return

      const updatedPages = [...projectSchema.pages]
      updatedPages[index] = {
        ...updatedPages[index],
        page: { ...updatedPages[index].page, name },
      }
      set({ projectSchema: { ...projectSchema, pages: updatedPages } })

      // If renaming the active page, also update editor
      if (index === get().activePageIndex) {
        const editorSchema = useEditorStore.getState().pageSchema
        useEditorStore.getState().setSchema({
          ...editorSchema,
          page: { ...editorSchema.page, name },
        })
      }
    },

    updateNavigation: (nav: ProjectNavigation) => {
      const { projectSchema } = get()
      if (!projectSchema) return
      set({ projectSchema: { ...projectSchema, navigation: nav } })
    },

    syncCurrentPage: () => {
      const { projectSchema, activePageIndex } = get()
      if (!projectSchema) return

      const currentSchema = useEditorStore.getState().pageSchema
      const updatedPages = [...projectSchema.pages]
      updatedPages[activePageIndex] = currentSchema
      set({ projectSchema: { ...projectSchema, pages: updatedPages } })
    },

    clearProject: () => {
      set({
        projectSchema: null,
        activePageIndex: 0,
        isProjectMode: false,
      })
    },

    exportProjectSchema: () => {
      const { projectSchema, activePageIndex } = get()
      if (!projectSchema) return null

      // Sync current page before export
      const currentSchema = useEditorStore.getState().pageSchema
      const updatedPages = [...projectSchema.pages]
      updatedPages[activePageIndex] = currentSchema
      return { ...projectSchema, pages: updatedPages }
    },
  }),
)
