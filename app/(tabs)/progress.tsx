import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useProgressStore, getOverallProgress } from '../../store/progressStore';
import { categories } from '../../constants/lessons';
import ProgressBar from '../../components/ProgressBar';

export default function ProgressScreen() {
  const { completedLessons, streak, xp, level } = useProgressStore();
  const overallProgress = getOverallProgress();
  
  // Calculate category progress
  const categoryProgress = categories.map(category => {
    const totalLessons = category.lessons.length;
    const completedInCategory = category.lessons.filter(
      lesson => completedLessons.includes(lesson.id)
    ).length;
    
    return {
      id: category.id,
      title: category.title,
      progress: totalLessons > 0 ? completedInCategory / totalLessons : 0,
      completed: completedInCategory,
      total: totalLessons,
      color: category.color,
    };
  });
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Overall stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="bar-chart" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{Math.round(overallProgress * 100)}%</Text>
          <Text style={styles.statLabel}>Overall Progress</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="emoji-events" size={24} color={Colors.secondary} />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="menu-book" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{completedLessons.length}</Text>
          <Text style={styles.statLabel}>Lessons Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="calendar-today" size={24} color={Colors.error} />
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
      </View>
      
      {/* Overall progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Progress</Text>
        <View style={styles.progressCard}>
          <ProgressBar 
            progress={overallProgress} 
            color={Colors.primary}
            height={12}
          />
          <Text style={styles.progressText}>
            {completedLessons.length} of {categories.reduce((acc, cat) => acc + cat.lessons.length, 0)} lessons completed
          </Text>
        </View>
      </View>
      
      {/* Category progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress by Category</Text>
        {categoryProgress.map(category => (
          <View key={category.id} style={styles.categoryProgressCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryCount}>
                {category.completed}/{category.total}
              </Text>
            </View>
            <ProgressBar 
              progress={category.progress} 
              color={category.color}
              height={8}
            />
          </View>
        ))}
      </View>
      
      {/* Level information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Level</Text>
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>Level {level}</Text>
              <Text style={styles.levelXp}>{xp} XP total</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.levelBadgeText}>{level}</Text>
            </View>
          </View>
          <Text style={styles.levelInfo}>
            You need {level * 100 - xp} more XP to reach level {level + 1}
          </Text>
        </View>
      </View>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
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
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
  categoryProgressCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  levelCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  levelXp: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  levelInfo: {
    fontSize: 14,
    color: Colors.textLight,
  },
});