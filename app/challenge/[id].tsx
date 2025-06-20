import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/colors';
import { socialApi } from '../utils/socialApi';
import { notificationManager } from '../utils/notificationManager';

// ... (keep existing interfaces)

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [progressRemindersEnabled, setProgressRemindersEnabled] = useState(true);
  const [friendUpdatesEnabled, setFriendUpdatesEnabled] = useState(true);

  useEffect(() => {
    loadChallenge();
    initializeNotifications();
  }, [id]);

  const initializeNotifications = async () => {
    await notificationManager.initialize();
  };

  const loadChallenge = async () => {
    try {
      const data = await socialApi.getChallengeDetails(id as string);
      setChallenge(data);
      setupNotifications(data);
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = (challengeData: Challenge) => {
    if (!challengeData) return;

    // Schedule deadline reminders
    notificationManager.scheduleChallengeReminder(
      challengeData.id,
      challengeData.title,
      new Date(challengeData.end_date)
    );

    // Schedule progress reminders if enabled
    if (progressRemindersEnabled) {
      notificationManager.scheduleProgressReminder(
        challengeData.id,
        challengeData.title
      );
    }
  };

  const handleJoin = async () => {
    if (!challenge) return;

    setJoining(true);
    try {
      await socialApi.joinChallenge(challenge.id);
      setupNotifications(challenge);
      loadChallenge();
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleNotificationToggle = async (type: 'all' | 'progress' | 'friends') => {
    if (!challenge) return;

    switch (type) {
      case 'all':
        if (notificationsEnabled) {
          // Disable all notifications
          await notificationManager.cancelChallengeReminder(challenge.id);
          setNotificationsEnabled(false);
          setProgressRemindersEnabled(false);
          setFriendUpdatesEnabled(false);
        } else {
          // Enable all notifications
          setupNotifications(challenge);
          setNotificationsEnabled(true);
          setProgressRemindersEnabled(true);
          setFriendUpdatesEnabled(true);
        }
        break;

      case 'progress':
        if (progressRemindersEnabled) {
          // Disable progress reminders
          await notificationManager.cancelChallengeReminder(challenge.id);
          setProgressRemindersEnabled(false);
        } else {
          // Enable progress reminders
          notificationManager.scheduleProgressReminder(
            challenge.id,
            challenge.title
          );
          setProgressRemindersEnabled(true);
        }
        break;

      case 'friends':
        setFriendUpdatesEnabled(!friendUpdatesEnabled);
        break;
    }
  };

  // ... (keep existing helper functions)

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color="#FF6B6B"
        />
        <Text style={styles.errorText}>Challenge not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = getProgress();
  const progressPercentage = Math.min(100, (progress / challenge.target) * 100);
  const daysLeft = Math.ceil(
    (new Date(challenge.end_date).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <ScrollView style={styles.container}>
      {/* ... (keep existing header and content sections) */}

      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.notificationOption}>
          <View style={styles.notificationOptionInfo}>
            <MaterialCommunityIcons
              name="bell"
              size={24}
              color={Colors.primary}
            />
            <View style={styles.notificationOptionText}>
              <Text style={styles.notificationOptionTitle}>All Notifications</Text>
              <Text style={styles.notificationOptionDescription}>
                Receive all challenge updates
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => handleNotificationToggle('all')}
            trackColor={{ false: '#767577', true: Colors.primary }}
          />
        </View>

        <View style={styles.notificationOption}>
          <View style={styles.notificationOptionInfo}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color={Colors.primary}
            />
            <View style={styles.notificationOptionText}>
              <Text style={styles.notificationOptionTitle}>Progress Reminders</Text>
              <Text style={styles.notificationOptionDescription}>
                Get reminded about your progress
              </Text>
            </View>
          </View>
          <Switch
            value={progressRemindersEnabled}
            onValueChange={() => handleNotificationToggle('progress')}
            trackColor={{ false: '#767577', true: Colors.primary }}
            disabled={!notificationsEnabled}
          />
        </View>

        <View style={styles.notificationOption}>
          <View style={styles.notificationOptionInfo}>
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={Colors.primary}
            />
            <View style={styles.notificationOptionText}>
              <Text style={styles.notificationOptionTitle}>Friend Updates</Text>
              <Text style={styles.notificationOptionDescription}>
                Get notified about friends' progress
              </Text>
            </View>
          </View>
          <Switch
            value={friendUpdatesEnabled}
            onValueChange={() => handleNotificationToggle('friends')}
            trackColor={{ false: '#767577', true: Colors.primary }}
            disabled={!notificationsEnabled}
          />
        </View>
      </View>

      {!isParticipant() && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoin}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.joinButtonText}>Join Challenge</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (keep existing styles)

  notificationsSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  notificationOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  notificationOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 