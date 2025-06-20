import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { categories } from '../../constants/lessons';
import { wordAudios } from '../../constants/audio';
import VocabularyCard from '../../components/VocabularyCard';

export default function VocabularyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Find the lesson data
  const lessonData = categories
    .flatMap(category => category.lessons)
    .find(lesson => lesson.id === id);
  
  // Get vocabulary for this lesson
  const vocabulary = wordAudios[id as string] || [];
  
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
          title: `${lessonData.title} Vocabulary`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.description}>
            Learn and practice the pronunciation of these {lessonData.title.toLowerCase()} words and phrases.
            Tap the speaker icon to hear the correct pronunciation.
          </Text>
          
          {vocabulary.length > 0 ? (
            vocabulary.map((word, index) => (
              <VocabularyCard key={index} word={word} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Vocabulary for this lesson is coming soon!
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push(`/lesson/${id}`)}
          >
            <Text style={styles.startButtonText}>Start Lesson</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});