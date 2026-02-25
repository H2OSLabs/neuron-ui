import type { PageSchema, ValidationError } from '@neuron-ui/metadata'

// ---- AI Provider ----

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIProvider {
  /** Send messages to the AI and get a text response */
  generate(messages: Message[]): Promise<string>
}

// ---- Generation Options ----

export type PageType = 'crud' | 'dashboard' | 'detail' | 'auto'
export type FormContainer = 'dialog' | 'sheet' | 'drawer' | 'auto'

export interface GeneratePageOptions {
  /** API documentation in any format (Swagger, Postman, text, cURL, etc.) */
  apiList: string
  /** Task/requirement description in any format */
  taskCase: string
  /** Generation preferences */
  preferences?: {
    /** Page type hint (default: 'auto') */
    pageType?: PageType
    /** Form container preference (default: 'auto') */
    formContainer?: FormContainer
  }
  /** AI provider to use (required) */
  provider: AIProvider
  /** Maximum retry attempts (default: 2) */
  maxRetries?: number
}

// ---- Generation Result ----

export interface GeneratePageResult {
  /** Validated Page Schema */
  pageSchema: PageSchema
  /** Generation metadata */
  metadata: GenerationMetadata
}

export interface GenerationMetadata {
  /** How the page was generated */
  generatedBy: 'ai'
  /** Original API input (truncated) */
  apiResource: string
  /** Original task case */
  taskCase: string
  /** Number of retries performed */
  retries: number
  /** Whether the result is a degraded fallback */
  degraded?: boolean
  /** Reason for degradation */
  degradeReason?: ValidationError[]
  /** Suggested user actions */
  suggestedActions?: string[]
}

// ---- Human-in-the-loop Preview ----

export interface DetectedApi {
  method: string
  path: string
  description: string
}

export interface GenerationPreview {
  /** APIs detected from the input */
  detectedApis: DetectedApi[]
  /** Suggested page type */
  suggestedPageType: PageType
  /** Suggested component list */
  suggestedComponents: string[]
  /** Layout description */
  suggestedLayout: string
  /** Confirm and proceed with generation */
  confirm: () => Promise<GeneratePageResult>
  /** Abort generation */
  abort: () => void
}

// ---- Auto-fix ----

export interface AutoFixResult {
  /** Fixed Page Schema */
  schema: PageSchema
  /** Fixes applied */
  fixesApplied: string[]
}
