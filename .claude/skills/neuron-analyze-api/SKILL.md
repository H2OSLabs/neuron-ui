---
name: neuron-analyze-api
description: Analyze arbitrary-format API lists and extract structured understanding for neuron-ui page generation. Use when users provide API documentation in any format (Swagger/OpenAPI, Postman collections, cURL commands, text descriptions, tables, screenshots) and need it analyzed before page generation. Triggers on requests like "analyze this API", "understand these endpoints", "what pages can I build from this API", or when preparing API context for the neuron-generate-page skill.
---

# Neuron Analyze API

Parse and understand API documentation in any format, producing a structured analysis that feeds into page generation.

## Workflow

```
1. Detect input format   → Swagger? Postman? Text? Table? cURL?
2. Extract resources     → Group endpoints by resource entity
3. Extract endpoints     → Method, path, summary per endpoint
4. Extract fields        → Field name, type, constraints per resource
5. Infer field types     → Map to neuron field type system
6. Detect API patterns   → CRUD? Stats? Auth? Custom?
7. Output structured analysis
```

## Input Format Detection

No parsing required — just understand the content. Supported inputs:

| Format | Recognition signal |
|---|---|
| Swagger/OpenAPI JSON/YAML | `"openapi"`, `"swagger"`, `"paths"` keys |
| Postman Collection | `"info"`, `"item"` keys, or tree-like endpoint listing |
| cURL commands | Lines starting with `curl` |
| Text description | Natural language describing endpoints and fields |
| Table/spreadsheet | Columns like Method, Path, Description |
| Screenshot/image | Visual API documentation |

## Field Type Inference

Map discovered fields to neuron's type system:

### From explicit schema (Swagger/Postman)
```
type: string               → string
type: string + format:date → date
type: string + enum:[...]  → string:enum
type: integer/number       → number
type: boolean              → boolean
type: array + items:string → array:string
type: array + items:object → array:object
type: object               → object:nested
```

### From field names (text/informal descriptions)
Read [references/field-inference-rules.md](references/field-inference-rules.md) for complete inference table.

Quick reference:
- `*_at`, `*_date`, `created_at` → date/datetime
- `avatar`, `image`, `cover` → string:image
- `status`, `type`, `role` → string:enum (find possible values from context)
- `description`, `content`, `body` → string:long
- `tags`, `labels` → array:string
- `is_*`, `has_*` → boolean
- `*_id` (referencing another resource) → object:user or object:nested

## API Pattern Detection

After extracting all endpoints for a resource, detect the pattern:

```
CRUD pattern:
  GET  /resources       (list)     ─┐
  GET  /resources/:id   (detail)    ├── All present → CRUD
  POST /resources       (create)    │
  PUT  /resources/:id   (update)    │
  DELETE /resources/:id (delete)   ─┘

Stats/Dashboard pattern:
  GET /stats            ─┐
  GET /analytics         ├── Multiple read-only aggregate endpoints → Dashboard
  GET /summary          ─┘

Auth pattern:
  POST /login           ─┐
  POST /register         ├── Auth-related endpoints → Auth form
  POST /verify-otp      ─┘

Partial CRUD:
  Missing DELETE → No delete confirm
  Missing PUT   → No edit form (read-only detail)
  Only GET list → Read-only list page
```

## Output Format

Produce a structured analysis:

```jsonc
{
  "resources": [
    {
      "name": "competition",
      "displayName": "赛事",
      "endpoints": [
        { "method": "GET", "path": "/api/competitions", "type": "list", "queryParams": ["status", "keyword", "page"] },
        { "method": "POST", "path": "/api/competitions", "type": "create" },
        { "method": "GET", "path": "/api/competitions/:id", "type": "detail" },
        { "method": "PUT", "path": "/api/competitions/:id", "type": "update" },
        { "method": "DELETE", "path": "/api/competitions/:id", "type": "delete" }
      ],
      "fields": [
        { "name": "name", "type": "string", "required": true },
        { "name": "description", "type": "string:long" },
        { "name": "status", "type": "string:enum", "options": ["draft", "active", "ended"] },
        { "name": "cover", "type": "string:image" },
        { "name": "prize", "type": "number" },
        { "name": "start_date", "type": "date" },
        { "name": "tags", "type": "array:string" },
        { "name": "created_by", "type": "object:user" }
      ],
      "pattern": "crud"
    }
  ]
}
```

This output is consumed by the `neuron-generate-page` skill to generate Page Schema.

## Resources

### references/
- **field-inference-rules.md** — Complete field name pattern → neuron type inference rules with examples.
