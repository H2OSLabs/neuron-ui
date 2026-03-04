// ============================================================
// Component Generator — Generates project-specific .tsx components
// Uses AI to create shadcn/ui 二次开发 components
// ============================================================

import type { AIProvider, Message } from '../types'
import { buildComponentGenerationPrompt } from './prompts'
import type { ComponentGenerationParams } from './prompts'

export { buildComponentGenerationPrompt }
export type { ComponentGenerationParams }

export interface GenerateComponentResult {
  code: string
  componentName: string
  success: boolean
  error?: string
}

/**
 * Generate a project-specific React component based on shadcn/ui.
 * Returns the raw .tsx source code.
 */
export async function generateComponent(
  params: ComponentGenerationParams,
  aiProvider: AIProvider,
): Promise<GenerateComponentResult> {
  const prompt = buildComponentGenerationPrompt(params)

  const messages: Message[] = [
    { role: 'user', content: prompt },
  ]

  try {
    const response = await aiProvider.generate(messages)

    // Extract code from response (may be wrapped in markdown code blocks)
    let code = response
    const codeBlockMatch = response.match(/```(?:tsx?|typescript)?\n([\s\S]*?)```/)
    if (codeBlockMatch) {
      code = codeBlockMatch[1]
    }

    return {
      code: code.trim(),
      componentName: params.componentName,
      success: true,
    }
  } catch (err) {
    return {
      code: '',
      componentName: params.componentName,
      success: false,
      error: String(err),
    }
  }
}
