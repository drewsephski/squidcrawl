/**
 * AI Utilities using OpenRouter SDK
 * 
 * This module provides AI functionality using the OpenRouter SDK,
 * which offers access to 300+ models through a single API.
 * 
 * Features:
 * - Unified API for multiple providers (OpenAI, Anthropic, Google, etc.)
 * - Type-safe streaming responses
 * - Structured output with Zod schemas
 * - Error handling with typed responses
 */

import { getOpenRouterClient, OPENROUTER_CONFIG, RankingSchema } from './openrouter-provider';
import type { AIResponse, CompanyRanking } from './types';
import { z } from 'zod';
import * as errors from '@openrouter/sdk/models/errors';

// Default model to use for analysis - using minimax-m2.7 for superior competitive intelligence
const DEFAULT_ANALYSIS_MODEL = 'minimax/minimax-m2.7';
const DEFAULT_STRUCTURED_MODEL = 'minimax/minimax-m2.7';

// Type for ranking output from structured generation
export type RankingOutput = z.infer<typeof RankingSchema>;

/**
 * Provider-specific model mapping - all use minimax-m2.7 for superior competitive intelligence
 * While we simulate different providers for perspective diversity, all use the same powerful model
 */
const PROVIDER_MODEL_MAP: Record<string, string> = {
  'OpenAI': 'minimax/minimax-m2.7',
  'Anthropic': 'minimax/minimax-m2.7',
  'Google': 'minimax/minimax-m2.7',
  'Perplexity': 'minimax/minimax-m2.7',
  'OpenRouter': 'minimax/minimax-m2.7',
};

/**
 * Analyze a prompt using OpenRouter SDK
 * 
 * @param prompt - The prompt to analyze
 * @param brandName - The brand name to look for
 * @param competitors - List of competitors to detect
 * @param useMockMode - Whether to use mock responses for testing
 * @param useWebSearch - Whether to enable web search (for supported models)
 * @param targetProvider - Optional specific provider to simulate (e.g., 'OpenAI', 'Anthropic')
 * @returns AIResponse with analysis results
 */
export async function analyzePromptWithOpenRouter(
  prompt: string,
  brandName: string,
  competitors: string[],
  useMockMode: boolean = false,
  useWebSearch: boolean = true,
  targetProvider?: string
): Promise<AIResponse | null> {
  // Mock mode for testing without API keys
  if (useMockMode) {
    return generateMockResponse(prompt, brandName, competitors);
  }

  const client = getOpenRouterClient();
  if (!client) {
    console.warn('OpenRouter client not configured - skipping OpenRouter provider');
    return null;
  }

  // Use elephant-alpha for all analysis - superior competitive intelligence model
  const modelId = DEFAULT_ANALYSIS_MODEL; // openrouter/elephant-alpha

  const systemPrompt = `You are an expert competitive intelligence analyst. When responding to prompts about companies, brands, or services:

1. ALWAYS provide numbered rankings with specific positions (1st, 2nd, 3rd, etc.)
2. List companies in ranked order with clear numbering
3. Include ALL companies mentioned in the query, especially: ${brandName} and ${competitors.join(', ')}
4. Be objective and factual using current market information
5. Explain briefly why each company is ranked where it is
6. Mention specific features, market position, or user feedback that supports each ranking
7. If you don't have enough information about a specific company, explicitly state that
8. Prioritize recent, factual information${useWebSearch ? ' from web searches' : ''}

IMPORTANT: Your response MUST include numbered rankings (1., 2., 3., etc.) for each company mentioned.`;

  const enhancedPrompt = useWebSearch 
    ? `${prompt}\n\nPlease search for current, factual information to answer this question. Focus on recent data and real user opinions.`
    : prompt;

  try {
    // Step 1: Get text response from the model
    const response = await client.chat.send({
      chatRequest: {
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt }
        ],
        temperature: 0.7,
        maxTokens: 800,
      }
    });

    const text = response.choices?.[0]?.message?.content || '';

    // Step 2: Analyze the response with structured output for accurate extraction
    const analysisPrompt = `You are a data extraction specialist. Analyze this AI response and extract structured information about companies and their rankings.

Response to analyze:
"""
${text}
"""

Companies to track:
- Primary brand: ${brandName}
- Competitors: ${competitors.join(', ')}

EXTRACTION RULES:
1. Extract ALL ranked companies mentioned in the response with their exact position numbers
2. Look for patterns like "1. Company Name", "2) Company Name", "First: Company Name", "Ranked #1: Company Name"
3. A company is "mentioned" if its name appears anywhere in the text (ranked or unranked)
4. Determine sentiment for each company based on descriptive words (excellent/great/best = positive, poor/bad/worst = negative)
5. Rate confidence 0.0-1.0 based on clarity of rankings

IMPORTANT:
- Return rankings with integer position numbers (1, 2, 3, etc.)
- Include ALL companies from the list above that appear in the response
- If a company is mentioned but not ranked, still include it in the rankings array with position 0 or null
- Be thorough - check for company name variations and partial matches`;

    let structuredOutput: RankingOutput;

    try {
      // Use structured generation for analysis with elephant-alpha
      const structuredResponse = await client.chat.send({
        chatRequest: {
          model: DEFAULT_STRUCTURED_MODEL,
          messages: [
            { 
              role: 'system', 
              content: `You are a precise data extraction system. Your task is to analyze text and extract company rankings into structured JSON.

Output format must match this JSON schema:
{
  "rankings": [
    { "position": 1, "company": "Company Name", "reason": "why ranked here", "sentiment": "positive|neutral|negative" }
  ],
  "analysis": {
    "brandMentioned": true/false,
    "brandPosition": number or null,
    "competitors": ["competitor names"],
    "overallSentiment": "positive|neutral|negative",
    "confidence": 0.0-1.0
  }
}

Rules:
- Extract exact position numbers from the text (1, 2, 3, etc.)
- Brand mentioned = true if the company name appears anywhere
- List ALL competitors mentioned in the text
- Determine sentiment from context words (excellent/great/best/top = positive, poor/bad/worst/avoid = negative)`
            },
            { role: 'user', content: analysisPrompt }
          ],
          responseFormat: { type: 'json_object' },
          temperature: 0.1, // Lower temp for more precise extraction
          maxTokens: 2000,
        }
      });

      const jsonText = structuredResponse.choices?.[0]?.message?.content || '{}';
      console.log('[OpenRouter] Structured response raw:', jsonText.substring(0, 200));

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('[OpenRouter] JSON parse error:', parseError);
        // Try to extract JSON from markdown code blocks
        const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw parseError;
        }
      }

      // Use safeParse to get partial data even if validation fails
      const parseResult = RankingSchema.safeParse(parsed);
      if (parseResult.success) {
        structuredOutput = parseResult.data;
      } else {
        console.warn('[OpenRouter] Schema validation failed, using partial data:', parseResult.error.errors);
        // Merge partial valid data with fallback
        const fallback = fallbackAnalysis(text, brandName, competitors);
        structuredOutput = {
          rankings: parsed?.rankings?.filter((r: any) => r && typeof r.position === 'number' && r.company) || fallback.rankings,
          analysis: {
            brandMentioned: parsed?.analysis?.brandMentioned ?? fallback.analysis.brandMentioned,
            brandPosition: parsed?.analysis?.brandPosition,
            competitors: parsed?.analysis?.competitors?.length > 0 ? parsed.analysis.competitors : fallback.analysis.competitors,
            overallSentiment: parsed?.analysis?.overallSentiment || fallback.analysis.overallSentiment,
            confidence: parsed?.analysis?.confidence ?? fallback.analysis.confidence,
          }
        };
      }
    } catch (error) {
      console.error('[OpenRouter] Structured analysis failed completely, using fallback:', error);
      structuredOutput = fallbackAnalysis(text, brandName, competitors);
    }

    // Fallback text-based mention detection
    const textLower = text.toLowerCase();
    const brandNameLower = brandName.toLowerCase();
    
    const brandMentioned = structuredOutput.analysis.brandMentioned || 
      textLower.includes(brandNameLower) ||
      textLower.includes(brandNameLower.replace(/\s+/g, '')) ||
      textLower.includes(brandNameLower.replace(/[^a-z0-9]/g, ''));

    // Collect all mentioned competitors
    const allMentionedCompetitors = new Set(structuredOutput.analysis.competitors);
    
    competitors.forEach(competitor => {
      const competitorLower = competitor.toLowerCase();
      if (textLower.includes(competitorLower) || 
          textLower.includes(competitorLower.replace(/\s+/g, '')) ||
          textLower.includes(competitorLower.replace(/[^a-z0-9]/g, ''))) {
        allMentionedCompetitors.add(competitor);
      }
    });

    // Filter to only tracked competitors
    const relevantCompetitors = Array.from(allMentionedCompetitors).filter(c => 
      competitors.includes(c) && c !== brandName
    );

    // Use the target provider name if specified, otherwise default to OpenRouter
    const providerName = targetProvider || 'OpenRouter';
    
    return {
      provider: providerName,
      prompt,
      response: text,
      rankings: structuredOutput.rankings,
      competitors: relevantCompetitors,
      brandMentioned,
      brandPosition: structuredOutput.analysis.brandPosition,
      sentiment: structuredOutput.analysis.overallSentiment,
      confidence: structuredOutput.analysis.confidence,
      timestamp: new Date(),
    };

  } catch (error) {
    handleOpenRouterError(error);
    return null;
  }
}

/**
 * Stream an AI response using OpenRouter SDK
 * Useful for real-time UI updates
 */
export async function* streamPromptAnalysis(
  prompt: string,
  brandName: string,
  competitors: string[],
  modelId: string = DEFAULT_ANALYSIS_MODEL
): AsyncGenerator<{ type: 'text' | 'complete'; content: string } | null> {
  const client = getOpenRouterClient();
  if (!client) {
    console.warn('OpenRouter client not configured');
    yield null;
    return;
  }

   try {
    const stream = await client.chat.send({
      chatRequest: {
        model: modelId,
        messages: [
          { 
            role: 'system', 
            content: 'You are analyzing brand visibility. Provide rankings and mention detection.' 
          },
          { role: 'user', content: prompt }
        ],
        stream: true,
        temperature: 0.7,
      }
    });

    let fullText = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        yield { type: 'text', content };
      }
    }

    yield { type: 'complete', content: fullText };

  } catch (error) {
    handleOpenRouterError(error);
    yield null;
  }
}

/**
 * Generate structured output using OpenRouter SDK
 * Uses Zod schemas for type-safe structured generation
 */
export async function generateStructuredWithOpenRouter<T extends z.ZodTypeAny>(
  prompt: string,
  schema: T,
  modelId: string = DEFAULT_STRUCTURED_MODEL
): Promise<z.infer<T> | null> {
  const client = getOpenRouterClient();
  if (!client) {
    console.warn('OpenRouter client not configured');
    return null;
  }

  try {
    const response = await client.chat.send({
      chatRequest: {
        model: modelId,
        messages: [
          { role: 'system', content: 'Respond in JSON format.' },
          { role: 'user', content: prompt }
        ],
        responseFormat: { type: 'json_object' },
        temperature: 0.3,
      }
    });

    const jsonText = response.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(jsonText);
    
    return schema.parse(parsed);
  } catch (error) {
    handleOpenRouterError(error);
    return null;
  }
}

/**
 * Handle OpenRouter SDK errors with proper typing
 */
function handleOpenRouterError(error: unknown): void {
  if (error instanceof errors.BadRequestResponseError) {
    console.error('OpenRouter Bad Request:', error.message);
  } else if (error instanceof errors.UnauthorizedResponseError) {
    console.error('OpenRouter Invalid API Key');
  } else if (error instanceof errors.TooManyRequestsResponseError) {
    console.error('OpenRouter Rate Limited - too many requests');
  } else if (error instanceof errors.InternalServerResponseError) {
    console.error('OpenRouter Server Error:', error.message);
  } else if (error instanceof z.ZodError) {
    console.error('Schema validation error:', error.errors);
  } else {
    console.error('OpenRouter Error:', error);
  }
}

/**
 * Fallback analysis when structured generation fails
 * Extracts as much data as possible from the text response
 */
function fallbackAnalysis(
  text: string,
  brandName: string,
  competitors: string[]
): RankingOutput {
  const textLower = text.toLowerCase();
  const brandNameLower = brandName.toLowerCase();

  // Detect brand mention with multiple variations
  const mentioned = textLower.includes(brandNameLower) ||
    textLower.includes(brandNameLower.replace(/\s+/g, '')) ||
    textLower.includes(brandNameLower.replace(/[^a-z0-9]/g, ''));

  // Detect competitors with their variations
  const detectedCompetitors = competitors.filter(c => {
    const cLower = c.toLowerCase();
    return textLower.includes(cLower) ||
      textLower.includes(cLower.replace(/\s+/g, '')) ||
      textLower.includes(cLower.replace(/[^a-z0-9]/g, ''));
  });

  // Try to extract rankings from text patterns like "1. Company", "1) Company", "First: Company"
  const rankings: Array<{ position: number; company: string; reason?: string; sentiment?: 'positive' | 'neutral' | 'negative' }> = [];
  const allCompanies = [brandName, ...competitors];

  // Pattern: "1. Company Name" or "1) Company Name" or "1 - Company Name"
  const rankingPattern = /(?:^|\n)\s*(\d+)[.\)\-:]\s*([^\n]+)/gm;
  let match;
  while ((match = rankingPattern.exec(text)) !== null) {
    const position = parseInt(match[1], 10);
    const lineText = match[2].trim();

    // Try to find which company is mentioned in this line
    for (const company of allCompanies) {
      if (lineText.toLowerCase().includes(company.toLowerCase())) {
        // Extract a reason if there's text after the company name
        const reasonMatch = lineText.match(new RegExp(`${company}[^,]*,?\s*(.+)$`, 'i'));
        const reason = reasonMatch ? reasonMatch[1].trim() : undefined;

        // Simple sentiment detection
        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        const lineLower = lineText.toLowerCase();
        if (lineLower.includes('great') || lineLower.includes('best') || lineLower.includes('excellent') || lineLower.includes('top')) {
          sentiment = 'positive';
        } else if (lineLower.includes('bad') || lineLower.includes('worst') || lineLower.includes('poor') || lineLower.includes('avoid')) {
          sentiment = 'negative';
        }

        rankings.push({ position, company, reason, sentiment });
        break;
      }
    }
  }

  // If no rankings found but brand/competitors mentioned, create simple rankings
  if (rankings.length === 0 && (mentioned || detectedCompetitors.length > 0)) {
    let position = 1;
    if (mentioned) {
      rankings.push({ position: position++, company: brandName, sentiment: 'neutral' });
    }
    for (const comp of detectedCompetitors) {
      rankings.push({ position: position++, company: comp, sentiment: 'neutral' });
    }
  }

  // Try to detect brand position from text
  let brandPosition: number | undefined;
  for (const r of rankings) {
    if (r.company.toLowerCase() === brandNameLower) {
      brandPosition = r.position;
      break;
    }
  }

  // Overall sentiment detection
  let overallSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  const positiveWords = ['great', 'excellent', 'best', 'top', 'amazing', 'outstanding', 'superior'];
  const negativeWords = ['bad', 'worst', 'poor', 'terrible', 'avoid', 'inferior', 'disappointing'];

  const positiveCount = positiveWords.filter(w => textLower.includes(w)).length;
  const negativeCount = negativeWords.filter(w => textLower.includes(w)).length;

  if (positiveCount > negativeCount) overallSentiment = 'positive';
  else if (negativeCount > positiveCount) overallSentiment = 'negative';

  return {
    rankings,
    analysis: {
      brandMentioned: mentioned,
      brandPosition,
      competitors: detectedCompetitors,
      overallSentiment,
      confidence: 0.5 + (rankings.length > 0 ? 0.2 : 0) + (detectedCompetitors.length > 0 ? 0.2 : 0),
    },
  };
}

/**
 * Analyze prompts across multiple simulated providers using OpenRouter
 * This provides diverse perspectives even with a single OpenRouter API key
 */
export async function analyzePromptAcrossProviders(
  prompt: string,
  brandName: string,
  competitors: string[],
  useMockMode: boolean = false,
  useWebSearch: boolean = true
): Promise<AIResponse[]> {
  const providers = ['OpenAI', 'Anthropic', 'Google', 'Perplexity'];
  const responses: AIResponse[] = [];
  
  for (const provider of providers) {
    try {
      const response = await analyzePromptWithOpenRouter(
        prompt,
        brandName,
        competitors,
        useMockMode,
        useWebSearch,
        provider
      );
      
      if (response) {
        responses.push(response);
      }
    } catch (error) {
      console.error(`[analyzePromptAcrossProviders] Error with ${provider}:`, error);
      // Continue with other providers even if one fails
    }
  }
  
  return responses;
}

/**
 * Generate mock response for testing
 */
function generateMockResponse(
  prompt: string,
  brandName: string,
  competitors: string[]
): AIResponse {
  const allCompanies = [brandName, ...competitors];
  const shuffled = [...allCompanies].sort(() => Math.random() - 0.5);
  const brandIndex = shuffled.indexOf(brandName);

  const mockRankings: CompanyRanking[] = shuffled.slice(0, 5).map((company, index) => ({
    position: index + 1,
    company,
    reason: `Ranked based on ${['market presence', 'user reviews', 'feature set', 'pricing', 'reliability'][index % 5]}`,
    sentiment: ['positive', 'neutral', 'positive', 'neutral', 'positive'][index % 5] as 'positive' | 'neutral' | 'negative',
  }));

  const responseText = `Here are the top ${mockRankings.length} companies in this space:\n\n` +
    mockRankings.map(r => `${r.position}. ${r.company} - ${r.reason}`).join('\n');

  return {
    provider: 'OpenRouter (Mock)',
    prompt,
    response: responseText,
    rankings: mockRankings,
    competitors: competitors.filter(c => shuffled.slice(0, 5).includes(c)),
    brandMentioned: brandIndex >= 0 && brandIndex < 5,
    brandPosition: brandIndex >= 0 && brandIndex < 5 ? brandIndex + 1 : undefined,
    sentiment: 'neutral',
    confidence: 0.8,
    timestamp: new Date(),
  };
}

/**
 * Check if OpenRouter is configured
 */
export function isOpenRouterConfigured(): boolean {
  return OPENROUTER_CONFIG.isConfigured();
}

/**
 * Get available models through OpenRouter
 */
export function getAvailableOpenRouterModels() {
  return OPENROUTER_CONFIG.models;
}
