import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DailyChest from '@/components/DailyChest';
import StreakCalendar from '@/components/StreakCalendar';
import ChestTutorial from '@/components/ChestTutorial';
import { getChestState } from '@/utils/chestStorage';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(true);
  const [chestState, setChestState] = useState<any>(null);

  useEffect(() => {
    loadChestState();
  }, []);

  const loadChestState = async () => {
    const state = await getChestState();
    setChestState(state);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Chest</Text>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => router.push('/stats')}
        >
          <MaterialCommunityIcons
            name="chart-line"
            size={24}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      <DailyChest />

      {chestState && (
        <StreakCalendar
          lastOpened={chestState.lastOpened}
          currentStreak={chestState.currentStreak}
          longestStreak={chestState.longestStreak || chestState.currentStreak}
        />
      )}

      {showTutorial && (
        <ChestTutorial onComplete={handleTutorialComplete} />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statsButton: {
    padding: 8,
  },
}); 