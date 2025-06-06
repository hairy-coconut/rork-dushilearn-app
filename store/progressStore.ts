import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categories } from '@/constants/lessons';
import { useBadgeStore } from './badgeStore';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

type LessonProgress = {
  id: string;
  completed: boolean;
  score: number;
  lastAttempt: string | null;
  perfect: boolean;
};

type UserProgress = {
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgress>;
  streak: number;
  lastStreak: string | null;
  xp: number;
  level: number;
  perfectLessons: string[];
  totalExercisesCompleted: number;
  unlockedLessons: string[];
};

type ProgressState = UserProgress & {
  isLoading: boolean;
  error: string | null;
  completeLesson: (lessonId: string, score: number, totalExercises: number) => Promise<string[]>;
  resetProgress: () => Promise<void>;
  updateStreak: () => Promise<void>;
  unlockLesson: (lessonId: string) => Promise<void>;
  isLessonUnlocked: (lessonId: string) => boolean;
  shareProgress: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
};

const initialState: UserProgress = {
  completedLessons: [],
  lessonProgress: {},
  streak: 0,
  lastStreak: null,
  xp: 0,
  level: 1,
  perfectLessons: [],
  totalExercisesCompleted: 0,
  unlockedLessons: ['greetings'], // Start with only the first lesson unlocked
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,
      error: null,
      
      completeLesson: async (lessonId: string, score: number, totalExercises: number) => {
        const { completedLessons, lessonProgress, xp, perfectLessons, totalExercisesCompleted } = get();
        const newXp = xp + score;
        const level = Math.floor(newXp / 100) + 1;
        const isPerfect = score === totalExercises * 10; // Perfect score
        
        // Only add to completed lessons if it's not already there
        const newCompletedLessons = completedLessons.includes(lessonId)
          ? completedLessons
          : [...completedLessons, lessonId];
        
        // Add to perfect lessons if perfect score
        const newPerfectLessons = isPerfect && !perfectLessons.includes(lessonId)
          ? [...perfectLessons, lessonId]
          : perfectLessons;
        
        // Update lesson progress
        const newLessonProgress = {
          ...lessonProgress,
          [lessonId]: {
            id: lessonId,
            completed: true,
            score,
            lastAttempt: new Date().toISOString(),
            perfect: isPerfect,
          },
        };
        
        // Unlock next lessons based on completion
        const unlockedLessons = get().unlockedLessons;
        const newUnlockedLessons = [...unlockedLessons];
        
        // Find the category and position of the completed lesson
        let categoryIndex = -1;
        let lessonIndex = -1;
        
        categories.forEach((category, catIdx) => {
          const idx = category.lessons.findIndex(lesson => lesson.id === lessonId);
          if (idx !== -1) {
            categoryIndex = catIdx;
            lessonIndex = idx;
          }
        });
        
        // Unlock the next lesson in the same category
        if (categoryIndex !== -1 && lessonIndex !== -1) {
          const category = categories[categoryIndex];
          if (lessonIndex + 1 < category.lessons.length) {
            const nextLessonId = category.lessons[lessonIndex + 1].id;
            if (!newUnlockedLessons.includes(nextLessonId)) {
              newUnlockedLessons.push(nextLessonId);
            }
          }
          // If this was the last lesson in the category, unlock the first lesson of the next category
          else if (categoryIndex + 1 < categories.length) {
            const nextCategory = categories[categoryIndex + 1];
            const nextLessonId = nextCategory.lessons[0].id;
            if (!newUnlockedLessons.includes(nextLessonId)) {
              newUnlockedLessons.push(nextLessonId);
            }
          }
        }
        
        set({
          completedLessons: newCompletedLessons,
          lessonProgress: newLessonProgress,
          xp: newXp,
          level,
          perfectLessons: newPerfectLessons,
          totalExercisesCompleted: totalExercisesCompleted + totalExercises,
          unlockedLessons: newUnlockedLessons,
        });
        
        await get().updateStreak();
        
        // Sync with Supabase
        try {
          await get().syncWithSupabase();
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
        
        // Check for badges
        return useBadgeStore.getState().checkAndAwardBadges({
          completedLessons: newCompletedLessons,
          streak: get().streak,
          xp: newXp,
          perfectLessons: newPerfectLessons,
        });
      },
      
      updateStreak: async () => {
        const { streak, lastStreak } = get();
        const today = new Date().toDateString();
        
        let newStreak = streak;
        let newLastStreak = lastStreak;
        
        if (lastStreak) {
          const lastDate = new Date(lastStreak).toDateString();
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toDateString();
          
          if (today !== lastDate) {
            if (yesterdayString === lastDate) {
              // Consecutive day
              newStreak = streak + 1;
              newLastStreak = today;
            } else {
              // Streak broken
              newStreak = 1;
              newLastStreak = today;
            }
          }
        } else {
          // First time
          newStreak = 1;
          newLastStreak = today;
        }
        
        set({ streak: newStreak, lastStreak: newLastStreak });
        
        // Sync with Supabase
        try {
          await get().syncWithSupabase();
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      },
      
      unlockLesson: async (lessonId: string) => {
        const { unlockedLessons } = get();
        if (!unlockedLessons.includes(lessonId)) {
          const newUnlockedLessons = [...unlockedLessons, lessonId];
          set({ unlockedLessons: newUnlockedLessons });
          
          // Sync with Supabase
          try {
            await get().syncWithSupabase();
          } catch (error) {
            console.error('Error syncing with Supabase:', error);
          }
        }
      },
      
      isLessonUnlocked: (lessonId: string) => {
        return get().unlockedLessons.includes(lessonId);
      },
      
      shareProgress: async () => {
        // Mark the share badge as earned
        useBadgeStore.getState().earnBadge('share_progress');
        
        // Sync with Supabase
        try {
          await get().syncWithSupabase();
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      },
      
      syncWithSupabase: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        set({ isLoading: true, error: null });
        
        try {
          const {
            completedLessons,
            lessonProgress,
            streak,
            lastStreak,
            xp,
            level,
            perfectLessons,
            totalExercisesCompleted,
            unlockedLessons
          } = get();
          
          // Check if user progress exists
          const { data: existingProgress, error: fetchError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }
          
          const progressData = {
            user_id: user.id,
            completed_lessons: completedLessons,
            lesson_progress: lessonProgress,
            streak,
            last_streak: lastStreak,
            xp,
            level,
            perfect_lessons: perfectLessons,
            total_exercises_completed: totalExercisesCompleted,
            unlocked_lessons: unlockedLessons,
            updated_at: new Date().toISOString()
          };
          
          if (existingProgress) {
            // Update existing progress
            const { error: updateError } = await supabase
              .from('user_progress')
              .update(progressData)
              .eq('user_id', user.id);
              
            if (updateError) throw updateError;
          } else {
            // Insert new progress
            const { error: insertError } = await supabase
              .from('user_progress')
              .insert([{
                ...progressData,
                created_at: new Date().toISOString()
              }]);
              
            if (insertError) throw insertError;
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Error syncing progress with Supabase:', error.message);
          set({ error: error.message, isLoading: false });
        }
      },
      
      resetProgress: async () => {
        set({ ...initialState });
        useBadgeStore.getState().resetBadges();
        
        // Sync with Supabase
        try {
          await get().syncWithSupabase();
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      },
    }),
    {
      name: 'dushilearn-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper function to get lesson completion status
export const getLessonStatus = (lessonId: string) => {
  const { lessonProgress } = useProgressStore.getState();
  return lessonProgress[lessonId] || { completed: false, score: 0, lastAttempt: null, perfect: false };
};

// Helper function to calculate overall progress
export const getOverallProgress = () => {
  const { completedLessons } = useProgressStore.getState();
  
  // Count total lessons
  let totalLessons = 0;
  categories.forEach(category => {
    totalLessons += category.lessons.length;
  });
  
  return totalLessons > 0 ? completedLessons.length / totalLessons : 0;
};

// Helper function to calculate level progress
export const getLevelProgress = () => {
  const { xp, level } = useProgressStore.getState();
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  
  return (xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);
};