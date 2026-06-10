'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface LogEntry {
  id?: string;
  path?: string;
  url?: string;
  timestamp?: string;
  success?: boolean;
  status?: number;
  [key: string]: unknown;
}

interface ListLogsResult {
  logs?: LogEntry[];
  total?: number;
  [key: string]: unknown;
}

export function LogsSection() {
  const [limit, setLimit] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ListLogsResult | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/squidcrawl/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          options: { limit: Number.parseInt(limit, 10) || 10 },
        }),
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

  const logs = result?.logs ?? [];
  const total = result?.total ?? logs.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          List Logs
          <Badge variant="secondary">listLogs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            className="w-32"
            disabled={loading}
            max={100}
            min={1}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Limit (default: 10)"
            type="number"
            value={limit}
          />
          <Button disabled={loading} onClick={handleSubmit}>
            {loading ? 'Loading...' : 'Fetch Logs'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              {total} log{total === 1 ? '' : 's'} found
            </p>

            {logs.length > 0 ? (
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium">ID</th>
                      <th className="px-3 py-2 text-left font-medium">Path</th>
                      <th className="px-3 py-2 text-left font-medium">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-medium">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr className="border-b last:border-0" key={log.id || i}>
                        <td className="px-3 py-2 font-mono text-xs">
                          {(log.id ?? '').slice(0, 12)}...
                        </td>
                        <td className="px-3 py-2">
                          <Badge className="text-xs" variant="outline">
                            {log.path ?? '—'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge
                            className="text-xs"
                            variant={
                              log.success === false
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {log.success === false ? 'Failed' : 'Success'}
                          </Badge>
                        </td>
                        <td className="max-w-48 truncate px-3 py-2 text-muted-foreground text-xs">
                          {(log.url as string) ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No logs found. Try making a request first.
              </p>
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
