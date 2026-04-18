'use client';

import { useCustomer, usePricingTable } from 'autumn-js/react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, CheckCircle, AlertCircle, Loader2, User, Mail, Phone, Edit2, Save, X, Zap, Settings, BarChart3, CreditCard, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductChangeDialog from '@/components/autumn/product-change-dialog';
import { useProfile, useUpdateProfile, useSettings, useUpdateSettings } from '@/hooks/useProfile';

function DashboardContent({ session }: { session: any }) {
  const { customer, attach } = useCustomer();
  const { products } = usePricingTable();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const { data: profileData } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    phone: '',
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'settings'>('overview');

  useEffect(() => {
    if (profileData?.profile) {
      setProfileForm({
        displayName: profileData.profile.displayName || '',
        bio: profileData.profile.bio || '',
        phone: profileData.profile.phone || '',
      });
    }
  }, [profileData]);

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync(profileForm);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (profileData?.profile) {
      setProfileForm({
        displayName: profileData.profile.displayName || '',
        bio: profileData.profile.bio || '',
        phone: profileData.profile.phone || '',
      });
    }
  };

  const handleSettingToggle = async (key: string, value: boolean) => {
    await updateSettings.mutateAsync({ [key]: value });
  };

  const userProducts = customer?.products || [];
  const userFeatures = customer?.features || {};

  const activeProduct = userProducts.find(p =>
    p.status === 'active' || p.status === 'trialing' || p.status === 'past_due'
  );
  const scheduledProduct = userProducts.find(p =>
    p.status === 'scheduled' || (p.started_at && new Date(p.started_at) > new Date())
  );

  const handleUpgrade = async (productId: string) => {
    try {
      setLoadingProductId(productId);
      await attach({
        productId,
        dialog: ProductChangeDialog,
        successUrl: window.location.origin + '/dashboard?checkout=success',
      });
    } finally {
      setLoadingProductId(null);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#fafafa] mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-xs sm:text-sm text-[#71717a]">Manage your account and monitor your AI brand visibility</p>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="flex gap-1 mb-4 sm:mb-6 lg:mb-8 p-1 bg-[#12121a] rounded-lg sm:rounded-xl border border-[#2a2a3a] w-full sm:w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              variant={activeTab === tab.id ? 'indigo' : 'ghost'}
              size="sm"
              className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {[
                { label: 'Current Plan', value: activeProduct?.name || activeProduct?.id || 'Free', icon: CreditCard, color: '#6366f1' },
                { label: 'Analyses Used', value: `${userFeatures.messages?.usage || 0} / ${userFeatures.messages?.included_usage || (userFeatures.messages?.balance || 0) + (userFeatures.messages?.usage || 0) || 'Unlimited'}`, icon: BarChart3, color: '#22d3ee' },
                { label: 'Status', value: activeProduct ? 'Active' : 'Free Tier', icon: Shield, color: '#10b981' },
                { label: 'Email', value: session.user?.email, icon: Mail, color: '#f59e0b' },
              ].map((stat, i) => (
                <div key={i} className="card-intelligence p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                      <stat.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5" style={{ color: stat.color }} />
                    </div>
                    <span className="text-[10px] sm:text-xs lg:text-sm text-[#71717a] leading-tight">{stat.label}</span>
                  </div>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-[#fafafa] truncate">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Profile & Usage Grid */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Profile Card */}
              <div className="card-intelligence p-4 sm:p-5 lg:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#22d3ee]/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-[#6366f1]" />
                    </div>
                    <h2 className="text-base sm:text-lg font-semibold text-[#fafafa]">Profile Information</h2>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="btn-ghost px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  ) : (
                    <div className="flex gap-1.5 sm:gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={updateProfile.isPending}
                        className="btn-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm"
                      >
                        <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-ghost px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm text-[#71717a] mb-1">Email</label>
                    <p className="text-sm sm:text-base text-[#fafafa] break-all">{session.user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-[#71717a] mb-1">Display Name</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                        className="input-intelligence w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm"
                        placeholder="Enter your display name"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-[#fafafa]">{profileData?.profile?.displayName || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-[#71717a] mb-1">Phone</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="input-intelligence w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-[#fafafa]">{profileData?.profile?.phone || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm text-[#71717a] mb-1">Bio</label>
                    {isEditingProfile ? (
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="input-intelligence w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm"
                        rows={3}
                        placeholder="Tell us about yourself"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-[#fafafa]">{profileData?.profile?.bio || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="card-intelligence p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-[#22d3ee]/20 to-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-[#22d3ee]" />
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#fafafa]">Usage Statistics</h2>
                </div>

                {Object.keys(userFeatures).length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {Object.entries(userFeatures).map(([featureId, feature]: [string, any]) => (
                      <div key={featureId}>
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                          <span className="text-[#a1a1aa] capitalize">{featureId.replace(/_/g, ' ')}</span>
                          <span className="text-[#fafafa] font-medium">
                            {feature.usage || 0} / {feature.included_usage || feature.balance + (feature.usage || 0) || '∞'}
                          </span>
                        </div>
                        <div className="w-full bg-[#1a1a25] rounded-full h-2 sm:h-2.5">
                          <div
                            className="h-2 sm:h-2.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] transition-all"
                            style={{
                              width: `${Math.min(((feature.usage || 0) / (feature.included_usage || feature.balance + (feature.usage || 0) || 1)) * 100, 100)}%`
                            }}
                          />
                        </div>
                        {feature.next_reset_at && (
                          <p className="text-[10px] sm:text-xs text-[#71717a] mt-1">
                            Resets on {new Date(feature.next_reset_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-sm text-[#71717a]">No usage data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Current Plan */}
            <div className="card-intelligence p-4 sm:p-5 lg:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-[#6366f1]/20 to-[#22d3ee]/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-[#6366f1]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#fafafa]">Current Plan</h2>
                  <p className="text-xs sm:text-sm text-[#71717a]">Manage your subscription</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${activeProduct ? 'bg-[#10b981]' : 'bg-[#f59e0b]'}`} />
                <span className="text-sm sm:text-base text-[#fafafa] font-medium">
                  {activeProduct?.name || activeProduct?.id || 'Free Plan'}
                </span>
                {scheduledProduct && (
                  <span className="text-xs sm:text-sm text-[#71717a] w-full sm:w-auto mt-1 sm:mt-0">
                    (Changing to {scheduledProduct.name || scheduledProduct.id} on {new Date(scheduledProduct.started_at || scheduledProduct.current_period_end || Date.now()).toLocaleDateString()})
                  </span>
                )}
              </div>
            </div>

            {/* Available Plans */}
            <div className="card-intelligence p-4 sm:p-5 lg:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-[#fafafa] mb-4 sm:mb-6">Available Plans</h2>

              {!products ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-[#6366f1]" />
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {products.map((product: any) => {
                    const isCurrentPlan = activeProduct?.id === product.id;
                    const isScheduledPlan = scheduledProduct?.id === product.id;
                    const features = product.properties?.is_free ? product.items : product.items?.slice(1) || [];

                    return (
                      <div
                        key={product.id}
                        className={`p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border ${
                          isCurrentPlan
                            ? 'border-[#6366f1]/50 bg-[#6366f1]/5'
                            : 'border-[#2a2a3a] bg-[#0a0a0f]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                              <h3 className="font-semibold text-sm sm:text-base text-[#fafafa]">
                                {product.display?.name || product.name}
                              </h3>
                              {isCurrentPlan && (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] text-[10px] sm:text-xs font-medium">
                                  Current
                                </span>
                              )}
                              {isScheduledPlan && (
                                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] text-[10px] sm:text-xs font-medium">
                                  Scheduled
                                </span>
                              )}
                            </div>
                            {product.display?.description && (
                              <p className="text-xs sm:text-sm text-[#71717a] mb-2 sm:mb-3">{product.display.description}</p>
                            )}
                            <ul className="space-y-1">
                              {features.slice(0, 3).map((item: any, index: number) => (
                                <li key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#a1a1aa]">
                                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6366f1] flex-shrink-0" />
                                  <span className="truncate">{item.display?.primary_text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {!isCurrentPlan && !isScheduledPlan && (
                            <Button
                              onClick={() => handleUpgrade(product.id)}
                              size="sm"
                              className={`text-xs sm:text-sm whitespace-nowrap ${product.properties?.is_free
                                ? 'btn-secondary'
                                : 'btn-primary'
                              }`}
                              disabled={loadingProductId !== null}
                            >
                              {loadingProductId === product.id ? (
                                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              ) : (
                                product.properties?.is_free ? 'Downgrade' : 'Upgrade'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="card-intelligence p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-[#f59e0b]/20 to-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-[#f59e0b]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#fafafa]">Preferences</h2>
                <p className="text-xs sm:text-sm text-[#71717a]">Manage your notification settings</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email notifications for important updates' },
                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive emails about new features and offers' },
              ].map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#0a0a0f] border border-[#2a2a3a]"
                >
                  <div className="pr-3 sm:pr-4 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-[#fafafa]">{setting.label}</p>
                    <p className="text-xs sm:text-sm text-[#71717a]">{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handleSettingToggle(setting.key, !(settings as any)?.[setting.key])}
                    className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                      (settings as any)?.[setting.key] ? 'bg-[#6366f1]' : 'bg-[#3f3f46]'
                    }`}
                    disabled={updateSettings.isPending}
                  >
                    <span
                      className={`inline-block h-3 sm:h-4 w-3 sm:w-4 transform rounded-full bg-white transition-transform ${
                        (settings as any)?.[setting.key] ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render DashboardContent when we have a session and AutumnProvider is available
  return <DashboardContent session={session} />;
}