// ============================================================
// Tool: neuron_get_component_context
// Gets a component's full context: source code, props, usage in pages
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

export function registerGetComponentContext(server: McpServer, projectRoot?: string) {
  const root = projectRoot ?? process.cwd()

  server.tool(
    'neuron_get_component_context',
    '获取一个组件的完整上下文：源码、props 定义、当前在哪些页面被使用。',
    {
      componentName: z.string().describe('组件名，如 UserTable 或 PageHeader'),
    },
    async ({ componentName }) => {
      // Find source file
      const patterns = [
        `src/components/${componentName}.tsx`,
        `src/components/${componentName}/${componentName}.tsx`,
        `src/components/${componentName}/index.tsx`,
      ]

      let sourceCode: string | null = null
      let sourceFile: string | null = null
      for (const pattern of patterns) {
        const fullPath = join(root, pattern)
        if (existsSync(fullPath)) {
          sourceCode = readFileSync(fullPath, 'utf-8')
          sourceFile = pattern
          break
        }
      }

      // Find pages that use this component
      const usedInPages: string[] = []
      const pagesDir = join(root, 'src', 'pages')
      const neuronPagesDir = join(root, '.neuron', 'pages')

      for (const dir of [pagesDir, neuronPagesDir]) {
        if (!existsSync(dir)) continue
        try {
          const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
          for (const file of files) {
            const content = readFileSync(join(dir, file), 'utf-8')
            if (content.includes(`"${componentName}"`)) {
              usedInPages.push(file.replace('.json', ''))
            }
          }
        } catch {
          // Directory may not be readable
        }
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                componentName,
                sourceFile,
                sourceCode,
                found: !!sourceCode,
                usedInPages,
              },
              null,
              2,
            ),
          },
        ],
      }
    },
  )
}
