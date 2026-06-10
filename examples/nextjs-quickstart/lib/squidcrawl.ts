import { DeepcrawlApp } from 'squidcrawl';

/**
 * Shared Squidcrawl SDK client instance.
 *
 * This module creates and exports a pre-configured DeepcrawlApp that all
 * Route Handlers in this app use. It reads credentials from environment
 * variables — a pattern you can replicate in your own Next.js projects.
 *
 * ## Setup
 *
 * 1. Get an API key at https://squidcrawl.dev/app/api-keys
 * 2. Add it to your `.env.local`:
 *    ```
 *    SQUIDCRAWL_API_KEY=your_key_here
 *    ```
 *
 * ## Environment variables
 *
 * | Variable                       | Required | Default                    |
 * |-------------------------------|----------|----------------------------|
 * | `SQUIDCRAWL_API_KEY`          | Yes      | —                          |
 * | `NEXT_PUBLIC_SQUIDCRAWL_API_URL` | No    | https://api.squidcrawl.dev |
 *
 * ## Usage in Route Handlers
 *
 * ```ts
 * import { squidcrawl } from '@/lib/squidcrawl';
 * const result = await squidcrawl.readUrl('https://example.com');
 * ```
 *
 * ## Why a singleton?
 *
 * The DeepcrawlApp constructor is lightweight, but creating a shared
 * instance lets the SDK reuse its HTTPS connection pool and internal
 * client for better performance across requests.
 */

const apiKey = process.env.SQUIDCRAWL_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing SQUIDCRAWL_API_KEY environment variable. ' +
      'Copy .env.example to .env.local and add your API key. ' +
      'Get one at https://squidcrawl.dev/app/api-keys',
  );
}

export const squidcrawl = new DeepcrawlApp({
  apiKey,
  baseUrl:
    process.env.NEXT_PUBLIC_SQUIDCRAWL_API_URL || 'https://api.squidcrawl.dev',
});
