'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  ChevronDown, 
  ArrowRight, 
  Shield, 
  Globe, 
  TrendingUp, 
  Eye, 
  MessageSquare,
  Target,
  Activity,
  Radar,
  Terminal,
  Database,
  Radio,
  Zap,
  Crown,
  Sparkles,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const router = useRouter();
  const { data: session } = useSession();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleStartAnalysis = () => {
    if (session) {
      router.push('/brand-monitor');
    } else {
      router.push('/register');
    }
  };


  const providers = [
    { name: "ChatGPT", status: "Active", latency: "142ms" },
    { name: "Claude", status: "Active", latency: "189ms" },
    { name: "Perplexity", status: "Active", latency: "156ms" },
    { name: "Gemini", status: "Active", latency: "203ms" },
  ];

  const faqs = [
    {
      q: "How does SquidCrawl work?",
      a: "SquidCrawl analyzes your brand's visibility across major AI platforms. Simply enter your website URL, and we'll query ChatGPT, Claude, Perplexity, and other AI models to see how they rank your brand against competitors.",
    },
    {
      q: "How often is the data updated?",
      a: "Our monitoring runs in real-time. When you run an analysis, we query all AI providers simultaneously to get the most current results. You can run new analyses anytime to track changes.",
    },
    {
      q: "What insights will I get?",
      a: "You'll receive visibility scores, competitor rankings, prompt analysis, response quality metrics, and actionable recommendations to improve your AI presence across all platforms.",
    },
    {
      q: "How does the credit system work?",
      a: "Each brand analysis uses 1 credit across all AI providers. The free tier includes 1 credit to try the service. Pro plans include 50 credits for $9.99/month.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section - Dark Intelligence Command Center */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-intelligence opacity-20" />
        
        {/* Left side data stream decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#2a2a3a] to-transparent opacity-50" />
        <div className="absolute left-8 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[#6366f1]/20 to-transparent hidden lg:block" />
        
        {/* Right side status indicators */}
        <div className="absolute right-8 top-1/3 hidden lg:flex flex-col items-end gap-4">
          {providers.map((provider, i) => (
            <div key={provider.name} className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#52525b]">{provider.latency}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#a1a1aa]">{provider.name}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
          <div className="max-w-3xl">
            {/* Status bar */}
            <div className="flex items-center gap-4 mb-8 animate-fade-in-up">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#12121a] border border-[#2a2a3a]">
                <Radio className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-xs font-mono text-[#71717a]">SYSTEM ONLINE</span>
              </div>
              <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-[#2a2a3a] to-transparent" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-100">
              <span className="text-[#fafafa] block">AI Brand Intelligence</span>
              <span className="text-[#71717a] block mt-2">Command Center</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#a1a1aa] mb-10 leading-relaxed max-w-2xl animate-fade-in-up animation-delay-200">
              Track how AI models rank your brand against competitors. 
              Real-time monitoring across ChatGPT, Claude, Perplexity, and Gemini.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up animation-delay-300">
              <Button variant="indigo" size="lg" onClick={handleStartAnalysis}>
                <Terminal className="w-4 h-4" />
                Start Analysis
              </Button>
              <Button variant="outline" size="lg" asChild className="flex items-center gap-2 text-foreground hover:text-black">
                <Link href="/plans">
                  View Pricing
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#71717a] animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10b981]" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#6366f1]" />
                <span>5+ AI providers</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#22d3ee]" />
                <span>Real-time data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom border line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2a2a3a] to-transparent" />
      </section>

      {/* Capabilities Section - Asymmetric Intelligence Grid */}
      <section className="py-32 lg:py-40 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section header - Asymmetric left-aligned with dramatic scale */}
          <div className="mb-20 lg:mb-28 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-20 bg-[#6366f1]" />
              <span className="text-sm font-mono text-[#6366f1] uppercase tracking-[0.2em]">Capabilities</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-end">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] leading-[1.1]">
                Command center for
                <span className="text-[#71717a]"> AI visibility</span>
              </h2>
              <p className="text-lg text-[#a1a1aa] lg:text-right lg:pb-2">
                Real-time monitoring across all major AI platforms. Track rankings, analyze competitors, optimize presence.
              </p>
            </div>
          </div>

          {/* Asymmetric Feature Grid - Breaking the predictable pattern */}
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Feature 1: Large horizontal card spanning 8 cols */}
            <div className="col-span-12 lg:col-span-8 group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="h-full bg-[#12121a] border border-[#2a2a3a] p-8 lg:p-10 relative overflow-hidden transition-all duration-500 hover:border-[#6366f1]/50">
                {/* Data stream decoration */}
                <div className="absolute top-0 right-0 w-64 h-full opacity-10">
                  <div className="h-full flex flex-col justify-around py-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 justify-end">
                        <div className="h-px bg-gradient-to-l from-[#6366f1] to-transparent" style={{ width: `${Math.random() * 100 + 50}px` }} />
                        <div className="w-1 h-1 rounded-full bg-[#6366f1]" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <span className="text-7xl lg:text-8xl font-bold font-mono text-[#6366f1]/10">01</span>
                    <div className="w-14 h-14 bg-[#6366f1]/10 flex items-center justify-center">
                      <Eye className="w-7 h-7 text-[#6366f1]" />
                    </div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#fafafa] mb-4">Visibility Tracking</h3>
                  <p className="text-[#a1a1aa] text-lg leading-relaxed max-w-md">
                    Monitor how ChatGPT, Claude, Perplexity, and Gemini rank your brand. Real-time alerts when your position changes.
                  </p>
                  
                  {/* Terminal-style data preview */}
                  <div className="mt-8 flex items-center gap-4 text-xs font-mono">
                    <span className="text-[#52525b]">STATUS</span>
                    <span className="text-[#10b981]">● MONITORING</span>
                    <span className="text-[#2a2a3a]">|</span>
                    <span className="text-[#52525b]">PROVIDERS</span>
                    <span className="text-[#6366f1]">5 ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Vertical card spanning 4 cols */}
            <div className="col-span-12 lg:col-span-4 group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="h-full bg-[#0f0f14] border border-[#2a2a3a] p-8 relative overflow-hidden transition-all duration-500 hover:border-[#22d3ee]/50">
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#22d3ee]/5 to-transparent" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold font-mono text-[#22d3ee]/10">02</span>
                    <div className="w-12 h-12 bg-[#22d3ee]/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-[#22d3ee]" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-[#fafafa] mb-3">Competitor Analysis</h3>
                    <p className="text-[#a1a1aa] leading-relaxed">
                      Compare your visibility against competitors. Identify opportunities to outrank them across all AI platforms.
                    </p>
                  </div>
                  
                  {/* Mini chart visualization */}
                  <div className="mt-6 flex items-end gap-1 h-12">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-[#22d3ee]/20 hover:bg-[#22d3ee]/40 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Vertical card spanning 5 cols */}
            <div className="col-span-12 lg:col-span-5 group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="h-full bg-[#0f0f14] border border-[#2a2a3a] p-8 relative overflow-hidden transition-all duration-500 hover:border-[#f59e0b]/50">
                {/* Concentric rings decoration */}
                <div className="absolute -right-20 -top-20 w-64 h-64 opacity-10">
                  <div className="w-full h-full rounded-full border border-[#f59e0b]" />
                  <div className="absolute inset-8 rounded-full border border-[#f59e0b]" />
                  <div className="absolute inset-16 rounded-full border border-[#f59e0b]" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-5xl font-bold font-mono text-[#f59e0b]/10">03</span>
                    <div className="w-12 h-12 bg-[#f59e0b]/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-[#f59e0b]" />
                    </div>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-[#fafafa] mb-3">Performance Metrics</h3>
                  <p className="text-[#a1a1aa] leading-relaxed mb-6">
                    Track visibility scores, share of voice, and sentiment analysis. Understand how AI models perceive your brand.
                  </p>
                  
                  {/* Metric pills */}
                  <div className="flex flex-wrap gap-2">
                    {['Score', 'Share', 'Sentiment', 'Trend'].map((label) => (
                      <span key={label} className="px-3 py-1 text-xs font-mono bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Large horizontal card spanning 7 cols */}
            <div className="col-span-12 lg:col-span-7 group animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="h-full bg-[#12121a] border border-[#2a2a3a] p-8 lg:p-10 relative overflow-hidden transition-all duration-500 hover:border-[#10b981]/50">
                {/* Radar sweep effect */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 opacity-10">
                  <div className="w-full h-full rounded-full border-2 border-[#10b981]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#10b981] to-transparent rotate-45" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <span className="text-7xl lg:text-8xl font-bold font-mono text-[#10b981]/10">04</span>
                    <div className="w-14 h-14 bg-[#10b981]/10 flex items-center justify-center">
                      <Radar className="w-7 h-7 text-[#10b981]" />
                    </div>
                  </div>
                  
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-[#fafafa] mb-4">Prompt Intelligence</h3>
                      <p className="text-[#a1a1aa] text-lg leading-relaxed">
                        Discover which prompts trigger your brand appearance. Optimize your content for better AI visibility and recommendations.
                      </p>
                    </div>
                    
                    {/* Prompt tags visualization */}
                    <div className="flex flex-col gap-2 justify-center">
                      {[
                        { text: '"best saas tools"', rank: 1 },
                        { text: '"ai monitoring"', rank: 2 },
                        { text: '"brand visibility"', rank: 3 },
                      ].map((prompt, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-mono">
                          <span className="text-[#10b981] w-6">#{prompt.rank}</span>
                          <span className="text-[#a1a1aa]">{prompt.text}</span>
                          <div className="flex-1 h-px bg-[#2a2a3a]" />
                          <span className="text-[#10b981]">+{12 - i * 3}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Bold Terminal Intelligence */}
      <section className="py-24 lg:py-32 border-y border-[#2a2a3a] bg-[#0a0a0f] relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(90deg, #2a2a3a 1px, transparent 1px), linear-gradient(#2a2a3a 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section label */}
          <div className="flex items-center gap-4 mb-12">
            <span className="text-xs font-mono text-[#52525b] uppercase tracking-[0.2em]">System Metrics</span>
            <div className="flex-1 h-px bg-[#2a2a3a]" />
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#52525b]">LIVE</span>
            </div>
          </div>
          
          {/* Stats grid - Asymmetric with dramatic scale */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#2a2a3a]">
            {[
              { value: "5+", label: "AI Providers", sublabel: "Monitored 24/7", accent: "#6366f1", code: "PRV" },
              { value: "<2s", label: "Response", sublabel: "Real-time analysis", accent: "#22d3ee", code: "RT" },
              { value: "100%", label: "Coverage", sublabel: "All platforms", accent: "#f59e0b", code: "COV" },
              { value: "∞", label: "Scale", sublabel: "Enterprise ready", accent: "#10b981", code: "SC" },
            ].map((stat, i) => (
              <div key={stat.label} className="bg-[#0a0a0f] p-8 lg:p-10 group hover:bg-[#12121a] transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                {/* Terminal code label */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono text-[#52525b]">{stat.code}</span>
                  <div 
                    className="w-1.5 h-1.5 rounded-full opacity-60"
                    style={{ backgroundColor: stat.accent }}
                  />
                </div>
                
                {/* Dramatic value */}
                <div 
                  className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 tracking-tight"
                  style={{ color: stat.accent }}
                >
                  {stat.value}
                </div>
                
                {/* Label */}
                <div className="text-lg font-medium text-[#fafafa] mb-1">{stat.label}</div>
                <div className="text-sm text-[#52525b] font-mono">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Command Center Terminal Style */}
      <section className="py-32 lg:py-40 relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(90deg, #6366f1 1px, transparent 1px), linear-gradient(#6366f1 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section header - Asymmetric with terminal aesthetic */}
          <div className="mb-20 lg:mb-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-20 bg-[#f59e0b]" />
              <span className="text-sm font-mono text-[#f59e0b] uppercase tracking-[0.2em]">Pricing</span>
              <span className="text-xs font-mono text-[#52525b]">v2.4</span>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 items-end">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#fafafa] leading-[1.1]">
                Choose your
                <span className="block text-[#52525b]">access level</span>
              </h2>
              <p className="text-lg text-[#a1a1aa] lg:text-right lg:pb-2">
                Transparent pricing with no hidden fees. Upgrade or downgrade anytime. Pay only for what you use.
              </p>
            </div>
          </div>

          {/* Pricing Table - Terminal Data Display */}
          <div className="border border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 border-b border-[#2a2a3a] bg-[#12121a]">
              <div className="col-span-12 lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a3a]">
                <span className="text-xs font-mono text-[#52525b] uppercase tracking-wider">Plan</span>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 border-r border-[#2a2a3a]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#52525b] uppercase tracking-wider">Starter</span>
                  <span className="px-2 py-0.5 text-xs font-mono bg-[#52525b]/20 text-[#71717a] rounded">FREE</span>
                </div>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 relative">
                <div className="absolute top-0 right-0 w-32 h-px bg-gradient-to-l from-[#6366f1] to-transparent" />
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#6366f1] uppercase tracking-wider">Pro</span>
                  <span className="px-2 py-0.5 text-xs font-mono bg-[#6366f1]/20 text-[#6366f1] rounded">RECOMMENDED</span>
                </div>
              </div>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-12 border-b border-[#2a2a3a]">
              <div className="col-span-12 lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a3a] flex items-center">
                <span className="text-sm font-mono text-[#71717a]">Monthly Cost</span>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 border-r border-[#2a2a3a]">
                <span className="text-4xl lg:text-5xl font-bold font-mono text-[#fafafa]">$0</span>
                <span className="text-sm text-[#52525b] ml-2">/mo</span>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 bg-[#6366f1]/5">
                <span className="text-4xl lg:text-5xl font-bold font-mono text-[#6366f1]">$9.99</span>
                <span className="text-sm text-[#52525b] ml-2">/mo</span>
              </div>
            </div>

            {/* Credits Row */}
            <div className="grid grid-cols-12 border-b border-[#2a2a3a]">
              <div className="col-span-12 lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a3a] flex items-center">
                <span className="text-sm font-mono text-[#71717a]">Analysis Credits</span>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 border-r border-[#2a2a3a]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-mono text-[#fafafa]">1</span>
                  <span className="text-sm text-[#71717a]">total</span>
                </div>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 bg-[#6366f1]/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold font-mono text-[#6366f1]">50</span>
                  <span className="text-sm text-[#6366f1]">/month</span>
                </div>
                <span className="text-xs text-[#6366f1]/70 mt-1 block">50x more capacity</span>
              </div>
            </div>

            {/* Features Rows */}
            {[
              { label: "AI Providers", starter: "All 5", pro: "All 5 + Priority" },
              { label: "Analysis Depth", starter: "Standard", pro: "Advanced" },
              { label: "Support", starter: "Community", pro: "Priority Email" },
              { label: "Data Export", starter: "—", pro: "CSV & JSON" },
              { label: "API Access", starter: "—", pro: "Full Access" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-12 border-b border-[#2a2a3a] last:border-b-0">
                <div className="col-span-12 lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a3a] flex items-center">
                  <span className="text-sm text-[#a1a1aa]">{row.label}</span>
                </div>
                <div className="col-span-6 lg:col-span-4 p-6 border-r border-[#2a2a3a] flex items-center">
                  {row.starter === "—" ? (
                    <span className="text-[#52525b]">—</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#52525b]" />
                      <span className="text-sm text-[#71717a]">{row.starter}</span>
                    </div>
                  )}
                </div>
                <div className="col-span-6 lg:col-span-4 p-6 bg-[#6366f1]/5 flex items-center">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#6366f1]" />
                    <span className="text-sm text-[#fafafa]">{row.pro}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* CTA Row */}
            <div className="grid grid-cols-12">
              <div className="col-span-12 lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-[#2a2a3a] hidden lg:flex items-center">
                <span className="text-xs font-mono text-[#52525b]">SELECT PLAN</span>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 border-r border-[#2a2a3a]">
                <Button variant="outline" size="lg" className="w-full text-white hover:text-black" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
              <div className="col-span-6 lg:col-span-4 p-6 bg-[#6366f1]/5">
                <Button variant="indigo" size="lg" className="w-full" asChild>
                  <Link href="/register">
                    Upgrade to Pro
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Credit info */}
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-[#52525b] font-mono">
              <span className="text-[#6366f1]">1 credit</span> = <span className="text-[#22d3ee]">1 brand analysis</span> across all AI providers
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#52525b]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>LIVE PRICING</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - With Framer Motion Animations */}
      <section className="py-32 lg:py-40 relative overflow-hidden">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#12121a]/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left side - Header */}
            <div className="lg:col-span-2">
              <motion.div 
                className="lg:sticky lg:top-32"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-20 bg-[#22d3ee]" />
                  <span className="text-sm font-mono text-[#22d3ee] uppercase tracking-[0.2em]">FAQ</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-[#fafafa] mb-4 leading-[1.1]">
                  Questions?
                  <span className="block text-[#52525b]">Answers.</span>
                </h2>
                <p className="text-[#a1a1aa] mb-8 text-lg">
                  Everything you need to know about SquidCrawl Monitor. Can't find what you're looking for?
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-[#22d3ee] hover:text-[#22d3ee]/80 transition-colors text-sm font-medium group"
                >
                  <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Contact Support
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Right side - FAQ items with Framer Motion */}
            <div className="lg:col-span-3 space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.1,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="bg-[#12121a] border border-[#2a2a3a] rounded-xl overflow-hidden hover:border-[#3f3f46] transition-colors duration-300"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-[#1a1a25]/50 transition-colors duration-200 group"
                  >
                    <span className="font-semibold text-[#fafafa] group-hover:text-[#22d3ee] transition-colors duration-200">
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown className="w-5 h-5 text-[#6366f1] flex-shrink-0" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div 
                          className="px-6 pb-5"
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          exit={{ y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="h-px w-full bg-[#2a2a3a] mb-4" />
                          <p className="text-[#a1a1aa] leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Clean and purposeful */}
      <section className="py-24 lg:py-32 border-t border-[#2a2a3a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#fafafa] mb-6">
            Ready to master your AI visibility?
          </h2>
          <p className="text-lg sm:text-xl text-[#a1a1aa] mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of brands already using SquidCrawl to monitor and improve their AI presence across all major platforms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStartAnalysis}
              className="inline-flex items-center justify-center gap-2 rounded-lg text-base font-semibold h-12 px-8 bg-[#6366f1] text-white hover:bg-[#4f46e5] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6366f1]/25 active:translate-y-0 active:shadow-none transition-all duration-200 ease-out border border-[#6366f1]/50 cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              Start Free Analysis
            </Button>
            <Button variant="outline" size="lg" className="text-white hover:text-black inline-flex items-center justify-center gap-2 rounded-lg text-base font-semibold h-12 px-8" asChild>
              <Link href="/plans">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}