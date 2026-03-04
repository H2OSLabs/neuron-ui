import type {
  ProjectSchema,
  ProjectNavigationItem,
  ComponentManifest,
  CompositionRules,
  ValidationError,
  ValidationResult,
} from './types'
import { validatePageSchema } from './page-schema-validator'

/**
 * Validate a Project Schema: project metadata, pages, and navigation integrity.
 */
export function validateProjectSchema(
  schema: ProjectSchema,
  manifest: ComponentManifest,
  rules: CompositionRules,
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // 1. Project metadata
  if (!schema.version) {
    errors.push({ path: 'version', message: 'Missing version field', severity: 'error', rule: 'format' })
  } else if (!/^\d+\.\d+\.\d+$/.test(schema.version)) {
    errors.push({ path: 'version', message: 'Version must be semver format (e.g. "1.0.0")', severity: 'error', rule: 'format' })
  }

  if (!schema.project) {
    errors.push({ path: 'project', message: 'Missing project metadata', severity: 'error', rule: 'format' })
  } else {
    if (!schema.project.id) {
      errors.push({ path: 'project.id', message: 'Missing project.id', severity: 'error', rule: 'format' })
    }
    if (!schema.project.name) {
      errors.push({ path: 'project.name', message: 'Missing project.name', severity: 'error', rule: 'format' })
    }
  }

  // 2. Pages validation
  if (!Array.isArray(schema.pages) || schema.pages.length === 0) {
    errors.push({ path: 'pages', message: 'pages must be a non-empty array', severity: 'error', rule: 'format' })
  } else {
    const pageIds = new Set<string>()
    const pageRoutes = new Set<string>()

    for (let i = 0; i < schema.pages.length; i++) {
      const page = schema.pages[i]

      // Check duplicate page IDs
      if (page.page?.id) {
        if (pageIds.has(page.page.id)) {
          errors.push({
            path: `pages[${i}].page.id`,
            message: `Duplicate page id: "${page.page.id}"`,
            severity: 'error',
            rule: 'format',
          })
        }
        pageIds.add(page.page.id)
      }

      // Check duplicate routes
      if (page.page?.route) {
        if (pageRoutes.has(page.page.route)) {
          errors.push({
            path: `pages[${i}].page.route`,
            message: `Duplicate route: "${page.page.route}"`,
            severity: 'error',
            rule: 'format',
          })
        }
        pageRoutes.add(page.page.route)
      }

      // Validate each page with existing page validator
      const pageResult = validatePageSchema(page, manifest, rules)
      for (const err of pageResult.errors) {
        errors.push({ ...err, path: `pages[${i}].${err.path}` })
      }
      for (const warn of pageResult.warnings) {
        warnings.push({ ...warn, path: `pages[${i}].${warn.path}` })
      }
    }

    // 3. Navigation validation
    if (schema.navigation) {
      if (!['sidebar', 'header'].includes(schema.navigation.type)) {
        errors.push({
          path: 'navigation.type',
          message: `Invalid navigation type "${schema.navigation.type}". Must be "sidebar" or "header"`,
          severity: 'error',
          rule: 'format',
        })
      }

      if (Array.isArray(schema.navigation.items)) {
        validateNavigationItems(schema.navigation.items, 'navigation.items', pageIds, errors)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateNavigationItems(
  items: ProjectNavigationItem[],
  basePath: string,
  pageIds: Set<string>,
  errors: ValidationError[],
): void {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const path = `${basePath}[${i}]`

    if (!item.pageId) {
      errors.push({ path: `${path}.pageId`, message: 'Missing pageId', severity: 'error', rule: 'format' })
    } else if (pageIds.size > 0 && !pageIds.has(item.pageId)) {
      errors.push({
        path: `${path}.pageId`,
        message: `Navigation references unknown page "${item.pageId}". Available: ${[...pageIds].join(', ')}`,
        severity: 'error',
        rule: 'format',
      })
    }

    if (!item.label) {
      errors.push({ path: `${path}.label`, message: 'Missing label', severity: 'error', rule: 'format' })
    }

    if (item.children) {
      validateNavigationItems(item.children, `${path}.children`, pageIds, errors)
    }
  }
}
