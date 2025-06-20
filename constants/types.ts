export interface UserProgress {
  level: number;
  experience: number;
  completedLessons: string[];
  achievements: Achievement[];
  streak: {
    current: number;
    longest: number;
    lastCompleted: number;
  };
  statistics: {
    totalLessonsCompleted: number;
    totalExercisesCompleted: number;
    averageScore: number;
    timeSpentLearning: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  type: AchievementType;
  rarity: AchievementRarity;
}

export type AchievementType = 
  | 'streak'
  | 'lessons'
  | 'exercises'
  | 'perfect_score'
  | 'social'
  | 'special';

export type AchievementRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export interface Level {
  level: number;
  experienceRequired: number;
  rewards: LevelReward[];
}

export interface LevelReward {
  type: 'coins' | 'badge' | 'theme' | 'premium';
  value: number | string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: string[];
  requiredLevel: number;
  rewards: LevelReward[];
  progress: number;
}

export interface SocialStats {
  friends: string[];
  challenges: Challenge[];
  leaderboardRank: number;
  socialAchievements: Achievement[];
}

export interface Challenge {
  id: string;
  type: 'streak' | 'lessons' | 'exercises';
  target: number;
  reward: LevelReward;
  participants: string[];
  startDate: number;
  endDate: number;
  progress: Record<string, number>;
} 