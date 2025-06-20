import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StreakProtection {
  id: string;
  type: 'freeze' | 'insurance' | 'weekend_pass';
  duration: number; // days
  purchasedAt: number;
  expiresAt?: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  coconutCost: number;
  isActive: boolean;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  protections: StreakProtection[];
  streaksFrozen: number;
  totalProtectionDays: number;
  streakAtRisk: boolean;
  nextRiskTime?: number;
}

const STREAK_STORAGE_KEY = '@dushi_learn_streak_protection';

// Protection types
export const PROTECTION_TYPES: Omit<StreakProtection, 'id' | 'purchasedAt' | 'isActive'>[] = [
  {
    type: 'freeze',
    duration: 1,
    name: 'Streak Freeze',
    description: 'Protect your streak for 1 day if you miss learning',
    icon: 'snowflake',
    color: '#2196F3',
    coconutCost: 100,
  },
  {
    type: 'freeze',
    duration: 7,
    name: 'Weekly Shield',
    description: 'Protect your streak for 7 days',
    icon: 'shield',
    color: '#4CAF50',
    coconutCost: 500,
  },
  {
    type: 'insurance',
    duration: 30,
    name: 'Streak Insurance',
    description: 'Premium protection for 30 days - automatically saves your streak',
    icon: 'security',
    color: '#FF6B35',
    coconutCost: 1500,
  },
  {
    type: 'weekend_pass',
    duration: 0, // Special case - only covers weekends
    name: 'Weekend Pass',
    description: 'Skip weekends without breaking your streak',
    icon: 'beach',
    color: '#FFD700',
    coconutCost: 300,
  },
];

export class StreakProtectionManager {
  private static instance: StreakProtectionManager;
  private streakState: StreakState = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    protections: [],
    streaksFrozen: 0,
    totalProtectionDays: 0,
    streakAtRisk: false,
  };

  static getInstance(): StreakProtectionManager {
    if (!StreakProtectionManager.instance) {
      StreakProtectionManager.instance = new StreakProtectionManager();
    }
    return StreakProtectionManager.instance;
  }

  async loadStreakState(): Promise<StreakState> {
    try {
      const stored = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        this.streakState = { ...this.streakState, ...parsedState };
        
        // Update risk status
        await this.updateStreakRiskStatus();
      }
    } catch (error) {
      console.error('Error loading streak state:', error);
    }
    return this.streakState;
  }

  async saveStreakState(): Promise<void> {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(this.streakState));
    } catch (error) {
      console.error('Error saving streak state:', error);
    }
  }

  private async updateStreakRiskStatus(): Promise<void> {
    const now = new Date();
    const today = now.toDateString();
    const lastActive = new Date(this.streakState.lastActiveDate);
    
    // Check if streak is at risk (haven't learned today and it's past 6 PM)
    const isLateInDay = now.getHours() >= 18;
    const hasntLearnedToday = this.streakState.lastActiveDate !== today;
    
    this.streakState.streakAtRisk = hasntLearnedToday && isLateInDay;
    
    // Calculate next risk time (6 PM today or tomorrow)
    const nextRisk = new Date();
    if (isLateInDay && hasntLearnedToday) {
      nextRisk.setDate(nextRisk.getDate() + 1);
    }
    nextRisk.setHours(18, 0, 0, 0);
    this.streakState.nextRiskTime = nextRisk.getTime();
  }

  async purchaseProtection(protectionType: typeof PROTECTION_TYPES[0]): Promise<StreakProtection> {
    const now = Date.now();
    const protection: StreakProtection = {
      ...protectionType,
      id: `${protectionType.type}_${now}`,
      purchasedAt: now,
      expiresAt: protectionType.duration > 0 
        ? now + (protectionType.duration * 24 * 60 * 60 * 1000)
        : undefined,
      isActive: true,
    };

    this.streakState.protections.push(protection);
    await this.saveStreakState();
    
    return protection;
  }

  getActiveProtections(): StreakProtection[] {
    const now = Date.now();
    return this.streakState.protections.filter(p => 
      p.isActive && (!p.expiresAt || p.expiresAt > now)
    );
  }

  hasActiveProtection(): boolean {
    return this.getActiveProtections().length > 0;
  }

  async useProtection(): Promise<StreakProtection | null> {
    const activeProtections = this.getActiveProtections();
    if (activeProtections.length === 0) return null;

    // Use the most appropriate protection (insurance first, then freezes)
    const insurance = activeProtections.find(p => p.type === 'insurance');
    const weekendPass = activeProtections.find(p => p.type === 'weekend_pass');
    const freeze = activeProtections.find(p => p.type === 'freeze');

    let usedProtection: StreakProtection | null = null;
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;

    if (isWeekend && weekendPass) {
      usedProtection = weekendPass;
    } else if (insurance) {
      usedProtection = insurance;
    } else if (freeze) {
      usedProtection = freeze;
    }

    if (!usedProtection) return null;

    // Mark protection as used
    if (usedProtection.type === 'freeze' || usedProtection.type === 'weekend_pass') {
      // Single-use protections
      usedProtection.isActive = false;
    }
    // Insurance stays active until it expires

    this.streakState.streaksFrozen += 1;
    this.streakState.totalProtectionDays += 1;

    await this.saveStreakState();
    return usedProtection;
  }

  getProtectionTimeRemaining(protection: StreakProtection): number {
    if (!protection.expiresAt) return 0;
    return Math.max(0, protection.expiresAt - Date.now());
  }

  getProtectionTimeText(protection: StreakProtection): string {
    if (protection.type === 'weekend_pass') return 'Weekends';
    
    const remaining = this.getProtectionTimeRemaining(protection);
    if (remaining === 0) return 'Expired';

    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }
    
    return `${weeks}w ${remainingDays}d`;
  }

  async recordActivity(): Promise<void> {
    const today = new Date().toDateString();
    
    if (this.streakState.lastActiveDate !== today) {
      // New day activity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      if (this.streakState.lastActiveDate === yesterdayString) {
        // Consecutive day - increment streak
        this.streakState.currentStreak += 1;
      } else if (this.streakState.lastActiveDate !== '') {
        // Missed day(s) - check for protection
        const protection = await this.useProtection();
        if (!protection) {
          // No protection - reset streak
          this.streakState.currentStreak = 1;
        }
        // If protection was used, streak continues
      } else {
        // First day ever
        this.streakState.currentStreak = 1;
      }

      // Update longest streak
      if (this.streakState.currentStreak > this.streakState.longestStreak) {
        this.streakState.longestStreak = this.streakState.currentStreak;
      }

      this.streakState.lastActiveDate = today;
      this.streakState.streakAtRisk = false;
      
      await this.saveStreakState();
    }
  }

  getStreakState(): StreakState {
    return { ...this.streakState };
  }

  getAvailableProtections(): typeof PROTECTION_TYPES {
    return PROTECTION_TYPES;
  }

  async simulateMissedDay(): Promise<{ streakSaved: boolean; protectionUsed?: StreakProtection }> {
    // For testing purposes
    const protection = await this.useProtection();
    
    if (protection) {
      return { streakSaved: true, protectionUsed: protection };
    } else {
      this.streakState.currentStreak = 0;
      await this.saveStreakState();
      return { streakSaved: false };
    }
  }

  // Get urgency level for UI
  getStreakUrgency(): 'safe' | 'warning' | 'critical' {
    if (!this.streakState.streakAtRisk) return 'safe';
    if (this.hasActiveProtection()) return 'warning';
    return 'critical';
  }

  // Get hours until streak is lost
  getHoursUntilStreakLoss(): number {
    if (!this.streakState.nextRiskTime) return 24;
    
    const now = Date.now();
    const hoursRemaining = Math.max(0, (this.streakState.nextRiskTime - now) / (60 * 60 * 1000));
    
    return Math.ceil(hoursRemaining);
  }

  async resetStreak(): Promise<void> {
    this.streakState.currentStreak = 0;
    this.streakState.lastActiveDate = '';
    this.streakState.streakAtRisk = false;
    await this.saveStreakState();
  }
}

export const streakProtectionManager = StreakProtectionManager.getInstance();