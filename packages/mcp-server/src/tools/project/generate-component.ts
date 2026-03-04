// ============================================================
// Tool: neuron_generate_component
// Generates a project-specific shadcn 二开 React component
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

export function registerGenerateComponent(server: McpServer, projectRoot?: string) {
  const root = projectRoot ?? process.cwd()

  server.tool(
    'neuron_generate_component',
    '基于用户描述，生成项目专属的 shadcn 二次开发 React 组件 .tsx 文件。需要 ANTHROPIC_API_KEY 环境变量。',
    {
      componentName: z
        .string()
        .describe('组件名，PascalCase，如 UserTable'),
      description: z.string().describe('组件的功能描述'),
      propsDefinition: z
        .record(z.string())
        .describe('props 名称 → 类型描述，如 { "columns": "string[]", "hoverable": "boolean" }'),
      styleContext: z
        .object({
          primaryColor: z.string().optional(),
          backgroundColor: z.string().optional(),
          borderRadius: z.string().optional(),
          cssVariables: z.record(z.string()).optional(),
        })
        .optional()
        .describe('视觉风格上下文'),
      outputPath: z
        .string()
        .optional()
        .describe('输出路径，默认 src/components/{componentName}.tsx'),
    },
    async ({ componentName, description, propsDefinition, styleContext, outputPath }) => {
      try {
        // Dynamic import to avoid hard dependency
        const { buildComponentGenerationPrompt } = await import(
          '@neuron-ui/generator'
        )

        const prompt = buildComponentGenerationPrompt({
          componentName,
          description,
          propsDefinition,
          styleContext: styleContext ?? {},
        })

        // Use Anthropic SDK
        const Anthropic = (await import('@anthropic-ai/sdk')).default
        const client = new Anthropic()

        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        })

        const rawCode =
          response.content[0].type === 'text' ? response.content[0].text : ''

        // Extract code from markdown code blocks if present
        let code = rawCode
        const codeBlockMatch = rawCode.match(
          /```(?:tsx?|typescript)?\n([\s\S]*?)```/,
        )
        if (codeBlockMatch) {
          code = codeBlockMatch[1]
        }

        const finalPath =
          outputPath ?? `src/components/${componentName}.tsx`
        const fullPath = join(root, finalPath)

        mkdirSync(dirname(fullPath), { recursive: true })
        writeFileSync(fullPath, code.trim(), 'utf-8')

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                componentName,
                outputPath: finalPath,
                message: `组件 ${componentName} 已生成到 ${finalPath}`,
                codeLength: code.length,
              }),
            },
          ],
        }
      } catch (err) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: String(err),
                hint: '确保设置了 ANTHROPIC_API_KEY 环境变量',
              }),
            },
          ],
        }
      }
    },
  )
}
