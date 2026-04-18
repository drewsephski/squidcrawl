/**
 * OpenRouter Provider Configuration
 * Unified AI provider using OpenRouter SDK for access to 300+ models
 * 
 * Benefits:
 * - Single API key for multiple providers (OpenAI, Anthropic, Google, etc.)
 * - Automatic fallbacks and cost-effective routing
 * - Standardized interface across all models
 */

import { OpenRouter } from '@openrouter/sdk';
import { z } from 'zod';
import type { 
  ProviderConfig, 
  ProviderModel, 
  ProviderCapabilities
} from './provider-config';

// Options for model configuration
interface ModelOptions {
  useWebSearch?: boolean;
  [key: string]: any;
}

// Initialize OpenRouter client
// Lazy initialization to avoid errors during build if env var is missing
let openRouterClient: OpenRouter | null = null;

export function getOpenRouterClient(): OpenRouter | null {
  if (!openRouterClient && process.env.OPENROUTER_API_KEY) {
    openRouterClient = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      httpReferer: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      appTitle: 'SquidCrawl Brand Monitor',
    });
  }
  return openRouterClient;
}

// Model definitions for popular providers through OpenRouter
const OPENROUTER_MODELS: ProviderModel[] = [
  // Featured model (user requested)
  {
    id: 'openrouter/free',
    name: 'OpenRouter Free',
    maxTokens: 128000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: false,
  },
  // OpenAI models
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    maxTokens: 128000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: false,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    maxTokens: 128000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: false,
  },
  // Anthropic models
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude 4 Sonnet',
    maxTokens: 200000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: false,
  },
  {
    id: 'anthropic/claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    maxTokens: 200000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: false,
  },
  // Google models
  {
    id: 'google/gemini-2.5-pro-preview-03-25',
    name: 'Gemini 2.5 Pro',
    maxTokens: 1000000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: true,
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    maxTokens: 1000000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: true,
  },
  // Perplexity models (with native search)
  {
    id: 'perplexity/sonar-pro',
    name: 'Sonar Pro',
    maxTokens: 127000,
    supportsFunctionCalling: false,
    supportsStructuredOutput: false,
    supportsWebSearch: true,
  },
  {
    id: 'perplexity/sonar',
    name: 'Sonar',
    maxTokens: 127000,
    supportsFunctionCalling: false,
    supportsStructuredOutput: false,
    supportsWebSearch: true,
  },
  // High-quality cost-effective options
  {
    id: 'deepseek/deepseek-chat-v3-0324',
    name: 'DeepSeek V3',
    maxTokens: 64000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: false,
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    maxTokens: 256000,
    supportsFunctionCalling: true,
    supportsStructuredOutput: true,
    supportsWebSearch: false,
  },
];

// Group models by provider for the UI
export const OPENROUTER_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    icon: '🤖',
    models: OPENROUTER_MODELS.filter(m => m.id.startsWith('openrouter/')),
    defaultModel: 'openrouter/free',
  },
  anthropic: {
    name: 'Anthropic',
    icon: '🧠',
    models: OPENROUTER_MODELS.filter(m => m.id.startsWith('openrouter/')),
    defaultModel: 'openrouter/free',
  },
  google: {
    name: 'Google',
    icon: '🌟',
    models: OPENROUTER_MODELS.filter(m => m.id.startsWith('openrouter/')),
    defaultModel: 'openrouter/free',
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔍',
    models: OPENROUTER_MODELS.filter(m => m.id.startsWith('openrouter/')),
    defaultModel: 'openrouter/free',
  },
  other: {
    name: 'Other Models',
    icon: '⚡',
    models: OPENROUTER_MODELS.filter(m => 
      !m.id.startsWith('openrouter/')
    ),
    defaultModel: 'openrouter/free',
  },
};

export const OPENROUTER_CONFIG: ProviderConfig = {
  id: 'openrouter',
  name: 'OpenRouter',
  icon: '🔀',
  envKey: 'OPENROUTER_API_KEY',
  enabled: true,
  models: OPENROUTER_MODELS,
  defaultModel: 'openrouter/elephant-alpha',
  capabilities: {
    webSearch: true,
    functionCalling: true,
    structuredOutput: true,
    streamingResponse: true,
    maxRequestsPerMinute: 1000,
  },
  getModel: (modelId?: string, options?: ModelOptions) => {
    const client = getOpenRouterClient();
    if (!client) return null;
    
    const selectedModel = modelId || OPENROUTER_CONFIG.defaultModel;
    return {
      provider: 'openrouter',
      modelId: selectedModel,
      client,
    } as any; // Return a custom model object that our utils will handle
  },
  isConfigured: () => !!process.env.OPENROUTER_API_KEY,
};

// Helper to get all available models grouped by provider
export function getOpenRouterModelsByProvider() {
  return OPENROUTER_PROVIDERS;
}

// Helper to get a specific model config
export function getOpenRouterModel(modelId: string): ProviderModel | undefined {
  return OPENROUTER_MODELS.find(m => m.id === modelId);
}

// Zod schema for structured outputs through OpenRouter
export const RankingSchema = z.object({
  rankings: z.array(z.object({
    position: z.number(),
    company: z.string(),
    reason: z.string().optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
  })).default([]),
  analysis: z.object({
    brandMentioned: z.boolean().default(false),
    brandPosition: z.number().optional(),
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

export type RankingOutput = z.infer<typeof RankingSchema>;
