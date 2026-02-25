// ============================================================
// Metadata Loader — Loads component manifest, API mapping, and composition rules
// ============================================================

import {
  componentManifest,
  componentApiMapping,
  compositionRules,
} from '@neuron-ui/metadata'

import type { MetadataStore } from '../types.js'

let _store: MetadataStore | null = null

/**
 * Load and cache metadata from @neuron-ui/metadata.
 * The metadata is imported as typed re-exports from the metadata package.
 */
export function getMetadata(): MetadataStore {
  if (!_store) {
    _store = {
      manifest: componentManifest,
      apiMapping: componentApiMapping,
      compositionRules: compositionRules,
    }
  }
  return _store
}

/**
 * Get the component manifest.
 */
export function getManifest() {
  return getMetadata().manifest
}

/**
 * Get the component-API mapping rules.
 */
export function getApiMapping() {
  return getMetadata().apiMapping
}

/**
 * Get the composition rules.
 */
export function getCompositionRules() {
  return getMetadata().compositionRules
}
