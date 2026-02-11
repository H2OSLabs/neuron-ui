// ============================================================
// Tool: neuron_get_composition_rules
// Gets component nesting constraints and composition rules
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getCompositionRules } from '../../loaders/index.js'

export function registerGetCompositionRules(server: McpServer) {
  server.tool(
    'neuron_get_composition_rules',
    'Get component nesting/composition rules. Optionally filter by a specific parent component to see what children it allows. Includes global constraints (max nesting depth, root containers, token requirements).',
    {
      parent: z
        .string()
        .optional()
        .describe('Filter rules for a specific parent component (e.g. "NDialog", "NCard")'),
    },
    async ({ parent }) => {
      const rules = getCompositionRules()

      let filteredRules = rules.rules

      if (parent) {
        filteredRules = rules.rules.filter((r) => r.parent === parent)

        if (filteredRules.length === 0) {
          // Check if the parent component exists in any rule (maybe it's a child)
          const asChild = rules.rules
            .filter((r) => r.allowedChildren.includes(parent))
            .map((r) => ({
              parent: r.parent,
              constraints: r.constraints,
            }))

          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    note: `No composition rules found where "${parent}" is a parent container.`,
                    canBeChildOf: asChild.length > 0
                      ? asChild
                      : `"${parent}" is not listed as an allowed child in any rule either.`,
                    globalConstraints: rules.globalConstraints,
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                version: rules.version,
                totalRules: filteredRules.length,
                ...(parent ? { filteredBy: parent } : {}),
                rules: filteredRules,
                globalConstraints: rules.globalConstraints,
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
