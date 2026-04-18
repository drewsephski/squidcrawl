'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth-client';
import { Zap, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setSuccess('Password reset successfully. You can now login with your new password.');
    }

    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signIn.email({
        email,
        password,
      });

      if (response.error) {
        setError(response.error.message || 'Failed to login');
        setLoading(false);
        return;
      }

      const returnUrl = searchParams.get('from') || '/dashboard';
      window.location.replace(returnUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-radial-void" />
        <div className="absolute inset-0 bg-grid-intelligence opacity-20" />

        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#22d3ee]/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

        <div className="relative z-10 max-w-md px-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#fafafa]">
              Fire<span className="text-[#6366f1]">GEO</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-[#fafafa] mb-4">
            Welcome back to your
            <span className="text-gradient-accent"> AI Command Center</span>
          </h1>
          <p className="text-lg text-[#a1a1aa] mb-8">
            Sign in to monitor your brand visibility across ChatGPT, Claude, and other AI platforms.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: Shield, text: "Secure, encrypted authentication" },
              { icon: Sparkles, text: "Real-time AI visibility insights" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[#a1a1aa]">
                <div className="w-8 h-8 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-[#6366f1]" />
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#fafafa]">
              Fire<span className="text-[#6366f1]">GEO</span>
            </span>
          </div>

          <div className="card-intelligence p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#fafafa] mb-2">
                Sign in to your account
              </h2>
              <p className="text-sm text-[#71717a]">
                Don't have an account?{' '}
                <Link href="/register" className="text-[#6366f1] hover:text-[#818cf8] font-medium">
                  Create one
                </Link>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-intelligence w-full px-4 py-3"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-intelligence w-full px-4 py-3 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#71717a] hover:text-[#a1a1aa]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#3f3f46] bg-[#0a0a0f] text-[#6366f1] focus:ring-[#6366f1] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#71717a]">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-[#6366f1] hover:text-[#818cf8]">
                  Forgot password?
                </Link>
              </div>

              {success && (
                <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-sm">
                  {success}
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold h-12 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}