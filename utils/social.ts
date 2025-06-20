import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface Friend {
    id: string;
    user_id: string;
    friend_id: string;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: string;
    updated_at: string;
    friend?: User;
}

export interface LeaderboardEntry {
    id: string;
    user_id: string;
    period: 'daily' | 'weekly' | 'monthly' | 'all_time';
    xp: number;
    rank: number;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface Challenge {
    id: string;
    creator_id: string;
    title: string;
    description: string;
    type: 'xp' | 'lessons' | 'streak' | 'accuracy';
    target: number;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
    creator?: User;
    participants?: ChallengeParticipant[];
}

export interface ChallengeParticipant {
    id: string;
    challenge_id: string;
    user_id: string;
    progress: number;
    completed: boolean;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface Notification {
    id: string;
    user_id: string;
    type: 'friend_request' | 'challenge_invite' | 'achievement' | 'streak_reminder';
    title: string;
    message: string;
    data: any;
    read: boolean;
    created_at: string;
}

export interface UserProfile {
    id: string;
    username: string;
    avatar_url?: string;
    level: number;
    xp: number;
    coconuts: number;
    streak: number;
    country: string;
    language: string;
    created_at: Date;
    last_active: Date;
    achievements: string[];
    friends: string[];
    team_id?: string;
    is_premium: boolean;
    status: 'online' | 'offline' | 'away';
    bio?: string;
    social_links?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
    };
}

export interface Team {
    id: string;
    name: string;
    description: string;
    leader_id: string;
    members: string[];
    level: number;
    xp: number;
    created_at: Date;
    achievements: string[];
    challenges_completed: number;
    weekly_goal: number;
    weekly_progress: number;
}

export interface CommunityChallenge {
    id: string;
    title: string;
    description: string;
    type: 'individual' | 'team';
    start_date: Date;
    end_date: Date;
    reward: {
        xp: number;
        coconuts: number;
        special_reward?: string;
    };
    requirements: {
        min_level: number;
        min_team_size?: number;
    };
    participants: string[];
    leaderboard: LeaderboardEntry[];
    status: 'upcoming' | 'active' | 'completed';
}

// Friend functions
export async function getFriends(): Promise<Friend[]> {
    const { data: friends, error } = await supabase
        .from('friends')
        .select(`
            *,
            friend:friend_id (
                id,
                email,
                user_metadata
            )
        `)
        .eq('status', 'accepted');

    if (error) throw error;
    return friends;
}

export async function getPendingFriendRequests(): Promise<Friend[]> {
    const { data: requests, error } = await supabase
        .from('friends')
        .select(`
            *,
            friend:user_id (
                id,
                email,
                user_metadata
            )
        `)
        .eq('status', 'pending')
        .eq('friend_id', supabase.auth.user()?.id);

    if (error) throw error;
    return requests;
}

export async function sendFriendRequest(friendId: string): Promise<void> {
    const { error } = await supabase.rpc('handle_friend_request', {
        p_user_id: supabase.auth.user()?.id,
        p_friend_id: friendId
    });

    if (error) throw error;
}

export async function acceptFriendRequest(friendId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_friend_request', {
        p_user_id: supabase.auth.user()?.id,
        p_friend_id: friendId
    });

    if (error) throw error;
}

// Leaderboard functions
export async function getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time'): Promise<LeaderboardEntry[]> {
    const { data: entries, error } = await supabase
        .from('leaderboards')
        .select(`
            *,
            user:user_id (
                id,
                email,
                user_metadata
            )
        `)
        .eq('period', period)
        .order('rank', { ascending: true })
        .limit(100);

    if (error) throw error;
    return entries;
}

export async function getUserRank(period: 'daily' | 'weekly' | 'monthly' | 'all_time'): Promise<LeaderboardEntry | null> {
    const { data: entry, error } = await supabase
        .from('leaderboards')
        .select('*')
        .eq('period', period)
        .eq('user_id', supabase.auth.user()?.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return entry;
}

// Challenge functions
export async function getChallenges(): Promise<Challenge[]> {
    const { data: challenges, error } = await supabase
        .from('challenges')
        .select(`
            *,
            creator:creator_id (
                id,
                email,
                user_metadata
            ),
            participants:challenge_participants (
                *,
                user:user_id (
                    id,
                    email,
                    user_metadata
                )
            )
        `)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) throw error;
    return challenges;
}

export async function createChallenge(
    title: string,
    description: string,
    type: 'xp' | 'lessons' | 'streak' | 'accuracy',
    target: number,
    startDate: Date,
    endDate: Date
): Promise<string> {
    const { data: challengeId, error } = await supabase.rpc('create_challenge', {
        p_creator_id: supabase.auth.user()?.id,
        p_title: title,
        p_description: description,
        p_type: type,
        p_target: target,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString()
    });

    if (error) throw error;
    return challengeId;
}

export async function inviteToChallenge(challengeId: string, inviteeId: string): Promise<void> {
    const { error } = await supabase.rpc('invite_to_challenge', {
        p_challenge_id: challengeId,
        p_inviter_id: supabase.auth.user()?.id,
        p_invitee_id: inviteeId
    });

    if (error) throw error;
}

// Notification functions
export async function getNotifications(): Promise<Notification[]> {
    const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', supabase.auth.user()?.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return notifications;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', supabase.auth.user()?.id);

    if (error) throw error;
}

export async function markAllNotificationsAsRead(): Promise<void> {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', supabase.auth.user()?.id)
        .eq('read', false);

    if (error) throw error;
}

// Helper functions
export function getUnreadNotificationCount(notifications: Notification[]): number {
    return notifications.filter(n => !n.read).length;
}

export function formatLeaderboardPeriod(period: 'daily' | 'weekly' | 'monthly' | 'all_time'): string {
    switch (period) {
        case 'daily':
            return 'Today';
        case 'weekly':
            return 'This Week';
        case 'monthly':
            return 'This Month';
        case 'all_time':
            return 'All Time';
    }
}

export function formatChallengeType(type: 'xp' | 'lessons' | 'streak' | 'accuracy'): string {
    switch (type) {
        case 'xp':
            return 'XP Challenge';
        case 'lessons':
            return 'Lessons Challenge';
        case 'streak':
            return 'Streak Challenge';
        case 'accuracy':
            return 'Accuracy Challenge';
    }
}

export function getChallengeProgress(participant: ChallengeParticipant, challenge: Challenge): number {
    return (participant.progress / challenge.target) * 100;
}

export function isChallengeActive(challenge: Challenge): boolean {
    const now = new Date();
    return new Date(challenge.start_date) <= now && now <= new Date(challenge.end_date);
}

export function isChallengeCompleted(participant: ChallengeParticipant): boolean {
    return participant.completed;
}

export function getChallengeTimeRemaining(challenge: Challenge): string {
    const now = new Date();
    const end = new Date(challenge.end_date);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
}

// Team functions
export async function createTeam(name: string, description: string, leaderId: string): Promise<Team> {
    const { data, error } = await supabase
        .from('teams')
        .insert([
            {
                name,
                description,
                leader_id: leaderId,
                members: [leaderId],
                level: 1,
                xp: 0,
                weekly_goal: 1000,
                weekly_progress: 0
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function joinTeam(teamId: string, userId: string): Promise<void> {
    const { data: team } = await supabase
        .from('teams')
        .select('members')
        .eq('id', teamId)
        .single();

    if (!team) throw new Error('Team not found');

    const { error } = await supabase
        .from('teams')
        .update({
            members: [...team.members, userId]
        })
        .eq('id', teamId);

    if (error) throw error;
}

// Community Challenge functions
export async function getActiveChallenges(): Promise<CommunityChallenge[]> {
    const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('status', 'active')
        .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
}

export async function joinChallenge(challengeId: string, userId: string): Promise<void> {
    const { data: challenge } = await supabase
        .from('community_challenges')
        .select('participants')
        .eq('id', challengeId)
        .single();

    if (!challenge) throw new Error('Challenge not found');

    const { error } = await supabase
        .from('community_challenges')
        .update({
            participants: [...challenge.participants, userId]
        })
        .eq('id', challengeId);

    if (error) throw error;
}

export async function updateChallengeProgress(challengeId: string, userId: string, progress: number): Promise<void> {
    const { data: challenge } = await supabase
        .from('community_challenges')
        .select('leaderboard')
        .eq('id', challengeId)
        .single();

    if (!challenge) throw new Error('Challenge not found');

    const updatedLeaderboard = challenge.leaderboard.map(entry => {
        if (entry.user_id === userId) {
            return { ...entry, score: entry.score + progress };
        }
        return entry;
    });

    const { error } = await supabase
        .from('community_challenges')
        .update({ leaderboard: updatedLeaderboard })
        .eq('id', challengeId);

    if (error) throw error;
}

// Social activity functions
export async function getSocialFeed(userId: string, limit: number = 20): Promise<any[]> {
    const { data: friends } = await supabase
        .from('user_friends')
        .select('friend_id')
        .eq('user_id', userId);

    if (!friends) return [];

    const { data, error } = await supabase
        .from('social_activities')
        .select('*')
        .in('user_id', friends.map(f => f.friend_id))
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

export async function createSocialActivity(userId: string, type: 'achievement' | 'level_up' | 'challenge_complete' | 'streak', data: any): Promise<void> {
    const { error } = await supabase
        .from('social_activities')
        .insert([
            {
                user_id: userId,
                type,
                data,
                created_at: new Date()
            }
        ]);

    if (error) throw error;
} 