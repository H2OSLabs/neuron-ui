import {
  validatePageSchema,
  componentManifest,
  compositionRules,
} from '@neuron-ui/metadata'
import type { PageSchema, ValidationError } from '@neuron-ui/metadata'
import { buildSystemPrompt, buildUserPrompt, buildRetryPrompt, buildPreviewPrompt } from './prompts/system-prompt'
import { autoFix } from './auto-fix'
import { fallbackGenerate } from './fallback'
import type {
  GeneratePageOptions,
  GeneratePageResult,
  GenerationPreview,
  DetectedApi,
  PageType,
  Message,
} from './types'

/**
 * Extract JSON from AI response text.
 * Handles markdown code blocks, leading/trailing text, etc.
 */
function extractJson(text: string): string {
  // Try to extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Try to find the first { and last }
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1)
  }

  return text.trim()
}

/**
 * Parse JSON safely, returning null on failure.
 */
function parseJson(text: string): PageSchema | null {
  try {
    return JSON.parse(text) as PageSchema
  } catch {
    return null
  }
}

/**
 * Generate a Page Schema from API list and task description.
 * Includes validation, auto-fix, and retry with feedback.
 */
export async function generatePage(options: GeneratePageOptions): Promise<GeneratePageResult> {
  const {
    apiList,
    taskCase,
    preferences,
    provider,
    maxRetries = 2,
  } = options

  const pageType = preferences?.pageType ?? 'auto'

  // Build system prompt
  const systemPrompt = buildSystemPrompt({
    pageType,
    formContainer: preferences?.formContainer,
  })

  // Build user prompt
  const userPrompt = buildUserPrompt(apiList, taskCase)

  let lastErrors: ValidationError[] = []
  let lastOutput = ''

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Build messages
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (attempt === 0) {
      messages.push({ role: 'user', content: userPrompt })
    } else {
      // Retry with error feedback
      messages.push({ role: 'user', content: userPrompt })
      messages.push({ role: 'assistant', content: lastOutput })
      messages.push({
        role: 'user',
        content: buildRetryPrompt(lastOutput, lastErrors),
      })
    }

    // Call AI provider
    const response = await provider.generate(messages)
    lastOutput = response

    // Extract and parse JSON
    const jsonStr = extractJson(response)
    const schema = parseJson(jsonStr)

    if (!schema) {
      lastErrors = [{
        path: '',
        message: 'Failed to parse JSON from AI response',
        severity: 'error',
        rule: 'format',
      }]
      continue
    }

    // Validate
    const validation = validatePageSchema(schema, componentManifest, compositionRules)

    if (validation.valid) {
      return {
        pageSchema: schema,
        metadata: {
          generatedBy: 'ai',
          apiResource: apiList.slice(0, 200),
          taskCase,
          retries: attempt,
        },
      }
    }

    // Try auto-fix
    const { schema: fixed, fixesApplied } = autoFix(schema, validation.errors)
    if (fixesApplied.length > 0) {
      const revalidation = validatePageSchema(fixed, componentManifest, compositionRules)
      if (revalidation.valid) {
        return {
          pageSchema: fixed,
          metadata: {
            generatedBy: 'ai',
            apiResource: apiList.slice(0, 200),
            taskCase,
            retries: attempt,
          },
        }
      }
      lastErrors = revalidation.errors
    } else {
      lastErrors = validation.errors
    }
  }

  // All retries failed → fallback
  return fallbackGenerate(apiList, taskCase, pageType, maxRetries, lastErrors)
}

/**
 * Human-in-the-loop mode: Preview AI's understanding before full generation.
 */
export async function previewGeneration(options: GeneratePageOptions): Promise<GenerationPreview> {
  const { apiList, taskCase, provider } = options

  const systemPrompt = buildSystemPrompt({ pageType: 'auto' })
  const previewPrompt = buildPreviewPrompt(apiList, taskCase)

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: previewPrompt },
  ]

  const response = await provider.generate(messages)
  const jsonStr = extractJson(response)

  let preview: {
    detectedApis?: DetectedApi[]
    suggestedPageType?: PageType
    suggestedComponents?: string[]
    suggestedLayout?: string
  } = {}

  try {
    preview = JSON.parse(jsonStr)
  } catch {
    // If parsing fails, provide defaults
    preview = {
      detectedApis: [],
      suggestedPageType: 'auto',
      suggestedComponents: [],
      suggestedLayout: 'Unable to parse AI preview response',
    }
  }

  let aborted = false

  return {
    detectedApis: preview.detectedApis ?? [],
    suggestedPageType: preview.suggestedPageType ?? 'auto',
    suggestedComponents: preview.suggestedComponents ?? [],
    suggestedLayout: preview.suggestedLayout ?? '',
    confirm: async () => {
      if (aborted) throw new Error('Generation was aborted')
      return generatePage(options)
    },
    abort: () => {
      aborted = true
    },
  }
}
