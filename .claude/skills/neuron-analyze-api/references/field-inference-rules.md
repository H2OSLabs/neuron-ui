# Field Name → Type Inference Rules

## Exact Match Patterns

| Field name | Neuron type | Notes |
|---|---|---|
| `id` | string | Primary key, usually hidden |
| `name`, `title` | string | Required in most cases |
| `email` | string:url | Email address |
| `password` | string | Input type: password |
| `description`, `content`, `body`, `bio`, `summary`, `notes` | string:long | Multiline text |
| `avatar`, `image`, `cover`, `logo`, `photo`, `thumbnail`, `icon` | string:image | Display as NAvatar |
| `url`, `link`, `website`, `homepage` | string:url | Clickable link |
| `status`, `state`, `phase` | string:enum | Look for possible values in context |
| `type`, `category`, `kind`, `role`, `level`, `priority` | string:enum | Look for possible values in context |
| `tags`, `labels`, `categories`, `keywords` | array:string | Multi-select |
| `permissions`, `roles`, `features` | array:string | Multi-select |
| `progress`, `completion`, `percentage` | number:percentage | Display as NProgress |
| `price`, `amount`, `cost`, `fee`, `salary`, `budget` | number | Format: currency |
| `count`, `total`, `quantity`, `num` | number | Integer |
| `score`, `rating` | number | May have range |
| `phone`, `mobile`, `tel` | string | Input type: tel |

## Suffix Patterns

| Suffix | Neuron type | Example |
|---|---|---|
| `*_at`, `*_time` | datetime | `created_at`, `updated_at`, `deleted_at` |
| `*_date` | date | `start_date`, `end_date`, `birth_date` |
| `*_url` | string:url or string:image | Context determines: `avatar_url` → image, `callback_url` → url |
| `*_id` | string (reference) | `user_id` → may need to resolve to object:user |
| `*_count`, `*_num`, `*_total` | number | `comment_count`, `view_num` |

## Prefix Patterns

| Prefix | Neuron type | Example |
|---|---|---|
| `is_*`, `has_*`, `can_*`, `should_*` | boolean | `is_active`, `has_avatar`, `can_edit` |
| `min_*`, `max_*` | number | `min_price`, `max_participants` |
| `total_*` | number | `total_amount`, `total_score` |

## Plural → Array Detection

| Signal | Neuron type | Example |
|---|---|---|
| Plural noun + context shows list of strings | array:string | `tags: ["react", "vue"]` |
| Plural noun + context shows list of objects | array:object | `comments: [{...}, {...}]` |
| Field name matches another resource (plural) | array:object | `participants` if resource "participant" exists |

## Object Detection

| Signal | Neuron type |
|---|---|
| Field contains `name` + `avatar`/`email` | object:user |
| Field has nested properties described | object:nested |
| Field references another resource by name | object:nested |

## Ambiguous Cases — Context Decides

| Field | Could be | Decision rule |
|---|---|---|
| `color` | string or string:enum | If finite set (red/blue/green) → enum; if hex → string |
| `size` | string:enum or number | If S/M/L/XL → enum; if pixel value → number |
| `data` | object:nested or array:object | Check if array or single object |
| `items` | array:object or array:string | Check item structure |
| `address` | string:long or object:nested | If structured (city/street) → object; if single line → string |
