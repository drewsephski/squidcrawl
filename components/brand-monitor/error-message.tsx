import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-[#ef4444]/30 blur-lg rounded-xl" />

        {/* Main card */}
        <div className="relative bg-[#12121a] border border-[#ef4444]/40 rounded-xl shadow-2xl shadow-[#ef4444]/20 flex items-center gap-4 pr-3 pl-4 py-4 min-w-[320px] max-w-[480px]">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 border border-[#ef4444]/30 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#fafafa] mb-0.5">Error</p>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">{error}</p>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#52525b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-200 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Side accent line */}
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-[#ef4444] to-[#f87171] rounded-full" />
        </div>
      </div>
    </div>
  );
}