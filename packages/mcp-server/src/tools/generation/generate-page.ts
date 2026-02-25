// ============================================================
// Tool: neuron_generate_page — Generate Page Schema from API + TaskCase
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { fallbackGenerate, buildSystemPrompt, buildUserPrompt } from '@neuron-ui/generator'
import type { PageType, FormContainer } from '@neuron-ui/generator'

/**
 * Register the neuron_generate_page tool on the MCP server.
 *
 * Since actual AI generation requires an AIProvider to be configured,
 * this tool operates in two modes:
 *
 * 1. If an AIProvider is available in the future (via server config),
 *    it calls generatePage() with full AI capabilities.
 * 2. Currently, it generates a fallback skeleton Page Schema and
 *    provides the assembled system prompt + user prompt so the
 *    MCP client AI can generate the schema itself.
 */
export function registerGeneratePageTool(server: McpServer): void {
  server.tool(
    'neuron_generate_page',
    'Generate a neuron-ui Page Schema JSON from an API list and task description. Auto-selects components, configures data bindings, and follows token/nesting constraints. If no AI provider is configured, returns a skeleton schema plus the assembled prompt for the client AI to complete.',
    {
      apiList: z.string().describe('API documentation in any format (Swagger, Postman, text, cURL, etc.)'),
      taskCase: z.string().describe('Task/requirement description in any format'),
      preferences: z
        .object({
          pageType: z
            .enum(['crud', 'dashboard', 'detail', 'auto'])
            .default('auto')
            .describe('Page type hint'),
          formContainer: z
            .enum(['dialog', 'sheet', 'drawer', 'auto'])
            .default('auto')
            .describe('Form container preference'),
        })
        .optional()
        .describe('Generation preferences'),
    },
    async ({ apiList, taskCase, preferences }) => {
      try {
        const pageType: PageType = (preferences?.pageType as PageType) ?? 'auto'
        const formContainer: FormContainer = (preferences?.formContainer as FormContainer) ?? 'auto'

        // Build the system prompt and user prompt for reference
        const systemPrompt = buildSystemPrompt({ pageType, formContainer })
        const userPrompt = buildUserPrompt(apiList, taskCase)

        // Generate a fallback skeleton schema
        const fallbackResult = fallbackGenerate(
          apiList,
          taskCase,
          pageType,
          0,
          [],
        )

        const result = {
          mode: 'fallback-with-prompt' as const,
          message:
            'AI provider not configured on the MCP server. ' +
            'A skeleton Page Schema has been generated as a starting point. ' +
            'The assembled system prompt and user prompt are included below — ' +
            'you can use them to generate a complete Page Schema with your own AI capabilities.',
          skeleton: fallbackResult.pageSchema,
          metadata: fallbackResult.metadata,
          prompts: {
            systemPrompt,
            userPrompt,
          },
          instructions: [
            'Use the systemPrompt as your system context',
            'Use the userPrompt as the user message',
            'Generate a valid Page Schema JSON following the format in the system prompt',
            'Then call neuron_validate_schema to validate the generated schema',
          ],
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { error: 'Failed to generate page', detail: message },
                null,
                2,
              ),
            },
          ],
          isError: true,
        }
      }
    },
  )
}
