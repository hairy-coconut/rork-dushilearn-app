import { ChestRarity } from './types';

export interface Reward {
  type: RewardType;
  value: number | string;
  description: string;
  rarity: ChestRarity;
  specialEvent?: string;
}

export type RewardType =
  | 'coins'
  | 'phrase'
  | 'boost'
  | 'discount'
  | 'streak_saver'
  | 'badge'
  | 'special_phrase'
  | 'bonus_chest'
  | 'premium_trial'
  | 'theme_unlock';

export const CHEST_CONFIG = {
  cooldown: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  streakUpgrades: {
    3: 'silver',
    7: 'gold',
    14: 'diamond',
  },
  specialEvents: {
    weekends: {
      multiplier: 1.5,
      bonusChance: 0.3,
    },
    holidays: {
      multiplier: 2,
      bonusChance: 0.5,
    },
  },
};

export const REWARD_POOL = {
  free: {
    coins: [
      { value: 10, description: '10 Coconut Coins', rarity: 'common' },
      { value: 25, description: '25 Coconut Coins', rarity: 'uncommon' },
      { value: 50, description: '50 Coconut Coins', rarity: 'rare' },
    ],
    phrases: [
      { value: 'basic_phrase', description: 'Basic Papiamento Phrase', rarity: 'common' },
      { value: 'greeting', description: 'Greeting Phrase', rarity: 'uncommon' },
    ],
    boosts: [
      { value: 1.5, description: '1.5x XP Boost (1 hour)', rarity: 'rare' },
      { value: 2, description: '2x XP Boost (30 minutes)', rarity: 'epic' },
    ],
  },
  premium: {
    coins: [
      { value: 50, description: '50 Coconut Coins', rarity: 'common' },
      { value: 100, description: '100 Coconut Coins', rarity: 'uncommon' },
      { value: 250, description: '250 Coconut Coins', rarity: 'rare' },
      { value: 500, description: '500 Coconut Coins', rarity: 'epic' },
    ],
    phrases: [
      { value: 'advanced_phrase', description: 'Advanced Papiamento Phrase', rarity: 'common' },
      { value: 'idiom', description: 'Papiamento Idiom', rarity: 'uncommon' },
      { value: 'cultural_phrase', description: 'Cultural Phrase', rarity: 'rare' },
    ],
    boosts: [
      { value: 2, description: '2x XP Boost (2 hours)', rarity: 'uncommon' },
      { value: 3, description: '3x XP Boost (1 hour)', rarity: 'rare' },
      { value: 5, description: '5x XP Boost (30 minutes)', rarity: 'epic' },
    ],
    discounts: [
      { value: 10, description: '10% Off Premium Features', rarity: 'rare' },
      { value: 25, description: '25% Off Premium Features', rarity: 'epic' },
    ],
    streak_savers: [
      { value: 1, description: '1 Day Streak Saver', rarity: 'rare' },
      { value: 3, description: '3 Day Streak Saver', rarity: 'epic' },
    ],
    badges: [
      { value: 'premium_collector', description: 'Premium Collector Badge', rarity: 'epic' },
      { value: 'streak_master', description: 'Streak Master Badge', rarity: 'legendary' },
    ],
    special_phrases: [
      { value: 'local_slang', description: 'Local Slang Phrase', rarity: 'epic' },
      { value: 'proverb', description: 'Papiamento Proverb', rarity: 'legendary' },
    ],
    bonus_chests: [
      { value: 1, description: 'Bonus Chest', rarity: 'epic' },
      { value: 3, description: 'Triple Bonus Chest', rarity: 'legendary' },
    ],
    premium_trials: [
      { value: 1, description: '1 Day Premium Trial', rarity: 'epic' },
      { value: 3, description: '3 Day Premium Trial', rarity: 'legendary' },
    ],
    theme_unlocks: [
      { value: 'dark_theme', description: 'Dark Theme Unlock', rarity: 'epic' },
      { value: 'custom_theme', description: 'Custom Theme Unlock', rarity: 'legendary' },
    ],
  },
};

export function getRandomReward(tier: 'free' | 'premium'): Reward {
  const pool = REWARD_POOL[tier];
  const rewardTypes = Object.keys(pool) as RewardType[];
  const selectedType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
  const rewards = pool[selectedType];
  const selectedReward = rewards[Math.floor(Math.random() * rewards.length)];

  return {
    type: selectedType,
    value: selectedReward.value,
    description: selectedReward.description,
    rarity: selectedReward.rarity,
    specialEvent: checkSpecialEvent(),
  };
}

function checkSpecialEvent(): string | undefined {
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const isHoliday = checkHoliday(now);

  if (isHoliday) return 'holiday';
  if (isWeekend) return 'weekend';
  return undefined;
}

function checkHoliday(date: Date): boolean {
  // Add holiday checking logic here
  // For now, return false
  return false;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
} 