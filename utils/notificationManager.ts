import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { socialApi } from './socialApi';

class NotificationManager {
  private static instance: NotificationManager;
  private initialized = false;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  async initialize() {
    if (this.initialized) return;

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    this.initialized = true;
  }

  async scheduleChallengeReminder(challengeId: string, title: string, deadline: Date) {
    if (!this.initialized) await this.initialize();

    // Cancel any existing reminders for this challenge
    await this.cancelChallengeReminder(challengeId);

    // Calculate time until deadline
    const now = new Date();
    const timeUntilDeadline = deadline.getTime() - now.getTime();

    // Don't schedule if deadline has passed
    if (timeUntilDeadline <= 0) return;

    // Schedule notifications at different intervals
    const intervals = [
      { time: 24 * 60 * 60 * 1000, message: '24 hours left' }, // 24 hours
      { time: 12 * 60 * 60 * 1000, message: '12 hours left' }, // 12 hours
      { time: 1 * 60 * 60 * 1000, message: '1 hour left' }, // 1 hour
    ];

    for (const interval of intervals) {
      if (timeUntilDeadline > interval.time) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Challenge Reminder',
            body: `${title}: ${interval.message}`,
            data: { challengeId },
          },
          trigger: {
            seconds: Math.floor((timeUntilDeadline - interval.time) / 1000),
          },
        });
      }
    }
  }

  async cancelChallengeReminder(challengeId: string) {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.challengeId === challengeId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async scheduleProgressReminder(challengeId: string, title: string) {
    if (!this.initialized) await this.initialize();

    // Schedule a reminder if no progress has been made in 24 hours
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Challenge Progress Reminder',
        body: `Don't forget to make progress on your challenge: ${title}`,
        data: { challengeId },
      },
      trigger: {
        seconds: 24 * 60 * 60, // 24 hours
        repeats: true,
      },
    });
  }

  async scheduleAchievementNotification(challengeId: string, title: string, achievement: string) {
    if (!this.initialized) await this.initialize();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Challenge Achievement!',
        body: `Congratulations! You've achieved ${achievement} in ${title}`,
        data: { challengeId },
      },
      trigger: null, // Show immediately
    });
  }

  async scheduleMilestoneNotification(challengeId: string, title: string, milestone: number) {
    if (!this.initialized) await this.initialize();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Challenge Milestone Reached!',
        body: `You've reached ${milestone}% progress in ${title}! Keep going!`,
        data: { challengeId },
      },
      trigger: null, // Show immediately
    });
  }

  async scheduleChallengeCompletion(challengeId: string, title: string) {
    if (!this.initialized) await this.initialize();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Challenge Completed!',
        body: `Congratulations! You've completed the challenge: ${title}`,
        data: { challengeId },
      },
      trigger: null, // Show immediately
    });
  }

  async scheduleFriendProgressNotification(challengeId: string, friendName: string, progress: number) {
    if (!this.initialized) await this.initialize();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Friend Progress Update',
        body: `${friendName} has reached ${progress}% progress in the challenge!`,
        data: { challengeId },
      },
      trigger: null, // Show immediately
    });
  }
}

export const notificationManager = NotificationManager.getInstance(); 