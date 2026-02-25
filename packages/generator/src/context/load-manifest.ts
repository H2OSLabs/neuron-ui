import { componentManifest } from '@neuron-ui/metadata'
import type { ComponentManifest, ComponentManifestEntry } from '@neuron-ui/metadata'

/**
 * Load a compact version of the component manifest for prompt injection.
 * Strips unnecessary fields to reduce token usage.
 */
export function loadManifestForPrompt(): string {
  const compact = componentManifest.components.map((c: ComponentManifestEntry) => ({
    name: c.name,
    category: c.category,
    description: c.description,
    variants: c.variants.length > 0 ? c.variants : undefined,
    sizes: c.sizes.length > 0 ? c.sizes : undefined,
    props: c.props,
    canContain: c.canContain.length > 0 ? c.canContain : undefined,
  }))

  return JSON.stringify(compact, null, 2)
}

/**
 * Load the full component manifest
 */
export function loadManifest(): ComponentManifest {
  return componentManifest
}
