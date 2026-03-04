// ============================================================
// Tool: neuron_update_page_json
// Updates a node's props, events, or binding in a Page JSON file
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export function registerUpdatePageJson(server: McpServer, projectRoot?: string) {
  const root = projectRoot ?? process.cwd()

  server.tool(
    'neuron_update_page_json',
    '更新页面中某个节点的 props、events 或 binding。精确修改，不影响其他节点。',
    {
      pageId: z.string().describe('页面 ID，如 user-management'),
      nodeId: z.string().describe('要修改的节点 ID'),
      patch: z
        .object({
          props: z.record(z.unknown()).optional(),
          events: z.record(z.unknown()).optional(),
          binding: z.record(z.unknown()).optional(),
          domAttr: z.string().optional(),
        })
        .describe('要合并的变更，只需提供要改变的字段'),
    },
    async ({ pageId, nodeId, patch }) => {
      // Find page JSON file
      const candidates = [
        join(root, 'src', 'pages', `${pageId}.json`),
        join(root, '.neuron', 'pages', `${pageId}.json`),
      ]

      let filePath: string | null = null
      for (const p of candidates) {
        if (existsSync(p)) {
          filePath = p
          break
        }
      }

      if (!filePath) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: `Page file not found for: ${pageId}`,
                searchedPaths: candidates,
              }),
            },
          ],
        }
      }

      const schema = JSON.parse(readFileSync(filePath, 'utf-8'))

      function patchNode(nodes: unknown[]): boolean {
        for (const node of nodes as Record<string, unknown>[]) {
          if (node['id'] === nodeId) {
            if (patch.props)
              node['props'] = { ...((node['props'] as object) ?? {}), ...patch.props }
            if (patch.events)
              node['events'] = { ...((node['events'] as object) ?? {}), ...patch.events }
            if (patch.binding)
              node['binding'] = { ...((node['binding'] as object) ?? {}), ...patch.binding }
            if (patch.domAttr !== undefined)
              node['domAttr'] = patch.domAttr
            return true
          }
          if (node['children'] && patchNode(node['children'] as unknown[])) return true
        }
        return false
      }

      const found = patchNode(schema.tree)
      if (!found) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: `Node ${nodeId} not found in page ${pageId}`,
              }),
            },
          ],
        }
      }

      writeFileSync(filePath, JSON.stringify(schema, null, 2), 'utf-8')
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              message: `Updated node ${nodeId} in page ${pageId}`,
              filePath,
            }),
          },
        ],
      }
    },
  )
}
