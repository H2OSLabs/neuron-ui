---
name: neuron-validate-schema
description: Validate neuron-ui Page Schema JSON against format, composition, binding, and token rules. Use when checking if a generated or manually-edited Page Schema is valid before loading into the page builder. Triggers on requests like "validate this page schema", "check my schema", "is this Page Schema correct", or automatically after neuron-generate-page produces output.
---

# Neuron Validate Schema

Validate Page Schema JSON to ensure it conforms to neuron-ui specifications before loading into the page builder.

## Validation Checks

Run all 6 checks in order. Report all errors, not just the first.

### 1. JSON Structure

- Valid JSON with no syntax errors
- Required top-level keys: `version`, `page`, `tree`
- `page` must have: `id` (string), `name` (string)
- `tree` must be a non-empty array
- `dataSources` (optional) must be an object if present

### 2. Node Structure

Every node in the tree must have:
- `id` — unique string, no duplicates across entire tree
- `component` — valid N-prefixed component name

Optional node fields:
- `props` — object
- `binding` — object
- `children` — array of nodes
- `slot` — string (for slot-based composition)

### 3. Component Validity

All component names must be from the neuron component set. Read [references/valid-components.md](references/valid-components.md) for the full list.

Quick reference — 53 valid components:
```
Data Display:  NText, NDataTable, NBadge, NAvatar, NCard, NProgress, NChart,
               NHoverCard, NAccordion, NCalendar, NCarousel, NTable,
               NTimeline, NCollapsible, NResizable
Data Input:    NInput, NTextarea, NSelect, NCombobox, NCheckbox, NRadioGroup,
               NSwitch, NSlider, NDatePicker, NInputOTP, NInputGroup,
               NField, NLabel
Action:        NButton, NDropdownMenu, NContextMenu
Container:     NDialog, NSheet, NDrawer, NAlertDialog, NTabs, NPopover, NTooltip
Feedback:      NToast, NAlert, NSkeleton
Navigation:    NBreadcrumb, NPagination, NCommand, NSidebar, NMenubar
Layout:        NScrollArea, NSeparator, NEmpty, NToggle, NToggleGroup, NAspectRatio
```

### 4. Composition Rules

Read [references/composition-rules.md](references/composition-rules.md) for detailed nesting constraints.

Key rules:
- NField must wrap exactly one input component (NInput, NTextarea, NSelect, NCombobox, NCheckbox, NRadioGroup, NSwitch, NSlider, NDatePicker, NInputOTP)
- NDialog/NSheet/NDrawer children should end with action NButton(s)
- NAlertDialog must have at least 2 NButton children (cancel + confirm)
- NDataTable should not be nested inside another NDataTable
- NDropdownMenu items need `label` and `action` in binding
- NTabs children should be tab content panels

### 5. Binding Integrity

- Every `dataSource` reference must exist in top-level `dataSources`
- Every `binding.field` should correspond to a real API field
- `onClick.target` must reference an existing node `id` in the tree
- `onSubmit.api` and `onConfirm.api` must be valid HTTP method + path
- `prefill.api` must be a GET endpoint

### 6. Token Compliance

- Color values in props must be Token keys: `blue`, `pink`, `lime`, `yellow`, `gray-01`..`gray-14`, not hex/rgb
- Size values must be Token keys: `xs`, `sm`, `md`, `lg`, `xl`
- No hardcoded pixel values for standard dimensions (use Token sizes)
- Font sizes must use Token keys: `caption`, `body`, `heading`, `display`

## Error Report Format

```jsonc
{
  "valid": false,
  "errors": [
    { "check": "composition", "nodeId": "f-name", "message": "NField must wrap exactly one input component, found 0" },
    { "check": "binding", "nodeId": "data-table", "message": "dataSource 'userList' not found in dataSources" },
    { "check": "token", "nodeId": "create-btn", "message": "Color '#BEF1FF' is a raw value, use Token key 'blue' instead" }
  ],
  "warnings": [
    { "check": "composition", "nodeId": "delete-dialog", "message": "NAlertDialog has only 1 button, recommend cancel + confirm" }
  ]
}
```

## Auto-fix Suggestions

For common errors, suggest fixes:

| Error | Auto-fix |
|---|---|
| Raw hex color | → Nearest Token key |
| Missing NField wrapper | → Wrap input in NField |
| Duplicate node id | → Append `-2`, `-3` suffix |
| Missing dataSource | → Add stub to `dataSources` |
| NAlertDialog with 1 button | → Add cancel button |

## Resources

### references/
- **valid-components.md** — Complete list of 53 valid neuron component names.
- **composition-rules.md** — Detailed component nesting and slot rules.
