// ============================================================
// Catalog Resource — Auto-generated AI prompt from neuronCatalog
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getCatalogPrompt } from '../loaders/index.js'

/**
 * Register 1 catalog resource:
 * - neuron://catalog/prompt — Markdown prompt listing all 53 components and 9 actions
 */
export function registerCatalogResource(server: McpServer) {
  server.resource(
    'catalog-prompt',
    'neuron://catalog/prompt',
    {
      description: 'Auto-generated AI system prompt from neuronCatalog — markdown listing all 53 N-components with descriptions and all 9 dispatchable actions',
      mimeType: 'text/plain',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: getCatalogPrompt(),
          mimeType: 'text/plain',
        },
      ],
    }),
  )
}
