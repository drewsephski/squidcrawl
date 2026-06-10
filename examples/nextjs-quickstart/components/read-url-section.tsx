'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function ReadUrlSection() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleSubmit() {
    if (!url) {
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/squidcrawl/read-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, markdown: true, metadata: true }),
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

  const title = result?.title as string | undefined;
  const description = result?.description as string | undefined;
  const contentPreview = result?.content as string | undefined;
  const sourceURL = result?.url as string | undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Read URL
          <Badge variant="secondary">readUrl</Badge>
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
            {loading ? 'Loading...' : 'Fetch'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="space-y-3">
            {title && (
              <div>
                <p className="text-muted-foreground text-sm">Title</p>
                <p className="font-medium">{title}</p>
              </div>
            )}
            {description && (
              <div>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm">{description}</p>
              </div>
            )}
            {sourceURL && (
              <div>
                <p className="text-muted-foreground text-sm">Source URL</p>
                <p className="truncate text-sm">{sourceURL}</p>
              </div>
            )}
            {contentPreview && (
              <div>
                <p className="mb-1 text-muted-foreground text-sm">
                  Content Preview
                </p>
                <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                  {contentPreview.slice(0, 1000)}
                  {contentPreview.length > 1000 && '\n... (truncated)'}
                </pre>
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
