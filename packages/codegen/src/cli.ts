#!/usr/bin/env node
// ============================================================
// @neuron-ui/codegen CLI — Generate .tsx source files from Page Schema
// ============================================================

import { Command } from 'commander'
import { generateCommand } from './commands/generate'

const program = new Command()
  .name('neuron-codegen')
  .description('Generate .tsx source files from Page Schema JSON')
  .version('0.1.0')

program
  .command('generate <schema>')
  .description('Generate React components from a Page Schema file')
  .option('--outdir <dir>', 'Output directory for generated files', './src/pages')
  .option(
    '--style <type>',
    'Hooks style: hooks | swr | react-query',
    'hooks',
  )
  .option(
    '--api-client <type>',
    'API client: fetch | axios | ky',
    'fetch',
  )
  .option('--dry-run', 'Preview generated files without writing to disk')
  .action(generateCommand)

program.parse()
