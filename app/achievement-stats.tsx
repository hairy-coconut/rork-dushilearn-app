import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import Colors from '@/constants/colors';
import { AchievementStats, getAchievementStats, getAchievementProgressTrend, getAchievementRecommendations, getAchievementMilestones } from '@/utils/achievementStats';
import { Achievement } from '@/utils/achievements';

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'all';

export default function AchievementStatsScreen() {
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('all');
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, [selectedTimeframe]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await getAchievementStats(selectedTimeframe);
      setStats(data);
      
      // Load trends data
      const trendsData = await getAchievementProgressTrend(selectedTimeframe);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading achievement stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700';
      case 'epic':
        return '#9370DB';
      case 'rare':
        return '#4169E1';
      case 'uncommon':
        return '#32CD32';
      default:
        return Colors.primary;
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'lesson':
        return 'book-open';
      case 'streak':
        return 'fire';
      case 'milestone':
        return 'trophy';
      case 'social':
        return 'account-group';
      case 'special':
        return 'star';
      case 'collection':
        return 'collection';
      case 'challenge':
        return 'flag-checkered';
      default:
        return 'medal';
    }
  };

  const getTrendIcon = (trend: number): string => {
    if (trend > 0) return 'trending-up';
    if (trend < 0) return 'trending-down';
    return 'trending-neutral';
  };

  const getTrendColor = (trend: number): string => {
    if (trend > 0) return Colors.success;
    if (trend < 0) return Colors.error;
    return Colors.textSecondary;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!stats || !trends) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={Colors.error}
        />
        <Text style={styles.errorText}>Unable to load statistics</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Achievement Statistics',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
        }}
      />
      <ScrollView style={styles.container}>
        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          {(['daily', 'weekly', 'monthly', 'all'] as Timeframe[]).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive,
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === timeframe && styles.timeframeTextActive,
                ]}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Section with Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{stats.total}</Text>
              <Text style={styles.overviewLabel}>Total</Text>
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons
                  name={getTrendIcon(trends.total)}
                  size={16}
                  color={getTrendColor(trends.total)}
                />
                <Text style={[styles.trendText, { color: getTrendColor(trends.total) }]}>
                  {Math.abs(trends.total)}%
                </Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{stats.completed}</Text>
              <Text style={styles.overviewLabel}>Completed</Text>
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons
                  name={getTrendIcon(trends.completed)}
                  size={16}
                  color={getTrendColor(trends.completed)}
                />
                <Text style={[styles.trendText, { color: getTrendColor(trends.completed) }]}>
                  {Math.abs(trends.completed)}%
                </Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{stats.inProgress}</Text>
              <Text style={styles.overviewLabel}>In Progress</Text>
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons
                  name={getTrendIcon(trends.inProgress)}
                  size={16}
                  color={getTrendColor(trends.inProgress)}
                />
                <Text style={[styles.trendText, { color: getTrendColor(trends.inProgress) }]}>
                  {Math.abs(trends.inProgress)}%
                </Text>
              </View>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{stats.locked}</Text>
              <Text style={styles.overviewLabel}>Locked</Text>
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons
                  name={getTrendIcon(trends.locked)}
                  size={16}
                  color={getTrendColor(trends.locked)}
                />
                <Text style={[styles.trendText, { color: getTrendColor(trends.locked) }]}>
                  {Math.abs(trends.locked)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.completionRate}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {stats.completionRate.toFixed(1)}% Complete
            </Text>
          </View>
        </View>

        {/* Rarity Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rarity Distribution</Text>
          <View style={styles.distributionContainer}>
            {Object.entries(stats.byRarity).map(([rarity, count]) => (
              <View key={rarity} style={styles.distributionItem}>
                <View style={styles.distributionBar}>
                  <View
                    style={[
                      styles.distributionFill,
                      {
                        width: `${(count / stats.total) * 100}%`,
                        backgroundColor: getRarityColor(rarity),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.distributionLabel}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </Text>
                <Text style={styles.distributionValue}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Type Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type Distribution</Text>
          <View style={styles.typeGrid}>
            {Object.entries(stats.byType).map(([type, count]) => (
              <View key={type} style={styles.typeItem}>
                <MaterialCommunityIcons
                  name={getTypeIcon(type)}
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.typeLabel}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                <Text style={styles.typeValue}>{count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Unlocks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Unlocks</Text>
          {stats.recentUnlocks.achievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={styles.recentItem}
              onPress={() =>
                router.push({
                  pathname: '/achievement-detail',
                  params: { id: achievement.id },
                })
              }
            >
              <MaterialCommunityIcons
                name={achievement.icon}
                size={24}
                color={getRarityColor(achievement.rarity)}
              />
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle}>{achievement.title}</Text>
                <Text style={styles.recentDate}>
                  {new Date(achievement.unlockedAt!).toLocaleDateString()}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Rewards Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Rewards</Text>
          <View style={styles.rewardsGrid}>
            <View style={styles.rewardItem}>
              <MaterialCommunityIcons name="star" size={24} color={Colors.primary} />
              <Text style={styles.rewardValue}>{stats.totalRewards.xp}</Text>
              <Text style={styles.rewardLabel}>XP</Text>
            </View>
            <View style={styles.rewardItem}>
              <MaterialCommunityIcons name="coin" size={24} color={Colors.primary} />
              <Text style={styles.rewardValue}>{stats.totalRewards.coins}</Text>
              <Text style={styles.rewardLabel}>Coins</Text>
            </View>
            <View style={styles.rewardItem}>
              <MaterialCommunityIcons name="medal" size={24} color={Colors.primary} />
              <Text style={styles.rewardValue}>{stats.totalRewards.badges}</Text>
              <Text style={styles.rewardLabel}>Badges</Text>
            </View>
            <View style={styles.rewardItem}>
              <MaterialCommunityIcons name="palette" size={24} color={Colors.primary} />
              <Text style={styles.rewardValue}>{stats.totalRewards.themes}</Text>
              <Text style={styles.rewardLabel}>Themes</Text>
            </View>
          </View>
        </View>

        {/* Achievement Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Trends</Text>
          <View style={styles.trendsContainer}>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Completion Rate</Text>
              <View style={styles.trendValueContainer}>
                <Text style={styles.trendValue}>{trends.completionRate}%</Text>
                <MaterialCommunityIcons
                  name={getTrendIcon(trends.completionRate)}
                  size={16}
                  color={getTrendColor(trends.completionRate)}
                />
              </View>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Average Unlocks</Text>
              <View style={styles.trendValueContainer}>
                <Text style={styles.trendValue}>{trends.averageUnlocks}</Text>
                <MaterialCommunityIcons
                  name={getTrendIcon(trends.averageUnlocks)}
                  size={16}
                  color={getTrendColor(trends.averageUnlocks)}
                />
              </View>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>XP Earned</Text>
              <View style={styles.trendValueContainer}>
                <Text style={styles.trendValue}>{trends.xpEarned}</Text>
                <MaterialCommunityIcons
                  name={getTrendIcon(trends.xpEarned)}
                  size={16}
                  color={getTrendColor(trends.xpEarned)}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
  section: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  overviewLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  distributionContainer: {
    gap: 12,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
  },
  distributionLabel: {
    fontSize: 14,
    color: Colors.text,
    minWidth: 80,
  },
  distributionValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  typeItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  typeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  recentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  rewardItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  rewardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timeframeContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeframeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timeframeTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
  },
  trendsContainer: {
    gap: 12,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  trendLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
}); 