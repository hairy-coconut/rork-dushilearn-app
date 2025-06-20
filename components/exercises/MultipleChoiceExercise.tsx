import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '../constants/colors';
import { typography, getTextStyle } from '../constants/typography';

interface MultipleChoiceExerciseProps {
  question: string;
  options: string[];
  selectedAnswer?: string;
  correctAnswer: string;
  showExplanation: boolean;
  onSelectAnswer: (answer: string) => void;
  explanation?: string;
}

export default function MultipleChoiceExercise({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  showExplanation,
  onSelectAnswer,
  explanation,
}: MultipleChoiceExerciseProps) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Trigger animations when showExplanation changes
  useEffect(() => {
    if (showExplanation) {
      const isCorrect = selectedAnswer === correctAnswer;
      
      if (isCorrect) {
        // Correct answer: bounce and haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Wrong answer: shake and haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [showExplanation]);
  const getOptionStyle = (option: string) => {
    if (!showExplanation) {
      return selectedAnswer === option ? styles.selectedOption : styles.option;
    }

    if (option === correctAnswer) {
      return styles.correctOption;
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return styles.incorrectOption;
    }

    return styles.option;
  };

  const getOptionIcon = (option: string) => {
    if (!showExplanation) return null;

    if (option === correctAnswer) {
      return <MaterialCommunityIcons name="check-circle" size={24} color="#34C759" />;
    }

    if (option === selectedAnswer && option !== correctAnswer) {
      return <MaterialCommunityIcons name="close-circle" size={24} color="#FF3B30" />;
    }

    return null;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [
            { translateX: shakeAnim },
            { scale: bounceAnim }
          ]
        }
      ]}
    >
      <Text style={styles.question}>{question}</Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Animated.View
            key={index}
            style={[
              styles.optionButton,
              getOptionStyle(option),
              option === selectedAnswer && showExplanation && {
                transform: [{ scale: option === correctAnswer ? 1.02 : 0.98 }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.optionTouchable}
              onPress={() => onSelectAnswer(option)}
              disabled={showExplanation}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionText,
                  selectedAnswer === option && showExplanation && option === correctAnswer && styles.correctText,
                  selectedAnswer === option && showExplanation && option !== correctAnswer && styles.incorrectText,
                ]}>
                  {option}
                </Text>
                {getOptionIcon(option)}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {showExplanation && explanation && (
        <Animated.View 
          style={[
            styles.explanationContainer,
            { opacity: fadeAnim }
          ]}
        >
          <MaterialCommunityIcons 
            name="lightbulb-outline" 
            size={20} 
            color={Colors.accent} 
            style={styles.explanationIcon}
          />
          <Text style={styles.explanationText}>{explanation}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    ...typography.lesson.question,
    color: Colors.text,
    marginBottom: 28,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTouchable: {
    width: '100%',
  },
  option: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.primary,
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.success,
  },
  incorrectOption: {
    backgroundColor: '#FFE8E8',
    borderColor: Colors.error,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  optionText: {
    ...typography.lesson.option,
    color: Colors.text,
    flex: 1,
  },
  correctText: {
    color: Colors.success,
    fontWeight: '600',
  },
  incorrectText: {
    color: Colors.error,
    fontWeight: '600',
  },
  explanationContainer: {
    marginTop: 28,
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  explanationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  explanationText: {
    ...typography.lesson.explanation,
    color: Colors.text,
    flex: 1,
  },
}); 