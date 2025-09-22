import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      console.log('Expo push token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  async schedulePomodoroNotification(duration: number, taskName?: string): Promise<string> {
    const title = 'Pomodoro Tamamlandı! 🎉';
    const body = taskName 
      ? `${taskName} için ${duration} dakikalık odaklanma süreniz bitti!`
      : `${duration} dakikalık odaklanma süreniz bitti!`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'pomodoro_complete', duration, taskName },
        sound: 'default',
      },
      trigger: { seconds: duration * 60 },
    });

    return notificationId;
  }

  async scheduleBreakNotification(duration: number, isLongBreak: boolean = false): Promise<string> {
    const title = isLongBreak ? 'Uzun Mola Bitti!' : 'Mola Bitti!';
    const body = isLongBreak 
      ? `${duration} dakikalık uzun mola süreniz tamamlandı. Yeni pomodoro başlatmaya hazır mısınız?`
      : `${duration} dakikalık mola süreniz tamamlandı. Yeni pomodoro başlatmaya hazır mısınız?`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'break_complete', duration, isLongBreak },
        sound: 'default',
      },
      trigger: { seconds: duration * 60 },
    });

    return notificationId;
  }

  async scheduleReminderNotification(title: string, body: string, delayMinutes: number): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'reminder' },
        sound: 'default',
      },
      trigger: { seconds: delayMinutes * 60 },
    });

    return notificationId;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Add notification listeners
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Local notification for immediate feedback
  async sendLocalNotification(data: NotificationData): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: data.title,
        body: data.body,
        data: data.data,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
}

export const notificationService = new NotificationService();
