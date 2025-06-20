import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from './utils/supabase';
import { getCurrentUser } from './utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  MultipleChoiceExercise,
  FillInBlankExercise,
  MatchingExercise,
  ListeningExercise,
} from './components/exercises';

const { width } = Dimensions.get('window');

interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  answer: any;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: string;
}

interface Exercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'listening';
  question: string;
  options?: string[];
  pairs?: { id: string; left: string; right: string; }[];
  audioUrl?: string;
  correctAnswer: string | string[] | Record<string, string>;
  explanation?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  type: string;
  exercises: Exercise[];
  attempts: ExerciseAttempt[];
}

export default function LessonReviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState(true);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Load lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (lessonError) throw lessonError;

      // Load exercise attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exercise_attempts')
        .select('*')
        .eq('lessonId', id)
        .eq('userId', user.id)
        .order('timestamp', { ascending: false });

      if (attemptsError) throw attemptsError;

      setLesson({
        ...lessonData,
        attempts: attemptsData || [],
      });

      triggerAnimations();
    } catch (error) {
      console.error('Error loading lesson review:', error);
      Alert.alert('Error', 'Failed to load lesson review');
    } finally {
      setLoading(false);
    }
  };

  const triggerAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleExerciseSelect = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercise(index);
    setShowExplanation(true);
  };

  const getExerciseAttempt = (exerciseId: string) => {
    return lesson?.attempts.find(attempt => attempt.exerciseId === exerciseId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lesson review not found</Text>
      </View>
    );
  }

  const currentExercise = lesson.exercises[selectedExercise];
  const attempt = getExerciseAttempt(currentExercise.id);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.subtitle}>Lesson Review</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Exercise List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.exerciseList}
        >
          {lesson.exercises.map((exercise, index) => {
            const attempt = getExerciseAttempt(exercise.id);
            return (
              <TouchableOpacity
                key={exercise.id}
                style={[
                  styles.exerciseTab,
                  selectedExercise === index && styles.exerciseTabSelected,
                ]}
                onPress={() => handleExerciseSelect(index)}
              >
                <MaterialCommunityIcons
                  name={attempt?.isCorrect ? 'check-circle' : 'circle-outline'}
                  size={20}
                  color={attempt?.isCorrect ? '#4CAF50' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.exerciseTabText,
                    selectedExercise === index && styles.exerciseTabTextSelected,
                  ]}
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Exercise Content */}
        <ScrollView style={styles.exerciseContent}>
          <Animated.View
            style={[
              styles.exerciseContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {attempt && (
              <View style={styles.attemptInfo}>
                <View style={styles.attemptMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={16}
                      color="#8E8E93"
                    />
                    <Text style={styles.metaText}>
                      Time: {formatTime(attempt.timeSpent)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={16}
                      color="#8E8E93"
                    />
                    <Text style={styles.metaText}>
                      {formatDate(attempt.timestamp)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.resultBadge,
                    attempt.isCorrect
                      ? styles.resultBadgeCorrect
                      : styles.resultBadgeIncorrect,
                  ]}
                >
                  <Text style={styles.resultBadgeText}>
                    {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                  </Text>
                </View>
              </View>
            )}

            {renderExercise(currentExercise, attempt)}
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

function renderExercise(exercise: Exercise, attempt?: ExerciseAttempt) {
  switch (exercise.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceExercise
          question={exercise.question}
          options={exercise.options || []}
          selectedAnswer={attempt?.answer}
          correctAnswer={exercise.correctAnswer as string}
          showExplanation={true}
          onSelectAnswer={() => {}}
          explanation={exercise.explanation}
        />
      );
    case 'fill_blank':
      return (
        <FillInBlankExercise
          question={exercise.question}
          correctAnswer={exercise.correctAnswer as string}
          showExplanation={true}
          onSelectAnswer={() => {}}
          explanation={exercise.explanation}
        />
      );
    case 'matching':
      return (
        <MatchingExercise
          question={exercise.question}
          pairs={exercise.pairs || []}
          showExplanation={true}
          onSelectAnswer={() => {}}
          explanation={exercise.explanation}
        />
      );
    case 'listening':
      return (
        <ListeningExercise
          question={exercise.question}
          audioUrl={exercise.audioUrl || ''}
          correctAnswer={exercise.correctAnswer as string}
          showExplanation={true}
          onSelectAnswer={() => {}}
          explanation={exercise.explanation}
        />
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  exerciseList: {
    maxHeight: 60,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  exerciseTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  exerciseTabSelected: {
    backgroundColor: '#4A90E2',
  },
  exerciseTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 8,
  },
  exerciseTabTextSelected: {
    color: '#fff',
  },
  exerciseContent: {
    flex: 1,
    padding: 16,
  },
  exerciseContainer: {
    marginBottom: 16,
  },
  attemptInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  attemptMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultBadgeCorrect: {
    backgroundColor: '#E8F5E9',
  },
  resultBadgeIncorrect: {
    backgroundColor: '#FFEBEE',
  },
  resultBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 