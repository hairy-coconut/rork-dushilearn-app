import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Badge } from '../components/BadgeItem';
import { supabase } from '../utils/supabase';
import { useAuthStore } from './authStore';

// Define all available badges
export const availableBadges: Badge[] = [
  {
    id: 'first_words',
    name: 'First Words',
    description: 'Complete the Bon Bini Curaçao! lesson',
    icon: require('../assets/first_words.png'),
    earned: false,
  },
  {
    id: 'island_beginner',
    name: 'Island Beginner',
    description: 'Complete the Island Vibes: Basic Phrases lesson',
    icon: require('../assets/island_beginner.png'),
    earned: false,
  },
  {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'https://img.icons8.com/color/96/000000/prize.png',
    earned: false,
  },
  {
    id: 'three_day_streak',
    name: '3-Day Streak',
    description: 'Learn for 3 days in a row',
    icon: 'https://img.icons8.com/color/96/000000/fire-element.png',
    earned: false,
  },
  {
    id: 'seven_day_streak',
    name: 'Week Warrior',
    description: 'Learn for 7 days in a row',
    icon: 'https://img.icons8.com/color/96/000000/calendar-7.png',
    earned: false,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Complete a lesson without any mistakes',
    icon: 'https://img.icons8.com/color/96/000000/prize-2.png',
    earned: false,
  },
  {
    id: 'basics_complete',
    name: 'Basics Master',
    description: 'Complete all lessons in the Basics category',
    icon: 'https://img.icons8.com/color/96/000000/graduation-cap.png',
    earned: false,
  },
  {
    id: 'phrases_complete',
    name: 'Phrase Expert',
    description: 'Complete all lessons in the Common Phrases category',
    icon: 'https://img.icons8.com/color/96/000000/chat.png',
    earned: false,
  },
  {
    id: 'vocabulary_complete',
    name: 'Word Wizard',
    description: 'Complete all lessons in the Vocabulary category',
    icon: 'https://img.icons8.com/color/96/000000/book.png',
    earned: false,
  },
  {
    id: 'fifty_exercises',
    name: 'Exercise Champion',
    description: 'Complete 50 exercises',
    icon: 'https://img.icons8.com/color/96/000000/weightlifting.png',
    earned: false,
  },
  {
    id: 'hundred_xp',
    name: 'XP Hunter',
    description: 'Earn 100 XP',
    icon: 'https://img.icons8.com/color/96/000000/increase.png',
    earned: false,
  },
  {
    id: 'share_progress',
    name: 'Social Butterfly',
    description: 'Share your progress with friends',
    icon: 'https://img.icons8.com/color/96/000000/share.png',
    earned: false,
  },
];

type BadgeState = {
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  earnBadge: (badgeId: string) => Promise<void>;
  checkAndAwardBadges: (stats: {
    completedLessons: string[];
    streak: number;
    xp: number;
    perfectLessons: string[];
  }) => string[];
  getEarnedBadges: () => Badge[];
  resetBadges: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
};

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      badges: availableBadges,
      isLoading: false,
      error: null,
      
      earnBadge: async (badgeId: string) => {
        const newBadges = get().badges.map((badge) => 
          badge.id === badgeId
            ? { 
                ...badge, 
                earned: true, 
                earnedDate: new Date().toLocaleDateString() 
              }
            : badge
        );
        
        set({ badges: newBadges });
        
        // Sync with Supabase
        try {
          await get().syncWithSupabase();
        } catch (error) {
          console.error('Error syncing badges with Supabase:', error);
        }
      },
      
      checkAndAwardBadges: (stats) => {
        const { badges } = get();
        const newlyEarnedBadges: string[] = [];
        
        // Check each badge condition
        badges.forEach(badge => {
          if (!badge.earned) {
            let shouldEarn = false;
            
            switch (badge.id) {
              case 'first_words':
                shouldEarn = stats.completedLessons.includes('bon-bini-curacao');
                break;
              case 'island_beginner':
                shouldEarn = stats.completedLessons.includes('island-vibes-basic-phrases');
                break;
              case 'first_lesson':
                shouldEarn = stats.completedLessons.length > 0;
                break;
              case 'three_day_streak':
                shouldEarn = stats.streak >= 3;
                break;
              case 'seven_day_streak':
                shouldEarn = stats.streak >= 7;
                break;
              case 'perfect_score':
                shouldEarn = stats.perfectLessons.length > 0;
                break;
              case 'basics_complete':
                // Check if all basics lessons are completed
                shouldEarn = stats.completedLessons.includes('greetings') &&
                             stats.completedLessons.includes('introductions') &&
                             stats.completedLessons.includes('numbers');
                break;
              case 'phrases_complete':
                // Check if all phrases lessons are completed
                shouldEarn = stats.completedLessons.includes('restaurant') &&
                             stats.completedLessons.includes('directions');
                break;
              case 'vocabulary_complete':
                // Check if all vocabulary lessons are completed
                shouldEarn = stats.completedLessons.includes('colors') &&
                             stats.completedLessons.includes('family');
                break;
              case 'hundred_xp':
                shouldEarn = stats.xp >= 100;
                break;
            }
            
            if (shouldEarn) {
              get().earnBadge(badge.id);
              newlyEarnedBadges.push(badge.id);
            }
          }
        });
        
        return newlyEarnedBadges;
      },
      
      getEarnedBadges: () => {
        return get().badges.filter(badge => badge.earned);
      },
      
      syncWithSupabase: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        set({ isLoading: true, error: null });
        
        try {
          const { badges } = get();
          const earnedBadges = badges.filter(badge => badge.earned);
          
          // Check if user badges exist
          const { data: existingBadges, error: fetchError } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', user.id);
            
          if (fetchError) throw fetchError;
          
          // Delete existing badges
          if (existingBadges && existingBadges.length > 0) {
            const { error: deleteError } = await supabase
              .from('user_badges')
              .delete()
              .eq('user_id', user.id);
              
            if (deleteError) throw deleteError;
          }
          
          // Insert earned badges
          if (earnedBadges.length > 0) {
            const badgeRecords = earnedBadges.map(badge => ({
              user_id: user.id,
              badge_id: badge.id,
              earned_date: badge.earnedDate || new Date().toISOString(),
              created_at: new Date().toISOString()
            }));
            
            const { error: insertError } = await supabase
              .from('user_badges')
              .insert(badgeRecords);
              
            if (insertError) throw insertError;
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error syncing badges with Supabase:', error.message);
          set({ error: error.message, isLoading: false });
        }
      },
      
      resetBadges: async () => {
        set({ badges: availableBadges });
        
        // Sync with Supabase
        try {
          await get().syncWithSupabase();
        } catch (error) {
          console.error('Error syncing badges with Supabase:', error);
        }
      },
    }),
    {
      name: 'badge-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        } else {
          return require('@react-native-async-storage/async-storage').default;
        }
      }),
    }
  )
);