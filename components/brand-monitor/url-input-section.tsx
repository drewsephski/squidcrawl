'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Loader2, ArrowRight, Sparkles, Scan } from 'lucide-react';

interface UrlInputSectionProps {
  url: string;
  urlValid: boolean | null;
  loading: boolean;
  analyzing: boolean;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
}

export function UrlInputSection({
  url,
  urlValid,
  loading,
  analyzing,
  onUrlChange,
  onSubmit
}: UrlInputSectionProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] relative px-4 sm:px-6">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[300px] sm:h-[400px] bg-gradient-radial from-[#6366f1]/10 via-[#22d3ee]/5 to-transparent rounded-full blur-3xl transition-all duration-1000 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        />
      </div>

      {/* Main content */}
      <div className={`relative z-10 w-full max-w-3xl px-2 sm:px-6 transition-all duration-700 delay-200 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Icon and label */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className={`relative mb-4 sm:mb-6 transition-all duration-500 delay-300 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <div className="absolute inset-0 bg-[#6366f1]/20 blur-xl rounded-full" />
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
              <Scan className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#22d3ee] rounded-full shadow-lg shadow-[#22d3ee]/50" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }}>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#f59e0b] rounded-full shadow-lg shadow-[#f59e0b]/50" />
            </div>
          </div>

          <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-[#fafafa] mb-2 text-center transition-all duration-500 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Analyze Your Brand
          </h2>
          <p className={`text-sm sm:text-base text-[#a1a1aa] text-center max-w-md px-4 sm:px-0 transition-all duration-500 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Discover how visible your brand is across AI platforms like ChatGPT, Claude, and more
          </p>
        </div>

        {/* Input container with dramatic styling */}
        <div className={`relative group transition-all duration-500 delay-600 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Glow border effect */}
          <div className={`absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-[#6366f1] via-[#22d3ee] to-[#6366f1] rounded-xl sm:rounded-2xl blur opacity-0 transition-opacity duration-300 ${
            isFocused ? 'opacity-30' : 'group-hover:opacity-20'
          }`} />

          <div className="relative bg-[#0a0a0f] rounded-lg sm:rounded-xl border border-[#2a2a3a] overflow-hidden transition-all duration-300">
            {/* Scanning line animation */}
            {loading && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1] to-transparent animate-scan" />
              </div>
            )}

            <div className="flex items-center">
              {/* Left icon section */}
              <div className="flex-shrink-0 pl-3 sm:pl-5 pr-2 sm:pr-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isFocused
                    ? 'bg-[#6366f1]/20'
                    : urlValid === true
                    ? 'bg-[#10b981]/20'
                    : urlValid === false
                    ? 'bg-[#ef4444]/20'
                    : 'bg-[#1a1a25]'
                }`}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366f1] animate-spin" />
                  ) : (
                    <Globe className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                      isFocused
                        ? 'text-[#6366f1]'
                        : urlValid === true
                        ? 'text-[#10b981]'
                        : urlValid === false
                        ? 'text-[#ef4444]'
                        : 'text-[#71717a]'
                    }`} />
                  )}
                </div>
              </div>

              {/* Input field */}
              <input
                type="text"
                className="flex-1 h-12 sm:h-16 bg-transparent text-sm sm:text-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none font-medium"
                placeholder="yourcompany.com"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && !analyzing && url) {
                    onSubmit();
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={loading || analyzing}
              />

              {/* Submit button */}
              <div className="flex-shrink-0 pr-2 sm:pr-3">
                <button
                  onClick={onSubmit}
                  disabled={loading || analyzing || !url || urlValid === false}
                  className={`h-9 sm:h-12 px-3 sm:px-6 rounded-lg font-medium flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                    url && urlValid !== false
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-lg shadow-[#6366f1]/30 hover:shadow-[#6366f1]/50 hover:scale-[1.02]'
                      : 'bg-[#1a1a25] text-[#52525b] cursor-not-allowed'
                  }`}
                  aria-label="Analyze website"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden sm:inline">Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Analyze</span>
                      <ArrowRight className="h-4 w-4 sm:hidden" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Validation indicator */}
          <div className="absolute -bottom-6 sm:-bottom-8 left-0 right-0 flex justify-center">
            {urlValid === false && (
              <span className="text-xs sm:text-sm text-[#ef4444] animate-fade-in">
                Please enter a valid URL
              </span>
            )}
            {urlValid === true && (
              <span className="text-xs sm:text-sm text-[#10b981] animate-fade-in flex items-center gap-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#10b981]" />
                URL looks good
              </span>
            )}
          </div>
        </div>

        {/* Helper text */}
        <div className={`mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-[#52525b] transition-all duration-500 delay-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#6366f1]" />
            No signup required
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#22d3ee]" />
            Instant results
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#f59e0b]" />
            5 AI providers
          </span>
        </div>
      </div>

      {/* Add scan animation keyframes */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}