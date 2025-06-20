import { supabase } from '@/utils/supabase';
import { getCurrentUser } from '@/utils/auth';
import { sendNotification } from '@/utils/notifications';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'social' | 'special';
  requirement: number;
  reward: {
    xp: number;
    coconuts: number;
    special?: string;
  };
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Learning Achievements
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'book-open-variant',
    category: 'learning',
    requirement: 1,
    reward: {
      xp: 50,
      coconuts: 10,
    },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'quick_learner',
    title: 'Quick Learner',
    description: 'Complete 5 lessons in one day',
    icon: 'lightning-bolt',
    category: 'learning',
    requirement: 5,
    reward: {
      xp: 200,
      coconuts: 25,
    },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'path_master',
    title: 'Path Master',
    description: 'Complete an entire learning path',
    icon: 'map-marker-path',
    category: 'learning',
    requirement: 1,
    reward: {
      xp: 500,
      coconuts: 50,
      special: 'golden_frame',
    },
    isUnlocked: false,
    progress: 0,
  },

  // Streak Achievements
  {
    id: 'three_day_streak',
    title: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: 'fire',
    category: 'streak',
    requirement: 3,
    reward: {
      xp: 100,
      coconuts: 15,
    },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'calendar-week',
    category: 'streak',
    requirement: 7,
    reward: {
      xp: 300,
      coconuts: 30,
    },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'calendar-month',
    category: 'streak',
    requirement: 30,
    reward: {
      xp: 1000,
      coconuts: 100,
      special: 'streak_freeze',
    },
    isUnlocked: false,
    progress: 0,
  },

  // Social Achievements
  {
    id: 'first_share',
    title: 'Social Butterfly',
    description: 'Share your progress for the first time',
    icon: 'share-variant',
    category: 'social',
    requirement: 1,
    reward: {
      xp: 50,
      coconuts: 10,
    },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'invite_friend',
    title: 'Friend Inviter',
    description: 'Invite a friend to join',
    icon: 'account-plus',
    category: 'social',
    requirement: 1,
    reward: {
      xp: 100,
      coconuts: 20,
    },
    isUnlocked: false,
    progress: 0,
  },

  // Special Achievements
  {
    id: 'perfect_lesson',
    title: 'Perfect Score',
    description: 'Complete a lesson with 100% accuracy',
    icon: 'trophy',
    category: 'special',
    requirement: 1,
    reward: {
      xp: 200,
      coconuts: 25,
      special: 'perfect_badge',
    },
    isUnlocked: false,
    progress: 0,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a lesson before 9 AM',
    icon: 'weather-sunny',
    category: 'special',
    requirement: 1,
    reward: {
      xp: 100,
      coconuts: 15,
    },
    isUnlocked: false,
    progress: 0,
  },
];

export const checkAchievements = async (
  userId: string,
  type: 'lesson' | 'streak' | 'social' | 'special',
  data: any
): Promise<Achievement[]> => {
  try {
    // Get user's current achievements
    const { data: userAchievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const unlockedAchievements: Achievement[] = [];

    // Check each achievement of the given type
    const relevantAchievements = ACHIEVEMENTS.filter(
      a => a.category === type
    );

    for (const achievement of relevantAchievements) {
      // Skip if already unlocked
      if (
        userAchievements?.some(
          ua => ua.achievement_id === achievement.id && ua.unlocked
        )
      ) {
        continue;
      }

      let shouldUnlock = false;
      let progress = 0;

      // Check achievement-specific conditions
      switch (achievement.id) {
        case 'first_lesson':
          shouldUnlock = data.completedLessons >= 1;
          progress = data.completedLessons;
          break;
        case 'quick_learner':
          shouldUnlock = data.lessonsToday >= 5;
          progress = data.lessonsToday;
          break;
        case 'path_master':
          shouldUnlock = data.completedPaths >= 1;
          progress = data.completedPaths;
          break;
        case 'three_day_streak':
        case 'week_streak':
        case 'month_streak':
          shouldUnlock = data.currentStreak >= achievement.requirement;
          progress = data.currentStreak;
          break;
        case 'first_share':
          shouldUnlock = data.shares >= 1;
          progress = data.shares;
          break;
        case 'invite_friend':
          shouldUnlock = data.invites >= 1;
          progress = data.invites;
          break;
        case 'perfect_lesson':
          shouldUnlock = data.accuracy === 100;
          progress = data.accuracy;
          break;
        case 'early_bird':
          shouldUnlock = data.hour < 9;
          progress = data.hour < 9 ? 1 : 0;
          break;
      }

      if (shouldUnlock) {
        // Update achievement in database
        const { error: updateError } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: userId,
            achievement_id: achievement.id,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
            progress: achievement.requirement,
          });

        if (updateError) throw updateError;

        // Add to unlocked achievements
        unlockedAchievements.push({
          ...achievement,
          isUnlocked: true,
          progress: achievement.requirement,
          unlockedAt: new Date(),
        });
      } else {
        // Update progress
        const { error: progressError } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: userId,
            achievement_id: achievement.id,
            progress,
          });

        if (progressError) throw progressError;
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

export const getUserAchievements = async (
  userId: string
): Promise<Achievement[]> => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return ACHIEVEMENTS.map(achievement => {
      const userAchievement = data?.find(
        ua => ua.achievement_id === achievement.id
      );
      return {
        ...achievement,
        isUnlocked: userAchievement?.unlocked || false,
        progress: userAchievement?.progress || 0,
        unlockedAt: userAchievement?.unlocked_at
          ? new Date(userAchievement.unlocked_at)
          : undefined,
      };
    });
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      isUnlocked: false,
      progress: 0,
    }));
  }
}; 