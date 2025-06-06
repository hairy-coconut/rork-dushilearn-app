import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Circle, BookOpen, Play, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Lesson } from '@/constants/lessons';
import { wordAudios } from '@/constants/audio';
import { useProgressStore } from '@/store/progressStore';

type LessonCardProps = {
  lesson: Lesson;
  color: string;
};

export default function LessonCard({ lesson, color }: LessonCardProps) {
  const router = useRouter();
  const { isLessonUnlocked } = useProgressStore();
  const isUnlocked = isLessonUnlocked(lesson.id);

  const handleStartLesson = () => {
    if (isUnlocked) {
      router.push(`/lesson/${lesson.id}`);
    }
  };
  
  const handleViewVocabulary = () => {
    if (isUnlocked) {
      router.push(`/vocabulary/${lesson.id}`);
    }
  };
  
  // Check if this lesson has vocabulary with audio
  const hasVocabulary = wordAudios[lesson.id] && wordAudios[lesson.id].length > 0;

  return (
    <View style={[
      styles.card, 
      { borderLeftColor: color },
      !isUnlocked && styles.lockedCard
    ]}>
      <View style={styles.content}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isUnlocked ? color : Colors.inactive }
        ]}>
          {isUnlocked ? (
            <Circle size={24} color="white" />
          ) : (
            <Lock size={24} color="white" />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.description}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.meta}>Level {lesson.level}</Text>
            <Text style={styles.meta}>{lesson.exercises} exercises</Text>
          </View>
        </View>
      </View>
      
      {isUnlocked ? (
        <View style={styles.buttonContainer}>
          {hasVocabulary && (
            <TouchableOpacity 
              style={[styles.button, styles.vocabularyButton]} 
              onPress={handleViewVocabulary}
            >
              <BookOpen size={16} color={color} />
              <Text style={[styles.buttonText, { color }]}>Vocabulary</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.startButton, { backgroundColor: color }]} 
            onPress={handleStartLesson}
          >
            <Play size={16} color="white" />
            <Text style={[styles.buttonText, styles.startButtonText]}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.lockedMessage}>
          <Text style={styles.lockedText}>Complete previous lessons to unlock</Text>
        </View>
      )}
      
      {lesson.completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Completed</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
  },
  meta: {
    fontSize: 12,
    color: Colors.textLight,
    marginRight: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  vocabularyButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  startButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  startButtonText: {
    color: 'white',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  lockedMessage: {
    marginTop: 12,
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});