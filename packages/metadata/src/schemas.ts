// ============================================================
// Zod validation schemas for Page JSON types
// ============================================================

import { z } from 'zod'
import type { PageSchemaTreeNode } from './types'

// ---- Event Action Schema ----

export const navigateActionSchema = z.object({
  action: z.literal('navigate'),
  target: z.string(),
  params: z.record(z.string()).optional(),
})

export const callApiActionSchema = z.object({
  action: z.literal('callApi'),
  target: z.string(),
  merge: z.enum(['params', 'body']).optional(),
  onSuccess: z.string().optional(),
  onError: z.string().optional(),
})

export const refreshActionSchema = z.object({
  action: z.literal('refresh'),
  target: z.string(),
})

export const showActionSchema = z.object({
  action: z.literal('show'),
  target: z.string(),
})

export const hideActionSchema = z.object({
  action: z.literal('hide'),
  target: z.string(),
})

export const updateStateActionSchema = z.object({
  action: z.literal('updateState'),
  key: z.string(),
  value: z.any(),
})

export const eventActionSchema = z.discriminatedUnion('action', [
  navigateActionSchema,
  callApiActionSchema,
  refreshActionSchema,
  showActionSchema,
  hideActionSchema,
  updateStateActionSchema,
])

// ---- Page Schema Binding Schema ----

export const pageSchemaBindingSchema = z.object({
  dataSource: z.string().optional(),
  field: z.string().optional(),
  onChange: z.string().optional(),
  onClick: z.string().optional(),
  onSubmit: z.string().optional(),
  onConfirm: z.string().optional(),
  prefill: z.object({
    dataSource: z.string(),
    fieldMap: z.record(z.string()),
  }).optional(),
  fieldMap: z.record(z.string()).optional(),
})

// ---- Page Schema Tree Node Schema ----

export const pageSchemaTreeNodeSchema = z.lazy(() =>
  z.object({
    id: z.string(),
    component: z.string(),
    props: z.record(z.unknown()).optional(),
    domAttr: z.string().optional(),
    events: z.record(eventActionSchema).optional(),
    binding: pageSchemaBindingSchema.optional(),
    children: z.array(pageSchemaTreeNodeSchema).optional(),
  }),
) as z.ZodType<PageSchemaTreeNode>
