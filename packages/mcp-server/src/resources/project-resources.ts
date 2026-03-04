// ============================================================
// Project Resources — Active context and page JSON resources
// These enable AI clients to understand what the user is working on
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Register project-level resources:
 * - project://active-context — Current user selection in App-UI
 * - project://page-json/{pageId} — Page JSON for a specific page
 */
export function registerProjectResources(server: McpServer, projectRoot?: string) {
  const root = projectRoot ?? process.cwd()

  // Active context — what the user currently has selected in App-UI
  server.resource(
    'active-context',
    'project://active-context',
    {
      description: '当前用户在 App-UI 中选中的组件/页面',
      mimeType: 'application/json',
    },
    async () => {
      const filePath = join(root, '.neuron', 'active-context.json')
      let text: string
      if (existsSync(filePath)) {
        text = readFileSync(filePath, 'utf-8')
      } else {
        text = JSON.stringify({
          pageId: null,
          componentId: null,
          componentType: null,
        })
      }
      return {
        contents: [
          {
            uri: 'project://active-context',
            text,
            mimeType: 'application/json',
          },
        ],
      }
    },
  )

  // Page JSON — full Page JSON for a given page
  server.resource(
    'page-json',
    'project://page-json/{pageId}',
    {
      description: '指定页面的完整 Page JSON',
      mimeType: 'application/json',
    },
    async (uri) => {
      const pageId = uri.pathname.split('/').pop() ?? ''
      const candidates = [
        join(root, 'src', 'pages', `${pageId}.json`),
        join(root, '.neuron', 'pages', `${pageId}.json`),
      ]
      let text = JSON.stringify({ error: `Page ${pageId} not found` })
      for (const p of candidates) {
        if (existsSync(p)) {
          text = readFileSync(p, 'utf-8')
          break
        }
      }
      return {
        contents: [
          {
            uri: uri.href,
            text,
            mimeType: 'application/json',
          },
        ],
      }
    },
  )
}
