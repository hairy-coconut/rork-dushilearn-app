import AsyncStorage from '@react-native-async-storage/async-storage';

export interface XPBoost {
  id: string;
  type: 'timed' | 'lesson_based' | 'streak_based';
  multiplier: number;
  duration: number; // in minutes
  activatedAt?: number;
  expiresAt?: number;
  lessonsRemaining?: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  coconutCost?: number;
}

export interface BoostState {
  activeBoosts: XPBoost[];
  availableBoosts: XPBoost[];
  totalXPBoosted: number;
  boostsUsed: number;
}

const BOOST_STORAGE_KEY = '@dushi_learn_boosts';

// Predefined boost types
export const BOOST_TEMPLATES: XPBoost[] = [
  {
    id: 'speed_demon',
    type: 'timed',
    multiplier: 2,
    duration: 10,
    name: 'Speed Demon',
    description: '2x XP for 10 minutes',
    icon: 'flash',
    color: '#FF6B35',
    rarity: 'common',
    coconutCost: 50,
  },
  {
    id: 'power_hour',
    type: 'timed',
    multiplier: 3,
    duration: 60,
    name: 'Power Hour',
    description: '3x XP for 1 hour',
    icon: 'lightning-bolt',
    color: '#FFD700',
    rarity: 'rare',
    coconutCost: 150,
  },
  {
    id: 'mega_boost',
    type: 'timed',
    multiplier: 5,
    duration: 30,
    name: 'Mega Boost',
    description: '5x XP for 30 minutes',
    icon: 'rocket',
    color: '#9C27B0',
    rarity: 'epic',
    coconutCost: 300,
  },
  {
    id: 'lesson_master',
    type: 'lesson_based',
    multiplier: 2.5,
    duration: 0,
    lessonsRemaining: 3,
    name: 'Lesson Master',
    description: '2.5x XP for next 3 lessons',
    icon: 'school',
    color: '#4CAF50',
    rarity: 'common',
    coconutCost: 75,
  },
  {
    id: 'weekend_warrior',
    type: 'timed',
    multiplier: 1.5,
    duration: 720, // 12 hours
    name: 'Weekend Warrior',
    description: '1.5x XP for 12 hours',
    icon: 'shield',
    color: '#2196F3',
    rarity: 'rare',
    coconutCost: 200,
  },
  {
    id: 'legendary_surge',
    type: 'timed',
    multiplier: 10,
    duration: 5,
    name: 'Legendary Surge',
    description: '10x XP for 5 minutes',
    icon: 'crown',
    color: '#FFD700',
    rarity: 'legendary',
    coconutCost: 500,
  },
];

export class XPBoostManager {
  private static instance: XPBoostManager;
  private boostState: BoostState = {
    activeBoosts: [],
    availableBoosts: [],
    totalXPBoosted: 0,
    boostsUsed: 0,
  };

  static getInstance(): XPBoostManager {
    if (!XPBoostManager.instance) {
      XPBoostManager.instance = new XPBoostManager();
    }
    return XPBoostManager.instance;
  }

  async loadBoostState(): Promise<BoostState> {
    try {
      const stored = await AsyncStorage.getItem(BOOST_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        this.boostState = { ...this.boostState, ...parsedState };
        
        // Clean up expired boosts
        this.cleanupExpiredBoosts();
      }
    } catch (error) {
      console.error('Error loading boost state:', error);
    }
    return this.boostState;
  }

  async saveBoostState(): Promise<void> {
    try {
      await AsyncStorage.setItem(BOOST_STORAGE_KEY, JSON.stringify(this.boostState));
    } catch (error) {
      console.error('Error saving boost state:', error);
    }
  }

  private cleanupExpiredBoosts(): void {
    const now = Date.now();
    this.boostState.activeBoosts = this.boostState.activeBoosts.filter(boost => {
      if (boost.type === 'timed' && boost.expiresAt && boost.expiresAt < now) {
        return false;
      }
      if (boost.type === 'lesson_based' && boost.lessonsRemaining && boost.lessonsRemaining <= 0) {
        return false;
      }
      return true;
    });
  }

  getCurrentMultiplier(): number {
    this.cleanupExpiredBoosts();
    
    if (this.boostState.activeBoosts.length === 0) return 1;
    
    // Stack multipliers (multiplicative)
    return this.boostState.activeBoosts.reduce((total, boost) => total * boost.multiplier, 1);
  }

  getActiveBoosts(): XPBoost[] {
    this.cleanupExpiredBoosts();
    return [...this.boostState.activeBoosts];
  }

  async activateBoost(boostTemplate: XPBoost): Promise<boolean> {
    const now = Date.now();
    
    // Create active boost instance
    const activeBoost: XPBoost = {
      ...boostTemplate,
      id: `${boostTemplate.id}_${now}`,
      activatedAt: now,
      expiresAt: boostTemplate.type === 'timed' 
        ? now + (boostTemplate.duration * 60 * 1000)
        : undefined,
      lessonsRemaining: boostTemplate.lessonsRemaining,
    };

    // Add to active boosts
    this.boostState.activeBoosts.push(activeBoost);
    this.boostState.boostsUsed += 1;

    await this.saveBoostState();
    return true;
  }

  async useBoostForLesson(): Promise<void> {
    // Decrease lesson count for lesson-based boosts
    this.boostState.activeBoosts = this.boostState.activeBoosts.map(boost => {
      if (boost.type === 'lesson_based' && boost.lessonsRemaining && boost.lessonsRemaining > 0) {
        return { ...boost, lessonsRemaining: boost.lessonsRemaining - 1 };
      }
      return boost;
    });

    this.cleanupExpiredBoosts();
    await this.saveBoostState();
  }

  getTimeRemainingForBoost(boost: XPBoost): number {
    if (boost.type !== 'timed' || !boost.expiresAt) return 0;
    
    const remaining = boost.expiresAt - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000)); // seconds
  }

  getTimeRemainingText(boost: XPBoost): string {
    const seconds = this.getTimeRemainingForBoost(boost);
    
    if (seconds === 0) return 'Expired';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    return `${remainingSeconds}s`;
  }

  isBoostExpiringSoon(boost: XPBoost, thresholdSeconds: number = 60): boolean {
    const remaining = this.getTimeRemainingForBoost(boost);
    return remaining > 0 && remaining <= thresholdSeconds;
  }

  async calculateBoostedXP(baseXP: number): Promise<number> {
    const multiplier = this.getCurrentMultiplier();
    const boostedXP = Math.floor(baseXP * multiplier);
    const bonusXP = boostedXP - baseXP;
    
    this.boostState.totalXPBoosted += bonusXP;
    await this.saveBoostState();
    
    return boostedXP;
  }

  getAvailableBoosts(): XPBoost[] {
    return BOOST_TEMPLATES;
  }

  async addRandomBoost(): Promise<XPBoost | null> {
    // Random boost generation (for rewards, achievements, etc.)
    const templates = BOOST_TEMPLATES.filter(b => b.rarity !== 'legendary');
    const rarityWeights = { common: 60, rare: 30, epic: 10 };
    
    const randomValue = Math.random() * 100;
    let targetRarity: keyof typeof rarityWeights = 'common';
    
    if (randomValue > 90) targetRarity = 'epic';
    else if (randomValue > 60) targetRarity = 'rare';
    
    const eligibleBoosts = templates.filter(b => b.rarity === targetRarity);
    if (eligibleBoosts.length === 0) return null;
    
    const randomBoost = eligibleBoosts[Math.floor(Math.random() * eligibleBoosts.length)];
    
    // Add to available boosts (user's inventory)
    this.boostState.availableBoosts.push({ ...randomBoost });
    await this.saveBoostState();
    
    return randomBoost;
  }

  async giftBoost(boost: XPBoost): Promise<void> {
    this.boostState.availableBoosts.push({ ...boost });
    await this.saveBoostState();
  }

  getBoostState(): BoostState {
    this.cleanupExpiredBoosts();
    return { ...this.boostState };
  }

  async resetBoosts(): Promise<void> {
    this.boostState = {
      activeBoosts: [],
      availableBoosts: [],
      totalXPBoosted: 0,
      boostsUsed: 0,
    };
    await this.saveBoostState();
  }
}

export const xpBoostManager = XPBoostManager.getInstance();