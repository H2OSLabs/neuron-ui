// ============================================================
// neuron-ui Metadata TypeScript Types
// ============================================================

// ---- Design Token Keys ----

export type GrayScale =
  | '01' | '02' | '03' | '04' | '05' | '06' | '07'
  | '08' | '09' | '10' | '11' | '12' | '13' | '14'

export type AccentColor =
  | 'pink' | 'pink-light' | 'yellow' | 'yellow-bright' | 'lime'
  | 'lime-light' | 'green' | 'blue' | 'purple' | 'lavender'

export type SemanticColor = 'error' | 'warning' | 'success'

export type SpacingToken = '4' | '8' | '12' | '16' | '20' | '24' | '32' | '36' | '48' | '64'

export type RadiusToken = 'xs' | 'sm' | 'md' | 'lg' | 'full'

export type FontSizeToken = 'display' | 'heading' | 'subheading' | 'section' | 'body-lg' | 'body' | 'caption'

// ---- Component Manifest Types ----

export type ComponentCategory =
  | 'display'
  | 'input'
  | 'action'
  | 'container'
  | 'feedback'
  | 'navigation'
  | 'layout'

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiRole = 'primary' | 'auxiliary' | 'submit' | 'save' | 'trigger'
  | 'create-modal' | 'edit-modal' | 'confirm-modal'
  | 'create-panel' | 'edit-panel'
  | 'success-feedback'

export interface ComponentManifestEntry {
  /** Component name (N-prefixed) */
  name: string
  /** Bilingual display name */
  displayName: string
  /** Component description */
  description: string
  /** Component category */
  category: ComponentCategory
  /** Import path */
  importPath: string
  /** Path to JSON Schema file */
  schemaPath: string
  /** Available variants */
  variants: string[]
  /** Available sizes */
  sizes: string[]
  /** Prop names */
  props: string[]
  /** Slot names */
  slots: string[]
  /** Which components can be parents */
  canBeChildOf: string[]
  /** Which components can be children */
  canContain: string[]
  /** API interaction role mapping */
  apiRole: Partial<Record<ApiMethod, ApiRole>>
  /** Whether this can be a root container */
  isRootContainer?: boolean
  /** Additional constraints */
  constraints?: Record<string, unknown>
}

export interface ComponentManifest {
  version: string
  totalComponents: number
  categories: Record<ComponentCategory, string>
  components: ComponentManifestEntry[]
}

// ---- Component-API Mapping Types ----

export interface FieldTypeRule {
  /** Target component name */
  component: string
  /** Optional wrapper component */
  wrapper?: string
  /** Default props to apply */
  props: Record<string, unknown>
  /** Human-readable description */
  description?: string
  /** Additional notes */
  note?: string
  /** Alternative component */
  alternativeComponent?: string
  /** Alternative usage note */
  alternativeNote?: string
}

export interface ApiPatternRule {
  /** Page pattern identifier */
  pagePattern: string
  /** Primary component for this pattern */
  primaryComponent: string
  /** Supporting components */
  supportComponents: string[]
  /** Human-readable description */
  description: string
}

export interface CompositePatternLayout {
  [sectionName: string]: {
    component?: string
    components?: string[]
    role: string
    children?: string[]
  }
}

export interface CompositePattern {
  description: string
  requiredApis: string[]
  layout: CompositePatternLayout
}

export interface ComponentApiMapping {
  version: string
  fieldTypeMapping: {
    display: Record<string, FieldTypeRule>
    input: Record<string, FieldTypeRule>
  }
  decisionTree: {
    description: string
    display: Array<{ condition: string; component: string; note: string }>
    input: Array<{ condition: string; component: string; note: string }>
  }
  apiPatternMapping: Record<string, ApiPatternRule>
  compositePatterns: Record<string, CompositePattern>
}

// ---- Composition Rules Types ----

export interface CompositionRule {
  /** Parent component name */
  parent: string
  /** Allowed children component names */
  allowedChildren: string[]
  /** Additional constraints */
  constraints?: Record<string, unknown>
}

export interface GlobalConstraints {
  colorsMustBeTokens: boolean
  spacingMustBeTokens: boolean
  maxNestingDepth: number
  rootContainers: string[]
}

export interface CompositionRules {
  version: string
  rules: CompositionRule[]
  globalConstraints: GlobalConstraints
}

// ---- Page Schema Types ----

export interface PageSchemaDataSource {
  /** API endpoint (e.g. "GET /api/users") */
  api: string
  /** HTTP method */
  method?: ApiMethod
  /** Query parameters */
  params?: Record<string, unknown>
  /** Request body */
  body?: Record<string, unknown>
  /** Response data transform expression */
  transform?: string
  /** Auto-fetch on mount */
  autoFetch?: boolean
}

export interface PageSchemaBinding {
  /** Data source key */
  dataSource?: string
  /** Field path in data source response */
  field?: string
  /** Data source to trigger on change */
  onChange?: string
  /** Data source to trigger on click */
  onClick?: string
  /** Data source to trigger on submit */
  onSubmit?: string
  /** Data source to trigger on confirm */
  onConfirm?: string
  /** Prefill configuration for edit forms */
  prefill?: {
    dataSource: string
    fieldMap: Record<string, string>
  }
}

export interface PageSchemaTreeNode {
  /** Unique node ID */
  id: string
  /** Component name (N-prefixed) */
  component: string
  /** Static props */
  props?: Record<string, unknown>
  /** Data binding configuration */
  binding?: PageSchemaBinding
  /** Child nodes */
  children?: PageSchemaTreeNode[]
}

export interface PageSchemaPage {
  /** Page unique ID */
  id: string
  /** Page name */
  name: string
  /** Page description */
  description?: string
  /** Route path */
  route?: string
}

export interface PageSchema {
  /** Schema version */
  version: string
  /** Page metadata */
  page: PageSchemaPage
  /** Data sources */
  dataSources?: Record<string, PageSchemaDataSource>
  /** Component tree */
  tree: PageSchemaTreeNode[]
}

// ---- Validation Types ----

export interface ValidationError {
  /** Error path (e.g. "tree[0].children[1].component") */
  path: string
  /** Error message */
  message: string
  /** Error severity */
  severity: 'error' | 'warning'
  /** Error rule */
  rule: 'format' | 'component' | 'props' | 'nesting' | 'binding' | 'token'
}

export interface ValidationResult {
  /** Whether the schema is valid */
  valid: boolean
  /** List of validation errors */
  errors: ValidationError[]
  /** List of validation warnings */
  warnings: ValidationError[]
}
