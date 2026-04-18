'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Global checkout detector that runs on all pages.
 * When returning from Stripe checkout with ?checkout=success,
 * it forces a page reload to guarantee fresh customer data.
 */
export function CheckoutDetector() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      // Remove the query param and reload to get fresh data
      // This is the most reliable way to ensure all components get updated
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      window.location.reload();
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
