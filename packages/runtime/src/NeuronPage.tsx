// ============================================================
// NeuronPage: Top-level container for rendering a Page Schema
// Assembles: SchemaAdapter + DataSourceLayer + Renderer
// ============================================================

import { useMemo } from 'react'
import type { NeuronPageProps } from './types'
import { pageSchemaToUITree } from './adapter/schema-adapter'
import { DataSourceLayer } from './data/DataSourceLayer'
import { Renderer } from './renderer/Renderer'
import { createNeuronRegistry } from './catalog/neuron-registry'

// Singleton registry — all 53 components mapped once
const defaultRegistry = createNeuronRegistry()

/**
 * NeuronPage renders a complete page from a Page Schema.
 *
 * It wires together:
 * 1. SchemaAdapter — converts nested tree → flat UITree
 * 2. DataSourceLayer — fetches dataSources, provides DataContext + ActionContext
 * 3. Renderer — recursively renders the UITree using the component registry
 */
export function NeuronPage({
  schema,
  dataProvider,
  actionOverrides,
  fallback,
  error: ErrorComponent,
}: NeuronPageProps) {
  // Convert nested Page Schema to flat UITree
  const uiTree = useMemo(() => {
    try {
      return pageSchemaToUITree(schema)
    } catch (err) {
      console.error('[NeuronPage] Failed to convert schema:', err)
      return null
    }
  }, [schema])

  if (!uiTree) {
    if (ErrorComponent) {
      return <ErrorComponent error={new Error('Invalid Page Schema')} />
    }
    return <div className="neuron-error">Invalid Page Schema</div>
  }

  return (
    <DataSourceLayer
      schema={schema}
      dataProvider={dataProvider}
      actionOverrides={actionOverrides}
    >
      <Renderer
        tree={uiTree}
        registry={defaultRegistry}
        fallback={fallback}
      />
    </DataSourceLayer>
  )
}
