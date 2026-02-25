// ============================================================
// Tool: neuron_list_components
// Lists all components, supports filtering by category and apiRole
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getManifest } from '../../loaders/index.js'

export function registerListComponents(server: McpServer) {
  server.tool(
    'neuron_list_components',
    'List all neuron-ui components. Supports filtering by category (display, input, action, container, feedback, navigation, layout) and apiRole (primary, auxiliary, submit, save, trigger, etc.).',
    {
      category: z
        .enum(['display', 'input', 'action', 'container', 'feedback', 'navigation', 'layout'])
        .optional()
        .describe('Filter by component category'),
      apiRole: z
        .string()
        .optional()
        .describe('Filter by API role (e.g. "primary", "submit", "create-modal")'),
    },
    async ({ category, apiRole }) => {
      const manifest = getManifest()
      let components = manifest.components

      // Filter by category
      if (category) {
        components = components.filter((c) => c.category === category)
      }

      // Filter by apiRole — match if any HTTP method maps to the given role
      if (apiRole) {
        components = components.filter((c) => {
          const roles = Object.values(c.apiRole)
          return roles.includes(apiRole as any)
        })
      }

      // Return a summary of each matching component
      const result = components.map((c) => ({
        name: c.name,
        displayName: c.displayName,
        category: c.category,
        description: c.description,
        variants: c.variants,
        sizes: c.sizes,
        apiRole: c.apiRole,
      }))

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                total: result.length,
                filters: {
                  ...(category ? { category } : {}),
                  ...(apiRole ? { apiRole } : {}),
                },
                components: result,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )
}
