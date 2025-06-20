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
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const { width } = Dimensions.get('window');

const QUIZ_QUESTION = {
  question: 'How do you say "Hello" in Papiamento?',
  options: [
    { key: 'a', text: 'Bon dia' },
    { key: 'b', text: 'Bon tardi' },
    { key: 'c', text: 'Bon nochi' },
    { key: 'd', text: 'Bon bini' },
  ],
  correctAnswer: 'a',
};

export default function PlacementQuizScreen({ onComplete }: { onComplete: () => void }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const fadeAnim = new Animated.Value(1);

  const handleOptionSelect = (optionKey: string) => {
    setSelectedOption(optionKey);
    const correct = optionKey === QUIZ_QUESTION.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <LinearGradient
      colors={[colors.aqua, colors.coral, colors.banana]}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Quick Quiz</Text>
        <Text style={styles.question}>{QUIZ_QUESTION.question}</Text>
        <View style={styles.optionsContainer}>
          {QUIZ_QUESTION.options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.optionButton,
                selectedOption === option.key && styles.selectedOption,
                selectedOption && option.key === QUIZ_QUESTION.correctAnswer && styles.correctOption,
                selectedOption && selectedOption === option.key && selectedOption !== QUIZ_QUESTION.correctAnswer && styles.incorrectOption,
              ]}
              onPress={() => handleOptionSelect(option.key)}
              disabled={selectedOption !== null}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {showFeedback && (
          <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
            <Mascot
              type={isCorrect ? 'lora' : 'coco'}
              expression={isCorrect ? 'excited' : 'thinking'}
              size="medium"
              floating
            />
            <Text style={styles.feedbackText}>
              {isCorrect ? 'Correct! 🎉' : 'Not quite, but you\'ll get it next time!'}
            </Text>
          </Animated.View>
        )}
      </View>
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
  title: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['3xl'],
    color: colors.surface,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  question: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.surface,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  optionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
    ...shadows.base,
  },
  selectedOption: {
    backgroundColor: colors.jungle,
  },
  correctOption: {
    backgroundColor: colors.jungle,
  },
  incorrectOption: {
    backgroundColor: colors.coral,
  },
  optionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  feedbackText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.surface,
    marginTop: spacing.base,
    textAlign: 'center',
  },
}); 