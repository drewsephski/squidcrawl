'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/hooks/useAutumnCustomer';
import ProductChangeDialog from '@/components/autumn/product-change-dialog';

interface StaticProduct {
  id: string;
  name?: string;
  description?: string;
  recommendText?: string;
  isCurrentPlan?: boolean;
  price: {
    primaryText: string;
    secondaryText?: string;
  };
  items: Array<{
    primaryText: string;
    secondaryText?: string;
  }>;
}

interface StaticPricingTableProps {
  products: StaticProduct[];
  isAuthenticated?: boolean;
}

export default function StaticPricingTable({ products, isAuthenticated }: StaticPricingTableProps) {
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const router = useRouter();
  const { refetch: refetchCustomer, attach } = useCustomer();

  const handleSelectPlan = async (productId: string) => {
    if (!isAuthenticated) {
      setLoadingProductId(productId);
      router.push(`/register?plan=${productId}`);
      return;
    }

    // For authenticated users, trigger checkout via Autumn
    setLoadingProductId(productId);
    try {
      // Free plan - just attach directly without payment
      if (productId === 'free') {
        await attach({
          productId,
          successUrl: window.location.origin + '/dashboard?checkout=success',
        });
        await refetchCustomer();
        router.push('/dashboard');
      } else {
        // Paid plan - use dialog for checkout flow
        await attach({
          productId,
          dialog: ProductChangeDialog,
          successUrl: window.location.origin + '/dashboard?checkout=success',
        });
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoadingProductId(null);
    }
  };

  const hasRecommended = products.some((p) => p.recommendText);

  return (
    <div className="flex items-center flex-col">
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] w-full gap-2 sm:gap-3 lg:gap-4",
          hasRecommended && "!py-4 lg:!py-10"
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={cn(
              "relative w-full h-full py-4 sm:py-6 text-foreground border rounded-lg shadow-sm max-w-xl",
              product.recommendText &&
                "lg:-translate-y-6 lg:shadow-lg dark:shadow-zinc-800/80 lg:h-[calc(100%+48px)] bg-secondary/40"
            )}
          >
            {product.recommendText && (
              <div className="bg-black absolute border text-white text-xs sm:text-sm font-medium lg:rounded-full px-2 sm:px-3 py-0.5 lg:py-0.5 lg:top-4 lg:right-4 top-[-1px] right-[-1px] rounded-bl-lg rounded-br-lg sm:rounded-bl-none">
                {product.recommendText}
              </div>
            )}
            <div
              className={cn(
                "flex flex-col h-full flex-grow",
                product.recommendText && "lg:translate-y-6"
              )}
            >
              <div className="h-full">
                <div className="flex flex-col">
                  <div className="pb-3 sm:pb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold px-4 sm:px-6 truncate">
                      {product.name || product.id}
                    </h2>
                    {product.description && (
                      <div className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-6 h-auto sm:h-8 mt-1">
                        <p className="line-clamp-2">{product.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="mb-2">
                    <h3 className="font-semibold h-auto sm:h-16 flex px-4 sm:px-6 py-3 sm:py-0 items-center border-y mb-3 sm:mb-4 bg-secondary/40">
                      <div className="line-clamp-2 text-sm sm:text-base">
                        {product.price.primaryText}{' '}
                        {product.price.secondaryText && (
                          <span className="font-normal text-muted-foreground mt-1 text-xs sm:text-sm">
                            {product.price.secondaryText}
                          </span>
                        )}
                      </div>
                    </h3>
                  </div>
                </div>
                {product.items.length > 0 && (
                  <div className="flex-grow px-4 sm:px-6 mb-4 sm:mb-6">
                    <div className="space-y-2 sm:space-y-3">
                      {product.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span>{item.primaryText}</span>
                            {item.secondaryText && (
                              <span className="text-xs text-muted-foreground">
                                {item.secondaryText}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={cn("px-4 sm:px-6", product.recommendText && "lg:-translate-y-12")}>
                <button
                  onClick={() => handleSelectPlan(product.id)}
                  disabled={product.isCurrentPlan || loadingProductId === product.id}
                  className={cn(
                    "w-full py-2.5 sm:py-3 px-3 sm:px-4 group overflow-hidden relative transition-all duration-300 border rounded-[10px] inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm font-medium disabled:pointer-events-none disabled:opacity-50",
                    product.recommendText ? "btn-firecrawl-orange" : "btn-firecrawl-default"
                  )}
                >
                  {loadingProductId === product.id ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  ) : product.isCurrentPlan ? (
                    <span>Current Plan</span>
                  ) : (
                    <>
                      <div className="flex items-center justify-between w-full transition-transform duration-300 group-hover:-translate-y-[150%]">
                        <span>{isAuthenticated ? 'Select Plan' : 'Get Started'}</span>
                        <span className="text-xs sm:text-sm">→</span>
                      </div>
                      <div className="flex items-center justify-between w-full absolute inset-x-0 px-3 sm:px-4 translate-y-[150%] transition-transform duration-300 group-hover:translate-y-0">
                        <span>{isAuthenticated ? 'Select Plan' : 'Get Started'}</span>
                        <span className="text-xs sm:text-sm">→</span>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}