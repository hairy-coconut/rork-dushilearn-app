import { LessonContent } from './lessonTypes';
import { IslandStory } from './stories';

export const TEST_LESSON: LessonContent = {
    id: 'test_lesson_1',
    type: 'multiple_choice',
    difficulty: 'beginner',
    category: 'greetings',
    title: 'Basic Greetings',
    description: 'Learn common greetings in the local language',
    rewards: {
        xp: 50,
        coconuts: 25,
    },
    content: {
        text: 'How do you say "Hello" in the local language?',
        options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        correct_answer: 'Hola',
        translations: {
            en: 'Hello',
            es: 'Hola',
        },
        cultural_notes: 'In local culture, it\'s common to greet with a smile and slight bow.',
    },
    metadata: {
        duration: 5,
        required_level: 1,
        is_premium: false,
        cultural_context: 'Everyday greetings',
    },
};

export const TEST_STORY: IslandStory = {
    id: 'test_story_1',
    title: 'A Day at the Market',
    description: 'Join Maria and Juan as they explore the local market',
    category: 'daily_life',
    difficulty: 'beginner',
    characters: [
        {
            id: 'maria',
            name: 'Maria',
            role: 'Local Guide',
            description: 'A friendly local who knows the market well',
            image_url: 'https://example.com/maria.jpg',
            voice_id: 'voice_1',
        },
        {
            id: 'juan',
            name: 'Juan',
            role: 'Tourist',
            description: 'A visitor learning about local culture',
            image_url: 'https://example.com/juan.jpg',
            voice_id: 'voice_2',
        },
    ],
    dialogues: [
        {
            id: 'dialogue_1',
            character_id: 'maria',
            text: '¡Bienvenido al mercado! ¿Qué te gustaría comprar hoy?',
            translation: 'Welcome to the market! What would you like to buy today?',
            cultural_note: 'Local markets are a central part of daily life and social interaction.',
        },
        {
            id: 'dialogue_2',
            character_id: 'juan',
            text: 'Me gustaría comprar algunas frutas. ¿Qué me recomiendas?',
            translation: 'I would like to buy some fruits. What do you recommend?',
        },
        {
            id: 'dialogue_3',
            character_id: 'maria',
            text: '¡Las mangos están en temporada! Son muy dulces y jugosas.',
            translation: 'The mangoes are in season! They are very sweet and juicy.',
            cultural_note: 'Seasonal fruits are highly valued in local cuisine.',
        },
    ],
    rewards: {
        xp: 100,
        coconuts: 50,
    },
    metadata: {
        duration: 10,
        required_level: 1,
        is_premium: false,
        cultural_context: 'Local markets and food culture',
    },
}; 