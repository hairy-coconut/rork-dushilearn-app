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
import { checkModulePrerequisites } from './utils/learningPaths';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Prerequisite {
  id: string;
  title: string;
  completed: boolean;
}

interface LearningObjective {
  id: string;
  description: string;
  icon: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  type: string;
  estimatedTime: number;
  prerequisites: Prerequisite[];
  objectives: LearningObjective[];
  exerciseCount: number;
  moduleId: string;
}

export default function LessonPreviewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [prerequisitesMet, setPrerequisitesMet] = useState(false);
  const [checkingPrerequisites, setCheckingPrerequisites] = useState(true);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          module:modules(id, title)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the data to match our interface
      const transformedLesson: Lesson = {
        ...data,
        prerequisites: data.prerequisites || [],
        objectives: data.objectives || [],
        exerciseCount: data.exercises?.length || 0,
      };

      setLesson(transformedLesson);
      checkPrerequisites(transformedLesson);
      triggerAnimations();
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const checkPrerequisites = async (lesson: Lesson) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const met = await checkModulePrerequisites(lesson.moduleId);
      setPrerequisitesMet(met);
    } catch (error) {
      console.error('Error checking prerequisites:', error);
    } finally {
      setCheckingPrerequisites(false);
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

  const handleStartLesson = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/lesson?id=${id}`);
  };

  const handleBack = () => {
    router.back();
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
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

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
          onPress={handleBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.level}>{lesson.level}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>{lesson.description}</Text>
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={20}
                  color="#4A90E2"
                />
                <Text style={styles.metaText}>
                  {lesson.estimatedTime} minutes
                </Text>
              </View>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={20}
                  color="#4A90E2"
                />
                <Text style={styles.metaText}>
                  {lesson.exerciseCount} exercises
                </Text>
              </View>
            </View>
          </View>

          {/* Learning Objectives */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
            {lesson.objectives.map((objective) => (
              <View key={objective.id} style={styles.objectiveItem}>
                <MaterialCommunityIcons
                  name={objective.icon as any}
                  size={24}
                  color="#4A90E2"
                />
                <Text style={styles.objectiveText}>{objective.description}</Text>
              </View>
            ))}
          </View>

          {/* Prerequisites */}
          {lesson.prerequisites.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prerequisites</Text>
              {checkingPrerequisites ? (
                <ActivityIndicator color="#4A90E2" />
              ) : (
                lesson.prerequisites.map((prerequisite) => (
                  <View key={prerequisite.id} style={styles.prerequisiteItem}>
                    <MaterialCommunityIcons
                      name={prerequisite.completed ? 'check-circle' : 'circle-outline'}
                      size={24}
                      color={prerequisite.completed ? '#4CAF50' : '#8E8E93'}
                    />
                    <Text
                      style={[
                        styles.prerequisiteText,
                        !prerequisite.completed && styles.prerequisiteTextIncomplete,
                      ]}
                    >
                      {prerequisite.title}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            (!prerequisitesMet || checkingPrerequisites) && styles.startButtonDisabled,
          ]}
          onPress={handleStartLesson}
          disabled={!prerequisitesMet || checkingPrerequisites}
        >
          <Text style={styles.startButtonText}>
            {checkingPrerequisites
              ? 'Checking Prerequisites...'
              : prerequisitesMet
              ? 'Start Lesson'
              : 'Complete Prerequisites'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  level: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 8,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  objectiveText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prerequisiteText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  prerequisiteTextIncomplete: {
    color: '#8E8E93',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    backgroundColor: '#fff',
  },
  startButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 