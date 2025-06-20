import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { updateLessonProgress, getModuleProgress } from './learningPaths';
import { checkAchievements, unlockAchievement } from './achievements';
import { addXP } from './progressTracking';

export interface LessonResult {
  moduleId: string;
  lessonId: string;
  accuracy: number;
  timeSpent: number; // in seconds
  mistakes: number;
  completedExercises: number;
  totalExercises: number;
  perfectStreak: number;
  practiceTime: number; // in seconds
}

export interface LessonProgress {
  attempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  totalPracticeTime: number;
  completedAt?: Date;
  lastAttempted: Date;
  perfectAttempts: number;
  currentStreak: number;
  longestStreak: number;
}

export async function completeLesson(result: LessonResult): Promise<{
  xpEarned: number;
  achievements: string[];
  levelUp: boolean;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Calculate XP based on performance
    const xpEarned = calculateLessonXP(result);
    
    // Update lesson progress
    await updateLessonProgress(result.moduleId, result.lessonId, 100);
    
    // Update module progress
    const moduleProgress = await getModuleProgress(result.moduleId);
    
    // Add XP to user's progress
    const { levelUp } = await addXP(xpEarned);

    // Check for achievements
    const achievements = await checkLessonAchievements(result, moduleProgress);

    // Record lesson completion
    await recordLessonCompletion(result);

    return {
      xpEarned,
      achievements,
      levelUp,
    };
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
}

export async function updateLessonProgress(
  moduleId: string,
  lessonId: string,
  progress: number
): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: existingProgress, error: fetchError } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('userId', user.id)
      .eq('moduleId', moduleId)
      .eq('lessonId', lessonId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const now = new Date();
    const newProgress: LessonProgress = {
      attempts: (existingProgress?.attempts || 0) + 1,
      bestAccuracy: Math.max(existingProgress?.bestAccuracy || 0, progress),
      averageAccuracy: calculateAverageAccuracy(
        existingProgress?.averageAccuracy || 0,
        existingProgress?.attempts || 0,
        progress
      ),
      totalTimeSpent: (existingProgress?.totalTimeSpent || 0) + progress,
      totalPracticeTime: (existingProgress?.totalPracticeTime || 0) + progress,
      lastAttempted: now,
      perfectAttempts: progress === 100 ? (existingProgress?.perfectAttempts || 0) + 1 : (existingProgress?.perfectAttempts || 0),
      currentStreak: progress === 100 ? (existingProgress?.currentStreak || 0) + 1 : 0,
      longestStreak: Math.max(
        existingProgress?.longestStreak || 0,
        progress === 100 ? (existingProgress?.currentStreak || 0) + 1 : 0
      ),
    };

    if (progress === 100) {
      newProgress.completedAt = now;
    }

    const { error: updateError } = await supabase
      .from('lesson_progress')
      .upsert({
        userId: user.id,
        moduleId,
        lessonId,
        ...newProgress,
      });

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
}

function calculateLessonXP(result: LessonResult): number {
  const baseXP = 100;
  const accuracyMultiplier = result.accuracy / 100;
  const timeBonus = Math.max(0, 1 - result.timeSpent / (result.totalExercises * 60)); // 1 minute per exercise
  const streakBonus = result.perfectStreak * 10;
  const practiceBonus = Math.min(result.practiceTime / 300, 1) * 50; // Up to 50 XP for 5 minutes of practice

  return Math.round(
    baseXP * accuracyMultiplier + // Base XP scaled by accuracy
    baseXP * timeBonus + // Time bonus
    streakBonus + // Perfect streak bonus
    practiceBonus // Practice time bonus
  );
}

function calculateAverageAccuracy(
  currentAverage: number,
  currentAttempts: number,
  newAccuracy: number
): number {
  return (currentAverage * currentAttempts + newAccuracy) / (currentAttempts + 1);
}

async function checkLessonAchievements(
  result: LessonResult,
  moduleProgress: any
): Promise<string[]> {
  const achievements: string[] = [];

  // Perfect score achievement
  if (result.accuracy === 100) {
    const perfectAchievement = await unlockAchievement('PERFECT_SCORE', {
      lessonId: result.lessonId,
      moduleId: result.moduleId,
    });
    if (perfectAchievement) achievements.push(perfectAchievement.id);
  }

  // Speed demon achievement
  if (result.timeSpent < result.totalExercises * 30) { // 30 seconds per exercise
    const speedAchievement = await unlockAchievement('SPEED_DEMON', {
      lessonId: result.lessonId,
      moduleId: result.moduleId,
    });
    if (speedAchievement) achievements.push(speedAchievement.id);
  }

  // Streak achievements
  if (result.perfectStreak >= 5) {
    const streakAchievement = await unlockAchievement('PERFECT_STREAK', {
      streak: result.perfectStreak,
    });
    if (streakAchievement) achievements.push(streakAchievement.id);
  }

  // Module completion achievements
  if (moduleProgress.progress === 100) {
    const moduleAchievement = await unlockAchievement('MODULE_MASTER', {
      moduleId: result.moduleId,
    });
    if (moduleAchievement) achievements.push(moduleAchievement.id);
  }

  // Practice time achievements
  if (result.practiceTime >= 300) { // 5 minutes
    const practiceAchievement = await unlockAchievement('DEDICATED_PRACTICE', {
      practiceTime: result.practiceTime,
    });
    if (practiceAchievement) achievements.push(practiceAchievement.id);
  }

  return achievements;
}

async function recordLessonCompletion(result: LessonResult): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('lesson_completions').insert({
      userId: user.id,
      moduleId: result.moduleId,
      lessonId: result.lessonId,
      accuracy: result.accuracy,
      timeSpent: result.timeSpent,
      mistakes: result.mistakes,
      completedExercises: result.completedExercises,
      totalExercises: result.totalExercises,
      perfectStreak: result.perfectStreak,
      practiceTime: result.practiceTime,
      completedAt: new Date(),
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error recording lesson completion:', error);
    throw error;
  }
}

export async function getLessonStats(
  moduleId: string,
  lessonId: string
): Promise<{
  attempts: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalTimeSpent: number;
  totalPracticeTime: number;
  perfectAttempts: number;
  currentStreak: number;
  longestStreak: number;
  lastAttempted: Date;
  completedAt?: Date;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('userId', user.id)
      .eq('moduleId', moduleId)
      .eq('lessonId', lessonId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting lesson stats:', error);
    throw error;
  }
} 