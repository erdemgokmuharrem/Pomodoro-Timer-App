import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  currentTask?: string;
  pomodoroCount: number;
  joinTime: Date;
}

export interface GroupPomodoroSession {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  members: GroupMember[];
  maxMembers: number;
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
    chatEnabled: boolean;
  };
  chat: {
    messages: Array<{
      id: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: Date;
      type: 'text' | 'system' | 'emoji';
    }>;
  };
  statistics: {
    totalPomodoros: number;
    totalFocusTime: number; // minutes
    averageFocusTime: number; // minutes
    completionRate: number; // percentage
  };
}

export interface GroupPomodoroSettings {
  defaultMaxMembers: number;
  allowGuests: boolean;
  requireApproval: boolean;
  autoStartSessions: boolean;
  enableChat: boolean;
  enableStatistics: boolean;
  enableScreenSharing: boolean;
  enableVoiceChat: boolean;
}

interface GroupPomodoroStore {
  // State
  currentSession: GroupPomodoroSession | null;
  availableSessions: GroupPomodoroSession[];
  mySessions: GroupPomodoroSession[];
  settings: GroupPomodoroSettings;
  loading: boolean;
  error: string | null;

  // Actions
  createSession: (sessionData: Omit<GroupPomodoroSession, 'id' | 'hostId' | 'members' | 'chat' | 'statistics'>) => Promise<string>;
  joinSession: (sessionId: string, memberData: Omit<GroupMember, 'id' | 'joinTime' | 'pomodoroCount'>) => Promise<boolean>;
  leaveSession: (sessionId: string, memberId: string) => Promise<boolean>;
  startSession: (sessionId: string) => Promise<boolean>;
  endSession: (sessionId: string) => Promise<boolean>;
  updateSessionSettings: (sessionId: string, settings: Partial<GroupPomodoroSession['settings']>) => Promise<boolean>;
  
  // Chat
  sendMessage: (sessionId: string, message: string, type?: 'text' | 'emoji') => Promise<boolean>;
  
  // Statistics
  updateStatistics: (sessionId: string, memberId: string, pomodoroCompleted: boolean) => Promise<void>;
  
  // Settings
  updateSettings: (newSettings: Partial<GroupPomodoroSettings>) => Promise<void>;
  
  // Data management
  loadSessions: () => Promise<void>;
  saveSessions: () => Promise<void>;
  clearData: () => Promise<void>;
}

export const useGroupPomodoroStore = create<GroupPomodoroStore>((set, get) => ({
  // Initial state
  currentSession: null,
  availableSessions: [],
  mySessions: [],
  settings: {
    defaultMaxMembers: 8,
    allowGuests: true,
    requireApproval: false,
    autoStartSessions: false,
    enableChat: true,
    enableStatistics: true,
    enableScreenSharing: false,
    enableVoiceChat: false,
  },
  loading: false,
  error: null,

  // Create session
  createSession: async (sessionData) => {
    try {
      set({ loading: true, error: null });
      
      const newSession: GroupPomodoroSession = {
        ...sessionData,
        id: `session-${Date.now()}`,
        hostId: 'current-user-id', // In real app, get from auth
        members: [],
        chat: { messages: [] },
        statistics: {
          totalPomodoros: 0,
          totalFocusTime: 0,
          averageFocusTime: 0,
          completionRate: 0,
        },
      };

      const { mySessions } = get();
      const updatedMySessions = [...mySessions, newSession];
      
      set({ mySessions: updatedMySessions });
      await get().saveSessions();
      
      return newSession.id;
    } catch (error) {
      set({ error: 'Failed to create session' });
      console.error('Create session error:', error);
      return '';
    } finally {
      set({ loading: false });
    }
  },

  // Join session
  joinSession: async (sessionId, memberData) => {
    try {
      set({ loading: true, error: null });
      
      const { availableSessions, mySessions } = get();
      const session = availableSessions.find(s => s.id === sessionId) || 
                     mySessions.find(s => s.id === sessionId);
      
      if (!session) {
        set({ error: 'Session not found' });
        return false;
      }

      if (session.members.length >= session.maxMembers) {
        set({ error: 'Session is full' });
        return false;
      }

      const newMember: GroupMember = {
        ...memberData,
        id: `member-${Date.now()}`,
        joinTime: new Date(),
        pomodoroCount: 0,
      };

      const updatedSession = {
        ...session,
        members: [...session.members, newMember],
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
      set({ error: 'Failed to join session' });
      console.error('Join session error:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Leave session
  leaveSession: async (sessionId, memberId) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSessionMembers = (sessions: GroupPomodoroSession[]) => 
        sessions.map(session => 
          session.id === sessionId 
            ? { ...session, members: session.members.filter(m => m.id !== memberId) }
            : session
        );

      set({
        availableSessions: updateSessionMembers(availableSessions),
        mySessions: updateSessionMembers(mySessions),
      });

      await get().saveSessions();
      return true;
    } catch (error) {
      set({ error: 'Failed to leave session' });
      console.error('Leave session error:', error);
      return false;
    }
  },

  // Start session
  startSession: async (sessionId) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: GroupPomodoroSession[]) =>
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
      set({ error: 'Failed to start session' });
      console.error('Start session error:', error);
      return false;
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: GroupPomodoroSession[]) =>
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
      set({ error: 'Failed to end session' });
      console.error('End session error:', error);
      return false;
    }
  },

  // Update session settings
  updateSessionSettings: async (sessionId, newSettings) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: GroupPomodoroSession[]) =>
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
      set({ error: 'Failed to update session settings' });
      console.error('Update session settings error:', error);
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

      const updateSession = (sessions: GroupPomodoroSession[]) =>
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

  // Update statistics
  updateStatistics: async (sessionId, memberId, pomodoroCompleted) => {
    try {
      const { availableSessions, mySessions } = get();
      
      const updateSession = (sessions: GroupPomodoroSession[]) =>
        sessions.map(session => {
          if (session.id === sessionId) {
            const updatedMembers = session.members.map(member =>
              member.id === memberId
                ? { ...member, pomodoroCount: member.pomodoroCount + (pomodoroCompleted ? 1 : 0) }
                : member
            );

            const totalPomodoros = updatedMembers.reduce((sum, member) => sum + member.pomodoroCount, 0);
            const totalFocusTime = totalPomodoros * session.settings.pomodoroDuration;
            const averageFocusTime = updatedMembers.length > 0 ? totalFocusTime / updatedMembers.length : 0;
            const completionRate = updatedMembers.length > 0 ? (totalPomodoros / (updatedMembers.length * 4)) * 100 : 0; // Assuming 4 pomodoros per session

            return {
              ...session,
              members: updatedMembers,
              statistics: {
                totalPomodoros,
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
      console.error('Update statistics error:', error);
    }
  },

  // Update settings
  updateSettings: async (newSettings) => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem('groupPomodoroSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      set({ error: 'Failed to update settings' });
      console.error('Update settings error:', error);
    }
  },

  // Load sessions
  loadSessions: async () => {
    try {
      set({ loading: true });
      
      const [savedSessions, savedSettings] = await Promise.all([
        AsyncStorage.getItem('groupPomodoroSessions'),
        AsyncStorage.getItem('groupPomodoroSettings'),
      ]);

      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        set({ 
          availableSessions: sessions.filter((s: GroupPomodoroSession) => !s.isActive),
          mySessions: sessions.filter((s: GroupPomodoroSession) => s.hostId === 'current-user-id'),
        });
      }

      if (savedSettings) {
        set({ settings: JSON.parse(savedSettings) });
      }
    } catch (error) {
      set({ error: 'Failed to load sessions' });
      console.error('Load sessions error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Save sessions
  saveSessions: async () => {
    try {
      const { availableSessions, mySessions } = get();
      const allSessions = [...availableSessions, ...mySessions];
      await AsyncStorage.setItem('groupPomodoroSessions', JSON.stringify(allSessions));
    } catch (error) {
      set({ error: 'Failed to save sessions' });
      console.error('Save sessions error:', error);
    }
  },

  // Clear data
  clearData: async () => {
    try {
      await AsyncStorage.multiRemove(['groupPomodoroSessions', 'groupPomodoroSettings']);
      set({
        currentSession: null,
        availableSessions: [],
        mySessions: [],
        error: null,
      });
    } catch (error) {
      set({ error: 'Failed to clear data' });
      console.error('Clear data error:', error);
    }
  },
}));
