// ============================================================
// Tool: neuron_validate_schema — Validate a Page Schema
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  validatePageSchema,
  componentManifest,
  compositionRules,
} from '@neuron-ui/metadata'
import type { PageSchema } from '@neuron-ui/metadata'

/**
 * Register the neuron_validate_schema tool on the MCP server.
 *
 * Uses the real validator from @neuron-ui/metadata to check:
 * - Format (version, page metadata, tree structure)
 * - Component existence in manifest
 * - Component nesting/composition rules
 * - Data binding references
 * - Token value compliance
 */
export function registerValidateSchemaTool(server: McpServer): void {
  server.tool(
    'neuron_validate_schema',
    'Validate a neuron-ui Page Schema for correctness: format compliance, component nesting constraints, data binding completeness, and token usage compliance. Returns errors, warnings, and a summary.',
    {
      schema: z.record(z.unknown()).describe('Page Schema JSON object to validate'),
    },
    async ({ schema }) => {
      try {
        const pageSchema = schema as unknown as PageSchema

        const validation = validatePageSchema(
          pageSchema,
          componentManifest,
          compositionRules,
        )

        // Count nodes in tree for summary
        const nodeCount = countNodes(pageSchema.tree ?? [])

        const result = {
          valid: validation.valid,
          errors: validation.errors,
          warnings: validation.warnings,
          summary: {
            totalNodes: nodeCount,
            errors: validation.errors.length,
            warnings: validation.warnings.length,
            errorsByRule: groupByRule(validation.errors),
            warningsByRule: groupByRule(validation.warnings),
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
                { error: 'Failed to validate schema', detail: message },
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

function groupByRule(
  items: Array<{ rule: string }>,
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of items) {
    result[item.rule] = (result[item.rule] ?? 0) + 1
  }
  return result
}
