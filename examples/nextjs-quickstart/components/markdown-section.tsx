'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function MarkdownSection() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit() {
    if (!url) {
      return;
    }
    setLoading(true);
    setError(null);
    setMarkdown(null);

    try {
      const res = await fetch('/api/squidcrawl/markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.ok) {
        const text = await res.text();
        setMarkdown(text);
      } else {
        const data = await res.json();
        setError(data.error || `Error ${res.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!markdown) {
      return;
    }
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Get Markdown
          <Badge variant="secondary">getMarkdown</Badge>
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
            {loading ? 'Extracting...' : 'Get Markdown'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {markdown && !error && (
          <div className="relative">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Markdown output ({markdown.length.toLocaleString()} chars)
              </p>
              <Button
                className="gap-1"
                onClick={handleCopy}
                size="sm"
                variant="outline"
              >
                {copied ? (
                  <Check className="size-3" />
                ) : (
                  <Copy className="size-3" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
              {markdown}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
