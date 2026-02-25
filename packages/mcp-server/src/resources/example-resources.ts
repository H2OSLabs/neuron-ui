// ============================================================
// Example Resources — Example Page Schema files
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getExample } from '../loaders/index.js'

/**
 * Register 3 example resources:
 * - neuron://examples/crud-page      — CRUD management page example
 * - neuron://examples/dashboard-page  — Sales dashboard example
 * - neuron://examples/detail-page     — User detail page example
 */
export function registerExampleResources(server: McpServer) {
  server.resource(
    'example-crud-page',
    'neuron://examples/crud-page',
    {
      description: 'Example Page Schema: CRUD management page with data table, create dialog, edit sheet, and delete confirmation',
      mimeType: 'application/json',
    },
    async (uri) => {
      const example = getExample('crud-page')
      return {
        contents: [
          {
            uri: uri.href,
            text: example
              ? JSON.stringify(example.schema, null, 2)
              : JSON.stringify({ error: 'Example not found: crud-page' }),
            mimeType: 'application/json',
          },
        ],
      }
    },
  )

  server.resource(
    'example-dashboard-page',
    'neuron://examples/dashboard-page',
    {
      description: 'Example Page Schema: Sales dashboard with stats cards, charts, and recent orders table',
      mimeType: 'application/json',
    },
    async (uri) => {
      const example = getExample('dashboard-page')
      return {
        contents: [
          {
            uri: uri.href,
            text: example
              ? JSON.stringify(example.schema, null, 2)
              : JSON.stringify({ error: 'Example not found: dashboard-page' }),
            mimeType: 'application/json',
          },
        ],
      }
    },
  )

  server.resource(
    'example-detail-page',
    'neuron://examples/detail-page',
    {
      description: 'Example Page Schema: User detail page with profile card, tabs for basic info, orders, and activity log',
      mimeType: 'application/json',
    },
    async (uri) => {
      const example = getExample('detail-page')
      return {
        contents: [
          {
            uri: uri.href,
            text: example
              ? JSON.stringify(example.schema, null, 2)
              : JSON.stringify({ error: 'Example not found: detail-page' }),
            mimeType: 'application/json',
          },
        ],
      }
    },
  )
}
