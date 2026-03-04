// ============================================================
// Project Schema Parser — Read and parse Project Schema JSON files
// ============================================================

import fs from 'fs/promises'
import path from 'path'
import type { ProjectSchema } from '@neuron-ui/metadata'

/**
 * Read and parse a Project Schema JSON file from disk.
 * Throws if the file doesn't exist or contains invalid JSON/structure.
 */
export async function parseProjectSchemaFile(filePath: string): Promise<ProjectSchema> {
  const resolved = path.resolve(filePath)
  const content = await fs.readFile(resolved, 'utf-8')
  const schema = JSON.parse(content) as ProjectSchema

  // Basic structural validation
  if (!schema.version) {
    throw new Error(`Invalid Project Schema: missing "version" field in ${resolved}`)
  }
  if (!schema.project?.id || !schema.project?.name) {
    throw new Error(`Invalid Project Schema: missing "project.id" or "project.name" in ${resolved}`)
  }
  if (!Array.isArray(schema.pages) || schema.pages.length === 0) {
    throw new Error(`Invalid Project Schema: "pages" must be a non-empty array in ${resolved}`)
  }

  // Validate each page has basic structure
  for (let i = 0; i < schema.pages.length; i++) {
    const page = schema.pages[i]
    if (!page.page?.id || !page.page?.name) {
      throw new Error(`Invalid Project Schema: pages[${i}] missing "page.id" or "page.name" in ${resolved}`)
    }
    if (!Array.isArray(page.tree) || page.tree.length === 0) {
      throw new Error(`Invalid Project Schema: pages[${i}] "tree" must be a non-empty array in ${resolved}`)
    }
  }

  return schema
}
