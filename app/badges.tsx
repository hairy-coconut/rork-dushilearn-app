import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import BadgeItem from '@/components/BadgeItem';
import { useBadgeStore } from '@/store/badgeStore';
import { useProgressStore } from '@/store/progressStore';
import { Platform } from 'react-native';

export default function BadgesScreen() {
  const router = useRouter();
  const { badges } = useBadgeStore();
  const { shareProgress } = useProgressStore();
  
  const earnedBadges = badges.filter(badge => badge.earned);
  const unearnedBadges = badges.filter(badge => !badge.earned);
  
  const handleShare = async () => {
    try {
      // Mark as shared in progress store
      shareProgress();
      
      // Share functionality would go here
      if (Platform.OS !== 'web') {
        // This would use the Share API on native platforms
        console.log('Sharing progress...');
      } else {
        // Web fallback
        console.log('Sharing not available on web');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Badges</Text>
        <TouchableOpacity onPress={handleShare}>
          <Share2 size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{badges.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round((earnedBadges.length / badges.length) * 100)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
        
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earned Badges</Text>
            <View style={styles.badgesGrid}>
              {earnedBadges.map(badge => (
                <View key={badge.id} style={styles.badgeWrapper}>
                  <BadgeItem badge={badge} />
                </View>
              ))}
            </View>
          </View>
        )}
        
        {unearnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges to Earn</Text>
            <View style={styles.badgesGrid}>
              {unearnedBadges.map(badge => (
                <View key={badge.id} style={styles.badgeWrapper}>
                  <BadgeItem badge={badge} />
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '30%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeWrapper: {
    width: '33%',
    marginBottom: 16,
  },
});