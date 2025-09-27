import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LeaguePlayer {
  id: string;
  name: string;
  avatar?: string;
  currentLeague: string;
  currentTier: string;
  currentRank: number;
  totalPoints: number;
  weeklyPoints: number;
  streak: number;
  totalPomodoros: number;
  totalFocusTime: number; // minutes
  joinDate: Date;
  lastActive: Date;
  achievements: string[];
  badges: string[];
}

export interface LeagueTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: string;
  benefits: string[];
  promotionReward: number;
  demotionThreshold: number;
}

export interface LeagueMatch {
  id: string;
  players: LeaguePlayer[];
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  winner?: string;
  points: { [playerId: string]: number };
  isActive: boolean;
  type: 'pomodoro' | 'focus_time' | 'streak' | 'combo';
}

export interface LeagueSeason {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  totalPlayers: number;
  tiers: LeagueTier[];
  leaderboard: LeaguePlayer[];
  matches: LeagueMatch[];
  rewards: {
    top1: string[];
    top10: string[];
    top100: string[];
    participation: string[];
  };
}

export interface LeagueSettings {
  enableLeagues: boolean;
  autoJoin: boolean;
  matchmakingEnabled: boolean;
  seasonDuration: number; // weeks
  maxPlayersPerMatch: number;
  pointMultiplier: number;
  streakBonus: boolean;
  socialFeatures: boolean;
  notifications: boolean;
}

interface LeagueStore {
  // State
  currentSeason: LeagueSeason | null;
  myPlayer: LeaguePlayer | null;
  leaderboard: LeaguePlayer[];
  recentMatches: LeagueMatch[];
  availableTiers: LeagueTier[];
  settings: LeagueSettings;
  loading: boolean;
  error: string | null;

  // Player management
  createPlayer: (
    playerData: Omit<
      LeaguePlayer,
      | 'id'
      | 'currentLeague'
      | 'currentTier'
      | 'currentRank'
      | 'totalPoints'
      | 'weeklyPoints'
      | 'streak'
      | 'totalPomodoros'
      | 'totalFocusTime'
      | 'joinDate'
      | 'lastActive'
      | 'achievements'
      | 'badges'
    >
  ) => Promise<string>;
  updatePlayer: (updates: Partial<LeaguePlayer>) => Promise<void>;
  getPlayerStats: (playerId: string) => Promise<LeaguePlayer | null>;

  // League operations
  joinLeague: (leagueId: string) => Promise<boolean>;
  leaveLeague: (leagueId: string) => Promise<boolean>;
  startMatch: (
    matchData: Omit<
      LeagueMatch,
      'id' | 'startTime' | 'endTime' | 'isActive' | 'points'
    >
  ) => Promise<string>;
  endMatch: (
    matchId: string,
    results: { [playerId: string]: number }
  ) => Promise<boolean>;

  // Leaderboard & Rankings
  getLeaderboard: (tier?: string, limit?: number) => Promise<LeaguePlayer[]>;
  getPlayerRank: (playerId: string) => Promise<number>;
  getTierInfo: (tierId: string) => Promise<LeagueTier | null>;

  // Season management
  startNewSeason: (
    seasonData: Omit<
      LeagueSeason,
      'id' | 'isActive' | 'totalPlayers' | 'leaderboard' | 'matches'
    >
  ) => Promise<string>;
  endSeason: (seasonId: string) => Promise<boolean>;
  getSeasonRewards: (seasonId: string) => Promise<string[]>;

  // Matchmaking
  findMatch: (
    playerId: string,
    matchType: LeagueMatch['type']
  ) => Promise<LeagueMatch | null>;
  getMatchHistory: (playerId: string) => Promise<LeagueMatch[]>;

  // Achievements & Rewards
  unlockAchievement: (playerId: string, achievement: string) => Promise<void>;
  awardBadge: (playerId: string, badge: string) => Promise<void>;
  claimReward: (playerId: string, reward: string) => Promise<boolean>;

  // Settings
  updateSettings: (newSettings: Partial<LeagueSettings>) => Promise<void>;

  // Data management
  loadLeagueData: () => Promise<void>;
  saveLeagueData: () => Promise<void>;
  clearData: () => Promise<void>;
}

export const useLeagueStore = create<LeagueStore>((set, get) => ({
  // Initial state
  currentSeason: null,
  myPlayer: null,
  leaderboard: [],
  recentMatches: [],
  availableTiers: [
    {
      id: 'bronze',
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 999,
      color: '#CD7F32',
      icon: '🥉',
      benefits: ['Temel rozetler', 'Günlük ödüller'],
      promotionReward: 100,
      demotionThreshold: 0,
    },
    {
      id: 'silver',
      name: 'Silver',
      minPoints: 1000,
      maxPoints: 2499,
      color: '#C0C0C0',
      icon: '🥈',
      benefits: ['Gelişmiş rozetler', 'Haftalık ödüller', 'Özel temalar'],
      promotionReward: 250,
      demotionThreshold: 800,
    },
    {
      id: 'gold',
      name: 'Gold',
      minPoints: 2500,
      maxPoints: 4999,
      color: '#FFD700',
      icon: '🥇',
      benefits: [
        'Premium rozetler',
        'Günlük bonus',
        'Özel avatar',
        'Liderlik tablosu',
      ],
      promotionReward: 500,
      demotionThreshold: 2000,
    },
    {
      id: 'platinum',
      name: 'Platinum',
      minPoints: 5000,
      maxPoints: 9999,
      color: '#E5E4E2',
      icon: '💎',
      benefits: [
        'Elit rozetler',
        'Haftalık bonus',
        'Özel avatar',
        'Öncelikli destek',
      ],
      promotionReward: 1000,
      demotionThreshold: 4000,
    },
    {
      id: 'diamond',
      name: 'Diamond',
      minPoints: 10000,
      maxPoints: 19999,
      color: '#B9F2FF',
      icon: '💠',
      benefits: [
        'Efsanevi rozetler',
        'Günlük mega bonus',
        'Özel avatar',
        'VIP destek',
      ],
      promotionReward: 2000,
      demotionThreshold: 8000,
    },
    {
      id: 'master',
      name: 'Master',
      minPoints: 20000,
      maxPoints: 49999,
      color: '#8A2BE2',
      icon: '👑',
      benefits: [
        'Efsanevi rozetler',
        'Günlük mega bonus',
        'Özel avatar',
        'VIP destek',
        'Özel etkinlikler',
      ],
      promotionReward: 5000,
      demotionThreshold: 15000,
    },
    {
      id: 'grandmaster',
      name: 'Grandmaster',
      minPoints: 50000,
      maxPoints: 99999,
      color: '#FF4500',
      icon: '🏆',
      benefits: [
        'Efsanevi rozetler',
        'Günlük mega bonus',
        'Özel avatar',
        'VIP destek',
        'Özel etkinlikler',
        'Mentorluk',
      ],
      promotionReward: 10000,
      demotionThreshold: 40000,
    },
  ],
  settings: {
    enableLeagues: true,
    autoJoin: false,
    matchmakingEnabled: true,
    seasonDuration: 4, // 4 weeks
    maxPlayersPerMatch: 8,
    pointMultiplier: 1.0,
    streakBonus: true,
    socialFeatures: true,
    notifications: true,
  },
  loading: false,
  error: null,

  // Create player
  createPlayer: async playerData => {
    try {
      set({ loading: true, error: null });

      const newPlayer: LeaguePlayer = {
        ...playerData,
        id: `player-${Date.now()}`,
        currentLeague: 'general',
        currentTier: 'bronze',
        currentRank: 0,
        totalPoints: 0,
        weeklyPoints: 0,
        streak: 0,
        totalPomodoros: 0,
        totalFocusTime: 0,
        joinDate: new Date(),
        lastActive: new Date(),
        achievements: [],
        badges: [],
      };

      set({ myPlayer: newPlayer });
      await get().saveLeagueData();

      return newPlayer.id;
    } catch (error) {
      set({ error: 'Failed to create league player' });
      console.error('Create league player error:', error);
      return '';
    } finally {
      set({ loading: false });
    }
  },

  // Update player
  updatePlayer: async updates => {
    try {
      const { myPlayer } = get();
      if (!myPlayer) return;

      const updatedPlayer = { ...myPlayer, ...updates, lastActive: new Date() };
      set({ myPlayer: updatedPlayer });
      await get().saveLeagueData();
    } catch (error) {
      set({ error: 'Failed to update player' });
      console.error('Update player error:', error);
    }
  },

  // Get player stats
  getPlayerStats: async playerId => {
    try {
      const { myPlayer, leaderboard } = get();
      if (myPlayer && myPlayer.id === playerId) {
        return myPlayer;
      }
      return leaderboard.find(player => player.id === playerId) || null;
    } catch (error) {
      console.error('Get player stats error:', error);
      return null;
    }
  },

  // Join league
  joinLeague: async leagueId => {
    try {
      const { myPlayer } = get();
      if (!myPlayer) return false;

      await get().updatePlayer({ currentLeague: leagueId });
      return true;
    } catch (error) {
      set({ error: 'Failed to join league' });
      console.error('Join league error:', error);
      return false;
    }
  },

  // Leave league
  leaveLeague: async leagueId => {
    try {
      const { myPlayer } = get();
      if (!myPlayer || myPlayer.currentLeague !== leagueId) return false;

      await get().updatePlayer({ currentLeague: 'general' });
      return true;
    } catch (error) {
      set({ error: 'Failed to leave league' });
      console.error('Leave league error:', error);
      return false;
    }
  },

  // Start match
  startMatch: async matchData => {
    try {
      const newMatch: LeagueMatch = {
        ...matchData,
        id: `match-${Date.now()}`,
        startTime: new Date(),
        endTime: new Date(Date.now() + matchData.duration * 60 * 1000),
        isActive: true,
        points: {},
      };

      const { recentMatches } = get();
      set({ recentMatches: [newMatch, ...recentMatches.slice(0, 9)] });
      await get().saveLeagueData();

      return newMatch.id;
    } catch (error) {
      set({ error: 'Failed to start match' });
      console.error('Start match error:', error);
      return '';
    }
  },

  // End match
  endMatch: async (matchId, results) => {
    try {
      const { recentMatches, myPlayer } = get();
      const matchIndex = recentMatches.findIndex(m => m.id === matchId);

      if (matchIndex === -1) return false;

      const updatedMatches = [...recentMatches];
      updatedMatches[matchIndex] = {
        ...updatedMatches[matchIndex],
        isActive: false,
        endTime: new Date(),
        points: results,
        winner: Object.keys(results).reduce((a, b) =>
          results[a] > results[b] ? a : b
        ),
      };

      set({ recentMatches: updatedMatches });

      // Update player points
      if (myPlayer && results[myPlayer.id] !== undefined) {
        const pointsEarned = results[myPlayer.id];
        await get().updatePlayer({
          totalPoints: myPlayer.totalPoints + pointsEarned,
          weeklyPoints: myPlayer.weeklyPoints + pointsEarned,
        });
      }

      await get().saveLeagueData();
      return true;
    } catch (error) {
      set({ error: 'Failed to end match' });
      console.error('End match error:', error);
      return false;
    }
  },

  // Get leaderboard
  getLeaderboard: async (tier, limit = 100) => {
    try {
      const { leaderboard } = get();
      let filteredLeaderboard = leaderboard;

      if (tier) {
        filteredLeaderboard = leaderboard.filter(
          player => player.currentTier === tier
        );
      }

      return filteredLeaderboard
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, limit);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return [];
    }
  },

  // Get player rank
  getPlayerRank: async playerId => {
    try {
      const { leaderboard } = get();
      const sortedLeaderboard = leaderboard.sort(
        (a, b) => b.totalPoints - a.totalPoints
      );
      const playerIndex = sortedLeaderboard.findIndex(
        player => player.id === playerId
      );
      return playerIndex >= 0 ? playerIndex + 1 : 0;
    } catch (error) {
      console.error('Get player rank error:', error);
      return 0;
    }
  },

  // Get tier info
  getTierInfo: async tierId => {
    try {
      const { availableTiers } = get();
      return availableTiers.find(tier => tier.id === tierId) || null;
    } catch (error) {
      console.error('Get tier info error:', error);
      return null;
    }
  },

  // Start new season
  startNewSeason: async seasonData => {
    try {
      const newSeason: LeagueSeason = {
        ...seasonData,
        id: `season-${Date.now()}`,
        isActive: true,
        totalPlayers: 0,
        leaderboard: [],
        matches: [],
        rewards: {
          top1: ['Champion Badge', 'Exclusive Avatar', '1000 Coins'],
          top10: ['Elite Badge', 'Special Avatar', '500 Coins'],
          top100: ['Advanced Badge', '200 Coins'],
          participation: ['Participation Badge', '50 Coins'],
        },
      };

      set({ currentSeason: newSeason });
      await get().saveLeagueData();

      return newSeason.id;
    } catch (error) {
      set({ error: 'Failed to start new season' });
      console.error('Start new season error:', error);
      return '';
    }
  },

  // End season
  endSeason: async seasonId => {
    try {
      const { currentSeason } = get();
      if (!currentSeason || currentSeason.id !== seasonId) return false;

      const updatedSeason = { ...currentSeason, isActive: false };
      set({ currentSeason: updatedSeason });
      await get().saveLeagueData();

      return true;
    } catch (error) {
      set({ error: 'Failed to end season' });
      console.error('End season error:', error);
      return false;
    }
  },

  // Get season rewards
  getSeasonRewards: async seasonId => {
    try {
      const { currentSeason } = get();
      if (!currentSeason || currentSeason.id !== seasonId) return [];

      return currentSeason.rewards.participation; // Default to participation rewards
    } catch (error) {
      console.error('Get season rewards error:', error);
      return [];
    }
  },

  // Find match
  findMatch: async (playerId, matchType) => {
    try {
      // Simple matchmaking logic - in real app, this would be more sophisticated
      const { recentMatches } = get();
      const availableMatch = recentMatches.find(
        match =>
          match.type === matchType &&
          match.isActive &&
          match.players.length < get().settings.maxPlayersPerMatch
      );

      return availableMatch || null;
    } catch (error) {
      console.error('Find match error:', error);
      return null;
    }
  },

  // Get match history
  getMatchHistory: async playerId => {
    try {
      const { recentMatches } = get();
      return recentMatches.filter(match =>
        match.players.some(player => player.id === playerId)
      );
    } catch (error) {
      console.error('Get match history error:', error);
      return [];
    }
  },

  // Unlock achievement
  unlockAchievement: async (playerId, achievement) => {
    try {
      const { myPlayer } = get();
      if (!myPlayer || myPlayer.id !== playerId) return;

      if (!myPlayer.achievements.includes(achievement)) {
        await get().updatePlayer({
          achievements: [...myPlayer.achievements, achievement],
        });
      }
    } catch (error) {
      console.error('Unlock achievement error:', error);
    }
  },

  // Award badge
  awardBadge: async (playerId, badge) => {
    try {
      const { myPlayer } = get();
      if (!myPlayer || myPlayer.id !== playerId) return;

      if (!myPlayer.badges.includes(badge)) {
        await get().updatePlayer({
          badges: [...myPlayer.badges, badge],
        });
      }
    } catch (error) {
      console.error('Award badge error:', error);
    }
  },

  // Claim reward
  claimReward: async (playerId, reward) => {
    try {
      // In a real app, this would handle reward claiming logic
      console.log(`Player ${playerId} claimed reward: ${reward}`);
      return true;
    } catch (error) {
      console.error('Claim reward error:', error);
      return false;
    }
  },

  // Update settings
  updateSettings: async newSettings => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem(
        'leagueSettings',
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      set({ error: 'Failed to update league settings' });
      console.error('Update league settings error:', error);
    }
  },

  // Load league data
  loadLeagueData: async () => {
    try {
      set({ loading: true });

      const [
        savedPlayer,
        savedSeason,
        savedLeaderboard,
        savedMatches,
        savedSettings,
      ] = await Promise.all([
        AsyncStorage.getItem('leaguePlayer'),
        AsyncStorage.getItem('currentSeason'),
        AsyncStorage.getItem('leagueLeaderboard'),
        AsyncStorage.getItem('recentMatches'),
        AsyncStorage.getItem('leagueSettings'),
      ]);

      if (savedPlayer) {
        set({ myPlayer: JSON.parse(savedPlayer) });
      }

      if (savedSeason) {
        set({ currentSeason: JSON.parse(savedSeason) });
      }

      if (savedLeaderboard) {
        set({ leaderboard: JSON.parse(savedLeaderboard) });
      }

      if (savedMatches) {
        set({ recentMatches: JSON.parse(savedMatches) });
      }

      if (savedSettings) {
        set({ settings: JSON.parse(savedSettings) });
      }
    } catch (error) {
      set({ error: 'Failed to load league data' });
      console.error('Load league data error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Save league data
  saveLeagueData: async () => {
    try {
      const { myPlayer, currentSeason, leaderboard, recentMatches, settings } =
        get();

      await Promise.all([
        myPlayer
          ? AsyncStorage.setItem('leaguePlayer', JSON.stringify(myPlayer))
          : Promise.resolve(),
        currentSeason
          ? AsyncStorage.setItem('currentSeason', JSON.stringify(currentSeason))
          : Promise.resolve(),
        AsyncStorage.setItem('leagueLeaderboard', JSON.stringify(leaderboard)),
        AsyncStorage.setItem('recentMatches', JSON.stringify(recentMatches)),
        AsyncStorage.setItem('leagueSettings', JSON.stringify(settings)),
      ]);
    } catch (error) {
      set({ error: 'Failed to save league data' });
      console.error('Save league data error:', error);
    }
  },

  // Clear data
  clearData: async () => {
    try {
      await AsyncStorage.multiRemove([
        'leaguePlayer',
        'currentSeason',
        'leagueLeaderboard',
        'recentMatches',
        'leagueSettings',
      ]);
      set({
        currentSeason: null,
        myPlayer: null,
        leaderboard: [],
        recentMatches: [],
        error: null,
      });
    } catch (error) {
      set({ error: 'Failed to clear league data' });
      console.error('Clear league data error:', error);
    }
  },
}));
