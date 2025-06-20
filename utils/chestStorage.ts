function getStorage() {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  } else {
    return require('@react-native-async-storage/async-storage').default;
  }
}

import { ChestRarity } from '@/constants/dailyChest';

const CHEST_STORAGE_KEY = '@dushilearn_chest_state';

export interface ChestState {
  lastOpened: number; // timestamp
  currentStreak: number;
  nextChestRarity: ChestRarity;
  hasUnopenedChest: boolean;
}

export const DEFAULT_CHEST_STATE: ChestState = {
  lastOpened: 0,
  currentStreak: 0,
  nextChestRarity: 'regular',
  hasUnopenedChest: false,
};

export async function getChestState(): Promise<ChestState> {
  try {
    const storage = getStorage();
    const stored = await storage.getItem(CHEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CHEST_STATE;
  } catch (error) {
    console.error('Error reading chest state:', error);
    return DEFAULT_CHEST_STATE;
  }
}

export async function updateChestState(newState: Partial<ChestState>): Promise<ChestState> {
  try {
    const storage = getStorage();
    const currentState = await getChestState();
    const updatedState = { ...currentState, ...newState };
    await storage.setItem(CHEST_STORAGE_KEY, JSON.stringify(updatedState));
    return updatedState;
  } catch (error) {
    console.error('Error updating chest state:', error);
    return await getChestState();
  }
}

export async function resetChestState(): Promise<ChestState> {
  try {
    const storage = getStorage();
    await storage.setItem(CHEST_STORAGE_KEY, JSON.stringify(DEFAULT_CHEST_STATE));
    return DEFAULT_CHEST_STATE;
  } catch (error) {
    console.error('Error resetting chest state:', error);
    return DEFAULT_CHEST_STATE;
  }
}

export function calculateNextChestRarity(streak: number): ChestRarity {
  if (streak >= 7) return 'gold';
  if (streak >= 3) return 'silver';
  return 'regular';
}

export function isChestAvailable(lastOpened: number): boolean {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return now - lastOpened >= twentyFourHours;
} 