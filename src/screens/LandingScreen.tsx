import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

export default function LandingScreen({ onStartLearning }: { onStartLearning: () => void }) {
  const [email, setEmail] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);

  const handleSubmit = () => {
    // Validate email and proceed
    if (email) {
      onStartLearning();
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <LinearGradient
      colors={[colors.aqua, colors.coral, colors.banana]}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Learn 5 Local Phrases Free</Text>
        <Text style={styles.subheadline}>Turn cold traffic into loyal free users, then upsell to Premium and Elite with story-driven, island-vibed automation.</Text>
        <Text style={styles.socialProof}>Join thousands of island dreamers who've already started their journey!</Text>

        <View style={styles.emailContainer}>
          <TextInput
            style={styles.emailInput}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.quizButton} onPress={handleStartQuiz}>
          <Text style={styles.quizButtonText}>What kind of island speaker are you?</Text>
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
  subheadline: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  socialProof: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emailContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  emailInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.base,
  },
  submitButton: {
    backgroundColor: colors.jungle,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
  },
  quizButton: {
    marginTop: spacing.base,
  },
  quizButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.base,
    color: colors.surface,
  },
}); 