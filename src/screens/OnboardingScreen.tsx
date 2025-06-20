import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Mascot from '../components/Mascot';
import PlacementQuizScreen from './PlacementQuizScreen';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

const GOALS = [
  { key: 'casual', label: 'Casual', xp: 10 },
  { key: 'regular', label: 'Regular', xp: 20 },
  { key: 'hardcore', label: 'Hardcore', xp: 50 },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const handleNext = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setStep(step + 1);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleGoalSelect = (goalKey: string) => {
    setSelectedGoal(goalKey);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleSkipQuiz = () => {
    onComplete();
  };

  const handleQuizComplete = () => {
    onComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome to DushiLearn!</Text>
            <Text style={styles.subtitle}>Meet your learning buddies:</Text>
            <View style={styles.mascotContainer}>
              <Mascot type="coco" expression="happy" size="large" floating />
              <Mascot type="lora" expression="excited" size="large" floating />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Set Your Daily Goal</Text>
            <Text style={styles.subtitle}>Choose how much you want to learn each day:</Text>
            {GOALS.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={[
                  styles.goalButton,
                  selectedGoal === goal.key && styles.selectedGoal,
                ]}
                onPress={() => handleGoalSelect(goal.key)}
              >
                <Text style={styles.goalText}>{goal.label} ({goal.xp} XP)</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.button, !selectedGoal && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!selectedGoal}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Ready to Start?</Text>
            <Text style={styles.subtitle}>Take a quick quiz to personalize your experience:</Text>
            <TouchableOpacity style={styles.button} onPress={handleStartQuiz}>
              <Text style={styles.buttonText}>Start Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkipQuiz}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  if (showQuiz) {
    return <PlacementQuizScreen onComplete={handleQuizComplete} />;
  }

  return (
    <LinearGradient
      colors={[colors.aqua, colors.coral, colors.banana]}
      style={styles.background}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {renderStep()}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  stepContainer: {
    alignItems: 'center',
    width: width - spacing.base * 2,
  },
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['3xl'],
    color: colors.surface,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  mascotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.jungle,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    ...shadows.base,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
  },
  goalButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
    width: '100%',
    ...shadows.base,
  },
  selectedGoal: {
    backgroundColor: colors.jungle,
  },
  goalText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  skipButton: {
    marginTop: spacing.base,
  },
  skipButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.surface,
  },
}); 