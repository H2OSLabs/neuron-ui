// ============================================================
// Prompt: component-selection — Help AI select optimal components
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getCatalogPrompt } from '../loaders/index.js'
import { getApiMapping } from '../loaders/index.js'

/**
 * Register the component-selection prompt on the MCP server.
 *
 * This prompt provides the AI with the full component catalog
 * and mapping rules, helping it select the optimal components
 * for a given set of fields and requirements.
 */
export function registerComponentSelectionPrompt(server: McpServer): void {
  server.prompt(
    'component-selection',
    'Help select the optimal neuron-ui components for a set of fields. Provides the full component catalog, field-to-component mapping rules, and decision tree logic.',
    {
      fields: z.string().describe('Description of the fields that need component assignments (JSON array or text list)'),
      context: z
        .enum(['display', 'input', 'mixed'])
        .default('mixed')
        .describe('"display" for GET responses, "input" for forms, "mixed" for both'),
    },
    async ({ fields, context }) => {
      const catalogPrompt = getCatalogPrompt()
      const mapping = getApiMapping()

      // Build mapping context relevant to the specified context
      const mappingContext: Record<string, unknown> = {}
      if (context === 'display' || context === 'mixed') {
        mappingContext.displayRules = mapping.fieldTypeMapping.display
      }
      if (context === 'input' || context === 'mixed') {
        mappingContext.inputRules = mapping.fieldTypeMapping.input
      }
      mappingContext.decisionTree = mapping.decisionTree

      const prompt = `You are a neuron-ui component selection expert. Your task is to recommend the best components for each field.

## Component Catalog

${catalogPrompt}

## Field-to-Component Mapping Rules

${JSON.stringify(mappingContext, null, 2)}

## Selection Guidelines

1. For \`display\` context (GET responses):
   - \`string:enum\` → NBadge (with color mapping)
   - \`array:object\` → NDataTable
   - \`number:percentage\` → NProgress
   - \`boolean\` → NBadge (true/false variant)
   - Default: NText

2. For \`input\` context (POST/PUT forms):
   - \`string\` → NInput
   - \`enum(≤5)\` → NSelect
   - \`enum(>5)\` → NCombobox
   - \`boolean\` → NSwitch
   - \`date\` → NDatePicker
   - Default: NInput

3. Consider field names for semantic hints (e.g. "avatar" → NAvatar, "description" → NTextarea)

## Fields to Analyze

${fields}

Please provide your component recommendations for each field with confidence levels and reasoning.`

      return {
        messages: [
          { role: 'user' as const, content: { type: 'text' as const, text: prompt } },
        ],
      }
    },
  )
}
