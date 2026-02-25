// ============================================================
// Token Resources — Design tokens (colors, spacing, radius, typography)
// ============================================================

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getTokenData, getTokenCategory } from '../loaders/index.js'

/**
 * Register 5 token resources:
 * - neuron://tokens/all        — All tokens combined
 * - neuron://tokens/colors     — Color tokens (gray, accent, semantic)
 * - neuron://tokens/spacing    — Spacing tokens (xs..4xl)
 * - neuron://tokens/radius     — Border radius tokens (sm..full)
 * - neuron://tokens/typography — Typography tokens (fontFamily + fontSize)
 */
export function registerTokenResources(server: McpServer) {
  server.resource(
    'tokens-all',
    'neuron://tokens/all',
    {
      description: 'All design tokens combined — colors (14 gray + 10 accent + 3 semantic), spacing, radius, and typography',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getTokenData(), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )

  server.resource(
    'tokens-colors',
    'neuron://tokens/colors',
    {
      description: 'Color tokens — 14-level warm gray scale, 10 accent colors, 3 semantic colors (error/warning/success)',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getTokenCategory('colors'), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )

  server.resource(
    'tokens-spacing',
    'neuron://tokens/spacing',
    {
      description: 'Spacing tokens — 10 values from 4px (xs) to 64px (4xl)',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getTokenCategory('spacing'), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )

  server.resource(
    'tokens-radius',
    'neuron://tokens/radius',
    {
      description: 'Border radius tokens — 5 values: sm (4px tags), md (8px inputs), lg (12px cards), xl (20px buttons), full (avatars)',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getTokenCategory('radius'), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )

  server.resource(
    'tokens-typography',
    'neuron://tokens/typography',
    {
      description: 'Typography tokens — Asul (English headings) + Swei Gothic CJK SC (Chinese body), 7 font sizes from 12px to 48px',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(getTokenCategory('typography'), null, 2),
          mimeType: 'application/json',
        },
      ],
    }),
  )
}
