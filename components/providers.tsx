'use client';

import { AutumnProvider } from 'autumn-js/react';
import { QueryProvider } from '@/lib/providers/query-provider';
import { AutumnCustomerProvider } from '@/hooks/useAutumnCustomer';
import { useSession } from '@/lib/auth-client';
import { CheckoutDetector } from '@/components/checkout-detector';

function AuthAwareAutumnProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  // Only render AutumnProvider when logged in
  if (!session) {
    return <>{children}</>;
  }
  
  return (
    <AutumnProvider
      backendUrl="/api/autumn"
      betterAuthUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
    >
      <AutumnCustomerProvider>
        <CheckoutDetector />
        {children}
      </AutumnCustomerProvider>
    </AutumnProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthAwareAutumnProvider>
        {children}
      </AuthAwareAutumnProvider>
    </QueryProvider>
  );
}