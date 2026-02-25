// ============================================================
// @neuron-ui/mcp-server — Server Factory
// Creates and configures the MCP server with all tools, resources, and prompts
// ============================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { registerAllTools } from './tools/index.js'
import { registerResources } from './resources/index.js'
import { registerPrompts } from './prompts/index.js'

/**
 * Create a fully configured neuron-ui MCP server instance.
 *
 * The server exposes:
 * - **11 Tools**: 5 metadata + 4 generation + 2 codegen
 * - **12 Resources**: 3 metadata + 5 tokens + 1 schema + 3 examples
 * - **3 Prompts**: page-generation, component-selection, schema-review
 */
export function createNeuronMcpServer(): McpServer {
  const server = new McpServer({
    name: 'neuron-ui',
    version: '0.1.0',
  })

  registerAllTools(server)
  registerResources(server)
  registerPrompts(server)

  return server
}
