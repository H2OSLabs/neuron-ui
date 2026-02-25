// @neuron-ui/generator - AI-driven page generation engine

// ---- Core API ----
export { generatePage, previewGeneration } from './generate'

// ---- Auto-fix ----
export { autoFix } from './auto-fix'

// ---- Fallback ----
export { fallbackGenerate } from './fallback'

// ---- Prompt System ----
export { buildSystemPrompt, buildUserPrompt, buildRetryPrompt, buildPreviewPrompt } from './prompts/system-prompt'
export { selectExamples } from './prompts/example-selector'

// ---- Context Loaders ----
export {
  loadManifestForPrompt,
  loadManifest,
  loadMappingForPrompt,
  loadMapping,
  loadRulesForPrompt,
  loadRules,
  loadTokensForPrompt,
} from './context'

// ---- Types ----
export type {
  AIProvider,
  Message,
  PageType,
  FormContainer,
  GeneratePageOptions,
  GeneratePageResult,
  GenerationMetadata,
  GenerationPreview,
  DetectedApi,
  AutoFixResult,
} from './types'
