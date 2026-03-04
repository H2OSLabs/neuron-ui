// ============================================================
// Router Generator — Generate routes.tsx from ProjectSchema
// ============================================================

import type { ProjectSchema } from '@neuron-ui/metadata'
import { toPageComponentName } from '../utils/naming'

/**
 * Generate a routes.tsx file with React Router v6 route config.
 */
export function generateRouterFile(schema: ProjectSchema): string {
  const lines: string[] = []

  lines.push(`import { lazy } from 'react'`)
  lines.push(`import type { RouteObject } from 'react-router-dom'`)
  lines.push('')

  // Lazy imports for each page
  for (const page of schema.pages) {
    const pageName = toPageComponentName(page.page.name)
    lines.push(
      `const ${pageName} = lazy(() => import('./pages/${pageName}/${pageName}'))`,
    )
  }

  lines.push('')
  lines.push('export const routes: RouteObject[] = [')

  for (const page of schema.pages) {
    const pageName = toPageComponentName(page.page.name)
    const route = page.page.route || `/${page.page.id}`
    lines.push(`  { path: '${route}', element: <${pageName} /> },`)
  }

  lines.push(']')
  lines.push('')

  return lines.join('\n')
}
