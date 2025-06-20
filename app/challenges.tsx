import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  getChallenges,
  createChallenge,
  inviteToChallenge,
  Challenge,
  ChallengeParticipant,
} from '../utils/social';
import ChallengeCard from '../components/ChallengeCard';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

export default function ChallengesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await getChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
      Alert.alert('Error', 'Failed to load challenges');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadChallenges();
  };

  const handleCreateChallenge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/create-challenge');
  };

  const handleChallengePress = (challenge: Challenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/challenge-details',
      params: { id: challenge.id },
    });
  };

  const handleInvite = (challenge: Challenge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/invite-friends',
      params: { challengeId: challenge.id },
    });
  };

  const getCurrentUserParticipant = (challenge: Challenge): ChallengeParticipant | undefined => {
    return challenge.participants?.find(p => p.user_id === user?.id);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Challenges</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateChallenge}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.challengesList}
        contentContainerStyle={styles.challengesListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {challenges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No active challenges
            </Text>
            <TouchableOpacity
              style={[styles.createFirstButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateChallenge}
            >
              <Text style={[styles.createFirstButtonText, { color: theme.colors.text }]}>
                Create Your First Challenge
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              currentUserParticipant={getCurrentUserParticipant(challenge)}
              onPress={() => handleChallengePress(challenge)}
              onInvite={() => handleInvite(challenge)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengesList: {
    flex: 1,
  },
  challengesListContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  createFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 