// Basic subscription utility (mock implementation)

import { SubscriptionStatus, SubscriptionTier } from '../src/types/subscription';

export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  // Simulate fetching subscription status
  return {
    userId,
    tier: SubscriptionTier.FREE,
    isActive: true,
    expiresAt: null,
  };
}

export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  // Simulate feature access check
  // For now, only allow all features for premium
  const status = await getUserSubscriptionStatus(userId);
  return status.tier === SubscriptionTier.PREMIUM;
} 