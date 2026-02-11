// ============================================================
// Tool: neuron_generate_code — Generate .tsx code from Page Schema
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { generatePageComponent } from '@neuron-ui/codegen'
import { generateHooksFile } from '@neuron-ui/codegen'
import { generateTypesFile } from '@neuron-ui/codegen'
import type { PageSchema } from '@neuron-ui/metadata'
import type { HooksStyle, ApiClientStyle } from '@neuron-ui/codegen'

/**
 * Register the neuron_generate_code tool on the MCP server.
 *
 * Uses @neuron-ui/codegen generators to produce:
 * - Page component (.tsx)
 * - Data-fetching hooks (.hooks.ts)
 * - Type definitions (.types.ts)
 */
export function registerGenerateCodeTool(server: McpServer): void {
  server.tool(
    'neuron_generate_code',
    'Generate React .tsx source files from a Page Schema. Produces a page component, data-fetching hooks, and TypeScript type definitions. Supports hooks/swr/react-query styles and fetch/axios/ky API clients.',
    {
      schema: z.record(z.unknown()).describe('Page Schema JSON object'),
      style: z
        .enum(['hooks', 'swr', 'react-query'])
        .default('hooks')
        .describe('Data-fetching style: plain React hooks, SWR, or React Query'),
      apiClient: z
        .enum(['fetch', 'axios', 'ky'])
        .default('fetch')
        .describe('API client library for generated fetch calls'),
    },
    async ({ schema, style, apiClient }) => {
      try {
        const pageSchema = schema as unknown as PageSchema

        // Validate minimum required fields
        if (!pageSchema.page?.name) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: 'Invalid schema',
                    detail: 'Schema must have a page.name field',
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          }
        }

        const hooksStyle = style as HooksStyle
        const apiClientStyle = apiClient as ApiClientStyle

        // Generate all files
        const pageCode = generatePageComponent(pageSchema, hooksStyle)
        const hooksCode = generateHooksFile(pageSchema, hooksStyle, apiClientStyle)
        const typesCode = generateTypesFile(pageSchema)

        // Determine file names from page name
        const pageName = toComponentFileName(pageSchema.page.name)

        const files = [
          {
            path: `${pageName}.tsx`,
            content: pageCode,
            type: 'page' as const,
            description: 'Page component with JSX rendering and state management',
          },
          {
            path: `${pageName}.hooks.ts`,
            content: hooksCode,
            type: 'hooks' as const,
            description: `Data-fetching hooks using ${style} style with ${apiClient} client`,
          },
          {
            path: `${pageName}.types.ts`,
            content: typesCode,
            type: 'types' as const,
            description: 'TypeScript type definitions for data sources and responses',
          },
        ]

        // Determine required dependencies
        const dependencies = buildDependencyList(style, apiClient)

        const result = {
          files,
          dependencies,
          generatedFrom: {
            pageName: pageSchema.page.name,
            pageId: pageSchema.page.id,
            dataSourceCount: Object.keys(pageSchema.dataSources ?? {}).length,
            treeNodeCount: countNodes(pageSchema.tree ?? []),
          },
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { error: 'Failed to generate code', detail: message },
                null,
                2,
              ),
            },
          ],
          isError: true,
        }
      }
    },
  )
}

// ---- Helpers ----

function toComponentFileName(name: string): string {
  // Convert page name to PascalCase file name
  return name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    || 'Page'
}

interface TreeNode {
  children?: TreeNode[]
}

function countNodes(nodes: TreeNode[]): number {
  let count = 0
  for (const node of nodes) {
    count += 1
    if (node.children) {
      count += countNodes(node.children)
    }
  }
  return count
}

function buildDependencyList(
  style: string,
  apiClient: string,
): { required: string[]; optional: string[] } {
  const required = ['@neuron-ui/tokens', '@neuron-ui/components']
  const optional: string[] = []

  switch (style) {
    case 'swr':
      optional.push('swr')
      break
    case 'react-query':
      optional.push('@tanstack/react-query')
      break
  }

  switch (apiClient) {
    case 'axios':
      optional.push('axios')
      break
    case 'ky':
      optional.push('ky')
      break
  }

  return { required, optional }
}
