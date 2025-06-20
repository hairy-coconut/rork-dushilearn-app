import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { categories } from '@/constants/lessons';
import { useProgressStore, getLevelProgress } from '@/store/progressStore';
import ProgressBar from '@/components/ProgressBar';
import LessonCard from '@/components/LessonCard';
import MascotMessage from '@/components/MascotMessage';
import { supabase } from '@/utils/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const { streak, level, xp, updateStreak, completedLessons } = useProgressStore();
  const levelProgress = getLevelProgress();
  const [showMascot, setShowMascot] = useState(false);
  const [mascotType, setMascotType] = useState<'coco' | 'lora'>('coco');
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');
  
  // Update streak when app opens and test Supabase connection
  useEffect(() => {
    updateStreak();
    
    // Load user preferences
    const loadPreferences = async () => {
      try {
        const preferredMascot = await localStorage.getItem('preferred_mascot');
        if (preferredMascot) {
          setMascotType(preferredMascot as 'coco' | 'lora');
        }
        
        // Show mascot message with a delay
        setTimeout(() => {
          setShowMascot(true);
          
          // Hide mascot after 5 seconds
          setTimeout(() => {
            setShowMascot(false);
          }, 5000);
        }, 1000);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
    
    // Test Supabase connection
    const testSupabaseConnection = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setSupabaseStatus('Not configured');
          return;
        }
        
        // Simple query to test connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          console.error('Supabase connection error:', error);
          setSupabaseStatus('Error: ' + error.message);
        } else {
          setSupabaseStatus('Connected');
          console.log('Supabase connection successful');
        }
      } catch (error) {
        console.error('Error testing Supabase connection:', error);
        setSupabaseStatus('Error connecting');
      }
    };
    
    testSupabaseConnection();
  }, []);
  
  // Find the first incomplete lesson
  const findNextLesson = () => {
    for (const category of categories) {
      for (const lesson of category.lessons) {
        if (!completedLessons.includes(lesson.id)) {
          return lesson.id;
        }
      }
    }
    // If all lessons are completed, return the first one
    return categories[0]?.lessons[0]?.id;
  };
  
  const handleContinue = () => {
    const nextLessonId = findNextLesson();
    if (nextLessonId) {
      router.push(`/lesson/${nextLessonId}`);
    }
  };
  
  const handleViewBadges = () => {
    router.push('/badges');
  };
  
  // Calculate daily goal progress
  const dailyGoalProgress = completedLessons.length > 0 ? 1 : 0;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with user stats */}
      <View style={styles.header}>
        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <MaterialIcons name="emoji-events" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="menu-book" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <TouchableOpacity style={styles.statItem} onPress={handleViewBadges}>
            <Text style={styles.xpValue}>{xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={levelProgress} 
            label={`Level ${level} Progress`} 
            color={Colors.primary}
          />
        </View>
      </View>
      
      {/* Continue button */}
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <MaterialIcons name="play-circle-outline" size={24} color="white" />
        <Text style={styles.continueButtonText}>Continue Learning</Text>
      </TouchableOpacity>
      
      {/* Daily goal section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Goal</Text>
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Complete 1 lesson today</Text>
            <Text style={styles.goalProgress}>{dailyGoalProgress}/1</Text>
          </View>
          <ProgressBar progress={dailyGoalProgress} height={6} />
        </View>
      </View>
      
      {/* Featured lessons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Lessons</Text>
        {categories.slice(0, 1).map(category => (
          category.lessons.slice(0, 2).map(lesson => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              color={category.color} 
            />
          ))
        ))}
      </View>
      
      {/* Supabase status (for debugging) */}
      <TouchableOpacity 
        style={styles.supabaseStatus}
        onPress={() => Alert.alert('Supabase Status', supabaseStatus)}
      >
        <Text style={styles.supabaseStatusText}>
          Supabase: {supabaseStatus}
        </Text>
      </TouchableOpacity>
      
      {/* Mascot message */}
      {showMascot && (
        <MascotMessage 
          type={mascotType}
          onDismiss={() => setShowMascot(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 4,
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  progressContainer: {
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  supabaseStatus: {
    padding: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  supabaseStatusText: {
    fontSize: 12,
    color: Colors.textLight,
  },
});