import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getDailyGoal, adjustDailyGoal, DailyGoalProgress } from '@/utils/dailyGoals';
import DailyGoalCard from '@/components/DailyGoalCard';
import Colors from '@/constants/colors';

const DAILY_GOAL_OPTIONS = [
  { label: 'Casual', xp: 20 },
  { label: 'Regular', xp: 50 },
  { label: 'Serious', xp: 100 },
  { label: 'Intense', xp: 200 },
];

export default function DailyGoalsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<DailyGoalProgress | null>(null);
  const [showGoalOptions, setShowGoalOptions] = useState(false);

  useEffect(() => {
    loadDailyGoal();
  }, []);

  const loadDailyGoal = async () => {
    try {
      const goalProgress = await getDailyGoal();
      setProgress(goalProgress);
    } catch (error) {
      console.error('Error loading daily goal:', error);
      Alert.alert('Error', 'Failed to load daily goal');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowGoalOptions(!showGoalOptions);
  };

  const handleSelectGoal = async (xp: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await adjustDailyGoal(xp);
      await loadDailyGoal();
      setShowGoalOptions(false);
    } catch (error) {
      console.error('Error adjusting daily goal:', error);
      Alert.alert('Error', 'Failed to adjust daily goal');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Goals</Text>
      </View>

      <ScrollView style={styles.content}>
        {progress && (
          <DailyGoalCard
            progress={progress}
            onAdjustGoal={handleAdjustGoal}
          />
        )}

        {/* Goal Options */}
        {showGoalOptions && (
          <View style={styles.goalOptions}>
            <Text style={styles.sectionTitle}>Select Daily Goal</Text>
            {DAILY_GOAL_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.xp}
                style={[
                  styles.goalOption,
                  progress?.dailyGoal.targetXP === option.xp && styles.selectedGoal,
                ]}
                onPress={() => handleSelectGoal(option.xp)}
              >
                <View style={styles.goalInfo}>
                  <Text style={styles.goalLabel}>{option.label}</Text>
                  <Text style={styles.goalXP}>{option.xp} XP</Text>
                </View>
                {progress?.dailyGoal.targetXP === option.xp && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Streak Info */}
        <View style={styles.streakInfo}>
          <Text style={styles.sectionTitle}>Streak Multipliers</Text>
          <View style={styles.multiplierList}>
            <View style={styles.multiplierItem}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF9500" />
              <Text style={styles.multiplierText}>3 days: 1.2x XP</Text>
            </View>
            <View style={styles.multiplierItem}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF9500" />
              <Text style={styles.multiplierText}>7 days: 1.5x XP</Text>
            </View>
            <View style={styles.multiplierItem}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF9500" />
              <Text style={styles.multiplierText}>14 days: 2.0x XP</Text>
            </View>
            <View style={styles.multiplierItem}>
              <MaterialCommunityIcons name="fire" size={20} color="#FF9500" />
              <Text style={styles.multiplierText}>30 days: 2.5x XP</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Complete your daily goal to maintain your streak
            </Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Longer streaks give you more XP and rewards
            </Text>
          </View>
          <View style={styles.tipItem}>
            <MaterialCommunityIcons name="lightbulb" size={20} color="#FFD700" />
            <Text style={styles.tipText}>
              Use streak freezes to protect your streak
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  goalOptions: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  goalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedGoal: {
    backgroundColor: '#E8F0FE',
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  goalXP: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  streakInfo: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  multiplierList: {
    gap: 12,
  },
  multiplierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  multiplierText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  tipsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
  },
}); 