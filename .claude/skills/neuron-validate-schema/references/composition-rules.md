# Component Composition Rules

## Nesting Constraints

### NField (form field wrapper)
- **Must** wrap exactly 1 input component as child
- Valid children: NInput, NTextarea, NSelect, NCombobox, NCheckbox, NRadioGroup, NSwitch, NSlider, NDatePicker, NInputOTP
- **Must not** nest NField inside NField
- NField itself can optionally contain NLabel as first child

### NDialog / NSheet / NDrawer (form containers)
- Children should be NField[] followed by action NButton(s)
- Last child(ren) should be NButton for submit/cancel actions
- Maximum 3 action buttons (typically: cancel + submit, or cancel + secondary + submit)
- NDialog: centered modal, best for create forms
- NSheet: side panel, best for edit forms
- NDrawer: bottom/side drawer, alternative to NSheet

### NAlertDialog (confirmation)
- **Must** have at least 1 NText child (confirmation message)
- **Must** have at least 2 NButton children (cancel + confirm)
- Confirm button should have `variant: "destructive"` or `color: "pink"` for delete actions
- Cancel button should have neutral styling (no color)

### NDataTable (data table)
- **Must not** nest NDataTable inside NDataTable
- Should have `binding.dataSource` referencing a valid data source
- Should have `binding.columns` array defining column mappings
- Row actions via `binding.rowActions` with NDropdownMenu or NContextMenu
- Can contain NPagination as sibling (not child)

### NTabs (tabbed content)
- Children represent tab panels
- Each child should have a `slot` prop naming the tab
- Tab content can contain any component

### NInputGroup
- Groups multiple input-related components horizontally or vertically
- Valid children: NInput, NSelect, NCombobox, NButton, NDatePicker
- Used for toolbar layouts (search + filter + action)

### NCard
- Can contain virtually any component as children
- Common slots: "header", "body", "footer", "media", "badges"
- Children with `slot` prop get placed in corresponding card area

### NAccordion
- Children are accordion items
- Each item should have a title and content area
- Content can contain any component

## Siblings Constraints

### NDataTable + NPagination
- NPagination should be a sibling after NDataTable, not a child
- Both should reference the same `dataSource`

### NButton groups
- Action buttons in a row should be wrapped in a container (NInputGroup or plain frame)
- Primary action button should come last (rightmost)
- Destructive buttons should use `color: "pink"` or `variant: "destructive"`

## Slot Rules

### NCard slots
| Slot | Expected components |
|---|---|
| header | NText (title), NBadge, NAvatar |
| body | NText, any display component |
| footer | NButton, NText (meta info) |
| media | Image URL (string:image field) |
| badges | NBadge (one or more) |

### NDialog/NSheet slots
| Slot | Expected components |
|---|---|
| (default) | NField[] (form fields) |
| actions | NButton[] (submit/cancel) |

## Anti-patterns (errors)

| Pattern | Error |
|---|---|
| NDataTable > NDataTable | Nested data tables |
| NField > NField | Nested form fields |
| NDialog > NDialog | Nested dialogs |
| NAlertDialog with 0-1 buttons | Missing cancel or confirm |
| Input component without NField wrapper (in forms) | Unwrapped form input |
| NButton as only child of NDataTable | Button should be in toolbar, not table |
| NText wrapping NText | Redundant nesting |

## Warnings (not errors, but suboptimal)

| Pattern | Warning |
|---|---|
| NDialog with >10 fields | Consider splitting into sections or using NTabs |
| NDataTable without NPagination | Large datasets may need pagination |
| NSheet without prefill binding | Edit forms typically need data prefill |
| Form without any required field | Consider marking key fields as required |
