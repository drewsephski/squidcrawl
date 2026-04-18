// Autumn Product Configuration
// These products will be created in Autumn via the setup script

export interface AutumnFeature {
  id: string;
  name: string;
  type: 'boolean' | 'metered' | 'credit_system';
  consumable: boolean;
  event_names?: string[];
}

export interface AutumnProduct {
  id: string;
  name: string;
  description?: string;
  group?: string;
  add_on: boolean;
  auto_enable: boolean;
  price?: {
    amount: number;
    interval: 'month' | 'year' | 'one_off';
    interval_count?: number;
  } | null;
  items: Array<{
    feature_id: string;
    included: number;
    unlimited?: boolean;
    reset?: {
      interval: 'month' | 'year' | 'day' | 'week';
      interval_count?: number;
    } | null;
    price?: {
      amount?: number;
      interval: 'month' | 'year' | 'one_off';
      billing_method: 'prepaid' | 'usage_based';
    } | null;
  }>;
}

// Feature definitions
export const AUTUMN_FEATURES: AutumnFeature[] = [
  {
    id: 'messages',
    name: 'Messages',
    type: 'metered',
    consumable: true,
    event_names: ['message_sent'],
  },
];

// Product definitions
export const AUTUMN_PRODUCTS: AutumnProduct[] = [
  {
    id: 'free',
    name: 'Free',
    description: '1 free credit to try brand monitoring',
    group: 'main',
    add_on: false,
    auto_enable: true,
    price: null,
    items: [
      {
        feature_id: 'messages',
        included: 1,
        unlimited: false,
        reset: {
          interval: 'month',
          interval_count: 1,
        },
        price: null,
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: '50 credits per month for power users',
    group: 'main',
    add_on: false,
    auto_enable: false,
    price: {
      amount: 999, // $9.99 in cents
      interval: 'month',
      interval_count: 1,
    },
    items: [
      {
        feature_id: 'messages',
        included: 50,
        unlimited: false,
        reset: {
          interval: 'month',
          interval_count: 1,
        },
        price: null,
      },
    ],
  },
];

export const AUTUMN_ADDONS: AutumnProduct[] = [];