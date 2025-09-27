import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji: string;
  color: string;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  requirement: {
    type: 'pomodoros' | 'streak' | 'tasks' | 'focus_score' | 'interruptions';
    value: number;
    condition: 'greater_than' | 'less_than' | 'equal_to';
  };
  unlockedAt?: Date;
  earnedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface UserStats {
  level: number;
  xp: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  totalPomodoros: number;
  totalTasks: number;
  totalFocusTime: number; // in minutes
  badges: Badge[];
  achievements: Achievement[];
  lastActiveDate: string;
}

interface GamificationState {
  userStats: UserStats;

  // Computed properties
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  badges: Badge[];
  recentBadges: Badge[];

  // Actions
  addXp: (amount: number, reason: string) => void;
  updateStreak: (increment: boolean) => void;
  checkBadges: () => void;
  checkAchievements: () => void;
  unlockBadge: (badgeId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  getLevelProgress: () => { current: number; next: number; percentage: number };
  getAvailableBadges: () => Badge[];
  getUnlockedBadges: () => Badge[];
}

const defaultBadges: Badge[] = [
  {
    id: 'first_pomodoro',
    name: 'İlk Adım',
    description: "İlk pomodoro'nuzu tamamlayın",
    icon: '🎯',
    emoji: '🎯',
    color: '#3B82F6',
    category: 'daily',
    requirement: { type: 'pomodoros', value: 1, condition: 'greater_than' },
    rarity: 'common',
  },
  {
    id: 'streak_3',
    name: 'Tutarlılık',
    description: '3 gün üst üste pomodoro yapın',
    icon: '🔥',
    emoji: '🔥',
    color: '#F59E0B',
    category: 'daily',
    requirement: { type: 'streak', value: 3, condition: 'greater_than' },
    rarity: 'common',
  },
  {
    id: 'streak_7',
    name: 'Haftalık Kahraman',
    description: '7 gün üst üste pomodoro yapın',
    icon: '👑',
    emoji: '👑',
    color: '#8B5CF6',
    category: 'weekly',
    requirement: { type: 'streak', value: 7, condition: 'greater_than' },
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    name: 'Aylık Efsane',
    description: '30 gün üst üste pomodoro yapın',
    icon: '🏆',
    emoji: '🏆',
    color: '#F59E0B',
    category: 'monthly',
    requirement: { type: 'streak', value: 30, condition: 'greater_than' },
    rarity: 'legendary',
  },
  {
    id: 'pomodoro_100',
    name: 'Yüzlerce',
    description: '100 pomodoro tamamlayın',
    icon: '💯',
    emoji: '💯',
    color: '#10B981',
    category: 'special',
    requirement: { type: 'pomodoros', value: 100, condition: 'greater_than' },
    rarity: 'epic',
  },
  {
    id: 'focus_master',
    name: 'Odak Ustası',
    description: "Focus Score'unuz 90'ın üzerinde olsun",
    icon: '🧠',
    emoji: '🧠',
    color: '#EF4444',
    category: 'special',
    requirement: { type: 'focus_score', value: 90, condition: 'greater_than' },
    rarity: 'epic',
  },
  {
    id: 'interruption_free',
    name: 'Kesintisiz',
    description: 'Kesinti olmadan 5 pomodoro tamamlayın',
    icon: '⚡',
    emoji: '⚡',
    color: '#F59E0B',
    category: 'special',
    requirement: { type: 'interruptions', value: 0, condition: 'equal_to' },
    rarity: 'rare',
  },
];

const defaultAchievements: Achievement[] = [
  {
    id: 'pomodoro_milestone_10',
    name: '10 Pomodoro',
    description: '10 pomodoro tamamlayın',
    icon: '🎯',
    xpReward: 100,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'pomodoro_milestone_50',
    name: '50 Pomodoro',
    description: '50 pomodoro tamamlayın',
    icon: '🎯',
    xpReward: 500,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'pomodoro_milestone_100',
    name: '100 Pomodoro',
    description: '100 pomodoro tamamlayın',
    icon: '🎯',
    xpReward: 1000,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'task_milestone_10',
    name: '10 Görev',
    description: '10 görev tamamlayın',
    icon: '✅',
    xpReward: 200,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'focus_milestone_1000',
    name: '1000 Dakika',
    description: '1000 dakika odaklanma süresi',
    icon: '⏰',
    xpReward: 300,
    progress: 0,
    maxProgress: 1000,
  },
];

const calculateLevel = (xp: number): number => {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const calculateXpForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 100;
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userStats: {
        level: 1,
        xp: 0,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPomodoros: 0,
        totalTasks: 0,
        totalFocusTime: 0,
        badges: [],
        achievements: defaultAchievements,
        lastActiveDate: new Date().toDateString(),
      },

      // Computed properties
      get level() {
        return get().userStats.level;
      },
      get xp() {
        return get().userStats.xp;
      },
      get xpToNextLevel() {
        const state = get();
        const currentLevelXp = calculateXpForLevel(state.userStats.level);
        const nextLevelXp = calculateXpForLevel(state.userStats.level + 1);
        return nextLevelXp - currentLevelXp;
      },
      get totalXp() {
        return get().userStats.totalXp;
      },
      get badges() {
        return get().userStats.badges;
      },
      get recentBadges() {
        return get()
          .userStats.badges.sort(
            (a, b) =>
              new Date(b.unlockedAt || 0).getTime() -
              new Date(a.unlockedAt || 0).getTime()
          )
          .slice(0, 3);
      },

      addXp: (amount: number, reason: string) => {
        const state = get();
        const newXp = state.userStats.xp + amount;
        const newTotalXp = state.userStats.totalXp + amount;
        const newLevel = calculateLevel(newTotalXp);

        set({
          userStats: {
            ...state.userStats,
            xp: newXp,
            totalXp: newTotalXp,
            level: newLevel,
          },
        });

        // Check for level up
        if (newLevel > state.userStats.level) {
          console.log(`Level up! New level: ${newLevel}`);
        }
      },

      updateStreak: (increment: boolean) => {
        const state = get();
        const today = new Date().toDateString();

        if (increment) {
          const newStreak = state.userStats.currentStreak + 1;
          set({
            userStats: {
              ...state.userStats,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.userStats.longestStreak),
              lastActiveDate: today,
            },
          });
        } else {
          set({
            userStats: {
              ...state.userStats,
              currentStreak: 0,
              lastActiveDate: today,
            },
          });
        }
      },

      checkBadges: () => {
        const state = get();
        const availableBadges = get().getAvailableBadges();

        availableBadges.forEach(badge => {
          let shouldUnlock = false;

          switch (badge.requirement.type) {
            case 'pomodoros':
              shouldUnlock =
                badge.requirement.condition === 'greater_than'
                  ? state.userStats.totalPomodoros > badge.requirement.value
                  : state.userStats.totalPomodoros === badge.requirement.value;
              break;
            case 'streak':
              shouldUnlock =
                badge.requirement.condition === 'greater_than'
                  ? state.userStats.currentStreak > badge.requirement.value
                  : state.userStats.currentStreak === badge.requirement.value;
              break;
            case 'tasks':
              shouldUnlock =
                badge.requirement.condition === 'greater_than'
                  ? state.userStats.totalTasks > badge.requirement.value
                  : state.userStats.totalTasks === badge.requirement.value;
              break;
            case 'focus_score':
              // This would need to be calculated from recent sessions
              break;
            case 'interruptions':
              // This would need to be tracked from recent sessions
              break;
          }

          if (shouldUnlock) {
            get().unlockBadge(badge.id);
          }
        });
      },

      checkAchievements: () => {
        const state = get();

        state.userStats.achievements.forEach(achievement => {
          if (achievement.unlockedAt) return; // Already unlocked

          let progress = 0;

          switch (achievement.id) {
            case 'pomodoro_milestone_10':
            case 'pomodoro_milestone_50':
            case 'pomodoro_milestone_100':
              progress = state.userStats.totalPomodoros;
              break;
            case 'task_milestone_10':
              progress = state.userStats.totalTasks;
              break;
            case 'focus_milestone_1000':
              progress = state.userStats.totalFocusTime;
              break;
          }

          if (progress >= achievement.maxProgress) {
            get().unlockAchievement(achievement.id);
          } else {
            // Update progress
            set({
              userStats: {
                ...state.userStats,
                achievements: state.userStats.achievements.map(a =>
                  a.id === achievement.id ? { ...a, progress } : a
                ),
              },
            });
          }
        });
      },

      unlockBadge: (badgeId: string) => {
        const state = get();
        const badge = defaultBadges.find(b => b.id === badgeId);

        if (badge && !state.userStats.badges.find(b => b.id === badgeId)) {
          const now = new Date();
          const unlockedBadge = { ...badge, unlockedAt: now, earnedAt: now };

          set({
            userStats: {
              ...state.userStats,
              badges: [...state.userStats.badges, unlockedBadge],
            },
          });

          // Award XP for badge
          const xpReward =
            badge.rarity === 'common'
              ? 50
              : badge.rarity === 'rare'
                ? 100
                : badge.rarity === 'epic'
                  ? 200
                  : 500;
          get().addXp(xpReward, `Badge unlocked: ${badge.name}`);
        }
      },

      unlockAchievement: (achievementId: string) => {
        const state = get();
        const achievement = state.userStats.achievements.find(
          a => a.id === achievementId
        );

        if (achievement && !achievement.unlockedAt) {
          set({
            userStats: {
              ...state.userStats,
              achievements: state.userStats.achievements.map(a =>
                a.id === achievementId ? { ...a, unlockedAt: new Date() } : a
              ),
            },
          });

          get().addXp(
            achievement.xpReward,
            `Achievement unlocked: ${achievement.name}`
          );
        }
      },

      getLevelProgress: () => {
        const state = get();
        const currentLevelXp = calculateXpForLevel(state.userStats.level);
        const nextLevelXp = calculateXpForLevel(state.userStats.level + 1);
        const currentXp = state.userStats.totalXp - currentLevelXp;
        const xpNeeded = nextLevelXp - currentLevelXp;

        return {
          current: currentXp,
          next: xpNeeded,
          percentage: (currentXp / xpNeeded) * 100,
        };
      },

      getAvailableBadges: () => {
        const state = get();
        return defaultBadges.filter(
          badge => !state.userStats.badges.find(b => b.id === badge.id)
        );
      },

      getUnlockedBadges: () => {
        const state = get();
        return state.userStats.badges;
      },
    }),
    {
      name: 'gamification-storage',
      partialize: state => ({ userStats: state.userStats }),
    }
  )
);
