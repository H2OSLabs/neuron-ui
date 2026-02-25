// ============================================================
// Generate Command — Orchestrates code generation from Page Schema
// ============================================================

import fs from 'fs/promises'
import path from 'path'
import type { PageSchema } from '@neuron-ui/metadata'
import type {
  GenerateOptions,
  GenerateResult,
  GeneratedFile,
  HooksStyle,
  ApiClientStyle,
} from '../types'
import { parseSchemaFile } from '../utils/schema-parser'
import { formatCode } from '../utils/code-formatter'
import { toPageComponentName } from '../utils/naming'
import { generatePageComponent } from '../generators/page-generator'
import { generateHooksFile } from '../generators/hooks-generator'
import { generateTypesFile } from '../generators/types-generator'

/**
 * CLI action handler for the `generate` command.
 * Called by commander with parsed arguments.
 */
export async function generateCommand(
  schemaPath: string,
  opts: { outdir: string; style: string; apiClient: string; dryRun?: boolean },
): Promise<void> {
  // Dynamic imports for ESM-only packages
  const chalk = (await import('chalk')).default
  const ora = (await import('ora')).default

  const spinner = ora('Reading Page Schema...').start()

  try {
    const options: GenerateOptions = {
      schemaPath,
      outDir: opts.outdir,
      style: opts.style as HooksStyle,
      apiClient: opts.apiClient as ApiClientStyle,
      dryRun: opts.dryRun,
    }

    const result = await generateFromSchema(options)

    spinner.succeed('Code generation complete!')
    console.log('')

    if (result.dryRun) {
      console.log(chalk.yellow('Dry run — files not written to disk:'))
      console.log('')
    }

    for (const file of result.files) {
      const label = result.dryRun ? chalk.dim('[dry-run]') : chalk.green('[created]')
      console.log(`  ${label} ${chalk.bold(file.path)} ${chalk.dim(`(${file.type})`)}`)

      if (result.dryRun) {
        console.log('')
        console.log(chalk.dim('─'.repeat(60)))
        console.log(file.content)
        console.log(chalk.dim('─'.repeat(60)))
        console.log('')
      }
    }

    console.log('')
    console.log(
      `  ${chalk.cyan('Total:')} ${result.files.length} file${result.files.length === 1 ? '' : 's'} generated`,
    )
  } catch (err) {
    spinner.fail('Code generation failed')
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n  ${(await import('chalk')).default.red('Error:')} ${message}`)
    process.exit(1)
  }
}

/**
 * Programmatic API for generating code from a Page Schema.
 * Can be used by the CLI or imported directly.
 */
export async function generateFromSchema(
  options: GenerateOptions,
): Promise<GenerateResult> {
  const schema = await parseSchemaFile(options.schemaPath)
  const files = await generateFiles(schema, options)

  if (!options.dryRun) {
    await writeFiles(files, options.outDir)
  }

  return {
    files,
    dryRun: !!options.dryRun,
  }
}

/**
 * Generate all files for a Page Schema (without writing to disk).
 */
async function generateFiles(
  schema: PageSchema,
  options: GenerateOptions,
): Promise<GeneratedFile[]> {
  const pageName = toPageComponentName(schema.page.name)
  const files: GeneratedFile[] = []

  // 1. Generate page component
  const pageCode = generatePageComponent(schema, options.style)
  const formattedPage = await formatCode(pageCode, 'babel-ts')
  files.push({
    path: `${pageName}.tsx`,
    content: formattedPage,
    type: 'page',
  })

  // 2. Generate hooks file
  const hooksCode = generateHooksFile(schema, options.style, options.apiClient)
  const formattedHooks = await formatCode(hooksCode)
  files.push({
    path: `${pageName}.hooks.ts`,
    content: formattedHooks,
    type: 'hooks',
  })

  // 3. Generate types file
  const typesCode = generateTypesFile(schema)
  const formattedTypes = await formatCode(typesCode)
  files.push({
    path: `${pageName}.types.ts`,
    content: formattedTypes,
    type: 'types',
  })

  return files
}

/**
 * Write generated files to disk, creating directories as needed.
 */
async function writeFiles(
  files: GeneratedFile[],
  outDir: string,
): Promise<void> {
  const resolved = path.resolve(outDir)
  await fs.mkdir(resolved, { recursive: true })

  for (const file of files) {
    const filePath = path.join(resolved, file.path)
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(filePath, file.content, 'utf-8')
  }
}
