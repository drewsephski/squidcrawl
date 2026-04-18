'use client';

import PricingTable from '@/components/autumn/pricing-table';
import StaticPricingTable from '@/components/static-pricing-table';
import { useSession } from '@/lib/auth-client';

// Static product details for unauthenticated users
const staticProducts = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out our service",
    price: {
      primaryText: "Free",
      secondaryText: "No credit card required"
    },
    items: [
      { 
        primaryText: "10 messages per month",
        secondaryText: "AI-powered chat responses"
      },
      {
        primaryText: "Community support",
        secondaryText: "Get help from our community"
      },
      {
        primaryText: "Basic features",
        secondaryText: "Essential tools to get started"
      }
    ]
  },
  {
    id: "pro",
    name: "Pro",
    description: "For all your messaging needs",
    recommendText: "Most Popular",
    price: {
      primaryText: "$10/month",
      secondaryText: "billed monthly"
    },
    items: [
      { 
        primaryText: "100 messages per month",
        secondaryText: "AI-powered chat responses"
      },
      {
        primaryText: "Premium support",
        secondaryText: "Get help from our team"
      },
      {
        primaryText: "Priority access",
        secondaryText: "Be first to try new features"
      }
    ]
  }
];

export default function PricingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-radial-void opacity-50" />
      <div className="absolute inset-0 bg-grid-intelligence opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h1 className="text-[3rem] lg:text-[4.5rem] font-bold tracking-tight mb-6">
            <span className="text-gradient-accent">
              Simple, transparent pricing
            </span>
          </h1>
          <p className="text-xl text-[#71717a] max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Always flexible to scale up or down.
          </p>
          {session && (
            <p className="text-sm text-[#52525b] mt-4">
              Logged in as: {session.user?.email}
            </p>
          )}
        </div>

        <div className="card-intelligence p-8">
          {/* Use static component for unauthenticated users to avoid API calls */}
          {session ? (
            <PricingTable />
          ) : (
            <StaticPricingTable products={staticProducts} />
          )}
        </div>
      </div>
    </div>
  );
}