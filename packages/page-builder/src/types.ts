// ============================================================
// @neuron-ui/page-builder — Editor Types
// ============================================================

import type { PageSchema, PageSchemaTreeNode } from '@neuron-ui/metadata'

/** Editor mode */
export type EditorMode = 'edit' | 'preview'

/** Preview viewport */
export type PreviewViewport = 'desktop' | 'tablet' | 'collapsed'

/** Preview viewport widths */
export const VIEWPORT_WIDTHS: Record<PreviewViewport, number> = {
  desktop: 1440,
  tablet: 1288,
  collapsed: 928,
}

/** Drag item from component panel */
export interface DragComponentItem {
  /** Component name (N-prefixed) */
  component: string
  /** Default props */
  defaultProps: Record<string, unknown>
}

/** Component panel group */
export interface ComponentGroup {
  label: string
  category: string
  components: Array<{
    name: string
    icon: string
    defaultProps: Record<string, unknown>
  }>
}

/** Property editor type (from editor-types.json) */
export type PropEditorType =
  | 'text-input'
  | 'textarea'
  | 'select'
  | 'icon-picker'
  | 'color-token-picker'
  | 'number-input'
  | 'slider'
  | 'switch'
  | 'list-editor'
  | 'column-editor'
  | 'binding-editor'
  | 'slot-dropzone'

/** Property editor definition */
export interface PropEditorDef {
  key: string
  label: string
  editorType: PropEditorType
  value: unknown
  options?: string[]
}

/** Editor store state */
export interface EditorState {
  pageSchema: PageSchema
  mode: EditorMode
  viewport: PreviewViewport
}

/** Editor store actions */
export interface EditorActions {
  setSchema: (schema: PageSchema) => void
  updateNode: (nodeId: string, updates: Partial<PageSchemaTreeNode>) => void
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void
  addNode: (parentId: string, node: PageSchemaTreeNode, index?: number) => void
  removeNode: (nodeId: string) => void
  moveNode: (nodeId: string, newParentId: string, index: number) => void
  setMode: (mode: EditorMode) => void
  setViewport: (viewport: PreviewViewport) => void
}

/** Selection store state */
export interface SelectionState {
  selectedNodeId: string | null
  hoveredNodeId: string | null
}

/** Selection store actions */
export interface SelectionActions {
  select: (nodeId: string | null) => void
  hover: (nodeId: string | null) => void
  deselect: () => void
}

/** Find a node and its parent in the tree */
export interface NodeLocation {
  node: PageSchemaTreeNode
  parent: PageSchemaTreeNode | null
  index: number
}

export type { PageSchema, PageSchemaTreeNode }
