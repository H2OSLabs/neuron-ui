// ============================================================
// Tool: neuron_create_page
// Creates a new Page JSON file for a project
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'

export function registerCreatePage(server: McpServer, projectRoot?: string) {
  const root = projectRoot ?? process.cwd()

  server.tool(
    'neuron_create_page',
    '创建一个新的 Page JSON 文件，定义页面结构、数据源和组件树。',
    {
      pageId: z.string().describe('页面 ID，如 user-management'),
      pageName: z.string().describe('页面显示名，如 "用户管理"'),
      route: z.string().optional().describe('路由路径，如 /users'),
      dataSources: z
        .record(
          z.object({
            api: z.string(),
            method: z.string().optional(),
            params: z.record(z.unknown()).optional(),
            autoFetch: z.boolean().optional(),
          }),
        )
        .optional()
        .describe('页面数据源定义'),
      tree: z
        .array(z.any())
        .describe('页面组件树（Page JSON tree 格式）'),
      outputDir: z
        .string()
        .optional()
        .describe('输出目录，默认 src/pages/'),
    },
    async ({ pageId, pageName, route, dataSources, tree, outputDir }) => {
      const pageSchema = {
        version: '1.0.0',
        page: {
          id: pageId,
          name: pageName,
          ...(route ? { route } : {}),
        },
        ...(dataSources ? { dataSources } : {}),
        tree,
      }

      const dir = outputDir ?? 'src/pages'
      const fullDir = join(root, dir)
      const filePath = join(fullDir, `${pageId}.json`)

      if (existsSync(filePath)) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: `Page file already exists: ${filePath}`,
                hint: '使用 neuron_update_page_json 来修改已有页面',
              }),
            },
          ],
        }
      }

      mkdirSync(fullDir, { recursive: true })
      writeFileSync(filePath, JSON.stringify(pageSchema, null, 2), 'utf-8')

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              pageId,
              filePath,
              message: `页面 ${pageName} (${pageId}) 已创建到 ${filePath}`,
              nodeCount: countNodes(tree),
            }),
          },
        ],
      }
    },
  )
}

function countNodes(nodes: unknown[]): number {
  let count = 0
  for (const node of nodes as Array<{ children?: unknown[] }>) {
    count += 1
    if (node.children) count += countNodes(node.children)
  }
  return count
}
