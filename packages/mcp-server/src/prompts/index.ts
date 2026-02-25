// ============================================================
// Prompts — Register all 3 MCP prompts
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerPageGenerationPrompt } from './page-generation.js'
import { registerComponentSelectionPrompt } from './component-selection.js'
import { registerSchemaReviewPrompt } from './schema-review.js'

/**
 * Register all 3 MCP prompts on the server:
 *
 * 1. page-generation     — Full system prompt for AI page generation
 * 2. component-selection — Component selection guidance with catalog + rules
 * 3. schema-review       — Page Schema review with composition + token knowledge
 */
export function registerPrompts(server: McpServer): void {
  registerPageGenerationPrompt(server)
  registerComponentSelectionPrompt(server)
  registerSchemaReviewPrompt(server)
}
