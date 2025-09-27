import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
  xp: number;
  badges: string[];
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen: Date;
  bio?: string;
  location?: string;
  timezone?: string;
  preferences: {
    privacy: 'public' | 'friends' | 'private';
    notifications: boolean;
    friendRequests: boolean;
    sessionInvites: boolean;
  };
  stats: {
    totalPomodoros: number;
    totalTime: number;
    currentStreak: number;
    longestStreak: number;
    focusScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  status: 'active' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionInvite {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialSettings {
  enableSocialFeatures: boolean;
  allowFriendRequests: boolean;
  allowSessionInvites: boolean;
  showOnlineStatus: boolean;
  showActivity: boolean;
  privacy: 'public' | 'friends' | 'private';
  notifications: {
    friendRequests: boolean;
    sessionInvites: boolean;
    achievements: boolean;
    messages: boolean;
  };
}

export const useSocialFeatures = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP, badges } = useGamificationStore();

  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sessionInvites, setSessionInvites] = useState<SessionInvite[]>([]);
  const [settings, setSettings] = useState<SocialSettings>({
    enableSocialFeatures: true,
    allowFriendRequests: true,
    allowSessionInvites: true,
    showOnlineStatus: true,
    showActivity: true,
    privacy: 'friends',
    notifications: {
      friendRequests: true,
      sessionInvites: true,
      achievements: true,
      messages: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search users
  const searchUsers = async (query: string): Promise<User[]> => {
    try {
      // In a real app, this would make an API call
      const filteredUsers = (users || []).filter(
        user =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.displayName.toLowerCase().includes(query.toLowerCase())
      );
      return filteredUsers;
    } catch (err) {
      console.error('Search users error:', err);
      return [];
    }
  };

  // Send friend request
  const sendFriendRequest = async (
    toUserId: string,
    message?: string
  ): Promise<boolean> => {
    try {
      const newRequest: FriendRequest = {
        id: `request-${Date.now()}-${Math.random()}`,
        fromUserId: 'current-user-id', // In a real app, get from auth
        toUserId,
        status: 'pending',
        message,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setFriendRequests(prev => [...prev, newRequest]);
      return true;
    } catch (err) {
      console.error('Send friend request error:', err);
      return false;
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const request = friendRequests.find(r => r.id === requestId);
      if (!request) return false;

      // Update request status
      setFriendRequests(prev =>
        (prev || []).map(r =>
          r.id === requestId
            ? { ...r, status: 'accepted', updatedAt: new Date() }
            : r
        )
      );

      // Create friendship
      const newFriendship: Friendship = {
        id: `friendship-${Date.now()}-${Math.random()}`,
        userId1: request.fromUserId,
        userId2: request.toUserId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setFriends(prev => [...prev, newFriendship]);
      return true;
    } catch (err) {
      console.error('Accept friend request error:', err);
      return false;
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      setFriendRequests(prev =>
        (prev || []).map(r =>
          r.id === requestId
            ? { ...r, status: 'rejected', updatedAt: new Date() }
            : r
        )
      );
      return true;
    } catch (err) {
      console.error('Reject friend request error:', err);
      return false;
    }
  };

  // Remove friend
  const removeFriend = async (friendshipId: string): Promise<boolean> => {
    try {
      setFriends(prev => (prev || []).filter(f => f.id !== friendshipId));
      return true;
    } catch (err) {
      console.error('Remove friend error:', err);
      return false;
    }
  };

  // Block user
  const blockUser = async (userId: string): Promise<boolean> => {
    try {
      // Find existing friendship and update status
      setFriends(prev =>
        (prev || []).map(f =>
          f.userId1 === userId || f.userId2 === userId
            ? { ...f, status: 'blocked', updatedAt: new Date() }
            : f
        )
      );
      return true;
    } catch (err) {
      console.error('Block user error:', err);
      return false;
    }
  };

  // Unblock user
  const unblockUser = async (userId: string): Promise<boolean> => {
    try {
      setFriends(prev =>
        (prev || []).map(f =>
          f.userId1 === userId || f.userId2 === userId
            ? { ...f, status: 'active', updatedAt: new Date() }
            : f
        )
      );
      return true;
    } catch (err) {
      console.error('Unblock user error:', err);
      return false;
    }
  };

  // Send session invite
  const sendSessionInvite = async (
    sessionId: string,
    toUserId: string,
    message?: string,
    expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<boolean> => {
    try {
      const newInvite: SessionInvite = {
        id: `invite-${Date.now()}-${Math.random()}`,
        sessionId,
        fromUserId: 'current-user-id', // In a real app, get from auth
        toUserId,
        message,
        status: 'pending',
        expiresAt: new Date(Date.now() + expiresIn),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessionInvites(prev => [...prev, newInvite]);
      return true;
    } catch (err) {
      console.error('Send session invite error:', err);
      return false;
    }
  };

  // Accept session invite
  const acceptSessionInvite = async (inviteId: string): Promise<boolean> => {
    try {
      setSessionInvites(prev =>
        (prev || []).map(invite =>
          invite.id === inviteId
            ? { ...invite, status: 'accepted', updatedAt: new Date() }
            : invite
        )
      );
      return true;
    } catch (err) {
      console.error('Accept session invite error:', err);
      return false;
    }
  };

  // Reject session invite
  const rejectSessionInvite = async (inviteId: string): Promise<boolean> => {
    try {
      setSessionInvites(prev =>
        (prev || []).map(invite =>
          invite.id === inviteId
            ? { ...invite, status: 'rejected', updatedAt: new Date() }
            : invite
        )
      );
      return true;
    } catch (err) {
      console.error('Reject session invite error:', err);
      return false;
    }
  };

  // Get user profile
  const getUserProfile = (userId: string): User | null => {
    return users.find(user => user.id === userId) || null;
  };

  // Get friends list
  const getFriendsList = (): User[] => {
    const friendUserIds = (friends || [])
      .filter(f => f.status === 'active')
      .map(f => (f.userId1 === 'current-user-id' ? f.userId2 : f.userId1));

    return (users || []).filter(user => friendUserIds.includes(user.id));
  };

  // Get pending friend requests
  const getPendingFriendRequests = (): FriendRequest[] => {
    return (friendRequests || []).filter(
      request =>
        request.toUserId === 'current-user-id' && request.status === 'pending'
    );
  };

  // Get sent friend requests
  const getSentFriendRequests = (): FriendRequest[] => {
    return (friendRequests || []).filter(
      request =>
        request.fromUserId === 'current-user-id' && request.status === 'pending'
    );
  };

  // Get pending session invites
  const getPendingSessionInvites = (): SessionInvite[] => {
    return (sessionInvites || []).filter(
      invite =>
        invite.toUserId === 'current-user-id' && invite.status === 'pending'
    );
  };

  // Get social insights
  const getSocialInsights = () => {
    const friendsList = getFriendsList();
    const pendingRequests = getPendingFriendRequests();
    const sentRequests = getSentFriendRequests();
    const pendingInvites = getPendingSessionInvites();

    return {
      totalFriends: friendsList.length,
      pendingFriendRequests: pendingRequests.length,
      sentFriendRequests: sentRequests.length,
      pendingSessionInvites: pendingInvites.length,
      socialFeaturesEnabled: settings.enableSocialFeatures,
      onlineFriends: (friendsList || []).filter(friend => friend.status === 'online')
        .length,
      activeFriends: (friendsList || []).filter(
        friend => friend.status === 'online' || friend.status === 'busy'
      ).length,
    };
  };

  // Update settings
  const updateSettings = (newSettings: Partial<SocialSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Initialize social features
  useEffect(() => {
    if (settings.enableSocialFeatures) {
      // Initialize with sample data
      const sampleUsers: User[] = [
        {
          id: 'user-1',
          username: 'johndoe',
          displayName: 'John Doe',
          level: 15,
          xp: 2500,
          badges: ['early_bird', 'focused_warrior'],
          status: 'online',
          lastSeen: new Date(),
          bio: 'Productivity enthusiast',
          location: 'New York',
          timezone: 'America/New_York',
          preferences: {
            privacy: 'friends',
            notifications: true,
            friendRequests: true,
            sessionInvites: true,
          },
          stats: {
            totalPomodoros: 150,
            totalTime: 3750,
            currentStreak: 7,
            longestStreak: 21,
            focusScore: 85,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          username: 'janedoe',
          displayName: 'Jane Doe',
          level: 12,
          xp: 1800,
          badges: ['streak_master', 'team_player'],
          status: 'busy',
          lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          bio: 'Focus on what matters',
          location: 'London',
          timezone: 'Europe/London',
          preferences: {
            privacy: 'friends',
            notifications: true,
            friendRequests: true,
            sessionInvites: true,
          },
          stats: {
            totalPomodoros: 120,
            totalTime: 3000,
            currentStreak: 5,
            longestStreak: 15,
            focusScore: 78,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setUsers(sampleUsers);
    }
  }, [settings.enableSocialFeatures]);

  return {
    users,
    friends,
    friendRequests,
    sessionInvites,
    settings,
    loading,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    sendSessionInvite,
    acceptSessionInvite,
    rejectSessionInvite,
    getUserProfile,
    getFriendsList,
    getPendingFriendRequests,
    getSentFriendRequests,
    getPendingSessionInvites,
    getSocialInsights,
    updateSettings,
  };
};
