import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { usePomodoroStore } from '../store/usePomodoroStore';

export const useNotifications = () => {
  const { settings } = usePomodoroStore();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Set up notification listeners
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = notificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle notification tap actions here
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const schedulePomodoroNotification = async (duration: number, taskName?: string) => {
    if (!settings.notificationsEnabled) return null;
    
    try {
      const notificationId = await notificationService.schedulePomodoroNotification(
        duration, 
        taskName
      );
      return notificationId;
    } catch (error) {
      console.error('Error scheduling pomodoro notification:', error);
      return null;
    }
  };

  const scheduleBreakNotification = async (duration: number, isLongBreak: boolean = false) => {
    if (!settings.notificationsEnabled) return null;
    
    try {
      const notificationId = await notificationService.scheduleBreakNotification(
        duration, 
        isLongBreak
      );
      return notificationId;
    } catch (error) {
      console.error('Error scheduling break notification:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await notificationService.cancelNotification(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      await notificationService.sendLocalNotification({
        title,
        body,
        data,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const checkPermissions = async () => {
    return await notificationService.areNotificationsEnabled();
  };

  const requestPermissions = async () => {
    return await notificationService.requestPermissions();
  };

  return {
    schedulePomodoroNotification,
    scheduleBreakNotification,
    cancelNotification,
    cancelAllNotifications,
    sendLocalNotification,
    checkPermissions,
    requestPermissions,
  };
};
