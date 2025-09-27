import { useState, useEffect, useCallback } from 'react';
import { calendarService, CalendarEvent, CalendarSyncSettings } from '../services/calendarService';

export interface UseCalendarSyncReturn {
  // Settings
  settings: CalendarSyncSettings;
  updateSettings: (newSettings: Partial<CalendarSyncSettings>) => Promise<void>;
  
  // Connection status
  isGoogleConnected: boolean;
  isOutlookConnected: boolean;
  isConnected: boolean;
  
  // Connection methods
  connectGoogle: () => Promise<boolean>;
  disconnectGoogle: () => Promise<void>;
  connectOutlook: () => Promise<boolean>;
  disconnectOutlook: () => Promise<void>;
  
  // Events
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  
  // Event methods
  refreshEvents: (startDate: Date, endDate: Date) => Promise<void>;
  createPomodoroEvent: (taskTitle: string, startTime: Date, duration: number, isBreak?: boolean) => Promise<boolean>;
  createTaskEvent: (taskTitle: string, startTime: Date, endTime: Date, description?: string) => Promise<boolean>;
  
  // Time management
  checkTimeConflict: (startTime: Date, endTime: Date) => Promise<CalendarEvent[]>;
  getAvailableSlots: (startDate: Date, endDate: Date, duration: number) => Promise<{ start: Date; end: Date }[]>;
  
  // Sync
  syncSettings: () => Promise<void>;
}

export const useCalendarSync = (): UseCalendarSyncReturn => {
  const [settings, setSettings] = useState<CalendarSyncSettings>({
    googleEnabled: false,
    outlookEnabled: false,
    syncInterval: 15,
    autoCreateEvents: true,
    syncPomodoros: true,
    syncTasks: true,
  });
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  useEffect(() => {
    const initialize = async () => {
      try {
        await calendarService.initialize();
        const currentSettings = calendarService.getSettings();
        setSettings(currentSettings);
      } catch (err) {
        setError('Failed to initialize calendar service');
        console.error('Calendar sync initialization error:', err);
      }
    };

    initialize();
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<CalendarSyncSettings>) => {
    try {
      await calendarService.updateSettings(newSettings);
      const updatedSettings = calendarService.getSettings();
      setSettings(updatedSettings);
    } catch (err) {
      setError('Failed to update calendar settings');
      console.error('Calendar settings update error:', err);
    }
  }, []);

  // Connection status
  const isGoogleConnected = settings.googleEnabled;
  const isOutlookConnected = settings.outlookEnabled;
  const isConnected = isGoogleConnected || isOutlookConnected;

  // Connect Google Calendar
  const connectGoogle = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await calendarService.connectGoogleCalendar();
      if (success) {
        const updatedSettings = calendarService.getSettings();
        setSettings(updatedSettings);
      }
      return success;
    } catch (err) {
      setError('Failed to connect Google Calendar');
      console.error('Google Calendar connection error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect Google Calendar
  const disconnectGoogle = useCallback(async () => {
    try {
      await calendarService.disconnectGoogleCalendar();
      const updatedSettings = calendarService.getSettings();
      setSettings(updatedSettings);
    } catch (err) {
      setError('Failed to disconnect Google Calendar');
      console.error('Google Calendar disconnection error:', err);
    }
  }, []);

  // Connect Outlook Calendar
  const connectOutlook = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await calendarService.connectOutlookCalendar();
      if (success) {
        const updatedSettings = calendarService.getSettings();
        setSettings(updatedSettings);
      }
      return success;
    } catch (err) {
      setError('Failed to connect Outlook Calendar');
      console.error('Outlook Calendar connection error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect Outlook Calendar
  const disconnectOutlook = useCallback(async () => {
    try {
      await calendarService.disconnectOutlookCalendar();
      const updatedSettings = calendarService.getSettings();
      setSettings(updatedSettings);
    } catch (err) {
      setError('Failed to disconnect Outlook Calendar');
      console.error('Outlook Calendar disconnection error:', err);
    }
  }, []);

  // Refresh events
  const refreshEvents = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isConnected) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const calendarEvents = await calendarService.getAllEvents(startDate, endDate);
      setEvents(calendarEvents);
    } catch (err) {
      setError('Failed to fetch calendar events');
      console.error('Calendar events fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Create Pomodoro event
  const createPomodoroEvent = useCallback(async (
    taskTitle: string,
    startTime: Date,
    duration: number,
    isBreak: boolean = false
  ): Promise<boolean> => {
    try {
      return await calendarService.createPomodoroEvent(taskTitle, startTime, duration, isBreak);
    } catch (err) {
      setError('Failed to create Pomodoro event');
      console.error('Pomodoro event creation error:', err);
      return false;
    }
  }, []);

  // Create task event
  const createTaskEvent = useCallback(async (
    taskTitle: string,
    startTime: Date,
    endTime: Date,
    description?: string
  ): Promise<boolean> => {
    try {
      return await calendarService.createTaskEvent(taskTitle, startTime, endTime, description);
    } catch (err) {
      setError('Failed to create task event');
      console.error('Task event creation error:', err);
      return false;
    }
  }, []);

  // Check time conflicts
  const checkTimeConflict = useCallback(async (startTime: Date, endTime: Date): Promise<CalendarEvent[]> => {
    try {
      return await calendarService.checkTimeConflict(startTime, endTime);
    } catch (err) {
      console.error('Time conflict check error:', err);
      return [];
    }
  }, []);

  // Get available slots
  const getAvailableSlots = useCallback(async (
    startDate: Date,
    endDate: Date,
    duration: number
  ): Promise<{ start: Date; end: Date }[]> => {
    try {
      return await calendarService.getAvailableSlots(startDate, endDate, duration);
    } catch (err) {
      console.error('Available slots fetch error:', err);
      return [];
    }
  }, []);

  // Sync settings
  const syncSettings = useCallback(async () => {
    try {
      await calendarService.syncSettings();
    } catch (err) {
      setError('Failed to sync calendar settings');
      console.error('Calendar settings sync error:', err);
    }
  }, []);

  return {
    settings,
    updateSettings,
    isGoogleConnected,
    isOutlookConnected,
    isConnected,
    connectGoogle,
    disconnectGoogle,
    connectOutlook,
    disconnectOutlook,
    events,
    loading,
    error,
    refreshEvents,
    createPomodoroEvent,
    createTaskEvent,
    checkTimeConflict,
    getAvailableSlots,
    syncSettings,
  };
};
