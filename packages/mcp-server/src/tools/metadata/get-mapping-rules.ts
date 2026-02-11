// ============================================================
// Tool: neuron_get_mapping_rules
// Gets field-to-component mapping rules for AI page generation
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getApiMapping } from '../../loaders/index.js'

export function registerGetMappingRules(server: McpServer) {
  server.tool(
    'neuron_get_mapping_rules',
    'Get field-type-to-component mapping rules used by the AI generator. Filter by context (display for GET responses, input for POST/PUT forms), by specific fieldType, or get api-pattern/composite-pattern rules.',
    {
      context: z
        .enum(['display', 'input', 'api-pattern', 'all'])
        .optional()
        .describe('Mapping context: "display" for GET response rendering, "input" for POST/PUT form fields, "api-pattern" for API endpoint patterns, "all" for everything'),
      fieldType: z
        .string()
        .optional()
        .describe('Specific field type to look up (e.g. "string", "string:enum", "array:object", "boolean")'),
    },
    async ({ context, fieldType }) => {
      const mapping = getApiMapping()
      const effectiveContext = context ?? 'all'

      const result: Record<string, unknown> = {
        version: mapping.version,
      }

      // Field type mapping
      if (effectiveContext === 'all' || effectiveContext === 'display' || effectiveContext === 'input') {
        const fieldTypeMapping: Record<string, unknown> = {}

        if (effectiveContext === 'all' || effectiveContext === 'display') {
          if (fieldType) {
            // Lookup a specific field type in display context
            const rule = mapping.fieldTypeMapping.display[fieldType]
            if (rule) {
              fieldTypeMapping.display = { [fieldType]: rule }
            }
          } else {
            fieldTypeMapping.display = mapping.fieldTypeMapping.display
          }
        }

        if (effectiveContext === 'all' || effectiveContext === 'input') {
          if (fieldType) {
            // Lookup a specific field type in input context
            const rule = mapping.fieldTypeMapping.input[fieldType]
            if (rule) {
              fieldTypeMapping.input = { [fieldType]: rule }
            }
          } else {
            fieldTypeMapping.input = mapping.fieldTypeMapping.input
          }
        }

        if (Object.keys(fieldTypeMapping).length > 0) {
          result.fieldTypeMapping = fieldTypeMapping
        }
      }

      // Decision tree
      if (effectiveContext === 'all' || effectiveContext === 'display' || effectiveContext === 'input') {
        const decisionTree: Record<string, unknown> = {
          description: mapping.decisionTree.description,
        }

        if (effectiveContext === 'all' || effectiveContext === 'display') {
          decisionTree.display = mapping.decisionTree.display
        }
        if (effectiveContext === 'all' || effectiveContext === 'input') {
          decisionTree.input = mapping.decisionTree.input
        }

        result.decisionTree = decisionTree
      }

      // API pattern mapping
      if (effectiveContext === 'all' || effectiveContext === 'api-pattern') {
        result.apiPatternMapping = mapping.apiPatternMapping
        result.compositePatterns = mapping.compositePatterns
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      }
    },
  )
}
