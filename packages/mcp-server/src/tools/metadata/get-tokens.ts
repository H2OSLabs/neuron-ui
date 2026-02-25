// ============================================================
// Tool: neuron_get_tokens
// Gets design token values from @neuron-ui/tokens
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getTokenCategory } from '../../loaders/index.js'

export function registerGetTokens(server: McpServer) {
  server.tool(
    'neuron_get_tokens',
    'Get neuron-ui design token values. Categories: "colors" (14-level gray + 10 accent + 3 semantic), "spacing" (4-64px), "radius" (4-9999px), "typography" (font families + 7 font sizes), or "all" for everything.',
    {
      category: z
        .enum(['colors', 'spacing', 'radius', 'typography', 'all'])
        .optional()
        .describe('Token category to retrieve. Defaults to "all".'),
    },
    async ({ category }) => {
      const effectiveCategory = category ?? 'all'
      const tokenData = getTokenCategory(effectiveCategory)

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                category: effectiveCategory,
                tokens: tokenData,
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
