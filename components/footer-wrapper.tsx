'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export function FooterWrapper() {
  const pathname = usePathname();
  
  // Don't show footer on full-screen dashboard pages
  if (pathname === '/chat' || pathname === '/brand-monitor') {
    return null;
  }
  
  return <Footer />;
}
