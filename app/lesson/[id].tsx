import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { categories } from '@/constants/lessons';
import { exerciseSets } from '@/constants/exercises';
import ExerciseCard from '@/components/ExerciseCard';
import ProgressBar from '@/components/ProgressBar';
import { useProgressStore } from '@/store/progressStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import MascotMessage from '@/components/MascotMessage';
import ConfettiEffect from '@/components/ConfettiEffect';
import BadgeItem from '@/components/BadgeItem';
import { useBadgeStore } from '@/store/badgeStore';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completeLesson } = useProgressStore();
  const { badges } = useBadgeStore();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showMascot, setShowMascot] = useState(false);
  const [mascotType, setMascotType] = useState<'coco' | 'lora'>('coco');
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  
  // Find the lesson data
  const lessonData = categories
    .flatMap(category => category.lessons)
    .find(lesson => lesson.id === id);
  
  // Get exercises for this lesson
  const exercises = exerciseSets[id as string]?.exercises || [];
  
  // Calculate progress
  const progress = exercises.length > 0 ? currentExerciseIndex / exercises.length : 0;
  
  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferredMascot = await AsyncStorage.getItem('preferred_mascot');
        if (preferredMascot) {
          setMascotType(preferredMascot as 'coco' | 'lora');
        }
        
        // Show mascot message at the beginning
        setShowMascot(true);
        
        // Hide mascot after 5 seconds
        setTimeout(() => {
          setShowMascot(false);
        }, 5000);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  const handleAnswer = (isCorrect: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        isCorrect 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Error
      );
    }
    
    if (isCorrect) {
      setScore(prev => prev + 10);
    }
    
    // Move to next exercise or complete lesson
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      
      // Randomly show mascot (20% chance)
      if (Math.random() < 0.2) {
        setShowMascot(true);
        
        // Hide mascot after 3 seconds
        setTimeout(() => {
          setShowMascot(false);
        }, 3000);
      }
    } else {
      setCompleted(true);
      setShowConfetti(true);
      
      // Award badges and XP
      const newBadges = completeLesson(id as string, score + (isCorrect ? 10 : 0), exercises.length);
      setEarnedBadges(newBadges);
      
      // Show mascot with congratulations
      setShowMascot(true);
    }
  };
  
  const handleFinish = () => {
    router.back();
  };
  
  if (!lessonData) {
    return (
      <View style={styles.container}>
        <Text>Lesson not found</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: lessonData.title,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            height={8}
            color={Colors.primary}
          />
        </View>
        
        {!completed ? (
          // Exercise view
          <View style={styles.exerciseContainer}>
            {exercises.length > 0 && currentExerciseIndex < exercises.length && (
              <ExerciseCard 
                exercise={exercises[currentExerciseIndex]} 
                onAnswer={handleAnswer}
              />
            )}
          </View>
        ) : (
          // Completion view
          <ScrollView 
            style={styles.completionContainer}
            contentContainerStyle={styles.completionContent}
          >
            <View style={styles.completionCard}>
              <View style={styles.completionIconContainer}>
                <MaterialIcons name="check" size={48} color="white" />
              </View>
              <Text style={styles.completionTitle}>Lesson Completed!</Text>
              <Text style={styles.completionScore}>You earned {score} XP</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{exercises.length}</Text>
                  <Text style={styles.statLabel}>Exercises</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{score / 10}</Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{exercises.length - (score / 10)}</Text>
                  <Text style={styles.statLabel}>Mistakes</Text>
                </View>
              </View>
              
              {earnedBadges.length > 0 && (
                <View style={styles.badgesContainer}>
                  <Text style={styles.badgesTitle}>Badges Earned!</Text>
                  <View style={styles.badgesList}>
                    {earnedBadges.map(badgeId => {
                      const badge = badges.find(b => b.id === badgeId);
                      if (badge) {
                        return (
                          <View key={badgeId} style={styles.badgePopAnim}>
                            <BadgeItem badge={badge} size="small" />
                          </View>
                        );
                      }
                      return null;
                    })}
                  </View>
                </View>
              )}
              
              {/* Motivational mascot message */}
              <View style={styles.mascotMotivationContainer}>
                <MascotMessage
                  type={mascotType}
                  lessonType={id as string}
                  message={
                    earnedBadges.includes('first_words') ?
                      'Bon trabou! You unlocked your first badge!' :
                    earnedBadges.includes('island_beginner') ?
                      'Wepa! You are now an Island Beginner!' :
                      'Great job! Keep going!'
                  }
                  autoHide={false}
                />
              </View>

              {/* Streak counter highlight */}
              <View style={styles.streakHighlightContainer}>
                <Text style={styles.streakHighlightText}>🔥 Streak: {useProgressStore.getState().streak} days</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.finishButton}
                onPress={handleFinish}
              >
                <Text style={styles.finishButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
        
        {/* Mascot message */}
        {showMascot && (
          <MascotMessage 
            type={mascotType}
            lessonType={id as string}
            onDismiss={() => setShowMascot(false)}
            autoHide={!completed}
          />
        )}
        
        {/* Confetti effect */}
        <ConfettiEffect 
          visible={showConfetti} 
          onComplete={() => setShowConfetti(false)} 
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  completionContainer: {
    flex: 1,
  },
  completionContent: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  completionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  completionScore: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  badgesContainer: {
    width: '100%',
    marginBottom: 24,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badgePopAnim: {
    transform: [{ scale: 1.15 }],
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    margin: 8,
  },
  mascotMotivationContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  streakHighlightContainer: {
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    borderRadius: 12,
    padding: 8,
  },
  streakHighlightText: {
    fontSize: 18,
    color: Colors.success,
    fontWeight: '700',
  },
  finishButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});