// ============================================================
// @neuron-ui/mcp-server — Public API
// ============================================================

export { createNeuronMcpServer } from './server.js'

// Re-export types for consumers
export type {
  MetadataStore,
  TokenData,
  ExampleEntry,
  ToolTextContent,
  ToolResponse,
} from './types.js'
