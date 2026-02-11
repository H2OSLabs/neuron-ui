// ============================================================
// @neuron-ui/runtime - Token Adapter
// Converts design token keys → CSS variable values
// ============================================================

import { colors, spacing, radius } from '@neuron-ui/tokens'

// ---- Internal lookup maps ----

/**
 * Flattened color map: merges gray, accent, and semantic sub-maps
 * into a single key → hex-value lookup.
 *
 * Gray keys: '01'..'14'
 * Accent keys: 'pink', 'pink-light', 'yellow', 'yellow-bright', 'lime',
 *              'lime-light', 'green', 'blue', 'purple', 'lavender'
 * Semantic keys: 'error', 'warning', 'success'
 */
const colorMap: Record<string, string> = {
  ...colors.gray,
  ...colors.accent,
  ...colors.semantic,
}

/** Spacing map: 'xs' → '4px', 'sm' → '8px', etc. */
const spacingMap: Record<string, string> = { ...spacing }

/** Radius map: 'sm' → '4px', 'md' → '8px', etc. */
const radiusMap: Record<string, string> = { ...radius }

// ---- Public API ----

/**
 * Resolve a color token key to its hex value.
 *
 * Supports all three color groups:
 * - Gray scale: '01' through '14'
 * - Accent: 'pink', 'blue', 'purple', etc.
 * - Semantic: 'error', 'warning', 'success'
 *
 * @example
 * resolveColorToken('blue')    // → '#BEF1FF'
 * resolveColorToken('01')      // → '#5F5D57'
 * resolveColorToken('error')   // → '#E67853'
 * resolveColorToken('unknown') // → undefined
 */
export function resolveColorToken(key: string): string | undefined {
  return colorMap[key]
}

/**
 * Resolve a spacing token key to its CSS value.
 *
 * @example
 * resolveSpacingToken('xs')  // → '4px'
 * resolveSpacingToken('md')  // → '16px'
 * resolveSpacingToken('4xl') // → '64px'
 */
export function resolveSpacingToken(key: string): string | undefined {
  return spacingMap[key]
}

/**
 * Resolve a border-radius token key to its CSS value.
 *
 * @example
 * resolveRadiusToken('sm')   // → '4px'
 * resolveRadiusToken('xl')   // → '20px'
 * resolveRadiusToken('full') // → '9999px'
 */
export function resolveRadiusToken(key: string): string | undefined {
  return radiusMap[key]
}

/**
 * Resolve any token by category and key.
 *
 * This is the unified entry point for token resolution, dispatching
 * to the appropriate category-specific resolver.
 *
 * @example
 * resolveToken('color', 'blue')    // → '#BEF1FF'
 * resolveToken('spacing', 'md')    // → '16px'
 * resolveToken('radius', 'lg')     // → '12px'
 * resolveToken('color', 'invalid') // → undefined
 */
export function resolveToken(
  category: 'color' | 'spacing' | 'radius',
  key: string,
): string | undefined {
  switch (category) {
    case 'color':
      return resolveColorToken(key)
    case 'spacing':
      return resolveSpacingToken(key)
    case 'radius':
      return resolveRadiusToken(key)
  }
}

/**
 * Resolve a token with a qualified key format "category.key".
 *
 * @example
 * resolveQualifiedToken('color.blue')   // → '#BEF1FF'
 * resolveQualifiedToken('spacing.md')   // → '16px'
 * resolveQualifiedToken('radius.full')  // → '9999px'
 * resolveQualifiedToken('invalid')      // → undefined
 */
export function resolveQualifiedToken(qualifiedKey: string): string | undefined {
  const dotIndex = qualifiedKey.indexOf('.')
  if (dotIndex === -1) return undefined

  const category = qualifiedKey.slice(0, dotIndex) as 'color' | 'spacing' | 'radius'
  const key = qualifiedKey.slice(dotIndex + 1)

  if (category !== 'color' && category !== 'spacing' && category !== 'radius') {
    return undefined
  }

  return resolveToken(category, key)
}
