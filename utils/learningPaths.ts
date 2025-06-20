import { supabase } from './utils/supabase';
import { getCurrentUser } from './utils/auth';

export interface LearningPath {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    requiredLevel: number;
    xpReward: number;
    lessons: Lesson[];
    isLocked: boolean;
    progress: number;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    type: 'listen_match' | 'fill_blank' | 'select_image' | 'translate' | 'match_audio' | 'story';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xpReward: number;
    coconutReward: number;
    content: LessonContent;
    isCompleted: boolean;
    isLocked: boolean;
    requiredLessons?: string[];
}

export interface LessonContent {
    question: string;
    options?: string[];
    correctAnswer: string;
    imageUrl?: string;
    audioUrl?: string;
    explanation?: string;
    culturalNote?: string;
}

export const LEARNING_PATHS: LearningPath[] = [
    {
        id: 'island_essentials',
        title: 'Island Essentials',
        description: 'Master the basics of Papiamentu for everyday island life',
        icon: 'palm-tree',
        color: '#4CAF50',
        requiredLevel: 1,
        xpReward: 100,
        lessons: [
            {
                id: 'greetings_1',
                title: 'Basic Greetings',
                description: 'Learn how to say hello and goodbye',
                type: 'fill_blank',
                difficulty: 'beginner',
                xpReward: 20,
                coconutReward: 5,
                content: {
                    question: 'How do you say "Good morning" in Papiamentu?',
                    options: ['Bon dia', 'Bon tardi', 'Bon nochi', 'Kon ta bai'],
                    correctAnswer: 'Bon dia',
                    explanation: '"Bon dia" is used from early morning until noon.',
                    culturalNote: 'Papiamentu greetings often include asking about well-being.'
                },
                isCompleted: false,
                isLocked: false
            },
            {
                id: 'numbers_1',
                title: 'Numbers 1-10',
                description: 'Count like a local',
                type: 'match_audio',
                difficulty: 'beginner',
                xpReward: 25,
                coconutReward: 8,
                content: {
                    question: 'Match the number with its Papiamentu word',
                    options: ['un', 'dos', 'tres', 'kuater', 'sinku'],
                    correctAnswer: 'un',
                    explanation: 'Numbers in Papiamentu are similar to Spanish but with local pronunciation.'
                },
                isCompleted: false,
                isLocked: true,
                requiredLessons: ['greetings_1']
            }
        ],
        isLocked: false,
        progress: 0
    },
    {
        id: 'market_talk',
        title: 'Market Talk',
        description: 'Essential phrases for shopping and bargaining',
        icon: 'shopping',
        color: '#FF9800',
        requiredLevel: 3,
        xpReward: 150,
        lessons: [
            {
                id: 'shopping_1',
                title: 'Market Phrases',
                description: 'Learn how to ask prices and bargain',
                type: 'translate',
                difficulty: 'intermediate',
                xpReward: 30,
                coconutReward: 10,
                content: {
                    question: 'Translate: "How much does this cost?"',
                    correctAnswer: 'Kuantu e ta kosta?',
                    explanation: 'This is a common phrase used in markets and shops.',
                    culturalNote: 'Bargaining is common in local markets, but not in supermarkets.'
                },
                isCompleted: false,
                isLocked: true,
                requiredLessons: ['greetings_1', 'numbers_1']
            }
        ],
        isLocked: true,
        progress: 0
    }
];

export async function getUserProgress(userId: string): Promise<{
    currentPath: string;
    completedLessons: string[];
    level: number;
    xp: number;
}> {
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        throw new Error('Failed to fetch user progress');
    }

    return {
        currentPath: data.current_path || 'island_essentials',
        completedLessons: data.completed_lessons || [],
        level: data.level || 1,
        xp: data.xp || 0
    };
}

export async function updateLessonProgress(
    userId: string,
    lessonId: string,
    isCompleted: boolean
): Promise<{
    success: boolean;
    xpGained: number;
    coconutGained: number;
    levelUp: boolean;
}> {
    const lesson = LEARNING_PATHS.flatMap(path => path.lessons)
        .find(l => l.id === lessonId);

    if (!lesson) {
        throw new Error('Lesson not found');
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('xp, level, coconuts')
        .eq('id', userId)
        .single();

    if (userError) {
        throw new Error('Failed to fetch user data');
    }

    let xpGained = 0;
    let coconutGained = 0;
    let levelUp = false;

    if (isCompleted) {
        xpGained = lesson.xpReward;
        coconutGained = lesson.coconutReward;

        // Check for level up
        const newXp = userData.xp + xpGained;
        const newLevel = Math.floor(newXp / 100) + 1;
        levelUp = newLevel > userData.level;

        // Update user progress
        const { error: updateError } = await supabase
            .from('user_progress')
            .upsert({
                user_id: userId,
                completed_lessons: [...(userData.completed_lessons || []), lessonId],
                xp: newXp,
                level: newLevel,
                coconuts: userData.coconuts + coconutGained
            });

        if (updateError) {
            throw new Error('Failed to update user progress');
        }
    }

    return {
        success: true,
        xpGained,
        coconutGained,
        levelUp
    };
}

export function getAvailablePaths(userLevel: number): LearningPath[] {
    return LEARNING_PATHS.map(path => ({
        ...path,
        isLocked: path.requiredLevel > userLevel
    }));
}

export function getNextLesson(pathId: string, completedLessons: string[]): Lesson | null {
    const path = LEARNING_PATHS.find(p => p.id === pathId);
    if (!path) return null;

    return path.lessons.find(lesson => {
        if (lesson.isCompleted || completedLessons.includes(lesson.id)) return false;
        if (!lesson.requiredLessons) return true;
        return lesson.requiredLessons.every(req => completedLessons.includes(req));
    }) || null;
}

export function calculatePathProgress(pathId: string, completedLessons: string[]): number {
    const path = LEARNING_PATHS.find(p => p.id === pathId);
    if (!path) return 0;

    const completedInPath = path.lessons.filter(lesson => 
        completedLessons.includes(lesson.id)
    ).length;

    return (completedInPath / path.lessons.length) * 100;
}

export async function getLearningPaths(): Promise<LearningPath[]> {
  try {
    const { data: modules, error } = await supabase
      .from('learning_modules')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw error;

    // Fetch lessons for each module
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('moduleId', module.id)
          .order('order', { ascending: true });

        if (lessonsError) throw lessonsError;

        return {
          ...module,
          lessons,
        };
      })
    );

    return modulesWithLessons;
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    throw error;
  }
}

export async function getModuleProgress(
  moduleId: string
): Promise<{
  totalLessons: number;
  completedLessons: number;
  progress: number;
  xpEarned: number;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get all lessons in the module
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('moduleId', moduleId);

    if (lessonsError) throw lessonsError;

    // Get user's progress for the module
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('userId', user.id)
      .eq('moduleId', moduleId)
      .eq('status', 'completed');

    if (progressError) throw progressError;

    const totalLessons = lessons.length;
    const completedLessons = progress.length;
    const moduleProgress = (completedLessons / totalLessons) * 100;
    const xpEarned = progress.reduce((sum, p) => sum + p.xpEarned, 0);

    return {
      totalLessons,
      completedLessons,
      progress: moduleProgress,
      xpEarned,
    };
  } catch (error) {
    console.error('Error getting module progress:', error);
    throw error;
  }
}

export async function checkModulePrerequisites(
  moduleId: string
): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get module prerequisites
    const { data: module, error: moduleError } = await supabase
      .from('learning_modules')
      .select('prerequisites')
      .eq('id', moduleId)
      .single();

    if (moduleError) throw moduleError;

    if (!module.prerequisites || module.prerequisites.length === 0) {
      return true;
    }

    // Check if user has completed all prerequisites
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('moduleId')
      .eq('userId', user.id)
      .eq('status', 'completed')
      .in('moduleId', module.prerequisites);

    if (progressError) throw progressError;

    return progress.length === module.prerequisites.length;
  } catch (error) {
    console.error('Error checking module prerequisites:', error);
    throw error;
  }
} 