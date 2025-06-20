import 'react-native-url-polyfill/auto';
// Remove direct import of AsyncStorage for web compatibility
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';

export function getSupabaseClient() {
  let storage;
  if (typeof window !== 'undefined') {
    // Web: use localStorage
    storage = window.localStorage;
  } else {
    // Native: use AsyncStorage
    storage = require('@react-native-async-storage/async-storage').default;
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = getSupabaseClient();

// User progress table operations
export const userProgressApi = {
  async getProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProgress(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ user_id: userId, ...updates })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addExperience(userId: string, amount: number) {
    const { data, error } = await supabase.rpc('add_experience', {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) throw error;
    return data;
  },
};

// Achievements table operations
export const achievementsApi = {
  async getAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async unlockAchievement(userId: string, achievementId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Friends and social features
export const socialApi = {
  async getFriends(userId: string) {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        users:friend_id (
          id,
          username,
          avatar_url,
          user_progress (
            level,
            experience
          )
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async addFriend(userId: string, friendId: string) {
    const { data, error } = await supabase
      .from('friends')
      .insert([
        { user_id: userId, friend_id: friendId },
        { user_id: friendId, friend_id: userId },
      ])
      .select();

    if (error) throw error;
    return data;
  },

  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        level,
        experience,
        users (
          username,
          avatar_url
        )
      `)
      .order('experience', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

// Challenges
export const challengesApi = {
  async getChallenges(userId: string) {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        participants:challenge_participants (
          user_id,
          progress
        )
      `)
      .or(`creator_id.eq.${userId},participants.user_id.eq.${userId}`);

    if (error) throw error;
    return data;
  },

  async createChallenge(challenge: any) {
    const { data, error } = await supabase
      .from('challenges')
      .insert(challenge)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateChallengeProgress(challengeId: string, userId: string, progress: number) {
    const { data, error } = await supabase
      .from('challenge_participants')
      .upsert({
        challenge_id: challengeId,
        user_id: userId,
        progress,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
}; 