import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChallengeParticipant {
  id: string;
  name: string;
  avatar?: string;
  currentProgress: number;
  targetProgress: number;
  joinTime: Date;
  lastActivity: Date;
  achievements: string[];
  rank: number;
}

export interface SocialChallenge {
  id: string;
  title: string;
  description: string;
  type: 'pomodoro_count' | 'focus_time' | 'streak' | 'completion_rate' | 'social' | 'creative';
  category: 'daily' | 'weekly' | 'monthly' | 'special' | 'community';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isPublic: boolean;
  creatorId: string;
  participants: ChallengeParticipant[];
  maxParticipants: number;
  targetValue: number;
  unit: string;
  rewards: {
    first: string[];
    top10: string[];
    top50: string[];
    completion: string[];
    participation: string[];
  };
  rules: {
    minLevel: number;
    requiredTags: string[];
    prohibitedContent: string[];
    teamSize: number;
    allowTeams: boolean;
  };
  statistics: {
    totalParticipants: number;
    completionRate: number;
    averageProgress: number;
    topPerformer: string;
  };
}

export interface ChallengeTeam {
  id: string;
  name: string;
  description?: string;
  challengeId: string;
  members: ChallengeParticipant[];
  maxMembers: number;
  totalProgress: number;
  rank: number;
  createdDate: Date;
  isActive: boolean;
}

export interface ChallengeSettings {
  enableChallenges: boolean;
  autoJoin: boolean;
  notifications: boolean;
  teamChallenges: boolean;
  publicChallenges: boolean;
  difficultyFilter: string[];
  categoryFilter: string[];
  maxActiveChallenges: number;
}

interface SocialChallengesStore {
  // State
  activeChallenges: SocialChallenge[];
  myChallenges: SocialChallenge[];
  completedChallenges: SocialChallenge[];
  myTeams: ChallengeTeam[];
  settings: ChallengeSettings;
  loading: boolean;
  error: string | null;

  // Challenge management
  createChallenge: (challengeData: Omit<SocialChallenge, 'id' | 'participants' | 'statistics'>) => Promise<string>;
  joinChallenge: (challengeId: string, participantData: Omit<ChallengeParticipant, 'id' | 'joinTime' | 'lastActivity' | 'achievements' | 'rank'>) => Promise<boolean>;
  leaveChallenge: (challengeId: string, participantId: string) => Promise<boolean>;
  updateProgress: (challengeId: string, participantId: string, progress: number) => Promise<boolean>;
  
  // Team management
  createTeam: (teamData: Omit<ChallengeTeam, 'id' | 'createdDate' | 'isActive'>) => Promise<string>;
  joinTeam: (teamId: string, participantId: string) => Promise<boolean>;
  leaveTeam: (teamId: string, participantId: string) => Promise<boolean>;
  
  // Challenge discovery
  searchChallenges: (query: string, category?: string, difficulty?: string) => Promise<SocialChallenge[]>;
  getRecommendedChallenges: () => Promise<SocialChallenge[]>;
  getTrendingChallenges: () => Promise<SocialChallenge[]>;
  getChallengesByCategory: (category: string) => Promise<SocialChallenge[]>;
  
  // Progress tracking
  updateParticipantProgress: (challengeId: string, participantId: string, progress: number) => Promise<void>;
  getChallengeLeaderboard: (challengeId: string) => Promise<ChallengeParticipant[]>;
  getTeamLeaderboard: (challengeId: string) => Promise<ChallengeTeam[]>;
  
  // Rewards & Achievements
  claimReward: (challengeId: string, rewardType: string) => Promise<boolean>;
  unlockAchievement: (challengeId: string, achievement: string) => Promise<void>;
  getAvailableRewards: (challengeId: string) => Promise<string[]>;
  
  // Challenge completion
  completeChallenge: (challengeId: string, participantId: string) => Promise<boolean>;
  getCompletionStats: (challengeId: string) => Promise<{
    totalParticipants: number;
    completedParticipants: number;
    averageProgress: number;
    topPerformers: ChallengeParticipant[];
  }>;
  
  // Settings
  updateSettings: (newSettings: Partial<ChallengeSettings>) => Promise<void>;
  
  // Data management
  loadChallenges: () => Promise<void>;
  saveChallenges: () => Promise<void>;
  clearData: () => Promise<void>;
}

export const useSocialChallengesStore = create<SocialChallengesStore>((set, get) => ({
  // Initial state
  activeChallenges: [],
  myChallenges: [],
  completedChallenges: [],
  myTeams: [],
  settings: {
    enableChallenges: true,
    autoJoin: false,
    notifications: true,
    teamChallenges: true,
    publicChallenges: true,
    difficultyFilter: [],
    categoryFilter: [],
    maxActiveChallenges: 5,
  },
  loading: false,
  error: null,

  // Create challenge
  createChallenge: async (challengeData) => {
    try {
      set({ loading: true, error: null });
      
      const newChallenge: SocialChallenge = {
        ...challengeData,
        id: `challenge-${Date.now()}`,
        participants: [],
        statistics: {
          totalParticipants: 0,
          completionRate: 0,
          averageProgress: 0,
          topPerformer: '',
        },
      };

      const { myChallenges } = get();
      const updatedMyChallenges = [...myChallenges, newChallenge];
      
      set({ myChallenges: updatedMyChallenges });
      await get().saveChallenges();
      
      return newChallenge.id;
    } catch (error) {
      set({ error: 'Failed to create social challenge' });
      console.error('Create social challenge error:', error);
      return '';
    } finally {
      set({ loading: false });
    }
  },

  // Join challenge
  joinChallenge: async (challengeId, participantData) => {
    try {
      set({ loading: true, error: null });
      
      const { activeChallenges, myChallenges } = get();
      const challenge = activeChallenges.find(c => c.id === challengeId) || 
                       myChallenges.find(c => c.id === challengeId);
      
      if (!challenge) {
        set({ error: 'Challenge not found' });
        return false;
      }

      if (challenge.participants.length >= challenge.maxParticipants) {
        set({ error: 'Challenge is full' });
        return false;
      }

      const newParticipant: ChallengeParticipant = {
        ...participantData,
        id: `participant-${Date.now()}`,
        joinTime: new Date(),
        lastActivity: new Date(),
        achievements: [],
        rank: challenge.participants.length + 1,
      };

      const updatedChallenge = {
        ...challenge,
        participants: [...challenge.participants, newParticipant],
        statistics: {
          ...challenge.statistics,
          totalParticipants: challenge.participants.length + 1,
        },
      };

      // Update in appropriate lists
      if (activeChallenges.find(c => c.id === challengeId)) {
        const updatedActiveChallenges = activeChallenges.map(c => 
          c.id === challengeId ? updatedChallenge : c
        );
        set({ activeChallenges: updatedActiveChallenges });
      } else {
        const updatedMyChallenges = myChallenges.map(c => 
          c.id === challengeId ? updatedChallenge : c
        );
        set({ myChallenges: updatedMyChallenges });
      }

      await get().saveChallenges();
      return true;
    } catch (error) {
      set({ error: 'Failed to join social challenge' });
      console.error('Join social challenge error:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Leave challenge
  leaveChallenge: async (challengeId, participantId) => {
    try {
      const { activeChallenges, myChallenges } = get();
      
      const updateChallenge = (challenges: SocialChallenge[]) => 
        challenges.map(challenge => 
          challenge.id === challengeId 
            ? { 
                ...challenge, 
                participants: challenge.participants.filter(p => p.id !== participantId),
                statistics: {
                  ...challenge.statistics,
                  totalParticipants: Math.max(0, challenge.statistics.totalParticipants - 1),
                },
              }
            : challenge
        );

      set({
        activeChallenges: updateChallenge(activeChallenges),
        myChallenges: updateChallenge(myChallenges),
      });

      await get().saveChallenges();
      return true;
    } catch (error) {
      set({ error: 'Failed to leave social challenge' });
      console.error('Leave social challenge error:', error);
      return false;
    }
  },

  // Update progress
  updateProgress: async (challengeId, participantId, progress) => {
    try {
      const { activeChallenges, myChallenges } = get();
      
      const updateChallenge = (challenges: SocialChallenge[]) =>
        challenges.map(challenge => {
          if (challenge.id === challengeId) {
            const updatedParticipants = challenge.participants.map(participant =>
              participant.id === participantId
                ? { 
                    ...participant, 
                    currentProgress: Math.min(progress, challenge.targetValue),
                    lastActivity: new Date(),
                  }
                : participant
            );

            // Sort by progress and update ranks
            updatedParticipants.sort((a, b) => b.currentProgress - a.currentProgress);
            updatedParticipants.forEach((participant, index) => {
              participant.rank = index + 1;
            });

            const averageProgress = updatedParticipants.reduce((sum, p) => sum + p.currentProgress, 0) / updatedParticipants.length;
            const topPerformer = updatedParticipants[0]?.id || '';

            return {
              ...challenge,
              participants: updatedParticipants,
              statistics: {
                ...challenge.statistics,
                averageProgress,
                topPerformer,
              },
            };
          }
          return challenge;
        });

      set({
        activeChallenges: updateChallenge(activeChallenges),
        myChallenges: updateChallenge(myChallenges),
      });

      await get().saveChallenges();
      return true;
    } catch (error) {
      set({ error: 'Failed to update progress' });
      console.error('Update progress error:', error);
      return false;
    }
  },

  // Create team
  createTeam: async (teamData) => {
    try {
      const newTeam: ChallengeTeam = {
        ...teamData,
        id: `team-${Date.now()}`,
        createdDate: new Date(),
        isActive: true,
      };

      const { myTeams } = get();
      const updatedMyTeams = [...myTeams, newTeam];
      
      set({ myTeams: updatedMyTeams });
      await get().saveChallenges();
      
      return newTeam.id;
    } catch (error) {
      set({ error: 'Failed to create team' });
      console.error('Create team error:', error);
      return '';
    }
  },

  // Join team
  joinTeam: async (teamId, participantId) => {
    try {
      const { myTeams } = get();
      const team = myTeams.find(t => t.id === teamId);
      
      if (!team) {
        set({ error: 'Team not found' });
        return false;
      }

      if (team.members.length >= team.maxMembers) {
        set({ error: 'Team is full' });
        return false;
      }

      const updatedTeam = {
        ...team,
        members: [...team.members, { id: participantId } as ChallengeParticipant],
      };

      const updatedMyTeams = myTeams.map(t => 
        t.id === teamId ? updatedTeam : t
      );
      
      set({ myTeams: updatedMyTeams });
      await get().saveChallenges();
      
      return true;
    } catch (error) {
      set({ error: 'Failed to join team' });
      console.error('Join team error:', error);
      return false;
    }
  },

  // Leave team
  leaveTeam: async (teamId, participantId) => {
    try {
      const { myTeams } = get();
      
      const updatedMyTeams = myTeams.map(team =>
        team.id === teamId
          ? { ...team, members: team.members.filter(m => m.id !== participantId) }
          : team
      );
      
      set({ myTeams: updatedMyTeams });
      await get().saveChallenges();
      
      return true;
    } catch (error) {
      set({ error: 'Failed to leave team' });
      console.error('Leave team error:', error);
      return false;
    }
  },

  // Search challenges
  searchChallenges: async (query, category, difficulty) => {
    try {
      const { activeChallenges } = get();
      let filteredChallenges = activeChallenges;

      if (query) {
        filteredChallenges = filteredChallenges.filter(challenge =>
          challenge.title.toLowerCase().includes(query.toLowerCase()) ||
          challenge.description.toLowerCase().includes(query.toLowerCase())
        );
      }

      if (category) {
        filteredChallenges = filteredChallenges.filter(challenge => challenge.category === category);
      }

      if (difficulty) {
        filteredChallenges = filteredChallenges.filter(challenge => challenge.difficulty === difficulty);
      }

      return filteredChallenges;
    } catch (error) {
      console.error('Search challenges error:', error);
      return [];
    }
  },

  // Get recommended challenges
  getRecommendedChallenges: async () => {
    try {
      const { activeChallenges } = get();
      // Simple recommendation logic - in real app, this would use ML
      return activeChallenges
        .filter(challenge => challenge.isPublic && challenge.isActive)
        .sort((a, b) => b.participants.length - a.participants.length)
        .slice(0, 10);
    } catch (error) {
      console.error('Get recommended challenges error:', error);
      return [];
    }
  },

  // Get trending challenges
  getTrendingChallenges: async () => {
    try {
      const { activeChallenges } = get();
      // Simple trending logic - in real app, this would use activity metrics
      return activeChallenges
        .filter(challenge => challenge.isPublic && challenge.isActive)
        .sort((a, b) => b.statistics.totalParticipants - a.statistics.totalParticipants)
        .slice(0, 10);
    } catch (error) {
      console.error('Get trending challenges error:', error);
      return [];
    }
  },

  // Get challenges by category
  getChallengesByCategory: async (category) => {
    try {
      const { activeChallenges } = get();
      return activeChallenges.filter(challenge => challenge.category === category);
    } catch (error) {
      console.error('Get challenges by category error:', error);
      return [];
    }
  },

  // Update participant progress
  updateParticipantProgress: async (challengeId, participantId, progress) => {
    try {
      await get().updateProgress(challengeId, participantId, progress);
    } catch (error) {
      console.error('Update participant progress error:', error);
    }
  },

  // Get challenge leaderboard
  getChallengeLeaderboard: async (challengeId) => {
    try {
      const { activeChallenges, myChallenges } = get();
      const allChallenges = [...activeChallenges, ...myChallenges];
      const challenge = allChallenges.find(c => c.id === challengeId);
      
      if (!challenge) return [];

      return challenge.participants
        .sort((a, b) => b.currentProgress - a.currentProgress)
        .slice(0, 50);
    } catch (error) {
      console.error('Get challenge leaderboard error:', error);
      return [];
    }
  },

  // Get team leaderboard
  getTeamLeaderboard: async (challengeId) => {
    try {
      const { myTeams } = get();
      const challengeTeams = myTeams.filter(team => team.challengeId === challengeId);
      
      return challengeTeams
        .sort((a, b) => b.totalProgress - a.totalProgress)
        .slice(0, 20);
    } catch (error) {
      console.error('Get team leaderboard error:', error);
      return [];
    }
  },

  // Claim reward
  claimReward: async (challengeId, rewardType) => {
    try {
      // In a real app, this would handle reward claiming logic
      console.log(`Claiming ${rewardType} reward for challenge ${challengeId}`);
      return true;
    } catch (error) {
      console.error('Claim reward error:', error);
      return false;
    }
  },

  // Unlock achievement
  unlockAchievement: async (challengeId, achievement) => {
    try {
      const { activeChallenges, myChallenges } = get();
      const allChallenges = [...activeChallenges, ...myChallenges];
      const challenge = allChallenges.find(c => c.id === challengeId);
      
      if (!challenge) return;

      // Find participant and add achievement
      const updatedChallenge = {
        ...challenge,
        participants: challenge.participants.map(participant => {
          if (participant.id === 'current-user-id') { // In real app, get current user ID
            return {
              ...participant,
              achievements: [...participant.achievements, achievement],
            };
          }
          return participant;
        }),
      };

      // Update in appropriate list
      if (activeChallenges.find(c => c.id === challengeId)) {
        const updatedActiveChallenges = activeChallenges.map(c => 
          c.id === challengeId ? updatedChallenge : c
        );
        set({ activeChallenges: updatedActiveChallenges });
      } else {
        const updatedMyChallenges = myChallenges.map(c => 
          c.id === challengeId ? updatedChallenge : c
        );
        set({ myChallenges: updatedMyChallenges });
      }

      await get().saveChallenges();
    } catch (error) {
      console.error('Unlock achievement error:', error);
    }
  },

  // Get available rewards
  getAvailableRewards: async (challengeId) => {
    try {
      const { activeChallenges, myChallenges } = get();
      const allChallenges = [...activeChallenges, ...myChallenges];
      const challenge = allChallenges.find(c => c.id === challengeId);
      
      if (!challenge) return [];

      return challenge.rewards.participation; // Default to participation rewards
    } catch (error) {
      console.error('Get available rewards error:', error);
      return [];
    }
  },

  // Complete challenge
  completeChallenge: async (challengeId, participantId) => {
    try {
      const { activeChallenges, myChallenges, completedChallenges } = get();
      const allChallenges = [...activeChallenges, ...myChallenges];
      const challenge = allChallenges.find(c => c.id === challengeId);
      
      if (!challenge) return false;

      const updatedChallenge = { ...challenge, isActive: false };
      
      // Move to completed challenges
      set({ completedChallenges: [...completedChallenges, updatedChallenge] });
      
      // Remove from active challenges
      set({
        activeChallenges: activeChallenges.filter(c => c.id !== challengeId),
        myChallenges: myChallenges.filter(c => c.id !== challengeId),
      });

      await get().saveChallenges();
      return true;
    } catch (error) {
      set({ error: 'Failed to complete challenge' });
      console.error('Complete challenge error:', error);
      return false;
    }
  },

  // Get completion stats
  getCompletionStats: async (challengeId) => {
    try {
      const { activeChallenges, myChallenges } = get();
      const allChallenges = [...activeChallenges, ...myChallenges];
      const challenge = allChallenges.find(c => c.id === challengeId);
      
      if (!challenge) {
        return {
          totalParticipants: 0,
          completedParticipants: 0,
          averageProgress: 0,
          topPerformers: [],
        };
      }

      const totalParticipants = challenge.participants.length;
      const completedParticipants = challenge.participants.filter(p => p.currentProgress >= challenge.targetValue).length;
      const averageProgress = challenge.participants.reduce((sum, p) => sum + p.currentProgress, 0) / totalParticipants;
      const topPerformers = challenge.participants
        .sort((a, b) => b.currentProgress - a.currentProgress)
        .slice(0, 10);

      return {
        totalParticipants,
        completedParticipants,
        averageProgress,
        topPerformers,
      };
    } catch (error) {
      console.error('Get completion stats error:', error);
      return {
        totalParticipants: 0,
        completedParticipants: 0,
        averageProgress: 0,
        topPerformers: [],
      };
    }
  },

  // Update settings
  updateSettings: async (newSettings) => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };
      set({ settings: updatedSettings });
      await AsyncStorage.setItem('socialChallengesSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      set({ error: 'Failed to update social challenges settings' });
      console.error('Update social challenges settings error:', error);
    }
  },

  // Load challenges
  loadChallenges: async () => {
    try {
      set({ loading: true });
      
      const [savedActiveChallenges, savedMyChallenges, savedCompletedChallenges, savedMyTeams, savedSettings] = await Promise.all([
        AsyncStorage.getItem('activeChallenges'),
        AsyncStorage.getItem('myChallenges'),
        AsyncStorage.getItem('completedChallenges'),
        AsyncStorage.getItem('myTeams'),
        AsyncStorage.getItem('socialChallengesSettings'),
      ]);

      if (savedActiveChallenges) {
        set({ activeChallenges: JSON.parse(savedActiveChallenges) });
      }

      if (savedMyChallenges) {
        set({ myChallenges: JSON.parse(savedMyChallenges) });
      }

      if (savedCompletedChallenges) {
        set({ completedChallenges: JSON.parse(savedCompletedChallenges) });
      }

      if (savedMyTeams) {
        set({ myTeams: JSON.parse(savedMyTeams) });
      }

      if (savedSettings) {
        set({ settings: JSON.parse(savedSettings) });
      }
    } catch (error) {
      set({ error: 'Failed to load social challenges' });
      console.error('Load social challenges error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Save challenges
  saveChallenges: async () => {
    try {
      const { activeChallenges, myChallenges, completedChallenges, myTeams, settings } = get();
      
      await Promise.all([
        AsyncStorage.setItem('activeChallenges', JSON.stringify(activeChallenges)),
        AsyncStorage.setItem('myChallenges', JSON.stringify(myChallenges)),
        AsyncStorage.setItem('completedChallenges', JSON.stringify(completedChallenges)),
        AsyncStorage.setItem('myTeams', JSON.stringify(myTeams)),
        AsyncStorage.setItem('socialChallengesSettings', JSON.stringify(settings)),
      ]);
    } catch (error) {
      set({ error: 'Failed to save social challenges' });
      console.error('Save social challenges error:', error);
    }
  },

  // Clear data
  clearData: async () => {
    try {
      await AsyncStorage.multiRemove([
        'activeChallenges',
        'myChallenges',
        'completedChallenges',
        'myTeams',
        'socialChallengesSettings',
      ]);
      set({
        activeChallenges: [],
        myChallenges: [],
        completedChallenges: [],
        myTeams: [],
        error: null,
      });
    } catch (error) {
      set({ error: 'Failed to clear social challenges data' });
      console.error('Clear social challenges data error:', error);
    }
  },
}));
