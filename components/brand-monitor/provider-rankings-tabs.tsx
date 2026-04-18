'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProviderSpecificRanking } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, Trophy, BarChart3, Crown } from 'lucide-react';
import Image from 'next/image';
import { getConfiguredProviders } from '@/lib/provider-config';

// Provider icon mapping
const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'OpenAI':
      return (
        <img 
          src="https://cdn.brandfetch.io/idR3duQxYl/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" 
          alt="OpenAI" 
          className="w-7 h-7"
        />
      );
    case 'Anthropic':
      return (
        <img 
          src="https://cdn.brandfetch.io/idmJWF3N06/theme/dark/symbol.svg" 
          alt="Anthropic" 
          className="w-6 h-6"
        />
      );
    case 'Google':
      return (
        <div className="w-7 h-7 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      );
    case 'Perplexity':
      return (
        <img 
          src="https://cdn.brandfetch.io/idNdawywEZ/w/800/h/800/theme/dark/icon.png?c=1dxbfHSJFAPEGdCLU4o5B" 
          alt="Perplexity" 
          className="w-6 h-6"
        />
      );
    default:
      return <div className="w-7 h-7 bg-gray-400 rounded" />;
  }
};

interface ProviderRankingsTabsProps {
  providerRankings: ProviderSpecificRanking[];
  brandName: string;
  shareOfVoice?: number;
  averagePosition?: number;
  sentimentScore?: number;
  weeklyChange?: number;
}

// Company cell component with favicon support
const CompanyCell = ({ 
  name, 
  isOwn, 
  url 
}: { 
  name: string; 
  isOwn?: boolean; 
  url?: string;
}) => {
  const [faviconError, setFaviconError] = useState(false);
  
  // Generate favicon URL using Google's favicon service
  const faviconUrl = url ? `https://www.google.com/s2/favicons?domain=${url}&sz=64` : null;
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 flex items-center justify-center rounded overflow-hidden flex-shrink-0">
        {faviconUrl && !faviconError ? (
          <Image
            src={faviconUrl}
            alt={`${name} logo`}
            width={20}
            height={20}
            className="object-contain"
            onError={() => setFaviconError(true)}
          />
        ) : (
          <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-600 font-semibold text-[10px]">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <span className={`text-base ${
        isOwn ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
      }`}>
        {name}
      </span>
    </div>
  );
};

// Generate a fallback URL from competitor name
const generateFallbackUrl = (competitorName: string): string | undefined => {
  const cleanName = competitorName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .trim();
  
  if (cleanName.length < 3 || ['inc', 'llc', 'corp', 'company', 'the'].includes(cleanName)) {
    return undefined;
  }
  
  return `${cleanName}.com`;
};

export function ProviderRankingsTabs({ 
  providerRankings, 
  brandName,
  shareOfVoice,
  averagePosition,
  sentimentScore,
  weeklyChange
}: ProviderRankingsTabsProps) {
  const [selectedProvider, setSelectedProvider] = useState(
    providerRankings?.[0]?.provider || 'OpenAI'
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!providerRankings || providerRankings.length === 0) return null;

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge variant="secondary" className="text-sm font-bold bg-green-100 text-green-800 border border-green-300 px-3 py-1">Positive</Badge>;
      case 'negative':
        return <Badge variant="secondary" className="text-sm font-bold bg-red-100 text-red-800 border border-red-300 px-3 py-1">Negative</Badge>;
      default:
        return <Badge variant="secondary" className="text-sm font-bold bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1">Neutral</Badge>;
    }
  };

  const getChangeIcon = (change: number | undefined) => {
    if (!change) return <Minus className="h-3 w-3 text-gray-400" />;
    if (change > 0) return <TrendingUp className="h-3 w-3 text-black" />;
    return <TrendingDown className="h-3 w-3 text-black" />;
  };

  // Get the selected provider's data
  const selectedProviderData = providerRankings.find(p => p.provider === selectedProvider);
  const competitors = selectedProviderData?.competitors || [];
  const brandRank = competitors.findIndex(c => c.isOwn) + 1;
  const brandVisibility = competitors.find(c => c.isOwn)?.visibilityScore || 0;

  return (
    <div className={`relative bg-[#12121a] text-[#fafafa] rounded-2xl border border-[#2a2a3a] overflow-hidden shadow-2xl shadow-black/50 h-full flex flex-col transition-all duration-700 ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366f1] via-[#22d3ee] to-[#ec4899]" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-intelligence opacity-[0.02]" />
      
      <div className="relative p-8 border-b border-[#2a2a3a]">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#6366f1]/20 blur-lg rounded-lg" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#fafafa]">Provider Rankings</h2>
              <p className="text-sm text-[#71717a]">
                Your brand performance by AI provider
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-[#6366f1]/10 blur-xl rounded-full" />
              <div className="relative px-6 py-3 rounded-2xl bg-[#0a0a0f] border border-[#6366f1]/30">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#f59e0b]" />
                  <span className="text-3xl font-bold text-[#fafafa]">#{brandRank}</span>
                </div>
                <p className="text-xs text-[#71717a] mt-1">Average Rank</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative flex-1 p-8 flex flex-col">
        <Tabs value={selectedProvider} onValueChange={setSelectedProvider} className="flex-1 flex flex-col">
          <TabsList className={`grid w-full mb-2 h-14 ${providerRankings.length === 2 ? 'grid-cols-2' : providerRankings.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
            {providerRankings.map(({ provider }) => {
              // Provider info is now handled by icon mapping directly
              return (
                <TabsTrigger 
                  key={provider} 
                  value={provider} 
                  className="text-sm flex items-center justify-center h-full"
                  title={provider}
                >
                  {getProviderIcon(provider)}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {providerRankings.map(({ provider, competitors }) => (
            <TabsContent key={provider} value={provider} className="mt-0">
              <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-lg shadow-black/5">
                <table className="w-full border-collapse bg-white">
                  <thead>
                    <tr>
                      <th className="bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-r border-gray-200 text-left p-4 text-sm font-bold text-gray-900 w-10">#</th>
                      <th className="bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-r border-gray-200 text-left p-4 text-sm font-bold text-gray-900 w-[220px]">Company</th>
                      <th className="bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-r border-gray-200 text-right p-4 text-sm font-bold text-gray-900">Visibility</th>
                      <th className="bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-r border-gray-200 text-right p-4 text-sm font-bold text-gray-900">Share of Voice</th>
                      <th className="bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-gray-200 text-right p-4 text-sm font-bold text-gray-900">Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((competitor, idx) => {
                      const competitorUrl = generateFallbackUrl(competitor.name);
                      
                      return (
                        <tr 
                          key={idx} 
                          className={`
                            ${idx > 0 ? 'border-t-2 border-gray-200' : ''}
                            ${competitor.isOwn 
                              ? 'bg-gradient-to-r from-orange-50 to-amber-50/50 border-l-4 border-l-orange-400' 
                              : 'hover:bg-gray-50/80 transition-colors'
                            }
                          `}
                        >
                          <td className="border-r-2 border-gray-200 p-4 text-sm font-bold text-gray-900">
                            {idx + 1}
                          </td>
                          <td className="border-r-2 border-gray-200 p-4">
                            <CompanyCell 
                              name={competitor.name}
                              isOwn={competitor.isOwn}
                              url={competitorUrl}
                            />
                          </td>
                          <td className="border-r-2 border-gray-200 p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className={`text-base font-bold ${competitor.isOwn ? 'text-orange-700' : 'text-gray-900'}`}>
                                {competitor.visibilityScore}%
                              </span>
                              {competitor.weeklyChange !== undefined && competitor.weeklyChange !== 0 && (
                                getChangeIcon(competitor.weeklyChange)
                              )}
                            </div>
                          </td>
                          <td className="border-r-2 border-gray-200 p-4 text-right">
                            <span className={`text-base font-semibold ${competitor.isOwn ? 'text-orange-700' : 'text-gray-900'}`}>
                              {competitor.shareOfVoice}%
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {getSentimentBadge(competitor.sentiment)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Metrics Row at Bottom */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t">
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center border border-[#2a2a3a]">
            <p className="text-xs text-[#52525b] mb-1">Competitors</p>
            <p className="text-lg font-bold text-[#fafafa]">{competitors.length}</p>
          </div>
          <div className="bg-[#6366f1]/10 rounded-xl p-4 text-center border border-[#6366f1]/30">
            <p className="text-xs text-[#6366f1] mb-1">{brandName} Rank</p>
            <p className="text-lg font-bold text-[#6366f1]">
              #{brandRank}
            </p>
          </div>
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center border border-[#2a2a3a]">
            <p className="text-xs text-[#52525b] mb-1">{brandName} Visibility</p>
            <p className="text-lg font-bold text-[#f59e0b]">
              {brandVisibility}%
            </p>
          </div>
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center border border-[#2a2a3a]">
            <p className="text-xs text-[#52525b] mb-1">Share of Voice</p>
            <p className="text-lg font-bold text-[#22d3ee]">{shareOfVoice}%</p>
          </div>
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center border border-[#2a2a3a]">
            <p className="text-xs text-[#52525b] mb-1">Average Position</p>
            <p className="text-lg font-bold text-[#fafafa]">#{averagePosition}</p>
          </div>
          <div className="bg-[#0a0a0f] rounded-xl p-4 text-center border border-[#2a2a3a]">
            <p className="text-xs text-[#52525b] mb-1">Sentiment Score</p>
            <p className="text-lg font-bold text-[#10b981]">{sentimentScore}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}