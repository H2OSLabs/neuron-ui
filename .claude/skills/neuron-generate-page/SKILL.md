---
name: neuron-generate-page
description: Generate neuron-ui Page Schema from arbitrary API lists and TaskCase descriptions. Use when users ask to create pages, generate UI from APIs, build CRUD/dashboard/detail pages, or convert API specs into visual interfaces. Triggers on requests like "generate a page for this API", "create a CRUD page", "build a dashboard from these endpoints", or any task requiring API-to-UI conversion using neuron-ui components.
---

# Neuron Generate Page

Read arbitrary API lists and TaskCase descriptions (any format), reference component-API mapping rules, and generate valid Page Schema JSON for the neuron-ui page builder.

## Workflow

```
1. Analyze API input    → Understand resources, endpoints, fields, types
2. Analyze TaskCase     → Understand page intent, user flows, required actions
3. Select page pattern  → Match to CRUD / Dashboard / Detail-with-tabs / custom
4. Map fields to components → Reference component-api-mapping rules
5. Generate Page Schema → Output valid JSON with component tree + data bindings
6. Validate output      → Check format, composition rules, binding completeness
```

## Step 1: Analyze API Input

Accept any format. Extract:
- **Resources**: What entities exist (e.g., "competition", "user")
- **Endpoints**: HTTP methods + paths (GET list, GET detail, POST, PUT, DELETE)
- **Fields**: Name, inferred type, constraints
- **Query params**: Filters, search, pagination

Field type inference from names:
| Name pattern | Inferred type |
|---|---|
| `*_at`, `*_date`, `created`, `updated` | date/datetime |
| `avatar`, `image`, `cover`, `logo`, `*_url` (image context) | string:image |
| `status`, `state`, `type`, `role`, `level` | string:enum |
| `description`, `content`, `bio`, `body` | string:long |
| `email`, `url`, `link`, `website` | string:url |
| `tags`, `labels`, `categories` | array:string |
| `is_*`, `has_*`, `enabled`, `active` | boolean |
| `price`, `amount`, `score`, `count` | number |
| `progress`, `completion`, `percentage`, `ratio` | number:percentage |

## Step 2: Analyze TaskCase

Accept any format (PRD, user story, one-liner). Extract:
- **Pages needed**: List page, detail page, etc.
- **User intent**: CRUD management, data viewing, analytics, auth
- **Required actions**: Create, edit, delete, filter, search, export
- **Priority**: Which page is primary

## Step 3: Select Page Pattern

Read [references/component-api-mapping.md](references/component-api-mapping.md) for full mapping rules.

Quick pattern selection:
| Signal | Pattern |
|---|---|
| Same resource has GET+POST+PUT+DELETE | CRUD (list + create dialog + edit sheet + delete confirm) |
| Multiple GET /stats endpoints | Dashboard (cards + charts + summary table) |
| GET /:id with many data dimensions | Detail-with-tabs (header card + tabbed content) |
| POST /auth, POST /login | Auth form (card + input + OTP) |

## Step 4: Map Fields to Components

For each field, determine display component (table columns, detail view) and input component (create/edit forms) using the mapping rules in `references/component-api-mapping.md`.

Key decision points:
- enum with <=5 options → NSelect or NRadioGroup; >5 → NCombobox
- array:string with <=10 options → NCheckbox; >10 → NCombobox(multiple)
- Create form → NDialog; Edit form → NSheet

## Step 5: Generate Page Schema

Output format:
```jsonc
{
  "version": "1.0.0",
  "page": { "id": "...", "name": "...", "generatedBy": "AI" },
  "dataSources": {
    "sourceKey": { "api": "GET /api/...", "params": {} }
  },
  "tree": [
    {
      "id": "unique-id",
      "component": "NComponentName",
      "props": { /* use Token keys, not raw values */ },
      "binding": { /* data bindings */ },
      "children": []
    }
  ]
}
```

### Binding protocol

| Binding type | Usage | Example |
|---|---|---|
| `dataSource` | Component reads from API | `"dataSource": "competitionList"` |
| `field` | Form input binds to request field | `"field": "name"` |
| `onChange` | Input change updates param | `"onChange": {"target": "list.params.keyword"}` |
| `onClick` | Click triggers action | `"onClick": {"action": "openDialog", "target": "create-dialog"}` |
| `onSubmit` | Form submit calls API | `"onSubmit": {"api": "POST /api/..."}` |
| `onConfirm` | Confirm calls API | `"onConfirm": {"api": "DELETE /api/.../{id}"}` |
| `prefill` | Edit form loads existing data | `"prefill": {"api": "GET /api/.../{id}"}` |

### Props constraints

- Use Token keys for colors: `"blue"`, `"pink"`, `"lime"` — never hex values
- Use Token keys for sizes: `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`
- Use Token keys for radius: `"sm"`, `"md"`, `"lg"`, `"xl"`

## Step 6: Validate

Before returning, verify:
1. All `component` values are valid neuron components (N-prefixed)
2. All `id` values are unique within the tree
3. All `dataSource` references exist in `dataSources`
4. All `binding.field` values match API fields
5. Component nesting follows composition rules (e.g., NField wraps input components)
6. No hardcoded color values in props

## CRUD Example (condensed)

For a "competition management" CRUD:
```
tree:
  NResizable (page root)
    NInputGroup (toolbar): NInput(search) + NSelect(filter) + NButton(create)
    NDataTable: columns mapped from fields, rowActions with NDropdownMenu
    NDialog (create): NField[] wrapping input components
    NSheet (edit): NField[] with prefill binding
    NAlertDialog (delete): confirm text + cancel/delete buttons
```

## Resources

### references/
- **component-api-mapping.md** — Complete field-type-to-component and API-pattern-to-page mapping rules. Always read this before generating.
