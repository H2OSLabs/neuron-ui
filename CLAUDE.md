# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

neuron-ui is an AI-driven frontend page auto-generation component library. Users provide arbitrary-format API lists and TaskCase descriptions; AI understands the content and generates frontend pages using a component-to-API mapping system, with drag-and-drop visual refinement.

The project is in early stage — architecture and planning are complete, source code packages are not yet initialized.

## Tech Stack

- **Package Manager:** pnpm (monorepo with workspaces)
- **Build Orchestration:** Turborepo
- **Build Tool:** Vite (library mode per package)
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS v4 (`@theme inline` for CSS variable registration)
- **UI Primitives:** shadcn/ui (Radix UI), base palette: `stone`
- **Testing:** Vitest + Testing Library
- **Component Docs:** Storybook
- **Drag & Drop:** dnd-kit
- **State Management:** Zustand + temporal middleware (undo/redo)
- **Runtime Renderer:** Vercel json-render (`@json-render/core` + `@json-render/react`) — Catalog + Registry + Renderer
- **Schema Validation:** Zod (json-render Catalog uses Zod for component props validation)

## Expected Commands (once initialized)

```bash
pnpm install                              # Install all dependencies
pnpm dev                                  # Start dev servers
pnpm build                                # Build all packages (via turbo)
pnpm test                                 # Run all tests (via turbo)
pnpm --filter @neuron-ui/components test  # Run tests for a single package
pnpm lint                                 # Lint all packages
pnpm storybook                            # Launch Storybook
```

## Monorepo Architecture

Eight packages with strict dependency order:

```
@neuron-ui/tokens          → Layer 0: Design tokens (CSS + TS + JSON from tokens.json)
@neuron-ui/components      → Layer 1-2: shadcn primitives (src/ui/) + neuron wrappers (src/neuron/)
@neuron-ui/metadata        → Side: Component manifest, API mapping rules, composition rules, schemas
@neuron-ui/generator       → Layer 3: AI-driven page generation engine
@neuron-ui/page-builder    → Layer 3: Drag-and-drop visual editor (web app, not npm)
@neuron-ui/runtime         → Consumer: Runtime renderer based on json-render (Catalog + Registry + Adapter)
@neuron-ui/codegen         → Consumer: CLI code generator (Page Schema → .tsx source files)
@neuron-ui/mcp-server      → Integration: MCP Server exposing all AI capabilities as standardized tools
```

**Build order:** tokens → components → metadata → generator / page-builder / runtime / codegen → mcp-server

## Four-Layer Component Architecture

```
Layer 3: Page Builder (@neuron-ui/page-builder) — consumes neuron components
Layer 2: Neuron components (NButton, NCard...) in src/neuron/ — wraps shadcn
Layer 1: shadcn/ui primitives (button.tsx, card.tsx...) in src/ui/
Layer 0: Design Tokens (@neuron-ui/tokens) — single source: tokens.json
```

## Key Conventions

- **Component naming:** All neuron components use `N` prefix (NButton, NCard, NDialog) to distinguish from shadcn primitives
- **Component structure:** Each neuron component follows `NComponent/NComponent.tsx`, `.types.ts`, `.test.tsx`, `.stories.tsx`, `index.ts`
- **Token usage:** Page Schema props use Token keys (`"blue"`, `"lg"`), never raw values (`#BEF1FF`)
- **shadcn customization tiers:**
  - Tier A (~80%): CSS variable remapping only — zero-touch on shadcn upgrade
  - Tier B (~15%): Minimal Tailwind class changes — track in SHADCN_OVERRIDES.md
  - Tier C (~5%): Full neuron wrapper — isolated from upgrades
- **Data attributes:** Neuron components emit `data-neuron-component` for editor integration

## AI Metadata System

Three JSON files in `@neuron-ui/metadata` form the AI's knowledge base:

1. **component-manifest.json** — What components exist (53 total), their variants, sizes, nesting rules
2. **component-api-mapping.json** — Field type → component selection rules:
   - GET responses: `array<object>` → NDataTable; `string:enum` → NBadge; `number:percentage` → NProgress
   - POST/PUT requests: `string` → NInput; `enum(≤5)` → NSelect; `enum(>5)` → NCombobox
3. **composition-rules.json** — Component nesting constraints and limits

## Page Schema & Data Binding

Page Schema is the JSON format output by the AI generator, consumed by the page builder, and delivered to target projects via runtime renderer or code generation:

```jsonc
{
  "version": "1.0.0",
  "page": { "id": "...", "name": "..." },
  "dataSources": { "key": { "api": "GET /api/...", "params": {} } },
  "tree": [{ "id": "root", "component": "NResizable", "props": {}, "binding": {}, "children": [] }]
}
```

**Binding protocol keys:** `dataSource`, `field`, `onChange`, `onClick`, `onSubmit`, `onConfirm`, `prefill`

## Design Tokens

- **Colors:** 14-level warm gray (`#5F5D57` → `#FCFCFC`) + 10 accent colors + 3 semantic (error/warning/success)
- **Typography:** Asul (English headings) + Swei Gothic CJK SC (Chinese body)
- **Font sizes:** 48 / 36 / 28 / 24 / 18 / 14 / 12 px
- **Spacing:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 36 / 48 / 64 px
- **Border radius:** 4 (tags) / 8 (inputs) / 12 (cards) / 20 (buttons) / 50% (avatars) px

## Key Documentation

| Document | Purpose |
|----------|---------|
| `docs/plan/00-overview.md` | Four-goal roadmap and dependencies |
| `docs/plan/01-goal-shadcn-design-system.md` | 53 component design specs |
| `docs/plan/02-goal-component-api-mapping.md` | Complete field→component mapping table |
| `docs/plan/03-goal-auto-page-generation.md` | AI generation engine design |
| `docs/plan/04-goal-drag-drop-refinement.md` | Visual editor spec |
| `docs/plan/05-architecture.md` | Full technical architecture |
| `docs/base/shared-design-tokens.md` | Design token specifications |
| `docs/guides/project-overview.md` | Comprehensive project overview |
| `docs/guides/page-consumption.md` | Page Schema consumption modes (runtime + codegen) |
| `docs/dev/09-phase8-mcp-server.md` | MCP Server design (Tools + Resources + Prompts) |

## Claude Skills

This repo includes custom skills in `.claude/skills/`:
- **neuron-analyze-api** — Analyze any-format API docs into structured understanding
- **neuron-generate-page** — Generate Page Schema from API + TaskCase
- **neuron-validate-schema** — Validate Page Schema against format/composition/token rules

## MCP Servers

Configured in `.claude/mcp.json`: context7 (docs lookup), shadcn (component scaffolding via `npx shadcn@latest mcp`)

**@neuron-ui/mcp-server** (planned): A dedicated MCP Server that wraps all neuron-ui AI capabilities:
- **11 Tools:** component queries, API analysis, page generation, schema validation, code generation
- **12 Resources:** metadata JSON, token data, schema specs, examples, catalog prompt
- **3 Prompts:** page generation, component selection, schema review
- Any MCP-compatible client (Claude Code, Cursor, Windsurf) can consume these capabilities
- Design doc: `docs/dev/09-phase8-mcp-server.md`
