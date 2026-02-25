/**
 * Token generation script
 * Reads tokens.json and outputs:
 * - css/globals.css (complete entry point)
 * - css/colors.css, css/spacing.css, css/radius.css, css/typography.css
 * - src/colors.ts, src/spacing.ts, src/radius.ts, src/typography.ts, src/index.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const ROOT = resolve(import.meta.dirname, '..')
const tokens = JSON.parse(readFileSync(resolve(ROOT, 'tokens.json'), 'utf-8'))

// Gray keys in correct order (JS reorders numeric-looking keys)
const GRAY_KEYS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14']

function orderedEntries(obj: Record<string, unknown>, keys: string[]): [string, unknown][] {
  return keys.map((k) => [k, obj[k]])
}

// Ensure output directories exist
mkdirSync(resolve(ROOT, 'css'), { recursive: true })
mkdirSync(resolve(ROOT, 'src'), { recursive: true })

// ============================================================
// CSS Generation
// ============================================================

function generateColorsCss(): string {
  const lines: string[] = ['/* Auto-generated from tokens.json - DO NOT EDIT */']

  // Gray scale
  lines.push('')
  lines.push(':root {')
  lines.push('  /* Gray Scale (14 levels) */')
  for (const [key, token] of orderedEntries(tokens.colors.gray, GRAY_KEYS)) {
    const t = token as { value: string; cssVar: string }
    lines.push(`  ${t.cssVar}: ${t.value};`)
  }

  // Accent colors
  lines.push('')
  lines.push('  /* Accent Colors (10 variants) */')
  for (const [key, token] of Object.entries(tokens.colors.accent)) {
    const t = token as { value: string; cssVar: string }
    lines.push(`  ${t.cssVar}: ${t.value};`)
  }

  // Semantic colors
  lines.push('')
  lines.push('  /* Semantic Colors */')
  for (const [key, token] of Object.entries(tokens.colors.semantic)) {
    const t = token as { value: string; cssVar: string }
    lines.push(`  ${t.cssVar}: ${t.value};`)
  }

  lines.push('}')
  return lines.join('\n')
}

function generateSpacingCss(): string {
  const lines: string[] = ['/* Auto-generated from tokens.json - DO NOT EDIT */']
  lines.push('')
  lines.push(':root {')
  lines.push('  /* Spacing */')
  for (const [key, token] of Object.entries(tokens.spacing)) {
    const t = token as { value: string; cssVar: string }
    lines.push(`  ${t.cssVar}: ${t.value};`)
  }
  lines.push('}')
  return lines.join('\n')
}

function generateRadiusCss(): string {
  const lines: string[] = ['/* Auto-generated from tokens.json - DO NOT EDIT */']
  lines.push('')
  lines.push(':root {')
  lines.push('  /* Border Radius */')
  for (const [key, token] of Object.entries(tokens.radius)) {
    const t = token as { value: string; cssVar: string }
    lines.push(`  ${t.cssVar}: ${t.value};`)
  }
  lines.push('  --radius: 8px;')
  lines.push('}')
  return lines.join('\n')
}

function generateTypographyCss(): string {
  const { fontFamily, fontSize } = tokens.typography
  const lines: string[] = ['/* Auto-generated from tokens.json - DO NOT EDIT */']
  lines.push('')
  lines.push(':root {')
  lines.push('  /* Typography */')
  lines.push(`  --font-heading: '${fontFamily.heading}', serif;`)
  lines.push(`  --font-body: '${fontFamily.body}', ${fontFamily.fallback};`)
  lines.push('')
  for (const [key, token] of Object.entries(fontSize)) {
    const t = token as { value: string }
    lines.push(`  --font-size-${key}: ${t.value};`)
  }
  lines.push('}')
  return lines.join('\n')
}

function generateGlobalsCss(): string {
  const { fontFamily, fontSize } = tokens.typography

  return `/* Auto-generated from tokens.json - DO NOT EDIT */
@import "tailwindcss";

/* ================================================================
   FONT FACES
   ================================================================ */
@font-face {
  font-family: 'Swei Gothic CJK SC';
  src: url('https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.142/WebFont/CJK%20SC/SweiGothicCJKsc-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Swei Gothic CJK SC';
  src: url('https://cdn.jsdelivr.net/gh/max32002/swei-gothic@2.142/WebFont/CJK%20SC/SweiGothicCJKsc-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

/* ================================================================
   CSS VARIABLES
   ================================================================ */
:root {
  /* Gray Scale (14 级暖灰) */
${orderedEntries(tokens.colors.gray, GRAY_KEYS)
  .map(([, t]) => `  ${(t as { cssVar: string; value: string }).cssVar}: ${(t as { value: string }).value};`)
  .join('\n')}

  /* Accent Colors (10 种辅助色) */
${Object.entries(tokens.colors.accent)
  .map(([, t]) => `  ${(t as { cssVar: string; value: string }).cssVar}: ${(t as { value: string }).value};`)
  .join('\n')}

  /* Semantic Colors */
${Object.entries(tokens.colors.semantic)
  .map(([, t]) => `  ${(t as { cssVar: string; value: string }).cssVar}: ${(t as { value: string }).value};`)
  .join('\n')}

  /* shadcn 语义变量 → 暖灰色系映射 */
  --background: var(--gray-13);
  --foreground: var(--gray-01);
  --card: var(--gray-14);
  --card-foreground: var(--gray-01);
  --popover: var(--gray-14);
  --popover-foreground: var(--gray-01);
  --primary: var(--gray-01);
  --primary-foreground: var(--gray-14);
  --secondary: var(--gray-12);
  --secondary-foreground: var(--gray-02);
  --muted: var(--gray-12);
  --muted-foreground: var(--gray-05);
  --accent: var(--gray-11);
  --accent-foreground: var(--gray-01);
  --destructive: var(--color-error);
  --destructive-foreground: var(--gray-14);
  --border: var(--gray-09);
  --input: var(--gray-09);
  --ring: var(--gray-05);

  /* Spacing */
${Object.entries(tokens.spacing)
  .map(([, t]) => `  ${(t as { cssVar: string; value: string }).cssVar}: ${(t as { value: string }).value};`)
  .join('\n')}

  /* Border Radius */
${Object.entries(tokens.radius)
  .map(([, t]) => `  ${(t as { cssVar: string; value: string }).cssVar}: ${(t as { value: string }).value};`)
  .join('\n')}
  --radius: 8px;

  /* Typography */
  --font-heading: '${fontFamily.heading}', serif;
  --font-body: '${fontFamily.body}', ${fontFamily.fallback};
${Object.entries(fontSize)
  .map(([key, t]) => `  --font-size-${key}: ${(t as { value: string }).value};`)
  .join('\n')}
}

/* ================================================================
   TAILWIND v4: @theme inline — 注册 CSS 变量为 Tailwind 工具类
   ================================================================ */
@theme inline {
  /* shadcn 语义色 → Tailwind: bg-background, text-foreground, etc. */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* neuron 灰阶 → Tailwind: bg-gray-01, text-gray-05, etc. */
${GRAY_KEYS
  .map((key) => `  --color-gray-${key}: var(--gray-${key});`)
  .join('\n')}

  /* neuron 辅助色 → Tailwind: bg-accent-pink, text-accent-blue, etc. */
${Object.entries(tokens.colors.accent)
  .map(([key]) => `  --color-accent-${key}: var(--accent-${key});`)
  .join('\n')}

  /* 语义色 */
  --color-error: var(--color-error);
  --color-warning: var(--color-warning);
  --color-success: var(--color-success);

  /* 圆角 → Tailwind: rounded-sm, rounded-xl, etc. */
${Object.entries(tokens.radius)
  .map(([key]) => `  --radius-${key}: var(--radius-${key});`)
  .join('\n')}

  /* 字体 → Tailwind: font-heading, font-body */
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
}

/* ================================================================
   BASE STYLES
   ================================================================ */
* {
  border-color: var(--border);
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  line-height: 1.6;
}
`
}

// ============================================================
// TypeScript Generation
// ============================================================

function generateColorsTs(): string {
  const grayLines = GRAY_KEYS
    .map((k) => `    '${k}': '${tokens.colors.gray[k].value}'`)
    .join(',\n')
  const accentLines = Object.entries(tokens.colors.accent)
    .map(([k, t]) => `    '${k}': '${(t as { value: string }).value}'`)
    .join(',\n')
  const semanticLines = Object.entries(tokens.colors.semantic)
    .map(([k, t]) => `    '${k}': '${(t as { value: string }).value}'`)
    .join(',\n')

  return `// Auto-generated from tokens.json - DO NOT EDIT

export const colors = {
  gray: {
${grayLines},
  },
  accent: {
${accentLines},
  },
  semantic: {
${semanticLines},
  },
} as const

export type GrayScale = keyof typeof colors.gray
export type AccentColor = keyof typeof colors.accent
export type SemanticColor = keyof typeof colors.semantic
export type ColorToken = GrayScale | AccentColor | SemanticColor
`
}

function generateSpacingTs(): string {
  const spacing: Record<string, string> = {}
  for (const [key, token] of Object.entries(tokens.spacing)) {
    spacing[key] = (token as { value: string }).value
  }

  return `// Auto-generated from tokens.json - DO NOT EDIT

export const spacing = ${JSON.stringify(spacing, null, 2)} as const

export type SpacingToken = keyof typeof spacing
`
}

function generateRadiusTs(): string {
  const radius: Record<string, string> = {}
  for (const [key, token] of Object.entries(tokens.radius)) {
    radius[key] = (token as { value: string }).value
  }

  return `// Auto-generated from tokens.json - DO NOT EDIT

export const radius = ${JSON.stringify(radius, null, 2)} as const

export type RadiusToken = keyof typeof radius
`
}

function generateTypographyTs(): string {
  const { fontFamily, fontSize } = tokens.typography

  const fontSizes: Record<string, { value: string; weight: number; lineHeight: number }> = {}
  for (const [key, token] of Object.entries(fontSize)) {
    fontSizes[key] = token as { value: string; weight: number; lineHeight: number }
  }

  return `// Auto-generated from tokens.json - DO NOT EDIT

export const fontFamily = {
  heading: '${fontFamily.heading}',
  body: '${fontFamily.body}',
  fallback: '${fontFamily.fallback}',
} as const

export const fontSize = ${JSON.stringify(fontSizes, null, 2)} as const

export type FontSizeToken = keyof typeof fontSize
`
}

function generateIndexTs(): string {
  return `// Auto-generated from tokens.json - DO NOT EDIT

export { colors, type GrayScale, type AccentColor, type SemanticColor, type ColorToken } from './colors'
export { spacing, type SpacingToken } from './spacing'
export { radius, type RadiusToken } from './radius'
export { fontFamily, fontSize, type FontSizeToken } from './typography'
`
}

// ============================================================
// Write all files
// ============================================================

// CSS files
writeFileSync(resolve(ROOT, 'css/globals.css'), generateGlobalsCss())
writeFileSync(resolve(ROOT, 'css/colors.css'), generateColorsCss())
writeFileSync(resolve(ROOT, 'css/spacing.css'), generateSpacingCss())
writeFileSync(resolve(ROOT, 'css/radius.css'), generateRadiusCss())
writeFileSync(resolve(ROOT, 'css/typography.css'), generateTypographyCss())

// TypeScript files
writeFileSync(resolve(ROOT, 'src/colors.ts'), generateColorsTs())
writeFileSync(resolve(ROOT, 'src/spacing.ts'), generateSpacingTs())
writeFileSync(resolve(ROOT, 'src/radius.ts'), generateRadiusTs())
writeFileSync(resolve(ROOT, 'src/typography.ts'), generateTypographyTs())
writeFileSync(resolve(ROOT, 'src/index.ts'), generateIndexTs())

console.log('✅ Token generation complete:')
console.log('   CSS:  css/globals.css, colors.css, spacing.css, radius.css, typography.css')
console.log('   TS:   src/index.ts, colors.ts, spacing.ts, radius.ts, typography.ts')
