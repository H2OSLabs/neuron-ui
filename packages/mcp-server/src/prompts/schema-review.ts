// ============================================================
// Prompt: schema-review — Review and improve a Page Schema
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getCompositionRules } from '../loaders/index.js'
import { getTokenData } from '../loaders/index.js'
import { getCatalogPrompt } from '../loaders/index.js'

/**
 * Register the schema-review prompt on the MCP server.
 *
 * This prompt helps AI review an existing Page Schema for
 * correctness, best practices, and potential improvements.
 */
export function registerSchemaReviewPrompt(server: McpServer): void {
  server.prompt(
    'schema-review',
    'Review a neuron-ui Page Schema for correctness, best practices, and improvements. Provides composition rules, token values, and component knowledge for thorough review.',
    {
      schema: z.string().describe('Page Schema JSON string to review'),
    },
    async ({ schema }) => {
      const rules = getCompositionRules()
      const tokens = getTokenData()
      const catalogPrompt = getCatalogPrompt()

      const prompt = `You are a neuron-ui Page Schema reviewer. Analyze the following schema for issues and improvements.

## Component Catalog

${catalogPrompt}

## Composition Rules

${JSON.stringify(rules, null, 2)}

## Available Tokens

**Colors:**
- Gray scale: ${Object.keys(tokens.colors.gray).join(', ')}
- Accent: ${Object.keys(tokens.colors.accent).join(', ')}
- Semantic: ${Object.keys(tokens.colors.semantic).join(', ')}

**Spacing:** ${Object.keys(tokens.spacing).join(', ')}
**Radius:** ${Object.keys(tokens.radius).join(', ')}
**Font sizes:** ${Object.keys(tokens.typography.fontSize).join(', ')}

## Review Checklist

1. **Format compliance**: version, page metadata, tree structure
2. **Component nesting**: parent-child relationships follow composition rules
3. **Max nesting depth**: ${rules.globalConstraints.maxNestingDepth} levels max
4. **Root containers**: tree roots must be ${rules.globalConstraints.rootContainers.join(' or ')}
5. **Token compliance**: props use token keys (e.g. "blue", "lg"), not raw CSS values
6. **Data binding**: dataSources referenced in bindings exist, fields are correct
7. **Unique IDs**: all node IDs are unique
8. **Required props**: components have their required props set
9. **Accessibility**: labels, aria attributes, semantic structure

## Schema to Review

\`\`\`json
${schema}
\`\`\`

Please provide:
- List of errors (must fix)
- List of warnings (should fix)
- Suggestions for improvement
- An overall quality score (1-10)`

      return {
        messages: [
          { role: 'user' as const, content: { type: 'text' as const, text: prompt } },
        ],
      }
    },
  )
}
