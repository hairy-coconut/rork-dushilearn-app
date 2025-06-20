import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Category } from './constants/lessons';
import LessonCard from './LessonCard';
import Colors from './constants/colors';

type CategorySectionProps = {
  category: Category;
};

export default function CategorySection({ category }: CategorySectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.title}</Text>
      {category.lessons.map((lesson) => (
        <LessonCard 
          key={lesson.id} 
          lesson={lesson} 
          color={category.color} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
});