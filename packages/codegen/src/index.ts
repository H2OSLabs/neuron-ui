// @neuron-ui/codegen — CLI code generator (Page Schema → .tsx source files)

// Programmatic API
export { generateFromSchema } from './commands/generate'
export { generateFromProjectSchema } from './commands/project'

// Generators (for advanced usage / custom pipelines)
export { generatePageComponent } from './generators/page-generator'
export { generateHooksFile } from './generators/hooks-generator'
export { generateTypesFile } from './generators/types-generator'
export { generateRouterFile } from './generators/router-generator'
export { generateLayoutFile } from './generators/layout-generator'
export { generateAppFile } from './generators/app-generator'

// Utilities
export { parseSchemaFile } from './utils/schema-parser'
export { parseProjectSchemaFile } from './utils/project-schema-parser'
export { formatCode } from './utils/code-formatter'

// Types
export type {
  GenerateOptions,
  GenerateResult,
  GeneratedFile,
  HooksStyle,
  ApiClientStyle,
  UpdateStrategy,
  ProjectGenerateOptions,
  ProjectGenerateResult,
} from './types'
