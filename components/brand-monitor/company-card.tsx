'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Globe, Building2, ExternalLink, Plus, Trash2, Sparkles, Radar, Zap, Users, Twitter, Linkedin, Github } from 'lucide-react';
import { Company } from '@/lib/types';
import Image from 'next/image';
import { Button } from '../ui/button';

interface CompanyCardProps {
  company: Company;
  onAnalyze: () => void;
  analyzing: boolean;
  showCompetitors?: boolean;
  identifiedCompetitors?: Array<{ 
    name: string; 
    url?: string;
    metadata?: {
      ogImage?: string;
      favicon?: string;
      description?: string;
      validated?: boolean;
    };
    loading?: boolean;
  }>;
  onRemoveCompetitor?: (index: number) => void;
  onAddCompetitor?: () => void;
  onContinueToAnalysis?: () => void;
}

export function CompanyCard({ 
  company, 
  onAnalyze, 
  analyzing,
  showCompetitors = false,
  identifiedCompetitors = [],
  onRemoveCompetitor,
  onAddCompetitor,
  onContinueToAnalysis 
}: CompanyCardProps) {
  const [logoError, setLogoError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Validate URLs
  const isValidUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  const validLogoUrl = isValidUrl(company.logo) ? company.logo : null;
  const validFaviconUrl = isValidUrl(company.favicon) ? company.favicon : null;

  return (
    <div className={`relative transition-all duration-700 ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {/* Ambient glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-[#6366f1]/5 via-[#22d3ee]/5 to-[#6366f1]/5 rounded-3xl blur-2xl opacity-50" />
      
      <div className="relative bg-[#12121a] text-[#fafafa] rounded-2xl border border-[#2a2a3a] overflow-hidden shadow-2xl shadow-black/50">
        {/* Top accent line with animation */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366f1] via-[#22d3ee] to-[#6366f1]" />
        
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-grid-intelligence opacity-[0.02]" />
        
        <div className="relative">
          {/* Header section with asymmetric layout */}
          <div className="flex flex-col lg:flex-row lg:items-stretch">
            {/* Left side - Visual showcase */}
            <div className="relative w-full lg:w-80 lg:flex-shrink-0 bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] p-4 sm:p-6 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 lg:gap-0">
              {/* Decorative elements - hidden on mobile */}
              <div className="hidden lg:block absolute top-4 left-4 w-20 h-20 border border-[#6366f1]/20 rounded-full" />
              <div className="hidden lg:block absolute bottom-4 right-4 w-12 h-12 border border-[#22d3ee]/20 rounded-full" />

              {/* Logo/Brand display */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-[#6366f1]/20 blur-2xl rounded-full" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl bg-[#0a0a0f] border border-[#2a2a3a] flex items-center justify-center overflow-hidden">
                  {validLogoUrl && !logoError ? (
                    <Image
                      src={validLogoUrl}
                      alt={company.name}
                      fill
                      className="object-contain p-2 lg:p-3"
                      sizes="96px"
                      onError={() => setLogoError(true)}
                    />
                  ) : validFaviconUrl && !faviconError ? (
                    <Image
                      src={validFaviconUrl}
                      alt={`${company.name} logo`}
                      width={48}
                      height={48}
                      className="object-contain"
                      onError={() => setFaviconError(true)}
                    />
                  ) : (
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center">
                      <span className="text-xl lg:text-2xl font-bold text-white">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Website link */}
              <a
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 lg:mt-4 flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] hover:border-[#6366f1] hover:bg-[#1a1a25] transition-all group"
              >
                <Globe className="h-3.5 w-3.5 text-[#71717a] group-hover:text-[#22d3ee]" />
                <span className="text-xs text-[#a1a1aa] group-hover:text-[#fafafa] truncate max-w-[120px] sm:max-w-[180px] lg:max-w-none">
                  {new URL(company.url).hostname}
                </span>
                <ExternalLink className="h-3 w-3 text-[#52525b] group-hover:text-[#a1a1aa] hidden sm:inline" />
              </a>
            </div>

            {/* Right side - Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl lg:text-3xl font-bold text-[#fafafa] tracking-tight">
                      {company.name}
                    </h3>
                    {company.industry && (
                      <Badge className="bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/30 px-3 py-1">
                        {company.industry}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-[#a1a1aa] leading-relaxed max-w-2xl">
                    {company.description || 'No description available'}
                  </p>
                </div>
                
                {/* Action button */}
                <button
                  onClick={onAnalyze}
                  disabled={analyzing}
                  className={`flex-shrink-0 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                    analyzing
                      ? 'bg-[#1a1a25] text-[#71717a] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-lg shadow-[#6366f1]/30 hover:shadow-[#6366f1]/50 hover:scale-[1.02]'
                  }`}
                >
                  {analyzing ? (
                    <>
                      <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span className="hidden sm:inline">Scanning...</span>
                      <span className="sm:hidden">Scanning</span>
                    </>
                  ) : (
                    <>
                      <Radar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Identify Competitors</span>
                      <span className="sm:hidden">Find Competitors</span>
                    </>
                  )}
                </button>
              </div>

              {/* Keywords section */}
              {company.scrapedData?.keywords && company.scrapedData.keywords.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-[#6366f1] to-[#22d3ee] rounded-full" />
                    <span className="text-xs font-medium text-[#71717a] uppercase tracking-wider">
                      Detected Keywords
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {company.scrapedData.keywords.slice(0, 8).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-[#0a0a0f] text-[#a1a1aa] border border-[#2a2a3a] hover:border-[#3f3f46] hover:text-[#fafafa] transition-colors cursor-default"
                        style={{ 
                          animationDelay: `${idx * 50}ms`,
                          animation: mounted ? 'fadeInUp 0.5s ease-out forwards' : 'none',
                          opacity: 0
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                    {company.scrapedData.keywords.length > 8 && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm text-[#52525b]">
                        +{company.scrapedData.keywords.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Stats row - horizontal scroll on mobile */}
              <div className="flex items-center gap-3 sm:gap-6 pt-4 border-t border-[#2a2a3a] overflow-x-auto scrollbar-hide pb-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] flex items-center justify-center">
                    <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#f59e0b]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-[#52525b]">Analysis Type</p>
                    <p className="text-xs sm:text-sm text-[#a1a1aa]">AI Visibility Scan</p>
                  </div>
                </div>
                <div className="h-7 sm:h-8 w-px bg-[#2a2a3a] flex-shrink-0" />
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6366f1]" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-[#52525b]">Providers</p>
                    <p className="text-xs sm:text-sm text-[#a1a1aa]">5 AI Platforms</p>
                  </div>
                </div>
                {company.scrapedData?.founded && (
                  <>
                    <div className="h-7 sm:h-8 w-px bg-[#2a2a3a] flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] flex items-center justify-center">
                        <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#22d3ee]" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#52525b]">Founded</p>
                        <p className="text-xs sm:text-sm text-[#a1a1aa]">{company.scrapedData.founded}</p>
                      </div>
                    </div>
                  </>
                )}
                {company.scrapedData?.employees && (
                  <>
                    <div className="h-7 sm:h-8 w-px bg-[#2a2a3a] flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#10b981]" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-[#52525b]">Team</p>
                        <p className="text-xs sm:text-sm text-[#a1a1aa]">{company.scrapedData.employees}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Social Links */}
              {company.scrapedData?.socialLinks && Object.values(company.scrapedData.socialLinks).some(Boolean) && (
                <div className="flex items-center gap-3 pt-3 border-t border-[#2a2a3a]">
                  <span className="text-xs text-[#52525b]">Social:</span>
                  <div className="flex items-center gap-2">
                    {company.scrapedData.socialLinks.twitter && (
                      <a href={company.scrapedData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" 
                         className="text-[#71717a] hover:text-[#1da1f2] transition-colors">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {company.scrapedData.socialLinks.linkedin && (
                      <a href={company.scrapedData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                         className="text-[#71717a] hover:text-[#0a66c2] transition-colors">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {company.scrapedData.socialLinks.github && (
                      <a href={company.scrapedData.socialLinks.github} target="_blank" rel="noopener noreferrer"
                         className="text-[#71717a] hover:text-[#fafafa] transition-colors">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      
        {/* Screenshot & Metadata Section */}
        {showCompetitors && (
          <div className="border-t border-[#2a2a3a]">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-[#0a0a0f]/50">
              {/* Screenshot Preview */}
              {company.scrapedData?.screenshot && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-gradient-to-b from-[#f59e0b] to-[#ec4899] rounded-full" />
                    <span className="text-xs font-medium text-[#71717a] uppercase tracking-wider">
                      Website Preview
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-[#2a2a3a] bg-[#12121a]">
                    <img 
                      src={company.scrapedData.screenshot} 
                      alt={`${company.name} website preview`}
                      className="w-full h-48 object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs text-[#a1a1aa]">Live capture from {new URL(company.url).hostname}</span>
                      <a 
                        href={company.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#22d3ee] hover:underline flex items-center gap-1"
                      >
                        Visit site <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Additional Metadata Grid */}
              {(company.scrapedData?.useCases?.length || company.scrapedData?.differentiators?.length || company.scrapedData?.targetAudience || company.scrapedData?.headquarters) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {company.scrapedData?.useCases && company.scrapedData.useCases.length > 0 && (
                    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-[#f59e0b]" />
                        <span className="text-sm font-medium text-[#fafafa]">Use Cases</span>
                      </div>
                      <ul className="space-y-1">
                        {company.scrapedData.useCases.slice(0, 3).map((useCase, i) => (
                          <li key={i} className="text-xs text-[#a1a1aa] flex items-start gap-2">
                            <span className="text-[#f59e0b]">•</span>
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {company.scrapedData?.differentiators && company.scrapedData.differentiators.length > 0 && (
                    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-[#6366f1]" />
                        <span className="text-sm font-medium text-[#fafafa]">Key Differentiators</span>
                      </div>
                      <ul className="space-y-1">
                        {company.scrapedData.differentiators.slice(0, 3).map((diff, i) => (
                          <li key={i} className="text-xs text-[#a1a1aa] flex items-start gap-2">
                            <span className="text-[#6366f1]">•</span>
                            {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {company.scrapedData?.targetAudience && (
                    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-[#22d3ee]" />
                        <span className="text-sm font-medium text-[#fafafa]">Target Audience</span>
                      </div>
                      <p className="text-xs text-[#a1a1aa]">{company.scrapedData.targetAudience}</p>
                    </div>
                  )}
                  
                  {company.scrapedData?.headquarters && (
                    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-[#10b981]" />
                        <span className="text-sm font-medium text-[#fafafa]">Location</span>
                      </div>
                      <p className="text-xs text-[#a1a1aa]">{company.scrapedData.headquarters}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Competitors Section */}
        {showCompetitors && (
          <div className="border-t border-[#2a2a3a]">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-6 sm:pb-8 bg-[#0a0a0f]/50">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-1 h-5 sm:h-6 bg-gradient-to-b from-[#22d3ee] to-[#6366f1] rounded-full" />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#fafafa]">Identified Competitors</h3>
                    <p className="text-xs sm:text-sm text-[#71717a]">
                      {identifiedCompetitors.length > 0
                        ? `Comparing ${company.name} against ${identifiedCompetitors.length} competitors`
                        : 'Add competitors manually or continue without them'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {identifiedCompetitors.length > 0 && (
                    <span className="px-2 sm:px-3 py-1 rounded-full bg-[#6366f1]/10 text-[#6366f1] text-xs sm:text-sm font-medium">
                      {identifiedCompetitors.length} found
                    </span>
                  )}
                </div>
              </div>

              {identifiedCompetitors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 sm:mb-6">
                  {identifiedCompetitors.map((competitor, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-[#12121a] rounded-xl border border-[#2a2a3a] p-4 hover:border-[#3f3f46] hover:bg-[#1a1a25] transition-all duration-300"
                      style={{
                        animationDelay: `${idx * 50}ms`,
                        animation: mounted ? 'fadeInUp 0.5s ease-out forwards' : 'none',
                        opacity: 0
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Favicon with glow */}
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <div className="absolute inset-0 bg-[#6366f1]/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                          {competitor.url ? (
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${competitor.url}&sz=64`}
                              alt=""
                              className="relative w-10 h-10 rounded-lg bg-[#0a0a0f] p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`absolute inset-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center ${competitor.url ? 'hidden' : 'flex'}`}
                          >
                            <span className="text-sm font-bold text-white">
                              {competitor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Name and URL */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#fafafa] text-sm truncate">{competitor.name}</span>
                            {competitor.url && (
                              <a
                                href={competitor.url.startsWith('http') ? competitor.url : `https://${competitor.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#52525b] hover:text-[#22d3ee] transition-colors flex-shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {competitor.metadata?.description && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20 flex-shrink-0" title={competitor.metadata.description}>
                                AI detected
                              </span>
                            )}
                          </div>
                          {competitor.url ? (
                            <p className="text-xs text-[#52525b] truncate">{competitor.url}</p>
                          ) : competitor.metadata?.description ? (
                            <p className="text-xs text-[#52525b] truncate italic" title={competitor.metadata.description}>
                              {competitor.metadata.description.substring(0, 40)}...
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Remove button */}
                      {onRemoveCompetitor && (
                        <button
                          onClick={() => onRemoveCompetitor(idx)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg hover:bg-[#ef4444]/10 hover:scale-110"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#ef4444]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] p-8 text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-[#3f3f46]" />
                  </div>
                  <p className="text-sm text-[#a1a1aa] mb-2">No competitors found automatically</p>
                  <p className="text-xs text-[#52525b]">Try adding competitors manually using the button below</p>
                </div>
              )}

              {/* Actions */}
              <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4 pb-2 border-t border-[#2a2a3a]">
                {onAddCompetitor && (
                  <Button
                    onClick={onAddCompetitor}
                    className="h-10 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-[#0a0a0f] border border-[#2a2a3a] text-[#a1a1aa] hover:border-[#22d3ee] hover:text-[#22d3ee] transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    Add Competitor
                  </Button>
                )}

                {onContinueToAnalysis && (
                  <Button
                    onClick={onContinueToAnalysis}
                    className="h-11 px-6 sm:px-8 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-lg shadow-[#6366f1]/30 hover:shadow-[#6366f1]/50 hover:scale-[1.02] transition-all duration-300"
                  >
                    <span className="hidden sm:inline">Continue to Analysis</span>
                    <span className="sm:hidden">Continue</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}