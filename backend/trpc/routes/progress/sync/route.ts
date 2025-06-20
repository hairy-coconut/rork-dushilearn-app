import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from '@/utils/supabase';

export const syncProgressProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    progress: z.object({
      completedLessons: z.array(z.string()),
      lessonProgress: z.record(z.any()),
      streak: z.number(),
      lastStreak: z.string().nullable(),
      xp: z.number(),
      level: z.number(),
      perfectLessons: z.array(z.string()),
      totalExercisesCompleted: z.number(),
      unlockedLessons: z.array(z.string()),
    })
  }))
  .mutation(async ({ input }) => {
    // Check if user progress exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', input.userId)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(fetchError.message);
    }
    
    const progressData = {
      user_id: input.userId,
      completed_lessons: input.progress.completedLessons,
      lesson_progress: input.progress.lessonProgress,
      streak: input.progress.streak,
      last_streak: input.progress.lastStreak,
      xp: input.progress.xp,
      level: input.progress.level,
      perfect_lessons: input.progress.perfectLessons,
      total_exercises_completed: input.progress.totalExercisesCompleted,
      unlocked_lessons: input.progress.unlockedLessons,
      updated_at: new Date().toISOString()
    };
    
    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from('user_progress')
        .update(progressData)
        .eq('user_id', input.userId)
        .select();
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } else {
      // Insert new progress
      const { data, error } = await supabase
        .from('user_progress')
        .insert([{
          ...progressData,
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    }
  });