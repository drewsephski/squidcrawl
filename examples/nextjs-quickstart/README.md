# Squidcrawl Next.js Quickstart

A demo template showing all 6 Squidcrawl SDK methods integrated into a Next.js App Router project. Each SDK method is exposed via a Route Handler and demonstrated with a polished UI component.

## Features

| SDK Method | Route Handler | Description |
|---|---|---|
| `readUrl` | `POST /api/squidcrawl/read-url` | Fetch structured page content (title, text, metadata, HTML) |
| `getMarkdown` | `POST /api/squidcrawl/markdown` | Extract clean LLM-ready markdown from any URL |
| `extractLinks` | `POST /api/squidcrawl/links` | Discover links as flat list or hierarchical tree |
| `listLogs` | `POST /api/squidcrawl/logs` | Browse recent API request history |
| `getOneLog` | `POST /api/squidcrawl/log` | View full request/response details by log ID |
| `exportResponse` | `POST /api/squidcrawl/export` | Export a previous response as JSON, markdown, or links |

## Prerequisites

- **Node.js 20+**
- **Squidcrawl API key** — get one free at [squidcrawl.dev/app/api-keys](https://squidcrawl.dev/app/api-keys)

## Quick Start

```bash
# 1. Copy the environment template
cp .env.example .env.local

# 2. Add your API key to .env.local
#    SQUIDCRAWL_API_KEY=sc_your_key_here

# 3. Install dependencies
pnpm install

# 4. Start the dev server (runs on port 3001)
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) to see the demo.

## Project Structure

```
examples/nextjs-quickstart/
├── app/
│   ├── api/squidcrawl/        # Route Handlers (one per SDK method)
│   │   ├── read-url/route.ts  #   readUrl
│   │   ├── markdown/route.ts  #   getMarkdown
│   │   ├── links/route.ts     #   extractLinks
│   │   ├── logs/route.ts      #   listLogs
│   │   ├── log/route.ts       #   getOneLog
│   │   └── export/route.ts    #   exportResponse
│   ├── globals.css            # Tailwind v4 + shadcn theme tokens
│   ├── layout.tsx             # Root layout with Geist fonts + ThemeProvider
│   └── page.tsx               # Main demo page with tabs
├── components/
│   ├── ui/                    # Local shadcn/ui components
│   ├── read-url-section.tsx    # UI for readUrl
│   ├── markdown-section.tsx    # UI for getMarkdown
│   ├── links-section.tsx       # UI for extractLinks
│   ├── logs-section.tsx        # UI for listLogs
│   ├── log-detail-section.tsx  # UI for getOneLog
│   └── export-section.tsx      # UI for exportResponse
├── lib/
│   ├── squidcrawl.ts          # Shared DeepcrawlApp singleton
│   └── utils.ts               # cn() helper
└── .env.example               # Environment variable template
```

## Architecture

```
Browser (React)  ──POST──>  Route Handler  ──SDK──>  Squidcrawl API
     │                        │
     │  JSON response         │  Error mapping
     ◄────────────────────────◄
```

1. Each feature section is a **Client Component** that sends `POST` requests
2. Route Handlers validate input, call the SDK, and map errors to HTTP status codes
3. The SDK client is a **singleton** (`lib/squidcrawl.ts`) configured with your API key

## Run Outside the Monorepo

This template lives inside the Squidcrawl monorepo and uses `workspace:*` for the SDK dependency. To run it standalone:

```bash
# Copy the directory outside the monorepo
cp -r examples/nextjs-quickstart ../my-quickstart
cd ../my-quickstart

# Update the SDK dependency in package.json:
# Remove "squidcrawl": "workspace:*"
# Add    "squidcrawl": "^1.0.0"

pnpm install && pnpm dev
```

## Learn More

- [Squidcrawl Documentation](https://squidcrawl.dev/docs)
- [Squidcrawl API Reference](https://squidcrawl.dev/docs/api)
- [GitHub Repository](https://github.com/drewsephski/squidcrawl)
- [SDK Package (npm)](https://www.npmjs.com/package/squidcrawl)
