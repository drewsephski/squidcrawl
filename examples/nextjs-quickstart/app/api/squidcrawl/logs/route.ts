import { NextResponse } from 'next/server';
import type { ListLogsOptions } from 'squidcrawl/types';
import {
  DeepcrawlAuthError,
  DeepcrawlRateLimitError,
  DeepcrawlValidationError,
} from 'squidcrawl/types';
import { squidcrawl } from '@/lib/squidcrawl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const options: ListLogsOptions = body.options || {};

    const result = await squidcrawl.listLogs(options);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DeepcrawlAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof DeepcrawlValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DeepcrawlRateLimitError) {
      return NextResponse.json(
        { error: error.message, retryAfter: error.retryAfter },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
