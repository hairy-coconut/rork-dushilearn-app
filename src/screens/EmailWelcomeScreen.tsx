import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const WELCOME_STEPS = [
  {
    title: 'Welcome to the Island',
    message: 'Welcome to the Island! Learn why Papiamentu matters and meet Boy.',
    cta: 'Next',
  },
  {
    title: 'Lesson 1 is waiting!',
    message: 'Your first lesson is ready. Click the link to start learning!',
    cta: 'Start Lesson',
  },
  {
    title: 'Ever flirted in Papiamentu?',
    message: 'Discover how to charm locals with our Premium lessons.',
    cta: 'Upgrade to Premium',
  },
  {
    title: 'What NOT to say at the snack truck',
    message: 'Learn cultural nuances and avoid embarrassing moments.',
    cta: 'Learn More',
  },
  {
    title: 'Your Personal Island Guide Awaits',
    message: 'Unlock Elite features and practice with locals. Limited time offer!',
    cta: 'Join Elite Now',
  },
];

export default function EmailWelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = WELCOME_STEPS[currentStep];

  return (
    <LinearGradient
      colors={[colors.aqua, colors.coral, colors.banana]}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>{step.title}</Text>
        <Text style={styles.message}>{step.message}</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaButtonText}>{step.cta}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['4xl'],
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  message: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.jungle,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
  },
}); 