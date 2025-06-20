import { supabase } from './supabase';

export type LessonType = 
  | 'listen_match'    // Listen to audio and match with text/image
  | 'fill_blank'      // Fill in missing words in a sentence
  | 'multiple_choice' // Choose correct answer from options
  | 'speak_record'    // Speak and record your pronunciation
  | 'drag_drop'       // Drag and drop words to form sentences
  | 'conversation'    // Interactive conversation practice
  | 'cultural_quiz'   // Cultural knowledge quiz
  | 'word_order'      // Arrange words in correct order
  | 'picture_match'   // Match words with pictures
  | 'role_play';      // Role-play scenarios

export type LessonDifficulty = 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced';
export type LessonCategory = 'greetings' | 'travel' | 'food' | 'shopping' | 'culture' | 'business' | 'social';

export interface LessonContent {
  id: string;
  type: LessonType;
  difficulty: LessonDifficulty;
  category: LessonCategory;
  title: string;
  description: string;
  rewards: {
    xp: number;
    coconuts: number;
  };
  content: {
    audio_url?: string;
    text?: string;
    options?: string[];
    correct_answer?: string;
    image_url?: string;
    translations?: Record<string, string>;
    cultural_notes?: string;
    grammar_notes?: string;
    vocabulary?: Array<{
      word: string;
      translation: string;
      example: string;
    }>;
  };
  metadata: {
    duration: number; // in minutes
    required_level: number;
    is_premium: boolean;
    native_speaker_id?: string;
    cultural_context?: string;
  };
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  attempts: number;
  last_attempt: string;
  time_spent: number;
  mistakes: Array<{
    question: string;
    user_answer: string;
    correct_answer: string;
  }>;
}

export interface AdaptiveLessonPlan {
  user_id: string;
  current_level: number;
  focus_areas: Array<{
    skill: 'listening' | 'speaking' | 'reading' | 'writing';
    priority: number;
  }>;
  recommended_lessons: string[];
  completed_lessons: string[];
  next_review: string;
}

// Sample Lesson Content
const SAMPLE_LESSONS: LessonContent[] = [
  {
    id: 'greeting_1',
    type: 'listen_match',
    difficulty: 'beginner',
    category: 'greetings',
    title: 'Basic Greetings',
    description: 'Learn common greetings in the local language',
    rewards: {
      xp: 50,
      coconuts: 25,
    },
    content: {
      audio_url: 'https://example.com/audio/greeting_1.mp3',
      text: 'Hello, how are you?',
      options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
      correct_answer: 'Hello',
      translations: {
        en: 'Hello, how are you?',
        es: '¿Hola, cómo estás?',
      },
      cultural_notes: 'In local culture, it\'s common to greet with a smile and slight bow.',
    },
    metadata: {
      duration: 5,
      required_level: 1,
      is_premium: false,
      native_speaker_id: 'speaker_1',
      cultural_context: 'Everyday greetings',
    },
  },
  {
    id: 'market_1',
    type: 'conversation',
    difficulty: 'elementary',
    category: 'shopping',
    title: 'Market Conversation',
    description: 'Practice shopping at a local market',
    rewards: {
      xp: 75,
      coconuts: 35,
    },
    content: {
      audio_url: 'https://example.com/audio/market_1.mp3',
      text: 'How much is this fruit?',
      options: [
        'It\'s 5 dollars',
        'I don\'t understand',
        'Thank you very much',
        'Can I try it?',
      ],
      correct_answer: 'It\'s 5 dollars',
      translations: {
        en: 'How much is this fruit?',
        es: '¿Cuánto cuesta esta fruta?',
      },
      cultural_notes: 'Bargaining is common in local markets.',
      vocabulary: [
        {
          word: 'fruit',
          translation: 'fruta',
          example: 'This fruit is fresh',
        },
      ],
    },
    metadata: {
      duration: 10,
      required_level: 2,
      is_premium: false,
      native_speaker_id: 'speaker_2',
      cultural_context: 'Local markets',
    },
  },
];

// Helper Functions
export const getLessonById = async (lessonId: string): Promise<LessonContent | null> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
};

export const getLessonsByType = async (type: LessonType): Promise<LessonContent[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('type', type);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lessons by type:', error);
    return [];
  }
};

export const getLessonsByDifficulty = async (difficulty: LessonDifficulty): Promise<LessonContent[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('difficulty', difficulty);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lessons by difficulty:', error);
    return [];
  }
};

export const getLessonsByCategory = async (category: LessonCategory): Promise<LessonContent[]> => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('category', category);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lessons by category:', error);
    return [];
  }
};

export const calculateLessonScore = (
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number
): number => {
  const accuracyScore = (correctAnswers / totalQuestions) * 100;
  const timeBonus = Math.max(0, 100 - (timeSpent / 60)); // 1 point per second under 100 seconds
  return Math.round(accuracyScore + timeBonus);
};

export const getNextRecommendedLesson = async (
  userId: string,
  currentLevel: number
): Promise<LessonContent | null> => {
  try {
    // Get user's completed lessons
    const { data: progress, error: progressError } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    const completedLessonIds = progress.map(p => p.lesson_id);

    // Get available lessons for user's level
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('required_level', currentLevel)
      .not('id', 'in', completedLessonIds)
      .limit(1);

    if (lessonsError) throw lessonsError;
    return lessons[0] || null;
  } catch (error) {
    console.error('Error getting next recommended lesson:', error);
    return null;
  }
};

export const updateAdaptivePlan = async (
  userId: string,
  lessonId: string,
  score: number
): Promise<boolean> => {
  try {
    const { data: plan, error: planError } = await supabase
      .from('adaptive_lesson_plans')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (planError) throw planError;

    // Update focus areas based on performance
    const updatedFocusAreas = plan.focus_areas.map(area => {
      if (score < 70) {
        return { ...area, priority: area.priority + 1 };
      }
      return area;
    });

    // Update plan
    const { error: updateError } = await supabase
      .from('adaptive_lesson_plans')
      .update({
        focus_areas: updatedFocusAreas,
        completed_lessons: [...plan.completed_lessons, lessonId],
        next_review: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error updating adaptive plan:', error);
    return false;
  }
}; 