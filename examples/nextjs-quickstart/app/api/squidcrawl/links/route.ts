import { NextResponse } from 'next/server';
import {
  DeepcrawlAuthError,
  DeepcrawlLinksError,
  DeepcrawlRateLimitError,
  DeepcrawlValidationError,
} from 'squidcrawl/types';
import { squidcrawl } from '@/lib/squidcrawl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, ...options } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "url" in request body' },
        { status: 400 },
      );
    }

    const result = await squidcrawl.extractLinks(url, options);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DeepcrawlAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof DeepcrawlValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DeepcrawlLinksError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
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
