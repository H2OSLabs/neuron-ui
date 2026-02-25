// ============================================================
// Example Loader — Loads example Page Schema files from @neuron-ui/metadata
// ============================================================

import type { ExampleEntry } from '../types.js'

// Import example schemas from @neuron-ui/metadata package exports
import crudPageExample from '@neuron-ui/metadata/page-schema/examples/crud-page.json'
import dashboardPageExample from '@neuron-ui/metadata/page-schema/examples/dashboard-page.json'
import detailPageExample from '@neuron-ui/metadata/page-schema/examples/detail-page.json'

interface ExampleDefinition {
  name: string
  description: string
  schema: unknown
}

// Static list of known examples
const exampleDefinitions: ExampleDefinition[] = [
  {
    name: 'crud-page',
    description: 'CRUD management page with data table, create dialog, edit sheet, and delete confirmation',
    schema: crudPageExample,
  },
  {
    name: 'dashboard-page',
    description: 'Sales dashboard with stats cards, charts, and recent orders table',
    schema: dashboardPageExample,
  },
  {
    name: 'detail-page',
    description: 'User detail page with tabs for orders and activities',
    schema: detailPageExample,
  },
]

/**
 * Get all example Page Schemas.
 */
export function getExamples(): ExampleEntry[] {
  return exampleDefinitions.map((def) => ({
    name: def.name,
    description: def.description,
    schema: def.schema,
  }))
}

/**
 * Get a specific example by name.
 */
export function getExample(name: string): ExampleEntry | undefined {
  const def = exampleDefinitions.find((d) => d.name === name)
  if (!def) return undefined
  return { name: def.name, description: def.description, schema: def.schema }
}

/**
 * List available example names and descriptions (without loading full schemas).
 */
export function listExampleNames(): Array<{ name: string; description: string }> {
  return exampleDefinitions.map((d) => ({
    name: d.name,
    description: d.description,
  }))
}
