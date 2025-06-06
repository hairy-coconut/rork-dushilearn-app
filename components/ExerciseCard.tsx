import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { Exercise } from '@/constants/exercises';
import AudioButton from './AudioButton';
import { wordAudios } from '@/constants/audio';

type ExerciseCardProps = {
  exercise: Exercise;
  onAnswer: (isCorrect: boolean) => void;
};

export default function ExerciseCard({ exercise, onAnswer }: ExerciseCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Find audio for this exercise question if available
  const findAudio = () => {
    const lessonId = exercise.lessonId;
    if (!lessonId || !wordAudios[lessonId]) return null;
    
    // Try to find a matching word from our audio database
    const questionWord = exercise.questionWord || '';
    return wordAudios[lessonId].find(audio => 
      audio.word.toLowerCase() === questionWord.toLowerCase() ||
      exercise.question.includes(audio.word)
    );
  };
  
  const audioData = findAudio();
  
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === exercise.correctAnswer;
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 1500);
  };
  
  const renderMultipleChoice = () => {
    return (
      <View style={styles.optionsContainer}>
        {exercise.options?.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === exercise.correctAnswer;
          
          let backgroundColor = Colors.card;
          if (showFeedback) {
            if (isSelected && isCorrect) {
              backgroundColor = Colors.success;
            } else if (isSelected && !isCorrect) {
              backgroundColor = Colors.error;
            } else if (isCorrect) {
              backgroundColor = Colors.success;
            }
          } else if (isSelected) {
            backgroundColor = Colors.primary;
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, { backgroundColor }]}
              onPress={() => handleSelectAnswer(option)}
              disabled={showFeedback}
            >
              <Text 
                style={[
                  styles.optionText, 
                  isSelected || (showFeedback && isCorrect) ? styles.selectedOptionText : null
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  const renderTranslation = () => {
    // Simplified translation exercise - just showing options
    const options = [
      exercise.correctAnswer,
      "Wrong answer 1",
      "Wrong answer 2",
      "Wrong answer 3"
    ].sort(() => Math.random() - 0.5);
    
    return (
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === exercise.correctAnswer;
          
          let backgroundColor = Colors.card;
          if (showFeedback) {
            if (isSelected && isCorrect) {
              backgroundColor = Colors.success;
            } else if (isSelected && !isCorrect) {
              backgroundColor = Colors.error;
            } else if (isCorrect) {
              backgroundColor = Colors.success;
            }
          } else if (isSelected) {
            backgroundColor = Colors.primary;
          }
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, { backgroundColor }]}
              onPress={() => handleSelectAnswer(option)}
              disabled={showFeedback}
            >
              <Text 
                style={[
                  styles.optionText, 
                  isSelected || (showFeedback && isCorrect) ? styles.selectedOptionText : null
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{exercise.question}</Text>
        {audioData && (
          <AudioButton audioUrl={audioData.audioUrl} />
        )}
      </View>
      
      {exercise.translation && (
        <Text style={styles.translation}>{exercise.translation}</Text>
      )}
      
      {exercise.type === 'multiple-choice' && renderMultipleChoice()}
      {exercise.type === 'translation' && renderTranslation()}
      
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={[
            styles.feedback,
            selectedAnswer === exercise.correctAnswer ? styles.correctFeedback : styles.incorrectFeedback
          ]}>
            {selectedAnswer === exercise.correctAnswer ? "Correct!" : `Correct answer: ${exercise.correctAnswer}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  translation: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  optionsContainer: {
    marginTop: 16,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '500',
  },
  feedbackContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
  },
  feedback: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  correctFeedback: {
    color: Colors.success,
  },
  incorrectFeedback: {
    color: Colors.error,
  },
});