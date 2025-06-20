export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  ELITE = 'elite'
}

export interface SubscriptionStatus {
  userId: string;
  tier: SubscriptionTier;
  tier_name: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

// Feature access keys for different subscription tiers
export const FEATURE_KEYS = {
  PREMIUM_LESSONS: 'premium_lessons',
  ADVANCED_EXERCISES: 'advanced_exercises',
  UNLIMITED_HEARTS: 'unlimited_hearts',
  DOWNLOAD_LESSONS: 'download_lessons',
  PROGRESS_INSIGHTS: 'progress_insights',
  CUSTOM_REMINDERS: 'custom_reminders',
  FAMILY_SHARING: 'family_sharing',
  PRIORITY_SUPPORT: 'priority_support',
  ADDON_PACKS: 'addon_packs',
  EXPERT_CONTENT: 'expert_content'
} as const;

// Feature mapping for each tier
export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  [SubscriptionTier.FREE]: [
    // Free tier has basic features only
  ],
  [SubscriptionTier.PREMIUM]: [
    FEATURE_KEYS.PREMIUM_LESSONS,
    FEATURE_KEYS.ADVANCED_EXERCISES,
    FEATURE_KEYS.UNLIMITED_HEARTS,
    FEATURE_KEYS.DOWNLOAD_LESSONS,
    FEATURE_KEYS.PROGRESS_INSIGHTS,
    FEATURE_KEYS.CUSTOM_REMINDERS
  ],
  [SubscriptionTier.ELITE]: [
    FEATURE_KEYS.PREMIUM_LESSONS,
    FEATURE_KEYS.ADVANCED_EXERCISES,
    FEATURE_KEYS.UNLIMITED_HEARTS,
    FEATURE_KEYS.DOWNLOAD_LESSONS,
    FEATURE_KEYS.PROGRESS_INSIGHTS,
    FEATURE_KEYS.CUSTOM_REMINDERS,
    FEATURE_KEYS.FAMILY_SHARING,
    FEATURE_KEYS.PRIORITY_SUPPORT,
    FEATURE_KEYS.ADDON_PACKS,
    FEATURE_KEYS.EXPERT_CONTENT
  ]
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: SubscriptionTier.FREE,
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Access to basic lessons',
      'Limited hearts (5 per day)',
      'Basic progress tracking',
      'Community support'
    ]
  },
  {
    id: 'premium_monthly',
    name: 'Premium',
    tier: SubscriptionTier.PREMIUM,
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    popular: true,
    features: [
      'All premium lessons',
      'Unlimited hearts',
      'Advanced exercises',
      'Download for offline use',
      'Progress insights',
      'Custom reminders',
      'Ad-free experience'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    tier: SubscriptionTier.PREMIUM,
    price: 79.99,
    currency: 'USD',
    interval: 'yearly',
    features: [
      'All premium lessons',
      'Unlimited hearts',
      'Advanced exercises',
      'Download for offline use',
      'Progress insights',
      'Custom reminders',
      'Ad-free experience',
      '2 months free!'
    ]
  },
  {
    id: 'elite_monthly',
    name: 'Elite',
    tier: SubscriptionTier.ELITE,
    price: 19.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Everything in Premium',
      'Family sharing (up to 6 people)',
      'Priority support',
      'Exclusive addon packs',
      'Expert-level content',
      'Personal learning coach',
      'Early access to new features'
    ]
  }
];