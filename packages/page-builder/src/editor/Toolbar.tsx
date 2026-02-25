// ============================================================
// Toolbar — Undo/redo, mode toggle, viewport, export
// ============================================================

import React, { useCallback } from 'react'
import {
  Undo2,
  Redo2,
  Eye,
  Pencil,
  Monitor,
  Tablet,
  PanelLeftClose,
  Download,
  FileJson,
} from 'lucide-react'
import { useEditorStore } from '../stores/editor-store'
import type { PreviewViewport } from '../types'

export function Toolbar() {
  const mode = useEditorStore((s) => s.mode)
  const viewport = useEditorStore((s) => s.viewport)
  const setMode = useEditorStore((s) => s.setMode)
  const setViewport = useEditorStore((s) => s.setViewport)
  const pageSchema = useEditorStore((s) => s.pageSchema)

  const handleUndo = useCallback(() => {
    useEditorStore.temporal.getState().undo()
  }, [])

  const handleRedo = useCallback(() => {
    useEditorStore.temporal.getState().redo()
  }, [])

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(pageSchema, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pageSchema.page.id || 'page'}-schema.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [pageSchema])

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const schema = JSON.parse(text)
        useEditorStore.getState().setSchema(schema)
      } catch {
        // Invalid JSON
      }
    }
    input.click()
  }, [])

  const viewportButtons: Array<{ key: PreviewViewport; icon: React.ReactNode; label: string }> = [
    { key: 'desktop', icon: <Monitor size={16} />, label: '桌面' },
    { key: 'tablet', icon: <Tablet size={16} />, label: '平板' },
    { key: 'collapsed', icon: <PanelLeftClose size={16} />, label: '收起' },
  ]

  return (
    <div className="flex items-center justify-between h-10 px-4 border-b border-[var(--gray-11)] bg-white">
      {/* Left: Undo/Redo */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={handleUndo} title="撤销 (Ctrl+Z)">
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={handleRedo} title="重做 (Ctrl+Shift+Z)">
          <Redo2 size={16} />
        </ToolbarButton>
      </div>

      {/* Center: Viewport */}
      <div className="flex items-center gap-1 bg-[var(--gray-13)] rounded-md p-0.5">
        {viewportButtons.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setViewport(key)}
            title={label}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              viewport === key
                ? 'bg-white text-[var(--gray-02)] shadow-sm'
                : 'text-[var(--gray-06)] hover:text-[var(--gray-03)]'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Right: Mode + Export */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => setMode(mode === 'edit' ? 'preview' : 'edit')}
          active={mode === 'preview'}
          title={mode === 'edit' ? '预览' : '编辑'}
        >
          {mode === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}
        </ToolbarButton>

        <div className="w-px h-4 bg-[var(--gray-11)] mx-1" />

        <ToolbarButton onClick={handleImportJSON} title="导入 JSON">
          <FileJson size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={handleExportJSON} title="导出 JSON">
          <Download size={16} />
        </ToolbarButton>
      </div>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
        active
          ? 'bg-[var(--blue)] text-white'
          : 'text-[var(--gray-05)] hover:bg-[var(--gray-13)] hover:text-[var(--gray-02)]'
      }`}
    >
      {children}
    </button>
  )
}
