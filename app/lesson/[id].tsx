import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { categories } from '../../constants/lessons';
import { exerciseSets } from '../../constants/exercises';
import ExerciseCard from '../../components/ExerciseCard';
import ProgressBar from '../../components/ProgressBar';
import { useProgressStore } from '../../store/progressStore';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import MascotMessage from '../../components/MascotMessage';
import ConfettiEffect from '../../components/ConfettiEffect';
import BadgeItem from '../../components/BadgeItem';
import { useBadgeStore } from '../../store/badgeStore';
import ComboDisplay from '../../components/ComboDisplay';
import ComboCelebration from '../../components/ComboCelebration';
import { comboManager, ComboState, COMBO_TIERS } from '../../utils/comboSystem';
import { xpBoostManager } from '../../utils/xpBoosts';
import { mascotPersonalityManager } from '../../utils/mascotPersonality';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  // Gamification states
  const [comboState, setComboState] = useState<ComboState | null>(null);
  const [xpMultiplier, setXpMultiplier] = useState(1);
  const [showComboDisplay, setShowComboDisplay] = useState(false);
  const [showComboCelebration, setShowComboCelebration] = useState(false);
  const [comboCelebrationData, setComboCelebrationData] = useState<any>(null);
  
  // Find the lesson data
  const lessonData = categories
    .flatMap(category => category.lessons)
    .find(lesson => lesson.id === id);
  
  // Get exercises for this lesson
  const exercises = exerciseSets[id as string]?.exercises || [];
  
  // Calculate progress
  const progress = exercises.length > 0 ? currentExerciseIndex / exercises.length : 0;
  
  // Load user preferences and initialize gamification systems
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferredMascot = await AsyncStorage.getItem('preferred_mascot');
        if (preferredMascot) {
          setMascotType(preferredMascot as 'coco' | 'lora');
        }
        
        // Initialize gamification systems
        const combo = await comboManager.loadComboState();
        setComboState(combo);
        
        const boostMultiplier = xpBoostManager.getCurrentMultiplier();
        setXpMultiplier(boostMultiplier);
        
        await mascotPersonalityManager.loadMascotState();
        
        // Show mascot message at the beginning
        setShowMascot(true);
        setShowComboDisplay(true);
        
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
  
  const handleAnswer = async (isCorrect: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        isCorrect 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Error
      );
    }
    
    let earnedXP = 0;
    
    if (isCorrect) {
      // Handle combo system
      const comboResult = await comboManager.recordCorrectAnswer();
      setComboState(comboResult.comboState);
      
      // Show combo celebration if tier changed
      if (comboResult.tierUp) {
        setComboCelebrationData({
          previousTier: comboResult.previousTier,
          currentTier: comboResult.currentTier,
          combo: comboResult.comboState.currentCombo,
        });
        setShowComboCelebration(true);
        
        setTimeout(() => {
          setShowComboCelebration(false);
        }, 3000);
      }
      
      // Calculate XP with combo and boost multipliers
      const boostedXP = await xpBoostManager.calculateBoostedXP(comboResult.bonusXP);
      earnedXP = boostedXP;
      setScore(prev => prev + earnedXP);
      
      // Record positive interaction with mascot
      await mascotPersonalityManager.recordInteraction(mascotType, true);
    } else {
      // Reset combo on incorrect answer
      const newComboState = await comboManager.recordIncorrectAnswer();
      setComboState(newComboState);
      
      // Record interaction but not positive
      await mascotPersonalityManager.recordInteraction(mascotType, false);
    }
    
    // Move to next exercise or complete lesson
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      
      // Use lesson-based boosts
      await xpBoostManager.useBoostForLesson();
      setXpMultiplier(xpBoostManager.getCurrentMultiplier());
      
      // Smart mascot showing based on relationship and context
      const shouldShow = mascotPersonalityManager.shouldShowMascot(
        isCorrect ? 'correct_answer' : 'wrong_answer'
      );
      
      if (shouldShow) {
        const personalizedMessage = mascotPersonalityManager.getPersonalizedMessage(
          isCorrect ? 'correct_answer' : 'wrong_answer',
          {
            recentPerformance: isCorrect ? 'good' : 'struggling',
            timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                      new Date().getHours() < 18 ? 'afternoon' : 'evening'
          }
        );
        
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
      const finalScore = score + earnedXP;
      const newBadges = completeLesson(id as string, finalScore, exercises.length);
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
        
        {/* Combo display */}
        {showComboDisplay && comboState && (
          <ComboDisplay 
            comboState={comboState}
            visible={showComboDisplay}
          />
        )}
        
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
              {comboState && comboState.currentCombo > 0 && (
                <Text style={styles.comboBonus}>
                  🔥 {comboState.currentCombo}x Combo! 
                  {xpMultiplier > 1 && ` (${xpMultiplier.toFixed(1)}x Boost)`}
                </Text>
              )}
              
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
        
        {/* Combo celebration */}
        {showComboCelebration && comboCelebrationData && (
          <ComboCelebration 
            visible={showComboCelebration}
            tier={comboCelebrationData.currentTier}
            combo={comboCelebrationData.combo}
            bonusXP={score * 0.2} // Estimate bonus XP
            onComplete={() => setShowComboCelebration(false)}
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
    marginBottom: 12,
  },
  comboBonus: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
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