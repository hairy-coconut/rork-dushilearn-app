import { supabase } from './supabase';
import { 
  StreakStatus, 
  MonthlyActivity, 
  StreakMilestone,
  STREAK_MILESTONES
} from '../types/streak';

// Get user's current streak status
export async function getUserStreakStatus(userId: string): Promise<StreakStatus | null> {
  const { data, error } = await supabase
    .rpc('get_user_streak_status', { p_user_id: userId })
    .single();

  if (error) throw error;
  return data;
}

// Get user's monthly activity
export async function getUserMonthlyActivity(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyActivity[]> {
  const { data, error } = await supabase
    .rpc('get_user_monthly_activity', {
      p_user_id: userId,
      p_year: year,
      p_month: month
    });

  if (error) throw error;
  return data;
}

// Record daily activity and update streak
export async function recordDailyActivity(
  userId: string,
  xpEarned: number,
  lessonsCompleted: number
): Promise<void> {
  // First, record the daily activity
  const { error: activityError } = await supabase
    .from('daily_activities')
    .upsert({
      user_id: userId,
      activity_date: new Date().toISOString().split('T')[0],
      xp_earned: xpEarned,
      lessons_completed: lessonsCompleted
    });

  if (activityError) throw activityError;

  // Then, update the streak
  const { error: streakError } = await supabase
    .rpc('update_user_streak', {
      p_user_id: userId
    });

  if (streakError) throw streakError;
}

// Purchase a streak freeze
export async function purchaseStreakFreeze(
  userId: string,
  source: 'ad' | 'coins'
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // Freeze lasts for 1 day

  const { error } = await supabase
    .from('streak_freeze_purchases')
    .insert({
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      source
    });

  if (error) throw error;

  // Update user's streak record to include the freeze
  const { error: updateError } = await supabase
    .from('user_streaks')
    .update({
      streak_freeze_available: true,
      streak_freeze_expires_at: expiresAt.toISOString()
    })
    .eq('user_id', userId);

  if (updateError) throw updateError;
}

// Get streak milestone rewards
export function getStreakMilestoneReward(milestone: StreakMilestone) {
  return STREAK_MILESTONES[milestone];
}

// Get next milestone
export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  const milestones = Object.keys(STREAK_MILESTONES).map(Number) as StreakMilestone[];
  return milestones.find(m => m > currentStreak) || null;
}

// Get streak status message
export function getStreakStatusMessage(streak: number): string {
  if (streak === 0) return "Start your Dushi journey today! 🌴";
  if (streak === 1) return "Nice start! You've planted your first streak seed. Let's grow it! 🌱";
  if (streak < 7) return `You're cruising now! ${streak} days of pure Dushi discipline 🌴`;
  if (streak === 7) return "You're officially part of the Dushi Daily Crew! 🌊";
  if (streak < 14) return `Keep the Dushi flow going! ${streak} days strong 💪`;
  if (streak === 14) return "Island Legend status achieved! 🏝️";
  if (streak < 30) return `Unstoppable! ${streak} days of Dushi power ⚡`;
  if (streak === 30) return "Caribbean King! You're a Dushi legend! 👑";
  return `Incredible! ${streak} days of pure Dushi dedication! 🌟`;
}

// Get time until streak break
export function getTimeUntilStreakBreak(nextActivityDeadline: string): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const deadline = new Date(nextActivityDeadline);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
} 