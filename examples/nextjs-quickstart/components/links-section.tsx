'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface LinkItem {
  url: string;
  text?: string;
  children?: LinkItem[];
}

interface ExtractLinksResult {
  success: boolean;
  totalLinks: number;
  links?: LinkItem[];
  tree?: LinkItem;
}

export function LinksSection() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractLinksResult | null>(null);

  async function handleSubmit() {
    if (!url) {
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/squidcrawl/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, tree: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || `Error ${res.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  function renderTreeItems(items: LinkItem[], depth = 0): React.ReactNode {
    return (
      <ul className={depth > 0 ? 'ml-4 border-l pl-3' : ''}>
        {items.map((item, i) => (
          <li className="py-0.5" key={`${item.url}-${i}`}>
            <a
              className="text-blue-600 text-sm hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              href={item.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {item.text || item.url}
            </a>
            {item.children && item.children.length > 0 && (
              <div className="mt-0.5">
                {renderTreeItems(item.children, depth + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Extract Links
          <Badge variant="secondary">extractLinks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            disabled={loading}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="https://example.com"
            value={url}
          />
          <Button disabled={loading || !url} onClick={handleSubmit}>
            {loading ? 'Extracting...' : 'Get Links'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {result.totalLinks ?? 0} links found
              </Badge>
              {result.success && (
                <Badge
                  className="border-green-500 text-green-600"
                  variant="outline"
                >
                  Success
                </Badge>
              )}
            </div>

            {result.tree && result.tree.children && (
              <div className="max-h-80 overflow-auto rounded-md border bg-card p-3">
                {renderTreeItems(result.tree.children)}
              </div>
            )}

            {result.links && result.links.length > 0 && !result.tree && (
              <div className="max-h-80 space-y-1 overflow-auto">
                {result.links.map((link, i) => (
                  <div className="truncate text-sm" key={i}>
                    <a
                      className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      href={link.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {link.text || link.url}
                    </a>
                  </div>
                ))}
              </div>
            )}

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View raw response
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
