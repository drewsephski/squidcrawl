'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, CheckIcon, Target, Activity, Cpu, Sparkles } from 'lucide-react';
import { Company, AnalysisStage } from '@/lib/types';
import { IdentifiedCompetitor, PromptCompletionStatus } from '@/lib/brand-monitor-reducer';
import { getEnabledProviders } from '@/lib/provider-config';

interface AnalysisProgressSectionProps {
  company: Company;
  analyzing: boolean;
  identifiedCompetitors: IdentifiedCompetitor[];
  scrapingCompetitors: boolean;
  analysisProgress: {
    stage: AnalysisStage;
    progress: number;
    message: string;
  };
  prompts: string[];
  customPrompts: string[];
  removedDefaultPrompts: number[];
  promptCompletionStatus: PromptCompletionStatus;
  onRemoveDefaultPrompt: (index: number) => void;
  onRemoveCustomPrompt: (prompt: string) => void;
  onAddPromptClick: () => void;
  onStartAnalysis: () => void;
  detectServiceType: (company: Company) => string;
}

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
          className="w-5 h-5"
        />
      );
    case 'Google':
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
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
          className="w-5 h-5"
        />
      );
    default:
      return <div className="w-5 h-5 bg-gray-400 rounded" />;
  }
};

export function AnalysisProgressSection({
  company,
  analyzing,
  identifiedCompetitors,
  scrapingCompetitors,
  analysisProgress,
  prompts,
  customPrompts,
  removedDefaultPrompts,
  promptCompletionStatus,
  onRemoveDefaultPrompt,
  onRemoveCustomPrompt,
  onAddPromptClick,
  onStartAnalysis,
  detectServiceType
}: AnalysisProgressSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate default prompts
  const serviceType = detectServiceType(company);
  const currentYear = new Date().getFullYear();
  const defaultPrompts = [
    `Best ${serviceType}s in ${currentYear}?`,
    `Top ${serviceType}s for startups?`,
    `Most popular ${serviceType}s today?`,
    `Recommended ${serviceType}s for developers?`
  ].filter((_, index) => !removedDefaultPrompts.includes(index));
  
  // Use provided prompts or generate from defaults + custom
  const displayPrompts = prompts.length > 0 ? prompts : [...defaultPrompts, ...customPrompts];
  
  return (
    <div className={`flex items-center justify-center min-h-[60vh] transition-all duration-700 ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-radial from-[#6366f1]/5 via-[#22d3ee]/3 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl w-full px-4">
        <div className="bg-[#12121a] text-[#fafafa] rounded-2xl border border-[#2a2a3a] overflow-hidden shadow-2xl shadow-black/50">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#6366f1] to-[#22d3ee]" />
          
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-intelligence opacity-[0.02]" />
          
          <div className="relative p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#6366f1]/20 blur-lg rounded-lg" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
                    {analyzing ? (
                      <Activity className="w-6 h-6 text-white animate-pulse" />
                    ) : (
                      <Target className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#fafafa]">
                    {analyzing ? 'Analysis in Progress' : 'Configure Analysis'}
                  </h2>
                  <p className="text-sm text-[#71717a]">
                    {analyzing 
                      ? `Processing ${displayPrompts.length} prompts across ${getEnabledProviders().length} AI providers`
                      : 'Customize prompts to analyze your brand visibility'
                    }
                  </p>
                </div>
              </div>
              
              {/* Competitors indicator */}
              {!analyzing && identifiedCompetitors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#71717a] uppercase tracking-wider">vs</span>
                  <div className="flex -space-x-2">
                    {identifiedCompetitors.slice(0, 5).map((comp, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full bg-[#1a1a25] border-2 border-[#12121a] shadow-sm overflow-hidden" title={comp.name}>
                        {comp.url ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${comp.url}&sz=64`}
                            alt={comp.name}
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#252533] flex items-center justify-center text-xs font-medium text-[#a1a1aa]">
                            {comp.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                    {identifiedCompetitors.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-[#1a1a25] border-2 border-[#12121a] shadow-sm flex items-center justify-center">
                        <span className="text-xs text-[#a1a1aa] font-medium">+{identifiedCompetitors.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar during analysis */}
            {analyzing && analysisProgress && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#6366f1]/40 blur-xl rounded-full animate-pulse" />
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-[#6366f1]/40">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[#fafafa] font-semibold text-base block">{analysisProgress.message}</span>
                      <span className="text-[#71717a] text-sm">Processing across {getEnabledProviders().length} AI providers</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#22d3ee]" />
                      <span className="text-3xl font-black bg-gradient-to-r from-[#22d3ee] to-[#6366f1] bg-clip-text text-transparent">
                        {analysisProgress.progress}%
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-1 rounded-full transition-all duration-300 ${
                            analysisProgress.progress >= (i + 1) * 20
                              ? 'bg-gradient-to-r from-[#6366f1] to-[#22d3ee]'
                              : 'bg-[#2a2a3a]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative h-4 bg-[#0a0a0f] rounded-full overflow-hidden border border-[#2a2a3a]/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 via-[#22d3ee]/10 to-[#6366f1]/10" />
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#6366f1] via-[#22d3ee] to-[#6366f1] rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    style={{ width: `${analysisProgress.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  </div>
                </div>
              </div>
            )}

            {/* Background scraping notice */}
            {scrapingCompetitors && !analyzing && (
              <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                <Loader2 className="w-4 h-4 animate-spin text-[#f59e0b]" />
                <span className="text-sm text-[#f59e0b]">Validating competitor data in background...</span>
              </div>
            )}
            
            {/* Prompts Grid */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayPrompts.map((prompt, index) => {
                  const isCustom = customPrompts.includes(prompt);
                  const normalizedPrompt = prompt.trim();
                  const isComplete = analyzing && getEnabledProviders().every(config =>
                    promptCompletionStatus[normalizedPrompt]?.[config.name] === 'completed'
                  );

                  return (
                    <div
                      key={`${prompt}-${index}`}
                      className={`group relative rounded-xl border p-5 transition-all duration-500 hover:scale-[1.02] ${
                        isComplete
                          ? 'bg-gradient-to-br from-[#10b981]/10 to-[#0a0a0f] border-[#10b981]/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'bg-[#0a0a0f] border-[#2a2a3a] hover:border-[#6366f1]/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                      } ${mounted ? 'animate-fade-in-up' : ''}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6366f1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isComplete
                              ? 'bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg shadow-[#10b981]/30'
                              : 'bg-gradient-to-br from-[#6366f1]/20 to-[#4f46e5]/20 group-hover:from-[#6366f1]/30 group-hover:to-[#4f46e5]/30'
                          }`}>
                            {isComplete ? (
                              <CheckIcon className="w-5 h-5 text-white" />
                            ) : (
                              <Sparkles className={`w-5 h-5 transition-colors duration-300 ${
                                isComplete ? 'text-white' : 'text-[#6366f1] group-hover:text-[#818cf8]'
                              }`} />
                            )}
                          </div>
                          <p className="text-base font-medium text-[#fafafa] leading-relaxed">
                            {prompt}
                          </p>
                        </div>
                        {!analyzing && !isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const originalIndex = defaultPrompts.findIndex(p => p === prompt);
                              if (originalIndex !== -1) {
                                onRemoveDefaultPrompt(originalIndex);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-[#ef4444]/20 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4 text-[#ef4444]" />
                          </button>
                        )}
                        {!analyzing && isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveCustomPrompt(prompt);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg hover:bg-[#ef4444]/20 hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4 text-[#ef4444]" />
                          </button>
                        )}
                      </div>

                      {/* Provider status indicators */}
                      <div className="relative mt-4 pt-4 border-t border-[#1a1a25] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCustom && (
                            <Badge variant="outline" className="text-xs border-[#22d3ee]/40 text-[#22d3ee] bg-[#22d3ee]/10 font-semibold">
                              Custom
                            </Badge>
                          )}
                          {isComplete && (
                            <Badge variant="outline" className="text-xs border-[#10b981]/40 text-[#10b981] bg-[#10b981]/10 font-semibold">
                              Complete
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getEnabledProviders().map(config => {
                            const provider = config.name;
                            const status = analyzing ? (promptCompletionStatus[normalizedPrompt]?.[provider] || 'pending') : null;

                            return (
                              <div key={`${prompt}-${provider}`} className="flex items-center gap-1.5">
                                <div className="w-5 h-5">{getProviderIcon(provider)}</div>
                                {analyzing && (
                                  <>
                                    {status === 'pending' && (
                                      <div className="w-4 h-4 rounded-full border-2 border-[#3f3f46]" />
                                    )}
                                    {status === 'running' && (
                                      <div className="relative">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#6366f1]" />
                                        <div className="absolute inset-0 bg-[#6366f1]/30 blur-sm rounded-full" />
                                      </div>
                                    )}
                                    {status === 'completed' && (
                                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10b981]/30">
                                        <CheckIcon className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    )}
                                    {status === 'failed' && (
                                      <div className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center">
                                        <span className="text-white text-[8px] font-bold">!</span>
                                      </div>
                                    )}
                                    {status === 'skipped' && (
                                      <div className="w-4 h-4 rounded-full bg-[#52525b]" />
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-[#2a2a3a]">
              {!analyzing && (
                <button
                  onClick={onAddPromptClick}
                  className="group h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 bg-[#0a0a0f] border border-[#2a2a3a] text-[#a1a1aa] hover:border-[#6366f1] hover:text-[#fafafa] hover:bg-[#6366f1]/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="relative">
                    <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  </div>
                  Add Custom Prompt
                </button>
              )}

              {analyzing && (
                <div className="flex items-center gap-3 text-[#71717a]">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] animate-bounce"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">Processing intelligence data...</span>
                </div>
              )}

              <button
                onClick={onStartAnalysis}
                disabled={analyzing}
                className={`group h-12 px-8 rounded-xl text-sm font-bold flex items-center gap-3 transition-all duration-300 ${
                  analyzing
                    ? 'bg-[#1a1a25] text-[#52525b] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#6366f1] via-[#4f46e5] to-[#6366f1] bg-[length:200%_100%] text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:scale-[1.03] hover:bg-[position:100%_0] animate-gradient'
                }`}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Sparkles className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      <div className="absolute inset-0 bg-white/50 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span>Start Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
