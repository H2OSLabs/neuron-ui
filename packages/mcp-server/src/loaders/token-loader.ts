// ============================================================
// Token Loader — Loads design tokens from @neuron-ui/tokens
// ============================================================

import { colors, spacing, radius, fontFamily, fontSize } from '@neuron-ui/tokens'

import type { TokenData } from '../types.js'

let _tokenData: TokenData | null = null

/**
 * Load and cache all design token data.
 */
export function getTokenData(): TokenData {
  if (!_tokenData) {
    _tokenData = {
      colors: {
        gray: { ...colors.gray },
        accent: { ...colors.accent },
        semantic: { ...colors.semantic },
      },
      spacing: { ...spacing },
      radius: { ...radius },
      typography: {
        fontFamily: { ...fontFamily },
        fontSize: { ...fontSize },
      },
    }
  }
  return _tokenData
}

/**
 * Get a specific category of tokens.
 */
export function getTokenCategory(category: 'colors' | 'spacing' | 'radius' | 'typography' | 'all') {
  const data = getTokenData()

  if (category === 'all') {
    return data
  }

  return { [category]: data[category] }
}
