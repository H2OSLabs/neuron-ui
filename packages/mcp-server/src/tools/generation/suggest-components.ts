// ============================================================
// Tool: neuron_suggest_components — Suggest components for a field
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { componentApiMapping } from '@neuron-ui/metadata'
import type { FieldTypeRule } from '@neuron-ui/metadata'

/** A ranked component recommendation */
interface Recommendation {
  component: string
  confidence: number
  reason: string
  defaultProps: Record<string, unknown>
}

/**
 * Register the neuron_suggest_components tool on the MCP server.
 *
 * Uses the component-api-mapping from @neuron-ui/metadata to look up
 * appropriate components for a given field type and context, then
 * returns ranked recommendations.
 */
export function registerSuggestComponentsTool(server: McpServer): void {
  server.tool(
    'neuron_suggest_components',
    'Suggest the most appropriate neuron-ui components for a given field. Provide field name, data type, and context (display or input) to receive ranked recommendations with confidence scores.',
    {
      fieldName: z.string().describe('Field name (used for semantic inference), e.g. "status", "avatar", "tags"'),
      fieldType: z.string().describe('Field data type, e.g. "string", "string:enum", "boolean", "date", "number", "array:object", "number:percentage"'),
      context: z.enum(['display', 'input']).describe('"display" for GET response rendering, "input" for POST/PUT form editing'),
      enumValues: z
        .array(z.string())
        .optional()
        .describe('If the field is an enum type, the list of possible values (affects component selection: <=5 uses NSelect, >5 uses NCombobox)'),
    },
    async ({ fieldName, fieldType, context, enumValues }) => {
      try {
        const recommendations = suggestComponents(
          fieldName,
          fieldType,
          context,
          enumValues,
        )

        // Build a usage example for the top recommendation
        const topRec = recommendations[0]
        const usage = topRec
          ? buildUsageExample(topRec, fieldName, fieldType, context, enumValues)
          : null

        const result = {
          fieldName,
          fieldType,
          context,
          enumValues: enumValues ?? null,
          recommendations,
          usage,
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
                { error: 'Failed to suggest components', detail: message },
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

// ---- Core suggestion logic ----

function suggestComponents(
  fieldName: string,
  fieldType: string,
  context: 'display' | 'input',
  enumValues?: string[],
): Recommendation[] {
  const recommendations: Recommendation[] = []
  const mapping = componentApiMapping.fieldTypeMapping[context]

  if (!mapping) {
    return [
      {
        component: context === 'display' ? 'NText' : 'NInput',
        confidence: 0.5,
        reason: `Default fallback for ${context} context`,
        defaultProps: {},
      },
    ]
  }

  // 1. Direct type match from mapping rules
  const directRule = mapping[fieldType] as FieldTypeRule | undefined
  if (directRule) {
    recommendations.push({
      component: directRule.component,
      confidence: 0.95,
      reason: directRule.description ?? `Direct mapping for ${fieldType} in ${context} context`,
      defaultProps: directRule.props ?? {},
    })

    // Include alternative if available
    if (directRule.alternativeComponent) {
      recommendations.push({
        component: directRule.alternativeComponent,
        confidence: 0.6,
        reason: directRule.alternativeNote ?? `Alternative component for ${fieldType}`,
        defaultProps: {},
      })
    }
  }

  // 2. Partial type match (e.g. "string:enum" should also match "string")
  const baseType = fieldType.split(':')[0]
  if (baseType !== fieldType) {
    const baseRule = mapping[baseType] as FieldTypeRule | undefined
    if (baseRule && !recommendations.some((r) => r.component === baseRule.component)) {
      recommendations.push({
        component: baseRule.component,
        confidence: 0.5,
        reason: `Base type match for ${baseType}`,
        defaultProps: baseRule.props ?? {},
      })
    }
  }

  // 3. Enum-specific logic: NSelect vs NCombobox based on value count
  if (fieldType.includes('enum') && context === 'input') {
    const enumCount = enumValues?.length ?? 0
    if (enumCount > 5) {
      if (!recommendations.some((r) => r.component === 'NCombobox')) {
        recommendations.push({
          component: 'NCombobox',
          confidence: 0.9,
          reason: `Enum with ${enumCount} values (>5) recommends NCombobox for searchable selection`,
          defaultProps: { placeholder: `Search ${fieldName}...` },
        })
      }
      // Lower confidence for NSelect if too many options
      const selectRec = recommendations.find((r) => r.component === 'NSelect')
      if (selectRec) {
        selectRec.confidence = Math.min(selectRec.confidence, 0.4)
        selectRec.reason += ` (but ${enumCount} values may be too many for a dropdown)`
      }
    } else if (enumCount > 0 && enumCount <= 5) {
      if (!recommendations.some((r) => r.component === 'NSelect')) {
        recommendations.push({
          component: 'NSelect',
          confidence: 0.9,
          reason: `Enum with ${enumCount} values (<=5) recommends NSelect`,
          defaultProps: { placeholder: `Select ${fieldName}` },
        })
      }
    }
  }

  // 4. Semantic name-based hints
  const semanticSuggestions = getSemanticSuggestions(fieldName, context)
  for (const sem of semanticSuggestions) {
    if (!recommendations.some((r) => r.component === sem.component)) {
      recommendations.push(sem)
    }
  }

  // 5. Decision tree fallback
  if (recommendations.length === 0) {
    const dtRecs = matchDecisionTree(fieldType, context)
    recommendations.push(...dtRecs)
  }

  // 6. Absolute fallback
  if (recommendations.length === 0) {
    recommendations.push({
      component: context === 'display' ? 'NText' : 'NInput',
      confidence: 0.3,
      reason: `Generic fallback for ${context} context`,
      defaultProps: {},
    })
  }

  // Sort by confidence descending
  recommendations.sort((a, b) => b.confidence - a.confidence)

  return recommendations
}

// ---- Semantic name-based suggestions ----

function getSemanticSuggestions(
  fieldName: string,
  context: 'display' | 'input',
): Recommendation[] {
  const name = fieldName.toLowerCase()
  const suggestions: Recommendation[] = []

  if (context === 'display') {
    if (name.includes('avatar') || name.includes('image') || name.includes('photo') || name.includes('logo')) {
      suggestions.push({
        component: 'NAvatar',
        confidence: 0.85,
        reason: `Field name "${fieldName}" suggests an image/avatar display`,
        defaultProps: {},
      })
    }
    if (name.includes('status') || name.includes('state') || name.includes('type') || name.includes('category') || name.includes('tag')) {
      suggestions.push({
        component: 'NBadge',
        confidence: 0.8,
        reason: `Field name "${fieldName}" suggests a categorical/status display`,
        defaultProps: { variant: 'solid' },
      })
    }
    if (name.includes('progress') || name.includes('rate') || name.includes('percentage') || name.includes('ratio')) {
      suggestions.push({
        component: 'NProgress',
        confidence: 0.8,
        reason: `Field name "${fieldName}" suggests a progress/percentage display`,
        defaultProps: { max: 100 },
      })
    }
    if (name.includes('date') || name.includes('time') || name.includes('created') || name.includes('updated')) {
      suggestions.push({
        component: 'NText',
        confidence: 0.7,
        reason: `Field name "${fieldName}" is a date/time — use NText with date formatting`,
        defaultProps: { size: 'body' },
      })
    }
  }

  if (context === 'input') {
    if (name.includes('password') || name.includes('secret')) {
      suggestions.push({
        component: 'NInput',
        confidence: 0.9,
        reason: `Field name "${fieldName}" suggests a password input`,
        defaultProps: { type: 'password' },
      })
    }
    if (name.includes('email')) {
      suggestions.push({
        component: 'NInput',
        confidence: 0.9,
        reason: `Field name "${fieldName}" suggests an email input`,
        defaultProps: { type: 'email', placeholder: 'user@example.com' },
      })
    }
    if (name.includes('description') || name.includes('content') || name.includes('bio') || name.includes('note') || name.includes('remark')) {
      suggestions.push({
        component: 'NTextarea',
        confidence: 0.85,
        reason: `Field name "${fieldName}" suggests multi-line text input`,
        defaultProps: { rows: 3 },
      })
    }
    if (name.includes('date') || name.includes('time')) {
      suggestions.push({
        component: 'NDatePicker',
        confidence: 0.85,
        reason: `Field name "${fieldName}" suggests a date/time picker`,
        defaultProps: {},
      })
    }
    if (name.includes('active') || name.includes('enabled') || name.includes('visible') || name.includes('published')) {
      suggestions.push({
        component: 'NSwitch',
        confidence: 0.85,
        reason: `Field name "${fieldName}" suggests a boolean toggle`,
        defaultProps: {},
      })
    }
  }

  return suggestions
}

// ---- Decision tree matching ----

function matchDecisionTree(
  fieldType: string,
  context: 'display' | 'input',
): Recommendation[] {
  const dt = componentApiMapping.decisionTree?.[context]
  if (!dt || !Array.isArray(dt)) return []

  const recommendations: Recommendation[] = []
  for (const rule of dt) {
    if (matchCondition(fieldType, rule.condition)) {
      recommendations.push({
        component: rule.component,
        confidence: 0.7,
        reason: rule.note ?? `Decision tree match: ${rule.condition}`,
        defaultProps: {},
      })
    }
  }
  return recommendations
}

function matchCondition(fieldType: string, condition: string): boolean {
  // Simple substring/pattern matching on condition descriptions
  const condLower = condition.toLowerCase()
  const typeLower = fieldType.toLowerCase()

  if (condLower.includes(typeLower)) return true
  if (typeLower.includes(condLower)) return true

  // Check base type
  const baseType = typeLower.split(':')[0]
  if (condLower.includes(baseType)) return true

  return false
}

// ---- Usage example builder ----

function buildUsageExample(
  rec: Recommendation,
  fieldName: string,
  _fieldType: string,
  context: 'display' | 'input',
  enumValues?: string[],
): Record<string, unknown> {
  const example: Record<string, unknown> = {
    component: rec.component,
    propsExample: { ...rec.defaultProps },
  }

  // Add field-specific prop examples
  if (rec.component === 'NBadge' && enumValues && enumValues.length > 0) {
    const colorPool = ['lime', 'yellow', 'blue', 'pink', 'purple', 'green', 'lavender']
    const colorMap: Record<string, string> = {}
    for (let i = 0; i < enumValues.length; i++) {
      colorMap[enumValues[i]] = colorPool[i % colorPool.length]
    }
    example.colorMapSuggestion = colorMap
  }

  if (context === 'display') {
    (example.propsExample as Record<string, unknown>).text = `\${${fieldName}}`
  }

  if (context === 'input') {
    (example.propsExample as Record<string, unknown>).placeholder = `Enter ${fieldName}`
  }

  if (rec.component === 'NSelect' && enumValues) {
    (example.propsExample as Record<string, unknown>).options = enumValues.map((v) => ({
      value: v,
      label: v,
    }))
  }

  return example
}
