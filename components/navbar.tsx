'use client';

import Link from 'next/link';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCustomer } from '@/hooks/useAutumnCustomer';
import { Zap } from 'lucide-react';
import { TentacleLogo } from '@/components/tentacle-logo';
import { Button } from './ui/button';

// Separate component that only renders when Autumn is available
function UserCredits() {
  const { customer } = useCustomer();
  const messageUsage = customer?.features?.messages;
  const remainingMessages = messageUsage ? (messageUsage.balance || 0) : 0;
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12121a] border border-[#2a2a3a]">
      <div className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] animate-pulse" />
      <span className="text-sm font-mono text-[#a1a1aa]">{remainingMessages}</span>
      <span className="text-xs text-[#71717a]">credits</span>
    </div>
  );
}

export function Navbar() {
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setTimeout(() => {
        router.refresh();
        setIsLoggingOut(false);
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-[#2a2a3a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <TentacleLogo className="w-7 h-7 text-[#22d3ee] transition-all duration-300 group-hover:text-[#67e8f9]" />
                <div className="absolute inset-0 bg-[#22d3ee]/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold tracking-tight text-[#fafafa] font-sans">
                  Squid<span className="text-[#22d3ee]">Crawl</span>
                </span>
                <span className="text-[10px] text-[#71717a] -mt-0.5 tracking-widest uppercase font-medium">AI Web Intelligence</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {session && (
              <>
                <NavLink href="/chat">Chat</NavLink>
                <NavLink href="/brand-monitor">Monitor</NavLink>
              </>
            )}
            <NavLink href="/plans">Pricing</NavLink>
            
            {session && <div className="mx-3"><UserCredits /></div>}
            
            <div className="h-5 w-px bg-[#2a2a3a] mx-2" />
            
            {isPending ? (
              <div className="w-20 h-9 rounded-lg bg-[#1a1a25] animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Button variant="indigo" size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#1a1a25] rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoggingOut ? '...' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="indigo" size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-[#71717a] hover:text-[#fafafa] rounded-lg hover:bg-[#1a1a25] transition-all duration-200"
    >
      {children}
    </Link>
  );
}