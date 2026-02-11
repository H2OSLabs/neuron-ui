// ============================================================
// Codegen Tools — Registration entry point
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerGenerateCodeTool } from './generate-code.js'
import { registerPreviewCodeTool } from './preview-code.js'

/**
 * Register all codegen-related MCP tools on the server.
 *
 * Tools:
 * - neuron_generate_code  — Generate full .tsx source files from Page Schema
 * - neuron_preview_code   — Preview page component only for quick review
 */
export function registerCodegenTools(server: McpServer): void {
  registerGenerateCodeTool(server)
  registerPreviewCodeTool(server)
}
