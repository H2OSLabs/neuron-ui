// ============================================================
// Tool: neuron_analyze_api — Analyze API documentation text
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

/** Detected endpoint from API text */
interface DetectedEndpoint {
  method: string
  path: string
  summary: string
  params: string[]
  bodyFields: string[]
}

/** Detected resource grouping */
interface DetectedResource {
  name: string
  endpoints: DetectedEndpoint[]
  fields: Array<{
    name: string
    type: string
    inResponse: boolean
    inRequest: boolean
  }>
  pattern: string
}

/** Analysis result */
interface AnalysisResult {
  format: string
  resources: DetectedResource[]
  totalEndpoints: number
  suggestedPageType: string
}

/**
 * Register the neuron_analyze_api tool on the MCP server.
 */
export function registerAnalyzeApiTool(server: McpServer): void {
  server.tool(
    'neuron_analyze_api',
    'Analyze API documentation text in any format (Swagger, OpenAPI, Postman, cURL, text, table). Extracts endpoints, methods, fields, and resource groupings. This is the first step before page generation.',
    {
      apiText: z.string().describe('API documentation content in any format'),
      format: z
        .enum(['auto', 'swagger', 'openapi', 'postman', 'curl', 'text', 'table'])
        .default('auto')
        .describe('API documentation format. "auto" attempts detection.'),
    },
    async ({ apiText, format }) => {
      try {
        const detectedFormat = format === 'auto' ? detectFormat(apiText) : format
        const endpoints = extractEndpoints(apiText, detectedFormat)
        const resources = groupIntoResources(endpoints)
        const suggestedPageType = inferPageType(resources)

        const result: AnalysisResult = {
          format: detectedFormat,
          resources,
          totalEndpoints: endpoints.length,
          suggestedPageType,
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                { error: 'Failed to analyze API text', detail: message },
                null,
                2,
              ),
            },
          ],
          isError: true,
        }
      }
    },
  )
}

// ---- Format detection ----

function detectFormat(text: string): string {
  if (text.includes('"swagger"') || text.includes('"openapi"')) return 'swagger'
  if (text.includes('"info"') && text.includes('"paths"')) return 'openapi'
  if (text.includes('"collection"') || text.includes('"item"')) return 'postman'
  if (/curl\s+-/i.test(text)) return 'curl'
  if (/\|.*\|.*\|/.test(text)) return 'table'
  return 'text'
}

// ---- Endpoint extraction ----

function extractEndpoints(text: string, format: string): DetectedEndpoint[] {
  switch (format) {
    case 'swagger':
    case 'openapi':
      return extractFromOpenApi(text)
    case 'curl':
      return extractFromCurl(text)
    case 'table':
      return extractFromTable(text)
    case 'postman':
      return extractFromPostman(text)
    case 'text':
    default:
      return extractFromText(text)
  }
}

/** Extract endpoints from plain text / mixed format */
function extractFromText(text: string): DetectedEndpoint[] {
  const endpoints: DetectedEndpoint[] = []

  // Pattern: HTTP_METHOD /path — optional description
  // Matches lines like: GET /api/users - List users (name, email, status)
  const linePattern =
    /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/\S+)\s*[-—:]?\s*(.*)/gi
  let match: RegExpExecArray | null

  while ((match = linePattern.exec(text)) !== null) {
    const method = match[1].toUpperCase()
    const path = match[2]
    const rest = match[3]?.trim() ?? ''

    // Try to extract field names from parenthetical lists
    const summary = rest.replace(/\(.*\)/, '').trim()
    const fieldMatch = rest.match(/\(([^)]+)\)/)
    const fields = fieldMatch
      ? fieldMatch[1].split(/[,;]/).map((f) => f.trim()).filter(Boolean)
      : []

    const isRequest = method !== 'GET'
    endpoints.push({
      method,
      path,
      summary,
      params: isRequest ? [] : fields,
      bodyFields: isRequest ? fields : [],
    })
  }

  return endpoints
}

/** Extract from Swagger/OpenAPI JSON */
function extractFromOpenApi(text: string): DetectedEndpoint[] {
  const endpoints: DetectedEndpoint[] = []
  try {
    const doc = JSON.parse(text) as Record<string, unknown>
    const paths = doc.paths as Record<string, Record<string, unknown>> | undefined
    if (!paths) return extractFromText(text)

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, detail] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          const info = detail as Record<string, unknown>
          const summary =
            (info.summary as string) ??
            (info.description as string) ??
            ''
          const params: string[] = []
          const bodyFields: string[] = []

          // Extract parameter names
          if (Array.isArray(info.parameters)) {
            for (const p of info.parameters) {
              const param = p as Record<string, unknown>
              if (param.name) params.push(String(param.name))
            }
          }

          endpoints.push({
            method: method.toUpperCase(),
            path,
            summary,
            params,
            bodyFields,
          })
        }
      }
    }
  } catch {
    // If JSON parse fails, fall back to text extraction
    return extractFromText(text)
  }
  return endpoints
}

/** Extract from cURL commands */
function extractFromCurl(text: string): DetectedEndpoint[] {
  const endpoints: DetectedEndpoint[] = []
  const curlPattern = /curl\s+(?:.*?-X\s+(GET|POST|PUT|PATCH|DELETE)\s+)?.*?(https?:\/\/\S+|['"]https?:\/\/[^'"]+['"])/gi
  let match: RegExpExecArray | null

  while ((match = curlPattern.exec(text)) !== null) {
    const method = match[1]?.toUpperCase() ?? 'GET'
    let url = match[2].replace(/['"]/g, '')

    // Extract path from URL
    try {
      const urlObj = new URL(url)
      url = urlObj.pathname
    } catch {
      // Use as-is if not a valid URL
    }

    endpoints.push({
      method,
      path: url,
      summary: '',
      params: [],
      bodyFields: [],
    })
  }

  return endpoints
}

/** Extract from markdown/text tables */
function extractFromTable(text: string): DetectedEndpoint[] {
  const endpoints: DetectedEndpoint[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    if (!line.includes('|')) continue
    // Skip separator lines
    if (/^\s*\|?\s*[-:]+/.test(line)) continue

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean)

    // Look for method and path in cells
    for (let i = 0; i < cells.length; i++) {
      const methodMatch = cells[i].match(/^(GET|POST|PUT|PATCH|DELETE)$/i)
      if (methodMatch && i + 1 < cells.length) {
        const path = cells[i + 1].trim()
        const summary = cells[i + 2]?.trim() ?? ''
        if (path.startsWith('/')) {
          endpoints.push({
            method: methodMatch[1].toUpperCase(),
            path,
            summary,
            params: [],
            bodyFields: [],
          })
        }
      }
    }

    // Also try "METHOD /path" in a single cell
    for (const cell of cells) {
      const combined = cell.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(\/\S+)/i)
      if (combined) {
        endpoints.push({
          method: combined[1].toUpperCase(),
          path: combined[2],
          summary: '',
          params: [],
          bodyFields: [],
        })
      }
    }
  }

  return endpoints
}

/** Extract from Postman collection JSON */
function extractFromPostman(text: string): DetectedEndpoint[] {
  const endpoints: DetectedEndpoint[] = []
  try {
    const doc = JSON.parse(text) as Record<string, unknown>
    const items = (doc.item ?? []) as Array<Record<string, unknown>>

    function walkItems(items: Array<Record<string, unknown>>) {
      for (const item of items) {
        if (item.item && Array.isArray(item.item)) {
          walkItems(item.item as Array<Record<string, unknown>>)
        }
        if (item.request) {
          const req = item.request as Record<string, unknown>
          const method =
            typeof req.method === 'string'
              ? req.method.toUpperCase()
              : 'GET'
          let path = ''
          if (typeof req.url === 'string') {
            try {
              const u = new URL(req.url)
              path = u.pathname
            } catch {
              path = req.url
            }
          } else if (typeof req.url === 'object' && req.url !== null) {
            const urlObj = req.url as Record<string, unknown>
            if (Array.isArray(urlObj.path)) {
              path = '/' + (urlObj.path as string[]).join('/')
            }
          }
          endpoints.push({
            method,
            path,
            summary: typeof item.name === 'string' ? item.name : '',
            params: [],
            bodyFields: [],
          })
        }
      }
    }

    walkItems(items)
  } catch {
    return extractFromText(text)
  }
  return endpoints
}

// ---- Resource grouping ----

function groupIntoResources(endpoints: DetectedEndpoint[]): DetectedResource[] {
  const groups = new Map<string, DetectedEndpoint[]>()

  for (const ep of endpoints) {
    // Extract resource name from path, e.g. /api/users/:id -> users
    const segments = ep.path.split('/').filter(Boolean)
    let resourceName = 'unknown'
    for (const seg of segments) {
      if (!seg.startsWith(':') && !seg.startsWith('{') && seg !== 'api' && seg !== 'v1' && seg !== 'v2') {
        resourceName = seg
        break
      }
    }

    if (!groups.has(resourceName)) {
      groups.set(resourceName, [])
    }
    groups.get(resourceName)!.push(ep)
  }

  const resources: DetectedResource[] = []
  for (const [name, eps] of groups) {
    // Collect all mentioned fields
    const fieldMap = new Map<string, { inResponse: boolean; inRequest: boolean }>()
    for (const ep of eps) {
      for (const p of ep.params) {
        const existing = fieldMap.get(p) ?? { inResponse: false, inRequest: false }
        existing.inResponse = true
        fieldMap.set(p, existing)
      }
      for (const f of ep.bodyFields) {
        const existing = fieldMap.get(f) ?? { inResponse: false, inRequest: false }
        existing.inRequest = true
        fieldMap.set(f, existing)
      }
    }

    const fields = Array.from(fieldMap.entries()).map(([fieldName, info]) => ({
      name: fieldName,
      type: 'string', // Default type; real AI would infer types
      inResponse: info.inResponse,
      inRequest: info.inRequest,
    }))

    // Determine CRUD pattern
    const methods = new Set(eps.map((e) => e.method))
    let pattern = 'custom'
    if (methods.has('GET') && methods.has('POST') && (methods.has('PUT') || methods.has('PATCH')) && methods.has('DELETE')) {
      pattern = 'CRUD'
    } else if (methods.has('GET') && methods.size === 1) {
      pattern = 'read-only'
    } else if (methods.has('GET') && methods.has('POST')) {
      pattern = 'list-create'
    }

    resources.push({
      name,
      endpoints: eps,
      fields,
      pattern,
    })
  }

  return resources
}

// ---- Page type inference ----

function inferPageType(resources: DetectedResource[]): string {
  if (resources.length === 0) return 'auto'

  const patterns = resources.map((r) => r.pattern)
  if (patterns.includes('CRUD')) return 'crud'

  const allReadOnly = patterns.every((p) => p === 'read-only')
  if (allReadOnly && resources.length >= 2) return 'dashboard'

  if (resources.length === 1 && resources[0].endpoints.length === 1) {
    const ep = resources[0].endpoints[0]
    if (ep.method === 'GET' && ep.path.includes(':')) return 'detail'
  }

  return 'auto'
}
