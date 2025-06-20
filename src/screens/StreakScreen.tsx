import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getUserStreakStatus, getStreakStatusMessage, getTimeUntilStreakBreak, getUserMonthlyActivity } from '../utils/streak';
import { StreakStatus, MonthlyActivity } from '../types/streak';
import { getCurrentUser } from '../utils/supabase';
import ActivityCalendar from '../components/ActivityCalendar';
import StreakCelebration from '../components/StreakCelebration';
import StreakFreezePurchase from '../components/StreakFreezePurchase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StreakScreen() {
  const [streakStatus, setStreakStatus] = useState<StreakStatus | null>(null);
  const [monthlyActivities, setMonthlyActivities] = useState<MonthlyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFreezePurchase, setShowFreezePurchase] = useState(false);
  const [previousStreak, setPreviousStreak] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    loadStreakData();
  }, []);

  useEffect(() => {
    if (streakStatus?.next_activity_deadline) {
      const timer = setInterval(() => {
        setTimeLeft(getTimeUntilStreakBreak(streakStatus.next_activity_deadline));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [streakStatus?.next_activity_deadline]);

  useEffect(() => {
    // Check if we've reached a milestone
    if (streakStatus && previousStreak !== null) {
      const milestones = [7, 14, 30];
      if (milestones.includes(streakStatus.current_streak) && streakStatus.current_streak > previousStreak) {
        setShowCelebration(true);
      }
    }
    setPreviousStreak(streakStatus?.current_streak ?? null);
  }, [streakStatus?.current_streak]);

  async function loadStreakData() {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const [status, activities] = await Promise.all([
        getUserStreakStatus(user.id),
        getUserMonthlyActivity(user.id, selectedYear, selectedMonth)
      ]);

      setStreakStatus(status);
      setMonthlyActivities(activities);
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    loadStreakData();
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  const handleFreezePurchaseComplete = () => {
    setShowFreezePurchase(false);
    loadStreakData(); // Reload data to show updated streak freeze status
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!streakStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Start your Dushi journey today! 🌴</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.streakCard}>
        <Text style={styles.streakNumber}>{streakStatus.current_streak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
        <Text style={styles.message}>
          {getStreakStatusMessage(streakStatus.current_streak)}
        </Text>
      </View>

      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>Time until streak break:</Text>
        <Text style={styles.timeLeft}>
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </Text>
        {!streakStatus.streak_freeze_available && (
          <TouchableOpacity
            style={styles.freezeButton}
            onPress={() => setShowFreezePurchase(true)}
          >
            <MaterialCommunityIcons name="snowflake" size={20} color="#fff" />
            <Text style={styles.freezeButtonText}>Protect Streak</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Longest Streak</Text>
        <Text style={styles.statsValue}>{streakStatus.longest_streak} days</Text>
      </View>

      {streakStatus.streak_freeze_available && (
        <View style={styles.freezeCard}>
          <Text style={styles.freezeLabel}>Streak Freeze Active</Text>
          <Text style={styles.freezeExpiry}>
            Expires: {new Date(streakStatus.streak_freeze_expires_at!).toLocaleString()}
          </Text>
        </View>
      )}

      <View style={styles.calendarSection}>
        <Text style={styles.calendarTitle}>Your Activity Calendar</Text>
        <ActivityCalendar 
          activities={monthlyActivities}
          year={selectedYear}
          month={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </View>

      {showCelebration && (
        <StreakCelebration
          streak={streakStatus.current_streak}
          onComplete={handleCelebrationComplete}
        />
      )}

      {showFreezePurchase && (
        <StreakFreezePurchase
          onPurchaseComplete={handleFreezePurchaseComplete}
          onClose={() => setShowFreezePurchase(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  streakLabel: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  timeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  timeLeft: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  freezeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  freezeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  freezeExpiry: {
    fontSize: 14,
    color: '#999',
  },
  calendarSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  freezeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  freezeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 