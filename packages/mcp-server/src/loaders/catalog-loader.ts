// ============================================================
// Catalog Loader — Loads neuron component catalog from @neuron-ui/runtime
// ============================================================

import { neuronCatalog } from '@neuron-ui/runtime'

/**
 * Get the neuron catalog instance.
 * This provides access to all 53 registered components and 9 actions,
 * each with Zod-validated schemas.
 */
export function getCatalog() {
  return neuronCatalog
}

/**
 * Generate the catalog prompt text (markdown) for AI consumption.
 * This includes all components with their descriptions and prop schemas,
 * plus all dispatchable actions.
 */
export function getCatalogPrompt(): string {
  return neuronCatalog.prompt()
}
