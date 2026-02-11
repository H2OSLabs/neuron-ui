// ============================================================
// Prompt: page-generation — System prompt for AI page generation
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { buildSystemPrompt, buildUserPrompt } from '@neuron-ui/generator'
import type { PageType, FormContainer } from '@neuron-ui/generator'

/**
 * Register the page-generation prompt on the MCP server.
 *
 * This prompt assembles a complete system prompt + user prompt
 * for AI-driven Page Schema generation, using the generator's
 * prompt builder with full component knowledge.
 */
export function registerPageGenerationPrompt(server: McpServer): void {
  server.prompt(
    'page-generation',
    'Generate a complete neuron-ui Page Schema from API documentation and task requirements. Returns a system prompt with full component knowledge and a user prompt with the specific task.',
    {
      apiList: z.string().describe('API documentation in any format'),
      taskCase: z.string().describe('Task/requirement description'),
      pageType: z
        .enum(['crud', 'dashboard', 'detail', 'auto'])
        .default('auto')
        .describe('Page type hint'),
      formContainer: z
        .enum(['dialog', 'sheet', 'drawer', 'auto'])
        .default('auto')
        .describe('Preferred form container type'),
    },
    async ({ apiList, taskCase, pageType, formContainer }) => {
      const systemPrompt = buildSystemPrompt({
        pageType: pageType as PageType,
        formContainer: formContainer as FormContainer,
      })
      const userPrompt = buildUserPrompt(apiList, taskCase)

      return {
        messages: [
          { role: 'user' as const, content: { type: 'text' as const, text: `${systemPrompt}\n\n---\n\n${userPrompt}` } },
        ],
      }
    },
  )
}
