import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FocusRoomMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  currentTask?: string;
  focusStreak: number;
  totalSessions: number;
  joinTime: Date;
  isHost: boolean;
  isModerator: boolean;
}

export interface FocusRoom {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  members: FocusRoomMember[];
  maxMembers: number;
  isActive: boolean;
  isPublic: boolean;
  category: 'study' | 'work' | 'creative' | 'fitness' | 'meditation' | 'other';
  theme:
    | 'forest'
    | 'ocean'
    | 'mountain'
    | 'city'
    | 'space'
    | 'library'
    | 'cafe';
  backgroundMusic?: string;
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
    backgroundMusicEnabled: boolean;
    chatEnabled: boolean;
    videoEnabled: boolean;
    screenSharingEnabled: boolean;
    allowGuests: boolean;
    requireApproval: boolean;
  };
  chat: {
    messages: Array<{
      id: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: Date;
      type: 'text' | 'system' | 'emoji' | 'encouragement' | 'achievement';
    }>;
  };
  statistics: {
    totalSessions: number;
    totalFocusTime: number; // minutes
    averageFocusTime: number; // minutes
    completionRate: number; // percentage
    totalMembers: number;
    activeMembers: number;
  };
  rules: {
    allowedTopics: string[];
    prohibitedContent: string[];
    focusLevel: 'strict' | 'moderate' | 'relaxed';
    breakPolicy: 'synchronized' | 'individual' | 'flexible';
  };
}

export interface FocusRoomsSettings {
  defaultMaxMembers: number;
  allowPublicRooms: boolean;
  allowPrivateRooms: boolean;
  enableBackgroundMusic: boolean;
  enableVideo: boolean;
  enableScreenSharing: boolean;
  autoJoinRooms: boolean;
  preferredCategories: string[];
  blockedUsers: string[];
  roomNotifications: boolean;
}

interface FocusRoomsStore {
  // State
  currentRoom: FocusRoom | null;
  availableRooms: FocusRoom[];
  myRooms: FocusRoom[];
  joinedRooms: FocusRoom[];
  settings: FocusRoomsSettings;
  loading: boolean;
  error: string | null;

  // Actions
  createRoom: (
    roomData: Omit<
      FocusRoom,
      'id' | 'hostId' | 'members' | 'chat' | 'statistics'
    >
  ) => Promise<string>;
  joinRoom: (
    roomId: string,
    memberData: Omit<
      FocusRoomMember,
      | 'id'
      | 'joinTime'
      | 'focusStreak'
      | 'totalSessions'
      | 'isHost'
      | 'isModerator'
    >
  ) => Promise<boolean>;
  leaveRoom: (roomId: string, memberId: string) => Promise<boolean>;
  startRoom: (roomId: string) => Promise<boolean>;
  endRoom: (roomId: string) => Promise<boolean>;
  updateRoomSettings: (
    roomId: string,
    settings: Partial<FocusRoom['settings']>
  ) => Promise<boolean>;

  // Room management
  promoteToModerator: (roomId: string, memberId: string) => Promise<boolean>;
  removeMember: (roomId: string, memberId: string) => Promise<boolean>;
  updateRoomRules: (
    roomId: string,
    rules: Partial<FocusRoom['rules']>
  ) => Promise<boolean>;

  // Chat & Interactions
  sendMessage: (
    roomId: string,
    message: string,
    type?: 'text' | 'emoji' | 'encouragement' | 'achievement'
  ) => Promise<boolean>;
  sendEncouragement: (
    roomId: string,
    encouragement: string,
    targetUserId?: string
  ) => Promise<boolean>;
  shareAchievement: (roomId: string, achievement: string) => Promise<boolean>;

  // Room discovery
  searchRooms: (
    query: string,
    category?: string,
    theme?: string
  ) => Promise<FocusRoom[]>;
  getRecommendedRooms: () => Promise<FocusRoom[]>;
  getTrendingRooms: () => Promise<FocusRoom[]>;

  // Statistics
  updateRoomStatistics: (
    roomId: string,
    memberId: string,
    focusCompleted: boolean
  ) => Promise<void>;
  getRoomLeaderboard: (roomId: string) => Promise<FocusRoomMember[]>;

  // Settings
  updateSettings: (newSettings: Partial<FocusRoomsSettings>) => Promise<void>;

  // Data management
  loadRooms: () => Promise<void>;
  saveRooms: () => Promise<void>;
  clearData: () => Promise<void>;
}

export const useFocusRoomsStore = create<FocusRoomsStore>((set, get) => ({
  // Initial state
  currentRoom: null,
  availableRooms: [],
  myRooms: [],
  joinedRooms: [],
  settings: {
    defaultMaxMembers: 20,
    allowPublicRooms: true,
    allowPrivateRooms: true,
    enableBackgroundMusic: true,
    enableVideo: false,
    enableScreenSharing: false,
    autoJoinRooms: false,
    preferredCategories: [],
    blockedUsers: [],
    roomNotifications: true,
  },
  loading: false,
  error: null,

  // Create room
  createRoom: async roomData => {
    try {
      set({ loading: true, error: null });

      const newRoom: FocusRoom = {
        ...roomData,
        id: `room-${Date.now()}`,
        hostId: 'current-user-id', // In real app, get from auth
        members: [],
        chat: { messages: [] },
        statistics: {
          totalSessions: 0,
          totalFocusTime: 0,
          averageFocusTime: 0,
          completionRate: 0,
          totalMembers: 0,
          activeMembers: 0,
        },
        rules: {
          allowedTopics: [],
          prohibitedContent: [],
          focusLevel: 'moderate',
          breakPolicy: 'synchronized',
        },
      };

      const { myRooms } = get();
      const updatedMyRooms = [...myRooms, newRoom];

      set({ myRooms: updatedMyRooms });
      await get().saveRooms();

      return newRoom.id;
    } catch (error) {
      set({ error: 'Failed to create focus room' });
      console.error('Create focus room error:', error);
      return '';
    } finally {
      set({ loading: false });
    }
  },

  // Join room
  joinRoom: async (roomId, memberData) => {
    try {
      set({ loading: true, error: null });

      const { availableRooms, myRooms, joinedRooms } = get();
      const room =
        availableRooms.find(r => r.id === roomId) ||
        myRooms.find(r => r.id === roomId);

      if (!room) {
        set({ error: 'Room not found' });
        return false;
      }

      if (room.members.length >= room.maxMembers) {
        set({ error: 'Room is full' });
        return false;
      }

      const newMember: FocusRoomMember = {
        ...memberData,
        id: `member-${Date.now()}`,
        joinTime: new Date(),
        focusStreak: 0,
        totalSessions: 0,
        isHost: false,
        isModerator: false,
      };

      const updatedRoom = {
        ...room,
        members: [...room.members, newMember],
        statistics: {
          ...room.statistics,
          totalMembers: room.members.length + 1,
          activeMembers: room.members.filter(m => m.isOnline).length + 1,
        },
      };

      // Update in appropriate lists
      if (availableRooms.find(r => r.id === roomId)) {
        const updatedAvailableRooms = availableRooms.map(r =>
          r.id === roomId ? updatedRoom : r
        );
        set({ availableRooms: updatedAvailableRooms });
      } else {
        const updatedMyRooms = myRooms.map(r =>
          r.id === roomId ? updatedRoom : r
        );
        set({ myRooms: updatedMyRooms });
      }

      // Add to joined rooms if not already there
      if (!joinedRooms.find(r => r.id === roomId)) {
        set({ joinedRooms: [...joinedRooms, updatedRoom] });
      }

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to join focus room' });
      console.error('Join focus room error:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Leave room
  leaveRoom: async (roomId, memberId) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoomMembers = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? {
                ...room,
                members: room.members.filter(m => m.id !== memberId),
                statistics: {
                  ...room.statistics,
                  totalMembers: Math.max(0, room.statistics.totalMembers - 1),
                  activeMembers: room.members.filter(
                    m => m.isOnline && m.id !== memberId
                  ).length,
                },
              }
            : room
        );

      set({
        availableRooms: updateRoomMembers(availableRooms),
        myRooms: updateRoomMembers(myRooms),
        joinedRooms: joinedRooms.filter(r => r.id !== roomId),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to leave focus room' });
      console.error('Leave focus room error:', error);
      return false;
    }
  },

  // Start room
  startRoom: async roomId => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? {
                ...room,
                isActive: true,
                startTime: new Date(),
                currentPhase: 'pomodoro' as const,
              }
            : room
        );

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
        currentRoom: updateRoom(
          [...availableRooms, ...myRooms, ...joinedRooms].find(
            r => r.id === roomId
          ) || null
        ),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to start focus room' });
      console.error('Start focus room error:', error);
      return false;
    }
  },

  // End room
  endRoom: async roomId => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? {
                ...room,
                isActive: false,
                endTime: new Date(),
                currentPhase: 'completed' as const,
              }
            : room
        );

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
        currentRoom: null,
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to end focus room' });
      console.error('End focus room error:', error);
      return false;
    }
  },

  // Update room settings
  updateRoomSettings: async (roomId, newSettings) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? { ...room, settings: { ...room.settings, ...newSettings } }
            : room
        );

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to update room settings' });
      console.error('Update room settings error:', error);
      return false;
    }
  },

  // Promote to moderator
  promoteToModerator: async (roomId, memberId) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? {
                ...room,
                members: room.members.map(member =>
                  member.id === memberId
                    ? { ...member, isModerator: true }
                    : member
                ),
              }
            : room
        );

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to promote member' });
      console.error('Promote member error:', error);
      return false;
    }
  },

  // Remove member
  removeMember: async (roomId, memberId) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? {
                ...room,
                members: room.members.filter(member => member.id !== memberId),
                statistics: {
                  ...room.statistics,
                  totalMembers: Math.max(0, room.statistics.totalMembers - 1),
                },
              }
            : room
        );

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to remove member' });
      console.error('Remove member error:', error);
      return false;
    }
  },

  // Update room rules
  updateRoomRules: async (roomId, newRules) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? { ...room, rules: { ...room.rules, ...newRules } }
            : room
        );

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to update room rules' });
      console.error('Update room rules error:', error);
      return false;
    }
  },

  // Send message
  sendMessage: async (roomId, message, type = 'text') => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const newMessage = {
        id: `msg-${Date.now()}`,
        userId: 'current-user-id',
        userName: 'You',
        message,
        timestamp: new Date(),
        type,
      };

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room =>
          room.id === roomId
            ? {
                ...room,
                chat: {
                  messages: [...room.chat.messages, newMessage],
                },
              }
            : room
        );

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to send message' });
      console.error('Send message error:', error);
      return false;
    }
  },

  // Send encouragement
  sendEncouragement: async (roomId, encouragement, targetUserId) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const encouragementMessage = {
        id: `enc-${Date.now()}`,
        userId: 'current-user-id',
        userName: 'You',
        message: targetUserId
          ? `@${targetUserId} ${encouragement}`
          : encouragement,
        timestamp: new Date(),
        type: 'encouragement' as const,
      };

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room => {
          if (room.id === roomId) {
            const updatedMessages = [
              ...room.chat.messages,
              encouragementMessage,
            ];
            return {
              ...room,
              chat: { messages: updatedMessages },
            };
          }
          return room;
        });

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to send encouragement' });
      console.error('Send encouragement error:', error);
      return false;
    }
  },

  // Share achievement
  shareAchievement: async (roomId, achievement) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const achievementMessage = {
        id: `ach-${Date.now()}`,
        userId: 'current-user-id',
        userName: 'You',
        message: `🎉 ${achievement}`,
        timestamp: new Date(),
        type: 'achievement' as const,
      };

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room => {
          if (room.id === roomId) {
            const updatedMessages = [...room.chat.messages, achievementMessage];
            return {
              ...room,
              chat: { messages: updatedMessages },
            };
          }
          return room;
        });

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
      return true;
    } catch (error) {
      set({ error: 'Failed to share achievement' });
      console.error('Share achievement error:', error);
      return false;
    }
  },

  // Search rooms
  searchRooms: async (query, category, theme) => {
    try {
      const { availableRooms } = get();
      let filteredRooms = availableRooms;

      if (query) {
        filteredRooms = filteredRooms.filter(
          room =>
            room.name.toLowerCase().includes(query.toLowerCase()) ||
            room.description?.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (category) {
        filteredRooms = filteredRooms.filter(
          room => room.category === category
        );
      }

      if (theme) {
        filteredRooms = filteredRooms.filter(room => room.theme === theme);
      }

      return filteredRooms;
    } catch (error) {
      console.error('Search rooms error:', error);
      return [];
    }
  },

  // Get recommended rooms
  getRecommendedRooms: async () => {
    try {
      const { availableRooms, settings } = get();
      // Simple recommendation logic - in real app, this would use ML
      return availableRooms
        .filter(room => room.isPublic && room.members.length > 0)
        .sort((a, b) => b.members.length - a.members.length)
        .slice(0, 10);
    } catch (error) {
      console.error('Get recommended rooms error:', error);
      return [];
    }
  },

  // Get trending rooms
  getTrendingRooms: async () => {
    try {
      const { availableRooms } = get();
      // Simple trending logic - in real app, this would use activity metrics
      return availableRooms
        .filter(room => room.isPublic && room.isActive)
        .sort((a, b) => b.statistics.totalSessions - a.statistics.totalSessions)
        .slice(0, 10);
    } catch (error) {
      console.error('Get trending rooms error:', error);
      return [];
    }
  },

  // Update room statistics
  updateRoomStatistics: async (roomId, memberId, focusCompleted) => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();

      const updateRoom = (rooms: FocusRoom[]) =>
        rooms.map(room => {
          if (room.id === roomId) {
            const updatedMembers = room.members.map(member =>
              member.id === memberId
                ? {
                    ...member,
                    focusStreak: member.focusStreak + (focusCompleted ? 1 : 0),
                  }
                : member
            );

            const totalSessions = room.statistics.totalSessions + 1;
            const totalFocusTime =
              room.statistics.totalFocusTime +
              (focusCompleted ? room.settings.pomodoroDuration : 0);
            const averageFocusTime =
              totalSessions > 0 ? totalFocusTime / totalSessions : 0;
            const completionRate =
              totalSessions > 0 ? (focusCompleted ? 100 : 0) : 0;

            return {
              ...room,
              members: updatedMembers,
              statistics: {
                ...room.statistics,
                totalSessions,
                totalFocusTime,
                averageFocusTime,
                completionRate,
              },
            };
          }
          return room;
        });

      set({
        availableRooms: updateRoom(availableRooms),
        myRooms: updateRoom(myRooms),
        joinedRooms: updateRoom(joinedRooms),
      });

      await get().saveRooms();
    } catch (error) {
      console.error('Update room statistics error:', error);
    }
  },

  // Get room leaderboard
  getRoomLeaderboard: async roomId => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();
      const allRooms = [...availableRooms, ...myRooms, ...joinedRooms];
      const room = allRooms.find(r => r.id === roomId);

      if (!room) return [];

      return room.members
        .sort((a, b) => b.focusStreak - a.focusStreak)
        .slice(0, 10);
    } catch (error) {
      console.error('Get room leaderboard error:', error);
      return [];
    }
  },

  // Update settings
  updateSettings: async newSettings => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem(
        'focusRoomsSettings',
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      set({ error: 'Failed to update focus rooms settings' });
      console.error('Update focus rooms settings error:', error);
    }
  },

  // Load rooms
  loadRooms: async () => {
    try {
      set({ loading: true });

      const [savedRooms, savedSettings] = await Promise.all([
        AsyncStorage.getItem('focusRooms'),
        AsyncStorage.getItem('focusRoomsSettings'),
      ]);

      if (savedRooms) {
        const rooms = JSON.parse(savedRooms);
        set({
          availableRooms: rooms.filter(
            (r: FocusRoom) => r.isPublic && !r.isActive
          ),
          myRooms: rooms.filter(
            (r: FocusRoom) => r.hostId === 'current-user-id'
          ),
          joinedRooms: rooms.filter((r: FocusRoom) =>
            r.members.some(m => m.id === 'current-user-id')
          ),
        });
      }

      if (savedSettings) {
        set({ settings: JSON.parse(savedSettings) });
      }
    } catch (error) {
      set({ error: 'Failed to load focus rooms' });
      console.error('Load focus rooms error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Save rooms
  saveRooms: async () => {
    try {
      const { availableRooms, myRooms, joinedRooms } = get();
      const allRooms = [...availableRooms, ...myRooms, ...joinedRooms];
      await AsyncStorage.setItem('focusRooms', JSON.stringify(allRooms));
    } catch (error) {
      set({ error: 'Failed to save focus rooms' });
      console.error('Save focus rooms error:', error);
    }
  },

  // Clear data
  clearData: async () => {
    try {
      await AsyncStorage.multiRemove(['focusRooms', 'focusRoomsSettings']);
      set({
        currentRoom: null,
        availableRooms: [],
        myRooms: [],
        joinedRooms: [],
        error: null,
      });
    } catch (error) {
      set({ error: 'Failed to clear focus rooms data' });
      console.error('Clear focus rooms data error:', error);
    }
  },
}));
