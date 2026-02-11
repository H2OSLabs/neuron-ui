// ============================================================
// Selection Store — Selected / hovered node tracking
// ============================================================

import { create } from 'zustand'
import type { SelectionState, SelectionActions } from '../types'

export const useSelectionStore = create<SelectionState & SelectionActions>()((set) => ({
  selectedNodeId: null,
  hoveredNodeId: null,

  select: (nodeId: string | null) => set({ selectedNodeId: nodeId }),
  hover: (nodeId: string | null) => set({ hoveredNodeId: nodeId }),
  deselect: () => set({ selectedNodeId: null }),
}))
