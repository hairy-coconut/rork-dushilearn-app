import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import ProgressBar from '../components/ProgressBar';
import LessonCard from '../components/LessonCard';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

const LESSONS = [
  {
    title: 'Island Greetings',
    description: 'Say hello like a local! 🌴',
    icon: 'hand-wave',
    level: 1,
    exerciseCount: 5,
    category: 'basics',
    isLocked: false,
  },
  {
    title: 'Beach & Sun Essentials',
    description: 'Everything for a day at the playa ☀️',
    icon: 'beach',
    level: 1,
    exerciseCount: 6,
    category: 'basics',
    isLocked: false,
  },
  {
    title: 'Ordering at the Snack Truck',
    description: 'Get your batido and pastechi! 🥤',
    icon: 'food',
    level: 2,
    exerciseCount: 7,
    category: 'phrases',
    isLocked: false,
  },
  {
    title: 'Getting Around the Island',
    description: 'Taxi, bus, or bike? Move like a local 🚕',
    icon: 'car',
    level: 2,
    exerciseCount: 5,
    category: 'phrases',
    isLocked: true,
  },
  {
    title: 'Simple Questions & Responses',
    description: 'Ask and answer with confidence 💬',
    icon: 'comment-question',
    level: 3,
    exerciseCount: 8,
    category: 'missions',
    isLocked: true,
  },
];

export default function HomeScreen() {
  const [streak, setStreak] = useState(3);
  const [xp, setXp] = useState(120);
  const [xpGoal, setXpGoal] = useState(150);
  const [showConfetti, setShowConfetti] = useState(false);
  const [todayGoalComplete, setTodayGoalComplete] = useState(false);
  const [mascot, setMascot] = useState<'coco' | 'lora'>('coco');

  // Calculate XP progress
  const xpProgress = Math.min(xp / xpGoal, 1);

  // Handle "Today's Goal" check-off
  const handleCheckGoal = () => {
    setTodayGoalComplete(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Handle "Continue Learning" CTA
  const handleContinueLearning = () => {
    // Navigate to next lesson or lesson screen
  };

  return (
    <LinearGradient
      colors={[colors.aqua, colors.coral, colors.banana]}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mascot Floating */}
        <View style={styles.mascotContainer}>
          <Mascot
            type={mascot}
            expression={todayGoalComplete ? 'excited' : 'happy'}
            size="large"
            floating
          />
        </View>

        {/* Streak Tracker */}
        <View style={styles.streakCard}>
          <View style={styles.streakRow}>
            <MaterialCommunityIcons name="fire" size={32} color={colors.coral} />
            <Text style={styles.streakText}>{streak} Day Streak</Text>
            {streak >= 2 && (
              <MaterialCommunityIcons
                name="fire"
                size={32}
                color={colors.banana}
                style={{ marginLeft: -16, marginRight: 4, transform: [{ rotate: '-10deg' }] }}
              />
            )}
          </View>
          <Text style={styles.streakSubtext}>
            {streak >= 3 ? 'You're on fire! 🔥' : 'Keep it up for a streak!'}
          </Text>
        </View>

        {/* XP Progress Bar */}
        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>XP Progress</Text>
          <ProgressBar
            progress={xpProgress}
            label={undefined}
            showPercentage
            color={colors.jungle}
            height={16}
            animated
            onComplete={() => {}}
          />
          <Text style={styles.xpValue}>{xp} / {xpGoal} XP</Text>
        </View>

        {/* Today's Goal CTA */}
        <TouchableOpacity
          style={[styles.goalCard, todayGoalComplete && styles.goalCardComplete]}
          onPress={handleCheckGoal}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name={todayGoalComplete ? 'check-circle' : 'star-circle'}
            size={32}
            color={todayGoalComplete ? colors.jungle : colors.banana}
          />
          <Text style={styles.goalText}>
            {todayGoalComplete ? 'Goal Complete! 🎉' : 'Today's Goal: 10 XP'}
          </Text>
        </TouchableOpacity>

        {/* Continue Learning CTA */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueLearning}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.aqua, colors.jungle]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue Learning</Text>
            <MaterialCommunityIcons name="arrow-right" size={24} color={colors.surface} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Lesson Cards */}
        <View style={styles.lessonSection}>
          <Text style={styles.sectionTitle}>Lessons</Text>
          {LESSONS.map((lesson, idx) => (
            <LessonCard
              key={lesson.title}
              {...lesson}
              onPress={() => {}}
              onPreview={() => {}}
            />
          ))}
        </View>
      </ScrollView>
      {/* Confetti overlay (placeholder, use Lottie or similar for real effect) */}
      {showConfetti && (
        <View style={styles.confettiOverlay}>
          <Text style={styles.confettiText}>🎉</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 80,
    paddingTop: 32,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  streakCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.base,
    alignItems: 'center',
    ...shadows.base,
    width: width - spacing.base * 2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize['2xl'],
    color: colors.coral,
    marginLeft: 8,
  },
  streakSubtext: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginTop: 2,
  },
  xpCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.base,
    width: width - spacing.base * 2,
    ...shadows.base,
  },
  xpLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.jungle,
    marginBottom: 4,
  },
  xpValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.jungle,
    marginTop: 4,
    textAlign: 'right',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.banana,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.base,
    width: width - spacing.base * 2,
    ...shadows.base,
  },
  goalCardComplete: {
    backgroundColor: colors.jungle,
  },
  goalText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginLeft: 12,
  },
  continueButton: {
    width: width - spacing.base * 2,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  continueText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.surface,
    marginRight: 8,
  },
  lessonSection: {
    width: width - spacing.base * 2,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['2xl'],
    color: colors.purple,
    marginBottom: spacing.base,
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  confettiText: {
    fontSize: 64,
    textAlign: 'center',
  },
}); 