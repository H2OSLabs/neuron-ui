// ============================================================
// Metadata Resources — Component manifest, API mapping, composition rules
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getManifest, getApiMapping, getCompositionRules } from '../loaders/index.js'

/**
 * Register 3 metadata resources:
 * - neuron://metadata/component-manifest
 * - neuron://metadata/component-api-mapping
 * - neuron://metadata/composition-rules
 */
export function registerMetadataResources(server: McpServer) {
  server.resource(
    'component-manifest',
    'neuron://metadata/component-manifest',
    {
      description: 'Full component manifest JSON — 53 components with variants, sizes, props, nesting rules, and API roles',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getManifest(), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )

  server.resource(
    'component-api-mapping',
    'neuron://metadata/component-api-mapping',
    {
      description: 'Component-API mapping rules — field type to component selection for display (GET) and input (POST/PUT) contexts',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getApiMapping(), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )

  server.resource(
    'composition-rules',
    'neuron://metadata/composition-rules',
    {
      description: 'Component composition rules — parent-child nesting constraints, max children limits, and global layout constraints',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getCompositionRules(), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )
}
