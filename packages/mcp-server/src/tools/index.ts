// ============================================================
// Tools — Barrel export that registers all tool groups
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerMetadataTools } from './metadata/index.js'
import { registerGenerationTools } from './generation/index.js'
import { registerCodegenTools } from './codegen/index.js'

/**
 * Register all 11 tools on the MCP server:
 *
 * Metadata (5):
 *   - neuron_list_components, neuron_get_component, neuron_get_mapping_rules,
 *     neuron_get_composition_rules, neuron_get_tokens
 *
 * Generation (4):
 *   - neuron_analyze_api, neuron_generate_page, neuron_validate_schema,
 *     neuron_suggest_components
 *
 * Codegen (2):
 *   - neuron_generate_code, neuron_preview_code
 */
export function registerAllTools(server: McpServer) {
  registerMetadataTools(server)
  registerGenerationTools(server)
  registerCodegenTools(server)
}
