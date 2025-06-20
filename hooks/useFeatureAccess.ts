import { useState, useEffect } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FEATURE_KEYS } from '../src/types/subscription';

export function useFeatureAccess(featureKey: keyof typeof FEATURE_KEYS) {
  const { hasAccess, isLoading } = useSubscription();
  const [hasFeatureAccess, setHasFeatureAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      try {
        const access = await hasAccess(FEATURE_KEYS[featureKey]);
        setHasFeatureAccess(access);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasFeatureAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [featureKey, hasAccess]);

  return {
    hasFeatureAccess,
    isChecking: isChecking || isLoading,
  };
}

export function usePremiumFeature() {
  const { subscriptionStatus, isLoading } = useSubscription();
  const isPremium = subscriptionStatus?.tier_name === 'Premium' || 
                   subscriptionStatus?.tier_name === 'Elite' ||
                   subscriptionStatus?.tier_name === 'Elite Monthly';

  return {
    isPremium,
    isLoading,
  };
}

export function useEliteFeature() {
  const { subscriptionStatus, isLoading } = useSubscription();
  const isElite = subscriptionStatus?.tier_name === 'Elite' || 
                 subscriptionStatus?.tier_name === 'Elite Monthly';

  return {
    isElite,
    isLoading,
  };
} 