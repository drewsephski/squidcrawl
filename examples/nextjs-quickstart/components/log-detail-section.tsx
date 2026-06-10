'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function LogDetailSection() {
  const [logId, setLogId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  async function handleSubmit() {
    if (!logId) {
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/squidcrawl/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId }),
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Log Detail
          <Badge variant="secondary">getOneLog</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            disabled={loading}
            onChange={(e) => setLogId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Log ID (e.g., req_abc123)"
            value={logId}
          />
          <Button disabled={loading || !logId} onClick={handleSubmit}>
            {loading ? 'Loading...' : 'Get Log'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {typeof result.id === 'string' && (
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-mono text-xs">{result.id}</p>
                </div>
              )}
              {typeof result.path === 'string' && (
                <div>
                  <p className="text-muted-foreground">Path</p>
                  <Badge className="text-xs" variant="outline">
                    {result.path}
                  </Badge>
                </div>
              )}
              {typeof result.success === 'boolean' && (
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge
                    className="text-xs"
                    variant={
                      result.success === false ? 'destructive' : 'secondary'
                    }
                  >
                    {result.success === false ? 'Failed' : 'Success'}
                  </Badge>
                </div>
              )}
              {typeof result.url === 'string' && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">URL</p>
                  <p className="truncate">{result.url}</p>
                </div>
              )}
            </div>

            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
