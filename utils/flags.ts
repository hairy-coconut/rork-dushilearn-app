import { supabase } from './supabase';

export type UserFlag = 'premium' | 'beta_tester' | 'early_adopter' | 'content_creator' | 'moderator';
export type UserBadge = 'streak_master' | 'xp_champion' | 'social_butterfly' | 'culture_expert' | 'language_master';

export interface UserFlags {
    user_id: string;
    flags: UserFlag[];
    badges: UserBadge[];
    last_updated: string;
}

// Flag Definitions
export const FLAG_DEFINITIONS: Record<UserFlag, {
    title: string;
    description: string;
    icon: string;
    color: string;
    requirements?: {
        type: 'purchase' | 'invite' | 'contribution' | 'role';
        value?: any;
    };
}> = {
    premium: {
        title: 'Premium Member',
        description: 'Access to premium features and content',
        icon: 'crown',
        color: '#FFD700',
        requirements: {
            type: 'purchase',
        },
    },
    beta_tester: {
        title: 'Beta Tester',
        description: 'Early access to new features',
        icon: 'flask',
        color: '#9C27B0',
        requirements: {
            type: 'invite',
        },
    },
    early_adopter: {
        title: 'Early Adopter',
        description: 'Joined during the first month',
        icon: 'rocket',
        color: '#4CAF50',
        requirements: {
            type: 'role',
        },
    },
    content_creator: {
        title: 'Content Creator',
        description: 'Creates learning content for the community',
        icon: 'pencil',
        color: '#2196F3',
        requirements: {
            type: 'contribution',
        },
    },
    moderator: {
        title: 'Community Moderator',
        description: 'Helps maintain a positive learning environment',
        icon: 'shield',
        color: '#F44336',
        requirements: {
            type: 'role',
        },
    },
};

// Badge Definitions
export const BADGE_DEFINITIONS: Record<UserBadge, {
    title: string;
    description: string;
    icon: string;
    color: string;
    requirements: {
        type: 'streak' | 'xp' | 'friends' | 'cultural' | 'lessons';
        value: number;
    };
}> = {
    streak_master: {
        title: 'Streak Master',
        description: 'Maintained a learning streak',
        icon: 'fire',
        color: '#FF9800',
        requirements: {
            type: 'streak',
            value: 30, // 30 days
        },
    },
    xp_champion: {
        title: 'XP Champion',
        description: 'Earned a significant amount of XP',
        icon: 'trophy',
        color: '#FFD700',
        requirements: {
            type: 'xp',
            value: 10000,
        },
    },
    social_butterfly: {
        title: 'Social Butterfly',
        description: 'Built a strong learning network',
        icon: 'account-group',
        color: '#E91E63',
        requirements: {
            type: 'friends',
            value: 50,
        },
    },
    culture_expert: {
        title: 'Culture Expert',
        description: 'Mastered cultural knowledge',
        icon: 'earth',
        color: '#4CAF50',
        requirements: {
            type: 'cultural',
            value: 20, // 20 cultural lessons
        },
    },
    language_master: {
        title: 'Language Master',
        description: 'Completed all core lessons',
        icon: 'school',
        color: '#2196F3',
        requirements: {
            type: 'lessons',
            value: 100, // 100 lessons
        },
    },
};

// Helper Functions
export const getUserFlags = async (userId: string): Promise<UserFlags | null> => {
    try {
        const { data, error } = await supabase
            .from('user_flags')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user flags:', error);
        return null;
    }
};

export const updateUserFlags = async (
    userId: string,
    flags: Partial<UserFlags>
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_flags')
            .upsert({
                user_id: userId,
                ...flags,
                last_updated: new Date().toISOString(),
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating user flags:', error);
        return false;
    }
};

export const addFlag = async (
    userId: string,
    flag: UserFlag
): Promise<boolean> => {
    try {
        const userFlags = await getUserFlags(userId);
        if (!userFlags) return false;

        if (!userFlags.flags.includes(flag)) {
            await updateUserFlags(userId, {
                flags: [...userFlags.flags, flag],
            });
        }

        return true;
    } catch (error) {
        console.error('Error adding flag:', error);
        return false;
    }
};

export const removeFlag = async (
    userId: string,
    flag: UserFlag
): Promise<boolean> => {
    try {
        const userFlags = await getUserFlags(userId);
        if (!userFlags) return false;

        await updateUserFlags(userId, {
            flags: userFlags.flags.filter(f => f !== flag),
        });

        return true;
    } catch (error) {
        console.error('Error removing flag:', error);
        return false;
    }
};

export const checkBadgeEligibility = async (
    userId: string,
    badge: UserBadge
): Promise<boolean> => {
    try {
        const userFlags = await getUserFlags(userId);
        if (!userFlags) return false;

        if (userFlags.badges.includes(badge)) return false;

        const badgeDef = BADGE_DEFINITIONS[badge];
        const { type, value } = badgeDef.requirements;

        // Get user stats from the database
        const { data: stats, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        let isEligible = false;
        switch (type) {
            case 'streak':
                isEligible = stats.current_streak >= value;
                break;
            case 'xp':
                isEligible = stats.total_xp >= value;
                break;
            case 'friends':
                isEligible = stats.friends_count >= value;
                break;
            case 'cultural':
                isEligible = stats.cultural_lessons_completed >= value;
                break;
            case 'lessons':
                isEligible = stats.lessons_completed >= value;
                break;
        }

        if (isEligible) {
            await updateUserFlags(userId, {
                badges: [...userFlags.badges, badge],
            });
        }

        return isEligible;
    } catch (error) {
        console.error('Error checking badge eligibility:', error);
        return false;
    }
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
    try {
        const userFlags = await getUserFlags(userId);
        return userFlags?.badges || [];
    } catch (error) {
        console.error('Error getting user badges:', error);
        return [];
    }
};

export const getUserFlagsWithDetails = async (userId: string) => {
    try {
        const userFlags = await getUserFlags(userId);
        if (!userFlags) return null;

        const flagsWithDetails = userFlags.flags.map(flag => ({
            ...FLAG_DEFINITIONS[flag],
            id: flag,
        }));

        const badgesWithDetails = userFlags.badges.map(badge => ({
            ...BADGE_DEFINITIONS[badge],
            id: badge,
        }));

        return {
            flags: flagsWithDetails,
            badges: badgesWithDetails,
        };
    } catch (error) {
        console.error('Error getting user flags with details:', error);
        return null;
    }
}; 