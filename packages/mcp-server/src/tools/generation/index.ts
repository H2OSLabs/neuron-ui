// ============================================================
// Generation Tools — Registration entry point
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerAnalyzeApiTool } from './analyze-api'
import { registerGeneratePageTool } from './generate-page'
import { registerValidateSchemaTool } from './validate-schema'
import { registerSuggestComponentsTool } from './suggest-components'

/**
 * Register all generation-related MCP tools on the server.
 *
 * Tools:
 * - neuron_analyze_api      — Parse API docs into structured data
 * - neuron_generate_page    — Generate Page Schema from API + TaskCase
 * - neuron_validate_schema  — Validate Page Schema against all rules
 * - neuron_suggest_components — Recommend components for a field
 */
export function registerGenerationTools(server: McpServer): void {
  registerAnalyzeApiTool(server)
  registerGeneratePageTool(server)
  registerValidateSchemaTool(server)
  registerSuggestComponentsTool(server)
}
