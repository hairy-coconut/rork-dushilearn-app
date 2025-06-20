import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface NotificationTemplate {
  id: string;
  type: 'streak_reminder' | 'comeback' | 'achievement' | 'challenge' | 'boost_expiry' | 'learning_tip';
  title: string;
  body: string;
  trigger: 'time' | 'streak_risk' | 'inactivity' | 'achievement' | 'boost_expiry';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  data?: any;
}

export interface NotificationSettings {
  enabled: boolean;
  streakReminders: boolean;
  achievementAlerts: boolean;
  learningTips: boolean;
  challengeUpdates: boolean;
  boostExpiry: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
  };
  preferredTime: string; // "19:00" - user's preferred learning time
  timezone: string;
}

const NOTIFICATION_STORAGE_KEY = '@dushi_learn_notifications';
const SETTINGS_STORAGE_KEY = '@dushi_learn_notification_settings';

// Motivational messages with Caribbean flair
const STREAK_MESSAGES = [
  {
    title: "🏝️ Your streak awaits!",
    body: "Lora's got a new Papiamento phrase ready for you. Don't break that beautiful streak, dushi!"
  },
  {
    title: "🔥 Keep the fire burning!",
    body: "Your {streak}-day streak is amazing! Just 5 minutes of Papiamento will keep it going."
  },
  {
    title: "🌊 Ride the wave!",
    body: "The Caribbean winds are calling... and so is your Papiamento lesson!"
  },
  {
    title: "🥥 Coconut coins await!",
    body: "Complete today's lesson and earn those sweet coconut coins. Your streak depends on it!"
  },
  {
    title: "🌅 Island time is learning time!",
    body: "The sun's still shining on your {streak}-day streak. Let's keep it bright!"
  },
];

const COMEBACK_MESSAGES = [
  {
    title: "🏖️ The beach misses you!",
    body: "Coco's been practicing without you. Come back and learn some dushi Papiamento!"
  },
  {
    title: "🌺 Your island adventure continues...",
    body: "Ready to dive back into Papiamento? Your progress is waiting!"
  },
  {
    title: "🦜 Lora has stories to tell!",
    body: "New phrases, new adventures await. Your Papiamento journey isn't over!"
  },
  {
    title: "🌴 Paradise is calling!",
    body: "Miss the tropical vibes? Come back and master more Papiamento with us!"
  },
];

const LEARNING_TIPS = [
  {
    title: "💡 Pro tip from Coco!",
    body: "Practice Papiamento phrases out loud - it helps with pronunciation and memory!"
  },
  {
    title: "🎯 Lora's wisdom:",
    body: "Try using new Papiamento words in real conversations. Practice makes perfect!"
  },
  {
    title: "🧠 Memory hack:",
    body: "Associate Papiamento words with Caribbean images. Visual learning works wonders!"
  },
  {
    title: "⚡ Quick tip:",
    body: "Review yesterday's lessons for 2 minutes. Repetition strengthens memory!"
  },
];

export class SmartNotificationManager {
  private static instance: SmartNotificationManager;
  private settings: NotificationSettings = {
    enabled: true,
    streakReminders: true,
    achievementAlerts: true,
    learningTips: true,
    challengeUpdates: true,
    boostExpiry: true,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
    },
    preferredTime: "19:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  static getInstance(): SmartNotificationManager {
    if (!SmartNotificationManager.instance) {
      SmartNotificationManager.instance = new SmartNotificationManager();
    }
    return SmartNotificationManager.instance;
  }

  async initialize(): Promise<void> {
    await this.loadSettings();
    await this.requestPermissions();
    this.setupNotificationHandler();
  }

  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  private setupNotificationHandler(): void {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const isInQuietHours = this.isInQuietHours();
        
        return {
          shouldShowAlert: !isInQuietHours,
          shouldPlaySound: !isInQuietHours && notification.request.content.categoryIdentifier !== 'tips',
          shouldSetBadge: true,
        };
      },
    });
  }

  async loadSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
    return this.settings;
  }

  async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    
    // Reschedule notifications with new settings
    await this.schedulePersonalizedNotifications();
  }

  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = this.settings.quietHours;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    }
    
    return currentTime >= start && currentTime <= end;
  }

  private getRandomMessage(messages: typeof STREAK_MESSAGES): typeof STREAK_MESSAGES[0] {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  async scheduleStreakReminder(streak: number, hoursUntilLoss: number): Promise<void> {
    if (!this.settings.enabled || !this.settings.streakReminders) return;

    const message = this.getRandomMessage(STREAK_MESSAGES);
    const urgency = hoursUntilLoss <= 3 ? 'urgent' : hoursUntilLoss <= 6 ? 'high' : 'normal';
    
    // Schedule notification
    const triggerDate = new Date();
    if (hoursUntilLoss <= 2) {
      // Very urgent - notify in 30 minutes
      triggerDate.setMinutes(triggerDate.getMinutes() + 30);
    } else if (hoursUntilLoss <= 6) {
      // Urgent - notify in 2 hours
      triggerDate.setHours(triggerDate.getHours() + 2);
    } else {
      // Regular reminder at preferred time
      const [hours, minutes] = this.settings.preferredTime.split(':').map(Number);
      triggerDate.setHours(hours, minutes, 0, 0);
      
      // If preferred time has passed, schedule for tomorrow
      if (triggerDate <= new Date()) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body.replace('{streak}', streak.toString()),
        categoryIdentifier: 'streak',
        priority: urgency as any,
        data: { type: 'streak_reminder', streak, hoursUntilLoss },
      },
      trigger: triggerDate,
    });
  }

  async scheduleComebachNotification(daysSinceLastActive: number): Promise<void> {
    if (!this.settings.enabled || daysSinceLastActive < 1) return;

    const message = this.getRandomMessage(COMEBACK_MESSAGES);
    
    // Progressive comeback strategy
    let triggerHours = 24; // Default 1 day
    if (daysSinceLastActive >= 7) triggerHours = 168; // 1 week
    else if (daysSinceLastActive >= 3) triggerHours = 72; // 3 days
    
    const triggerDate = new Date();
    triggerDate.setHours(triggerDate.getHours() + triggerHours);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        categoryIdentifier: 'comeback',
        data: { type: 'comeback', daysSinceLastActive },
      },
      trigger: triggerDate,
    });
  }

  async scheduleAchievementNotification(achievement: string, reward: string): Promise<void> {
    if (!this.settings.enabled || !this.settings.achievementAlerts) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🏆 Achievement Unlocked!",
        body: `You've earned "${achievement}"! Claim your ${reward} now!`,
        categoryIdentifier: 'achievement',
        priority: 'high',
        data: { type: 'achievement', achievement, reward },
      },
      trigger: { seconds: 1 }, // Immediate
    });
  }

  async scheduleBoostExpiryNotification(boostName: string, minutesRemaining: number): Promise<void> {
    if (!this.settings.enabled || !this.settings.boostExpiry) return;

    const triggerMinutes = Math.max(1, minutesRemaining - 5); // 5 minutes before expiry
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚡ Boost Expiring Soon!",
        body: `Your "${boostName}" expires in ${minutesRemaining} minutes. Use it now!`,
        categoryIdentifier: 'boost_expiry',
        priority: 'high',
        data: { type: 'boost_expiry', boostName, minutesRemaining },
      },
      trigger: { seconds: triggerMinutes * 60 },
    });
  }

  async scheduleLearningTip(): Promise<void> {
    if (!this.settings.enabled || !this.settings.learningTips) return;

    const message = this.getRandomMessage(LEARNING_TIPS);
    
    // Schedule random tip between 1-3 days from now
    const daysFromNow = Math.floor(Math.random() * 3) + 1;
    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + daysFromNow);
    
    // Random time between 10 AM and 6 PM
    const randomHour = Math.floor(Math.random() * 8) + 10;
    triggerDate.setHours(randomHour, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        categoryIdentifier: 'tips',
        priority: 'low',
        data: { type: 'learning_tip' },
      },
      trigger: triggerDate,
    });
  }

  async schedulePersonalizedNotifications(): Promise<void> {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!this.settings.enabled) return;

    // Schedule various types of notifications
    await this.scheduleLearningTip();
    
    // Schedule daily learning reminder
    const dailyTrigger = new Date();
    const [hours, minutes] = this.settings.preferredTime.split(':').map(Number);
    dailyTrigger.setHours(hours, minutes, 0, 0);
    
    if (dailyTrigger <= new Date()) {
      dailyTrigger.setDate(dailyTrigger.getDate() + 1);
    }

    const dailyMessage = this.getRandomMessage(STREAK_MESSAGES);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌴 Daily Learning Time!",
        body: "Ready for today's Papiamento adventure? Let's keep that streak alive!",
        categoryIdentifier: 'daily',
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });
  }

  async sendImmediateNotification(template: NotificationTemplate): Promise<void> {
    if (!this.settings.enabled) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: template.title,
        body: template.body,
        categoryIdentifier: template.category || template.type,
        priority: template.priority as any,
        data: { ...template.data, type: template.type },
      },
      trigger: { seconds: 1 },
    });
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Analytics and personalization
  async trackNotificationInteraction(notificationId: string, action: 'opened' | 'dismissed'): Promise<void> {
    // Track user interaction for personalization
    const interactions = await this.getStoredInteractions();
    interactions.push({
      id: notificationId,
      action,
      timestamp: Date.now(),
    });

    // Keep only last 100 interactions
    const recentInteractions = interactions.slice(-100);
    
    try {
      await AsyncStorage.setItem(`${NOTIFICATION_STORAGE_KEY}_interactions`, JSON.stringify(recentInteractions));
    } catch (error) {
      console.error('Error storing notification interaction:', error);
    }
  }

  private async getStoredInteractions(): Promise<Array<{id: string, action: string, timestamp: number}>> {
    try {
      const stored = await AsyncStorage.getItem(`${NOTIFICATION_STORAGE_KEY}_interactions`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // Get optimal notification time based on user behavior
  async getOptimalNotificationTime(): Promise<string> {
    const interactions = await this.getStoredInteractions();
    const openedInteractions = interactions.filter(i => i.action === 'opened');
    
    if (openedInteractions.length < 5) {
      return this.settings.preferredTime; // Not enough data
    }

    // Analyze when user typically opens notifications
    const hourCounts: { [hour: string]: number } = {};
    
    openedInteractions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      const hourKey = hour.toString();
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });

    // Find most active hour
    const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[a] > hourCounts[b] ? a : b
    );

    return `${mostActiveHour.padStart(2, '0')}:00`;
  }
}

export const smartNotificationManager = SmartNotificationManager.getInstance();