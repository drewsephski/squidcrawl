import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronsDown, ChevronsUp, Search, X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BrandPrompt, AIResponse } from '@/lib/types';
import { HighlightedResponse } from './highlighted-response';

interface PromptsResponsesTabProps {
  prompts: BrandPrompt[];
  responses: AIResponse[];
  expandedPromptIndex: number | null;
  onToggleExpand: (index: number | null) => void;
  brandName: string;
  competitors: string[];
}

// Normalize prompt string for consistent matching
function normalizePrompt(prompt: string): string {
  return prompt.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Provider icon mapping
const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'OpenAI':
      return (
        <img
          src="https://cdn.brandfetch.io/idR3duQxYl/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B"
          alt="OpenAI"
          className="w-full h-full object-contain"
        />
      );
    case 'Anthropic':
      return (
        <img
          src="https://cdn.brandfetch.io/idmJWF3N06/theme/dark/symbol.svg"
          alt="Anthropic"
          className="w-full h-full object-contain"
        />
      );
    case 'Google':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-full h-full">
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
          className="w-full h-full object-contain"
        />
      );
    default:
      return <div className="w-full h-full bg-gray-400 rounded" />;
  }
};

export function PromptsResponsesTab({
  prompts,
  responses,
  expandedPromptIndex,
  onToggleExpand,
  brandName,
  competitors
}: PromptsResponsesTabProps) {
  const [allExpanded, setAllExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleExpandAll = () => {
    if (allExpanded) {
      // Collapse all
      setAllExpanded(false);
      onToggleExpand(null);
    } else {
      // Expand all - we'll use -1 as a special value to indicate all expanded
      setAllExpanded(true);
      onToggleExpand(-1);
    }
  };
  
  // Filter prompts based on search query
  const filteredPromptIndices = prompts
    .map((prompt, idx) => {
      if (!searchQuery) return idx;
      
      const promptMatches = prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Check if any response contains the search query (using normalized prompt matching)
      const normalizedPromptStr = normalizePrompt(prompt.prompt);
      const promptResponses = responses?.filter(response => 
        normalizePrompt(response.prompt) === normalizedPromptStr
      ) || [];
      
      const responseMatches = promptResponses.some(response => 
        response.response.toLowerCase().includes(searchQuery.toLowerCase()) ||
        response.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return (promptMatches || responseMatches) ? idx : null;
    })
    .filter(idx => idx !== null);
  
  return (
    <div className={`space-y-3 sm:space-y-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Search and Controls */}
      {prompts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#22d3ee] rounded-xl opacity-0 blur transition-opacity duration-300 ${searchQuery ? 'opacity-30' : 'group-hover:opacity-20'}`} />
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts and responses..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-11 bg-[#12121a] border border-[#2a2a3a] rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] text-[#fafafa] placeholder-[#52525b] transition-all duration-300 text-sm sm:text-base"
              />
              <Search className="absolute left-2.5 sm:left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6366f1]" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-[#2a2a3a] text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#3f3f46] transition-all duration-200"
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Expand/Collapse All Button */}
          <button
            onClick={handleExpandAll}
            className={`group h-10 sm:h-11 px-4 sm:px-5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 ${
              allExpanded
                ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-lg shadow-[#f59e0b]/30 hover:shadow-[#f59e0b]/50'
                : 'bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-lg shadow-[#6366f1]/30 hover:shadow-[#6366f1]/50'
            } hover:scale-[1.02]`}
          >
            {allExpanded ? (
              <>
                <ChevronsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="hidden sm:inline">Collapse All</span>
                <span className="sm:hidden">Collapse</span>
              </>
            ) : (
              <>
                <ChevronsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                <span className="hidden sm:inline">Expand All</span>
                <span className="sm:hidden">Expand</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {prompts.map((promptData, idx) => {
        // Skip if filtered out
        if (!filteredPromptIndices.includes(idx)) return null;
        
        // Find responses for this prompt using normalized matching
        const normalizedPromptStr = normalizePrompt(promptData.prompt);
        const promptResponses = responses?.filter(response => 
          normalizePrompt(response.prompt) === normalizedPromptStr
        ) || [];
        
        // Check if any provider mentioned the brand
        const hasBrandMention = promptResponses.some(r => r.brandMentioned);
        
        // Check if this tile is expanded - auto-expand when searching
        const isExpanded = searchQuery 
          ? true 
          : (expandedPromptIndex === -1 || expandedPromptIndex === idx);
        
        return (
          <div
            key={idx}
            className={`
              group relative rounded-2xl border-2 transition-all duration-500 overflow-hidden
              ${isExpanded
                ? 'border-[#6366f1]/60 bg-[#12121a] shadow-[0_0_40px_rgba(99,102,241,0.15)]'
                : 'border-[#2a2a3a] bg-[#12121a]/80 hover:border-[#6366f1]/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]'
              }
            `}
          >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${
              hasBrandMention
                ? 'bg-gradient-to-r from-[#10b981] to-[#22d3ee]'
                : 'bg-gradient-to-r from-[#6366f1] to-[#22d3ee]'
            } ${isExpanded ? 'opacity-100' : 'opacity-60'}`} />

            {/* Tile Header - Compact single line */}
            <div
              className="relative px-3 sm:px-6 py-3 sm:py-5 cursor-pointer select-none"
              onClick={() => {
                if (expandedPromptIndex === -1) {
                  setAllExpanded(false);
                  onToggleExpand(idx);
                } else {
                  onToggleExpand(isExpanded ? null : idx);
                }
              }}
            >
              {/* Background glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r from-[#6366f1]/5 to-transparent transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

              <div className="relative flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    hasBrandMention
                      ? 'bg-gradient-to-br from-[#10b981]/20 to-[#059669]/20 border border-[#10b981]/30'
                      : 'bg-gradient-to-br from-[#6366f1]/20 to-[#4f46e5]/20 border border-[#6366f1]/30'
                  }`}>
                    <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${hasBrandMention ? 'text-[#10b981]' : 'text-[#6366f1]'}`} />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-[#fafafa] truncate">{promptData.prompt}</p>
                  {hasBrandMention && (
                    <Badge className="hidden sm:flex text-xs border-0 bg-gradient-to-r from-[#10b981] to-[#22d3ee] text-white shrink-0 font-semibold shadow-lg shadow-[#10b981]/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Mentioned
                    </Badge>
                  )}
                </div>

                {/* Provider icons preview */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {['OpenAI', 'Anthropic', 'Google', 'Perplexity'].map((providerName) => {
                    const providerResponse = promptResponses.find(r => r.provider === providerName);
                    if (!providerResponse) return null;

                    const isFailed = !providerResponse.response || providerResponse.response.trim().length === 0;

                    return (
                      <div key={providerName} className="relative flex items-center">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md sm:rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
                          <div className="w-4 h-4 sm:w-6 sm:h-6">
                            {getProviderIcon(providerName)}
                          </div>
                        </div>
                        {isFailed ? (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center bg-[#ef4444] rounded-full border-2 border-[#12121a]">
                            <AlertCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                          </div>
                        ) : providerResponse.brandMentioned ? (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#10b981] rounded-full border-2 border-[#12121a] shadow-lg shadow-[#10b981]/50" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {/* Expand/Collapse indicator */}
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isExpanded
                    ? 'bg-[#6366f1]/20 rotate-180'
                    : 'bg-[#2a2a3a] group-hover:bg-[#3f3f46]'
                }`}>
                  <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-300 ${
                    isExpanded ? 'text-[#6366f1]' : 'text-[#71717a] group-hover:text-[#a1a1aa]'
                  }`} />
                </div>
              </div>
            </div>
            
            {/* Expandable content */}
            <div
              className={`
                overflow-hidden transition-all duration-500 ease-out
                ${isExpanded ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-t border-[#2a2a3a] px-3 sm:px-6 py-3 sm:py-5 bg-[#0a0a0f]/50">
                {promptResponses.length > 0 ? (
                  <div className="space-y-5">
                    {['OpenAI', 'Anthropic', 'Google', 'Perplexity'].map((providerName, providerIdx) => {
                      const response = promptResponses.find(r => r.provider === providerName);
                      if (!response) return null;

                      const isFailed = !response.response || response.response.trim().length === 0;

                      return (
                      <div
                        key={providerName}
                        className="group/response space-y-2 sm:space-y-3 animate-fade-in-up"
                        style={{ animationDelay: `${providerIdx * 100}ms` }}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isFailed
                              ? 'bg-[#ef4444]/20 border border-[#ef4444]/30'
                              : response.brandMentioned
                              ? 'bg-[#10b981]/20 border border-[#10b981]/30'
                              : 'bg-[#6366f1]/20 border border-[#6366f1]/30'
                          }`}>
                            <div className="w-4 h-4 sm:w-6 sm:h-6">
                              {getProviderIcon(response.provider)}
                            </div>
                          </div>
                          <span className="font-bold text-sm sm:text-base text-[#fafafa]">{response.provider}</span>
                          {isFailed ? (
                            <Badge className="text-xs border-0 bg-[#ef4444]/20 text-[#ef4444] font-semibold">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Failed
                            </Badge>
                          ) : response.brandMentioned ? (
                            <Badge className="text-xs border-0 bg-gradient-to-r from-[#10b981] to-[#22d3ee] text-white font-semibold shadow-lg shadow-[#10b981]/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Mentioned
                            </Badge>
                          ) : null}
                          {response.brandPosition && response.brandPosition > 0 && (
                            <Badge variant="outline" className="text-xs border-[#6366f1]/40 text-[#6366f1] bg-[#6366f1]/10 font-semibold">
                              Position #{response.brandPosition}
                            </Badge>
                          )}
                        </div>
                        <div className={`relative rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs sm:text-sm select-text cursor-text transition-all duration-300 ${
                          isFailed
                            ? 'bg-[#ef4444]/10 border border-[#ef4444]/20'
                            : 'bg-[#12121a] border border-[#2a2a3a] group-hover/response:border-[#3f3f46] group-hover/response:shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                        }`}>
                          {isFailed ? (
                            <div className="flex items-center gap-2 text-[#ef4444]">
                              <AlertCircle className="w-4 h-4" />
                              <span className="italic">Response failed or returned empty content</span>
                            </div>
                          ) : (
                            <HighlightedResponse
                              response={response}
                              brandName={brandName}
                              competitors={competitors}
                              showHighlighting={true}
                              highlightClassName="bg-[#6366f1]/30 text-[#fafafa] px-1.5 py-0.5 rounded font-semibold"
                              renderMarkdown={true}
                            />
                          )}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-[#71717a]">
                    <div className="w-12 h-12 rounded-xl bg-[#2a2a3a] flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#52525b]" />
                    </div>
                    <p className="text-sm font-medium">No responses available for this prompt</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* No results message */}
      {searchQuery && filteredPromptIndices.length === 0 && (
        <div className="flex flex-col items-center gap-3 sm:gap-4 py-12 sm:py-16 px-4 sm:px-8 bg-[#12121a] rounded-xl sm:rounded-2xl border-2 border-[#2a2a3a]">
          <div className="relative">
            <div className="absolute inset-0 bg-[#6366f1]/20 blur-xl rounded-full" />
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#4f46e5]/20 border border-[#6366f1]/30 flex items-center justify-center">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-[#6366f1]" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#fafafa] text-lg sm:text-xl font-bold mb-1 sm:mb-2">No results found</p>
            <p className="text-sm text-[#71717a]">Try searching for different keywords</p>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#2a2a3a] text-[#a1a1aa] font-medium hover:bg-[#3f3f46] hover:text-[#fafafa] transition-all duration-300 text-sm sm:text-base"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}