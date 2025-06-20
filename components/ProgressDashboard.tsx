import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserProgress, Achievement } from '../constants/types';
import { getProgress } from '../utils/progressTracking';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

export default function ProgressDashboard() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const userProgress = await getProgress();
    setProgress(userProgress);
  };

  if (!progress) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading progress...</Text>
      </View>
    );
  }

  const calculateLevelProgress = () => {
    const currentLevelExp = Math.floor(100 * Math.pow(1.5, progress.level - 1));
    const nextLevelExp = Math.floor(100 * Math.pow(1.5, progress.level));
    const progressPercent = ((progress.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(100, Math.max(0, progressPercent));
  };

  const renderAchievement = (achievement: Achievement) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        { borderColor: getAchievementColor(achievement.rarity) },
      ]}
    >
      <MaterialCommunityIcons
        name={achievement.icon as any}
        size={24}
        color={getAchievementColor(achievement.rarity)}
      />
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
      </View>
      {achievement.unlockedAt && (
        <MaterialCommunityIcons
          name="check-circle"
          size={20}
          color={Colors.success}
        />
      )}
    </View>
  );

  const getAchievementColor = (rarity: string) => {
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
        return Colors.text;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Level Progress */}
      <View style={styles.levelContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.primary + '80']}
          style={styles.levelCard}
        >
          <Text style={styles.levelTitle}>Level {progress.level}</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${calculateLevelProgress()}%` },
              ]}
            />
          </View>
          <Text style={styles.experienceText}>
            {progress.experience} / {Math.floor(100 * Math.pow(1.5, progress.level))} XP
          </Text>
        </LinearGradient>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{progress.streak.current}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="trophy" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{progress.streak.longest}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="book" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{progress.statistics.totalLessonsCompleted}</Text>
          <Text style={styles.statLabel}>Lessons</Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        {progress.achievements.map(renderAchievement)}
      </View>
    </ScrollView>
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
  levelContainer: {
    padding: 16,
  },
  levelCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  experienceText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
  achievementsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
}); 