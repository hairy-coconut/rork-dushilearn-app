import { supabase } from './supabase';

export interface PassportStamp {
    id: string;
    title: string;
    description: string;
    icon: string;
    date: string;
    type: 'achievement' | 'milestone' | 'special';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xp_reward: number;
    coconut_reward: number;
}

export interface PassportPage {
    id: string;
    title: string;
    description: string;
    icon: string;
    stamps: PassportStamp[];
    isUnlocked: boolean;
    unlock_requirement: {
        type: 'stamps' | 'xp' | 'level';
        value: number;
    };
}

export interface PassportProgress {
    user_id: string;
    unlocked_pages: string[];
    collected_stamps: string[];
    total_xp: number;
    total_coconuts: number;
    last_updated: string;
}

// Passport Pages Data
export const PASSPORT_PAGES: PassportPage[] = [
    {
        id: 'basics',
        title: 'Language Basics',
        description: 'Master the fundamentals of the language',
        icon: 'book-open-variant',
        stamps: [
            {
                id: 'first_word',
                title: 'First Word',
                description: 'Learned your first word',
                icon: 'book-open-variant',
                date: '2024-03-20',
                type: 'milestone',
                rarity: 'common',
                xp_reward: 10,
                coconut_reward: 5,
            },
            {
                id: 'first_phrase',
                title: 'First Phrase',
                description: 'Learned your first phrase',
                icon: 'chat-processing',
                date: '2024-03-21',
                type: 'milestone',
                rarity: 'common',
                xp_reward: 20,
                coconut_reward: 10,
            },
            {
                id: 'first_lesson',
                title: 'First Lesson',
                description: 'Completed your first lesson',
                icon: 'school',
                date: '2024-03-22',
                type: 'milestone',
                rarity: 'common',
                xp_reward: 30,
                coconut_reward: 15,
            },
        ],
        isUnlocked: true,
        unlock_requirement: {
            type: 'level',
            value: 1,
        },
    },
    {
        id: 'conversations',
        title: 'Conversations',
        description: 'Practice real-world conversations',
        icon: 'account-group',
        stamps: [
            {
                id: 'first_conversation',
                title: 'First Conversation',
                description: 'Completed your first conversation',
                icon: 'account-group',
                date: '2024-03-23',
                type: 'achievement',
                rarity: 'rare',
                xp_reward: 50,
                coconut_reward: 25,
            },
            {
                id: 'conversation_master',
                title: 'Conversation Master',
                description: 'Completed 10 conversations',
                icon: 'account-group',
                date: '2024-03-24',
                type: 'achievement',
                rarity: 'epic',
                xp_reward: 100,
                coconut_reward: 50,
            },
        ],
        isUnlocked: false,
        unlock_requirement: {
            type: 'stamps',
            value: 3,
        },
    },
    {
        id: 'culture',
        title: 'Cultural Knowledge',
        description: 'Learn about local culture and traditions',
        icon: 'earth',
        stamps: [
            {
                id: 'cultural_quiz',
                title: 'Cultural Explorer',
                description: 'Completed a cultural quiz',
                icon: 'earth',
                date: '2024-03-25',
                type: 'achievement',
                rarity: 'epic',
                xp_reward: 75,
                coconut_reward: 35,
            },
            {
                id: 'culture_master',
                title: 'Culture Master',
                description: 'Completed all cultural lessons',
                icon: 'earth',
                date: '2024-03-26',
                type: 'achievement',
                rarity: 'legendary',
                xp_reward: 200,
                coconut_reward: 100,
            },
        ],
        isUnlocked: false,
        unlock_requirement: {
            type: 'xp',
            value: 500,
        },
    },
];

// Helper Functions
export const getPassportProgress = async (userId: string): Promise<PassportProgress | null> => {
    try {
        const { data, error } = await supabase
            .from('passport_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching passport progress:', error);
        return null;
    }
};

export const updatePassportProgress = async (
    userId: string,
    progress: Partial<PassportProgress>
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('passport_progress')
            .upsert({
                user_id: userId,
                ...progress,
                last_updated: new Date().toISOString(),
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating passport progress:', error);
        return false;
    }
};

export const addStamp = async (
    userId: string,
    stampId: string
): Promise<boolean> => {
    try {
        const progress = await getPassportProgress(userId);
        if (!progress) return false;

        const stamp = PASSPORT_PAGES
            .flatMap(page => page.stamps)
            .find(s => s.id === stampId);

        if (!stamp) return false;

        const { error } = await supabase
            .from('passport_progress')
            .update({
                collected_stamps: [...progress.collected_stamps, stampId],
                total_xp: progress.total_xp + stamp.xp_reward,
                total_coconuts: progress.total_coconuts + stamp.coconut_reward,
                last_updated: new Date().toISOString(),
            })
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding stamp:', error);
        return false;
    }
};

export const checkPageUnlock = async (
    userId: string,
    pageId: string
): Promise<boolean> => {
    try {
        const progress = await getPassportProgress(userId);
        if (!progress) return false;

        const page = PASSPORT_PAGES.find(p => p.id === pageId);
        if (!page) return false;

        const { type, value } = page.unlock_requirement;
        let isUnlocked = false;

        switch (type) {
            case 'stamps':
                isUnlocked = progress.collected_stamps.length >= value;
                break;
            case 'xp':
                isUnlocked = progress.total_xp >= value;
                break;
            case 'level':
                // Assuming level is calculated from XP
                const level = Math.floor(progress.total_xp / 1000) + 1;
                isUnlocked = level >= value;
                break;
        }

        if (isUnlocked && !progress.unlocked_pages.includes(pageId)) {
            await updatePassportProgress(userId, {
                unlocked_pages: [...progress.unlocked_pages, pageId],
            });
        }

        return isUnlocked;
    } catch (error) {
        console.error('Error checking page unlock:', error);
        return false;
    }
};

export const getPassportStats = async (userId: string) => {
    try {
        const progress = await getPassportProgress(userId);
        if (!progress) return null;

        const totalStamps = progress.collected_stamps.length;
        const unlockedPages = progress.unlocked_pages.length;
        const legendaryStamps = PASSPORT_PAGES
            .flatMap(page => page.stamps)
            .filter(stamp => 
                stamp.rarity === 'legendary' && 
                progress.collected_stamps.includes(stamp.id)
            ).length;

        return {
            totalStamps,
            unlockedPages,
            legendaryStamps,
            totalXp: progress.total_xp,
            totalCoconuts: progress.total_coconuts,
        };
    } catch (error) {
        console.error('Error getting passport stats:', error);
        return null;
    }
}; 