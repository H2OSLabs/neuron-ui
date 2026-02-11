// ============================================================
// Page Generator — Convert PageSchema into a React page component
// ============================================================

import type { PageSchema, PageSchemaTreeNode } from '@neuron-ui/metadata'
import type { HooksStyle } from '../types'
import { toPageComponentName, toHookName, toCamelCase } from '../utils/naming'

/** Components that manage open/close state (dialogs, sheets, drawers) */
const OVERLAY_COMPONENTS = new Set([
  'NDialog',
  'NAlertDialog',
  'NSheet',
  'NDrawer',
])

interface OverlayInfo {
  id: string
  component: string
  stateName: string
  setterName: string
}

interface DataSourceUsage {
  key: string
  hookName: string
  isQuery: boolean // GET = query, others = mutation
}

/**
 * Generate a page component .tsx source string from a PageSchema.
 */
export function generatePageComponent(
  schema: PageSchema,
  hooksStyle: HooksStyle = 'hooks',
): string {
  const pageName = toPageComponentName(schema.page.name)
  const componentNames = collectComponentNames(schema.tree)
  const overlays = collectOverlays(schema.tree)
  const dataSourceUsages = collectDataSourceUsages(schema)

  const lines: string[] = []

  // 'use client' directive for Next.js compatibility
  lines.push(`'use client'`)
  lines.push('')

  // React imports
  const reactImports: string[] = ['useState']
  if (hooksStyle === 'hooks' || dataSourceUsages.some((ds) => ds.isQuery)) {
    // useState is always needed for overlays at minimum
  }
  lines.push(`import { ${reactImports.join(', ')} } from 'react'`)
  lines.push('')

  // Component imports from @neuron-ui/components
  const sortedComponents = [...componentNames].sort()
  lines.push(
    `import { ${sortedComponents.join(', ')} } from '@neuron-ui/components'`,
  )
  lines.push('')

  // Hooks imports from companion file
  if (dataSourceUsages.length > 0) {
    const hookImports = dataSourceUsages
      .map((ds) => ds.hookName)
      .join(', ')
    lines.push(`import { ${hookImports} } from './${pageName}.hooks'`)
    lines.push('')
  }

  // Component function
  lines.push(`export function ${pageName}() {`)

  // Hook calls
  for (const ds of dataSourceUsages) {
    if (ds.isQuery) {
      lines.push(
        `  const { data: ${toCamelCase(ds.key)}, isLoading: ${toCamelCase(ds.key)}Loading, refetch: refetch${toPascal(ds.key)} } = ${ds.hookName}()`,
      )
    } else {
      lines.push(
        `  const { mutate: ${toCamelCase(ds.key)} } = ${ds.hookName}()`,
      )
    }
  }

  if (dataSourceUsages.length > 0) {
    lines.push('')
  }

  // Overlay state declarations
  for (const overlay of overlays) {
    if (overlay.component === 'NAlertDialog') {
      // AlertDialog often tracks a target ID
      lines.push(
        `  const [${overlay.stateName}, ${overlay.setterName}] = useState<string | null>(null)`,
      )
    } else {
      lines.push(
        `  const [${overlay.stateName}, ${overlay.setterName}] = useState(false)`,
      )
    }
  }

  if (overlays.length > 0) {
    lines.push('')
  }

  // Return JSX
  lines.push('  return (')
  for (const node of schema.tree) {
    renderNode(node, lines, 4, overlays, dataSourceUsages)
  }
  lines.push('  )')
  lines.push('}')
  lines.push('')

  return lines.join('\n')
}

// ---- Internal helpers ----

function toPascal(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Collect all unique component names from the tree.
 */
function collectComponentNames(nodes: PageSchemaTreeNode[]): Set<string> {
  const names = new Set<string>()
  function walk(node: PageSchemaTreeNode) {
    names.add(node.component)
    if (node.children) {
      for (const child of node.children) {
        walk(child)
      }
    }
  }
  for (const node of nodes) {
    walk(node)
  }
  return names
}

/**
 * Collect overlay components (NDialog, NAlertDialog, NSheet, NDrawer)
 * that need open/close state management.
 */
function collectOverlays(nodes: PageSchemaTreeNode[]): OverlayInfo[] {
  const overlays: OverlayInfo[] = []
  function walk(node: PageSchemaTreeNode) {
    if (OVERLAY_COMPONENTS.has(node.component)) {
      const baseName = toCamelCase(node.id)
      overlays.push({
        id: node.id,
        component: node.component,
        stateName: `${baseName}Open`,
        setterName: `set${toPascal(baseName)}Open`,
      })
    }
    if (node.children) {
      for (const child of node.children) {
        walk(child)
      }
    }
  }
  for (const node of nodes) {
    walk(node)
  }
  return overlays
}

/**
 * Collect data source usages and determine which are queries vs mutations.
 */
function collectDataSourceUsages(schema: PageSchema): DataSourceUsage[] {
  if (!schema.dataSources) return []

  return Object.entries(schema.dataSources).map(([key, ds]) => {
    const apiStr = ds.api || ''
    const methodPart = apiStr.trim().split(/\s+/)[0]?.toUpperCase() || 'GET'
    const isQuery = methodPart === 'GET'
    return {
      key,
      hookName: toHookName(key),
      isQuery,
    }
  })
}

/**
 * Render a tree node as JSX lines, recursively rendering children.
 */
function renderNode(
  node: PageSchemaTreeNode,
  lines: string[],
  indent: number,
  overlays: OverlayInfo[],
  dataSourceUsages: DataSourceUsage[],
): void {
  const pad = ' '.repeat(indent)
  const component = node.component
  const propsStr = buildPropsString(node, overlays, dataSourceUsages)
  const isOverlay = OVERLAY_COMPONENTS.has(component)

  // Find overlay info for this node
  const overlayInfo = isOverlay
    ? overlays.find((o) => o.id === node.id)
    : undefined

  // Build opening tag attributes
  const attrs: string[] = []
  attrs.push(`data-neuron-component="${node.id}"`)

  if (propsStr) {
    attrs.push(propsStr)
  }

  // Add overlay open/close props
  if (overlayInfo) {
    if (overlayInfo.component === 'NAlertDialog') {
      attrs.push(`open={!!${overlayInfo.stateName}}`)
      attrs.push(`onOpenChange={() => ${overlayInfo.setterName}(null)}`)
    } else {
      attrs.push(`open={${overlayInfo.stateName}}`)
      attrs.push(`onOpenChange={${overlayInfo.setterName}}`)
    }
  }

  // Add binding-based event handlers
  if (node.binding?.onClick) {
    const clickAction = node.binding.onClick
    // Pattern: "openDialog:dialog-id"
    if (clickAction.startsWith('openDialog:')) {
      const targetId = clickAction.split(':')[1]
      const targetOverlay = overlays.find((o) => o.id === targetId)
      if (targetOverlay) {
        attrs.push(`onClick={() => ${targetOverlay.setterName}(true)}`)
      }
    }
  }

  // Add data binding props
  if (node.binding?.dataSource) {
    const dsUsage = dataSourceUsages.find(
      (d) => d.key === node.binding?.dataSource,
    )
    if (dsUsage && dsUsage.isQuery) {
      attrs.push(`data={${toCamelCase(dsUsage.key)} ?? []}`)
    }
  }

  const attrStr = attrs.length > 0 ? ` ${attrs.join(' ')}` : ''

  if (node.children && node.children.length > 0) {
    lines.push(`${pad}<${component}${attrStr}>`)
    for (const child of node.children) {
      renderNode(child, lines, indent + 2, overlays, dataSourceUsages)
    }
    lines.push(`${pad}</${component}>`)
  } else {
    lines.push(`${pad}<${component}${attrStr} />`)
  }
}

/**
 * Build a props string from the node's static props.
 */
function buildPropsString(
  node: PageSchemaTreeNode,
  _overlays: OverlayInfo[],
  _dataSourceUsages: DataSourceUsage[],
): string {
  if (!node.props || Object.keys(node.props).length === 0) return ''

  const parts: string[] = []

  for (const [key, value] of Object.entries(node.props)) {
    if (value === undefined || value === null) continue

    if (typeof value === 'string') {
      parts.push(`${key}="${escapeJsxString(value)}"`)
    } else if (typeof value === 'boolean') {
      parts.push(value ? key : `${key}={false}`)
    } else if (typeof value === 'number') {
      parts.push(`${key}={${value}}`)
    } else {
      // Objects and arrays: serialize as JSX expression
      parts.push(`${key}={${JSON.stringify(value)}}`)
    }
  }

  return parts.join(' ')
}

/**
 * Escape special characters in JSX string attributes.
 */
function escapeJsxString(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
