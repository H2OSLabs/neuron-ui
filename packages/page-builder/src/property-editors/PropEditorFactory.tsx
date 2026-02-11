// ============================================================
// PropEditorFactory — Selects the right editor based on prop type
// Uses propEditorMap from editor-types.json to determine editor type
// ============================================================

import { TextInput } from './TextInput'
import { NumberInput } from './NumberInput'
import { SwitchEditor } from './SwitchEditor'
import { SelectEditor } from './SelectEditor'
import { TokenColorSelect } from './TokenColorSelect'
import editorTypesData from '@neuron-ui/metadata/builder-registry/editor-types.json'

export interface PropEditorFactoryProps {
  propKey: string
  value: unknown
  onChange: (value: unknown) => void
  /** For enum types, available options */
  options?: string[]
}

// Map from prop key name to its editor type string (e.g., "string", "string:enum", "boolean")
const propEditorMap: Record<string, string> = editorTypesData.propEditorMap

// Known enum options for common props (used when component-level schema is not available)
const KNOWN_ENUM_OPTIONS: Record<string, string[]> = {
  variant: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
  size: ['sm', 'md', 'lg', 'xl'],
  side: ['top', 'right', 'bottom', 'left'],
  orientation: ['horizontal', 'vertical'],
  type: ['bar', 'line', 'pie', 'area', 'scatter', 'single', 'multiple'],
}

/**
 * Resolves the editor type for a given prop key.
 * Falls back to inferring from value type if not in propEditorMap.
 */
function resolveEditorType(propKey: string, value: unknown): string {
  // Check explicit mapping first
  if (propEditorMap[propKey]) {
    return propEditorMap[propKey]
  }

  // Infer from value type
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (Array.isArray(value)) return 'array:items'
  if (typeof value === 'object' && value !== null) return 'object:binding'
  return 'string'
}

export function PropEditorFactory({ propKey, value, onChange, options }: PropEditorFactoryProps) {
  const editorType = resolveEditorType(propKey, value)

  switch (editorType) {
    case 'string':
    case 'string:css':
      return (
        <TextInput
          label={propKey}
          value={String(value ?? '')}
          onChange={(v) => onChange(v)}
        />
      )

    case 'string:long':
      return (
        <TextInput
          label={propKey}
          value={String(value ?? '')}
          onChange={(v) => onChange(v)}
          multiline
        />
      )

    case 'string:enum': {
      const enumOptions = options ?? KNOWN_ENUM_OPTIONS[propKey] ?? []
      // If we have no options, fall back to text input
      if (enumOptions.length === 0) {
        return (
          <TextInput
            label={propKey}
            value={String(value ?? '')}
            onChange={(v) => onChange(v)}
          />
        )
      }
      return (
        <SelectEditor
          label={propKey}
          value={String(value ?? '')}
          options={enumOptions}
          onChange={(v) => onChange(v)}
        />
      )
    }

    case 'string:color':
      return (
        <TokenColorSelect
          label={propKey}
          value={String(value ?? '')}
          onChange={(v) => onChange(v)}
        />
      )

    case 'string:icon':
      // Icon picker is complex; fall back to text input for now
      return (
        <TextInput
          label={propKey}
          value={String(value ?? '')}
          onChange={(v) => onChange(v)}
        />
      )

    case 'number':
    case 'number:slider':
      return (
        <NumberInput
          label={propKey}
          value={typeof value === 'number' ? value : 0}
          onChange={(v) => onChange(v)}
        />
      )

    case 'boolean':
      return (
        <SwitchEditor
          label={propKey}
          value={!!value}
          onChange={(v) => onChange(v)}
        />
      )

    case 'array:items':
    case 'array:columns': {
      // Simple JSON editor for array types
      const jsonStr = JSON.stringify(value ?? [], null, 2)
      return (
        <TextInput
          label={propKey}
          value={jsonStr}
          onChange={(v) => {
            try {
              onChange(JSON.parse(v))
            } catch {
              // Keep the string as-is if invalid JSON
            }
          }}
          multiline
        />
      )
    }

    case 'object:binding': {
      // Simple JSON editor for object types
      const objStr = JSON.stringify(value ?? {}, null, 2)
      return (
        <TextInput
          label={propKey}
          value={objStr}
          onChange={(v) => {
            try {
              onChange(JSON.parse(v))
            } catch {
              // Keep the string as-is if invalid JSON
            }
          }}
          multiline
        />
      )
    }

    default:
      return (
        <TextInput
          label={propKey}
          value={String(value ?? '')}
          onChange={(v) => onChange(v)}
        />
      )
  }
}
