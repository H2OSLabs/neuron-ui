// ============================================================
// Editor Store — PageSchema state + operations + undo/redo
// Zustand + zundo (temporal middleware)
// ============================================================

import { create } from 'zustand'
import { temporal } from 'zundo'
import type {
  EditorState,
  EditorActions,
  EditorMode,
  PreviewViewport,
  PageSchema,
  PageSchemaTreeNode,
  NodeLocation,
} from '../types'

const DEFAULT_SCHEMA: PageSchema = {
  version: '1.0.0',
  page: { id: 'new-page', name: '新建页面' },
  tree: [],
}

// ---- Tree Helpers ----

function findNodeInTree(
  nodes: PageSchemaTreeNode[],
  nodeId: string,
  parent: PageSchemaTreeNode | null = null,
): NodeLocation | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      return { node: nodes[i], parent, index: i }
    }
    if (nodes[i].children) {
      const found = findNodeInTree(nodes[i].children!, nodeId, nodes[i])
      if (found) return found
    }
  }
  return null
}

function deepCloneTree(nodes: PageSchemaTreeNode[]): PageSchemaTreeNode[] {
  return JSON.parse(JSON.stringify(nodes))
}

function updateNodeInTree(
  nodes: PageSchemaTreeNode[],
  nodeId: string,
  updates: Partial<PageSchemaTreeNode>,
): PageSchemaTreeNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, ...updates }
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, nodeId, updates) }
    }
    return node
  })
}

function removeNodeFromTree(
  nodes: PageSchemaTreeNode[],
  nodeId: string,
): PageSchemaTreeNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.children) {
        return { ...node, children: removeNodeFromTree(node.children, nodeId) }
      }
      return node
    })
}

function addNodeToTree(
  nodes: PageSchemaTreeNode[],
  parentId: string,
  newNode: PageSchemaTreeNode,
  index?: number,
): PageSchemaTreeNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = node.children ? [...node.children] : []
      if (index !== undefined && index >= 0 && index <= children.length) {
        children.splice(index, 0, newNode)
      } else {
        children.push(newNode)
      }
      return { ...node, children }
    }
    if (node.children) {
      return { ...node, children: addNodeToTree(node.children, parentId, newNode, index) }
    }
    return node
  })
}

// ---- Store ----

export const useEditorStore = create<EditorState & EditorActions>()(
  temporal(
    (set) => ({
      // State
      pageSchema: DEFAULT_SCHEMA,
      mode: 'edit' as EditorMode,
      viewport: 'desktop' as PreviewViewport,

      // Actions
      setSchema: (schema: PageSchema) => set({ pageSchema: schema }),

      updateNode: (nodeId: string, updates: Partial<PageSchemaTreeNode>) =>
        set((state) => ({
          pageSchema: {
            ...state.pageSchema,
            tree: updateNodeInTree(state.pageSchema.tree, nodeId, updates),
          },
        })),

      updateNodeProps: (nodeId: string, props: Record<string, unknown>) =>
        set((state) => {
          const location = findNodeInTree(state.pageSchema.tree, nodeId)
          if (!location) return state
          const updatedProps = { ...(location.node.props ?? {}), ...props }
          return {
            pageSchema: {
              ...state.pageSchema,
              tree: updateNodeInTree(state.pageSchema.tree, nodeId, { props: updatedProps }),
            },
          }
        }),

      addNode: (parentId: string, node: PageSchemaTreeNode, index?: number) =>
        set((state) => {
          // If parentId is empty, add at root level
          if (!parentId) {
            const tree = [...state.pageSchema.tree]
            if (index !== undefined) {
              tree.splice(index, 0, node)
            } else {
              tree.push(node)
            }
            return { pageSchema: { ...state.pageSchema, tree } }
          }
          return {
            pageSchema: {
              ...state.pageSchema,
              tree: addNodeToTree(state.pageSchema.tree, parentId, node, index),
            },
          }
        }),

      removeNode: (nodeId: string) =>
        set((state) => ({
          pageSchema: {
            ...state.pageSchema,
            tree: removeNodeFromTree(state.pageSchema.tree, nodeId),
          },
        })),

      moveNode: (nodeId: string, newParentId: string, index: number) =>
        set((state) => {
          const tree = deepCloneTree(state.pageSchema.tree)
          const location = findNodeInTree(tree, nodeId)
          if (!location) return state

          // Remove from current position
          const withoutNode = removeNodeFromTree(tree, nodeId)

          // Add to new position
          if (!newParentId) {
            withoutNode.splice(index, 0, location.node)
            return { pageSchema: { ...state.pageSchema, tree: withoutNode } }
          }
          return {
            pageSchema: {
              ...state.pageSchema,
              tree: addNodeToTree(withoutNode, newParentId, location.node, index),
            },
          }
        }),

      setMode: (mode: EditorMode) => set({ mode }),
      setViewport: (viewport: PreviewViewport) => set({ viewport }),
    }),
    {
      // zundo temporal config: only track pageSchema changes for undo/redo
      partialize: (state) => ({ pageSchema: state.pageSchema }),
      limit: 50,
    },
  ),
)

// Export undo/redo helpers
export function useEditorUndo() {
  return useEditorStore.temporal.getState().undo
}

export function useEditorRedo() {
  return useEditorStore.temporal.getState().redo
}

export function useCanUndo() {
  return useEditorStore.temporal.getState().pastStates.length > 0
}

export function useCanRedo() {
  return useEditorStore.temporal.getState().futureStates.length > 0
}

// Re-export tree helpers for use in other modules
export { findNodeInTree }
