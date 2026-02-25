import { compositionRules } from '@neuron-ui/metadata'
import type { CompositionRules } from '@neuron-ui/metadata'

/**
 * Load composition rules for prompt injection.
 */
export function loadRulesForPrompt(): string {
  return JSON.stringify(compositionRules, null, 2)
}

/**
 * Load the full composition rules
 */
export function loadRules(): CompositionRules {
  return compositionRules
}
