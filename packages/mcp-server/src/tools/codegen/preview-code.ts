// ============================================================
// Tool: neuron_preview_code — Preview generated code without full generation
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { generatePageComponent } from '@neuron-ui/codegen'
import type { PageSchema } from '@neuron-ui/metadata'
import type { HooksStyle } from '@neuron-ui/codegen'

/**
 * Register the neuron_preview_code tool on the MCP server.
 *
 * This is a lightweight version of generate-code that only generates
 * the page component file for quick preview purposes.
 */
export function registerPreviewCodeTool(server: McpServer): void {
  server.tool(
    'neuron_preview_code',
    'Preview the generated React page component (.tsx) from a Page Schema without generating hooks or types. Useful for quick review before running full code generation.',
    {
      schema: z.record(z.unknown()).describe('Page Schema JSON object'),
      style: z
        .enum(['hooks', 'swr', 'react-query'])
        .default('hooks')
        .describe('Data-fetching style for import generation'),
    },
    async ({ schema, style }) => {
      try {
        const pageSchema = schema as unknown as PageSchema

        if (!pageSchema.page?.name) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  { error: 'Invalid schema', detail: 'Schema must have a page.name field' },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          }
        }

        const hooksStyle = style as HooksStyle
        const pageCode = generatePageComponent(pageSchema, hooksStyle)

        const pageName = pageSchema.page.name
          .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s]/g, '')
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join('') || 'Page'

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  fileName: `${pageName}.tsx`,
                  pageName: pageSchema.page.name,
                  style,
                  lineCount: pageCode.split('\n').length,
                  code: pageCode,
                },
                null,
                2,
              ),
            },
          ],
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { error: 'Failed to preview code', detail: message },
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
