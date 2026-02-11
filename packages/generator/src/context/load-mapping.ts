import { componentApiMapping } from '@neuron-ui/metadata'
import type { ComponentApiMapping } from '@neuron-ui/metadata'

/**
 * Load the component-API mapping for prompt injection.
 */
export function loadMappingForPrompt(): string {
  return JSON.stringify({
    fieldTypeMapping: componentApiMapping.fieldTypeMapping,
    decisionTree: componentApiMapping.decisionTree,
    apiPatternMapping: componentApiMapping.apiPatternMapping,
    compositePatterns: componentApiMapping.compositePatterns,
  }, null, 2)
}

/**
 * Load the full API mapping
 */
export function loadMapping(): ComponentApiMapping {
  return componentApiMapping
}
