// ============================================================
// useNeuronPage: Combined hook — schema loading + adapter + ready state
// ============================================================

import { useMemo } from 'react'
import type { SchemaSource, UseNeuronPageResult, UITree } from '../types'
import { usePageSchema } from './usePageSchema'
import { pageSchemaToUITree } from '../adapter/schema-adapter'

/**
 * Combined hook that loads a Page Schema and converts it to a UITree.
 *
 * @example
 * ```tsx
 * const { tree, loading, error } = useNeuronPage({ type: 'url', url: '/api/page/123' })
 * if (loading) return <Spinner />
 * if (error) return <ErrorMessage error={error} />
 * return <Renderer tree={tree} registry={registry} />
 * ```
 */
export function useNeuronPage(source: SchemaSource): UseNeuronPageResult {
  const { schema, loading, error } = usePageSchema(source)

  const tree = useMemo<UITree | null>(() => {
    if (!schema) return null
    try {
      return pageSchemaToUITree(schema)
    } catch {
      return null
    }
  }, [schema])

  return { tree, loading, error }
}
