// ============================================================
// @neuron-ui/runtime - Core Types
// Self-built lightweight renderer (json-render fallback)
// ============================================================

import type React from 'react'
import type { z } from 'zod'
import type { PageSchema, PageSchemaTreeNode } from '@neuron-ui/metadata'

// ---- UITree: Flat element map for rendering ----

/** Individual renderable element in the flat UITree */
export interface UIElement {
  /** Unique element key */
  key: string
  /** Component type name (e.g. 'NButton') */
  type: string
  /** Component props */
  props: Record<string, unknown>
  /** Keys of child elements */
  children?: string[]
}

/** Flat element map with root reference — converted from nested PageSchema tree */
export interface UITree {
  /** Root element key */
  root: string
  /** All elements keyed by their unique key */
  elements: Record<string, UIElement>
}

// ---- Catalog Types ----

/** Component definition in the catalog */
export interface CatalogComponentDef {
  /** Zod schema for props validation */
  props: z.ZodType
  /** Whether this component can contain children */
  hasChildren?: boolean
  /** Component description */
  description: string
}

/** Action definition in the catalog */
export interface CatalogActionDef {
  /** Zod schema for action params */
  params: z.ZodType
  /** Action description */
  description: string
}

/** Catalog configuration */
export interface CatalogConfig {
  name: string
  components: Record<string, CatalogComponentDef>
  actions: Record<string, CatalogActionDef>
  validation?: 'strict' | 'loose'
}

/** Catalog instance */
export interface Catalog {
  /** Catalog name */
  name: string
  /** Registered component definitions */
  components: Record<string, CatalogComponentDef>
  /** Registered action definitions */
  actions: Record<string, CatalogActionDef>
  /** Validate a single element */
  validateElement: (type: string, props: Record<string, unknown>) => { valid: boolean; errors: string[] }
  /** Generate AI system prompt from catalog */
  prompt: () => string
}

// ---- Action Types ----

/** Action reference in component props */
export interface ActionSchema {
  /** Action name */
  name: string
  /** Action params */
  params: Record<string, unknown>
}

/** Action handler function */
export type ActionHandler = (params: Record<string, unknown>) => void | Promise<void>

/** Map of action name → handler */
export type ActionHandlers = Record<string, ActionHandler>

// ---- Data Types ----

/** Data provider configuration */
export interface DataProviderConfig {
  /** Base URL for API requests */
  baseURL: string
  /** Default headers */
  headers?: Record<string, string>
  /** Custom fetch function */
  fetchFn?: typeof fetch
}

/** Data provider instance */
export interface DataProvider {
  /** Fetch data from API */
  fetch: (request: { method: string; path: string }, params?: Record<string, unknown>) => Promise<unknown>
  /** Mutate data via API */
  mutate: (request: { method: string; path: string }, body?: unknown) => Promise<unknown>
}

/** Data context value */
export interface DataContextValue {
  /** Data model */
  data: Record<string, unknown>
  /** Set value at path */
  setData: (path: string, value: unknown) => void
  /** Get value at path */
  getData: (path: string) => unknown
}

/** Action context value */
export interface ActionContextValue {
  /** Dispatch an action */
  dispatch: (action: ActionSchema) => void | Promise<void>
}

// ---- Registry Types ----

/** Props passed to registered component renderers */
export interface RegistryComponentProps {
  /** Element props from the UITree */
  props: Record<string, unknown>
  /** Rendered children (if any) */
  children?: React.ReactNode
  /** Action dispatch function */
  onAction?: (action: ActionSchema) => void | Promise<void>
}

/** Component registry mapping type names to React implementations */
export type ComponentRegistry = Record<string, React.ComponentType<RegistryComponentProps>>

// ---- Renderer Types ----

/** Renderer props */
export interface RendererProps {
  /** UITree to render */
  tree: UITree
  /** Component registry */
  registry: ComponentRegistry
  /** Fallback for unknown components */
  fallback?: React.ComponentType<{ element: UIElement }>
}

// ---- NeuronPage Types ----

/** NeuronPage props */
export interface NeuronPageProps {
  /** Page Schema */
  schema: PageSchema
  /** Data provider for API calls */
  dataProvider: DataProvider
  /** Action handler overrides */
  actionOverrides?: Partial<ActionHandlers>
  /** Fallback component for unknown types */
  fallback?: React.ComponentType<{ element: UIElement }>
  /** Loading component */
  loading?: React.ReactNode
  /** Error component */
  error?: React.ComponentType<{ error: Error }>
}

// ---- Hook Types ----

/** Schema source options */
export type SchemaSource =
  | { type: 'inline'; schema: PageSchema }
  | { type: 'url'; url: string }
  | { type: 'json'; json: string }

/** usePageSchema return */
export interface UsePageSchemaResult {
  schema: PageSchema | null
  loading: boolean
  error: Error | null
}

/** useNeuronPage return */
export interface UseNeuronPageResult {
  tree: UITree | null
  loading: boolean
  error: Error | null
}

// Re-export for convenience
export type { PageSchema, PageSchemaTreeNode }
