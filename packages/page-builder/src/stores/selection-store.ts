// ============================================================
// Selection Store — Selected / hovered node tracking
// ============================================================

import { create } from 'zustand'
import type { SelectionState, SelectionActions } from '../types'
import { syncActiveContext } from '../utils/active-context-sync'
import { useEditorStore, findNodeInTree } from './editor-store'

export const useSelectionStore = create<SelectionState & SelectionActions>()((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,

  select: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId })
    // Sync active context to MCP server
    if (nodeId) {
      const { pageSchema } = useEditorStore.getState()
      const location = findNodeInTree(pageSchema.tree, nodeId)
      syncActiveContext({
        pageId: pageSchema.page.id,
        componentId: nodeId,
        componentType: location?.node.component ?? null,
        timestamp: Date.now(),
      })
    } else {
      syncActiveContext({
        pageId: null,
        componentId: null,
        componentType: null,
        timestamp: Date.now(),
      })
    }
  },
  hover: (nodeId: string | null) => set({ hoveredNodeId: nodeId }),
  deselect: () => {
    set({ selectedNodeId: null })
    syncActiveContext({
      pageId: null,
      componentId: null,
      componentType: null,
      timestamp: Date.now(),
    })
  },
}))
