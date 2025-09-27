import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  source: 'google' | 'outlook' | 'local';
}

export interface CalendarSyncSettings {
  googleEnabled: boolean;
  outlookEnabled: boolean;
  syncInterval: number; // minutes
  autoCreateEvents: boolean;
  syncPomodoros: boolean;
  syncTasks: boolean;
}

class CalendarService {
  private settings: CalendarSyncSettings = {
    googleEnabled: false,
    outlookEnabled: false,
    syncInterval: 15,
    autoCreateEvents: true,
    syncPomodoros: true,
    syncTasks: true,
  };

  async initialize(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('calendarSyncSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Calendar service initialization failed:', error);
    }
  }

  async updateSettings(newSettings: Partial<CalendarSyncSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await AsyncStorage.setItem('calendarSyncSettings', JSON.stringify(this.settings));
  }

  getSettings(): CalendarSyncSettings {
    return { ...this.settings };
  }

  // Google Calendar Integration
  async connectGoogleCalendar(): Promise<boolean> {
    try {
      // Google Calendar API integration would go here
      // For now, we'll simulate the connection
      await this.updateSettings({ googleEnabled: true });
      return true;
    } catch (error) {
      console.error('Google Calendar connection failed:', error);
      return false;
    }
  }

  async disconnectGoogleCalendar(): Promise<void> {
    await this.updateSettings({ googleEnabled: false });
  }

  async getGoogleEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.settings.googleEnabled) {
      return [];
    }

    try {
      // Google Calendar API call would go here
      // For now, return mock data
      return [
        {
          id: 'google-1',
          title: 'Team Meeting',
          startTime: new Date(startDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
          endTime: new Date(startDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
          description: 'Weekly team sync',
          source: 'google',
        },
      ];
    } catch (error) {
      console.error('Failed to fetch Google events:', error);
      return [];
    }
  }

  // Outlook Calendar Integration
  async connectOutlookCalendar(): Promise<boolean> {
    try {
      // Outlook Calendar API integration would go here
      await this.updateSettings({ outlookEnabled: true });
      return true;
    } catch (error) {
      console.error('Outlook Calendar connection failed:', error);
      return false;
    }
  }

  async disconnectOutlookCalendar(): Promise<void> {
    await this.updateSettings({ outlookEnabled: false });
  }

  async getOutlookEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.settings.outlookEnabled) {
      return [];
    }

    try {
      // Outlook Calendar API call would go here
      return [
        {
          id: 'outlook-1',
          title: 'Client Call',
          startTime: new Date(startDate.getTime() + 4 * 60 * 60 * 1000),
          endTime: new Date(startDate.getTime() + 5 * 60 * 60 * 1000),
          description: 'Project discussion',
          source: 'outlook',
        },
      ];
    } catch (error) {
      console.error('Failed to fetch Outlook events:', error);
      return [];
    }
  }

  // Combined calendar events
  async getAllEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];

    if (this.settings.googleEnabled) {
      const googleEvents = await this.getGoogleEvents(startDate, endDate);
      events.push(...googleEvents);
    }

    if (this.settings.outlookEnabled) {
      const outlookEvents = await this.getOutlookEvents(startDate, endDate);
      events.push(...outlookEvents);
    }

    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // Create calendar event for Pomodoro session
  async createPomodoroEvent(
    taskTitle: string,
    startTime: Date,
    duration: number, // minutes
    isBreak: boolean = false
  ): Promise<boolean> {
    if (!this.settings.autoCreateEvents || !this.settings.syncPomodoros) {
      return false;
    }

    try {
      const event: CalendarEvent = {
        id: `pomodoro-${Date.now()}`,
        title: isBreak ? `Break: ${taskTitle}` : `Pomodoro: ${taskTitle}`,
        startTime,
        endTime: new Date(startTime.getTime() + duration * 60 * 1000),
        description: isBreak ? 'Focus break time' : 'Deep work session',
        source: 'local',
      };

      // Here we would create the event in connected calendars
      console.log('Creating calendar event:', event);
      return true;
    } catch (error) {
      console.error('Failed to create Pomodoro event:', error);
      return false;
    }
  }

  // Create calendar event for task
  async createTaskEvent(
    taskTitle: string,
    startTime: Date,
    endTime: Date,
    description?: string
  ): Promise<boolean> {
    if (!this.settings.autoCreateEvents || !this.settings.syncTasks) {
      return false;
    }

    try {
      const event: CalendarEvent = {
        id: `task-${Date.now()}`,
        title: `Task: ${taskTitle}`,
        startTime,
        endTime,
        description: description || 'Scheduled task',
        source: 'local',
      };

      console.log('Creating task event:', event);
      return true;
    } catch (error) {
      console.error('Failed to create task event:', error);
      return false;
    }
  }

  // Check for time conflicts
  async checkTimeConflict(startTime: Date, endTime: Date): Promise<CalendarEvent[]> {
    const events = await this.getAllEvents(startTime, endTime);
    return events.filter(
      (event) =>
        (event.startTime < endTime && event.endTime > startTime) ||
        (event.startTime <= startTime && event.endTime >= endTime)
    );
  }

  // Get available time slots
  async getAvailableSlots(
    startDate: Date,
    endDate: Date,
    duration: number // minutes
  ): Promise<{ start: Date; end: Date }[]> {
    const events = await this.getAllEvents(startDate, endDate);
    const slots: { start: Date; end: Date }[] = [];

    let currentTime = new Date(startDate);

    while (currentTime < endDate) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);
      
      if (slotEnd > endDate) break;

      const conflicts = await this.checkTimeConflict(currentTime, slotEnd);
      
      if (conflicts.length === 0) {
        slots.push({ start: new Date(currentTime), end: new Date(slotEnd) });
      }

      // Move to next hour
      currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    }

    return slots;
  }

  // Sync settings with cloud
  async syncSettings(): Promise<void> {
    try {
      // Here we would sync settings with user's cloud account
      console.log('Syncing calendar settings...');
    } catch (error) {
      console.error('Failed to sync calendar settings:', error);
    }
  }
}

export const calendarService = new CalendarService();
