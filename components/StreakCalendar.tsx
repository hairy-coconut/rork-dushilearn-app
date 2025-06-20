import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 4;

interface StreakCalendarProps {
  lastOpened: number;
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCalendar({
  lastOpened,
  currentStreak,
  longestStreak,
}: StreakCalendarProps) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (DAYS_IN_WEEK * WEEKS_TO_SHOW - 1));

  const renderCalendarDays = () => {
    const days = [];
    const currentDate = new Date(startDate);

    for (let week = 0; week < WEEKS_TO_SHOW; week++) {
      const weekDays = [];
      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const dateString = currentDate.toISOString().split('T')[0];
        const isToday = currentDate.toDateString() === today.toDateString();
        const isPast = currentDate < today;
        const isOpened = isPast && currentDate.getTime() <= lastOpened;
        const isFuture = currentDate > today;

        weekDays.push(
          <View
            key={dateString}
            style={[
              styles.dayContainer,
              isToday && styles.todayContainer,
              isOpened && styles.openedContainer,
              isFuture && styles.futureContainer,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                isToday && styles.todayText,
                isOpened && styles.openedText,
                isFuture && styles.futureText,
              ]}
            >
              {currentDate.getDate()}
            </Text>
            {isOpened && (
              <MaterialCommunityIcons
                name="check"
                size={12}
                color={Colors.primary}
                style={styles.checkIcon}
              />
            )}
          </View>
        );

        currentDate.setDate(currentDate.getDate() + 1);
      }
      days.push(
        <View key={week} style={styles.weekContainer}>
          {weekDays}
        </View>
      );
    }

    return days;
  };

  const renderWeekDays = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.streakInfo}>
          <MaterialCommunityIcons
            name="fire"
            size={24}
            color={Colors.primary}
          />
          <Text style={styles.streakText}>
            {currentStreak} Day Streak
          </Text>
        </View>
        <Text style={styles.longestStreakText}>
          Longest: {longestStreak} days
        </Text>
      </View>

      <ScrollView style={styles.calendarContainer}>
        {renderWeekDays()}
        {renderCalendarDays()}
      </ScrollView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.openedContainer]} />
          <Text style={styles.legendText}>Opened</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.todayContainer]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.futureContainer]} />
          <Text style={styles.legendText}>Future</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 8,
  },
  longestStreakText: {
    fontSize: 14,
    color: Colors.text,
  },
  calendarContainer: {
    maxHeight: 300,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: (width - 64) / 7,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayContainer: {
    width: (width - 64) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  todayContainer: {
    backgroundColor: Colors.primary,
  },
  openedContainer: {
    backgroundColor: Colors.success,
  },
  futureContainer: {
    backgroundColor: Colors.disabled,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  openedText: {
    color: '#FFFFFF',
  },
  futureText: {
    color: Colors.text,
    opacity: 0.5,
  },
  checkIcon: {
    position: 'absolute',
    bottom: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
  },
}); 