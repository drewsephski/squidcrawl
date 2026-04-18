'use client';

import StaticPricingTable from '@/components/static-pricing-table';
import { useSession } from '@/lib/auth-client';
import { useCustomer } from '@/hooks/useAutumnCustomer';
import { Loader2 } from 'lucide-react';

// Static product details - these are shown consistently to all users
const staticProducts = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out brand monitoring",
    price: {
      primaryText: "Free",
      secondaryText: "No credit card required"
    },
    items: [
      {
        primaryText: "1 AI credit per month",
        secondaryText: "Try our AI-powered brand analysis"
      },
      {
        primaryText: "Community support",
        secondaryText: "Get help when you need it"
      }
    ]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious brand monitoring",
    recommendText: "Most Popular",
    price: {
      primaryText: "$9.99/month",
      secondaryText: "billed monthly"
    },
    items: [
      {
        primaryText: "50 AI credits per month",
        secondaryText: "Full-powered brand analysis"
      },
      {
        primaryText: "Priority support",
        secondaryText: "Get help from our team"
      }
    ]
  }
];

export default function PricingPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const { customer } = useCustomer();

  // Get current plan IDs from customer data
  const currentPlanIds = customer?.products?.map((p: any) => p.id) || [];

  // Add isCurrentPlan flag to products
  const productsWithCurrentPlan = staticProducts.map(product => ({
    ...product,
    isCurrentPlan: currentPlanIds.includes(product.id)
  }));

  // Show loading state while session is loading to prevent flicker
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-6 sm:py-8 lg:py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-radial-void opacity-50" />
      <div className="absolute inset-0 bg-grid-intelligence opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5rem] font-bold tracking-tight mb-4 sm:mb-6">
            <span className="text-gradient-accent">
              Simple, transparent pricing
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#71717a] max-w-2xl mx-auto px-4 sm:px-0">
            Choose the perfect plan for your needs. Always flexible to scale up or down.
          </p>
          {session && (
            <p className="text-xs sm:text-sm text-[#52525b] mt-3 sm:mt-4">
              Logged in as: {session.user?.email}
            </p>
          )}
        </div>

        <div className="card-intelligence p-4 sm:p-6 lg:p-8">
          {/* Always use StaticPricingTable for consistent design */}
          <StaticPricingTable
            products={productsWithCurrentPlan}
            isAuthenticated={!!session}
          />
        </div>
      </div>
    </div>
  );
}