// Re-export utilities from main utils folder to maintain compatibility
export { 
  getUserSubscriptionStatus, 
  hasFeatureAccess, 
  hasPremiumAccess, 
  hasEliteAccess,
  getCurrentTier,
  isLessonAccessible,
  updateUserSubscription,
  cancelSubscription,
  purchaseSubscription
} from '../utils/subscription'; 