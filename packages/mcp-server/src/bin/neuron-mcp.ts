#!/usr/bin/env node
// ============================================================
// neuron-mcp CLI — Entry point for the MCP server
// Connects via stdio transport for use with Claude Code, Cursor, etc.
// ============================================================

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createNeuronMcpServer } from '../server.js'

async function main() {
  const server = createNeuronMcpServer()
  const transport = new StdioServerTransport()

  // Log to stderr so it doesn't interfere with MCP protocol on stdout
  console.error('[neuron-mcp] Starting neuron-ui MCP server...')

  await server.connect(transport)

  console.error('[neuron-mcp] Server connected and ready.')
}

main().catch((err) => {
  console.error('[neuron-mcp] Fatal error:', err)
  process.exit(1)
})
