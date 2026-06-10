import { NextResponse } from 'next/server';
import {
  DeepcrawlAuthError,
  DeepcrawlNotFoundError,
  DeepcrawlRateLimitError,
  DeepcrawlValidationError,
} from 'squidcrawl/types';
import { squidcrawl } from '@/lib/squidcrawl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "id" in request body' },
        { status: 400 },
      );
    }

    const result = await squidcrawl.getOneLog({ id });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DeepcrawlAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof DeepcrawlNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
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
