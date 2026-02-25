// @neuron-ui/codegen — CLI code generator (Page Schema → .tsx source files)

// Programmatic API
export { generateFromSchema } from './commands/generate'

// Generators (for advanced usage / custom pipelines)
export { generatePageComponent } from './generators/page-generator'
export { generateHooksFile } from './generators/hooks-generator'
export { generateTypesFile } from './generators/types-generator'

// Utilities
export { parseSchemaFile } from './utils/schema-parser'
export { formatCode } from './utils/code-formatter'

// Types
export type {
  GenerateOptions,
  GenerateResult,
  GeneratedFile,
  HooksStyle,
  ApiClientStyle,
  UpdateStrategy,
} from './types'
