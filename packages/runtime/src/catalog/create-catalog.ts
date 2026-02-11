// ============================================================
// createCatalog — Factory function for component catalogs
// Validates elements against Zod schemas and generates AI prompts
// ============================================================

import type { CatalogConfig, Catalog } from '../types'

/**
 * Create a catalog instance from a configuration object.
 *
 * A Catalog registers every renderable component (with Zod props schemas)
 * and every dispatchable action. It provides:
 *   - `validateElement` — runtime props validation via Zod
 *   - `prompt`          — auto-generated markdown for AI system prompts
 */
export function createCatalog(config: CatalogConfig): Catalog {
  return {
    name: config.name,
    components: config.components,
    actions: config.actions,

    validateElement(type: string, props: Record<string, unknown>) {
      const def = config.components[type]
      if (!def) {
        return { valid: false, errors: [`Unknown component: ${type}`] }
      }

      const result = def.props.safeParse(props)
      if (result.success) {
        return { valid: true, errors: [] }
      }

      return {
        valid: false,
        errors: result.error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        ),
      }
    },

    prompt() {
      const componentEntries = Object.entries(config.components)
      const actionEntries = Object.entries(config.actions)

      let md = `# ${config.name} Component Catalog\n\n`

      // --- Components ---
      md += `## Components (${componentEntries.length})\n\n`

      for (const [name, def] of componentEntries) {
        md += `### ${name}\n`
        md += `${def.description}\n`
        if (def.hasChildren) {
          md += `- Can contain children\n`
        }
        md += `\n`
      }

      // --- Actions ---
      md += `## Actions (${actionEntries.length})\n\n`

      for (const [name, def] of actionEntries) {
        md += `- **${name}**: ${def.description}\n`
      }

      return md
    },
  }
}
