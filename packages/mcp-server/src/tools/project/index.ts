// ============================================================
// Project Tools — Register project-level MCP tools
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerUpdatePageJson } from './update-page-json.js'
import { registerGetComponentContext } from './get-component-context.js'
import { registerGenerateComponent } from './generate-component.js'
import { registerCreatePage } from './create-page.js'

/**
 * Register project-level tools:
 * - neuron_update_page_json — Update props/events/binding on a Page JSON node
 * - neuron_get_component_context — Get component source code and usage
 * - neuron_generate_component — Generate shadcn二开 component via AI
 * - neuron_create_page — Create a new Page JSON file
 */
export function registerProjectTools(server: McpServer) {
  registerUpdatePageJson(server)
  registerGetComponentContext(server)
  registerGenerateComponent(server)
  registerCreatePage(server)
}
