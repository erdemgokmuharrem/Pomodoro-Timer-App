import { useEffect } from 'react';
import { useGamificationStore, defaultBadges } from '../store/useGamificationStore';
import { usePomodoroStore } from '../store/usePomodoroStore';

export const useGamification = () => {
  const {
    userStats,
    addXp,
    updateStreak,
    checkBadges,
    checkAchievements,
    getLevelProgress,
    getAvailableBadges,
    getUnlockedBadges,
  } = useGamificationStore();

  const { sessions, tasks } = usePomodoroStore();

  // Update stats when sessions or tasks change
  useEffect(() => {
    const completedSessions = sessions.filter(s => s.isCompleted);
    const completedTasks = tasks.filter(t => t.isCompleted);
    const totalFocusTime = completedSessions.reduce((total, session) => 
      total + session.duration, 0
    );

    // Update basic stats
    useGamificationStore.setState({
      userStats: {
        ...userStats,
        totalPomodoros: completedSessions.length,
        totalTasks: completedTasks.length,
        totalFocusTime,
      },
    });

    // Check for achievements and badges
    checkAchievements();
    checkBadges();
  }, [sessions, tasks]);

  // Check streak daily
  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const todaySessions = sessions.filter(s => 
      s.startTime.toDateString() === today && s.isCompleted
    );
    const yesterdaySessions = sessions.filter(s => 
      s.startTime.toDateString() === yesterdayStr && s.isCompleted
    );

    if (todaySessions.length > 0) {
      // User was active today
      if (userStats.lastActiveDate === yesterdayStr) {
        // Continue streak
        updateStreak(true);
      } else if (userStats.lastActiveDate !== today) {
        // Start new streak
        updateStreak(true);
      }
    } else if (userStats.lastActiveDate === yesterdayStr && yesterdaySessions.length > 0) {
      // User was active yesterday but not today - streak continues
      // (This allows for breaks in the same day)
    } else if (userStats.lastActiveDate !== today && userStats.lastActiveDate !== yesterdayStr) {
      // User missed a day - reset streak
      updateStreak(false);
    }
  }, [sessions, userStats.lastActiveDate]);

  const awardPomodoroXp = () => {
    addXp(25, 'Pomodoro completed');
  };

  const awardTaskXp = () => {
    addXp(50, 'Task completed');
  };

  const awardStreakXp = (streakLength: number) => {
    const xpAmount = Math.min(streakLength * 10, 100); // Max 100 XP per streak
    addXp(xpAmount, `Streak bonus: ${streakLength} days`);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getRecentBadges = (limit: number = 3) => {
    return getUnlockedBadges()
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, limit);
  };

  const getRecentAchievements = (limit: number = 3) => {
    return userStats.achievements
      .filter(a => a.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, limit);
  };

  const getProgressToNextLevel = () => {
    return getLevelProgress();
  };

  const getTotalBadges = () => {
    return {
      total: defaultBadges.length,
      unlocked: getUnlockedBadges().length,
      available: getAvailableBadges().length,
    };
  };

  return {
    userStats,
    awardPomodoroXp,
    awardTaskXp,
    awardStreakXp,
    getRarityColor,
    getRecentBadges,
    getRecentAchievements,
    getProgressToNextLevel,
    getTotalBadges,
    checkBadges,
    checkAchievements,
  };
};
