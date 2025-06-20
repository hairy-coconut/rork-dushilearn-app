import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { socialApi } from '@/utils/supabase';
import Colors from '@/constants/colors';

interface LeaderboardEntry {
  user_id: string;
  level: number;
  experience: number;
  users: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [timeFrame]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await socialApi.getLeaderboard(50);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimeFrameButton = (label: string, value: 'all' | 'week' | 'month') => (
    <TouchableOpacity
      style={[
        styles.timeFrameButton,
        timeFrame === value && styles.timeFrameButtonActive,
      ]}
      onPress={() => setTimeFrame(value)}
    >
      <Text
        style={[
          styles.timeFrameButtonText,
          timeFrame === value && styles.timeFrameButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        {index < 3 ? (
          <MaterialCommunityIcons
            name="crown"
            size={24}
            color={getRankColor(index)}
          />
        ) : (
          <Text style={styles.rankText}>{index + 1}</Text>
        )}
      </View>

      <Image
        source={
          item.users.avatar_url
            ? { uri: item.users.avatar_url }
            : require('@/assets/icon.png')
        }
        style={styles.avatar}
      />

      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.users.username}</Text>
        <Text style={styles.level}>Level {item.level}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{item.experience.toLocaleString()}</Text>
        <Text style={styles.scoreLabel}>XP</Text>
      </View>
    </View>
  );

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return '#FFD700'; // Gold
      case 1:
        return '#C0C0C0'; // Silver
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return Colors.text;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.timeFrameContainer}>
          {renderTimeFrameButton('All Time', 'all')}
          {renderTimeFrameButton('This Week', 'week')}
          {renderTimeFrameButton('This Month', 'month')}
        </View>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  timeFrameButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeFrameButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
  timeFrameButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  level: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.7,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
}); 