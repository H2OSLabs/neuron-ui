// ============================================================
// @neuron-ui/codegen — Type Definitions
// ============================================================

/** API client library style for generated data-fetching code */
export type ApiClientStyle = 'fetch' | 'axios' | 'ky'

/** Hooks style for generated data-fetching hooks */
export type HooksStyle = 'hooks' | 'swr' | 'react-query'

/** Strategy for updating existing generated files */
export type UpdateStrategy = 'merge' | 'overwrite' | 'diff'

/** Options for the `generate` command */
export interface GenerateOptions {
  /** Path to the Page Schema JSON file */
  schemaPath: string
  /** Output directory for generated files */
  outDir: string
  /** Hooks style: plain hooks, SWR, or React Query */
  style: HooksStyle
  /** API client library: fetch, axios, or ky */
  apiClient: ApiClientStyle
  /** If true, print generated files to stdout without writing */
  dryRun?: boolean
}

/** Result of the code generation process */
export interface GenerateResult {
  /** List of generated files */
  files: GeneratedFile[]
  /** Whether this was a dry run */
  dryRun: boolean
}

/** A single generated file */
export interface GeneratedFile {
  /** Output file path (relative to outDir) */
  path: string
  /** File content (formatted source code) */
  content: string
  /** File type category */
  type: 'page' | 'hooks' | 'types' | 'component'
}
