import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DailyGoalProgress } from '@/utils/dailyGoals';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface DailyGoalCardProps {
  progress: DailyGoalProgress;
  onAdjustGoal?: () => void;
}

export default function DailyGoalCard({ progress, onAdjustGoal }: DailyGoalCardProps) {
  const [progressAnim] = useState(new Animated.Value(0));
  const [streakAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(progressAnim, {
        toValue: progress.progress,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }),
      Animated.spring(streakAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [progress]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onAdjustGoal) onAdjustGoal();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons name="target" size={24} color="#fff" />
          <Text style={styles.title}>Daily Goal</Text>
        </View>
        <View style={styles.streakContainer}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF9500" />
          <Text style={styles.streakText}>
            {progress.dailyGoal.streakBonus}x
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Progress Info */}
      <View style={styles.infoContainer}>
        <View style={styles.xpInfo}>
          <Text style={styles.xpText}>
            {progress.dailyGoal.currentXP} / {progress.dailyGoal.targetXP} XP
          </Text>
          <Text style={styles.remainingText}>
            {progress.remainingXP} XP remaining
          </Text>
        </View>

        {/* Rewards */}
        <Animated.View
          style={[
            styles.rewardsContainer,
            {
              opacity: streakAnim,
              transform: [
                {
                  translateY: streakAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.rewardItem}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.rewardText}>
              +{progress.nextReward.xp} XP
            </Text>
          </View>
          <View style={styles.rewardItem}>
            <MaterialCommunityIcons name="coin" size={16} color="#FFD700" />
            <Text style={styles.rewardText}>
              +{progress.nextReward.coins} coins
            </Text>
          </View>
          {progress.dailyGoal.rewards.streakFreeze && (
            <View style={styles.rewardItem}>
              <MaterialCommunityIcons name="shield" size={16} color="#4CAF50" />
              <Text style={styles.rewardText}>Streak Freeze</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  infoContainer: {
    padding: 16,
  },
  xpInfo: {
    marginBottom: 12,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  remainingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  rewardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
}); 