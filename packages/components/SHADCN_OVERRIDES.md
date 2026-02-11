# shadcn/ui Overrides (Tier B)

Modifications made to shadcn/ui primitives in `src/ui/`. Track all Tier B changes here to maintain upgrade awareness.

## Button (ui/button.tsx)

| Original | Modified | Reason |
|----------|----------|--------|
| `h-10` | `h-8` | Default button height 32px per design spec |
| `rounded-md` | `rounded-xl` | Capsule button radius 20px |
| `h-9` (sm) | `h-6` (sm) | Small button height 24px |
| `h-11` (lg) | `h-9` (lg) | Large button height 36px |
| - | `xl` size added | Extra large 48px height |
| `rounded-md` (icon) | `rounded-full` (icon) | Circular icon button |

## Badge (ui/badge.tsx)

| Original | Modified | Reason |
|----------|----------|--------|
| `rounded-full` | `rounded-sm` | Badge radius 4px per design spec |

## Input (ui/input.tsx)

| Original | Modified | Reason |
|----------|----------|--------|
| `h-10` | `h-8` | Input height 32px per design spec |
