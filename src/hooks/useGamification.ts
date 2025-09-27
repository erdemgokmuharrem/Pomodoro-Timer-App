import { useGamificationStore } from '../store/useGamificationStore';

export const useGamification = () => {
  const {
    addXp,
    updateStreak,
    checkBadges,
    checkAchievements,
    unlockBadge,
    unlockAchievement,
    getLevelProgress,
    getAvailableBadges,
    getUnlockedBadges,
  } = useGamificationStore();

  const awardPomodoroXp = (amount: number = 25) => {
    addXp(amount, 'Pomodoro completed');
    checkBadges();
    checkAchievements();
  };

  const awardTaskXp = (amount: number = 10) => {
    addXp(amount, 'Task completed');
    checkBadges();
    checkAchievements();
  };

  const awardStreakXp = (streakDays: number) => {
    const xpAmount = Math.min(streakDays * 5, 100); // Max 100 XP per streak
    addXp(xpAmount, `Streak: ${streakDays} days`);
    checkBadges();
  };

  const awardFocusXp = (focusScore: number) => {
    if (focusScore >= 90) {
      addXp(50, 'High focus score');
    } else if (focusScore >= 80) {
      addXp(25, 'Good focus score');
    } else if (focusScore >= 70) {
      addXp(10, 'Decent focus score');
    }
    checkBadges();
  };

  return {
    // Actions
    awardPomodoroXp,
    awardTaskXp,
    awardStreakXp,
    awardFocusXp,
    updateStreak,
    checkBadges,
    checkAchievements,
    unlockBadge,
    unlockAchievement,

    // Getters
    getLevelProgress,
    getAvailableBadges,
    getUnlockedBadges,
  };
};
