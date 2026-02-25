import type { ComponentManifest, ComponentManifestEntry, ValidationError, ValidationResult } from './types'

/**
 * Validate a component-manifest.json structure
 */
export function validateManifest(manifest: ComponentManifest): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check version
  if (!manifest.version) {
    errors.push({
      path: 'version',
      message: 'Missing version field',
      severity: 'error',
      rule: 'format',
    })
  }

  // Check components array
  if (!Array.isArray(manifest.components)) {
    errors.push({
      path: 'components',
      message: 'components must be an array',
      severity: 'error',
      rule: 'format',
    })
    return { valid: false, errors, warnings }
  }

  const componentNames = new Set<string>()
  const validCategories = new Set([
    'display', 'input', 'action', 'container', 'feedback', 'navigation', 'layout',
  ])

  for (let i = 0; i < manifest.components.length; i++) {
    const comp = manifest.components[i]
    const basePath = `components[${i}]`

    // Check required fields
    if (!comp.name) {
      errors.push({ path: `${basePath}.name`, message: 'Missing component name', severity: 'error', rule: 'format' })
      continue
    }

    // Check N-prefix naming
    if (!comp.name.startsWith('N') || !/^N[A-Z]/.test(comp.name)) {
      errors.push({
        path: `${basePath}.name`,
        message: `Component name "${comp.name}" must start with N followed by uppercase (e.g. NButton)`,
        severity: 'error',
        rule: 'component',
      })
    }

    // Check duplicate names
    if (componentNames.has(comp.name)) {
      errors.push({
        path: `${basePath}.name`,
        message: `Duplicate component name: ${comp.name}`,
        severity: 'error',
        rule: 'component',
      })
    }
    componentNames.add(comp.name)

    // Check category
    if (!comp.category || !validCategories.has(comp.category)) {
      errors.push({
        path: `${basePath}.category`,
        message: `Invalid category "${comp.category}" for ${comp.name}. Must be one of: ${[...validCategories].join(', ')}`,
        severity: 'error',
        rule: 'format',
      })
    }

    // Check importPath
    if (!comp.importPath) {
      errors.push({
        path: `${basePath}.importPath`,
        message: `Missing importPath for ${comp.name}`,
        severity: 'error',
        rule: 'format',
      })
    }

    // Check arrays
    if (!Array.isArray(comp.variants)) {
      warnings.push({ path: `${basePath}.variants`, message: `variants should be an array for ${comp.name}`, severity: 'warning', rule: 'format' })
    }
    if (!Array.isArray(comp.sizes)) {
      warnings.push({ path: `${basePath}.sizes`, message: `sizes should be an array for ${comp.name}`, severity: 'warning', rule: 'format' })
    }
  }

  // Cross-reference canBeChildOf / canContain
  for (let i = 0; i < manifest.components.length; i++) {
    const comp = manifest.components[i]
    const basePath = `components[${i}]`

    for (const parent of (comp.canBeChildOf || [])) {
      if (!componentNames.has(parent)) {
        warnings.push({
          path: `${basePath}.canBeChildOf`,
          message: `${comp.name} references unknown parent "${parent}"`,
          severity: 'warning',
          rule: 'nesting',
        })
      }
    }

    for (const child of (comp.canContain || [])) {
      if (!componentNames.has(child)) {
        warnings.push({
          path: `${basePath}.canContain`,
          message: `${comp.name} references unknown child "${child}"`,
          severity: 'warning',
          rule: 'nesting',
        })
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Look up a component entry by name
 */
export function getComponent(manifest: ComponentManifest, name: string): ComponentManifestEntry | undefined {
  return manifest.components.find(c => c.name === name)
}

/**
 * Get all components by category
 */
export function getComponentsByCategory(manifest: ComponentManifest, category: string): ComponentManifestEntry[] {
  return manifest.components.filter(c => c.category === category)
}

/**
 * Check if a component can be a child of another
 */
export function canBeChildOf(manifest: ComponentManifest, childName: string, parentName: string): boolean {
  const child = getComponent(manifest, childName)
  const parent = getComponent(manifest, parentName)
  if (!child || !parent) return false
  return child.canBeChildOf.includes(parentName) || parent.canContain.includes(childName)
}
