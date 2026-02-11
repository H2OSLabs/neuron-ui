// ============================================================
// Tool: neuron_get_component
// Gets a single component's full details by name
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getManifest, getCompositionRules } from '../../loaders/index.js'

export function registerGetComponent(server: McpServer) {
  server.tool(
    'neuron_get_component',
    'Get complete details for a specific neuron-ui component by name (e.g. "NButton", "NDataTable"). Returns props, variants, sizes, nesting rules, and API roles.',
    {
      name: z
        .string()
        .describe('Component name (N-prefixed, e.g. "NButton", "NCard", "NDataTable")'),
    },
    async ({ name }) => {
      const manifest = getManifest()
      const component = manifest.components.find((c) => c.name === name)

      if (!component) {
        // Try case-insensitive search as a fallback
        const lowerName = name.toLowerCase()
        const fuzzy = manifest.components.find(
          (c) => c.name.toLowerCase() === lowerName,
        )

        if (!fuzzy) {
          return {
            content: [
              {
                type: 'text' as const,
                text: JSON.stringify(
                  {
                    error: `Component "${name}" not found`,
                    suggestion: 'Use neuron_list_components to see all available components',
                    availableComponents: manifest.components.map((c) => c.name),
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        }

        // Found via case-insensitive match
        return buildResponse(fuzzy)
      }

      return buildResponse(component)
    },
  )
}

function buildResponse(component: ReturnType<typeof getManifest>['components'][number]) {
  const rules = getCompositionRules()

  // Find composition rules where this component is a parent
  const asParent = rules.rules.find((r) => r.parent === component.name)

  // Find composition rules where this component is an allowed child
  const asChild = rules.rules
    .filter((r) => r.allowedChildren.includes(component.name))
    .map((r) => r.parent)

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            name: component.name,
            displayName: component.displayName,
            description: component.description,
            category: component.category,
            importPath: component.importPath,
            variants: component.variants,
            sizes: component.sizes,
            props: component.props,
            slots: component.slots,
            canBeChildOf: component.canBeChildOf,
            canContain: component.canContain,
            apiRole: component.apiRole,
            isRootContainer: component.isRootContainer ?? false,
            constraints: component.constraints ?? null,
            compositionRules: {
              asParent: asParent
                ? {
                    allowedChildren: asParent.allowedChildren,
                    constraints: asParent.constraints ?? {},
                  }
                : null,
              canBeChildOfParents: asChild,
            },
          },
          null,
          2,
        ),
      },
    ],
  }
}
