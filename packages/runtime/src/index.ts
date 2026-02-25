// ============================================================
// @neuron-ui/runtime — Public API
// Self-built lightweight renderer (json-render compatible interface)
// ============================================================

// ---- Types ----
export type {
  UIElement,
  UITree,
  ActionSchema,
  ActionHandler,
  ActionHandlers,
  CatalogComponentDef,
  CatalogActionDef,
  CatalogConfig,
  Catalog,
  DataProviderConfig,
  DataProvider,
  DataContextValue,
  ActionContextValue,
  RegistryComponentProps,
  ComponentRegistry,
  RendererProps,
  NeuronPageProps,
  SchemaSource,
  UsePageSchemaResult,
  UseNeuronPageResult,
} from './types'

export type { PageSchema, PageSchemaTreeNode } from './types'

// ---- Top-Level Component ----
export { NeuronPage } from './NeuronPage'

// ---- Catalog ----
export { createCatalog } from './catalog/create-catalog'
export { neuronCatalog } from './catalog/neuron-catalog'
export { createNeuronRegistry } from './catalog/neuron-registry'
export { createDefaultActionHandlers } from './catalog/neuron-actions'
export type { DefaultActionHandlerOptions } from './catalog/neuron-actions'

// ---- Adapters ----
export {
  pageSchemaToUITree,
  extractComponentNames,
  VIRTUAL_ROOT_KEY,
  FRAGMENT_TYPE,
} from './adapter/schema-adapter'
export { adaptBinding } from './adapter/binding-adapter'
export {
  resolveColorToken,
  resolveSpacingToken,
  resolveRadiusToken,
  resolveToken,
  resolveQualifiedToken,
} from './adapter/token-adapter'

// ---- Renderer ----
export { Renderer } from './renderer/Renderer'
export { DataContextProvider, useDataContext } from './renderer/DataContext'
export { ActionProvider, useActionContext } from './renderer/ActionContext'

// ---- Data Layer ----
export { DataSourceLayer } from './data/DataSourceLayer'
export { createDataProvider, parseApi } from './data/createDataProvider'

// ---- Hooks ----
export { usePageSchema } from './hooks/usePageSchema'
export { useNeuronPage } from './hooks/useNeuronPage'
