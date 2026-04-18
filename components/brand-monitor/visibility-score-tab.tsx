'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CompetitorRanking } from '@/lib/types';
import { IdentifiedCompetitor } from '@/lib/brand-monitor-reducer';
import { Target, TrendingUp, Award, Users } from 'lucide-react';

interface VisibilityScoreTabProps {
  competitors: CompetitorRanking[];
  brandData: CompetitorRanking;
  identifiedCompetitors: IdentifiedCompetitor[];
}

export function VisibilityScoreTab({
  competitors,
  brandData,
  identifiedCompetitors
}: VisibilityScoreTabProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const topCompetitor = competitors.filter(c => !c.isOwn)[0];
  const brandRank = competitors.findIndex(c => c.isOwn) + 1;
  const difference = topCompetitor ? brandData.visibilityScore - topCompetitor.visibilityScore : 0;
  
  return (
    <div className={`flex flex-col h-full transition-all duration-700 ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}>
      {/* Main Content Card */}
      <div className="relative bg-[#12121a] text-[#fafafa] rounded-2xl border-2 border-[#2a2a3a] overflow-hidden shadow-2xl shadow-black/50 h-full flex flex-col">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#f59e0b] via-[#22d3ee] to-[#6366f1]" />
        
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-intelligence opacity-[0.02]" />
        <div className="relative p-4 sm:p-6 lg:p-8 border-b-2 border-[#2a2a3a]">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#f59e0b]/30 blur-xl rounded-xl" />
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-xl shadow-[#f59e0b]/40">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#fafafa]">Visibility Score</h2>
                <p className="text-xs sm:text-sm lg:text-base text-[#a1a1aa]">
                  Your brand visibility across AI providers
                </p>
              </div>
            </div>

            {/* Visibility Score display */}
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-[#f59e0b]/20 blur-2xl rounded-full" />
                <div className="relative px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-[#0a0a0f] border-2 border-[#f59e0b]/40">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-[#f59e0b] to-[#22d3ee] bg-clip-text text-transparent">
                    {brandData.visibilityScore}%
                  </p>
                  <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 font-semibold">Overall Score</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative flex-1 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left side - Pie Chart */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">
              <div className="h-64 sm:h-72 lg:h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                      <linearGradient id="competitor1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="competitor2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#be185d" />
                      </linearGradient>
                      <linearGradient id="competitor3" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={competitors.slice(0, 8).map((competitor) => ({
                        name: competitor.name,
                        value: competitor.visibilityScore,
                        isOwn: competitor.isOwn
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      animationBegin={0}
                      animationDuration={1000}
                      stroke="none"
                    >
                      {competitors.slice(0, 8).map((competitor, idx) => (
                        <Cell 
                          key={`cell-${idx}`} 
                          fill={competitor.isOwn 
                            ? 'url(#brandGradient)' 
                            : idx === 0 ? 'url(#competitor1)' 
                            : idx === 1 ? 'url(#competitor2)'
                            : idx === 2 ? 'url(#competitor3)'
                            : ['#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e', '#6366f1'][idx % 5]}
                          stroke={competitor.isOwn ? '#f59e0b' : 'transparent'}
                          strokeWidth={competitor.isOwn ? 3 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#12121a', 
                        border: '1px solid #2a2a3a',
                        borderRadius: '12px',
                        fontSize: '14px',
                        padding: '12px 16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ color: '#fafafa' }}
                      labelStyle={{ color: '#a1a1aa', fontWeight: 600, marginBottom: '8px' }}
                      formatter={(value, name) => [`${value ?? 0}% visibility`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center content */}
                <div className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#6366f1]/30 blur-2xl rounded-full" />
                    <div className="relative">
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#f59e0b]" />
                        <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#fafafa]">#{brandRank}</p>
                      </div>
                      <p className="text-sm sm:text-base text-[#a1a1aa] font-semibold">Rank</p>
                    </div>
                  </div>
                  {difference !== 0 && (
                    <div className={`mt-2 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 ${
                      difference > 0
                        ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
                        : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/40'
                    }`}>
                      <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${difference < 0 ? 'rotate-180' : ''}`} />
                      <span className="text-xs sm:text-sm font-bold">
                        {difference > 0 ? '+' : ''}{Math.abs(difference).toFixed(1)}% vs #1
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right side - Legend */}
            <div className="w-full lg:w-80 space-y-3 sm:space-y-4 order-1 lg:order-2">
              {/* Legend header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b-2 border-[#2a2a3a]">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#a1a1aa]" />
                <span className="text-xs sm:text-sm font-bold text-[#a1a1aa] uppercase tracking-wider">
                  Competitors ({competitors.length})
                </span>
              </div>
              
              {competitors.slice(0, 8).map((competitor, idx) => {
                const competitorData = identifiedCompetitors.find(c => 
                  c.name === competitor.name || 
                  c.name.toLowerCase() === competitor.name.toLowerCase()
                );
                const faviconUrl = competitorData?.url ? 
                  `https://www.google.com/s2/favicons?domain=${competitorData.url}&sz=64` : null;
                
                const color = competitor.isOwn ? '#f59e0b' : 
                  ['#6366f1', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e'][idx % 7];
                
                return (
                  <div
                    key={idx}
                    className={`group flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 ${
                      competitor.isOwn
                        ? 'bg-gradient-to-r from-[#f59e0b]/20 to-[#f59e0b]/5 border-2 border-[#f59e0b]/50'
                        : 'bg-[#0a0a0f] border-2 border-[#2a2a3a] hover:border-[#3f3f46]'
                    }`}
                  >
                    {/* Color indicator */}
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}60` }}
                    />

                    {/* Favicon */}
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-[#12121a] flex items-center justify-center flex-shrink-0">
                      {faviconUrl ? (
                        <img
                          src={faviconUrl}
                          alt={competitor.name}
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold ${
                          competitor.isOwn ? 'bg-[#f59e0b]' : 'bg-[#3f3f46]'
                        }`}
                        style={{ display: faviconUrl ? 'none' : 'flex' }}
                      >
                        {competitor.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Name */}
                    <span className={`text-sm sm:text-base truncate flex-1 ${
                      competitor.isOwn ? 'font-bold text-[#f59e0b]' : 'font-semibold text-[#a1a1aa] group-hover:text-[#fafafa]'
                    }`}>
                      {competitor.name}
                    </span>

                    {/* Score */}
                    <span className={`text-sm sm:text-base font-black ${
                      competitor.isOwn ? 'text-[#f59e0b]' : 'text-[#fafafa]'
                    }`}>
                      {competitor.visibilityScore}%
                    </span>
                  </div>
                );
              })}
              
              {competitors.length > 8 && (
                <div className="text-center py-2 sm:py-3">
                  <span className="text-xs sm:text-sm font-bold text-[#52525b]">+{competitors.length - 8} more competitors</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}