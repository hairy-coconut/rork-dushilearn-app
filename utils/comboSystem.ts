import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ComboState {
  currentCombo: number;
  maxCombo: number;
  lastAnswerTime: number;
  comboMultiplier: number;
  totalBonusXP: number;
}

const COMBO_STORAGE_KEY = '@dushi_learn_combo';
const COMBO_TIMEOUT = 30000; // 30 seconds to maintain combo
const MAX_COMBO_MULTIPLIER = 5; // Maximum 5x multiplier

// Combo tier system for visual feedback and rewards
export const COMBO_TIERS = [
  { threshold: 0, multiplier: 1, label: '', color: '#666666', emoji: '' },
  { threshold: 3, multiplier: 1.2, label: 'Good!', color: '#4CAF50', emoji: '🔥' },
  { threshold: 5, multiplier: 1.5, label: 'Great!', color: '#FF9800', emoji: '⚡' },
  { threshold: 8, multiplier: 2, label: 'Amazing!', color: '#E91E63', emoji: '💥' },
  { threshold: 12, multiplier: 3, label: 'Incredible!', color: '#9C27B0', emoji: '🚀' },
  { threshold: 15, multiplier: 4, label: 'Legendary!', color: '#3F51B5', emoji: '⭐' },
  { threshold: 20, multiplier: 5, label: 'GODLIKE!', color: '#FFD700', emoji: '👑' },
];

export class ComboManager {
  private static instance: ComboManager;
  private comboState: ComboState = {
    currentCombo: 0,
    maxCombo: 0,
    lastAnswerTime: 0,
    comboMultiplier: 1,
    totalBonusXP: 0,
  };

  static getInstance(): ComboManager {
    if (!ComboManager.instance) {
      ComboManager.instance = new ComboManager();
    }
    return ComboManager.instance;
  }

  async loadComboState(): Promise<ComboState> {
    try {
      const stored = await AsyncStorage.getItem(COMBO_STORAGE_KEY);
      if (stored) {
        this.comboState = { ...this.comboState, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading combo state:', error);
    }
    return this.comboState;
  }

  async saveComboState(): Promise<void> {
    try {
      await AsyncStorage.setItem(COMBO_STORAGE_KEY, JSON.stringify(this.comboState));
    } catch (error) {
      console.error('Error saving combo state:', error);
    }
  }

  getCurrentTier(): typeof COMBO_TIERS[0] {
    const combo = this.comboState.currentCombo;
    for (let i = COMBO_TIERS.length - 1; i >= 0; i--) {
      if (combo >= COMBO_TIERS[i].threshold) {
        return COMBO_TIERS[i];
      }
    }
    return COMBO_TIERS[0];
  }

  getNextTier(): typeof COMBO_TIERS[0] | null {
    const combo = this.comboState.currentCombo;
    for (let i = 0; i < COMBO_TIERS.length; i++) {
      if (combo < COMBO_TIERS[i].threshold) {
        return COMBO_TIERS[i];
      }
    }
    return null;
  }

  isComboExpired(): boolean {
    if (this.comboState.lastAnswerTime === 0) return false;
    return Date.now() - this.comboState.lastAnswerTime > COMBO_TIMEOUT;
  }

  async recordCorrectAnswer(): Promise<{
    comboState: ComboState;
    bonusXP: number;
    tierUp: boolean;
    previousTier: typeof COMBO_TIERS[0];
    currentTier: typeof COMBO_TIERS[0];
  }> {
    const previousTier = this.getCurrentTier();
    
    // Check if combo expired
    if (this.isComboExpired() && this.comboState.currentCombo > 0) {
      this.comboState.currentCombo = 0;
    }

    // Increment combo
    this.comboState.currentCombo += 1;
    this.comboState.lastAnswerTime = Date.now();
    
    // Update max combo
    if (this.comboState.currentCombo > this.comboState.maxCombo) {
      this.comboState.maxCombo = this.comboState.currentCombo;
    }

    const currentTier = this.getCurrentTier();
    this.comboState.comboMultiplier = Math.min(currentTier.multiplier, MAX_COMBO_MULTIPLIER);

    // Calculate bonus XP (base 10 XP with multiplier)
    const baseXP = 10;
    const bonusXP = Math.floor(baseXP * this.comboState.comboMultiplier);
    this.comboState.totalBonusXP += bonusXP - baseXP; // Only count the bonus part

    await this.saveComboState();

    return {
      comboState: { ...this.comboState },
      bonusXP,
      tierUp: currentTier.threshold !== previousTier.threshold,
      previousTier,
      currentTier,
    };
  }

  async recordIncorrectAnswer(): Promise<ComboState> {
    // Reset combo on incorrect answer
    this.comboState.currentCombo = 0;
    this.comboState.comboMultiplier = 1;
    this.comboState.lastAnswerTime = Date.now();

    await this.saveComboState();
    return { ...this.comboState };
  }

  async resetCombo(): Promise<ComboState> {
    this.comboState.currentCombo = 0;
    this.comboState.comboMultiplier = 1;
    this.comboState.lastAnswerTime = 0;

    await this.saveComboState();
    return { ...this.comboState };
  }

  async resetAllStats(): Promise<ComboState> {
    this.comboState = {
      currentCombo: 0,
      maxCombo: 0,
      lastAnswerTime: 0,
      comboMultiplier: 1,
      totalBonusXP: 0,
    };

    await this.saveComboState();
    return { ...this.comboState };
  }

  getComboState(): ComboState {
    return { ...this.comboState };
  }

  // Get remaining time before combo expires (in seconds)
  getComboTimeRemaining(): number {
    if (this.comboState.currentCombo === 0 || this.comboState.lastAnswerTime === 0) {
      return 0;
    }
    
    const elapsed = Date.now() - this.comboState.lastAnswerTime;
    const remaining = Math.max(0, COMBO_TIMEOUT - elapsed);
    return Math.ceil(remaining / 1000);
  }

  // Check if user is close to losing combo (last 10 seconds)
  isComboAtRisk(): boolean {
    const timeRemaining = this.getComboTimeRemaining();
    return timeRemaining > 0 && timeRemaining <= 10 && this.comboState.currentCombo > 0;
  }
}

export const comboManager = ComboManager.getInstance();