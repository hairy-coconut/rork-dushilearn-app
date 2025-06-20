import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProgress } from '@/contexts/ProgressContext';
import Colors from '@/constants/colors';

export default function ProgressScreen() {
  const { progress, isLoading, error } = useProgress();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !progress) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={Colors.error} />
        <Text style={styles.errorText}>
          {error?.message || 'Failed to load progress'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Level and XP */}
      <View style={styles.levelCard}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level {progress.level}</Text>
          <Text style={styles.xpText}>{progress.experience} XP</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(progress.experience % 100) / 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <MaterialCommunityIcons name="fire" size={24} color={Colors.primary} />
        <View style={styles.streakInfo}>
          <Text style={styles.streakText}>{progress.streak.current} Day Streak</Text>
          <Text style={styles.streakSubtext}>
            Longest: {progress.streak.longest} days
          </Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="book-open" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{progress.statistics.totalLessonsCompleted}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>
              {Math.round(progress.statistics.totalPracticeTime / 60)}m
            </Text>
            <Text style={styles.statLabel}>Practice Time</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="star" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{progress.statistics.perfectLessons}</Text>
            <Text style={styles.statLabel}>Perfect</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="chart-line" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>
              {Math.round(progress.statistics.averageAccuracy)}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsCard}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsList}>
          {progress.achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <MaterialCommunityIcons
                name={getAchievementIcon(achievement.type)}
                size={24}
                color={getAchievementColor(achievement.rarity)}
              />
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityCard}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {progress.recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <MaterialCommunityIcons
                name={getActivityIcon(activity.type)}
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.activityText}>{activity.description}</Text>
              <Text style={styles.activityTime}>
                {new Date(activity.timestamp).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function getAchievementIcon(type: string): string {
  switch (type) {
    case 'lesson':
      return 'book-check';
    case 'streak':
      return 'fire';
    case 'special':
      return 'star';
    case 'milestone':
      return 'trophy';
    default:
      return 'medal';
  }
}

function getAchievementColor(rarity: string): string {
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
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'lesson':
      return 'book-open';
    case 'practice':
      return 'pencil';
    case 'achievement':
      return 'trophy';
    case 'streak':
      return 'fire';
    default:
      return 'information';
  }
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
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: Colors.error,
    textAlign: 'center',
  },
  levelCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  xpText: {
    fontSize: 18,
    color: Colors.text,
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
  streakCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakInfo: {
    marginLeft: 12,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  streakSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  achievementsCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  achievementInfo: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
}); 