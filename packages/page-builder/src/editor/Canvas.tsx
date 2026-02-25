// ============================================================
// Canvas — Main editor canvas area with DnD context
// Renders the page via EditorRenderer inside a responsive viewport
// ============================================================

import React, { useCallback } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { useEditorStore } from '../stores/editor-store'
import { useSelectionStore } from '../stores/selection-store'
import { EditorRenderer } from '../renderer/EditorRenderer'
import { VIEWPORT_WIDTHS } from '../types'

/**
 * The Canvas component provides:
 * 1. A responsive viewport container whose width is controlled by the editor store
 * 2. A DndContext from @dnd-kit/core for drag-and-drop reordering
 * 3. The EditorRenderer for rendering the page schema with editor overlays
 * 4. Click-to-deselect on the canvas background
 */
export function Canvas() {
  const mode = useEditorStore((s) => s.mode)
  const viewport = useEditorStore((s) => s.viewport)
  const moveNode = useEditorStore((s) => s.moveNode)

  const width = VIEWPORT_WIDTHS[viewport]

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeId = String(active.id)
      const overParentId = String(over.data?.current?.parentId ?? '')
      const overIndex = (over.data?.current?.index as number) ?? 0

      moveNode(activeId, overParentId, overIndex)
    },
    [moveNode],
  )

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Only deselect if clicking the canvas background itself, not a child
      if (e.target === e.currentTarget) {
        useSelectionStore.getState().deselect()
      }
    },
    [],
  )

  const handleOuterClick = useCallback(
    (e: React.MouseEvent) => {
      // Deselect when clicking the outer (gray) area
      if (e.target === e.currentTarget) {
        useSelectionStore.getState().deselect()
      }
    },
    [],
  )

  return (
    <div
      className="flex-1 overflow-auto bg-[var(--gray-13)] p-6"
      onClick={handleOuterClick}
    >
      <div
        className="mx-auto bg-white rounded-lg shadow-sm min-h-[600px] overflow-hidden transition-[max-width] duration-300"
        style={{ maxWidth: width }}
        onClick={handleCanvasClick}
      >
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <EditorRenderer editable={mode === 'edit'} />
        </DndContext>
      </div>
    </div>
  )
}
