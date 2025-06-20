import { supabase } from './supabase';

export type StoryCategory = 'history' | 'culture' | 'traditions' | 'daily_life' | 'festivals' | 'nature';
export type StoryDifficulty = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';

export interface StoryCharacter {
    id: string;
    name: string;
    role: string;
    description: string;
    image_url: string;
    voice_id: string;
}

export interface StoryDialogue {
    id: string;
    character_id: string;
    text: string;
    translation: string;
    audio_url: string;
    cultural_note?: string;
}

export interface IslandStory {
    id: string;
    title: string;
    description: string;
    category: StoryCategory;
    difficulty: StoryDifficulty;
    characters: StoryCharacter[];
    dialogues: StoryDialogue[];
    rewards: {
        xp: number;
        coconuts: number;
    };
    metadata: {
        duration: number; // in minutes
        required_level: number;
        is_premium: boolean;
        location: string;
        cultural_context: string;
        vocabulary: Array<{
            word: string;
            translation: string;
            example: string;
        }>;
        grammar_points: string[];
    };
}

export interface StoryProgress {
    user_id: string;
    story_id: string;
    completed: boolean;
    score: number;
    last_position: number;
    time_spent: number;
    vocabulary_learned: string[];
    cultural_notes_read: string[];
}

// Sample Stories
const SAMPLE_STORIES: IslandStory[] = [
    {
        id: 'market_day',
        title: 'A Day at the Market',
        description: 'Join Maria as she shops at the local market and learns about local customs',
        category: 'daily_life',
        difficulty: 'elementary',
        characters: [
            {
                id: 'maria',
                name: 'Maria',
                role: 'Tourist',
                description: 'A curious traveler learning about local culture',
                image_url: 'https://example.com/images/maria.jpg',
                voice_id: 'voice_1',
            },
            {
                id: 'juan',
                name: 'Juan',
                role: 'Market Vendor',
                description: 'A friendly local vendor with deep knowledge of traditions',
                image_url: 'https://example.com/images/juan.jpg',
                voice_id: 'voice_2',
            },
        ],
        dialogues: [
            {
                id: 'dialogue_1',
                character_id: 'maria',
                text: 'Good morning! How are you today?',
                translation: '¡Buenos días! ¿Cómo estás hoy?',
                audio_url: 'https://example.com/audio/market_1.mp3',
                cultural_note: 'It\'s common to greet everyone at the market, even if you don\'t know them.',
            },
            {
                id: 'dialogue_2',
                character_id: 'juan',
                text: 'Good morning! I\'m doing well, thank you. Would you like to try some fresh fruits?',
                translation: '¡Buenos días! Estoy bien, gracias. ¿Te gustaría probar algunas frutas frescas?',
                audio_url: 'https://example.com/audio/market_2.mp3',
                cultural_note: 'Offering samples is a common practice in local markets.',
            },
        ],
        rewards: {
            xp: 100,
            coconuts: 50,
        },
        metadata: {
            duration: 15,
            required_level: 2,
            is_premium: false,
            location: 'Local Market',
            cultural_context: 'Market culture and traditions',
            vocabulary: [
                {
                    word: 'market',
                    translation: 'mercado',
                    example: 'The market is open every day',
                },
                {
                    word: 'fresh',
                    translation: 'fresco',
                    example: 'These fruits are fresh',
                },
            ],
            grammar_points: [
                'Present tense',
                'Question formation',
                'Polite expressions',
            ],
        },
    },
];

// Helper Functions
export const getStoryById = async (storyId: string): Promise<IslandStory | null> => {
    try {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('id', storyId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching story:', error);
        return null;
    }
};

export const getStoriesByCategory = async (category: StoryCategory): Promise<IslandStory[]> => {
    try {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('category', category);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching stories by category:', error);
        return [];
    }
};

export const getStoriesByDifficulty = async (difficulty: StoryDifficulty): Promise<IslandStory[]> => {
    try {
        const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('difficulty', difficulty);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching stories by difficulty:', error);
        return [];
    }
};

export const updateStoryProgress = async (
    userId: string,
    storyId: string,
    progress: Partial<StoryProgress>
): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('story_progress')
            .upsert({
                user_id: userId,
                story_id: storyId,
                ...progress,
            });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating story progress:', error);
        return false;
    }
};

export const getStoryProgress = async (
    userId: string,
    storyId: string
): Promise<StoryProgress | null> => {
    try {
        const { data, error } = await supabase
            .from('story_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('story_id', storyId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching story progress:', error);
        return null;
    }
};

export const getRecommendedStories = async (
    userId: string,
    currentLevel: number
): Promise<IslandStory[]> => {
    try {
        // Get user's completed stories
        const { data: progress, error: progressError } = await supabase
            .from('story_progress')
            .select('story_id')
            .eq('user_id', userId)
            .eq('completed', true);

        if (progressError) throw progressError;

        const completedStoryIds = progress.map(p => p.story_id);

        // Get available stories for user's level
        const { data: stories, error: storiesError } = await supabase
            .from('stories')
            .select('*')
            .eq('required_level', currentLevel)
            .not('id', 'in', completedStoryIds)
            .limit(5);

        if (storiesError) throw storiesError;
        return stories;
    } catch (error) {
        console.error('Error getting recommended stories:', error);
        return [];
    }
};

export const getCulturalInsights = async (storyId: string): Promise<{
    cultural_notes: string[];
    vocabulary: Array<{
        word: string;
        translation: string;
        example: string;
    }>;
    grammar_points: string[];
}> => {
    try {
        const story = await getStoryById(storyId);
        if (!story) throw new Error('Story not found');

        return {
            cultural_notes: story.dialogues
                .filter(d => d.cultural_note)
                .map(d => d.cultural_note!),
            vocabulary: story.metadata.vocabulary,
            grammar_points: story.metadata.grammar_points,
        };
    } catch (error) {
        console.error('Error getting cultural insights:', error);
        return {
            cultural_notes: [],
            vocabulary: [],
            grammar_points: [],
        };
    }
}; 