import { supabase } from './supabase';

export type LanguageSkill = 'listening' | 'speaking' | 'reading' | 'writing';
export type FluencyLevel = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'mastery';

export interface SkillProgress {
    skill: LanguageSkill;
    level: FluencyLevel;
    progress: number; // 0-100
    last_assessment: string;
    next_assessment: string;
}

export interface FluencyProgress {
    user_id: string;
    overall_level: FluencyLevel;
    overall_progress: number;
    skills: SkillProgress[];
    last_updated: string;
}

// Fluency Level Definitions
export const FLUENCY_LEVELS: Record<FluencyLevel, {
    title: string;
    description: string;
    color: string;
    icon: string;
    requirements: {
        vocabulary: number;
        grammar: number;
        listening: number;
        speaking: number;
        reading: number;
        writing: number;
    };
}> = {
    beginner: {
        title: 'Beginner',
        description: 'Starting your language journey',
        color: '#4CAF50',
        icon: 'seed',
        requirements: {
            vocabulary: 100,
            grammar: 50,
            listening: 50,
            speaking: 50,
            reading: 50,
            writing: 50,
        },
    },
    elementary: {
        title: 'Elementary',
        description: 'Basic communication skills',
        color: '#2196F3',
        icon: 'sprout',
        requirements: {
            vocabulary: 500,
            grammar: 200,
            listening: 200,
            speaking: 200,
            reading: 200,
            writing: 200,
        },
    },
    intermediate: {
        title: 'Intermediate',
        description: 'Confident in everyday situations',
        color: '#FF9800',
        icon: 'tree',
        requirements: {
            vocabulary: 1500,
            grammar: 500,
            listening: 500,
            speaking: 500,
            reading: 500,
            writing: 500,
        },
    },
    upper_intermediate: {
        title: 'Upper Intermediate',
        description: 'Comfortable with complex topics',
        color: '#9C27B0',
        icon: 'pine-tree',
        requirements: {
            vocabulary: 3000,
            grammar: 1000,
            listening: 1000,
            speaking: 1000,
            reading: 1000,
            writing: 1000,
        },
    },
    advanced: {
        title: 'Advanced',
        description: 'Fluent in most situations',
        color: '#F44336',
        icon: 'forest',
        requirements: {
            vocabulary: 5000,
            grammar: 2000,
            listening: 2000,
            speaking: 2000,
            reading: 2000,
            writing: 2000,
        },
    },
    mastery: {
        title: 'Mastery',
        description: 'Native-like proficiency',
        color: '#FFD700',
        icon: 'island',
        requirements: {
            vocabulary: 10000,
            grammar: 5000,
            listening: 5000,
            speaking: 5000,
            reading: 5000,
            writing: 5000,
        },
    },
};

// Helper Functions
export const getFluencyProgress = async (userId: string): Promise<FluencyProgress | null> => {
    try {
        const { data, error } = await supabase
            .from('fluency_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching fluency progress:', error);
        return null;
    }
};

export const updateFluencyProgress = async (
    userId: string,
    progress: Partial<FluencyProgress>
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('fluency_progress')
            .upsert({
                user_id: userId,
                ...progress,
                last_updated: new Date().toISOString(),
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating fluency progress:', error);
        return false;
    }
};

export const updateSkillProgress = async (
    userId: string,
    skill: LanguageSkill,
    progress: number
): Promise<boolean> => {
    try {
        const fluencyProgress = await getFluencyProgress(userId);
        if (!fluencyProgress) return false;

        const updatedSkills = fluencyProgress.skills.map(s => 
            s.skill === skill
                ? { ...s, progress, last_assessment: new Date().toISOString() }
                : s
        );

        // Calculate overall progress
        const overallProgress = updatedSkills.reduce((acc, skill) => acc + skill.progress, 0) / updatedSkills.length;

        // Determine overall level based on progress
        const overallLevel = Object.entries(FLUENCY_LEVELS)
            .reverse()
            .find(([_, level]) => overallProgress >= level.requirements.listening)?.[0] as FluencyLevel || 'beginner';

        await updateFluencyProgress(userId, {
            skills: updatedSkills,
            overall_progress: overallProgress,
            overall_level: overallLevel,
        });

        return true;
    } catch (error) {
        console.error('Error updating skill progress:', error);
        return false;
    }
};

export const getNextLevelRequirements = (currentLevel: FluencyLevel): {
    nextLevel: FluencyLevel;
    requirements: typeof FLUENCY_LEVELS[FluencyLevel]['requirements'];
} | null => {
    const levels = Object.keys(FLUENCY_LEVELS) as FluencyLevel[];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
        return null;
    }

    const nextLevel = levels[currentIndex + 1];
    return {
        nextLevel,
        requirements: FLUENCY_LEVELS[nextLevel].requirements,
    };
};

export const calculateSkillProgress = async (
    userId: string,
    skill: LanguageSkill
): Promise<number> => {
    try {
        // Get user's completed lessons and assessments for the skill
        const { data: lessons, error: lessonsError } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('skill_type', skill);

        if (lessonsError) throw lessonsError;

        // Calculate progress based on completed lessons and their difficulty
        const totalProgress = lessons.reduce((acc, lesson) => {
            const difficultyMultiplier = {
                'beginner': 1,
                'elementary': 2,
                'intermediate': 3,
                'upper_intermediate': 4,
                'advanced': 5,
                'mastery': 6,
            }[lesson.difficulty] || 1;

            return acc + (lesson.score * difficultyMultiplier);
        }, 0);

        // Normalize progress to 0-100
        const normalizedProgress = Math.min(100, (totalProgress / 1000) * 100);
        return Math.round(normalizedProgress);
    } catch (error) {
        console.error('Error calculating skill progress:', error);
        return 0;
    }
};

export const getFluencyInsights = async (userId: string) => {
    try {
        const progress = await getFluencyProgress(userId);
        if (!progress) return null;

        const strongestSkill = progress.skills.reduce((a, b) => 
            a.progress > b.progress ? a : b
        );

        const weakestSkill = progress.skills.reduce((a, b) => 
            a.progress < b.progress ? a : b
        );

        const nextLevel = getNextLevelRequirements(progress.overall_level);
        const progressToNextLevel = nextLevel
            ? (progress.overall_progress / nextLevel.requirements.listening) * 100
            : 100;

        return {
            currentLevel: progress.overall_level,
            overallProgress: progress.overall_progress,
            strongestSkill,
            weakestSkill,
            nextLevel: nextLevel?.nextLevel,
            progressToNextLevel,
            skills: progress.skills,
        };
    } catch (error) {
        console.error('Error getting fluency insights:', error);
        return null;
    }
}; 