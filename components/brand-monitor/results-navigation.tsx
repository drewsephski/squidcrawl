import React, { useState, useEffect } from 'react';
import { ResultsTab } from '@/lib/brand-monitor-reducer';
import { LayoutGrid, MessageSquare, Trophy, Target, ArrowLeft } from 'lucide-react';

interface BrandData {
  visibilityScore: number;
  sentimentScore: number;
  shareOfVoice: number;
  overallScore: number;
  averagePosition: number;
  weeklyChange?: number;
}

interface ResultsNavigationProps {
  activeTab: ResultsTab;
  onTabChange: (tab: ResultsTab) => void;
  onRestart: () => void;
  brandData?: BrandData;
  brandName?: string;
}

export function ResultsNavigation({
  activeTab,
  onTabChange,
  onRestart,
  brandData,
  brandName
}: ResultsNavigationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabClick = (tab: ResultsTab) => {
    onTabChange(tab);
  };

  const tabs = [
    { id: 'matrix' as ResultsTab, label: 'Comparison Matrix', icon: LayoutGrid, color: '#6366f1' },
    { id: 'prompts' as ResultsTab, label: 'Prompts & Responses', icon: MessageSquare, color: '#22d3ee' },
    { id: 'rankings' as ResultsTab, label: 'Provider Rankings', icon: Trophy, color: '#f59e0b' },
    { id: 'visibility' as ResultsTab, label: 'Visibility Score', icon: Target, color: '#10b981' },
  ];

  return (
    <nav className={`w-72 flex-shrink-0 flex flex-col h-[calc(100vh-8rem)] sticky top-8 transition-all duration-700 ${
      mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
    }`}>
      <div className="w-full flex flex-col justify-between flex-1 bg-[#12121a] rounded-2xl border border-[#2a2a3a] p-4 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-[#2a2a3a]">
          <h3 className="text-sm font-bold text-[#fafafa] uppercase tracking-wider">Results</h3>
          <p className="text-xs text-[#71717a] mt-1">Navigate your analysis</p>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-2 flex-1">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`group w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6366f1]/20 to-[#6366f1]/5 text-[#fafafa] border border-[#6366f1]/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                    : 'bg-transparent text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#fafafa] border border-transparent hover:border-[#2a2a3a]'
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-[#6366f1]/20'
                    : 'bg-[#2a2a3a] group-hover:bg-[#3f3f46]'
                }`}>
                  <Icon className={`w-4 h-4 transition-colors duration-300 ${
                    isActive ? 'text-[#6366f1]' : 'text-[#71717a] group-hover:text-[#a1a1aa]'
                  }`} />
                </div>
                <span>{tab.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Stats Summary */}
        {brandData && (
          <div className="mb-4 p-4 bg-[#0a0a0f] rounded-xl border border-[#2a2a3a]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#71717a]">Visibility</span>
              <span className="text-lg font-black text-[#f59e0b]">{brandData.visibilityScore}%</span>
            </div>
            <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#f59e0b] to-[#22d3ee] rounded-full transition-all duration-1000"
                style={{ width: `${brandData.visibilityScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Analyze another website button */}
        <div className="pt-4 border-t border-[#2a2a3a]">
          <button
            onClick={onRestart}
            className="group w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 bg-[#0a0a0f] text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#fafafa] border border-[#2a2a3a] hover:border-[#3f3f46] flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2a2a3a] group-hover:bg-[#3f3f46] flex items-center justify-center transition-all duration-300">
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </div>
            <span>New Analysis</span>
          </button>
        </div>
      </div>
    </nav>
  );
}