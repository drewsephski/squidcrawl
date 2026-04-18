'use client';

import { BrandMonitor } from '@/components/brand-monitor/brand-monitor';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Radio, Menu, X, Plus, Trash2, Loader2, Terminal } from 'lucide-react';
import { useCustomer, useRefreshCustomer } from '@/hooks/useAutumnCustomer';
import { useBrandAnalyses, useBrandAnalysis, useDeleteBrandAnalysis } from '@/hooks/useBrandAnalyses';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useSession } from '@/lib/auth-client';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

// Separate component that uses Autumn hooks
function BrandMonitorContent({ session }: { session: any }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { customer, isLoading, error } = useCustomer();
  const refreshCustomer = useRefreshCustomer();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [newAnalysisRequested, setNewAnalysisRequested] = useState(false);

  // Queries and mutations
  const { data: analyses, isLoading: analysesLoading } = useBrandAnalyses();
  const { data: currentAnalysis } = useBrandAnalysis(selectedAnalysisId);
  const deleteAnalysis = useDeleteBrandAnalysis();
  
  // Get credits from customer data
  const messageUsage = customer?.features?.messages;
  const credits = messageUsage ? (messageUsage.balance || 0) : 0;

  useEffect(() => {
    // If there's an auth error, redirect to login
    if (error?.code === 'UNAUTHORIZED' || error?.code === 'AUTH_ERROR') {
      router.push('/login');
    }
  }, [error, router]);

  const handleCreditsUpdate = async () => {
    // Use the global refresh to update customer data everywhere
    await refreshCustomer();
  };
  
  const handleDeleteAnalysis = async (analysisId: string) => {
    setAnalysisToDelete(analysisId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (analysisToDelete) {
      await deleteAnalysis.mutateAsync(analysisToDelete);
      if (selectedAnalysisId === analysisToDelete) {
        setSelectedAnalysisId(null);
      }
      setAnalysisToDelete(null);
    }
  };
  
  const handleNewAnalysis = () => {
    // Trigger the new analysis flow in BrandMonitor
    // BrandMonitor will save current analysis if needed, then reset
    setNewAnalysisRequested(true);
  };

  const handleNewAnalysisComplete = () => {
    // Called by BrandMonitor after it has saved and reset
    setNewAnalysisRequested(false);
    setSelectedAnalysisId(null);
    // Refresh the sidebar list to show any newly saved analysis
    queryClient.invalidateQueries({ queryKey: ['brandAnalyses', session?.user?.id] });
  };

  return (
    <div className="h-full bg-[#0a0a0f] overflow-hidden">
      <div className="flex h-full relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Toggle Button - Always visible */}
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed lg:absolute top-[12rem] lg:top-9 z-30 p-2 bg-[#12121a] rounded-lg shadow-lg shadow-black/40 transition-all duration-200 border border-[#2a2a3a] hover:border-[#3f3f46] ${
            sidebarOpen
              ? 'left-[17rem] sm:left-[20rem] lg:left-[324px]'
              : 'left-3 sm:left-4 lg:left-4'
          }`}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#a1a1aa]" />
          ) : (
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-[#a1a1aa]" />
          )}
        </Button>

        {/* Sidebar */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-20 w-72 sm:w-80 bg-[#12121a] border-r border-[#2a2a3a] overflow-hidden flex flex-col transition-all duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
        }`}>
          <div className="p-3 sm:p-4 border-b border-[#2a2a3a]">
            <Button variant="indigo" size="sm" className="w-full text-xs sm:text-sm" onClick={handleNewAnalysis}>
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
              New Analysis
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            {analysesLoading ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs sm:text-sm text-[#71717a]">Loading analyses...</span>
              </div>
            ) : analyses?.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-[#3f3f46] mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-[#71717a]">No analyses yet</p>
                <p className="text-[10px] sm:text-xs text-[#52525b] mt-1">Start a new analysis to begin</p>
              </div>
            ) : (
              <div className="space-y-1 p-1.5 sm:p-2">
                {analyses?.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                      selectedAnalysisId === analysis.id
                        ? 'bg-[#6366f1]/5 border border-[#6366f1]/30'
                        : 'hover:bg-[#1a1a25] border border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedAnalysisId(analysis.id);
                      // Close sidebar on mobile after selection
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate text-xs sm:text-sm ${
                          selectedAnalysisId === analysis.id ? 'text-[#6366f1]' : 'text-[#fafafa]'
                        }`}>
                          {analysis.companyName || 'Untitled Analysis'}
                        </p>
                        <p className="text-[10px] sm:text-xs text-[#71717a] truncate mt-0.5">
                          {analysis.url}
                        </p>
                        <p className="text-[10px] sm:text-xs text-[#52525b] mt-1 font-mono">
                          {analysis.createdAt && format(new Date(analysis.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAnalysis(analysis.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg hover:bg-[#ef4444]/10 hover:text-[#ef4444] text-[#52525b] transition-all duration-200 flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-[#0a0a0f] relative z-10 min-w-0">
          {/* Command Center Header */}
          <div className="relative border-b border-[#2a2a3a] bg-[#0a0a0f]">
            <div className="absolute inset-0 bg-grid-intelligence opacity-10" />
            <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 relative">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className={`flex flex-wrap items-center gap-2 sm:gap-3 transition-all duration-300 ${
                    sidebarOpen ? '' : 'lg:ml-14'
                  }`}>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md bg-[#12121a] border border-[#2a2a3a]">
                      <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#10b981]" />
                      <span className="text-[10px] sm:text-xs font-mono text-[#71717a]">MONITOR ACTIVE</span>
                    </div>
                    <div className="h-3 sm:h-4 w-px bg-[#2a2a3a] hidden sm:block" />
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-[#52525b]">
                      <span>v2.4.1</span>
                      <span className="text-[#2a2a3a] hidden sm:inline">|</span>
                      <span className="text-[#6366f1] hidden sm:inline">5 PROVIDERS</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-[#fafafa] font-mono">Brand Monitor</h1>
                    <p className="text-[10px] sm:text-xs text-[#71717a]">AI Visibility Command Center</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 pb-20 sm:pb-24 lg:pb-32 min-h-full">
            <BrandMonitor
              creditsAvailable={credits}
              onCreditsUpdate={handleCreditsUpdate}
              selectedAnalysis={selectedAnalysisId ? currentAnalysis : null}
              onSaveAnalysis={(savedAnalysis) => {
                // Invalidate queries to refresh the sidebar list
                queryClient.invalidateQueries({ queryKey: ['brandAnalyses', session?.user?.id] });
                // Select the newly saved analysis
                if (savedAnalysis?.id) {
                  setSelectedAnalysisId(savedAnalysis.id);
                }
              }}
              newAnalysisRequested={newAnalysisRequested}
              onRequestNewAnalysis={handleNewAnalysisComplete}
            />
          </div>
        </div>
      </div>
      
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Analysis"
        description="Are you sure you want to delete this analysis? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        isLoading={deleteAnalysis.isPending}
      />
    </div>
  );
}

export default function BrandMonitorPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#a1a1aa]">Please log in to access the brand monitor</p>
        </div>
      </div>
    );
  }

  return <BrandMonitorContent session={session} />;
}