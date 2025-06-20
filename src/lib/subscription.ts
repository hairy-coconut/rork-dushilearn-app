import { supabase } from './supabase';
import { getCurrentUser } from './supabase';
import {
  SubscriptionTier,
  SubscriptionTierData,
  UserSubscription,
  UserFeature,
  GiftSubscription,
  SubscriptionStatus,
  FEATURE_KEYS,
  LESSON_KEYS,
  UPGRADE_TRIGGERS,
} from '../types/subscription';

// Get all available subscription tiers
export async function getSubscriptionTiers(): Promise<SubscriptionTierData[]> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
}

// Get user's current subscription status
export async function getUserSubscriptionStatus(): Promise<SubscriptionStatus | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .rpc('get_user_subscription_status', {
      p_user_id: user.id
    });

  if (error) throw error;
  return data[0] || null;
}

// Check if user has access to a specific feature
export async function hasFeatureAccess(featureKey: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .rpc('has_feature_access', {
      p_user_id: user.id,
      p_feature_key: featureKey
    });

  if (error) throw error;
  return data;
}

// Check if user has access to a specific lesson
export async function hasLessonAccess(lessonKey: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Free lessons are always accessible
  if (Object.values(LESSON_KEYS).slice(0, 5).includes(lessonKey)) {
    return true;
  }

  // Check subscription status for other lessons
  const status = await getUserSubscriptionStatus();
  if (!status) return false;

  // Premium and Elite tiers have access to all lessons
  if (status.tier_name === 'Premium' || status.tier_name === 'Elite' || status.tier_name === 'Elite Monthly') {
    return true;
  }

  return false;
}

// Create a new subscription
export async function createSubscription(
  tierId: string,
  paymentId: string
): Promise<UserSubscription> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not found');

  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: user.id,
      tier_id: tierId,
      status: 'active',
      payment_id: paymentId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Create a gift subscription
export async function createGiftSubscription(
  recipientEmail: string,
  tierId: string
): Promise<GiftSubscription> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not found');

  const redemptionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Gift expires in 30 days

  const { data, error } = await supabase
    .from('gift_subscriptions')
    .insert({
      sender_id: user.id,
      recipient_email: recipientEmail,
      tier_id: tierId,
      status: 'pending',
      redemption_code: redemptionCode,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Redeem a gift subscription
export async function redeemGiftSubscription(
  redemptionCode: string
): Promise<UserSubscription> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not found');

  // Start a transaction
  const { data: gift, error: giftError } = await supabase
    .from('gift_subscriptions')
    .select('*')
    .eq('redemption_code', redemptionCode)
    .eq('status', 'pending')
    .single();

  if (giftError) throw giftError;
  if (!gift) throw new Error('Invalid or expired gift code');

  // Create the subscription
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: user.id,
      tier_id: gift.tier_id,
      status: 'active'
    })
    .select()
    .single();

  if (subError) throw subError;

  // Update gift status
  const { error: updateError } = await supabase
    .from('gift_subscriptions')
    .update({ status: 'redeemed' })
    .eq('id', gift.id);

  if (updateError) throw updateError;

  return subscription;
}

// Check if user should see upgrade prompt
export async function shouldShowUpgradePrompt(
  trigger: keyof typeof UPGRADE_TRIGGERS
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const status = await getUserSubscriptionStatus();
  if (!status) return true; // Free tier users should see prompts

  // Don't show prompts to Elite users
  if (status.tier_name === 'Elite' || status.tier_name === 'Elite Monthly') {
    return false;
  }

  // Show appropriate prompts based on trigger
  switch (trigger) {
    case 'AFTER_LESSON_3':
      return status.tier_name === 'Free';
    case 'AFTER_LESSON_5':
      return status.tier_name === 'Free';
    case 'AFTER_PREMIUM_3':
      return status.tier_name === 'Premium';
    case 'PLATEAU_HIT':
    case 'PHRASE_NOT_FOUND':
      return true;
    default:
      return false;
  }
}

// Get available features for user's tier
export async function getAvailableFeatures(): Promise<string[]> {
  const status = await getUserSubscriptionStatus();
  if (!status) return Object.values(FEATURE_KEYS).slice(0, 5); // Free tier features

  const features: string[] = [];

  // Add features based on tier
  if (status.features.features) {
    features.push(...status.features.features);
  }

  if (status.tier_name === 'Elite' || status.tier_name === 'Elite Monthly') {
    if (status.features.ai_features) {
      features.push(...status.features.ai_features);
    }
    if (status.features.lifestyle_features) {
      features.push(...status.features.lifestyle_features);
    }
  }

  return features;
}

// Get available lessons for user's tier
export async function getAvailableLessons(): Promise<string[]> {
  const status = await getUserSubscriptionStatus();
  if (!status) return Object.values(LESSON_KEYS).slice(0, 5); // Free tier lessons

  const lessons: string[] = [];

  // Add lessons based on tier
  if (status.features.lessons) {
    lessons.push(...status.features.lessons);
  }

  if (status.tier_name === 'Elite' || status.tier_name === 'Elite Monthly') {
    // Add bonus lessons for Elite tier
    lessons.push(
      LESSON_KEYS.WEDDINGS,
      LESSON_KEYS.PARTIES,
      LESSON_KEYS.BEACH_DAYS,
      LESSON_KEYS.EMERGENCY_LANGUAGE
    );
  }

  return lessons;
} 