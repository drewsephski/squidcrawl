import { NextResponse } from 'next/server';
import type { ExportResponseOptions } from 'squidcrawl/types';
import {
  DeepcrawlAuthError,
  DeepcrawlInvalidExportFormatError,
  DeepcrawlNotFoundError,
  DeepcrawlRateLimitError,
  DeepcrawlValidationError,
} from 'squidcrawl/types';
import { squidcrawl } from '@/lib/squidcrawl';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, format } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "id" in request body' },
        { status: 400 },
      );
    }

    if (!(format && ['json', 'markdown', 'links'].includes(format))) {
      return NextResponse.json(
        {
          error:
            'Missing or invalid "format". Must be one of: json, markdown, links',
        },
        { status: 400 },
      );
    }

    const options: ExportResponseOptions = { id, format };
    const result = await squidcrawl.exportResponse(options);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DeepcrawlAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof DeepcrawlNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof DeepcrawlValidationError ||
      error instanceof DeepcrawlInvalidExportFormatError
    ) {
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
