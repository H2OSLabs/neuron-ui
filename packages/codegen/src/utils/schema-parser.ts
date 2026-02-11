// ============================================================
// Schema Parser — Read and parse Page Schema JSON files
// ============================================================

import fs from 'fs/promises'
import path from 'path'
import type { PageSchema } from '@neuron-ui/metadata'

/**
 * Read and parse a Page Schema JSON file from disk.
 * Throws if the file doesn't exist or contains invalid JSON.
 */
export async function parseSchemaFile(filePath: string): Promise<PageSchema> {
  const resolved = path.resolve(filePath)
  const content = await fs.readFile(resolved, 'utf-8')
  const schema = JSON.parse(content) as PageSchema

  // Basic structural validation
  if (!schema.version) {
    throw new Error(`Invalid Page Schema: missing "version" field in ${resolved}`)
  }
  if (!schema.page?.id || !schema.page?.name) {
    throw new Error(`Invalid Page Schema: missing "page.id" or "page.name" in ${resolved}`)
  }
  if (!Array.isArray(schema.tree) || schema.tree.length === 0) {
    throw new Error(`Invalid Page Schema: "tree" must be a non-empty array in ${resolved}`)
  }

  return schema
}
