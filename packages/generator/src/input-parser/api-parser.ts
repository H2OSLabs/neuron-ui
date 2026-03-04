// ============================================================
// API Input Parser — Extracts structured endpoints from arbitrary text
// Uses Claude API for intelligent parsing of any format
// ============================================================

import type { AIProvider, Message } from '../types'

export interface ParsedEndpoint {
  method: string
  path: string
  description: string
  requestBody?: Record<string, unknown>
  responseShape?: Record<string, unknown>
}

export interface ParsedApiInput {
  endpoints: ParsedEndpoint[]
  rawInput: string
}

/**
 * Parse arbitrary-format API documentation into structured endpoints.
 * Uses AI to understand any format: OpenAPI, Postman, cURL, text descriptions.
 */
export async function parseApiInput(
  input: string,
  aiProvider: AIProvider,
): Promise<ParsedApiInput> {
  const messages: Message[] = [
    {
      role: 'user',
      content: `Parse the following API documentation and extract all endpoints as structured JSON.

Input:
${input}

Return ONLY a JSON array of endpoints with shape:
[{ "method": "GET|POST|PUT|DELETE", "path": "/path", "description": "...", "responseShape": {...}, "requestBody": {...} }]

If you cannot identify valid endpoints, return an empty array [].`,
    },
  ]

  try {
    const response = await aiProvider.generate(messages)

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    const endpoints: ParsedEndpoint[] = jsonMatch ? JSON.parse(jsonMatch[0]) : []
    return { endpoints, rawInput: input }
  } catch {
    return { endpoints: [], rawInput: input }
  }
}
