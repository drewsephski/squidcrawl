'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Type, Loader2, Lightbulb } from 'lucide-react';

interface AddPromptModalProps {
  isOpen: boolean;
  promptText: string;
  onPromptChange: (text: string) => void;
  onAdd: () => void;
  onClose: () => void;
  isAnalyzing?: boolean;
}

export function AddPromptModal({
  isOpen,
  promptText,
  onPromptChange,
  onAdd,
  onClose,
  isAnalyzing = false,
}: AddPromptModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && promptText.trim() && !isAnalyzing) {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`bg-[#12121a] border-[#2a2a3a] text-[#fafafa] w-[calc(100%-2rem)] sm:max-w-lg mx-auto overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 ${
        mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Top accent line with animation */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#6366f1] to-[#22d3ee]" />

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366f1]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

        <DialogHeader className="pb-3 sm:pb-4 relative">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-[#22d3ee]/30 blur-xl rounded-xl" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#22d3ee] to-[#6366f1] flex items-center justify-center shadow-lg shadow-[#22d3ee]/30">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-bold text-[#fafafa]">
                Add Custom Prompt
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-[#a1a1aa] mt-0.5 sm:mt-1">
                Enter a custom prompt to analyze how AI models respond
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-3 sm:py-4 relative">
          {/* Prompt input */}
          <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#22d3ee] rounded-lg sm:rounded-xl opacity-0 blur transition-opacity duration-300 ${promptText ? 'opacity-30' : 'group-hover:opacity-20'}`} />
            <div className="relative">
              <div className="absolute left-3 top-3">
                <Type className="w-4 h-4 sm:w-5 sm:h-5 text-[#6366f1]" />
              </div>
              <textarea
                value={promptText}
                onChange={(e) => onPromptChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., What are the best tools for...?"
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg sm:rounded-xl text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1] transition-all min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
                autoFocus
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee]" />
            <p className="text-xs text-[#71717a]">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a3a] text-[#a1a1aa] font-mono text-[10px] sm:text-xs">Enter</kbd> to add, <kbd className="px-1.5 py-0.5 rounded bg-[#2a2a3a] text-[#a1a1aa] font-mono text-[10px] sm:text-xs">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#2a2a3a] relative">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isAnalyzing}
            className="h-10 sm:h-11 bg-transparent border-[#2a2a3a] text-[#a1a1aa] hover:bg-[#1a1a25] hover:text-[#fafafa] hover:border-[#3f3f46] transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={onAdd}
            disabled={!promptText.trim() || isAnalyzing}
            className="group h-10 sm:h-11 bg-gradient-to-r from-[#6366f1] via-[#4f46e5] to-[#6366f1] bg-[length:200%_100%] text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:bg-[position:100%_0] disabled:opacity-50 transition-all duration-500"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="sm:hidden">Adding...</span>
                <span className="hidden sm:inline">Adding...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">Add Prompt</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}