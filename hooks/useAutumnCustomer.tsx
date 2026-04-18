'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useCustomer as useAutumnCustomer } from 'autumn-js/react';

// Extract types from the hook since they're not exported from main entry
type UseCustomerParams = Parameters<typeof useAutumnCustomer>[0];
type UseCustomerResult = ReturnType<typeof useAutumnCustomer>;

// Create a context for the refetch function
interface AutumnCustomerContextType {
  refetchCustomer: () => Promise<void>;
}

const AutumnCustomerContext = createContext<AutumnCustomerContextType | null>(null);

// Provider component
export function AutumnCustomerProvider({ children }: { children: ReactNode }) {
  // Call without params - the hook will fetch normally
  const { refetch } = useAutumnCustomer();

  const refetchCustomer = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <AutumnCustomerContext.Provider value={{ refetchCustomer }}>
      {children}
    </AutumnCustomerContext.Provider>
  );
}

// Safe wrapper for useAutumnCustomer that handles being outside provider
function useAutumnCustomerSafe(params?: UseCustomerParams): UseCustomerResult {
  try {
    return useAutumnCustomer(params);
  } catch (error) {
    // If the error is about being outside provider, return safe defaults
    if (error instanceof Error && error.message.includes('AutumnProvider')) {
      return {
        customer: null,
        products: [],
        isLoading: false,
        refetch: async () => null,
        error: null,
      } as unknown as UseCustomerResult;
    }
    throw error;
  }
}

// Hook to use the customer data with global refetch
export function useCustomer(params?: UseCustomerParams) {
  const autumnCustomer = useAutumnCustomerSafe(params);
  const context = useContext(AutumnCustomerContext);

  // Create a wrapped refetch that can be used globally
  const globalRefetch = useCallback(async () => {
    // Refetch the local instance
    const result = await autumnCustomer.refetch();
    
    // Also trigger any global refetch if in context
    if (context?.refetchCustomer) {
      await context.refetchCustomer();
    }
    
    return result;
  }, [autumnCustomer, context]);

  return {
    ...autumnCustomer,
    refetch: globalRefetch,
  };
}

// Hook to trigger a global customer data refresh from anywhere
export function useRefreshCustomer() {
  const context = useContext(AutumnCustomerContext);
  
  if (!context) {
    // Return a no-op function if not in provider
    return async () => {
      console.warn('useRefreshCustomer called outside of AutumnCustomerProvider');
    };
  }
  
  return context.refetchCustomer;
}