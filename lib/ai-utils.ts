import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { Company, BrandPrompt, AIResponse, CompanyRanking, CompetitorRanking, ProviderSpecificRanking, ProviderComparisonData, ProgressCallback, CompetitorFoundData } from './types';
import { getProviderModel, normalizeProviderName, isProviderConfigured, getConfiguredProviders, PROVIDER_CONFIGS } from './provider-config';
import { detectBrandMention, detectMultipleBrands, BrandDetectionOptions } from './brand-detection-utils';
import { getBrandDetectionOptions } from './brand-detection-config';
import { getOpenRouterClient } from './openrouter-provider';
import { searchCompetitorsWithFirecrawl } from './scrape-utils';

const RankingSchema = z.object({
  rankings: z.array(z.object({
    position: z.number(),
    company: z.string(),
    reason: z.string().optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  })).default([]),
  analysis: z.object({
    brandMentioned: z.boolean().default(false),
    brandPosition: z.number().nullable().optional(),
    competitors: z.array(z.string()).default([]),
    overallSentiment: z.enum(['positive', 'neutral', 'negative']).default('neutral'),
    confidence: z.number().min(0).max(1).default(0.5),
  }).default({
    brandMentioned: false,
    competitors: [],
    overallSentiment: 'neutral',
    confidence: 0.5,
  }),
});

const CompetitorSchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    description: z.string(),
    isDirectCompetitor: z.boolean(),
    marketOverlap: z.enum(['high', 'medium', 'low']),
    businessModel: z.string().describe('e.g., DTC brand, SaaS, API service, marketplace'),
    competitorType: z.enum(['direct', 'indirect', 'retailer', 'platform']).describe('direct = same products, indirect = adjacent products, retailer = sells products, platform = aggregates'),
  })),
});

export async function identifyCompetitors(company: Company, progressCallback?: ProgressCallback): Promise<string[]> {
  console.log('[identifyCompetitors] START - company:', company?.name, 'industry:', company?.industry);

  // First, check if we have competitors from scraping with rich metadata
  if (company.scrapedData?.competitors && company.scrapedData.competitors.length > 0) {
    console.log('[identifyCompetitors] Using scraped competitors:', company.scrapedData.competitors);

    // Handle both string[] and ScrapedCompetitor[] formats
    const scrapedCompetitors = company.scrapedData.competitors.map((c: any) => {
      if (typeof c === 'string') return c;
      return c.name;
    }).filter(Boolean);

    if (scrapedCompetitors.length >= 3) {
      console.log('[identifyCompetitors] Sufficient scraped competitors found:', scrapedCompetitors.length);

      // Send progress events
      if (progressCallback) {
        for (let i = 0; i < scrapedCompetitors.length; i++) {
          progressCallback({
            type: 'competitor-found',
            stage: 'identifying-competitors',
            data: {
              competitor: scrapedCompetitors[i],
              index: i + 1,
              total: scrapedCompetitors.length
            } as CompetitorFoundData,
            timestamp: new Date()
          });
        }
      }
      return scrapedCompetitors.slice(0, 9);
    }
  }

  // If no scraped competitors or insufficient, try Firecrawl web search
  try {
    console.log('[identifyCompetitors] Using Firecrawl to search for real competitors');

    const firecrawlCompetitors = await searchCompetitorsWithFirecrawl(
      company.name,
      company.industry,
      company.description
    );

    if (firecrawlCompetitors.length > 0) {
      const competitorNames = firecrawlCompetitors.map(c => c.name);
      console.log('[identifyCompetitors] Firecrawl found real competitors:', competitorNames);

      // Send progress events
      if (progressCallback) {
        for (let i = 0; i < competitorNames.length; i++) {
          progressCallback({
            type: 'competitor-found',
            stage: 'identifying-competitors',
            data: {
              competitor: competitorNames[i],
              index: i + 1,
              total: competitorNames.length
            } as CompetitorFoundData,
            timestamp: new Date()
          });
        }
      }
      return competitorNames.slice(0, 9);
    }

    console.log('[identifyCompetitors] Firecrawl found no competitors, falling back to AI');
  } catch (firecrawlError) {
    console.error('[identifyCompetitors] Firecrawl search failed:', firecrawlError);
  }

  // Fallback: try AI-based identification if Firecrawl fails
  try {
    const openRouter = getOpenRouterClient();
    if (openRouter) {
      console.log('[identifyCompetitors] Using OpenRouter for competitor identification (fallback)');

      const prompt = `Identify 6-9 real, established competitors of ${company.name} in the ${company.industry || 'technology'} industry.

Company: ${company.name}
Industry: ${company.industry || 'technology'}
Description: ${company.description || 'N/A'}
${company.scrapedData?.keywords ? `Keywords: ${company.scrapedData.keywords.join(', ')}` : ''}

Based on this company's specific business model and target market, identify ONLY direct competitors.

Return ONLY a JSON object in this exact format:
{
  "competitors": [
    {"name": "Competitor Name 1"},
    {"name": "Competitor Name 2"},
    {"name": "Competitor Name 3"}
  ]
}

Rules:
- Include 6-9 well-known competitors in the same industry
- Focus on companies offering similar products/services
- Do NOT include retailers or marketplaces unless the company itself is one
- Only return the JSON object, no markdown, no explanation`;

      try {
        const response = await openRouter.chat.send({
          chatRequest: {
            model: 'minimax/minimax-m2.7',
            messages: [
              { role: 'system', content: 'You are an expert competitive intelligence analyst with deep market knowledge. Return ONLY valid JSON with accurate, real competitors.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            responseFormat: { type: 'json_object' },
            maxTokens: 2000,
          }
        });

        const content = response.choices?.[0]?.message?.content || '{}';
        console.log('[identifyCompetitors] OpenRouter raw response:', content.substring(0, 200));

        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          // Try extracting JSON from markdown
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]);
          } else {
            throw e;
          }
        }

        const competitors = parsed.competitors?.map((c: any) => c.name || c).filter(Boolean) || [];
        console.log('[identifyCompetitors] OpenRouter found competitors:', competitors);

        if (competitors.length > 0) {
          // Send progress events
          if (progressCallback) {
            for (let i = 0; i < competitors.length; i++) {
              progressCallback({
                type: 'competitor-found',
                stage: 'identifying-competitors',
                data: {
                  competitor: competitors[i],
                  index: i + 1,
                  total: competitors.length
                } as CompetitorFoundData,
                timestamp: new Date()
              });
            }
          }
          return competitors.slice(0, 9);
        }
      } catch (openRouterError) {
        console.error('[identifyCompetitors] OpenRouter failed:', openRouterError);
      }
    }

    // Fallback: try configured providers via ai SDK
    console.log('[identifyCompetitors] Trying ai SDK providers...');
    const configuredProviders = getConfiguredProviders();
    console.log('[identifyCompetitors] Configured providers:', configuredProviders.length);

    if (configuredProviders.length === 0) {
      console.log('[identifyCompetitors] No ai SDK providers, using fallback competitors');
      return getFallbackCompetitors(company.industry || 'technology');
    }

    const provider = configuredProviders[0];
    const model = getProviderModel(provider.id, provider.defaultModel);

    if (!model) {
      console.log('[identifyCompetitors] No model available, using fallback');
      return getFallbackCompetitors(company.industry || 'technology');
    }

    const prompt = `Identify 6-9 real competitors of ${company.name} in the ${company.industry || 'technology'} industry.
Company: ${company.name}
Industry: ${company.industry}
Description: ${company.description}`;

    const { object } = await generateObject({
      model,
      schema: CompetitorSchema,
      prompt,
      temperature: 0.3,
    });

    const competitors = object.competitors
      .filter((c: any) => c.competitorType === 'direct' || (c.competitorType === 'indirect' && c.marketOverlap === 'high'))
      .map((c: any) => c.name)
      .slice(0, 9);

    console.log('[identifyCompetitors] ai SDK found competitors:', competitors);
    return competitors;

  } catch (error) {
    console.error('[identifyCompetitors] TOP LEVEL ERROR:', error);
    return getFallbackCompetitors(company.industry || 'technology');
  }
}

// Fallback competitors when AI fails
function getFallbackCompetitors(industry: string): string[] {
  const fallbacks: Record<string, string[]> = {
    'technology': ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Salesforce'],
    'software': ['Atlassian', 'Slack', 'Zoom', 'Dropbox', 'Notion', 'Asana'],
    'web scraping': ['Scrapy', 'Beautiful Soup', 'Puppeteer', 'Playwright', 'Selenium', 'Apify'],
    'e-commerce': ['Shopify', 'WooCommerce', 'BigCommerce', 'Magento', 'Squarespace', 'Wix'],
    'SaaS': ['Salesforce', 'HubSpot', 'Zendesk', 'Slack', 'Monday.com', 'Asana'],
    'cloud': ['AWS', 'Azure', 'Google Cloud', 'DigitalOcean', 'Heroku', 'Vercel'],
    'payment': ['Stripe', 'PayPal', 'Square', 'Adyen', 'Braintree', 'Chargebee'],
  };

  const lowerIndustry = industry.toLowerCase();
  for (const [key, competitors] of Object.entries(fallbacks)) {
    if (lowerIndustry.includes(key)) return competitors;
  }

  return fallbacks['technology'];
}

/**
 * Get industry competitors based on keywords
 */
function getIndustryCompetitorsFromKeywords(keywords: string[], industry?: string): string[] {
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
  const industryLower = industry?.toLowerCase() || '';

  // Industry-specific competitor mappings
  const industryCompetitors: Record<string, string[]> = {
    'web scraping': ['ScrapingBee', 'Scrapy Cloud', 'Octoparse', 'ParseHub', 'Bright Data', 'Apify', 'ScraperAPI'],
    'data extraction': ['Import.io', 'Diffbot', 'ScrapingBee', 'Octoparse', 'ParseHub'],
    'api': ['Postman', 'Swagger', 'RapidAPI', 'Stoplight', 'Insomnia'],
    'coolers': ['YETI', 'RTIC', 'Pelican', 'Igloo', 'Coleman', 'Orca', 'Bison'],
    'drinkware': ['YETI', 'Hydro Flask', 'Stanley', 'Contigo', 'S\'well', 'Corkcicle'],
    'outdoor': ['YETI', 'Patagonia', 'The North Face', 'Arc\'teryx', 'Columbia', 'REI Co-op'],
    'e-commerce': ['Shopify', 'BigCommerce', 'WooCommerce', 'Magento', 'Wix', 'Squarespace'],
    'email': ['Mailchimp', 'SendGrid', 'ConvertKit', 'Klaviyo', 'ActiveCampaign', 'HubSpot'],
    'analytics': ['Google Analytics', 'Mixpanel', 'Amplitude', 'Heap', 'Segment', 'Plausible'],
    'ai': ['OpenAI', 'Anthropic', 'Cohere', 'AI21 Labs', 'Hugging Face', 'Stability AI'],
    'crm': ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho', 'Freshsales', 'Monday.com'],
  };

  // Check for industry match
  for (const [key, competitors] of Object.entries(industryCompetitors)) {
    if (industryLower.includes(key) || keywordSet.has(key)) {
      return competitors;
    }
  }

  // Check keywords
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    for (const [key, competitors] of Object.entries(industryCompetitors)) {
      if (lowerKeyword.includes(key) || key.includes(lowerKeyword)) {
        return competitors;
      }
    }
  }

  return [];
}

// Enhanced industry detection function
async function detectIndustryFromContent(company: Company): Promise<string> {
  // Start with explicit industry if set
  if (company.industry) {
    return company.industry;
  }

  // Analyze scraped content for better industry detection
  if (company.scrapedData) {
    const { title, description, mainContent, keywords } = company.scrapedData;
    
    // Combine all text content for analysis
    const allContent = [title, description, mainContent, ...(keywords || [])].join(' ').toLowerCase();
    
    // Enhanced keyword detection with context
    if (allContent.includes('web scraping') ||
        allContent.includes('scraping') ||
        allContent.includes('crawling') ||
        allContent.includes('web crawler') ||
        allContent.includes('data extraction') ||
        allContent.includes('html parsing')) {
      return 'web scraping';
    }
    
    if (allContent.includes('artificial intelligence') ||
        allContent.includes('machine learning') ||
        allContent.includes('ai model') ||
        allContent.includes('llm') ||
        allContent.includes('natural language')) {
      return 'artificial intelligence';
    }
    
    if (allContent.includes('deployment') ||
        allContent.includes('hosting') ||
        allContent.includes('cloud platform') ||
        allContent.includes('server') ||
        allContent.includes('infrastructure')) {
      return 'deployment platform';
    }
    
    if (allContent.includes('e-commerce') ||
        allContent.includes('ecommerce') ||
        allContent.includes('online store') ||
        allContent.includes('shopping cart')) {
      return 'e-commerce';
    }
    
    // Use first keyword as fallback
    if (keywords && keywords.length > 0) {
      return keywords[0];
    }
  }
  
  return 'technology';
}

// Sector types for tailored prompt generation
type Sector = 'saas' | 'ecommerce' | 'outdoor_gear' | 'ai_ml' | 'fintech' | 'healthcare' | 'consumer_goods' | 'b2b_software' | 'education' | 'real_estate' | 'travel' | 'food_beverage' | 'fitness' | 'marketing' | 'general';

/**
 * Determine the sector based on company data
 */
function determineSector(
  company: Company,
  keywords: string[],
  mainProducts: string[],
  productContext: string,
  categoryContext: string
): Sector {
  const allContext = `${company.industry || ''} ${productContext} ${categoryContext} ${keywords.join(' ')} ${mainProducts.join(' ')}`.toLowerCase();

  // Education sector detection (check before AI to avoid misclassification)
  if (allContext.includes('education') ||
      allContext.includes('learning platform') ||
      allContext.includes('online course') ||
      allContext.includes('e-learning') ||
      allContext.includes('student') ||
      allContext.includes('academic') ||
      allContext.includes('school') ||
      allContext.includes('university') ||
      allContext.includes('training') ||
      allContext.includes('certification') ||
      allContext.includes('tutoring') ||
      allContext.includes('edtech')) {
    return 'education';
  }

  // Real estate sector detection
  if (allContext.includes('real estate') ||
      allContext.includes('property') ||
      allContext.includes('housing') ||
      allContext.includes('mortgage') ||
      allContext.includes('rental') ||
      allContext.includes('apartment') ||
      allContext.includes('home buying') ||
      allContext.includes('listing') ||
      allContext.includes('commercial real estate')) {
    return 'real_estate';
  }

  // Travel sector detection
  if (allContext.includes('travel') ||
      allContext.includes('booking') ||
      allContext.includes('hotel') ||
      allContext.includes('flight') ||
      allContext.includes('vacation') ||
      allContext.includes('tourism') ||
      allContext.includes('trip planning') ||
      allContext.includes('destination') ||
      allContext.includes('airline') ||
      allContext.includes('accommodation')) {
    return 'travel';
  }

  // Food & beverage sector detection
  if (allContext.includes('food') ||
      allContext.includes('restaurant') ||
      allContext.includes('delivery') ||
      allContext.includes('meal') ||
      allContext.includes('catering') ||
      allContext.includes('grocery') ||
      allContext.includes('beverage') ||
      allContext.includes('recipe') ||
      allContext.includes('kitchen') ||
      allContext.includes('dining')) {
    // Make sure it's not a cooler/outdoor gear company misclassified as beverage
    if (!allContext.includes('cooler') && !allContext.includes('insulated') && !allContext.includes('yeti')) {
      return 'food_beverage';
    }
  }

  // Fitness sector detection
  if (allContext.includes('fitness') ||
      allContext.includes('workout') ||
      allContext.includes('gym') ||
      allContext.includes('exercise') ||
      allContext.includes('training') ||
      allContext.includes('wellness') ||
      allContext.includes('health') ||
      allContext.includes('yoga') ||
      allContext.includes('nutrition') ||
      allContext.includes('personal trainer')) {
    return 'fitness';
  }

  // Marketing sector detection
  if (allContext.includes('marketing') ||
      allContext.includes('advertising') ||
      allContext.includes('seo') ||
      allContext.includes('social media') ||
      allContext.includes('content marketing') ||
      allContext.includes('email marketing') ||
      allContext.includes('lead generation') ||
      allContext.includes('campaign') ||
      allContext.includes('analytics')) {
    return 'marketing';
  }

  // AI/ML sector detection - STRICT: must be AI-first company
  // Only classify as AI if multiple strong AI signals OR core AI terminology
  const aiSignals = [
    'artificial intelligence platform',
    'ai platform',
    'ai api',
    'machine learning platform',
    'llm api',
    'generative ai',
    'ai model',
    'computer vision',
    'natural language processing',
    'nlp api',
    'ai inference',
    'foundation model',
    'large language model'
  ];
  const hasStrongAISignal = aiSignals.some(signal => allContext.includes(signal));
  const aiMentions = ['llm', 'ai api', 'ml platform', 'neural network', 'deep learning'].filter(term => allContext.includes(term)).length;
  
  if (hasStrongAISignal || aiMentions >= 2) {
    return 'ai_ml';
  }

  // SaaS / B2B Software detection
  if (allContext.includes('saas') ||
      allContext.includes('software as a service') ||
      allContext.includes('api') ||
      allContext.includes('platform') && allContext.includes('business')) {
    return 'saas';
  }

  // E-commerce detection
  if (allContext.includes('e-commerce') ||
      allContext.includes('ecommerce') ||
      allContext.includes('online store') ||
      allContext.includes('marketplace') ||
      allContext.includes('retail') && allContext.includes('online')) {
    return 'ecommerce';
  }

  // Outdoor gear detection
  if (allContext.includes('outdoor') ||
      allContext.includes('camping') ||
      allContext.includes('hiking') ||
      allContext.includes('cooler') ||
      allContext.includes('tumbler') ||
      allContext.includes('drinkware') && allContext.includes('outdoor')) {
    return 'outdoor_gear';
  }

  // Fintech detection
  if (allContext.includes('fintech') ||
      allContext.includes('payment') ||
      allContext.includes('banking') ||
      allContext.includes('financial') ||
      allContext.includes('crypto') ||
      allContext.includes('blockchain')) {
    return 'fintech';
  }

  // Healthcare detection
  if (allContext.includes('healthcare') ||
      allContext.includes('medical') ||
      allContext.includes('health') && allContext.includes('tech') ||
      allContext.includes('telemedicine') ||
      allContext.includes('electronic health')) {
    return 'healthcare';
  }

  // Consumer goods detection
  if (allContext.includes('consumer') ||
      allContext.includes('lifestyle') ||
      allContext.includes('apparel') ||
      allContext.includes('fashion') ||
      allContext.includes('beauty') ||
      allContext.includes('home goods')) {
    return 'consumer_goods';
  }

  // B2B Software detection (general business tools)
  if (allContext.includes('b2b') ||
      allContext.includes('enterprise') ||
      allContext.includes('business tool') ||
      allContext.includes('productivity') ||
      allContext.includes('collaboration')) {
    return 'b2b_software';
  }

  return 'general';
}

/**
 * Generate sector-specific prompts tailored to industry features
 */
function generateSectorPrompts(
  sector: Sector,
  brandName: string,
  productContext: string,
  categoryContext: string,
  mainProducts: string[],
  keywords: string[],
  competitors: string[]
): Array<{ prompt: string; category: BrandPrompt['category'] }> {
  const prompts: Array<{ prompt: string; category: BrandPrompt['category'] }> = [];

  switch (sector) {
    case 'saas':
      prompts.push(
        { prompt: `best ${productContext} for enterprise teams`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} feature comparison`, category: 'comparison' },
        { prompt: `most secure ${productContext} solutions`, category: 'ranking' },
        { prompt: `${brandName} API documentation and integration options`, category: 'recommendations' },
        { prompt: `scalable ${productContext} for growing companies`, category: 'recommendations' },
        { prompt: `${brandName} pricing vs competitors value analysis`, category: 'comparison' },
        { prompt: `best ${productContext} with free trial period`, category: 'alternatives' },
        { prompt: `${brandName} customer support quality compared to others`, category: 'comparison' }
      );
      break;

    case 'ai_ml':
      prompts.push(
        { prompt: `most accurate ${productContext} models`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'alternatives'} AI capabilities`, category: 'comparison' },
        { prompt: `cost-effective ${productContext} APIs`, category: 'alternatives' },
        { prompt: `best ${productContext} for developers`, category: 'ranking' },
        { prompt: `${brandName} model performance benchmarks`, category: 'recommendations' },
        { prompt: `enterprise-grade ${productContext} solutions`, category: 'ranking' },
        { prompt: `${brandName} integration with existing ML pipelines`, category: 'recommendations' },
        { prompt: `top ${productContext} by inference speed`, category: 'ranking' }
      );
      break;

    case 'outdoor_gear':
      prompts.push(
        { prompt: `most durable ${productContext} for outdoor adventures`, category: 'ranking' },
        { prompt: `${brandName} ${mainProducts[0] || 'products'} durability vs ${competitors[0] || 'competitors'}`, category: 'comparison' },
        { prompt: `best ${productContext} for camping and hiking`, category: 'recommendations' },
        { prompt: `${brandName} warranty and customer service reviews`, category: 'recommendations' },
        { prompt: `high-quality ${productContext} under $200`, category: 'alternatives' },
        { prompt: `${brandName} sustainability and eco-friendly practices`, category: 'comparison' },
        { prompt: `best ${productContext} for extreme weather conditions`, category: 'ranking' },
        { prompt: `${brandName} vs premium outdoor gear brands`, category: 'comparison' }
      );
      break;

    case 'ecommerce':
      prompts.push(
        { prompt: `fastest ${productContext} for online sellers`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'Shopify'} checkout conversion rates`, category: 'comparison' },
        { prompt: `most affordable ${productContext} for small business`, category: 'alternatives' },
        { prompt: `${brandName} payment processing and fees`, category: 'recommendations' },
        { prompt: `best ${productContext} for international shipping`, category: 'ranking' },
        { prompt: `${brandName} mobile shopping experience quality`, category: 'recommendations' },
        { prompt: `top ${productContext} with best SEO features`, category: 'ranking' },
        { prompt: `${brandName} vs competitors inventory management`, category: 'comparison' }
      );
      break;

    case 'fintech':
      prompts.push(
        { prompt: `most secure ${productContext} for payments`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'Stripe'} transaction fees`, category: 'comparison' },
        { prompt: `compliant ${productContext} for international transfers`, category: 'alternatives' },
        { prompt: `${brandName} fraud protection capabilities`, category: 'recommendations' },
        { prompt: `fastest ${productContext} for instant payouts`, category: 'ranking' },
        { prompt: `${brandName} developer documentation quality`, category: 'recommendations' },
        { prompt: `best ${productContext} for subscription billing`, category: 'ranking' },
        { prompt: `${brandName} vs competitors API reliability`, category: 'comparison' }
      );
      break;

    case 'healthcare':
      prompts.push(
        { prompt: `HIPAA-compliant ${productContext} solutions`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} patient data security`, category: 'comparison' },
        { prompt: `user-friendly ${productContext} for telemedicine`, category: 'alternatives' },
        { prompt: `${brandName} integration with EHR systems`, category: 'recommendations' },
        { prompt: `most reliable ${productContext} for healthcare providers`, category: 'ranking' },
        { prompt: `${brandName} uptime and reliability statistics`, category: 'recommendations' },
        { prompt: `best ${productContext} for remote patient monitoring`, category: 'ranking' },
        { prompt: `${brandName} vs competitors regulatory compliance`, category: 'comparison' }
      );
      break;

    case 'b2b_software':
      prompts.push(
        { prompt: `best ${productContext} for team collaboration`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} enterprise features`, category: 'comparison' },
        { prompt: `affordable ${productContext} for startups`, category: 'alternatives' },
        { prompt: `${brandName} onboarding and training resources`, category: 'recommendations' },
        { prompt: `most integrated ${productContext} with Slack and Microsoft`, category: 'ranking' },
        { prompt: `${brandName} customer success stories and case studies`, category: 'recommendations' },
        { prompt: `top ${productContext} for remote teams`, category: 'ranking' },
        { prompt: `${brandName} vs competitors SSO and security features`, category: 'comparison' }
      );
      break;

    case 'consumer_goods':
      prompts.push(
        { prompt: `highest quality ${productContext} brands`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} material quality`, category: 'comparison' },
        { prompt: `sustainable and ethical ${productContext} alternatives`, category: 'alternatives' },
        { prompt: `${brandName} customer reviews and ratings`, category: 'recommendations' },
        { prompt: `best value ${productContext} for money`, category: 'ranking' },
        { prompt: `${brandName} shipping and return policy comparison`, category: 'comparison' },
        { prompt: `most popular ${productContext} on social media`, category: 'ranking' },
        { prompt: `${brandName} vs premium brand alternatives`, category: 'comparison' }
      );
      break;

    case 'education':
      prompts.push(
        { prompt: `best ${productContext} for student engagement`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} course completion rates`, category: 'comparison' },
        { prompt: `affordable ${productContext} for schools`, category: 'alternatives' },
        { prompt: `${brandName} certification and accreditation value`, category: 'recommendations' },
        { prompt: `most effective ${productContext} for skill development`, category: 'ranking' },
        { prompt: `${brandName} instructor quality vs competitors`, category: 'comparison' },
        { prompt: `top ${productContext} for career advancement`, category: 'ranking' },
        { prompt: `${brandName} learning outcomes and student success`, category: 'recommendations' }
      );
      break;

    case 'real_estate':
      prompts.push(
        { prompt: `best ${productContext} for property searches`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} listing accuracy`, category: 'comparison' },
        { prompt: `${productContext} with lowest fees for agents`, category: 'alternatives' },
        { prompt: `${brandName} market data and analytics quality`, category: 'recommendations' },
        { prompt: `most reliable ${productContext} for homebuyers`, category: 'ranking' },
        { prompt: `${brandName} lead generation vs competitors`, category: 'comparison' },
        { prompt: `top ${productContext} for commercial real estate`, category: 'ranking' },
        { prompt: `${brandName} customer support for agents and brokers`, category: 'recommendations' }
      );
      break;

    case 'travel':
      prompts.push(
        { prompt: `best ${productContext} for booking deals`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} price comparison`, category: 'comparison' },
        { prompt: `cheaper alternatives to ${brandName} for ${productContext}`, category: 'alternatives' },
        { prompt: `${brandName} customer service during travel disruptions`, category: 'recommendations' },
        { prompt: `most user-friendly ${productContext} for trip planning`, category: 'ranking' },
        { prompt: `${brandName} loyalty rewards vs competitors`, category: 'comparison' },
        { prompt: `top ${productContext} for last-minute bookings`, category: 'ranking' },
        { prompt: `${brandName} cancellation policy vs alternatives`, category: 'comparison' }
      );
      break;

    case 'food_beverage':
      prompts.push(
        { prompt: `best ${productContext} for food delivery`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} delivery speed`, category: 'comparison' },
        { prompt: `healthier alternatives to ${brandName} ${productContext}`, category: 'alternatives' },
        { prompt: `${brandName} food quality and freshness reviews`, category: 'recommendations' },
        { prompt: `most affordable ${productContext} for families`, category: 'ranking' },
        { prompt: `${brandName} menu variety vs competitors`, category: 'comparison' },
        { prompt: `top rated ${productContext} in local markets`, category: 'ranking' },
        { prompt: `${brandName} sustainability and sourcing practices`, category: 'comparison' }
      );
      break;

    case 'fitness':
      prompts.push(
        { prompt: `best ${productContext} for workout results`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} trainer quality`, category: 'comparison' },
        { prompt: `affordable ${productContext} for beginners`, category: 'alternatives' },
        { prompt: `${brandName} program effectiveness and user success stories`, category: 'recommendations' },
        { prompt: `most convenient ${productContext} for busy schedules`, category: 'ranking' },
        { prompt: `${brandName} equipment and facilities vs competitors`, category: 'comparison' },
        { prompt: `top ${productContext} for weight loss goals`, category: 'ranking' },
        { prompt: `${brandName} community and motivation features`, category: 'recommendations' }
      );
      break;

    case 'marketing':
      prompts.push(
        { prompt: `best ${productContext} for ROI and conversions`, category: 'ranking' },
        { prompt: `${brandName} vs ${competitors[0] || 'competitors'} analytics accuracy`, category: 'comparison' },
        { prompt: `${productContext} with better free plans`, category: 'alternatives' },
        { prompt: `${brandName} ease of use for non-technical marketers`, category: 'recommendations' },
        { prompt: `most comprehensive ${productContext} for small business`, category: 'ranking' },
        { prompt: `${brandName} integration capabilities vs competitors`, category: 'comparison' },
        { prompt: `top ${productContext} for social media management`, category: 'ranking' },
        { prompt: `${brandName} customer support and onboarding quality`, category: 'recommendations' }
      );
      break;

    default:
      // General prompts for unrecognized sectors
      prompts.push(
        { prompt: `top rated ${productContext} providers`, category: 'ranking' },
        { prompt: `${brandName} vs leading competitors`, category: 'comparison' },
        { prompt: `best alternatives to ${brandName}`, category: 'alternatives' },
        { prompt: `is ${brandName} worth the investment`, category: 'recommendations' }
      );
  }

  return prompts;
}

export async function generatePromptsForCompany(company: Company, competitors: string[]): Promise<BrandPrompt[]> {
  const prompts: BrandPrompt[] = [];
  let promptId = 0;

  const brandName = company.name;
  
  // Extract context from scraped data
  const scrapedData = company.scrapedData;
  const keywords = scrapedData?.keywords || [];
  const mainProducts = scrapedData?.mainProducts || [];
  const description = scrapedData?.description || company.description || '';
  
  // Debug log to see what data we're working with
  console.log('Generating prompts for:', {
    brandName,
    industry: company.industry,
    mainProducts,
    keywords: keywords.slice(0, 5),
    competitors: competitors.slice(0, 5)
  });
  
  // Build a more specific context from the scraped data
  let productContext = '';
  let categoryContext = '';
  
  // If we have specific products, use those first
  if (mainProducts.length > 0) {
    productContext = mainProducts.slice(0, 2).join(' and ');
    // Infer category from products
    const productsLower = mainProducts.join(' ').toLowerCase();
    if (productsLower.includes('cooler') || productsLower.includes('drinkware')) {
      categoryContext = 'outdoor gear brands';
    } else if (productsLower.includes('software') || productsLower.includes('api')) {
      categoryContext = 'software companies';
    } else {
      categoryContext = `${mainProducts[0]} brands`;
    }
  }
  
  // Analyze keywords and description to understand what the company actually does
  const keywordsLower = keywords.map(k => k.toLowerCase()).join(' ');
  const descLower = description.toLowerCase();
  const allContext = `${keywordsLower} ${descLower} ${mainProducts.join(' ')}`;
  
  // Only determine category if we don't already have it from mainProducts
  if (!productContext) {
    // Check industry first for more accurate categorization
    const industryLower = (company.industry || '').toLowerCase();
    
    if (industryLower === 'outdoor gear' || allContext.includes('cooler') || allContext.includes('drinkware') || allContext.includes('tumbler') || allContext.includes('outdoor')) {
      productContext = 'coolers and drinkware';
      categoryContext = 'outdoor gear brands';
    } else if (industryLower === 'web scraping' || allContext.includes('web scraping') || allContext.includes('data extraction') || allContext.includes('crawler')) {
      productContext = 'web scraping tools';
      categoryContext = 'data extraction services';
    } else if (allContext.includes('ai') || allContext.includes('artificial intelligence') || allContext.includes('machine learning')) {
      productContext = 'AI tools';
      categoryContext = 'artificial intelligence platforms';
    } else if (allContext.includes('software') || allContext.includes('saas') || allContext.includes('application')) {
      productContext = 'software solutions';
      categoryContext = 'SaaS platforms';
    } else if (allContext.includes('clothing') || allContext.includes('apparel') || allContext.includes('fashion')) {
      productContext = 'clothing and apparel';
      categoryContext = 'fashion brands';
    } else if (allContext.includes('furniture') || allContext.includes('home') || allContext.includes('decor')) {
      productContext = 'furniture and home goods';
      categoryContext = 'home furnishing brands';
    } else {
      // Fallback: use the most prominent keywords, but avoid misclassifications
      productContext = keywords.slice(0, 3).join(' and ') || 'products';
      categoryContext = company.industry || 'companies';
    }
  }
  
  // Safety check: if we somehow got "beverage" but it's clearly not a beverage company
  if (productContext.includes('beverage') && (brandName.toLowerCase() === 'yeti' || allContext.includes('cooler'))) {
    productContext = 'coolers and outdoor gear';
    categoryContext = 'outdoor equipment brands';
  }

  // Determine sector for tailored prompts
  const sector = determineSector(company, keywords, mainProducts, productContext, categoryContext);

  // Generate sector-specific prompts
  const sectorPrompts = generateSectorPrompts(sector, brandName, productContext, categoryContext, mainProducts, keywords, competitors);

  // Generate contextually relevant prompts (base templates) - only for general sector or as supplements
  // These are designed to be more natural and industry-specific
  const getSectorSpecificContext = () => {
    switch (sector) {
      case 'outdoor_gear':
        return {
          ranking: [
            `most durable ${productContext} for outdoor use`,
            `highest rated ${categoryContext} by outdoor enthusiasts`,
          ],
          comparison: [
            `${brandName} build quality compared to ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with best warranty coverage`,
          ],
          recommendations: [
            `why choose ${brandName} for ${productContext}`,
          ],
        };
      case 'saas':
      case 'b2b_software':
        return {
          ranking: [
            `most reliable ${productContext} for business use`,
            `${categoryContext} with best customer support`,
          ],
          comparison: [
            `${brandName} features vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with easiest setup process`,
          ],
          recommendations: [
            `why businesses choose ${brandName} for ${productContext}`,
          ],
        };
      case 'ecommerce':
        return {
          ranking: [
            `fastest ${productContext} for online stores`,
            `most scalable ${categoryContext} for growing businesses`,
          ],
          comparison: [
            `${brandName} transaction fees vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with best built-in marketing tools`,
          ],
          recommendations: [
            `why sellers choose ${brandName} for ${productContext}`,
          ],
        };
      case 'fintech':
        return {
          ranking: [
            `most secure ${productContext} for financial transactions`,
            `fastest ${categoryContext} for payment processing`,
          ],
          comparison: [
            `${brandName} compliance standards vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with lowest transaction fees`,
          ],
          recommendations: [
            `why businesses trust ${brandName} for ${productContext}`,
          ],
        };
      case 'healthcare':
        return {
          ranking: [
            `most secure ${productContext} for patient data`,
            `${categoryContext} with best EMR integration`,
          ],
          comparison: [
            `${brandName} HIPAA compliance vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with best telehealth features`,
          ],
          recommendations: [
            `why providers choose ${brandName} for ${productContext}`,
          ],
        };
      case 'consumer_goods':
        return {
          ranking: [
            `best quality ${productContext} available`,
            `most popular ${categoryContext} this year`,
          ],
          comparison: [
            `${brandName} quality vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with best customer reviews`,
          ],
          recommendations: [
            `why customers prefer ${brandName} ${productContext}`,
          ],
        };
      case 'education':
        return {
          ranking: [
            `most engaging ${productContext} for students`,
            `highest rated ${categoryContext} by educators`,
          ],
          comparison: [
            `${brandName} learning outcomes vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with best certification value`,
          ],
          recommendations: [
            `why students choose ${brandName} for ${productContext}`,
          ],
        };
      case 'real_estate':
        return {
          ranking: [
            `most accurate ${productContext} for property data`,
            `${categoryContext} with best market insights`,
          ],
          comparison: [
            `${brandName} listing reach vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with best lead generation`,
          ],
          recommendations: [
            `why agents choose ${brandName} for ${productContext}`,
          ],
        };
      case 'travel':
        return {
          ranking: [
            `most reliable ${productContext} for bookings`,
            `${categoryContext} with best price guarantees`,
          ],
          comparison: [
            `${brandName} cancellation policy vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with best loyalty rewards`,
          ],
          recommendations: [
            `why travelers book with ${brandName} for ${productContext}`,
          ],
        };
      case 'food_beverage':
        return {
          ranking: [
            `fastest ${productContext} for delivery`,
            `highest rated ${categoryContext} by customers`,
          ],
          comparison: [
            `${brandName} food quality vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with healthiest options`,
          ],
          recommendations: [
            `why customers order from ${brandName} for ${productContext}`,
          ],
        };
      case 'fitness':
        return {
          ranking: [
            `most effective ${productContext} for results`,
            `highest rated ${categoryContext} by members`,
          ],
          comparison: [
            `${brandName} trainer quality vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with flexible scheduling`,
          ],
          recommendations: [
            `why people choose ${brandName} for ${productContext}`,
          ],
        };
      case 'marketing':
        return {
          ranking: [
            `most effective ${productContext} for campaigns`,
            `${categoryContext} with best analytics`,
          ],
          comparison: [
            `${brandName} ROI vs ${competitors[0] || 'competitors'}`,
          ],
          alternatives: [
            `${productContext} with easiest automation`,
          ],
          recommendations: [
            `why marketers choose ${brandName} for ${productContext}`,
          ],
        };
      default:
        // General prompts for unrecognized sectors - keep these generic but natural
        return {
          ranking: [
            `top rated ${productContext} in the market`,
            `best performing ${categoryContext} this year`,
          ],
          comparison: [
            `${brandName} vs ${competitors[0] || 'leading competitors'}`,
          ],
          alternatives: [
            `top alternatives to ${brandName}`,
          ],
          recommendations: [
            `why customers choose ${brandName} for ${productContext}`,
          ],
        };
    }
  };

  const contextualTemplates = getSectorSpecificContext();

  // Add sector-specific prompts first (more targeted and relevant)
  sectorPrompts.forEach(({ prompt, category }) => {
    prompts.push({
      id: (++promptId).toString(),
      prompt,
      category,
    });
  });

  // Generate prompts from contextual templates (base templates as fallback/supplement)
  Object.entries(contextualTemplates).forEach(([category, templates]) => {
    templates.forEach(prompt => {
      // Skip if this prompt is already included from sector prompts
      const isDuplicate = prompts.some(p => p.prompt.toLowerCase().trim() === prompt.toLowerCase().trim());
      if (!isDuplicate && prompt) {
        prompts.push({
          id: (++promptId).toString(),
          prompt,
          category: category as BrandPrompt['category'],
        });
      }
    });
  });

  return prompts;
}

export async function analyzePromptWithProvider(
  prompt: string,
  provider: string,
  brandName: string,
  competitors: string[],
  useMockMode: boolean = false
): Promise<AIResponse> {
  // Mock mode for demo/testing without API keys
  if (useMockMode || provider === 'Mock') {
    return generateMockResponse(prompt, provider, brandName, competitors);
  }

  // Normalize provider name for consistency
  const normalizedProvider = normalizeProviderName(provider);
  
  // Get model from centralized configuration
  const model = getProviderModel(normalizedProvider);
  
  if (!model) {
    console.warn(`Provider ${provider} not configured, skipping provider`);
    // Return null to indicate this provider should be skipped
    return null as any;
  }
  
  console.log(`${provider} model obtained successfully: ${typeof model}`);
  if (normalizedProvider === 'google') {
    console.log('Google model details:', model);
  }

  const systemPrompt = `You are an AI assistant analyzing brand visibility and rankings.
When responding to prompts about tools, platforms, or services:
1. Provide rankings with specific positions (1st, 2nd, etc.)
2. Focus on the companies mentioned in the prompt
3. Be objective and factual
4. Explain briefly why each tool is ranked where it is
5. If you don't have enough information about a specific company, you can mention that`;

  try {
    // First, get the response
    console.log(`Calling ${provider} with prompt: "${prompt.substring(0, 50)}..."`);
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt,
      temperature: 0.7,
      maxTokens: 800,
    });
    console.log(`${provider} response length: ${text.length}, first 100 chars: "${text.substring(0, 100)}"`);
    
    if (!text || text.length === 0) {
      console.error(`${provider} returned empty response for prompt: "${prompt}"`);
      throw new Error(`${provider} returned empty response`);
    }

    // Then analyze it with structured output
    const analysisPrompt = `Analyze this AI response about ${brandName} and its competitors:

Response: "${text}"

Your task:
1. Look for ANY mention of ${brandName} anywhere in the response, including:
   - Direct mentions (exact name)
   - Variations (with or without spaces, punctuation)
   - With suffixes (Inc, LLC, Corp, etc.)
   - In possessive form (${brandName}'s)
   - As part of compound words
2. Look for ANY mention of these competitors: ${competitors.join(', ')}
   - Apply the same detection rules as above
3. For each mentioned company, determine if it has a specific ranking position
4. Identify the sentiment towards each mentioned company
5. Rate your confidence in this analysis (0-1)

IMPORTANT: 
- A company is "mentioned" if it appears ANYWHERE in the response text, even without a specific ranking
- Count ALL mentions, not just ranked ones
- Be very thorough - check for variations like "${brandName}", "${brandName.replace(/\s+/g, '')}", "${brandName.toLowerCase()}"
- Look in all contexts: listed, compared, recommended, discussed, referenced, etc.

Examples of mentions to catch:
- "${brandName} is a great tool" (direct mention)
- "compared to ${brandName}" (comparison context)  
- "${brandName}'s features" (possessive)
- "alternatives like ${brandName}" (listing context)
- "${brandName.replace(/\s+/g, '')} offers" (no spaces variant)`;

    let object;
    try {
      // Use MiniMax M2.7 through OpenRouter for structured output (superior analysis)
      const openRouter = getOpenRouterClient();
      const structuredModel = openRouter 
        ? 'minimax/minimax-m2.7' as any
        : model;
      
      const result = await generateObject({
        model: structuredModel,
        schema: RankingSchema,
        prompt: analysisPrompt,
        temperature: 0.3,
        maxRetries: 2,
      });
      object = result.object;
    } catch (error) {
      console.error(`Error generating structured object with ${provider}:`, (error as any).message);
      
      // For Anthropic, try a simpler text-based approach
      if (provider === 'Anthropic') {
        try {
          const simplePrompt = `Analyze this AI response about ${brandName} and competitors ${competitors.join(', ')}:

"${text}"

Return a simple analysis:
1. Is ${brandName} mentioned? (yes/no)
2. What position/ranking does it have? (number or "not ranked")
3. Which competitors are mentioned? (list names)
4. What's the overall sentiment? (positive/neutral/negative)`;

          const { text: simpleResponse } = await generateText({
            model,
            prompt: simplePrompt,
            temperature: 0.3,
          });
          
          // Parse the simple response with enhanced detection
          const lines = simpleResponse.toLowerCase().split('\n');
          const aiSaysBrandMentioned = lines.some(line => line.includes('yes'));
          
          // Use enhanced detection as fallback
          const brandDetection = detectBrandMention(text, brandName, {
            caseSensitive: false,
            wholeWordOnly: true,
            includeVariations: true
          });
          
          const competitorDetections = detectMultipleBrands(text, competitors, {
            caseSensitive: false,
            wholeWordOnly: true,
            includeVariations: true
          });
          
          const competitors_mentioned = competitors.filter(c => 
            competitorDetections.get(c)?.mentioned || false
          );
          
          return {
            provider,
            prompt,
            response: text,
            brandMentioned: aiSaysBrandMentioned || brandDetection.mentioned,
            brandPosition: undefined,
            competitors: competitors_mentioned,
            rankings: [],
            sentiment: 'neutral' as const,
            confidence: 0.7,
            timestamp: new Date(),
          };
        } catch (fallbackError) {
          console.error('Fallback analysis also failed:', (fallbackError as any).message);
        }
      }
      
      // Final fallback with enhanced detection
      const brandDetection = detectBrandMention(text, brandName, {
        caseSensitive: false,
        wholeWordOnly: true,
        includeVariations: true
      });
      
      const competitorDetections = detectMultipleBrands(text, competitors, {
        caseSensitive: false,
        wholeWordOnly: true,
        includeVariations: true
      });
      
      return {
        provider,
        prompt,
        response: text,
        brandMentioned: brandDetection.mentioned,
        brandPosition: undefined,
        competitors: competitors.filter(c => competitorDetections.get(c)?.mentioned || false),
        rankings: [],
        sentiment: 'neutral' as const,
        confidence: brandDetection.confidence * 0.5, // Lower confidence for fallback
        timestamp: new Date(),
      };
    }

    const rankings = object.rankings.map((r): CompanyRanking => ({
      position: r.position,
      company: r.company,
      reason: r.reason,
      sentiment: r.sentiment,
    }));

    // Enhanced fallback with proper brand detection using configured options
    const brandDetectionOptions = getBrandDetectionOptions(brandName);
    
    // Detect brand mention with enhanced detection
    const brandDetectionResult = detectBrandMention(text, brandName, brandDetectionOptions);
    const brandMentioned = object.analysis.brandMentioned || brandDetectionResult.mentioned;
    
    // Detect all competitor mentions with their specific options
    const competitorDetectionResults = new Map<string, any>();
    competitors.forEach(competitor => {
      const competitorOptions = getBrandDetectionOptions(competitor);
      const result = detectBrandMention(text, competitor, competitorOptions);
      competitorDetectionResults.set(competitor, result);
    });
    
    // Combine AI-detected competitors with enhanced detection
    const aiCompetitors = new Set(object.analysis.competitors);
    const allMentionedCompetitors = new Set([...aiCompetitors]);
    
    // Add competitors found by enhanced detection
    competitorDetectionResults.forEach((result, competitorName) => {
      if (result.mentioned && competitorName !== brandName) {
        allMentionedCompetitors.add(competitorName);
      }
    });

    // Filter competitors to only include the ones we're tracking
    const relevantCompetitors = Array.from(allMentionedCompetitors).filter(c => 
      competitors.includes(c) && c !== brandName
    );
    
    // Log detection details for debugging
    if (brandDetectionResult.mentioned && !object.analysis.brandMentioned) {
      console.log(`Enhanced detection found brand "${brandName}" in response from ${provider}:`, 
        brandDetectionResult.matches.map(m => ({
          text: m.text,
          confidence: m.confidence
        }))
      );
    }

    // Get the proper display name for the provider
    const providerDisplayName = provider === 'openai' ? 'OpenAI' :
                               provider === 'anthropic' ? 'Anthropic' :
                               provider === 'google' ? 'Google' :
                               provider === 'perplexity' ? 'Perplexity' :
                               provider; // fallback to original
    
    // Debug log for Google responses
    if (provider === 'google' || provider === 'Google') {
      console.log('Google response generated:', {
        originalProvider: provider,
        displayName: providerDisplayName,
        prompt: prompt.substring(0, 50),
        responseLength: text.length,
        brandMentioned
      });
    }

    return {
      provider: providerDisplayName,
      prompt,
      response: text,
      rankings,
      competitors: relevantCompetitors,
      brandMentioned,
      brandPosition: object.analysis.brandPosition ?? undefined,
      sentiment: object.analysis.overallSentiment,
      confidence: object.analysis.confidence,
      timestamp: new Date(),
      detectionDetails: {
        brandMatches: brandDetectionResult.matches.map(m => ({
          text: m.text,
          index: m.index,
          confidence: m.confidence
        })),
        competitorMatches: new Map(
          Array.from(competitorDetectionResults.entries())
            .filter(([_, result]) => result.mentioned)
            .map(([name, result]) => [
              name,
              result.matches.map((m: any) => ({
                text: m.text,
                index: m.index,
                confidence: m.confidence
              }))
            ])
        )
      }
    };
  } catch (error) {
    console.error(`Error with ${provider}:`, error);
    
    // Special handling for Google errors
    if (provider === 'Google' || provider === 'google') {
      console.error('Google-specific error details:', {
        message: (error as any).message,
        stack: (error as any).stack,
        name: (error as any).name,
        cause: (error as any).cause
      });
    }
    
    throw error;
  }
}

export async function analyzeCompetitors(
  company: Company,
  responses: AIResponse[],
  knownCompetitors: string[]
): Promise<CompetitorRanking[]> {
  // Create a set of companies to track (company + its known competitors)
  const trackedCompanies = new Set([company.name, ...knownCompetitors]);
  
  // Initialize competitor data
  const competitorMap = new Map<string, {
    mentions: number;
    positions: number[];
    sentiments: ('positive' | 'neutral' | 'negative')[];
  }>();

  // Initialize all tracked companies
  trackedCompanies.forEach(companyName => {
    competitorMap.set(companyName, {
      mentions: 0,
      positions: [],
      sentiments: [],
    });
  });

  // Process all responses
  responses.forEach(response => {
    // Track which companies were mentioned in this response
    const mentionedInResponse = new Set<string>();
    
    // Process rankings if available
    if (response.rankings) {
      response.rankings.forEach(ranking => {
        // Only track companies we care about
        if (trackedCompanies.has(ranking.company)) {
          const data = competitorMap.get(ranking.company)!;
          
          // Only count one mention per response
          if (!mentionedInResponse.has(ranking.company)) {
            data.mentions++;
            mentionedInResponse.add(ranking.company);
          }
          
          data.positions.push(ranking.position);
          if (ranking.sentiment) {
            data.sentiments.push(ranking.sentiment);
          }
        }
      });
    }

    // Count brand mentions (only if not already counted in rankings)
    if (response.brandMentioned && trackedCompanies.has(company.name) && !mentionedInResponse.has(company.name)) {
      const brandData = competitorMap.get(company.name)!;
      brandData.mentions++;
      if (response.brandPosition) {
        brandData.positions.push(response.brandPosition);
      }
      brandData.sentiments.push(response.sentiment);
      mentionedInResponse.add(company.name);
    }

    // Fallback: Also count mentions from response.competitors array if rankings failed
    // This ensures visibility scores are calculated even when structured extraction fails
    if (response.competitors && response.competitors.length > 0) {
      response.competitors.forEach(competitorName => {
        if (trackedCompanies.has(competitorName) && !mentionedInResponse.has(competitorName)) {
          const compData = competitorMap.get(competitorName)!;
          compData.mentions++;
          mentionedInResponse.add(competitorName);
          // Use neutral sentiment if not already set from rankings
          if (compData.sentiments.length === 0) {
            compData.sentiments.push('neutral');
          }
        }
      });
    }
  });

  // Calculate scores for each competitor
  const totalResponses = responses.length;
  const competitors: CompetitorRanking[] = [];

  competitorMap.forEach((data, name) => {
    const avgPosition = data.positions.length > 0
      ? data.positions.reduce((a, b) => a + b, 0) / data.positions.length
      : 99; // High number for companies not ranked

    const sentimentScore = calculateSentimentScore(data.sentiments);
    const visibilityScore = (data.mentions / totalResponses) * 100;

    competitors.push({
      name,
      mentions: data.mentions,
      averagePosition: Math.round(avgPosition * 10) / 10,
      sentiment: determineSentiment(data.sentiments),
      sentimentScore,
      shareOfVoice: 0, // Will calculate after all competitors are processed
      visibilityScore: Math.round(visibilityScore * 10) / 10,
      weeklyChange: undefined, // No historical data available yet
      isOwn: name === company.name,
    });
  });

  // Calculate share of voice
  const totalMentions = competitors.reduce((sum, c) => sum + c.mentions, 0);
  competitors.forEach(c => {
    c.shareOfVoice = totalMentions > 0 
      ? Math.round((c.mentions / totalMentions) * 1000) / 10 
      : 0;
  });

  // Sort by visibility score
  return competitors.sort((a, b) => b.visibilityScore - a.visibilityScore);
}

function calculateSentimentScore(sentiments: ('positive' | 'neutral' | 'negative')[]): number {
  if (sentiments.length === 0) return 50;
  
  const sentimentValues = { positive: 100, neutral: 50, negative: 0 };
  const sum = sentiments.reduce((acc, s) => acc + sentimentValues[s], 0);
  return Math.round(sum / sentiments.length);
}

function determineSentiment(sentiments: ('positive' | 'neutral' | 'negative')[]): 'positive' | 'neutral' | 'negative' {
  if (sentiments.length === 0) return 'neutral';
  
  const counts = { positive: 0, neutral: 0, negative: 0 };
  sentiments.forEach(s => counts[s]++);
  
  if (counts.positive > counts.negative && counts.positive > counts.neutral) return 'positive';
  if (counts.negative > counts.positive && counts.negative > counts.neutral) return 'negative';
  return 'neutral';
}

export function calculateBrandScores(responses: AIResponse[], brandName: string, competitors: CompetitorRanking[]) {
  const totalResponses = responses.length;
  if (totalResponses === 0) {
    return {
      visibilityScore: 0,
      sentimentScore: 0,
      shareOfVoice: 0,
      overallScore: 0,
      averagePosition: 0,
    };
  }

  // Find the brand's competitor ranking
  const brandRanking = competitors.find(c => c.isOwn);
  
  if (!brandRanking) {
    return {
      visibilityScore: 0,
      sentimentScore: 0,
      shareOfVoice: 0,
      overallScore: 0,
      averagePosition: 0,
    };
  }

  const visibilityScore = brandRanking.visibilityScore;
  const sentimentScore = brandRanking.sentimentScore;
  const shareOfVoice = brandRanking.shareOfVoice;
  const averagePosition = brandRanking.averagePosition;

  // Calculate position score (lower is better, scale to 0-100)
  const positionScore = averagePosition <= 10 
    ? (11 - averagePosition) * 10 
    : Math.max(0, 100 - (averagePosition * 2));

  // Overall Score (weighted average)
  const overallScore = (
    visibilityScore * 0.3 + 
    sentimentScore * 0.2 + 
    shareOfVoice * 0.3 +
    positionScore * 0.2
  );

  return {
    visibilityScore: Math.round(visibilityScore * 10) / 10,
    sentimentScore: Math.round(sentimentScore * 10) / 10,
    shareOfVoice: Math.round(shareOfVoice * 10) / 10,
    overallScore: Math.round(overallScore * 10) / 10,
    averagePosition: Math.round(averagePosition * 10) / 10,
  };
}

export async function analyzeCompetitorsByProvider(
  company: Company,
  responses: AIResponse[],
  knownCompetitors: string[]
): Promise<{
  providerRankings: ProviderSpecificRanking[];
  providerComparison: ProviderComparisonData[];
}> {
  const trackedCompanies = new Set([company.name, ...knownCompetitors]);
  
  // Get configured providers from centralized config
  const configuredProviders = getConfiguredProviders();
  const providers = configuredProviders.map(p => p.name);
  
  // If no providers available, use mock mode
  if (providers.length === 0) {
    console.warn('No AI providers configured, using default provider list');
    providers.push('OpenAI', 'Anthropic', 'Google');
  }
  
  // Initialize provider-specific data
  const providerData = new Map<string, Map<string, {
    mentions: number;
    positions: number[];
    sentiments: ('positive' | 'neutral' | 'negative')[];
  }>>();

  // Initialize for each provider
  providers.forEach(provider => {
    const competitorMap = new Map();
    trackedCompanies.forEach(companyName => {
      competitorMap.set(companyName, {
        mentions: 0,
        positions: [],
        sentiments: [],
      });
    });
    providerData.set(provider, competitorMap);
  });

  // Process responses by provider
  responses.forEach(response => {
    const providerMap = providerData.get(response.provider);
    if (!providerMap) return;

    // Process rankings
    if (response.rankings) {
      response.rankings.forEach(ranking => {
        if (trackedCompanies.has(ranking.company)) {
          const data = providerMap.get(ranking.company)!;
          data.mentions++;
          data.positions.push(ranking.position);
          if (ranking.sentiment) {
            data.sentiments.push(ranking.sentiment);
          }
        }
      });
    }

    // Count brand mentions
    if (response.brandMentioned && trackedCompanies.has(company.name)) {
      const brandData = providerMap.get(company.name)!;
      if (!response.rankings?.some(r => r.company === company.name)) {
        brandData.mentions++;
        if (response.brandPosition) {
          brandData.positions.push(response.brandPosition);
        }
        brandData.sentiments.push(response.sentiment);
      }
    }
  });

  // Calculate provider-specific rankings
  const providerRankings: ProviderSpecificRanking[] = [];
  
  providers.forEach(provider => {
    const competitorMap = providerData.get(provider)!;
    const providerResponses = responses.filter(r => r.provider === provider);
    const totalResponses = providerResponses.length;
    
    const competitors: CompetitorRanking[] = [];
    
    competitorMap.forEach((data, name) => {
      const avgPosition = data.positions.length > 0
        ? data.positions.reduce((a, b) => a + b, 0) / data.positions.length
        : 99;
      
      const visibilityScore = totalResponses > 0 
        ? (data.mentions / totalResponses) * 100 
        : 0;
      
      competitors.push({
        name,
        mentions: data.mentions,
        averagePosition: Math.round(avgPosition * 10) / 10,
        sentiment: determineSentiment(data.sentiments),
        sentimentScore: calculateSentimentScore(data.sentiments),
        shareOfVoice: 0, // Will calculate after
        visibilityScore: Math.round(visibilityScore * 10) / 10,
        isOwn: name === company.name,
      });
    });

    // Calculate share of voice for this provider
    const totalMentions = competitors.reduce((sum, c) => sum + c.mentions, 0);
    competitors.forEach(c => {
      c.shareOfVoice = totalMentions > 0 
        ? Math.round((c.mentions / totalMentions) * 1000) / 10 
        : 0;
    });

    // Sort by visibility score
    competitors.sort((a, b) => b.visibilityScore - a.visibilityScore);
    
    providerRankings.push({
      provider,
      competitors,
    });
  });

  // Create provider comparison data
  const providerComparison: ProviderComparisonData[] = [];
  
  trackedCompanies.forEach(companyName => {
    const comparisonData: ProviderComparisonData = {
      competitor: companyName,
      providers: {},
      isOwn: companyName === company.name,
    };

    providerRankings.forEach(({ provider, competitors }) => {
      const competitor = competitors.find(c => c.name === companyName);
      if (competitor) {
        comparisonData.providers[provider] = {
          visibilityScore: competitor.visibilityScore,
          position: competitor.averagePosition,
          mentions: competitor.mentions,
          sentiment: competitor.sentiment,
        };
      }
    });

    providerComparison.push(comparisonData);
  });

  // Sort comparison data by average visibility across providers
  providerComparison.sort((a, b) => {
    const avgA = Object.values(a.providers).reduce((sum, p) => sum + p.visibilityScore, 0) / Object.keys(a.providers).length;
    const avgB = Object.values(b.providers).reduce((sum, p) => sum + p.visibilityScore, 0) / Object.keys(b.providers).length;
    return avgB - avgA;
  });

  return { providerRankings, providerComparison };
}

// Mock response generator for demo mode
function generateMockResponse(
  prompt: string,
  provider: string,
  brandName: string,
  competitors: string[]
): AIResponse {
  // Simulate some delay
  const delay = Math.random() * 500 + 200;
  
  // Create a realistic-looking ranking
  const allCompanies = [brandName, ...competitors].slice(0, 10);
  const shuffled = [...allCompanies].sort(() => Math.random() - 0.5);
  
  const rankings: CompanyRanking[] = shuffled.slice(0, 5).map((company, index) => ({
    position: index + 1,
    company,
    reason: `${company} offers strong features in this category`,
    sentiment: Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative' as const,
  }));
  
  const brandRanking = rankings.find(r => r.company === brandName);
  const brandMentioned = !!brandRanking || Math.random() > 0.3;
  const brandPosition = brandRanking?.position || (brandMentioned ? Math.floor(Math.random() * 8) + 3 : undefined);
  
  // Get the proper display name for the provider
  const providerDisplayName = provider === 'openai' ? 'OpenAI' :
                             provider === 'anthropic' ? 'Anthropic' :
                             provider === 'google' ? 'Google' :
                             provider === 'perplexity' ? 'Perplexity' :
                             provider; // fallback to original

  return {
    provider: providerDisplayName,
    prompt,
    response: `Based on my analysis, here are the top solutions:\n\n${rankings.map(r => 
      `${r.position}. ${r.company} - ${r.reason}`
    ).join('\n')}\n\nThese rankings are based on features, user satisfaction, and market presence.`,
    rankings,
    competitors: competitors.filter(() => Math.random() > 0.5),
    brandMentioned,
    brandPosition,
    sentiment: brandRanking?.sentiment || 'neutral',
    confidence: Math.random() * 0.3 + 0.7,
    timestamp: new Date(),
  };
} 