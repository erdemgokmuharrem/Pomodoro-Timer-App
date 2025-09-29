import { BadgeRarity, BadgeCategory } from './common';

// Badge interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji: string;
  color: string;
  category: BadgeCategory;
  requirement: {
    type: 'pomodoros' | 'streak' | 'tasks' | 'focus_score' | 'interruptions';
    value: number;
    condition: 'greater_than' | 'less_than' | 'equal_to';
  };
  unlockedAt?: Date;
  earnedAt?: Date;
  rarity: BadgeRarity;
}

// Achievement interface
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

// User statistics interface
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

// Gamification state interface
export interface GamificationState {
  userStats: UserStats;

  // Computed properties
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  badges: Badge[];
  recentBadges: Badge[];
}

// Gamification actions interface
export interface GamificationActions {
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

// Gamification hook return type
export interface UseGamificationReturn {
  // Actions
  awardPomodoroXp: (amount?: number) => void;
  awardTaskXp: (amount?: number) => void;
  awardStreakXp: (streakDays: number) => void;
  awardFocusXp: (focusScore: number) => void;
  updateStreak: (increment: boolean) => void;
  checkBadges: () => void;
  checkAchievements: () => void;
  unlockBadge: (badgeId: string) => void;
  unlockAchievement: (achievementId: string) => void;

  // Getters
  getLevelProgress: () => { current: number; next: number; percentage: number };
  getAvailableBadges: () => Badge[];
  getUnlockedBadges: () => Badge[];
}
