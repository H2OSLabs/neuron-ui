// ============================================================
// Layout Generator — Generate AppLayout.tsx from ProjectSchema
// ============================================================

import type { ProjectSchema, ProjectNavigationItem } from '@neuron-ui/metadata'

/**
 * Generate an AppLayout.tsx file with sidebar or header navigation.
 */
export function generateLayoutFile(schema: ProjectSchema): string {
  const lines: string[] = []
  const nav = schema.navigation

  lines.push(`import { Outlet, NavLink } from 'react-router-dom'`)

  // Collect unique icon names
  const iconNames = collectIcons(nav.items)
  if (iconNames.length > 0) {
    lines.push(
      `import { ${iconNames.join(', ')} } from 'lucide-react'`,
    )
  }
  lines.push('')

  if (nav.type === 'sidebar') {
    lines.push(...generateSidebarLayout(schema, iconNames))
  } else {
    lines.push(...generateHeaderLayout(schema, iconNames))
  }

  lines.push('')
  return lines.join('\n')
}

function generateSidebarLayout(schema: ProjectSchema, _iconNames: string[]): string[] {
  const lines: string[] = []
  const nav = schema.navigation

  lines.push('export function AppLayout() {')
  lines.push('  return (')
  lines.push('    <div className="flex h-screen bg-gray-50">')
  lines.push('      {/* Sidebar */}')
  lines.push('      <aside className="w-60 flex flex-col border-r border-gray-200 bg-white">')

  // Logo / Project name
  lines.push('        <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-200">')
  lines.push(`          <span className="font-semibold text-sm">${schema.project.name}</span>`)
  lines.push('        </div>')

  // Nav items
  lines.push('        <nav className="flex-1 p-2 space-y-1">')
  for (const item of nav.items) {
    const page = schema.pages.find((p) => p.page.id === item.pageId)
    const route = page?.page.route || `/${item.pageId}`
    const iconComponent = item.icon ? toIconComponent(item.icon) : null

    lines.push('          <NavLink')
    lines.push(`            to="${route}"`)
    lines.push(
      `            className={({ isActive }) => \`flex items-center gap-2 px-3 py-2 rounded-md text-sm \${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}\`}`,
    )
    lines.push('          >')
    if (iconComponent) {
      lines.push(`            <${iconComponent} size={18} />`)
    }
    lines.push(`            <span>${item.label}</span>`)
    lines.push('          </NavLink>')
  }
  lines.push('        </nav>')
  lines.push('      </aside>')

  // Main content
  lines.push('      {/* Main content */}')
  lines.push('      <main className="flex-1 overflow-auto">')
  lines.push('        <Outlet />')
  lines.push('      </main>')
  lines.push('    </div>')
  lines.push('  )')
  lines.push('}')

  return lines
}

function generateHeaderLayout(schema: ProjectSchema, _iconNames: string[]): string[] {
  const lines: string[] = []
  const nav = schema.navigation

  lines.push('export function AppLayout() {')
  lines.push('  return (')
  lines.push('    <div className="flex flex-col h-screen bg-gray-50">')
  lines.push('      {/* Header */}')
  lines.push('      <header className="flex items-center gap-6 px-6 h-14 border-b border-gray-200 bg-white">')
  lines.push(`        <span className="font-semibold text-sm">${schema.project.name}</span>`)

  // Nav items
  lines.push('        <nav className="flex items-center gap-1">')
  for (const item of nav.items) {
    const page = schema.pages.find((p) => p.page.id === item.pageId)
    const route = page?.page.route || `/${item.pageId}`
    const iconComponent = item.icon ? toIconComponent(item.icon) : null

    lines.push('          <NavLink')
    lines.push(`            to="${route}"`)
    lines.push(
      `            className={({ isActive }) => \`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm \${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}\`}`,
    )
    lines.push('          >')
    if (iconComponent) {
      lines.push(`            <${iconComponent} size={16} />`)
    }
    lines.push(`            <span>${item.label}</span>`)
    lines.push('          </NavLink>')
  }
  lines.push('        </nav>')
  lines.push('      </header>')

  // Main content
  lines.push('      {/* Main content */}')
  lines.push('      <main className="flex-1 overflow-auto">')
  lines.push('        <Outlet />')
  lines.push('      </main>')
  lines.push('    </div>')
  lines.push('  )')
  lines.push('}')

  return lines
}

/**
 * Collect unique lucide-react icon component names from navigation items.
 */
function collectIcons(items: ProjectNavigationItem[]): string[] {
  const icons = new Set<string>()
  for (const item of items) {
    if (item.icon) {
      icons.add(toIconComponent(item.icon))
    }
    if (item.children) {
      for (const name of collectIcons(item.children)) {
        icons.add(name)
      }
    }
  }
  return [...icons].sort()
}

/**
 * Convert a kebab-case icon name to PascalCase lucide-react component name.
 * "list-checks" → "ListChecks", "folder" → "Folder", "play" → "Play"
 */
function toIconComponent(iconName: string): string {
  return iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
