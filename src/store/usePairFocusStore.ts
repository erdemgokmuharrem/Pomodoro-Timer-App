import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PairFocusPartner {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  currentTask?: string;
  focusStreak: number;
  totalSessions: number;
  joinTime: Date;
}

export interface PairFocusSession {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  partner: PairFocusPartner | null;
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  duration: number; // minutes
  currentPhase: 'waiting' | 'pomodoro' | 'break' | 'completed';
  settings: {
    pomodoroDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStart: boolean;
    soundEnabled: boolean;
    videoEnabled: boolean;
    screenSharingEnabled: boolean;
  };
  chat: {
    messages: Array<{
      id: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: Date;
      type: 'text' | 'system' | 'emoji' | 'encouragement';
    }>;
  };
  statistics: {
    totalSessions: number;
    totalFocusTime: number; // minutes
    averageFocusTime: number; // minutes
    completionRate: number; // percentage
    mutualEncouragements: number;
  };
}

export interface PairFocusSettings {
  defaultDuration: number;
  allowVideo: boolean;
  allowScreenSharing: boolean;
  enableEncouragements: boolean;
  autoMatch: boolean;
  preferredPartners: string[];
  blockedUsers: string[];
}

interface PairFocusStore {
  // State
  currentSession: PairFocusSession | null;
  availableSessions: PairFocusSession[];
  mySessions: PairFocusSession[];
  settings: PairFocusSettings;
  loading: boolean;
  error: string | null;

  // Actions
  createSession: (sessionData: Omit<PairFocusSession, 'id' | 'hostId' | 'partner' | 'chat' | 'statistics'>) => Promise<string>;
  joinSession: (sessionId: string, partnerData: Omit<PairFocusPartner, 'id' | 'joinTime' | 'focusStreak' | 'totalSessions'>) => Promise<boolean>;
  leaveSession: (sessionId: string) => Promise<boolean>;
  startSession: (sessionId: string) => Promise<boolean>;
  endSession: (sessionId: string) => Promise<boolean>;
  updateSessionSettings: (sessionId: string, settings: Partial<PairFocusSession['settings']>) => Promise<boolean>;
  
  // Chat & Encouragements
  sendMessage: (sessionId: string, message: string, type?: 'text' | 'emoji' | 'encouragement') => Promise<boolean>;
  sendEncouragement: (sessionId: string, encouragement: string) => Promise<boolean>;
  
  // Statistics
  updateStatistics: (sessionId: string, focusCompleted: boolean) => Promise<void>;
  
  // Settings
  updateSettings: (newSettings: Partial<PairFocusSettings>) => Promise<void>;
  
  // Partner management
  addPreferredPartner: (partnerId: string) => Promise<void>;
  removePreferredPartner: (partnerId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  
  // Data management
  loadSessions: () => Promise<void>;
  saveSessions: () => Promise<void>;
  clearData: () => Promise<void>;
}

export const usePairFocusStore = create<PairFocusStore>((set, get) => ({
  // Initial state
  currentSession: null,
  availableSessions: [],
  mySessions: [],
  settings: {
    defaultDuration: 25,
    allowVideo: true,
    allowScreenSharing: false,
    enableEncouragements: true,
    autoMatch: false,
    preferredPartners: [],
    blockedUsers: [],
  },
  loading: false,
  error: null,

  // Create session
  createSession: async (sessionData) => {
    try {
      set({ loading: true, error: null });
      
      const newSession: PairFocusSession = {
        ...sessionData,
        id: `pair-session-${Date.now()}`,
        hostId: 'current-user-id', // In real app, get from auth
        partner: null,
        chat: { messages: [] },
        statistics: {
          totalSessions: 0,
          totalFocusTime: 0,
          averageFocusTime: 0,
          completionRate: 0,
          mutualEncouragements: 0,
        },
      };

      const { mySessions } = get();
      const updatedMySessions = [...mySessions, newSession];
      
      set({ mySessions: updatedMySessions });
      await get().saveSessions();
      
      return newSession.id;
    } catch (error) {
      set({ error: 'Failed to create pair focus session' });
      console.error('Create pair focus session error:', error);
      return '';
    } finally {
      set({ loading: false });
    }
  },

  // Join session
  joinSession: async (sessionId, partnerData) => {
    try {
      set({ loading: true, error: null });
      
      const { availableSessions, mySessions } = get();
      const session = availableSessions.find(s => s.id === sessionId) || 
                     mySessions.find(s => s.id === sessionId);
      
      if (!session) {
        set({ error: 'Session not found' });
        return false;
      }

      if (session.partner) {
        set({ error: 'Session already has a partner' });
        return false;
      }

      const newPartner: PairFocusPartner = {
        ...partnerData,
        id: `partner-${Date.now()}`,
        joinTime: new Date(),
        focusStreak: 0,
        totalSessions: 0,
      };

      const updatedSession = {
        ...session,
        partner: newPartner,
      };

      // Update in appropriate list
      if (availableSessions.find(s => s.id === sessionId)) {
        const updatedAvailableSessions = availableSessions.map(s => 
          s.id === sessionId ? updatedSession : s
        );
        set({ availableSessions: updatedAvailableSessions });
      } else {
        const updatedMySessions = mySessions.map(s => 
          s.id === sessionId ? updatedSession : s
        );
        set({ mySessions: updatedMySessions });
      }

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to join pair focus session' });
      console.error('Join pair focus session error:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Leave session
  leaveSession: async (sessionId) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: PairFocusSession[]) => 
        sessions.map(session => 
          session.id === sessionId 
            ? { ...session, partner: null }
            : session
        );

      set({
        availableSessions: updateSession(availableSessions),
        mySessions: updateSession(mySessions),
      });

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to leave pair focus session' });
      console.error('Leave pair focus session error:', error);
      return false;
    }
  },

  // Start session
  startSession: async (sessionId) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: PairFocusSession[]) =>
        sessions.map(session =>
          session.id === sessionId
            ? { 
                ...session, 
                isActive: true, 
                startTime: new Date(),
                currentPhase: 'pomodoro' as const
              }
            : session
        );

      set({
        availableSessions: updateSession(availableSessions),
        mySessions: updateSession(mySessions),
        currentSession: updateSession([...availableSessions, ...mySessions].find(s => s.id === sessionId) || null),
      });

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to start pair focus session' });
      console.error('Start pair focus session error:', error);
      return false;
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: PairFocusSession[]) =>
        sessions.map(session =>
          session.id === sessionId
            ? { 
                ...session, 
                isActive: false, 
                endTime: new Date(),
                currentPhase: 'completed' as const
              }
            : session
        );

      set({
        availableSessions: updateSession(availableSessions),
        mySessions: updateSession(mySessions),
        currentSession: null,
      });

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to end pair focus session' });
      console.error('End pair focus session error:', error);
      return false;
    }
  },

  // Update session settings
  updateSessionSettings: async (sessionId, newSettings) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: PairFocusSession[]) =>
        sessions.map(session =>
          session.id === sessionId
            ? { ...session, settings: { ...session.settings, ...newSettings } }
            : session
        );

      set({
        availableSessions: updateSession(availableSessions),
        mySessions: updateSession(mySessions),
      });

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to update pair focus session settings' });
      console.error('Update pair focus session settings error:', error);
      return false;
    }
  },

  // Send message
  sendMessage: async (sessionId, message, type = 'text') => {
    try {
      const { availableSessions, mySessions } = get();
      
      const newMessage = {
        id: `msg-${Date.now()}`,
        userId: 'current-user-id',
        userName: 'You',
        message,
        timestamp: new Date(),
        type,
      };

      const updateSession = (sessions: PairFocusSession[]) =>
        sessions.map(session =>
          session.id === sessionId
            ? { 
                ...session, 
                chat: { 
                  messages: [...session.chat.messages, newMessage] 
                } 
              }
            : session
        );

      set({
        availableSessions: updateSession(availableSessions),
        mySessions: updateSession(mySessions),
      });

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to send message' });
      console.error('Send message error:', error);
      return false;
    }
  },

  // Send encouragement
  sendEncouragement: async (sessionId, encouragement) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const encouragementMessage = {
        id: `enc-${Date.now()}`,
        userId: 'current-user-id',
        userName: 'You',
        message: encouragement,
        timestamp: new Date(),
        type: 'encouragement' as const,
      };

      const updateSession = (sessions: PairFocusSession[]) =>
        sessions.map(session => {
          if (session.id === sessionId) {
            const updatedMessages = [...session.chat.messages, encouragementMessage];
            return {
              ...session,
              chat: { messages: updatedMessages },
              statistics: {
                ...session.statistics,
                mutualEncouragements: session.statistics.mutualEncouragements + 1,
              },
            };
          }
          return session;
        });

      set({
        availableSessions: updateSession(availableSessions),
        mySessions: updateSession(mySessions),
      });

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to send encouragement' });
      console.error('Send encouragement error:', error);
      return false;
    }
  },

  // Update statistics
  updateStatistics: async (sessionId, focusCompleted) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: PairFocusSession[]) =>
        sessions.map(session => {
          if (session.id === sessionId) {
            const totalSessions = session.statistics.totalSessions + 1;
            const totalFocusTime = session.statistics.totalFocusTime + (focusCompleted ? session.settings.pomodoroDuration : 0);
            const averageFocusTime = totalSessions > 0 ? totalFocusTime / totalSessions : 0;
            const completionRate = totalSessions > 0 ? (focusCompleted ? 100 : 0) : 0;

            return {
              ...session,
              statistics: {
                ...session.statistics,
                totalSessions,
                totalFocusTime,
                averageFocusTime,
                completionRate,
              },
            };
          }
          return session;
        });

      set({
        availableSessions: updateSession(availableSessions),
        mySessions: updateSession(mySessions),
      });

      await get().saveSessions();
    } catch (error) {
      console.error('Update pair focus statistics error:', error);
    }
  },

  // Update settings
  updateSettings: async (newSettings) => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem('pairFocusSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      set({ error: 'Failed to update pair focus settings' });
      console.error('Update pair focus settings error:', error);
    }
  },

  // Add preferred partner
  addPreferredPartner: async (partnerId) => {
    try {
      const { settings } = get();
      const updatedSettings = {
        ...settings,
        preferredPartners: [...settings.preferredPartners, partnerId],
      };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem('pairFocusSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      set({ error: 'Failed to add preferred partner' });
      console.error('Add preferred partner error:', error);
    }
  },

  // Remove preferred partner
  removePreferredPartner: async (partnerId) => {
    try {
      const { settings } = get();
      const updatedSettings = {
        ...settings,
        preferredPartners: settings.preferredPartners.filter(id => id !== partnerId),
      };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem('pairFocusSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      set({ error: 'Failed to remove preferred partner' });
      console.error('Remove preferred partner error:', error);
    }
  },

  // Block user
  blockUser: async (userId) => {
    try {
      const { settings } = get();
      const updatedSettings = {
        ...settings,
        blockedUsers: [...settings.blockedUsers, userId],
      };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem('pairFocusSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      set({ error: 'Failed to block user' });
      console.error('Block user error:', error);
    }
  },

  // Unblock user
  unblockUser: async (userId) => {
    try {
      const { settings } = get();
      const updatedSettings = {
        ...settings,
        blockedUsers: settings.blockedUsers.filter(id => id !== userId),
      };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem('pairFocusSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      set({ error: 'Failed to unblock user' });
      console.error('Unblock user error:', error);
    }
  },

  // Load sessions
  loadSessions: async () => {
    try {
      set({ loading: true });
      
      const [savedSessions, savedSettings] = await Promise.all([
        AsyncStorage.getItem('pairFocusSessions'),
        AsyncStorage.getItem('pairFocusSettings'),
      ]);

      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        set({ 
          availableSessions: sessions.filter((s: PairFocusSession) => !s.isActive && !s.partner),
          mySessions: sessions.filter((s: PairFocusSession) => s.hostId === 'current-user-id'),
        });
      }

      if (savedSettings) {
        set({ settings: JSON.parse(savedSettings) });
      }
    } catch (error) {
      set({ error: 'Failed to load pair focus sessions' });
      console.error('Load pair focus sessions error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Save sessions
  saveSessions: async () => {
    try {
      const { availableSessions, mySessions } = get();
      const allSessions = [...availableSessions, ...mySessions];
      await AsyncStorage.setItem('pairFocusSessions', JSON.stringify(allSessions));
    } catch (error) {
      set({ error: 'Failed to save pair focus sessions' });
      console.error('Save pair focus sessions error:', error);
    }
  },

  // Clear data
  clearData: async () => {
    try {
      await AsyncStorage.multiRemove(['pairFocusSessions', 'pairFocusSettings']);
      set({
        currentSession: null,
        availableSessions: [],
        mySessions: [],
        error: null,
      });
    } catch (error) {
      set({ error: 'Failed to clear pair focus data' });
      console.error('Clear pair focus data error:', error);
    }
  },
}));
