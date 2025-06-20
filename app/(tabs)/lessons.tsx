import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { categories } from '../../constants/lessons';
import CategorySection from '../../components/CategorySection';
import Colors from '../../constants/colors';

export default function LessonsScreen() {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {categories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
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
    paddingBottom: 32,
  },
});