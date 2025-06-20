import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';
import { getCurrentUser } from '@/utils/auth';
import { getNextLesson } from '@/utils/learningPaths';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
}

export default function LessonCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);

  const accuracy = Number(params.accuracy);
  const timeSpent = Number(params.timeSpent);
  const perfectStreak = Number(params.perfectStreak);
  const unlockedAchievements = JSON.parse(params.unlockedAchievements as string) as Achievement[];

  useEffect(() => {
    loadNextLesson();
    playSuccessSound();
    triggerAnimations();
    triggerHapticFeedback();
  }, []);

  const loadNextLesson = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const next = await getNextLesson(params.lessonId as string);
      setNextLesson(next);
    } catch (error) {
      console.error('Error loading next lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/success.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const triggerAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConfetti(true);
    });
  };

  const triggerHapticFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getAccuracyColor = () => {
    if (accuracy >= 90) return '#4CAF50';
    if (accuracy >= 70) return '#FFC107';
    return '#FF5252';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleContinue = () => {
    if (nextLesson) {
      router.push(`/lesson?id=${nextLesson.id}`);
    } else {
      router.push('/learning-paths');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.gradient}
      />

      <ScrollView style={styles.content}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ],
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color="#4CAF50"
            />
          </View>

          {/* Lesson Complete Text */}
          <Text style={styles.title}>Lesson Complete!</Text>
          <Text style={styles.subtitle}>Great job! Keep up the good work!</Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="target"
                size={24}
                color={getAccuracyColor()}
              />
              <Text style={styles.statValue}>{accuracy.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#4A90E2"
              />
              <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color="#FF9800"
              />
              <Text style={styles.statValue}>{perfectStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>

          {/* Achievements */}
          {unlockedAchievements.length > 0 && (
            <View style={styles.achievementsContainer}>
              <Text style={styles.sectionTitle}>Achievements Unlocked!</Text>
              {unlockedAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <MaterialCommunityIcons
                    name={achievement.icon as any}
                    size={32}
                    color="#FFD700"
                  />
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                  </View>
                  <Text style={styles.achievementXP}>+{achievement.xp} XP</Text>
                </View>
              ))}
            </View>
          )}

          {/* Next Lesson */}
          {nextLesson && (
            <View style={styles.nextLessonContainer}>
              <Text style={styles.sectionTitle}>Next Lesson</Text>
              <TouchableOpacity
                style={styles.nextLessonCard}
                onPress={handleContinue}
              >
                <View style={styles.nextLessonInfo}>
                  <Text style={styles.nextLessonTitle}>{nextLesson.title}</Text>
                  <Text style={styles.nextLessonDescription}>
                    {nextLesson.description}
                  </Text>
                  <View style={styles.nextLessonMeta}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={16}
                        color="#8E8E93"
                      />
                      <Text style={styles.metaText}>
                        {nextLesson.estimatedTime} min
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="book-open-page-variant"
                        size={16}
                        color="#8E8E93"
                      />
                      <Text style={styles.metaText}>
                        {nextLesson.exercises?.length || 0} exercises
                      </Text>
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push(`/lesson-review?id=${params.lessonId}`)}
        >
          <MaterialCommunityIcons name="book-open-variant" size={20} color="#4A90E2" />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Review Lesson</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            {nextLesson ? 'Next Lesson' : 'Back to Learning Paths'}
          </Text>
          <MaterialCommunityIcons
            name={nextLesson ? 'arrow-right' : 'arrow-left'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  achievementsContainer: {
    marginBottom: 32,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  achievementXP: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  nextLessonContainer: {
    marginBottom: 32,
  },
  nextLessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  nextLessonInfo: {
    flex: 1,
  },
  nextLessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  nextLessonDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  nextLessonMeta: {
    flexDirection: 'row',
    marginTop: 8,
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#4A90E2',
  },
  primaryButtonText: {
    color: '#fff',
  },
}); 