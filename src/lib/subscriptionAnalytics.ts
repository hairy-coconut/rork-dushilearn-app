import { Platform } from 'react-native';
import { getDeviceId } from 'expo-device';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export enum SubscriptionEventType {
  VIEW_PLANS = 'view_plans',
  SELECT_PLAN = 'select_plan',
  SUBSCRIBE = 'subscribe',
  CANCEL = 'cancel',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  FEATURE_ACCESS = 'feature_access',
}

interface SubscriptionEvent {
  type: SubscriptionEventType;
  tierId?: string;
  tierName?: string;
  price?: number;
  previousTierId?: string;
  previousTierName?: string;
  error?: string;
  featureId?: string;
  metadata?: Record<string, any>;
}

class SubscriptionAnalytics {
  private static instance: SubscriptionAnalytics;
  private db = getFirestore();
  private eventsCollection = collection(this.db, 'subscription_events');

  private constructor() {}

  static getInstance(): SubscriptionAnalytics {
    if (!SubscriptionAnalytics.instance) {
      SubscriptionAnalytics.instance = new SubscriptionAnalytics();
    }
    return SubscriptionAnalytics.instance;
  }

  private async getDeviceInfo() {
    return {
      deviceId: await getDeviceId(),
      platform: Platform.OS,
      platformVersion: Platform.Version,
    };
  }

  private async getCurrentUser() {
    const auth = getAuth();
    return auth.currentUser;
  }

  async trackEvent(event: SubscriptionEvent) {
    try {
      const user = await this.getCurrentUser();
      const deviceInfo = await this.getDeviceInfo();

      const eventData = {
        ...event,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email,
        deviceInfo,
        timestamp: serverTimestamp(),
      };

      await addDoc(this.eventsCollection, eventData);
    } catch (error) {
      console.error('Error tracking subscription event:', error);
    }
  }

  // Convenience methods for common events
  async trackViewPlans() {
    await this.trackEvent({
      type: SubscriptionEventType.VIEW_PLANS,
    });
  }

  async trackSelectPlan(tierId: string, tierName: string, price: number) {
    await this.trackEvent({
      type: SubscriptionEventType.SELECT_PLAN,
      tierId,
      tierName,
      price,
    });
  }

  async trackSubscribe(tierId: string, tierName: string, price: number) {
    await this.trackEvent({
      type: SubscriptionEventType.SUBSCRIBE,
      tierId,
      tierName,
      price,
    });
  }

  async trackCancel(tierId: string, tierName: string) {
    await this.trackEvent({
      type: SubscriptionEventType.CANCEL,
      tierId,
      tierName,
    });
  }

  async trackUpgrade(
    newTierId: string,
    newTierName: string,
    previousTierId: string,
    previousTierName: string
  ) {
    await this.trackEvent({
      type: SubscriptionEventType.UPGRADE,
      tierId: newTierId,
      tierName: newTierName,
      previousTierId,
      previousTierName,
    });
  }

  async trackDowngrade(
    newTierId: string,
    newTierName: string,
    previousTierId: string,
    previousTierName: string
  ) {
    await this.trackEvent({
      type: SubscriptionEventType.DOWNGRADE,
      tierId: newTierId,
      tierName: newTierName,
      previousTierId,
      previousTierName,
    });
  }

  async trackPaymentFailed(tierId: string, tierName: string, error: string) {
    await this.trackEvent({
      type: SubscriptionEventType.PAYMENT_FAILED,
      tierId,
      tierName,
      error,
    });
  }

  async trackSubscriptionExpired(tierId: string, tierName: string) {
    await this.trackEvent({
      type: SubscriptionEventType.SUBSCRIPTION_EXPIRED,
      tierId,
      tierName,
    });
  }

  async trackFeatureAccess(featureId: string, tierId: string, tierName: string) {
    await this.trackEvent({
      type: SubscriptionEventType.FEATURE_ACCESS,
      featureId,
      tierId,
      tierName,
    });
  }
}

export const subscriptionAnalytics = SubscriptionAnalytics.getInstance(); 