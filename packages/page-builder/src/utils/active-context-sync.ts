// ============================================================
// Active Context Sync — Posts selection context to MCP server
// The MCP server reads this to provide AI with current user context
// ============================================================

export interface ActiveContext {
  pageId: string | null
  componentId: string | null
  componentType: string | null
  timestamp: number
}

const MCP_ENDPOINT = 'http://localhost:7878/active-context'

/**
 * Sync the current active context to the MCP dev server.
 * Fires and forgets — silently ignores if MCP server is not running.
 */
export function syncActiveContext(ctx: ActiveContext) {
  fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctx),
  }).catch(() => {
    /* MCP server not running — ignore */
  })
}
