// ============================================================
// @neuron-ui/runtime - Adapter Module Barrel Exports
// ============================================================

// Schema adapter: nested PageSchema → flat UITree
export {
  pageSchemaToUITree,
  extractComponentNames,
  VIRTUAL_ROOT_KEY,
  FRAGMENT_TYPE,
} from './schema-adapter'

// Binding adapter: PageSchema binding protocol → renderer props
export { adaptBinding } from './binding-adapter'

// Token adapter: design token keys → CSS values
export {
  resolveColorToken,
  resolveSpacingToken,
  resolveRadiusToken,
  resolveToken,
  resolveQualifiedToken,
} from './token-adapter'
