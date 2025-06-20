export type SubscriptionTier = 'Free' | 'Premium' | 'Elite' | 'Elite Monthly';

export interface SubscriptionFeatures {
  lessons?: string[];
  features?: string[];
  ai_features?: string[];
  lifestyle_features?: string[];
  includes_premium?: boolean;
}

export interface SubscriptionTierData {
  id: string;
  name: SubscriptionTier;
  description: string;
  price: number;
  is_recurring: boolean;
  duration_days: number | null;
  features: SubscriptionFeatures;
}

export interface UserSubscription {
  id: string;
  tier_id: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string | null;
  payment_id: string | null;
}

export interface UserFeature {
  id: string;
  feature_key: string;
  is_active: boolean;
  unlocked_at: string;
  expires_at: string | null;
}

export interface GiftSubscription {
  id: string;
  recipient_email: string;
  tier_id: string;
  status: 'pending' | 'redeemed' | 'expired';
  redemption_code: string;
  expires_at: string;
}

export interface SubscriptionStatus {
  tier_name: SubscriptionTier;
  status: string;
  start_date: string;
  end_date: string | null;
  features: SubscriptionFeatures;
}

// Constants for feature keys
export const FEATURE_KEYS = {
  // Free tier features
  COCONUT_COINS: 'coconut_coins',
  STREAKS: 'streaks',
  PROGRESS_TRACKING: 'progress_tracking',
  SHARE_PROGRESS: 'share_progress',
  INVITE_FRIENDS: 'invite_friends',

  // Premium tier features
  PRINTABLE_PHRASEBOOK: 'printable_phrasebook',
  ALL_BADGES: 'all_badges',
  COCONUT_CLUB_BADGE: 'coconut_club_badge',
  PHRASE_OF_DAY: 'phrase_of_day',
  OFFLINE_ACCESS: 'offline_access',
  LIFETIME_UPDATES: 'lifetime_updates',

  // Elite tier features
  AI_TRANSLATOR: 'ai_translator',
  AI_PERSONAS: 'ai_personas',
  AI_VISION: 'ai_vision',
  CULTURAL_ADVISOR: 'cultural_advisor',
  DIGITAL_CERTIFICATE: 'digital_certificate',
  EARLY_ACCESS: 'early_access',
  COCONUT_CLUB_COMMUNITY: 'coconut_club_community',
  BONUS_LESSONS: 'bonus_lessons',
} as const;

// Constants for lesson keys
export const LESSON_KEYS = {
  // Free tier lessons
  ISLAND_GREETINGS: 'island_greetings',
  BEACH_SUN_ESSENTIALS: 'beach_sun_essentials',
  SNACK_TRUCK: 'snack_truck',
  GETTING_AROUND: 'getting_around',
  SIMPLE_QUESTIONS: 'simple_questions',

  // Premium tier lessons
  LOVE_FLIRTATION: 'love_flirtation',
  CURACAO_SLANG: 'curacao_slang',
  NUMBERS_MONEY: 'numbers_money',
  REAL_LIFE_CONVERSATIONS: 'real_life_conversations',
  CULTURE_SITUATIONS: 'culture_situations',

  // Bonus lessons (Elite tier)
  WEDDINGS: 'weddings',
  PARTIES: 'parties',
  BEACH_DAYS: 'beach_days',
  EMERGENCY_LANGUAGE: 'emergency_language',
} as const;

// Subscription upgrade triggers
export const UPGRADE_TRIGGERS = {
  AFTER_LESSON_3: 'after_lesson_3',
  AFTER_LESSON_5: 'after_lesson_5',
  AFTER_PREMIUM_3: 'after_premium_3',
  PLATEAU_HIT: 'plateau_hit',
  PHRASE_NOT_FOUND: 'phrase_not_found',
} as const; 