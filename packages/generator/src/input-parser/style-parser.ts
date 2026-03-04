// ============================================================
// Style Input Parser — Extracts design tokens from style descriptions
// Uses AI to understand color palettes, typography, spacing from any format
// ============================================================

import type { AIProvider, Message } from '../types'

export interface ParsedStyleInput {
  colors: Record<string, string>
  fontFamily?: string
  borderRadius?: string
  spacing?: Record<string, string>
  cssVariables?: Record<string, string>
  rawInput: string
}

/**
 * Parse style/design token descriptions into structured tokens.
 * Understands Figma exports, CSS variables, text descriptions, etc.
 */
export async function parseStyleInput(
  input: string,
  aiProvider: AIProvider,
): Promise<ParsedStyleInput> {
  const messages: Message[] = [
    {
      role: 'user',
      content: `Extract design tokens from the following style description.

Input:
${input}

Return ONLY a JSON object with shape:
{
  "colors": { "primary": "#hex", "background": "#hex", "text": "#hex", ... },
  "fontFamily": "font name or null",
  "borderRadius": "value or null",
  "spacing": { "sm": "value", "md": "value", "lg": "value" } or null,
  "cssVariables": { "--var-name": "value", ... } or null
}

Extract whatever you can find. Use null for missing values.`,
    },
  ]

  try {
    const response = await aiProvider.generate(messages)

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { colors: {}, rawInput: input }
    }
    const parsed = JSON.parse(jsonMatch[0])
    return {
      colors: parsed.colors ?? {},
      fontFamily: parsed.fontFamily ?? undefined,
      borderRadius: parsed.borderRadius ?? undefined,
      spacing: parsed.spacing ?? undefined,
      cssVariables: parsed.cssVariables ?? undefined,
      rawInput: input,
    }
  } catch {
    return { colors: {}, rawInput: input }
  }
}
