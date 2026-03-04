// ============================================================
// App — Main editor layout (3-column + toolbar)
// ============================================================

import { useEffect } from 'react'
import { Toolbar } from './editor/Toolbar'
import { Canvas } from './editor/Canvas'
import { ComponentPanel } from './editor/ComponentPanel'
import { ComponentTreePanel } from './editor/ComponentTreePanel'
import { PropertyPanel } from './editor/PropertyPanel'
import { ComponentEditor } from './editor/ComponentEditor'
import { PageListPanel } from './editor/PageListPanel'
import { useEditorStore } from './stores/editor-store'
import { useProjectStore } from './stores/project-store'
import { useSelectionStore } from './stores/selection-store'
import { builtInTemplates, builtInProjectTemplates } from './templates'
import type { ProjectSchema } from '@neuron-ui/metadata'

export function App() {
  const mode = useEditorStore((s) => s.mode)
  const pageSchema = useEditorStore((s) => s.pageSchema)
  const setSchema = useEditorStore((s) => s.setSchema)
  const componentEditorNodeId = useEditorStore((s) => s.componentEditorNodeId)
  const isProjectMode = useProjectStore((s) => s.isProjectMode)
  const projectSchema = useProjectStore((s) => s.projectSchema)
  const activePageIndex = useProjectStore((s) => s.activePageIndex)
  const leftPanelOpen = true

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Z: undo
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useEditorStore.temporal.getState().undo()
      }
      // Ctrl+Shift+Z: redo
      if (e.ctrlKey && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        useEditorStore.temporal.getState().redo()
      }
      // Delete/Backspace: remove selected node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        const selectedId = useSelectionStore.getState().selectedNodeId
        if (selectedId) {
          e.preventDefault()
          useEditorStore.getState().removeNode(selectedId)
          useSelectionStore.getState().deselect()
        }
      }
      // Escape: deselect
      if (e.key === 'Escape') {
        useSelectionStore.getState().deselect()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Show template picker if schema is empty
  const isEmpty = pageSchema.tree.length === 0

  return (
    <div className="h-screen flex flex-col bg-[var(--gray-14)] text-[var(--gray-02)]">
      {/* Toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project mode: Page list panel */}
        {isProjectMode && mode === 'edit' && (
          <div className="w-44 border-r border-[var(--gray-11)] bg-white overflow-y-auto editor-panel">
            <PageListPanel />
          </div>
        )}

        {/* Left: Component Panel + Component Tree (hidden in preview mode) */}
        {mode === 'edit' && leftPanelOpen && (
          <div className="w-60 border-r border-[var(--gray-11)] bg-white overflow-y-auto editor-panel flex flex-col">
            <ComponentPanel />
            <div className="border-t border-[var(--gray-11)]">
              <ComponentTreePanel />
            </div>
          </div>
        )}

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isEmpty && mode === 'edit' && !isProjectMode ? (
            <TemplatePicker onSelect={setSchema} onSelectProject={useProjectStore.getState().setProjectSchema} />
          ) : (
            <Canvas />
          )}
        </div>

        {/* Right: Property Panel (hidden in preview mode) */}
        {mode === 'edit' && (
          <div className="w-72 border-l border-[var(--gray-11)] bg-white overflow-y-auto editor-panel">
            <PropertyPanel />
          </div>
        )}
      </div>

      {/* ComponentEditor overlay */}
      {componentEditorNodeId && <ComponentEditor />}

      {/* Status bar */}
      <div className="h-6 flex items-center px-4 border-t border-[var(--gray-11)] bg-white text-xs text-[var(--gray-07)]">
        {isProjectMode && projectSchema ? (
          <>
            <span>{projectSchema.project.name}</span>
            <span className="mx-2">·</span>
            <span>页面 {activePageIndex + 1}/{projectSchema.pages.length}</span>
            <span className="mx-2">·</span>
            <span>{countNodes(pageSchema.tree)} 个组件</span>
          </>
        ) : (
          <>
            <span>{pageSchema.page.name}</span>
            <span className="mx-2">·</span>
            <span>{countNodes(pageSchema.tree)} 个组件</span>
          </>
        )}
      </div>
    </div>
  )
}

function countNodes(nodes: Array<{ children?: unknown[] }>): number {
  let count = 0
  for (const node of nodes) {
    count += 1
    if (node.children) {
      count += countNodes(node.children as Array<{ children?: unknown[] }>)
    }
  }
  return count
}

function TemplatePicker({
  onSelect,
  onSelectProject,
}: {
  onSelect: (schema: import('./types').PageSchema) => void
  onSelectProject: (schema: ProjectSchema) => void
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="max-w-lg w-full p-8">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--gray-02)' }}>
          开始构建页面
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--gray-06)' }}>
          选择一个模板快速开始，或从空白页面创建
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Empty template */}
          <button
            onClick={() =>
              onSelect({
                version: '1.0.0',
                page: { id: 'new-page', name: '新建页面' },
                tree: [
                  {
                    id: 'root',
                    component: 'NResizable',
                    props: { direction: 'vertical' },
                    children: [],
                  },
                ],
              })
            }
            className="p-4 border border-dashed border-[var(--gray-10)] rounded-lg hover:border-[var(--blue)] hover:bg-[var(--gray-14)] transition-colors text-left"
          >
            <div className="text-sm font-medium" style={{ color: 'var(--gray-03)' }}>
              空白页面
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--gray-07)' }}>
              从零开始创建
            </div>
          </button>

          {/* Built-in page templates */}
          {builtInTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.schema)}
              className="p-4 border border-[var(--gray-11)] rounded-lg hover:border-[var(--blue)] hover:bg-[var(--gray-14)] transition-colors text-left"
            >
              <div className="text-sm font-medium" style={{ color: 'var(--gray-03)' }}>
                {t.name}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--gray-07)' }}>
                {t.description}
              </div>
            </button>
          ))}
        </div>

        {/* Project templates */}
        {builtInProjectTemplates.length > 0 && (
          <>
            <div className="mt-6 mb-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-[var(--gray-11)]" />
              <span className="text-xs" style={{ color: 'var(--gray-07)' }}>多页项目</span>
              <div className="h-px flex-1 bg-[var(--gray-11)]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {builtInProjectTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onSelectProject(t.schema)}
                  className="p-4 border border-[var(--blue)]/30 rounded-lg hover:border-[var(--blue)] hover:bg-[var(--gray-14)] transition-colors text-left"
                >
                  <div className="text-sm font-medium" style={{ color: 'var(--gray-03)' }}>
                    {t.name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--gray-07)' }}>
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
