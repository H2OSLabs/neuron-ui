// ============================================================
// App Generator — Generate App.tsx entry point from ProjectSchema
// ============================================================

import type { ProjectSchema } from '@neuron-ui/metadata'

/**
 * Generate an App.tsx entry point wrapping the router and layout.
 */
export function generateAppFile(_schema: ProjectSchema): string {
  const lines: string[] = []

  lines.push(`import { Suspense } from 'react'`)
  lines.push(`import { BrowserRouter, useRoutes } from 'react-router-dom'`)
  lines.push(`import { routes } from './routes'`)
  lines.push(`import { AppLayout } from './AppLayout'`)
  lines.push('')

  lines.push('function AppRoutes() {')
  lines.push("  const element = useRoutes([{ element: <AppLayout />, children: routes }])")
  lines.push('  return element')
  lines.push('}')
  lines.push('')

  lines.push('export function App() {')
  lines.push('  return (')
  lines.push('    <BrowserRouter>')
  lines.push(
    '      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>',
  )
  lines.push('        <AppRoutes />')
  lines.push('      </Suspense>')
  lines.push('    </BrowserRouter>')
  lines.push('  )')
  lines.push('}')
  lines.push('')

  return lines.join('\n')
}
