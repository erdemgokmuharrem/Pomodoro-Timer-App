import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotifications = () => {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  useEffect(() => {
    // Request permissions
    requestPermissions();

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response:', response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const schedulePomodoroNotification = async (
    duration: number,
    taskId?: string
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pomodoro Tamamlandı! 🎉',
          body: taskId
            ? 'Göreviniz tamamlandı, mola zamanı!'
            : 'Pomodoro tamamlandı, mola zamanı!',
          sound: true,
        },
        trigger: { type: 'timeInterval', seconds: duration * 60 },
      });
    } catch (error) {
      console.error('Error scheduling pomodoro notification:', error);
    }
  };

  const scheduleBreakNotification = async (
    duration: number,
    isLongBreak: boolean
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: isLongBreak ? 'Uzun Mola Bitti! 🚀' : 'Mola Bitti! ⏰',
          body: "Yeni pomodoro'ya başlamaya hazır mısınız?",
          sound: true,
        },
        trigger: { type: 'timeInterval', seconds: duration * 60 },
      });
    } catch (error) {
      console.error('Error scheduling break notification:', error);
    }
  };

  const sendLocalNotification = async (title: string, body: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  return {
    schedulePomodoroNotification,
    scheduleBreakNotification,
    sendLocalNotification,
    cancelAllNotifications,
  };
};
