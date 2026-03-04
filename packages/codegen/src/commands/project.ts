// ============================================================
// Project Command — Orchestrates code generation from Project Schema
// ============================================================

import fs from 'fs/promises'
import path from 'path'
import type { ProjectSchema } from '@neuron-ui/metadata'
import type {
  ProjectGenerateOptions,
  ProjectGenerateResult,
  GeneratedFile,
  HooksStyle,
  ApiClientStyle,
} from '../types'
import { parseProjectSchemaFile } from '../utils/project-schema-parser'
import { formatCode } from '../utils/code-formatter'
import { toPageComponentName } from '../utils/naming'
import { generatePageComponent } from '../generators/page-generator'
import { generateHooksFile } from '../generators/hooks-generator'
import { generateTypesFile } from '../generators/types-generator'
import { generateRouterFile } from '../generators/router-generator'
import { generateLayoutFile } from '../generators/layout-generator'
import { generateAppFile } from '../generators/app-generator'

/**
 * CLI action handler for the `project` command.
 */
export async function projectCommand(
  schemaPath: string,
  opts: { outdir: string; style: string; apiClient: string; dryRun?: boolean },
): Promise<void> {
  const chalk = (await import('chalk')).default
  const ora = (await import('ora')).default

  const spinner = ora('Reading Project Schema...').start()

  try {
    const options: ProjectGenerateOptions = {
      schemaPath,
      outDir: opts.outdir,
      style: opts.style as HooksStyle,
      apiClient: opts.apiClient as ApiClientStyle,
      dryRun: opts.dryRun,
    }

    const result = await generateFromProjectSchema(options)

    spinner.succeed('Project code generation complete!')
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
    spinner.fail('Project code generation failed')
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n  ${(await import('chalk')).default.red('Error:')} ${message}`)
    process.exit(1)
  }
}

/**
 * Programmatic API for generating code from a Project Schema.
 */
export async function generateFromProjectSchema(
  options: ProjectGenerateOptions,
): Promise<ProjectGenerateResult> {
  const schema = await parseProjectSchemaFile(options.schemaPath)
  const files = await generateProjectFiles(schema, options)

  if (!options.dryRun) {
    await writeFiles(files, options.outDir)
  }

  return {
    files,
    dryRun: !!options.dryRun,
  }
}

/**
 * Generate all files for a Project Schema.
 */
async function generateProjectFiles(
  schema: ProjectSchema,
  options: ProjectGenerateOptions,
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = []

  // 1. Generate per-page files
  for (const page of schema.pages) {
    const pageName = toPageComponentName(page.page.name)
    const pageDir = `pages/${pageName}`

    // Page component
    const pageCode = generatePageComponent(page, options.style)
    const formattedPage = await formatCode(pageCode, 'babel-ts')
    files.push({
      path: `${pageDir}/${pageName}.tsx`,
      content: formattedPage,
      type: 'page',
    })

    // Hooks file
    const hooksCode = generateHooksFile(page, options.style, options.apiClient)
    const formattedHooks = await formatCode(hooksCode)
    files.push({
      path: `${pageDir}/${pageName}.hooks.ts`,
      content: formattedHooks,
      type: 'hooks',
    })

    // Types file
    const typesCode = generateTypesFile(page)
    const formattedTypes = await formatCode(typesCode)
    files.push({
      path: `${pageDir}/${pageName}.types.ts`,
      content: formattedTypes,
      type: 'types',
    })
  }

  // 2. Generate router
  const routerCode = generateRouterFile(schema)
  const formattedRouter = await formatCode(routerCode, 'babel-ts')
  files.push({
    path: 'routes.tsx',
    content: formattedRouter,
    type: 'router',
  })

  // 3. Generate layout
  const layoutCode = generateLayoutFile(schema)
  const formattedLayout = await formatCode(layoutCode, 'babel-ts')
  files.push({
    path: 'AppLayout.tsx',
    content: formattedLayout,
    type: 'layout',
  })

  // 4. Generate app entry
  const appCode = generateAppFile(schema)
  const formattedApp = await formatCode(appCode, 'babel-ts')
  files.push({
    path: 'App.tsx',
    content: formattedApp,
    type: 'app',
  })

  return files
}

/**
 * Write generated files to disk.
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
