import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FillInBlankExerciseProps {
  question: string;
  correctAnswer: string;
  showExplanation: boolean;
  onSelectAnswer: (answer: string) => void;
  explanation?: string;
  placeholder?: string;
}

export default function FillInBlankExercise({
  question,
  correctAnswer,
  showExplanation,
  onSelectAnswer,
  explanation,
  placeholder = 'Type your answer here...',
}: FillInBlankExerciseProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onSelectAnswer(answer.trim());
    }
  };

  const isCorrect = answer.trim().toLowerCase() === correctAnswer.toLowerCase();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            showExplanation && isCorrect && styles.correctInput,
            showExplanation && !isCorrect && styles.incorrectInput,
          ]}
          value={answer}
          onChangeText={setAnswer}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          editable={!showExplanation}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
        />
        {!showExplanation && (
          <TouchableOpacity
            style={[styles.submitButton, !answer.trim() && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!answer.trim()}
          >
            <MaterialCommunityIcons name="check" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {showExplanation && (
        <>
          <View style={styles.feedbackContainer}>
            <MaterialCommunityIcons
              name={isCorrect ? 'check-circle' : 'close-circle'}
              size={24}
              color={isCorrect ? '#34C759' : '#FF3B30'}
            />
            <Text style={styles.feedbackText}>
              {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${correctAnswer}`}
            </Text>
          </View>

          {explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}
        </>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  correctInput: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  incorrectInput: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  submitButton: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  feedbackText: {
    fontSize: 16,
    color: '#000',
  },
  explanationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  explanationText: {
    fontSize: 16,
    color: '#000',
  },
}); 