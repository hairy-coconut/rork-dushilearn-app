import { Achievement, getUserAchievements, getAchievementProgress } from './achievements';

export interface AchievementStats {
  total: number;
  completed: number;
  inProgress: number;
  locked: number;
  byRarity: {
    legendary: number;
    epic: number;
    rare: number;
    uncommon: number;
    common: number;
  };
  byType: {
    lesson: number;
    streak: number;
    milestone: number;
    social: number;
    special: number;
    collection: number;
    challenge: number;
  };
  recentUnlocks: {
    count: number;
    achievements: Achievement[];
  };
  completionRate: number;
  averageProgress: number;
  totalRewards: {
    xp: number;
    coins: number;
    badges: number;
    themes: number;
    streakSavers: number;
  };
}

export async function getAchievementStats(): Promise<AchievementStats> {
  try {
    const [unlocked, inProgress] = await Promise.all([
      getUserAchievements(),
      getAchievementProgress('all'),
    ]);

    const allAchievements = [...unlocked, ...inProgress];
    const stats: AchievementStats = {
      total: allAchievements.length,
      completed: allAchievements.filter((a) => a.completed).length,
      inProgress: allAchievements.filter((a) => !a.completed && a.progress > 0).length,
      locked: allAchievements.filter((a) => !a.completed && a.progress === 0).length,
      byRarity: {
        legendary: allAchievements.filter((a) => a.rarity === 'legendary').length,
        epic: allAchievements.filter((a) => a.rarity === 'epic').length,
        rare: allAchievements.filter((a) => a.rarity === 'rare').length,
        uncommon: allAchievements.filter((a) => a.rarity === 'uncommon').length,
        common: allAchievements.filter((a) => a.rarity === 'common').length,
      },
      byType: {
        lesson: allAchievements.filter((a) => a.type === 'lesson').length,
        streak: allAchievements.filter((a) => a.type === 'streak').length,
        milestone: allAchievements.filter((a) => a.type === 'milestone').length,
        social: allAchievements.filter((a) => a.type === 'social').length,
        special: allAchievements.filter((a) => a.type === 'special').length,
        collection: allAchievements.filter((a) => a.type === 'collection').length,
        challenge: allAchievements.filter((a) => a.type === 'challenge').length,
      },
      recentUnlocks: {
        count: unlocked.length,
        achievements: unlocked
          .sort((a, b) => {
            if (!a.unlockedAt || !b.unlockedAt) return 0;
            return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
          })
          .slice(0, 5),
      },
      completionRate: (allAchievements.filter((a) => a.completed).length / allAchievements.length) * 100,
      averageProgress:
        allAchievements.reduce((acc, curr) => acc + (curr.progress / curr.target), 0) /
        allAchievements.length,
      totalRewards: {
        xp: calculateTotalRewards(allAchievements, 'xp'),
        coins: calculateTotalRewards(allAchievements, 'coins'),
        badges: calculateTotalRewards(allAchievements, 'badge'),
        themes: calculateTotalRewards(allAchievements, 'theme'),
        streakSavers: calculateTotalRewards(allAchievements, 'streak_saver'),
      },
    };

    return stats;
  } catch (error) {
    console.error('Error getting achievement stats:', error);
    throw error;
  }
}

function calculateTotalRewards(achievements: Achievement[], type: string): number {
  return achievements.reduce((acc, curr) => {
    if (curr.completed && curr.reward && curr.reward.type === type) {
      const value = typeof curr.reward.value === 'number' ? curr.reward.value : 0;
      return acc + value;
    }
    return acc;
  }, 0);
}

export function getAchievementProgressTrend(achievements: Achievement[]): {
  daily: number[];
  weekly: number[];
  monthly: number[];
} {
  const now = new Date();
  const daily: number[] = Array(7).fill(0);
  const weekly: number[] = Array(4).fill(0);
  const monthly: number[] = Array(6).fill(0);

  achievements.forEach((achievement) => {
    if (achievement.unlockedAt) {
      const unlockDate = new Date(achievement.unlockedAt);
      const daysDiff = Math.floor((now.getTime() - unlockDate.getTime()) / (1000 * 60 * 60 * 24));

      // Daily trend (last 7 days)
      if (daysDiff < 7) {
        daily[daysDiff]++;
      }

      // Weekly trend (last 4 weeks)
      if (daysDiff < 28) {
        weekly[Math.floor(daysDiff / 7)]++;
      }

      // Monthly trend (last 6 months)
      if (daysDiff < 180) {
        monthly[Math.floor(daysDiff / 30)]++;
      }
    }
  });

  return { daily, weekly, monthly };
}

export function getAchievementRecommendations(achievements: Achievement[]): Achievement[] {
  return achievements
    .filter((a) => !a.completed && a.progress > 0)
    .sort((a, b) => {
      // Sort by progress percentage
      const aProgress = a.progress / a.target;
      const bProgress = b.progress / b.target;
      return bProgress - aProgress;
    })
    .slice(0, 3);
}

export function getAchievementMilestones(achievements: Achievement[]): {
  nextMilestone: number;
  progressToNext: number;
} {
  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter((a) => a.completed).length;
  const milestones = [10, 25, 50, 100, 250, 500, 1000];

  const nextMilestone = milestones.find((m) => m > completedAchievements) || milestones[milestones.length - 1];
  const progressToNext = (completedAchievements / nextMilestone) * 100;

  return {
    nextMilestone,
    progressToNext,
  };
} 