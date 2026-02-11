// ============================================================
// Schema Resources — Page Schema JSON Schema definition
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

// Import the page schema JSON from @neuron-ui/metadata package export
import pageSchemaSpec from '@neuron-ui/metadata/page-schema/page.schema.json'

/**
 * Register 1 schema resource:
 * - neuron://schemas/page-schema-spec — The JSON Schema definition for Page Schema
 */
export function registerSchemaResources(server: McpServer) {
  server.resource(
    'page-schema-spec',
    'neuron://schemas/page-schema-spec',
    {
      description: 'Page Schema JSON Schema definition — describes the format for AI-generated page schemas consumed by the page builder and runtime renderer',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(pageSchemaSpec, null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )
}
