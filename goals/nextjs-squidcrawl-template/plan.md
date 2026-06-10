# Plan: Next.js + Squidcrawl Quickstart Template

## Solution Approach

Create a standalone Next.js App Router template at `examples/nextjs-quickstart/` that demonstrates all 6 SDK methods (`readUrl`, `getMarkdown`, `extractLinks`, `listLogs`, `getOneLog`, `exportResponse`). The template uses Tailwind v4 + shadcn/ui locally (copied components), has no auth (API-key only), and is a single-page demo with section cards for each feature. It's both a workspace member (using `workspace:*` for the SDK) and documented for standalone use.

## Ordered Steps

### Step 1: Create directory scaffold
Create the full directory tree inside `examples/nextjs-quickstart/`:
- `lib/`, `app/api/squidcrawl/{read-url,markdown,links,logs,log,export}/`, `components/ui/`, `components/`

**Files created:** directory structure only
**Verification:** `ls -R examples/nextjs-quickstart/` shows all dirs

### Step 2: Project config files
- `package.json` — name `nextjs-quickstart`, private, Next.js 16, React 19, `squidcrawl: "workspace:*"`, tailwind v4, shadcn/ui deps (class-variance-authority, radix-ui, lucide-react, clsx, tailwind-merge, tw-animate-css, next-themes)
- `tsconfig.json` — standalone, no workspace extends. `@/*` alias, `moduleResolution: "bundler"`, JSX preserve
- `next.config.mjs` — minimal: `reactStrictMode: true`, `images.remotePatterns`
- `postcss.config.mjs` — `@tailwindcss/postcss` plugin
- `components.json` — shadcn new-york style, baseColor neutral, icons lucide
- `.gitignore` — standard Next.js ignores
- `.env.example` — `SQUIDCRAWL_API_KEY` (required), `NEXT_PUBLIC_SQUIDCRAWL_API_URL` (optional)

**Files created:** 7 files
**Verification:** `ls examples/nextjs-quickstart/*.json examples/nextjs-quickstart/*.mjs examples/nextjs-quickstart/.env.example`

### Step 3: Tailwind globals and base styling
- `app/globals.css` — Tailwind v4 with `@import "tailwindcss"`, `@import "tw-animate-css"`, CSS variables for light/dark themes, `@custom-variant dark`, `@theme` blocks for shadcn tokens (colors, border-radius, etc.)

**Files created:** 1 file
**Verification:** Contains `@import "tailwindcss"` and `.dark` variant

### Step 4: lib/utils.ts
- `lib/utils.ts` — Standard `cn()` helper using `clsx` + `tailwind-merge`, mirroring the pattern from `@deepcrawl/ui/lib/utils`

**Files created:** 1 file

### Step 5: lib/squidcrawl.ts
- `lib/squidcrawl.ts` — Creates and exports a singleton `DeepcrawlApp` instance
- Reads `SQUIDCRAWL_API_KEY` and optional `NEXT_PUBLIC_SQUIDCRAWL_API_URL` from env
- Throws if API key is missing
- Heavily documented as the "how to initialize the SDK" reference

**Files created:** 1 file
**Verification:** `node -e "require('./lib/squidcrawl.ts')"` typechecks (via build)

### Step 6: shadcn/ui components
Copy minimal shadcn/ui components locally (no workspace dep on `@deepcrawl/ui`):
- `components/ui/button.tsx` — Using `Slot` from Radix, `cva` variants
- `components/ui/input.tsx` — Standard shadcn input
- `components/ui/card.tsx` — Card, CardHeader, CardContent, CardFooter
- `components/ui/tabs.tsx` — Tabs from `@radix-ui/react-tabs`
- `components/ui/badge.tsx` — Inline variant badge
- `components/ui/textarea.tsx` — For markdown/JSON output display
- `components/ui/skeleton.tsx` — Loading skeleton for polished UX
- `components/ui/select.tsx` — For format selector in export section

**Files created:** 8 files
**Verification:** `tsc --noEmit` passes in the template dir

### Step 7: Route Handlers (6 handlers)
Each Route Handler is a `POST` endpoint with heavy doc comments explaining the SDK method:

- `app/api/squidcrawl/read-url/route.ts` — Calls `dc.readUrl(url, options)`. Returns `ReadUrlResponse` JSON.
- `app/api/squidcrawl/markdown/route.ts` — Calls `dc.getMarkdown(url, options)`. Returns markdown string.
- `app/api/squidcrawl/links/route.ts` — Calls `dc.extractLinks(url, options)`. Returns `ExtractLinksResponse`.
- `app/api/squidcrawl/logs/route.ts` — Calls `dc.listLogs(options)`. Returns `ListLogsResponse`.
- `app/api/squidcrawl/log/route.ts` — Calls `dc.getOneLog({ id })`. Returns `GetOneLogResponse`.
- `app/api/squidcrawl/export/route.ts` — Calls `dc.exportResponse({ id, format })`. Returns export output.

**Pattern:** Each handler:
1. Parses JSON body
2. Calls the SDK method
3. Returns JSON response (or text for markdown)
4. Catches `DeepcrawlError` subclasses and maps to appropriate HTTP status codes
5. Has extensive JSDoc explaining the SDK method signature, options, and return type

**Files created:** 6 files
**Verification:** Each handler has unique content matching its SDK method

### Step 8: Feature section components
Client Components (marked `'use client'`) for each SDK feature, each as a card with input, action button, loading state, and output:

- `components/read-url-section.tsx` — URL + advanced options modal (rawHtml, cleanedHtml, markdown toggles). Displays title, metadata table, content preview.
- `components/markdown-section.tsx` — URL input. Displays markdown in a styled pre/code block with copy button.
- `components/links-section.tsx` — URL + tree toggle. Displays total link count + hierarchical tree or flat list.
- `components/logs-section.tsx` — Optional filters (limit, path type). Displays paginated table with log entries.
- `components/log-detail-section.tsx` — Log ID input. Displays full request/response details in formatted JSON.
- `components/export-section.tsx` — Log ID + format selector (json/markdown/links). Displays exported output.

**Files created:** 6 files
**Verification:** Each has `'use client'`, takes no required props (self-contained with internal state)

### Step 9: Root layout and main page
- `app/layout.tsx` — Root layout with Geist fonts (via `next/font`), theme provider, globals.css import, metadata
- `app/page.tsx` — Main demo page with:
  - Hero header explaining the template
  - Tab/section navigation
  - All 6 feature sections rendered as cards
  - Footer with link to full docs at squidcrawl.dev

**Files created:** 2 files
**Verification:** App renders at `http://localhost:3001` without errors

### Step 10: README
- `README.md` — Comprehensive docs explaining:
  - Prerequisites (Node 20+, Squidcrawl API key)
  - Quick start (copy .env.example, set API key, install, dev)
  - Feature walkthrough with screenshots mention
  - Architecture overview (client → Route Handler → SDK → API)
  - Links to full docs at squidcrawl.dev/docs

**Files created:** 1 file

### Step 11: Workspace integration
- Update `pnpm-workspace.yaml` — Add `"examples/*"` to the packages array
- Update root `package.json` workspaces — Add `"examples/*"` to the workspaces array
- Run `pnpm install` at root to link the new workspace member

**Files modified:** 2 files
**Verification:** `pnpm -C examples/nextjs-quickstart typecheck` passes

## Risks & Open Questions
- **SDK version coupling:** The template uses `"squidcrawl": "workspace:*"`, so it's tied to the local SDK. For standalone docs, users copy the dir and change dep to `"squidcrawl": "^1.0.0"`. Document this clearly.
- **shadcn/ui component versioning:** Components like Tabs use `@radix-ui/react-tabs` with catalog versions. The template pins specific versions in `package.json` rather than using catalogs.
- **Tailwind v4 theme variables:** Need to correctly replicate the shadcn CSS variable theme in `globals.css` without depending on `@deepcrawl/ui`.
- **Route Handler error types:** The SDK throws typed error classes (`DeepcrawlReadError`, `DeepcrawlAuthError`, etc.). Each handler needs a comprehensive try/catch for proper error mapping.
- **Deploy targets:** Not in scope — the template runs locally with `pnpm dev`. Deployment docs are referenced in the README.

## Verification Checklist
- [ ] `pnpm install` at root completes without errors
- [ ] `pnpm -C examples/nextjs-quickstart typecheck` passes
- [ ] `pnpm -C examples/nextjs-quickstart dev` starts without errors
- [ ] `/api/squidcrawl/read-url` responds to POST requests
- [ ] `/api/squidcrawl/markdown` responds to POST requests
- [ ] `/api/squidcrawl/links` responds to POST requests
- [ ] `/api/squidcrawl/logs` responds to POST requests
- [ ] `/api/squidcrawl/log` responds to POST requests
- [ ] `/api/squidcrawl/export` responds to POST requests
- [ ] UI renders all 6 sections without console errors
- [ ] Each section correctly calls its Route Handler and displays results
- [ ] Dark mode toggle works
