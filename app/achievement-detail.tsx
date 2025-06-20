import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack } from 'expo-router';
import Colors from '../constants/colors';
import { Achievement, getAchievementById } from './utils/achievements';
import { shareAchievement } from './utils/achievementSharing';

export default function AchievementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    loadAchievement();
  }, [id]);

  const loadAchievement = async () => {
    try {
      setIsLoading(true);
      const data = await getAchievementById(id);
      setAchievement(data);
    } catch (error) {
      console.error('Error loading achievement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!achievement) return;

    try {
      setIsSharing(true);
      await shareAchievement(achievement);
    } catch (error) {
      Alert.alert(
        'Sharing Error',
        'Unable to share achievement. Please try again later.'
      );
    } finally {
      setIsSharing(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary':
        return '#FFD700';
      case 'epic':
        return '#9370DB';
      case 'rare':
        return '#4169E1';
      case 'uncommon':
        return '#32CD32';
      default:
        return Colors.primary;
    }
  };

  const getRarityLabel = (rarity: string): string => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!achievement) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={Colors.error}
        />
        <Text style={styles.errorText}>Achievement not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Achievement Details',
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleShare}
              disabled={isSharing}
              style={styles.shareButton}
            >
              <MaterialCommunityIcons
                name={isSharing ? 'loading' : 'share-variant'}
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getRarityColor(achievement.rarity) + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={achievement.icon}
              size={64}
              color={getRarityColor(achievement.rarity)}
            />
          </View>
          <Text style={styles.title}>{achievement.title}</Text>
          <View style={styles.rarityContainer}>
            <Text
              style={[
                styles.rarityText,
                { color: getRarityColor(achievement.rarity) },
              ]}
            >
              {getRarityLabel(achievement.rarity)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(achievement.progress / achievement.target) * 100}%`,
                    backgroundColor: getRarityColor(achievement.rarity),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress} / {achievement.target}
            </Text>
          </View>
        </View>

        {achievement.reward && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reward</Text>
            <View style={styles.rewardContainer}>
              <MaterialCommunityIcons
                name={getRewardIcon(achievement.reward.type)}
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.rewardText}>
                {achievement.reward.description}
              </Text>
            </View>
          </View>
        )}

        {achievement.unlockedAt && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unlocked</Text>
            <Text style={styles.unlockedText}>
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.shareButtonLarge}
          onPress={handleShare}
          disabled={isSharing}
        >
          <MaterialCommunityIcons
            name={isSharing ? 'loading' : 'share-variant'}
            size={24}
            color={Colors.white}
          />
          <Text style={styles.shareButtonText}>
            {isSharing ? 'Sharing...' : 'Share Achievement'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function getRewardIcon(type: string): string {
  switch (type) {
    case 'xp':
      return 'star';
    case 'coins':
      return 'coin';
    case 'badge':
      return 'medal';
    case 'theme':
      return 'palette';
    case 'streak_saver':
      return 'shield';
    default:
      return 'gift';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  rarityContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  rarityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    minWidth: 60,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rewardText: {
    fontSize: 16,
    color: Colors.primary,
  },
  unlockedText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  shareButton: {
    padding: 8,
    marginRight: 8,
  },
  shareButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
}); 