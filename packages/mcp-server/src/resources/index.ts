// ============================================================
// Resources — Register all 12 MCP resources
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerMetadataResources } from './metadata-resources.js'
import { registerTokenResources } from './token-resources.js'
import { registerSchemaResources } from './schema-resources.js'
import { registerExampleResources } from './example-resources.js'
import { registerCatalogResource } from './catalog-resource.js'

/**
 * Register all 12 MCP resources on the server:
 *
 * Metadata (3):
 *   - neuron://metadata/component-manifest
 *   - neuron://metadata/component-api-mapping
 *   - neuron://metadata/composition-rules
 *
 * Tokens (5):
 *   - neuron://tokens/all
 *   - neuron://tokens/colors
 *   - neuron://tokens/spacing
 *   - neuron://tokens/radius
 *   - neuron://tokens/typography
 *
 * Schema (1):
 *   - neuron://schemas/page-schema-spec
 *
 * Examples (3):
 *   - neuron://examples/crud-page
 *   - neuron://examples/dashboard-page
 *   - neuron://examples/detail-page
 *
 * Catalog (1):
 *   - neuron://catalog/prompt
 */
export function registerResources(server: McpServer) {
  registerMetadataResources(server)
  registerTokenResources(server)
  registerSchemaResources(server)
  registerExampleResources(server)
  registerCatalogResource(server)
}
