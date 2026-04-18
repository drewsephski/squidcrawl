import { z } from 'zod';
import { Company } from './types';
import FirecrawlApp from '@mendable/firecrawl-js';
import { getOpenRouterClient } from './openrouter-provider';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

const RankedBrandSchema = z.object({
  rank: z.number(),
  name: z.string(),
  marketPosition: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  estimatedMarketShare: z.string().optional(),
});

const MarketLandscapeSchema = z.object({
  totalAddressableMarket: z.string().optional(),
  keyTrends: z.array(z.string()).optional(),
  marketMaturity: z.enum(['emerging', 'growing', 'mature', 'consolidated']).optional(),
  competitiveIntensity: z.enum(['high', 'medium', 'low']).optional(),
});

const CompanyInfoSchema = z.object({
  name: z.string().default(''),
  description: z.string().default(''),
  keywords: z.array(z.string()).default([]),
  industry: z.string().default(''),
  mainProducts: z.array(z.string()).default([]),
  competitors: z.array(z.object({
    name: z.string(),
    url: z.string().optional().nullable(),
    evidence: z.string().optional().nullable(), // Where/how we found this competitor
  })).default([]),
  rankedBrandsInNiche: z.array(RankedBrandSchema).default([]),
  marketLandscape: MarketLandscapeSchema.optional().nullable(),
  socialLinks: z.object({
    twitter: z.string().optional().nullable(),
    linkedin: z.string().optional().nullable(),
    github: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
  }).optional().nullable(),
  founded: z.string().optional().nullable(),
  headquarters: z.string().optional().nullable(),
  employees: z.string().optional().nullable(),
  pricing: z.union([z.string(), z.object({}).passthrough()]).optional().nullable().transform(val =>
    typeof val === 'object' && val !== null ? JSON.stringify(val) : val
  ),
  useCases: z.array(z.string()).default([]),
  targetAudience: z.string().optional().nullable(),
  differentiators: z.array(z.string()).default([]),
});

export interface ScrapedMetadata {
  title: string;
  description: string;
  keywords: string[];
  mainContent: string;
  mainProducts: string[];
  competitors: Array<{
    name: string;
    url?: string | null;
    evidence?: string | null;
    metadata?: {
      ogImage?: string;
      favicon?: string;
      description?: string;
    };
  }>;
  rankedBrandsInNiche?: Array<{
    rank: number;
    name: string;
    marketPosition?: string;
    strengths?: string[];
    estimatedMarketShare?: string;
  }>;
  marketLandscape?: {
    totalAddressableMarket?: string;
    keyTrends?: string[];
    marketMaturity?: 'emerging' | 'growing' | 'mature' | 'consolidated';
    competitiveIntensity?: 'high' | 'medium' | 'low';
  } | null;
  ogImage?: string;
  favicon?: string;
  screenshots?: string[];
  socialLinks?: {
    twitter?: string | null;
    linkedin?: string | null;
    github?: string | null;
    facebook?: string | null;
    instagram?: string | null;
  } | null;
  founded?: string | null;
  headquarters?: string | null;
  employees?: string | null;
  pricing?: string | Record<string, unknown> | null;
  useCases?: string[];
  targetAudience?: string | null;
  differentiators?: string[];
}

export async function scrapeCompanyInfo(url: string, maxAge?: number): Promise<Company> {
  try {
    // Ensure URL has protocol
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Default to 1 week cache if not specified
    const cacheAge = maxAge ? Math.floor(maxAge / 1000) : 604800; // 1 week in seconds
    
    console.log('[scrapeCompanyInfo] Starting scrape for:', normalizedUrl);
    
    // First, try to use Firecrawl's extract endpoint for structured market data
    let extractedData: any = null;
    try {
      console.log('[scrapeCompanyInfo] Attempting structured extraction...');
      const extractResponse = await firecrawl.extract([normalizedUrl], {
        schema: {
          type: 'object',
          properties: {
            companyName: { type: 'string' },
            industry: { type: 'string' },
            description: { type: 'string' },
            mainProducts: { 
              type: 'array',
              items: { type: 'string' }
            },
            competitors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  url: { type: 'string' },
                  relationship: { type: 'string' }
                }
              }
            },
            marketPosition: { type: 'string' },
            targetAudience: { type: 'string' },
            keyDifferentiators: {
              type: 'array',
              items: { type: 'string' }
            },
            estimatedMarketShare: { type: 'string' },
            marketLandscape: {
              type: 'object',
              properties: {
                marketSize: { type: 'string' },
                keyTrends: { 
                  type: 'array',
                  items: { type: 'string' }
                },
                competitiveIntensity: { type: 'string' }
              }
            }
          }
        }
      });
      
      if (extractResponse.success && extractResponse.data) {
        console.log('[scrapeCompanyInfo] Structured extraction successful');
        extractedData = extractResponse.data;
      }
    } catch (extractError) {
      console.log('[scrapeCompanyInfo] Structured extraction failed, falling back to scrape:', extractError);
    }
    
    // Use Firecrawl to get both markdown content and screenshots
    const response = await firecrawl.scrapeUrl(normalizedUrl, {
      formats: ['markdown', 'screenshot'],
      maxAge: cacheAge,
      onlyMainContent: false, // Get all content including navigation
      waitFor: 2000, // Wait for dynamic content
    });
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    console.log('[scrapeCompanyInfo] Firecrawl response received, metadata:', {
      hasMarkdown: !!response.markdown,
      hasScreenshot: !!response.screenshot,
      title: response.metadata?.title,
    });
    
    const html = response.markdown;
    const metadata = response.metadata;
    const screenshot = response.screenshot;
    

    // Use OpenRouter to extract structured information with enhanced competitor analysis
    const openRouterClient = getOpenRouterClient();
    if (!openRouterClient) {
      throw new Error('OpenRouter not configured for content extraction');
    }
    
    console.log('[scrapeCompanyInfo] Starting AI content extraction...');
    
    const extractionResponse = await openRouterClient.chat.send({
      chatRequest: {
        model: 'openrouter/free', // Use OpenRouter free tier
        messages: [
          {
            role: 'system',
            content: `You are an expert competitive intelligence analyst with deep expertise in market research and brand analysis. Your task is to:
1. Thoroughly analyze website content to extract comprehensive company information
2. Identify REAL competitors with evidence-based detection
3. Research and rank the TOP brands in this company's niche/market
4. Provide market positioning insights and competitive landscape analysis

You must provide detailed, accurate information based SOLELY on the website content provided, augmented with your knowledge of the industry landscape. Be thorough and analytical.`
          },
          {
            role: 'user',
            content: `Analyze this website content and extract comprehensive company information with enhanced competitive intelligence.

Return JSON matching this exact structure:

{
  "name": "Company Name",
  "description": "Detailed description from the website",
  "keywords": ["relevant", "industry", "keywords"],
  "industry": "Specific industry category",
  "mainProducts": ["Product 1", "Product 2"],
  "competitors": [
    {
      "name": "Competitor Name",
      "url": "competitor.com (if found)",
      "evidence": "Where/how found: e.g., 'mentioned in pricing comparison', 'listed as alternative on features page'"
    }
  ],
  "rankedBrandsInNiche": [
    {
      "rank": 1,
      "name": "Market Leader Brand",
      "marketPosition": "why they lead: e.g., 'dominant market share', 'premium positioning', 'innovation leader'",
      "strengths": ["key strength 1", "key strength 2"],
      "estimatedMarketShare": "high/medium/low if discernible"
    }
  ],
  "marketLandscape": {
    "totalAddressableMarket": "market size if mentioned",
    "keyTrends": ["trend 1", "trend 2"],
    "marketMaturity": "emerging/growing/mature/consolidated",
    "competitiveIntensity": "high/medium/low"
  },
  "socialLinks": {
    "twitter": "url or null",
    "linkedin": "url or null",
    "github": "url or null",
    "facebook": "url or null",
    "instagram": "url or null"
  },
  "founded": "Year founded if mentioned",
  "headquarters": "Location if mentioned",
  "employees": "Employee count if mentioned",
  "pricing": "Pricing model/info if found",
  "useCases": ["use case 1", "use case 2"],
  "targetAudience": "Who the product is for",
  "differentiators": ["What makes them unique"]
}

COMPETITOR DETECTION - BE EXTREMELY THOROUGH:
1. Search for "vs", "versus", "compare", "comparison" sections
2. Look for "alternatives to", "instead of", "competitors" pages
3. Find "why choose us" or "why we're different" sections that mention others
4. Check pricing pages for competitor comparisons
5. Look in blog posts for industry comparisons
6. Check testimonials/case studies for mentions of switching from competitors
7. Find integration pages - integrations often imply competitors
8. Look for "unlike [company]", "better than [company]", "cheaper than [company]"
9. Search for partner/competitor ecosystem mentions
10. Check for industry reports, whitepapers, or research that mentions competitors

RANKED BRANDS IN NICHE - BASED ON YOUR KNOWLEDGE:
1. Identify the TOP 5-8 most significant brands in this company's market/niche
2. Rank them by market position, brand recognition, and influence
3. Provide rationale for each brand's position
4. Include both direct competitors and major players in the broader space
5. Consider: market leaders, challengers, niche specialists, emerging players

ONLY include competitors found in the content for the "competitors" array. For "rankedBrandsInNiche", use your comprehensive market knowledge combined with clues from the content.

Website URL: ${normalizedUrl}

Content to analyze:
${html?.substring(0, 25000) || ''}

Respond with valid JSON only.`,
          }
        ],
        responseFormat: { type: 'json_object' },
        temperature: 0.2, // Slightly higher for market analysis insights
        maxTokens: 4000, // Increased for comprehensive analysis
      }
    });
    
    const jsonText = extractionResponse.choices?.[0]?.message?.content || '{}';
    console.log('[scrapeCompanyInfo] AI extraction response:', jsonText.substring(0, 500));
    
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error('[scrapeCompanyInfo] JSON parse error:', e);
      // Try to extract JSON from markdown
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw e;
      }
    }
    
    const object = CompanyInfoSchema.parse(parsed);
    console.log('[scrapeCompanyInfo] Parsed competitors:', object.competitors?.length || 0);
    
    // Merge extracted data from structured extraction if available
    if (extractedData) {
      console.log('[scrapeCompanyInfo] Merging structured extraction data');
      
      // Enhance competitors with structured data if available
      if (extractedData.competitors && extractedData.competitors.length > 0) {
        const enhancedCompetitors = extractedData.competitors.map((c: any) => ({
          name: c.name,
          url: c.url,
          evidence: c.relationship || 'Identified from structured extraction'
        }));
        
        // Merge with AI-extracted competitors, avoiding duplicates
        const existingNames = new Set(object.competitors.map(c => c.name.toLowerCase()));
        for (const comp of enhancedCompetitors) {
          if (!existingNames.has(comp.name.toLowerCase())) {
            object.competitors.push(comp);
          }
        }
      }
      
      // Enhance market landscape if available
      if (extractedData.marketLandscape) {
        object.marketLandscape = {
          ...object.marketLandscape,
          totalAddressableMarket: extractedData.marketLandscape.marketSize || object.marketLandscape?.totalAddressableMarket,
          keyTrends: extractedData.marketLandscape.keyTrends || object.marketLandscape?.keyTrends,
          competitiveIntensity: extractedData.marketLandscape.competitiveIntensity?.toLowerCase() as any || object.marketLandscape?.competitiveIntensity,
        };
      }
    }

    // Extract favicon URL - try multiple sources
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Try to get a high-quality favicon from various sources
    const faviconUrl = metadata?.favicon || 
                      `https://www.google.com/s2/favicons?domain=${domain}&sz=128` ||
                      `${urlObj.origin}/favicon.ico`;
    
    // Transform competitors to expected format with enhanced metadata
    const enhancedCompetitors = object.competitors?.map((comp: any) => ({
      name: comp.name,
      url: comp.url,
      evidence: comp.evidence,
      metadata: {
        description: comp.evidence, // Use evidence as description initially
      }
    })) || [];
    
    // Calculate estimated market share percentages if we have ranked brands
    const rankedBrandsWithShare = object.rankedBrandsInNiche?.map((brand: any, index: number) => {
      // Estimate market share based on rank (higher rank = larger share)
      // Using a power law distribution approximation
      const totalBrands = object.rankedBrandsInNiche?.length || 1;
      const rank = brand.rank || index + 1;
      
      // Calculate approximate market share: leader gets ~30-40%, others follow power law
      let estimatedShare: string;
      if (rank === 1) {
        estimatedShare = '30-40%';
      } else if (rank === 2) {
        estimatedShare = '20-25%';
      } else if (rank === 3) {
        estimatedShare = '10-15%';
      } else if (rank <= 5) {
        estimatedShare = '5-10%';
      } else {
        estimatedShare = '<5%';
      }
      
      return {
        ...brand,
        estimatedMarketShare: brand.estimatedMarketShare || estimatedShare
      };
    }) || [];

    return {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      name: object.name || metadata?.title || '',
      description: object.description || metadata?.description || '',
      industry: object.industry || '',
      logo: metadata?.ogImage || undefined,
      favicon: faviconUrl,
      scraped: true,
      scrapedData: {
        title: object.name || metadata?.title || '',
        description: object.description || metadata?.description || '',
        keywords: object.keywords || [],
        mainContent: html || '',
        mainProducts: object.mainProducts || [],
        competitors: enhancedCompetitors,
        rankedBrandsInNiche: rankedBrandsWithShare,
        marketLandscape: object.marketLandscape || undefined,
        ogImage: metadata?.ogImage || undefined,
        favicon: faviconUrl,
        screenshot: screenshot,
         socialLinks: (object.socialLinks &&
           Object.fromEntries(
             Object.entries(object.socialLinks).filter(([_, v]) => v != null)
           )) || undefined,
        founded: object.founded || undefined,
        headquarters: object.headquarters || undefined,
        employees: object.employees || undefined,
        pricing: object.pricing || undefined,
        useCases: object.useCases || undefined,
        targetAudience: object.targetAudience || undefined,
        differentiators: object.differentiators,
      },
    };
  } catch (error) {
    console.error('Error scraping company info:', error);
    
    // Fallback: extract company name from URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Fallback: extract company name from URL
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace('www.', '');
    const companyName = domain.split('.')[0];
    // Ensure we have a valid company name, fallback to domain if needed
    const formattedName = companyName 
      ? companyName.charAt(0).toUpperCase() + companyName.slice(1)
      : domain || 'Unknown Company';

    return {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      name: formattedName,
      description: `Information about ${formattedName}`,
      industry: 'technology',
      scraped: false,
      scrapedData: {
        title: formattedName,
        description: `Information about ${formattedName}`,
        keywords: [],
        mainContent: '',
        mainProducts: [],
        competitors: [],
        rankedBrandsInNiche: [],
        marketLandscape: undefined,
        ogImage: undefined,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        screenshot: undefined,
        differentiators: undefined,
      },
    };
  }
}

// Firecrawl-based competitor search - searches the web for real competitors
export async function searchCompetitorsWithFirecrawl(
  companyName: string,
  industry?: string,
  description?: string
): Promise<Array<{ name: string; url?: string; evidence?: string }>> {
  try {
    console.log('[searchCompetitorsWithFirecrawl] Searching for competitors of:', companyName);

    // Build search queries to find competitors
    const queries = [
      `${companyName} competitors alternatives`,
      `best ${industry || 'software'} like ${companyName}`,
      `${companyName} vs competitors comparison`,
    ];

    const allCompetitors: Array<{ name: string; url?: string; evidence?: string }> = [];
    const seenNames = new Set<string>();

    for (const query of queries) {
      try {
        console.log('[searchCompetitorsWithFirecrawl] Searching:', query);

        // Use Firecrawl's search endpoint
        const searchResponse = await firecrawl.search(query, {
          limit: 5,
          lang: 'en',
          country: 'US',
        });

        if (!searchResponse.success || !searchResponse.data) {
          console.log('[searchCompetitorsWithFirecrawl] Search failed for:', query);
          continue;
        }

        console.log(`[searchCompetitorsWithFirecrawl] Found ${searchResponse.data.length} results for:`, query);

        // Extract competitor names from search results using Firecrawl extract
        const urls = searchResponse.data.map(r => r.url).filter((url): url is string => typeof url === 'string');

        if (urls.length === 0) continue;

        // Extract structured competitor data from search results
        try {
          const extractResponse = await firecrawl.extract(urls.slice(0, 3), {
            schema: {
              type: 'object',
              properties: {
                competitors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      url: { type: 'string' },
                      relationship: { type: 'string' }
                    }
                  }
                }
              }
            },
            prompt: `Extract competitor company names mentioned in the context of "${companyName}". Look for:
1. Companies compared to ${companyName}
2. Alternatives to ${companyName}
3. Similar ${industry || 'software'} companies
4. Companies in the same market space

Return a list of competitor names found.`
          });

          if (extractResponse.success && extractResponse.data?.competitors) {
            const extracted = extractResponse.data.competitors;
            for (const comp of extracted) {
              if (comp.name && !seenNames.has(comp.name.toLowerCase()) && comp.name.toLowerCase() !== companyName.toLowerCase()) {
                seenNames.add(comp.name.toLowerCase());
                allCompetitors.push({
                  name: comp.name,
                  url: comp.url,
                  evidence: `Found via search: "${query}"`
                });
              }
            }
          }
        } catch (extractError) {
          console.log('[searchCompetitorsWithFirecrawl] Extract failed for query:', query, extractError);
        }

        // Also extract competitor names from search result titles and snippets
        for (const result of searchResponse.data) {
          // Skip the company's own website
          if (result.title?.toLowerCase().includes(companyName.toLowerCase()) ||
              result.url?.toLowerCase().includes(companyName.toLowerCase().replace(/\s+/g, ''))) {
            continue;
          }

          // Try to extract company names from title
          const title = result.title || '';
          const resultDesc = result.description || '';

          // Pattern: "Company vs...", "Best Company Alternatives"
          const titlePatterns = [
            /^(.+?)\s+(?:vs|versus|alternatives|competitors|competitor|review|reviews)/i,
            /(?:vs|versus|alternatives to|competitors of)\s+(.+?)(?:\s+\||\s+-|\s*\(|\s*:\s*|$)/i,
            /^(?:top|best)\s+\d*\s*(.+?)\s+(?:software|tools|platform|app|service)/i,
          ];

          for (const pattern of titlePatterns) {
            const match = title.match(pattern) || resultDesc.match(pattern);
            if (match && match[1]) {
              const potentialName = match[1].trim();
              if (potentialName.length > 1 &&
                  potentialName.length < 50 &&
                  !seenNames.has(potentialName.toLowerCase()) &&
                  potentialName.toLowerCase() !== companyName.toLowerCase() &&
                  !potentialName.toLowerCase().includes(companyName.toLowerCase())) {
                seenNames.add(potentialName.toLowerCase());
                allCompetitors.push({
                  name: potentialName,
                  url: result.url,
                  evidence: `Found in search results: "${title}"`
                });
                break;
              }
            }
          }
        }
      } catch (queryError) {
        console.log('[searchCompetitorsWithFirecrawl] Error with query:', query, queryError);
      }
    }

    // If we still don't have enough competitors, try a direct market search
    if (allCompetitors.length < 5 && industry) {
      try {
        const marketQuery = `top ${industry} companies market leaders`;
        const marketResponse = await firecrawl.search(marketQuery, { limit: 5 });

        if (marketResponse.success && marketResponse.data) {
          for (const result of marketResponse.data) {
            const title = result.title || '';
            // Extract company names from "Top X Companies" style articles
            const companyMatches = title.match(/(?:^|\d+\.\s)([A-Z][A-Za-z0-9\s&]+?)(?:\s*[\-\|:\(\[]|$)/);
            if (companyMatches?.[1]) {
              const name = companyMatches[1].trim();
              if (!seenNames.has(name.toLowerCase()) && name.toLowerCase() !== companyName.toLowerCase()) {
                seenNames.add(name.toLowerCase());
                allCompetitors.push({
                  name,
                  url: result.url,
                  evidence: `Market leader in ${industry}`
                });
              }
            }
          }
        }
      } catch (marketError) {
        console.log('[searchCompetitorsWithFirecrawl] Market search failed:', marketError);
      }
    }

    console.log('[searchCompetitorsWithFirecrawl] Total unique competitors found:', allCompetitors.length);
    return allCompetitors.slice(0, 9);

  } catch (error) {
    console.error('[searchCompetitorsWithFirecrawl] Error:', error);
    return [];
  }
} 