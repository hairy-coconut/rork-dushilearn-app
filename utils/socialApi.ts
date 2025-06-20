import { supabase } from './supabase';
import { notificationManager } from './notificationManager';

class SocialApi {
  private static instance: SocialApi;

  private constructor() {}

  static getInstance(): SocialApi {
    if (!SocialApi.instance) {
      SocialApi.instance = new SocialApi();
    }
    return SocialApi.instance;
  }

  getCurrentUserId(): string {
    return supabase.auth.user()?.id || '';
  }

  async getChallenges(filter: 'all' | 'active' | 'completed' = 'all') {
    const userId = this.getCurrentUserId();
    let query = supabase
      .from('challenges')
      .select(`
        *,
        participants:challenge_participants(
          user_id,
          progress,
          completed
        )
      `);

    if (filter === 'active') {
      query = query.eq('status', 'active');
    } else if (filter === 'completed') {
      query = query.eq('status', 'completed');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getChallengeDetails(challengeId: string) {
    const { data, error } = await supabase
      .from('challenges')
      .select(`
        *,
        participants:challenge_participants(
          user_id,
          progress,
          completed,
          users:user_id(
            username,
            avatar_url
          )
        )
      `)
      .eq('id', challengeId)
      .single();

    if (error) throw error;
    return data;
  }

  async createChallenge(challenge: {
    title: string;
    description: string;
    type: 'streak' | 'lessons' | 'exercises';
    target: number;
    reward: {
      type: 'coins' | 'badge' | 'theme' | 'premium';
      value: number | string;
    };
    duration: number;
  }) {
    const userId = this.getCurrentUserId();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + challenge.duration);

    const { data, error } = await supabase.from('challenges').insert([
      {
        ...challenge,
        creator_id: userId,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
      },
    ]);

    if (error) throw error;

    // Schedule notifications for the creator
    await notificationManager.scheduleChallengeReminder(
      data[0].id,
      challenge.title,
      endDate
    );

    return data[0];
  }

  async joinChallenge(challengeId: string) {
    const userId = this.getCurrentUserId();
    const { data, error } = await supabase
      .from('challenge_participants')
      .insert([
        {
          challenge_id: challengeId,
          user_id: userId,
          progress: 0,
          completed: false,
        },
      ]);

    if (error) throw error;

    // Get challenge details for notifications
    const challenge = await this.getChallengeDetails(challengeId);
    await notificationManager.scheduleChallengeReminder(
      challengeId,
      challenge.title,
      new Date(challenge.end_date)
    );

    return data[0];
  }

  async updateChallengeProgress(
    challengeId: string,
    progress: number,
    completed: boolean = false
  ) {
    const userId = this.getCurrentUserId();
    const { data, error } = await supabase
      .from('challenge_participants')
      .update({ progress, completed })
      .match({ challenge_id: challengeId, user_id: userId });

    if (error) throw error;

    // Get challenge details for notifications
    const challenge = await this.getChallengeDetails(challengeId);

    // Check for milestones (25%, 50%, 75%)
    const milestones = [25, 50, 75];
    const progressPercentage = (progress / challenge.target) * 100;
    const reachedMilestone = milestones.find(
      (m) => progressPercentage >= m && progressPercentage < m + 25
    );

    if (reachedMilestone) {
      await notificationManager.scheduleMilestoneNotification(
        challengeId,
        challenge.title,
        reachedMilestone
      );
    }

    // If completed, schedule completion notification
    if (completed) {
      await notificationManager.scheduleChallengeCompletion(
        challengeId,
        challenge.title
      );
    }

    // Notify friends about progress
    if (challenge.participants) {
      const friends = challenge.participants.filter(
        (p) => p.user_id !== userId && p.users
      );
      for (const friend of friends) {
        await notificationManager.scheduleFriendProgressNotification(
          challengeId,
          friend.users.username,
          progressPercentage
        );
      }
    }

    return data[0];
  }

  async leaveChallenge(challengeId: string) {
    const userId = this.getCurrentUserId();
    const { error } = await supabase
      .from('challenge_participants')
      .delete()
      .match({ challenge_id: challengeId, user_id: userId });

    if (error) throw error;

    // Cancel all notifications for this challenge
    await notificationManager.cancelChallengeReminder(challengeId);
  }

  async getNotifications() {
    const userId = this.getCurrentUserId();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(notificationId: string) {
    const userId = this.getCurrentUserId();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .match({ id: notificationId, user_id: userId });

    if (error) throw error;
  }

  async clearAllNotifications() {
    const userId = this.getCurrentUserId();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  async createNotification(
    userId: string,
    type: 'challenge' | 'achievement' | 'friend' | 'system',
    title: string,
    message: string,
    data?: {
      challengeId?: string;
      achievementId?: string;
      userId?: string;
    }
  ) {
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false,
      },
    ]);

    if (error) throw error;
  }

  async getUnreadNotificationCount() {
    const userId = this.getCurrentUserId();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }
}

export const socialApi = SocialApi.getInstance(); 