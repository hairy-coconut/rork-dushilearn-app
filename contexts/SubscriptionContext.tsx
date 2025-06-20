import React, { createContext, useContext, useState, useEffect } from 'react';
import { SubscriptionStatus, SubscriptionTier } from '../types/subscription';
import { getUserSubscriptionStatus, hasFeatureAccess } from '../utils/subscription';
import { supabase } from '../utils/supabase';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  hasAccess: (featureKey: string) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscriptionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscriptionStatus(null);
        return;
      }

      const status = await getUserSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription status');
      console.error('Error loading subscription status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAccess = async (featureKey: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      return await hasFeatureAccess(featureKey);
    } catch (err) {
      console.error('Error checking feature access:', err);
      return false;
    }
  };

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const value = {
    subscriptionStatus,
    isLoading,
    error,
    hasAccess,
    refreshSubscription: loadSubscriptionStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 