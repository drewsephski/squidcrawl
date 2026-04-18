'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AIResponse } from '@/lib/types';
import { detectBrandMention, detectMultipleBrands } from '@/lib/brand-detection-utils';
import { getBrandDetectionOptions } from '@/lib/brand-detection-config';
import { highlightBrandMentions, segmentsToReactElements } from '@/lib/text-highlighting-utils';

interface HighlightedResponseProps {
  response: AIResponse;
  brandName: string;
  competitors: string[];
  showHighlighting?: boolean;
  highlightClassName?: string;
  renderMarkdown?: boolean;
}

// Clean up response text by removing artifacts
function cleanResponseText(text: string, providerName?: string): string {
  let cleaned = text;
  
  // Remove standalone numbers at the beginning of lines (like "0\n")
  cleaned = cleaned.replace(/^\d+\n/gm, '');
  
  // Remove provider name at the beginning if it exists
  if (providerName) {
    const providerPattern = new RegExp(`^${providerName}\\s*\n?`, 'i');
    cleaned = cleaned.replace(providerPattern, '');
  }
  
  // Remove common provider names at the beginning
  const commonProviders = ['OpenAI', 'Anthropic', 'Google', 'Perplexity'];
  commonProviders.forEach(provider => {
    const pattern = new RegExp(`^${provider}\\s*\n?`, 'i');
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove HTML tags but preserve the content
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return cleaned.trim();
}

export function HighlightedResponse({
  response,
  brandName,
  competitors,
  showHighlighting = true,
  highlightClassName = 'bg-green-100 text-green-900 px-0.5 rounded font-medium',
  renderMarkdown = true
}: HighlightedResponseProps) {
  // Clean the response text
  const cleanedResponse = cleanResponseText(response.response, response.provider);
  
  // Use detection details if available, otherwise detect on the fly - MUST be before any returns for React hooks
  const detectionResults = React.useMemo(() => {
    if (!showHighlighting) return new Map();
    
    if (response.detectionDetails) {
      // Convert stored details back to detection results format
      const results = new Map();
      
      // Add brand detection
      if (response.detectionDetails.brandMatches && response.detectionDetails.brandMatches.length > 0) {
        results.set(brandName, {
          mentioned: true,
          matches: response.detectionDetails.brandMatches,
          confidence: Math.max(...response.detectionDetails.brandMatches.map(m => m.confidence))
        });
      }
      
      // Add competitor detections
      if (response.detectionDetails.competitorMatches) {
        // Handle both Map and plain object (after serialization)
        if (response.detectionDetails.competitorMatches instanceof Map) {
          response.detectionDetails.competitorMatches.forEach((matches, competitor) => {
            if (matches.length > 0) {
              results.set(competitor, {
                mentioned: true,
                matches,
                confidence: Math.max(...matches.map(m => m.confidence))
              });
            }
          });
        } else {
          // Plain object after serialization
          Object.entries(response.detectionDetails.competitorMatches).forEach(([competitor, matches]) => {
            if (matches && matches.length > 0) {
              results.set(competitor, {
                mentioned: true,
                matches,
                confidence: Math.max(...matches.map((m: any) => m.confidence))
              });
            }
          });
        }
      }
      
      return results;
    } else {
      // Detect on the fly
      const allBrands = [brandName, ...competitors];
      const results = new Map();
      
      allBrands.forEach(brand => {
        const options = getBrandDetectionOptions(brand);
        const result = detectBrandMention(cleanedResponse, brand, options);
        if (result.mentioned) {
          results.set(brand, result);
        }
      });
      
      return results;
    }
  }, [response, brandName, competitors, cleanedResponse, showHighlighting]);
  
  // Generate highlighted segments
  const segments = React.useMemo(() => {
    if (!showHighlighting) return [];
    return highlightBrandMentions(cleanedResponse, detectionResults);
  }, [cleanedResponse, detectionResults, showHighlighting]);
  
  // Convert to React elements
  const elements = segmentsToReactElements(segments, highlightClassName);
  
  // If highlighting is disabled, just return the plain text or markdown
  if (!showHighlighting) {
    if (renderMarkdown) {
      return (
        <div className="text-left">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({children}) => <p className="mb-3 leading-relaxed text-left text-[#d4d4d8]">{children}</p>,
              ul: ({children}) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-left">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-left">{children}</ol>,
              li: ({children}) => <li className="text-sm leading-relaxed text-left text-[#d4d4d8]">{children}</li>,
              strong: ({children}) => <strong className="font-semibold text-[#fafafa]">{children}</strong>,
              em: ({children}) => <em className="italic text-[#a1a1aa]">{children}</em>,
              h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-left text-[#fafafa] border-b border-[#3f3f46] pb-2">{children}</h1>,
              h2: ({children}) => <h2 className="text-lg font-semibold mb-3 text-left text-[#fafafa]">{children}</h2>,
              h3: ({children}) => <h3 className="text-base font-semibold mb-2 text-left text-[#e4e4e7]">{children}</h3>,
              h4: ({children}) => <h4 className="text-sm font-semibold mb-2 text-left text-[#a1a1aa]">{children}</h4>,
              table: ({children}) => (
                <div className="overflow-x-auto my-4 rounded-lg border border-[#2a2a3a]">
                  <table className="min-w-full border-collapse text-sm text-left">
                    {children}
                  </table>
                </div>
              ),
              thead: ({children}) => <thead className="bg-[#1a1a24]">{children}</thead>,
              tbody: ({children}) => <tbody className="bg-[#12121a]">{children}</tbody>,
              tr: ({children}) => <tr className="border-b border-[#2a2a3a]">{children}</tr>,
              th: ({children}) => (
                <th className="px-4 py-2 text-left font-semibold text-[#fafafa] bg-[#1a1a24]">
                  {children}
                </th>
              ),
              td: ({children}) => (
                <td className="px-4 py-2 text-left text-[#d4d4d8]">
                  {children}
                </td>
              ),
              code: ({children, className}) => {
                if (className?.includes('language-')) {
                  return (
                    <pre className="bg-[#0a0a0f] rounded-lg p-3 text-xs overflow-x-auto mb-3 border border-[#2a2a3a] text-left">
                      <code className="text-[#d4d4d8]">{children}</code>
                    </pre>
                  );
                }
                return <code className="bg-[#1a1a24] px-1.5 py-0.5 rounded text-xs text-[#22d3ee]">{children}</code>;
              },
              blockquote: ({children}) => (
                <blockquote className="border-l-4 border-[#6366f1] pl-4 italic text-[#a1a1aa] mb-3 text-left bg-[#1a1a24]/50 py-2 pr-2 rounded-r">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-4 border-[#2a2a3a]" />,
              a: ({children, href}) => <a href={href} className="text-[#6366f1] hover:text-[#22d3ee] underline transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
          >
            {cleanedResponse}
          </ReactMarkdown>
        </div>
      );
    }
    return <>{cleanedResponse}</>;
  }
  
  if (renderMarkdown) {
    // For markdown with highlighting, render markdown first, then apply highlights to the final text
    return (
      <div className="text-left">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({children}) => <p className="mb-3 leading-relaxed text-left text-[#d4d4d8]">{children}</p>,
            ul: ({children}) => <ul className="list-disc pl-5 mb-3 space-y-1.5 text-left">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-left">{children}</ol>,
            li: ({children}) => <li className="text-sm leading-relaxed text-left text-[#d4d4d8]">{children}</li>,
            strong: ({children}) => <strong className="font-semibold text-[#fafafa]">{children}</strong>,
            em: ({children}) => <em className="italic text-[#a1a1aa]">{children}</em>,
            h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-left text-[#fafafa] border-b border-[#3f3f46] pb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-lg font-semibold mb-3 text-left text-[#fafafa]">{children}</h2>,
            h3: ({children}) => <h3 className="text-base font-semibold mb-2 text-left text-[#e4e4e7]">{children}</h3>,
            h4: ({children}) => <h4 className="text-sm font-semibold mb-2 text-left text-[#a1a1aa]">{children}</h4>,
            // Proper table rendering with dark theme
            table: ({children}) => (
              <div className="overflow-x-auto my-4 rounded-lg border border-[#2a2a3a]">
                <table className="min-w-full border-collapse text-sm text-left">
                  {children}
                </table>
              </div>
            ),
            thead: ({children}) => <thead className="bg-[#1a1a24]">{children}</thead>,
            tbody: ({children}) => <tbody className="bg-[#12121a]">{children}</tbody>,
            tr: ({children}) => <tr className="border-b border-[#2a2a3a]">{children}</tr>,
            th: ({children}) => (
              <th className="px-4 py-2 text-left font-semibold text-[#fafafa] bg-[#1a1a24]">
                {children}
              </th>
            ),
            td: ({children}) => (
              <td className="px-4 py-2 text-left text-[#d4d4d8]">
                {children}
              </td>
            ),
            // Add code block support with dark theme
            code: ({children, className}) => {
              if (className?.includes('language-')) {
                return (
                  <pre className="bg-[#0a0a0f] rounded-lg p-3 text-xs overflow-x-auto mb-3 border border-[#2a2a3a] text-left">
                    <code className="text-[#d4d4d8]">{children}</code>
                  </pre>
                );
              }
              return <code className="bg-[#1a1a24] px-1.5 py-0.5 rounded text-xs text-[#22d3ee]">{children}</code>;
            },
            blockquote: ({children}) => (
              <blockquote className="border-l-4 border-[#6366f1] pl-4 italic text-[#a1a1aa] mb-3 text-left bg-[#1a1a24]/50 py-2 pr-2 rounded-r">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="my-4 border-[#2a2a3a]" />,
            a: ({children, href}) => <a href={href} className="text-[#6366f1] hover:text-[#22d3ee] underline transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
          }}
        >
          {cleanedResponse}
        </ReactMarkdown>
      </div>
    );
  }
  
  return <div className="whitespace-pre-wrap">{elements}</div>;
}

// Export a simpler version for use in tooltips or previews
export function HighlightedText({
  text,
  brandName,
  competitors = [],
  highlightClassName = 'bg-green-100 text-green-900 px-0.5 rounded'
}: {
  text: string;
  brandName: string;
  competitors?: string[];
  highlightClassName?: string;
}) {
  const detectionResults = React.useMemo(() => {
    const allBrands = [brandName, ...competitors];
    const results = new Map();
    
    allBrands.forEach(brand => {
      const options = getBrandDetectionOptions(brand);
      const result = detectBrandMention(text, brand, options);
      if (result.mentioned) {
        results.set(brand, result);
      }
    });
    
    return results;
  }, [text, brandName, competitors]);
  
  const segments = highlightBrandMentions(text, detectionResults);
  const elements = segmentsToReactElements(segments, highlightClassName);
  
  return <>{elements}</>;
}