'use client';

import { Github, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ExportSection } from '@/components/export-section';
import { LinksSection } from '@/components/links-section';
import { LogDetailSection } from '@/components/log-detail-section';
import { LogsSection } from '@/components/logs-section';
import { MarkdownSection } from '@/components/markdown-section';
import { ReadUrlSection } from '@/components/read-url-section';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS = [
  { id: 'read-url', label: 'Read URL', component: ReadUrlSection },
  { id: 'markdown', label: 'Markdown', component: MarkdownSection },
  { id: 'links', label: 'Links', component: LinksSection },
  { id: 'logs', label: 'Logs', component: LogsSection },
  { id: 'log-detail', label: 'Log Detail', component: LogDetailSection },
  { id: 'export', label: 'Export', component: ExportSection },
] as const;

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="font-semibold text-lg">
              Squidcrawl{' '}
              <span className="font-normal text-muted-foreground">
                Next.js Quickstart
              </span>
            </h1>
            <p className="text-muted-foreground text-xs">
              Demo template — all 6 SDK methods
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/drewsephski/squidcrawl"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Button aria-label="GitHub" size="icon" variant="ghost">
                <Github className="size-4" />
              </Button>
            </a>
            <Button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              size="icon"
              variant="ghost"
            >
              {theme === 'dark' ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-2xl">Squidcrawl SDK Demo</h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-sm">
            Explore every method in the Squidcrawl SDK. Each tab calls a Next.js
            Route Handler that proxies the request to the Squidcrawl API — the
            same pattern you can use in your own apps.
          </p>
        </div>

        <Tabs className="w-full" defaultValue="read-url">
          <TabsList className="mb-6 h-auto flex-wrap">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <tab.component />
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 border-t pt-6 text-center text-muted-foreground text-xs">
          <p>
            Built with the{' '}
            <a
              className="underline hover:text-foreground"
              href="https://www.npmjs.com/package/squidcrawl"
              rel="noopener noreferrer"
              target="_blank"
            >
              squidcrawl
            </a>{' '}
            SDK &middot;{' '}
            <a
              className="underline hover:text-foreground"
              href="https://squidcrawl.dev/docs"
              rel="noopener noreferrer"
              target="_blank"
            >
              Full Documentation
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
