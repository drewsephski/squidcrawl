'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUp } from '@/lib/auth-client';
import { Zap, Eye, EyeOff, ArrowRight, Check, Shield, Sparkles, BarChart3 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExistingAccountOptions, setShowExistingAccountOptions] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowExistingAccountOptions(false);

    try {
      const response = await signUp.email({
        name,
        email,
        password,
      });

      if (!response.error) {
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = '/';
      } else {
        throw response.error;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);

      if (err.status === 422 ||
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('already registered') ||
          errorMessage.toLowerCase().includes('existing email') ||
          errorMessage.toLowerCase().includes('email already') ||
          errorMessage.toLowerCase().includes('user already exists')) {
        setShowExistingAccountOptions(true);
      }
      setLoading(false);
    }
  };

  const benefits = [
    { icon: BarChart3, text: "10 free brand analyses" },
    { icon: Shield, text: "Secure data encryption" },
    { icon: Sparkles, text: "AI-powered insights" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-radial-void" />
        <div className="absolute inset-0 bg-grid-intelligence opacity-20" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366f1]/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#22d3ee]/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

        <div className="relative z-10 max-w-md px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[#6366f1]/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#fafafa]">
              Fire<span className="text-[#6366f1]">GEO</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold text-[#fafafa] mb-4">
            Start tracking your
            <span className="text-gradient-accent"> AI visibility</span>
          </h1>
          <p className="text-lg text-[#a1a1aa] mb-8">
            Join thousands of brands monitoring their presence across ChatGPT, Claude, and other AI platforms.
          </p>

          <div className="space-y-4">
            {benefits.map((item, i) => (
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
                Create your account
              </h2>
              <p className="text-sm text-[#71717a]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#6366f1] hover:text-[#818cf8] font-medium">
                  Sign in
                </Link>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-intelligence w-full px-4 py-3"
                  placeholder="John Doe"
                />
              </div>

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
                    autoComplete="new-password"
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
                <p className="mt-1 text-xs text-[#71717a]">At least 8 characters</p>
              </div>

              {error && (
                <div className={`p-4 rounded-xl ${showExistingAccountOptions ? 'bg-[#1a1a25] border border-[#f59e0b]/30' : 'bg-[#ef4444]/10 border border-[#ef4444]/30'}`}>
                  <p className={showExistingAccountOptions ? 'text-[#f59e0b] font-medium' : 'text-[#ef4444]'}>
                    {error}
                  </p>
                  {showExistingAccountOptions && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-[#a1a1aa]">
                        An account with this email already exists.
                      </p>
                      <div className="flex gap-2">
                        <Link
                          href={`/login?email=${encodeURIComponent(email)}`}
                          className="btn-primary px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                        >
                          Sign in instead
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/forgot-password"
                          className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-[#3f3f46] bg-[#0a0a0f] text-[#6366f1] focus:ring-[#6366f1] focus:ring-offset-0"
                />
                <label htmlFor="terms" className="text-sm text-[#71717a]">
                  I agree to the{' '}
                  <Link href="#" className="text-[#6366f1] hover:text-[#818cf8]">Terms</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-[#6366f1] hover:text-[#818cf8]">Privacy Policy</Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold h-12 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create account
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