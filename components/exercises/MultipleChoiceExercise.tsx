import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionButton, getOptionStyle(option)]}
            onPress={() => onSelectAnswer(option)}
            disabled={showExplanation}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>{option}</Text>
              {getOptionIcon(option)}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showExplanation && explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  incorrectOption: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  explanationContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  explanationText: {
    fontSize: 16,
    color: '#000',
  },
}); 