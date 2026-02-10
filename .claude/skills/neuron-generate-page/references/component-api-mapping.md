# Component-API Mapping Rules (AI Reference)

## Field Type → Display Component

| Field Type | Component | Props |
|-----------|-----------|-------|
| string | NText | {} |
| string:long | NText | { multiline: true } |
| string:url | NCard | slot: "media" |
| string:image | NAvatar | {} |
| string:enum | NBadge | {} |
| number | NText | {} |
| number:percentage | NProgress | {} |
| boolean | NBadge | { variant: "status" } |
| date | NText | { format: "date" } |
| datetime | NText | { format: "datetime" } |
| array:object | NDataTable | {} |
| array:object:grouped | NAccordion | {} |
| array:string | NBadge | { multiple: true } |
| array:number | NChart | {} |
| object:user | NAvatar | { withName: true } |
| object:nested | NHoverCard | {} |
| null / empty | NEmpty | {} |
| loading | NSkeleton | {} |

## Field Type → Input Component

| Field Type | Component | Props | Note |
|-----------|-----------|-------|------|
| string | NInput (in NField) | {} | |
| string:long | NTextarea (in NField) | {} | |
| string:enum (<=5 options) | NSelect or NRadioGroup | {} | Few options |
| string:enum (>5 options) | NCombobox | {} | Searchable |
| number | NInput (in NField) | { type: "number" } | |
| number:range | NSlider | {} | |
| boolean | NSwitch | {} | |
| date | NDatePicker | {} | |
| datetime | NDatePicker | { showTime: true } | |
| date-range | NDatePicker | { mode: "range" } | |
| file | NInput | { type: "file" } | |
| array:string (<=10) | NCheckbox | {} | Few options |
| array:string (>10) | NCombobox | { multiple: true } | Searchable multi |
| array:object | NInputGroup | { dynamic: true } | |
| otp | NInputOTP | { length: 6 } | |

## API Pattern → Page Pattern

| API Pattern | Page Pattern | Primary Component | Support Components |
|------------|-------------|-------------------|-------------------|
| GET /list | list-page | NDataTable | NInputGroup, NButton, NBadge, NDropdownMenu, NPagination, NEmpty, NSkeleton |
| GET /:id | detail-page | NCard | NText, NBadge, NAvatar, NButton, NTabs, NAccordion, NBreadcrumb, NHoverCard |
| GET /stats | dashboard | NCard | NChart, NProgress, NText, NBadge |
| POST / | create-form | NDialog | NField, NInput, NTextarea, NCombobox, NSelect, NSwitch, NDatePicker, NCheckbox, NRadioGroup, NSlider, NButton |
| POST /auth | auth-form | NCard | NInput, NInputOTP, NButton, NField |
| PUT /:id | edit-form | NSheet | NField, NInput, NTextarea, NCombobox, NSelect, NSwitch, NDatePicker, NCheckbox, NRadioGroup, NSlider, NButton |
| DELETE /:id | delete-confirm | NAlertDialog | NText, NButton |

## Composite Patterns

### CRUD Pattern
When a resource has GET + POST + PUT + DELETE, generate full CRUD page:
- navigation: NBreadcrumb
- main: NDataTable + NPagination
- toolbar: NButton (create) + NInputGroup (search)
- createModal: NDialog + NField[]
- editPanel: NSheet + NField[]
- deleteConfirm: NAlertDialog
- rowActions: NDropdownMenu / NContextMenu
- feedback: NToast
- loading: NSkeleton
- empty: NEmpty

### Dashboard Pattern
Multiple GET stats endpoints aggregated:
- navigation: NSidebar + NBreadcrumb
- cards: NCard[] + NProgress
- charts: NChart[]
- table: NDataTable + NPagination
- loading: NSkeleton

### Detail-with-tabs Pattern
Detail page with multiple data dimensions:
- navigation: NBreadcrumb
- header: NCard + NAvatar + NBadge
- tabs: NTabs
- tabContent: NDataTable / NAccordion / NCard[]
- actions: NButton + NDropdownMenu
