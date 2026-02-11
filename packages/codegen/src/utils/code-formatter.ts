// ============================================================
// Code Formatter — Prettier-based source code formatting
// ============================================================

import prettier from 'prettier'

/**
 * Format TypeScript/TSX source code using Prettier.
 */
export async function formatCode(code: string, parser: 'typescript' | 'babel-ts' = 'typescript'): Promise<string> {
  return prettier.format(code, {
    parser,
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 2,
    arrowParens: 'always',
    jsxSingleQuote: false,
  })
}
