// ============================================================
// usePageSchema: Load Page Schema from various sources
// ============================================================

import { useState, useEffect } from 'react'
import type { PageSchema, SchemaSource, UsePageSchemaResult } from '../types'

/** Load and validate a Page Schema from inline, URL, or JSON string */
export function usePageSchema(source: SchemaSource): UsePageSchemaResult {
  const [schema, setSchema] = useState<PageSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        let result: PageSchema

        switch (source.type) {
          case 'inline':
            result = source.schema
            break

          case 'url': {
            const response = await fetch(source.url)
            if (!response.ok) {
              throw new Error(`Failed to fetch schema: ${response.status}`)
            }
            result = (await response.json()) as PageSchema
            break
          }

          case 'json':
            result = JSON.parse(source.json) as PageSchema
            break
        }

        if (!cancelled) {
          setSchema(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [source.type, source.type === 'inline' ? source.schema : source.type === 'url' ? source.url : (source as { json: string }).json])

  return { schema, loading, error }
}
