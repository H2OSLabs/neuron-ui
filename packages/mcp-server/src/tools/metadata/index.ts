// ============================================================
// Metadata Tools — Register all 5 metadata query tools
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerListComponents } from './list-components.js'
import { registerGetComponent } from './get-component.js'
import { registerGetMappingRules } from './get-mapping-rules.js'
import { registerGetCompositionRules } from './get-composition-rules.js'
import { registerGetTokens } from './get-tokens.js'

/**
 * Register all 5 metadata tools on the MCP server:
 *
 * 1. neuron_list_components    — List/filter components
 * 2. neuron_get_component      — Get single component details
 * 3. neuron_get_mapping_rules  — Get field-to-component mapping
 * 4. neuron_get_composition_rules — Get nesting constraints
 * 5. neuron_get_tokens         — Get design token values
 */
export function registerMetadataTools(server: McpServer) {
  registerListComponents(server)
  registerGetComponent(server)
  registerGetMappingRules(server)
  registerGetCompositionRules(server)
  registerGetTokens(server)
}
