import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MonthlyActivity } from '../types/streak';

interface ActivityCalendarProps {
  activities: MonthlyActivity[];
  year: number;
  month: number;
  onMonthChange?: (year: number, month: number) => void;
}

export default function ActivityCalendar({ activities, year, month, onMonthChange }: ActivityCalendarProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  
  // Create a map of activities for quick lookup
  const activityMap = activities.reduce((map, activity) => {
    const day = new Date(activity.activity_date).getDate();
    map[day] = activity;
    return map;
  }, {} as Record<number, MonthlyActivity>);

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth === 0) {
      newMonth = 12;
      newYear--;
    }
    onMonthChange?.(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth === 13) {
      newMonth = 1;
      newYear++;
    }
    onMonthChange?.(newYear, newMonth);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate calendar grid
  const calendarGrid = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Add day headers
  calendarGrid.push(
    <View key="header" style={styles.headerRow}>
      {daysOfWeek.map(day => (
        <Text key={day} style={styles.headerCell}>{day}</Text>
      ))}
    </View>
  );

  // Add empty cells for days before the first of the month
  const firstRow = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    firstRow.push(<View key={`empty-${i}`} style={styles.emptyCell} />);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const activity = activityMap[day];
    const isToday = new Date().getDate() === day && 
                   new Date().getMonth() + 1 === month && 
                   new Date().getFullYear() === year;

    firstRow.push(
      <View 
        key={day} 
        style={[
          styles.dayCell,
          activity && styles.activeDayCell,
          isToday && styles.todayCell
        ]}
      >
        <Text style={[
          styles.dayNumber,
          activity && styles.activeDayNumber,
          isToday && styles.todayNumber
        ]}>
          {day}
        </Text>
        {activity && (
          <View style={styles.activityIndicator}>
            <MaterialCommunityIcons 
              name="check-circle" 
              size={16} 
              color="#4ECDC4" 
            />
            <Text style={styles.xpText}>+{activity.xp_earned} XP</Text>
          </View>
        )}
      </View>
    );

    // Start a new row after every 7 days
    if ((firstDayOfMonth + day) % 7 === 0) {
      calendarGrid.push(
        <View key={`row-${day}`} style={styles.calendarRow}>
          {firstRow}
        </View>
      );
      firstRow.length = 0;
    }
  }

  // Add any remaining days to the last row
  if (firstRow.length > 0) {
    calendarGrid.push(
      <View key="last-row" style={styles.calendarRow}>
        {firstRow}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={handlePrevMonth}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#666" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[month - 1]} {year}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={handleNextMonth}
        >
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        {calendarGrid}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    padding: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  calendarRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    flex: 1,
    aspectRatio: 1,
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  activeDayCell: {
    backgroundColor: '#f0f9f8',
  },
  todayCell: {
    backgroundColor: '#fff5f5',
  },
  dayNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activeDayNumber: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  todayNumber: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  activityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  xpText: {
    fontSize: 10,
    color: '#4ECDC4',
    marginLeft: 2,
  },
}); 