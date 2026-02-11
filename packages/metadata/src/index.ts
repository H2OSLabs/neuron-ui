// @neuron-ui/metadata - Component manifest, API mapping rules, composition rules

// ---- Types ----
export type {
  // Token types
  GrayScale,
  AccentColor,
  SemanticColor,
  SpacingToken,
  RadiusToken,
  FontSizeToken,
  // Component Manifest types
  ComponentCategory,
  ApiMethod,
  ApiRole,
  ComponentManifestEntry,
  ComponentManifest,
  // API Mapping types
  FieldTypeRule,
  ApiPatternRule,
  CompositePatternLayout,
  CompositePattern,
  ComponentApiMapping,
  // Composition Rules types
  CompositionRule,
  GlobalConstraints,
  CompositionRules,
  // Page Schema types
  PageSchemaDataSource,
  PageSchemaBinding,
  PageSchemaTreeNode,
  PageSchemaPage,
  PageSchema,
  // Validation types
  ValidationError,
  ValidationResult,
} from './types'

// ---- Validators ----
export {
  validateManifest,
  getComponent,
  getComponentsByCategory,
  canBeChildOf,
} from './validator'

export {
  validatePageSchema,
} from './page-schema-validator'

// ---- JSON Data (importable as modules) ----
// These are re-exported for convenience. Consumers can also import the JSON files directly.
import manifestJson from '../component-manifest.json'
import apiMappingJson from '../component-api-mapping.json'
import compositionRulesJson from '../composition-rules.json'

import type { ComponentManifest, ComponentApiMapping, CompositionRules } from './types'

export const componentManifest = manifestJson as unknown as ComponentManifest
export const componentApiMapping = apiMappingJson as unknown as ComponentApiMapping
export const compositionRules = compositionRulesJson as unknown as CompositionRules
