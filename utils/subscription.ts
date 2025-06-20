import { SubscriptionStatus, SubscriptionTier, TIER_FEATURES, FEATURE_KEYS } from '../types/subscription';
import { supabase } from './supabase';

/**
 * Get the current user's subscription status
 */
export async function getUserSubscriptionStatus(): Promise<SubscriptionStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check for active subscription
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      // Return free tier as fallback
      return {
        userId: user.id,
        tier: SubscriptionTier.FREE,
        tier_name: 'Free',
        isActive: true,
        expiresAt: null
      };
    }

    if (!subscription) {
      // No active subscription found, return free tier
      return {
        userId: user.id,
        tier: SubscriptionTier.FREE,
        tier_name: 'Free',
        isActive: true,
        expiresAt: null
      };
    }

    // Map subscription data to our type
    return {
      userId: user.id,
      tier: subscription.tier as SubscriptionTier,
      tier_name: subscription.tier_name || subscription.tier,
      isActive: subscription.is_active,
      expiresAt: subscription.expires_at,
      createdAt: subscription.created_at,
      updatedAt: subscription.updated_at
    };

  } catch (error) {
    console.error('Error in getUserSubscriptionStatus:', error);
    // Fallback to free tier
    return {
      userId: 'unknown',
      tier: SubscriptionTier.FREE,
      tier_name: 'Free',
      isActive: true,
      expiresAt: null
    };
  }
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(featureKey: string): Promise<boolean> {
  try {
    const subscriptionStatus = await getUserSubscriptionStatus();
    
    if (!subscriptionStatus.isActive) {
      return false;
    }

    const tierFeatures = TIER_FEATURES[subscriptionStatus.tier] || [];
    return tierFeatures.includes(featureKey);

  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Check if a lesson is accessible based on user's subscription
 */
export async function isLessonAccessible(lessonId: string, isPremium: boolean = false): Promise<boolean> {
  if (!isPremium) {
    return true; // Free lessons are always accessible
  }

  return await hasFeatureAccess(FEATURE_KEYS.PREMIUM_LESSONS);
}

/**
 * Get user's current subscription tier
 */
export async function getCurrentTier(): Promise<SubscriptionTier> {
  try {
    const status = await getUserSubscriptionStatus();
    return status.tier;
  } catch (error) {
    console.error('Error getting current tier:', error);
    return SubscriptionTier.FREE;
  }
}

/**
 * Check if user has premium access
 */
export async function hasPremiumAccess(): Promise<boolean> {
  try {
    const tier = await getCurrentTier();
    return tier === SubscriptionTier.PREMIUM || tier === SubscriptionTier.ELITE;
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}

/**
 * Check if user has elite access
 */
export async function hasEliteAccess(): Promise<boolean> {
  try {
    const tier = await getCurrentTier();
    return tier === SubscriptionTier.ELITE;
  } catch (error) {
    console.error('Error checking elite access:', error);
    return false;
  }
}

/**
 * Create or update user subscription
 */
export async function updateUserSubscription(
  tier: SubscriptionTier,
  expiresAt: string | null = null
): Promise<SubscriptionStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const subscriptionData = {
      user_id: user.id,
      tier,
      tier_name: tier.charAt(0).toUpperCase() + tier.slice(1),
      is_active: true,
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      userId: user.id,
      tier: data.tier as SubscriptionTier,
      tier_name: data.tier_name,
      isActive: data.is_active,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

/**
 * Cancel user subscription (mark as inactive)
 */
export async function cancelSubscription(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Mock function for purchasing a subscription (integrate with your payment provider)
 */
export async function purchaseSubscription(planId: string): Promise<SubscriptionStatus> {
  // This is where you would integrate with Stripe, Apple Pay, Google Play, etc.
  // For now, we'll simulate a successful purchase
  
  console.log('Mock purchase for plan:', planId);
  
  // Map plan ID to tier
  let tier: SubscriptionTier = SubscriptionTier.FREE;
  let expiresAt: string | null = null;
  
  if (planId.includes('premium')) {
    tier = SubscriptionTier.PREMIUM;
    expiresAt = planId.includes('yearly') 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else if (planId.includes('elite')) {
    tier = SubscriptionTier.ELITE;
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  
  return await updateUserSubscription(tier, expiresAt);
}