// ============================================================
// @neuron-ui/mcp-server — Type Definitions
// ============================================================

import type {
  ComponentManifest,
  ComponentApiMapping,
  CompositionRules,
} from '@neuron-ui/metadata'

// ---- Token Data Types ----

export interface TokenData {
  colors: {
    gray: Record<string, string>
    accent: Record<string, string>
    semantic: Record<string, string>
  }
  spacing: Record<string, string>
  radius: Record<string, string>
  typography: {
    fontFamily: Record<string, string>
    fontSize: Record<string, {
      value: string
      weight: number
      lineHeight: number
    }>
  }
}

// ---- Tool Response Helpers ----

export interface ToolTextContent {
  type: 'text'
  text: string
}

export interface ToolResponse {
  content: ToolTextContent[]
}

// ---- Metadata Loader Interface ----

export interface MetadataStore {
  manifest: ComponentManifest
  apiMapping: ComponentApiMapping
  compositionRules: CompositionRules
}

// ---- Example Schema Entry ----

export interface ExampleEntry {
  name: string
  description: string
  schema: unknown
}
