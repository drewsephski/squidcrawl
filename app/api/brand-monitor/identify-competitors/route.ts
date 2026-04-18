import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { identifyCompetitors } from '@/lib/ai-utils';
import { Company } from '@/lib/types';
import {
  handleApiError,
  AuthenticationError,
  ValidationError,
} from '@/lib/api-errors';

export async function POST(request: NextRequest) {
  try {
    const sessionResponse = await auth.api.getSession({
      headers: request.headers,
    });

    if (!sessionResponse?.user) {
      throw new AuthenticationError('Please log in to use this feature');
    }

    const { company } = await request.json();

    if (!company || !company.name) {
      throw new ValidationError('Invalid request', {
        company: 'Company information is required',
      });
    }

    console.log('[API identify-competitors] Identifying competitors for:', company.name, 'industry:', company.industry);

    // Use AI to identify competitors
    const competitors = await identifyCompetitors(company as Company);

    console.log('[API identify-competitors] Found competitors:', competitors);

    return NextResponse.json({ competitors });
  } catch (error) {
    console.error('[API identify-competitors] Error:', error);
    return handleApiError(error);
  }
}
