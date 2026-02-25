import type { PageSchema, PageSchemaTreeNode, ValidationError } from '@neuron-ui/metadata'
import type { AutoFixResult } from './types'

// Color hex to token mapping (common values)
const COLOR_HEX_MAP: Record<string, string> = {
  '#bef1ff': 'blue',
  '#ffb3c6': 'pink',
  '#ffd6e0': 'pink-light',
  '#fff3b0': 'yellow',
  '#ffed4a': 'yellow-bright',
  '#d4fc79': 'lime',
  '#e8fccf': 'lime-light',
  '#86efac': 'green',
  '#c4b5fd': 'purple',
  '#ddd6fe': 'lavender',
  '#ef4444': 'error',
  '#f59e0b': 'warning',
  '#22c55e': 'success',
}

let idCounter = 0

function generateId(component: string): string {
  idCounter++
  const baseName = component.replace(/^N/, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  return `${baseName}-${idCounter}`
}

/**
 * Auto-fix common validation errors in a Page Schema.
 */
export function autoFix(schema: PageSchema, errors: ValidationError[]): AutoFixResult {
  const fixesApplied: string[] = []
  idCounter = 0

  // Deep clone to avoid mutating original
  const fixed = JSON.parse(JSON.stringify(schema)) as PageSchema

  // Track which error types exist
  const errorRules = new Set(errors.map(e => e.rule))

  // Fix missing IDs
  if (errorRules.has('format')) {
    const idErrors = errors.filter(e => e.message.includes('Missing node id'))
    if (idErrors.length > 0) {
      fixMissingIds(fixed.tree)
      fixesApplied.push(`Fixed ${idErrors.length} missing node IDs`)
    }

    const dupErrors = errors.filter(e => e.message.includes('Duplicate node id'))
    if (dupErrors.length > 0) {
      fixDuplicateIds(fixed.tree)
      fixesApplied.push(`Fixed ${dupErrors.length} duplicate node IDs`)
    }
  }

  // Fix raw color tokens
  if (errorRules.has('token')) {
    const colorFixes = fixRawColors(fixed.tree)
    if (colorFixes > 0) {
      fixesApplied.push(`Fixed ${colorFixes} raw color values → token keys`)
    }
  }

  return { schema: fixed, fixesApplied }
}

function fixMissingIds(nodes: PageSchemaTreeNode[]): void {
  for (const node of nodes) {
    if (!node.id) {
      node.id = generateId(node.component || 'node')
    }
    if (node.children) {
      fixMissingIds(node.children)
    }
  }
}

function fixDuplicateIds(nodes: PageSchemaTreeNode[]): void {
  const seen = new Set<string>()

  function walk(nodeList: PageSchemaTreeNode[]): void {
    for (const node of nodeList) {
      if (node.id && seen.has(node.id)) {
        const base = node.id
        let suffix = 2
        while (seen.has(`${base}-${suffix}`)) suffix++
        node.id = `${base}-${suffix}`
      }
      if (node.id) seen.add(node.id)
      if (node.children) walk(node.children)
    }
  }

  walk(nodes)
}

function fixRawColors(nodes: PageSchemaTreeNode[]): number {
  let count = 0

  for (const node of nodes) {
    if (node.props?.['color'] && typeof node.props['color'] === 'string') {
      const color = (node.props['color'] as string).toLowerCase()
      if (color.startsWith('#')) {
        const tokenKey = COLOR_HEX_MAP[color]
        if (tokenKey) {
          node.props['color'] = tokenKey
          count++
        }
      }
    }
    if (node.children) {
      count += fixRawColors(node.children)
    }
  }

  return count
}
