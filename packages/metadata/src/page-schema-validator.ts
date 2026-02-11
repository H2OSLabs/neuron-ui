import type {
  PageSchema,
  PageSchemaTreeNode,
  ComponentManifest,
  CompositionRules,
  ValidationError,
  ValidationResult,
} from './types'
import { getComponent, canBeChildOf } from './validator'

// Token value lists for validation
const VALID_COLORS = new Set([
  // Gray scale
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14',
  // Accent
  'pink', 'pink-light', 'yellow', 'yellow-bright', 'lime', 'lime-light', 'green', 'blue', 'purple', 'lavender',
  // Semantic
  'error', 'warning', 'success',
  // Named presets
  'default', 'muted', 'accent',
])

const VALID_SIZES = new Set([
  'xs', 'sm', 'md', 'lg', 'xl', 'icon',
  'display', 'heading', 'subheading', 'section', 'body-lg', 'body', 'caption',
])

/**
 * Validate a Page Schema against format, nesting, binding, and token rules
 */
export function validatePageSchema(
  schema: PageSchema,
  manifest: ComponentManifest,
  rules: CompositionRules,
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // 1. Format validation
  validateFormat(schema, errors)

  // 2. Tree validation (component, nesting, binding, tokens)
  if (Array.isArray(schema.tree)) {
    const dataSourceKeys = schema.dataSources ? new Set(Object.keys(schema.dataSources)) : new Set<string>()
    const nodeIds = new Set<string>()

    for (let i = 0; i < schema.tree.length; i++) {
      validateTreeNode(
        schema.tree[i],
        `tree[${i}]`,
        null,
        manifest,
        rules,
        dataSourceKeys,
        nodeIds,
        0,
        errors,
        warnings,
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateFormat(schema: PageSchema, errors: ValidationError[]): void {
  // Version check
  if (!schema.version) {
    errors.push({ path: 'version', message: 'Missing version field', severity: 'error', rule: 'format' })
  } else if (!/^\d+\.\d+\.\d+$/.test(schema.version)) {
    errors.push({ path: 'version', message: 'Version must be semver format (e.g. "1.0.0")', severity: 'error', rule: 'format' })
  }

  // Page metadata check
  if (!schema.page) {
    errors.push({ path: 'page', message: 'Missing page metadata', severity: 'error', rule: 'format' })
  } else {
    if (!schema.page.id) {
      errors.push({ path: 'page.id', message: 'Missing page.id', severity: 'error', rule: 'format' })
    }
    if (!schema.page.name) {
      errors.push({ path: 'page.name', message: 'Missing page.name', severity: 'error', rule: 'format' })
    }
  }

  // Tree check
  if (!schema.tree || !Array.isArray(schema.tree) || schema.tree.length === 0) {
    errors.push({ path: 'tree', message: 'tree must be a non-empty array', severity: 'error', rule: 'format' })
  }

  // DataSources validation
  if (schema.dataSources) {
    for (const [key, ds] of Object.entries(schema.dataSources)) {
      if (!ds.api) {
        errors.push({
          path: `dataSources.${key}.api`,
          message: `Data source "${key}" is missing api field`,
          severity: 'error',
          rule: 'format',
        })
      }
    }
  }
}

function validateTreeNode(
  node: PageSchemaTreeNode,
  path: string,
  parentComponent: string | null,
  manifest: ComponentManifest,
  rules: CompositionRules,
  dataSourceKeys: Set<string>,
  nodeIds: Set<string>,
  depth: number,
  errors: ValidationError[],
  warnings: ValidationError[],
): void {
  // Check max nesting depth
  if (depth > rules.globalConstraints.maxNestingDepth) {
    errors.push({
      path,
      message: `Nesting depth ${depth} exceeds maximum of ${rules.globalConstraints.maxNestingDepth}`,
      severity: 'error',
      rule: 'nesting',
    })
  }

  // Check required fields
  if (!node.id) {
    errors.push({ path: `${path}.id`, message: 'Missing node id', severity: 'error', rule: 'format' })
  } else {
    if (nodeIds.has(node.id)) {
      errors.push({ path: `${path}.id`, message: `Duplicate node id: "${node.id}"`, severity: 'error', rule: 'format' })
    }
    nodeIds.add(node.id)
  }

  if (!node.component) {
    errors.push({ path: `${path}.component`, message: 'Missing component name', severity: 'error', rule: 'format' })
    return
  }

  // Check component name format
  if (!/^N[A-Z][a-zA-Z]*$/.test(node.component)) {
    errors.push({
      path: `${path}.component`,
      message: `Invalid component name "${node.component}". Must match N[A-Z][a-zA-Z]*`,
      severity: 'error',
      rule: 'component',
    })
  }

  // Check component exists in manifest
  const compEntry = getComponent(manifest, node.component)
  if (!compEntry) {
    errors.push({
      path: `${path}.component`,
      message: `Unknown component "${node.component}" — not found in manifest`,
      severity: 'error',
      rule: 'component',
    })
    // Continue to validate children even if component is unknown
  }

  // Check nesting rules
  if (parentComponent && compEntry) {
    if (!canBeChildOf(manifest, node.component, parentComponent)) {
      // Also check composition rules
      const parentRule = rules.rules.find(r => r.parent === parentComponent)
      if (!parentRule || !parentRule.allowedChildren.includes(node.component)) {
        warnings.push({
          path: `${path}.component`,
          message: `"${node.component}" may not be a valid child of "${parentComponent}"`,
          severity: 'warning',
          rule: 'nesting',
        })
      }
    }
  }

  // Check root containers (depth 0)
  if (depth === 0 && compEntry) {
    const rootContainers = rules.globalConstraints.rootContainers
    if (!rootContainers.includes(node.component)) {
      warnings.push({
        path: `${path}.component`,
        message: `"${node.component}" is not a recommended root container. Recommended: ${rootContainers.join(', ')}`,
        severity: 'warning',
        rule: 'nesting',
      })
    }
  }

  // Validate props — check token values
  if (node.props && compEntry) {
    validateTokenProps(node.props, path, compEntry, rules, errors, warnings)
  }

  // Validate binding
  if (node.binding) {
    validateBinding(node.binding, path, dataSourceKeys, warnings)
  }

  // Recurse into children
  if (node.children && Array.isArray(node.children)) {
    // Check parent constraints (e.g., maxButtons for NDialog)
    if (compEntry?.constraints) {
      const maxButtons = compEntry.constraints['maxButtons'] as number | undefined
      if (maxButtons) {
        const buttonCount = node.children.filter(c => c.component === 'NButton').length
        if (buttonCount > maxButtons) {
          warnings.push({
            path: `${path}.children`,
            message: `${node.component} has ${buttonCount} NButton children, max is ${maxButtons}`,
            severity: 'warning',
            rule: 'nesting',
          })
        }
      }
    }

    // Check NField maxChildren: 1
    const fieldRule = rules.rules.find(r => r.parent === node.component)
    if (fieldRule?.constraints?.['maxChildren']) {
      const max = fieldRule.constraints['maxChildren'] as number
      if (node.children.length > max) {
        warnings.push({
          path: `${path}.children`,
          message: `${node.component} has ${node.children.length} children, max is ${max}`,
          severity: 'warning',
          rule: 'nesting',
        })
      }
    }

    for (let i = 0; i < node.children.length; i++) {
      validateTreeNode(
        node.children[i],
        `${path}.children[${i}]`,
        node.component,
        manifest,
        rules,
        dataSourceKeys,
        nodeIds,
        depth + 1,
        errors,
        warnings,
      )
    }
  }
}

function validateTokenProps(
  props: Record<string, unknown>,
  path: string,
  _compEntry: { name: string },
  rules: CompositionRules,
  _errors: ValidationError[],
  warnings: ValidationError[],
): void {
  // Check color tokens
  if (rules.globalConstraints.colorsMustBeTokens) {
    const colorProp = props['color'] as string | undefined
    if (colorProp && typeof colorProp === 'string') {
      if (!VALID_COLORS.has(colorProp) && colorProp.startsWith('#')) {
        warnings.push({
          path: `${path}.props.color`,
          message: `Raw color value "${colorProp}" should be a token key. Valid: ${[...VALID_COLORS].slice(0, 10).join(', ')}...`,
          severity: 'warning',
          rule: 'token',
        })
      }
    }
  }

  // Check size tokens
  const sizeProp = props['size'] as string | undefined
  if (sizeProp && typeof sizeProp === 'string' && !VALID_SIZES.has(sizeProp)) {
    warnings.push({
      path: `${path}.props.size`,
      message: `Unknown size token "${sizeProp}". Valid: ${[...VALID_SIZES].join(', ')}`,
      severity: 'warning',
      rule: 'token',
    })
  }
}

function validateBinding(
  binding: PageSchemaTreeNode['binding'],
  path: string,
  dataSourceKeys: Set<string>,
  warnings: ValidationError[],
): void {
  if (!binding) return

  // Check dataSource references
  const dsKeys = ['dataSource', 'onChange', 'onClick', 'onSubmit', 'onConfirm'] as const
  for (const key of dsKeys) {
    const value = binding[key]
    if (value && typeof value === 'string' && dataSourceKeys.size > 0 && !dataSourceKeys.has(value)) {
      warnings.push({
        path: `${path}.binding.${key}`,
        message: `Binding references unknown data source "${value}". Available: ${[...dataSourceKeys].join(', ')}`,
        severity: 'warning',
        rule: 'binding',
      })
    }
  }

  // Check prefill references
  if (binding.prefill) {
    if (binding.prefill.dataSource && dataSourceKeys.size > 0 && !dataSourceKeys.has(binding.prefill.dataSource)) {
      warnings.push({
        path: `${path}.binding.prefill.dataSource`,
        message: `Prefill references unknown data source "${binding.prefill.dataSource}"`,
        severity: 'warning',
        rule: 'binding',
      })
    }
  }
}
