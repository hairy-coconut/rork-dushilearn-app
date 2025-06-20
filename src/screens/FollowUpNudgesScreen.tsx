import React from 'react';
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

const NUDGES = [
  {
    title: 'Phrase of the Day',
    message: 'Learn a new phrase every day and impress the locals!',
    cta: 'Learn Now',
  },
  {
    title: 'Don't break your Dushi streak!',
    message: 'Keep your learning momentum going with daily lessons.',
    cta: 'Continue Learning',
  },
  {
    title: 'Coconut Coin Milestone',
    message: 'You've earned bonus Coconut Coins! Use them to unlock premium content.',
    cta: 'Claim Reward',
  },
  {
    title: 'Time-Limited Promo',
    message: 'Unlock Premium this week and get the printable phrasebook free!',
    cta: 'Upgrade Now',
  },
];

export default function FollowUpNudgesScreen({ onDismiss }: { onDismiss: () => void }) {
  return (
    <LinearGradient
      colors={[colors.aqua, colors.coral, colors.banana]}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {NUDGES.map((nudge, index) => (
          <View key={index} style={styles.nudgeContainer}>
            <Text style={styles.header}>{nudge.title}</Text>
            <Text style={styles.message}>{nudge.message}</Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>{nudge.cta}</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>Dismiss</Text>
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
  nudgeContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.base,
  },
  header: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['2xl'],
    color: colors.jungle,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  message: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.base,
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
  dismissButton: {
    marginTop: spacing.xl,
  },
  dismissButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.surface,
  },
}); 