'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const FORMATS = ['json', 'markdown', 'links'] as const;

export function ExportSection() {
  const [logId, setLogId] = useState('');
  const [format, setFormat] = useState<string>('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  async function handleSubmit() {
    if (!logId) {
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/squidcrawl/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: logId, format }),
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
          Export Response
          <Badge variant="secondary">exportResponse</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            disabled={loading}
            onChange={(e) => setLogId(e.target.value)}
            placeholder="Log ID"
            value={logId}
          />
          <Select onValueChange={setFormat} value={format}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={loading || !logId} onClick={handleSubmit}>
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        {result !== null && !error && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Export result ({format})
            </p>
            <pre className="max-h-96 overflow-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
              {typeof result === 'string'
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
