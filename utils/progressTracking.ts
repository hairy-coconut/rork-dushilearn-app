import { UserProgress, Achievement, Level, LearningPath } from '../constants/types';
import { userProgressApi, achievementsApi } from './supabase';
import { supabase } from './supabase';
import { getCurrentUser } from './supabase';
import { FEATURE_KEYS } from '../types/subscription';

const PROGRESS_STORAGE_KEY = '@user_progress';
const ACHIEVEMENTS_STORAGE_KEY = '@achievements';
const LEVELS_STORAGE_KEY = '@levels';
const LEARNING_PATHS_STORAGE_KEY = '@learning_paths';

// Default progress state
const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  experience: 0,
  completedLessons: [],
  achievements: [],
  streak: {
    current: 0,
    longest: 0,
    lastActivity: '',
  },
  statistics: {
    totalLessonsCompleted: 0,
    totalPhrasesLearned: 0,
    totalPracticeTime: 0,
    perfectLessons: 0,
    averageAccuracy: 0,
  },
  recentActivity: [],
};

// Experience required for each level (exponential growth)
const calculateExperienceForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Get current user ID
const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
};

// Get current progress
export const getProgress = async (): Promise<UserProgress> => {
  try {
    const userId = await getCurrentUserId();
    const progress = await userProgressApi.getProgress(userId);
    return progress || DEFAULT_PROGRESS;
  } catch (error) {
    console.error('Error getting progress:', error);
    return DEFAULT_PROGRESS;
  }
};

// Update progress
export const updateProgress = async (updates: Partial<UserProgress>): Promise<UserProgress> => {
  try {
    const userId = await getCurrentUserId();
    const newProgress = await userProgressApi.updateProgress(userId, updates);
    return newProgress;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

// Add experience and handle level up
export const addExperience = async (amount: number): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    const result = await userProgressApi.addExperience(userId, amount);
    const newLevel = result.level;

    // Check for level-up achievements
    if (newLevel > result.level) {
      await checkLevelUpAchievements(newLevel);
    }
  } catch (error) {
    console.error('Error adding experience:', error);
    throw error;
  }
};

// Complete a lesson
export const completeLesson = async (lessonId: string, score: number): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    const progress = await getProgress();
    const experienceGained = Math.floor(score * 10); // Base experience from score

    // Update completed lessons if not already completed
    if (!progress.completedLessons.includes(lessonId)) {
      await updateProgress({
        completedLessons: [...progress.completedLessons, lessonId],
        statistics: {
          ...progress.statistics,
          totalLessonsCompleted: progress.statistics.totalLessonsCompleted + 1,
          averageAccuracy: (progress.statistics.averageAccuracy * progress.statistics.totalLessonsCompleted + score) / 
                       (progress.statistics.totalLessonsCompleted + 1),
        },
      });
    }

    // Add experience
    await addExperience(experienceGained);
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
};

// Update streak
export const updateStreak = async (): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    const progress = await getProgress();
    const now = Date.now();
    const lastActivity = Date.parse(progress.streak.lastActivity);
    const daysSinceLastActivity = Math.floor(
      (now - lastActivity) / (1000 * 60 * 60 * 24)
    );

    let newStreak = progress.streak.current;
    let newLongest = progress.streak.longest;

    if (daysSinceLastActivity === 1) {
      newStreak += 1;
      if (newStreak > newLongest) {
        newLongest = newStreak;
      }
    } else if (daysSinceLastActivity > 1) {
      newStreak = 1;
    }

    await updateProgress({
      streak: {
        current: newStreak,
        longest: newLongest,
        lastActivity: new Date(now).toISOString(),
      },
    });

    // Check for streak achievements
    await checkStreakAchievements(newStreak);
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

// Check and update achievements
export const checkAchievements = async (): Promise<Achievement[]> => {
  try {
    const userId = await getCurrentUserId();
    const progress = await getProgress();
    const newAchievements: Achievement[] = [];

    // Example achievement checks
    if (progress.streak.current >= 7) {
      const streakAchievement = await achievementsApi.unlockAchievement(userId, 'streak_7');
      if (streakAchievement) {
        newAchievements.push({
          id: 'streak_7',
          title: 'Week Warrior',
          description: 'Maintain a 7-day streak',
          icon: 'fire',
          unlockedAt: Date.now(),
          progress: 100,
          type: 'streak',
          rarity: 'uncommon',
        });
      }
    }

    if (progress.statistics.totalLessonsCompleted >= 10) {
      const lessonsAchievement = await achievementsApi.unlockAchievement(userId, 'lessons_10');
      if (lessonsAchievement) {
        newAchievements.push({
          id: 'lessons_10',
          title: 'Dedicated Learner',
          description: 'Complete 10 lessons',
          icon: 'book',
          unlockedAt: Date.now(),
          progress: 100,
          type: 'lessons',
          rarity: 'common',
        });
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
};

// Get learning paths
export const getLearningPaths = async (): Promise<LearningPath[]> => {
  try {
    const paths = await AsyncStorage.getItem(LEARNING_PATHS_STORAGE_KEY);
    return paths ? JSON.parse(paths) : [];
  } catch (error) {
    console.error('Error getting learning paths:', error);
    return [];
  }
};

// Update learning path progress
export const updateLearningPathProgress = async (
  pathId: string,
  progress: number
): Promise<void> => {
  const paths = await getLearningPaths();
  const updatedPaths = paths.map(path => 
    path.id === pathId ? { ...path, progress } : path
  );
  await AsyncStorage.setItem(LEARNING_PATHS_STORAGE_KEY, JSON.stringify(updatedPaths));
};

// Helper functions
function calculateLevel(experience: number): number {
  return Math.floor(Math.log(experience / XP_PER_LEVEL) / Math.log(XP_MULTIPLIER)) + 1;
}

function calculateLessonXP(accuracy: number, timeSpent: number): number {
  const baseXP = 50;
  const accuracyMultiplier = accuracy / 100;
  const timeMultiplier = Math.min(timeSpent / 300, 1); // Cap at 5 minutes
  return Math.floor(baseXP * accuracyMultiplier * (1 + timeMultiplier));
}

function generateActivityDescription(type: Activity['type'], data?: any): string {
  switch (type) {
    case 'lesson':
      return `Completed lesson with ${data.accuracy}% accuracy`;
    case 'practice':
      return 'Completed practice session';
    case 'achievement':
      return `Unlocked achievement: ${data.title}`;
    case 'streak':
      return `Maintained ${data.current} day streak`;
    default:
      return 'Completed activity';
  }
}

// Achievement checking functions
async function checkLevelUpAchievements(level: number): Promise<void> {
  const achievements = [
    { level: 5, title: 'Getting Started', description: 'Reach level 5' },
    { level: 10, title: 'Rising Star', description: 'Reach level 10' },
    { level: 25, title: 'Language Enthusiast', description: 'Reach level 25' },
    { level: 50, title: 'Master Learner', description: 'Reach level 50' },
  ];

  for (const achievement of achievements) {
    if (level >= achievement.level) {
      await unlockAchievement({
        title: achievement.title,
        description: achievement.description,
        type: 'milestone',
        rarity: 'common',
      });
    }
  }
}

async function checkStreakAchievements(streak: number): Promise<void> {
  const achievements = [
    { streak: 3, title: 'On Fire', description: 'Maintain a 3-day streak' },
    { streak: 7, title: 'Week Warrior', description: 'Maintain a 7-day streak' },
    { streak: 30, title: 'Streak Master', description: 'Maintain a 30-day streak' },
  ];

  for (const achievement of achievements) {
    if (streak >= achievement.streak) {
      await unlockAchievement({
        title: achievement.title,
        description: achievement.description,
        type: 'streak',
        rarity: 'uncommon',
      });
    }
  }
}

async function checkLessonAchievements(lessonId: string, accuracy: number): Promise<void> {
  if (accuracy === 100) {
    await unlockAchievement({
      title: 'Perfect Score',
      description: 'Complete a lesson with 100% accuracy',
      type: 'lesson',
      rarity: 'rare',
    });
  }
}

async function unlockAchievement(achievement: Omit<Achievement, 'id' | 'progress' | 'completed'>): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_progress')
    .update({
      achievements: supabase.rpc('add_achievement', {
        achievement: {
          ...achievement,
          id: crypto.randomUUID(),
          progress: 100,
          completed: true,
          unlockedAt: new Date().toISOString(),
        },
      }),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) throw error;

  // Record achievement activity
  await recordActivity('achievement', achievement);
}

export async function recordActivity(
  type: Activity['type'],
  data?: any
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const activity: Activity = {
    id: crypto.randomUUID(),
    type,
    description: generateActivityDescription(type, data),
    timestamp: new Date().toISOString(),
    data,
  };

  const { error } = await supabase
    .from('user_progress')
    .update({
      recentActivity: supabase.rpc('prepend_activity', { activity }),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) throw error;
} 