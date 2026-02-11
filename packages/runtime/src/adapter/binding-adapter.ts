// ============================================================
// @neuron-ui/runtime - Binding Adapter
// Converts PageSchema binding protocol → flattened props for renderer
// ============================================================

import type { PageSchemaBinding } from '@neuron-ui/metadata'
import type { ActionSchema } from '../types'

/**
 * Binding protocol mapping:
 *
 * - binding.dataSource  → props.__dataPath: "/dataSources/{value}"
 * - binding.field       → props.__statePath: "/form/{value}"
 * - binding.onChange     → props.__onChange: { path: "/dataSources/{target}/params/{param}" }
 *     Format: "target.params.param" string parsed into path
 * - binding.onClick     → props.__action: ActionSchema { name: "openDialog", params: { target } }
 *     Format: "action:target" string parsed into action + params
 * - binding.onSubmit    → props.__action: ActionSchema { name: "submitForm", params: { api } }
 *     Format: "POST /api/..." string treated as API endpoint
 * - binding.onConfirm   → props.__action: ActionSchema { name: "deleteItem", params: { api, confirm: true } }
 *     Format: "DELETE /api/..." string treated as API endpoint with confirm flag
 * - binding.prefill     → props.__prefill: { dataSource, fieldMap }
 */

/**
 * Parse a dot-path like "list.params.keyword" into a JSON-pointer-style path
 * "/dataSources/list/params/keyword"
 */
function dotPathToDataSourcePath(dotPath: string): string {
  const segments = dotPath.split('.')
  return `/dataSources/${segments.join('/')}`
}

/**
 * Parse an onClick string value into an ActionSchema.
 *
 * Supported formats:
 *   "openDialog:create"      → { name: "openDialog", params: { target: "create" } }
 *   "navigate:/users/{id}"   → { name: "navigate", params: { path: "/users/{id}" } }
 *   "action"                 → { name: "action", params: {} }
 */
function parseClickAction(value: string): ActionSchema {
  const colonIndex = value.indexOf(':')
  if (colonIndex === -1) {
    return { name: value, params: {} }
  }
  const actionName = value.slice(0, colonIndex)
  const actionTarget = value.slice(colonIndex + 1)
  return { name: actionName, params: { target: actionTarget } }
}

/**
 * Parse an onSubmit string value (API endpoint) into an ActionSchema.
 *
 * Format: "POST /api/users" → { name: "submitForm", params: { api: "POST /api/users" } }
 */
function parseSubmitAction(value: string): ActionSchema {
  return { name: 'submitForm', params: { api: value } }
}

/**
 * Parse an onConfirm string value (API endpoint) into an ActionSchema.
 *
 * Format: "DELETE /api/users/{id}" → { name: "deleteItem", params: { api: "DELETE /api/users/{id}", confirm: true } }
 */
function parseConfirmAction(value: string): ActionSchema {
  return { name: 'deleteItem', params: { api: value, confirm: true } }
}

/**
 * Adapt a PageSchema binding object into flattened renderer props.
 *
 * Returns a Record of adapted prop keys (prefixed with `__`) that the
 * renderer and data/action context providers can interpret at runtime.
 */
export function adaptBinding(binding: PageSchemaBinding): Record<string, unknown> {
  const adapted: Record<string, unknown> = {}

  // dataSource → __dataPath
  if (binding.dataSource != null) {
    adapted.__dataPath = `/dataSources/${binding.dataSource}`
  }

  // field → __statePath
  if (binding.field != null) {
    adapted.__statePath = `/form/${binding.field}`
  }

  // onChange → __onChange
  if (binding.onChange != null) {
    adapted.__onChange = { path: dotPathToDataSourcePath(binding.onChange) }
  }

  // onClick → __action (click-based action)
  if (binding.onClick != null) {
    adapted.__action = parseClickAction(binding.onClick)
  }

  // onSubmit → __action (submit-based action, overrides onClick if both present)
  if (binding.onSubmit != null) {
    adapted.__action = parseSubmitAction(binding.onSubmit)
  }

  // onConfirm → __action (confirm-based action, overrides earlier __action)
  if (binding.onConfirm != null) {
    adapted.__action = parseConfirmAction(binding.onConfirm)
  }

  // prefill → __prefill (pass through as-is)
  if (binding.prefill != null) {
    adapted.__prefill = {
      dataSource: binding.prefill.dataSource,
      fieldMap: { ...binding.prefill.fieldMap },
    }
  }

  return adapted
}
