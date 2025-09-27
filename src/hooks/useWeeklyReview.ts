import { useState, useCallback, useMemo } from 'react';
import {
  usePomodoroStore,
  PomodoroSession,
  Task,
} from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { useComplexityScore } from './useComplexityScore';

export interface WeeklyStats {
  week: string;
  totalPomodoros: number;
  completedTasks: number;
  totalTasks: number;
  averageSessionDuration: number;
  totalFocusTime: number; // in minutes
  interruptions: number;
  productivityScore: number; // 0-100
  energyLevel: 'low' | 'medium' | 'high';
  focusScore: number; // 0-100
  consistencyScore: number; // 0-100
}

export interface WeeklyInsights {
  achievements: string[];
  challenges: string[];
  patterns: string[];
  recommendations: string[];
  nextWeekGoals: string[];
  energyTrends: string[];
  productivityTrends: string[];
}

export interface WeeklyReview {
  id: string;
  week: string;
  stats: WeeklyStats;
  insights: WeeklyInsights;
  reflection: string;
  goals: string[];
  createdAt: Date;
  isCompleted: boolean;
}

export const useWeeklyReview = () => {
  const { sessions, tasks } = usePomodoroStore();
  const { level, xp, badges } = useGamificationStore();
  const { getComplexityStats } = useComplexityScore();

  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);

  // Get current week's date range
  const getCurrentWeekRange = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
  }, []);

  // Get sessions for a specific week
  const getWeekSessions = useCallback(
    (startDate: Date, endDate: Date) => {
      if (!sessions) return [];

      return sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return (
          sessionDate >= startDate &&
          sessionDate <= endDate &&
          session.isCompleted
        );
      });
    },
    [sessions]
  );

  // Get tasks for a specific week
  const getWeekTasks = useCallback(
    (startDate: Date, endDate: Date) => {
      if (!tasks) return [];

      return tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate && taskDate <= endDate;
      });
    },
    [tasks]
  );

  // Calculate weekly statistics
  const calculateWeeklyStats = useCallback(
    (weekSessions: PomodoroSession[], weekTasks: Task[]): WeeklyStats => {
      const totalPomodoros = weekSessions.length;
      const completedTasks = weekTasks.filter(task => task.isCompleted).length;
      const totalTasks = weekTasks.length;

      const averageSessionDuration =
        weekSessions.length > 0
          ? weekSessions.reduce((sum, session) => sum + session.duration, 0) /
            weekSessions.length
          : 0;

      const totalFocusTime = weekSessions.reduce(
        (sum, session) => sum + session.duration,
        0
      );
      const interruptions = weekSessions.reduce(
        (sum, session) => sum + session.interruptions,
        0
      );

      // Calculate productivity score (0-100)
      const productivityScore = Math.min(
        100,
        totalPomodoros * 10 + completedTasks * 5
      );

      // Calculate energy level based on session patterns
      const morningSessions = weekSessions.filter(session => {
        const hour = new Date(session.startTime).getHours();
        return hour >= 6 && hour <= 10;
      }).length;

      const energyLevel =
        morningSessions > totalPomodoros * 0.4
          ? 'high'
          : morningSessions > totalPomodoros * 0.2
            ? 'medium'
            : 'low';

      // Calculate focus score (0-100)
      const focusScore =
        interruptions > 0 ? Math.max(0, 100 - interruptions * 10) : 100;

      // Calculate consistency score (0-100)
      const daysWithSessions = new Set(
        weekSessions.map(session => new Date(session.startTime).toDateString())
      ).size;
      const consistencyScore = Math.min(100, (daysWithSessions / 7) * 100);

      return {
        week: `${new Date().getFullYear()}-W${Math.ceil((new Date().getDate() + new Date().getDay()) / 7)}`,
        totalPomodoros,
        completedTasks,
        totalTasks,
        averageSessionDuration,
        totalFocusTime,
        interruptions,
        productivityScore,
        energyLevel,
        focusScore,
        consistencyScore,
      };
    },
    []
  );

  // Generate AI-powered insights
  const generateInsights = useCallback(
    (
      stats: WeeklyStats,
      weekSessions: PomodoroSession[],
      weekTasks: Task[]
    ): WeeklyInsights => {
      const insights: WeeklyInsights = {
        achievements: [],
        challenges: [],
        patterns: [],
        recommendations: [],
        nextWeekGoals: [],
        energyTrends: [],
        productivityTrends: [],
      };

      // Achievements
      if (stats.totalPomodoros >= 20) {
        insights.achievements.push(
          'Harika! Bu hafta 20+ pomodoro tamamladınız 🎉'
        );
      }
      if (stats.completedTasks >= 5) {
        insights.achievements.push('5+ görev tamamladınız, mükemmel! ✅');
      }
      if (stats.consistencyScore >= 80) {
        insights.achievements.push('Çok tutarlı bir hafta geçirdiniz! 📈');
      }
      if (stats.focusScore >= 90) {
        insights.achievements.push('Odaklanma seviyeniz çok yüksek! 🎯');
      }

      // Challenges
      if (stats.interruptions > stats.totalPomodoros * 0.3) {
        insights.challenges.push(
          'Kesinti sayısı yüksek - dikkat dağıtıcıları azaltmayı düşünün'
        );
      }
      if (stats.consistencyScore < 50) {
        insights.challenges.push(
          'Tutarlılık düşük - düzenli çalışma rutini oluşturun'
        );
      }
      if (stats.focusScore < 70) {
        insights.challenges.push('Odaklanma sorunu var - sessiz ortam arayın');
      }
      if (stats.energyLevel === 'low') {
        insights.challenges.push(
          'Enerji seviyesi düşük - uyku ve beslenme düzeninizi kontrol edin'
        );
      }

      // Patterns
      const morningSessions = weekSessions.filter(s => {
        const hour = new Date(s.startTime).getHours();
        return hour >= 6 && hour <= 10;
      }).length;

      if (morningSessions > stats.totalPomodoros * 0.5) {
        insights.patterns.push('Sabah saatlerinde daha verimli çalışıyorsunuz');
      }

      const eveningSessions = weekSessions.filter(s => {
        const hour = new Date(s.startTime).getHours();
        return hour >= 18 && hour <= 22;
      }).length;

      if (eveningSessions > stats.totalPomodoros * 0.3) {
        insights.patterns.push('Akşam saatlerinde de aktif çalışıyorsunuz');
      }

      // Recommendations
      if (stats.totalPomodoros < 10) {
        insights.recommendations.push('Daha fazla pomodoro yapmayı hedefleyin');
      }
      if (stats.interruptions > 5) {
        insights.recommendations.push(
          'Kesintileri azaltmak için bildirimleri kapatın'
        );
      }
      if (stats.consistencyScore < 70) {
        insights.recommendations.push('Günlük çalışma rutini oluşturun');
      }

      // Next week goals
      if (stats.totalPomodoros < 15) {
        insights.nextWeekGoals.push('Hedef: 15+ pomodoro');
      }
      if (stats.completedTasks < 3) {
        insights.nextWeekGoals.push('Hedef: 3+ görev tamamlama');
      }
      if (stats.consistencyScore < 80) {
        insights.nextWeekGoals.push('Hedef: 5+ gün çalışma');
      }

      // Energy trends
      if (stats.energyLevel === 'high') {
        insights.energyTrends.push(
          'Enerji seviyeniz yüksek, bu momentumu koruyun!'
        );
      } else if (stats.energyLevel === 'low') {
        insights.energyTrends.push(
          'Enerji seviyeniz düşük, dinlenme ve beslenme düzeninizi gözden geçirin'
        );
      }

      // Productivity trends
      if (stats.productivityScore >= 80) {
        insights.productivityTrends.push('Üretkenlik seviyeniz çok yüksek!');
      } else if (stats.productivityScore < 50) {
        insights.productivityTrends.push(
          'Üretkenlik seviyenizi artırmak için daha fazla odaklanma gerekli'
        );
      }

      return insights;
    },
    []
  );

  // Generate weekly review
  const generateWeeklyReview = useCallback((): WeeklyReview => {
    const { start, end } = getCurrentWeekRange();
    const weekSessions = getWeekSessions(start, end);
    const weekTasks = getWeekTasks(start, end);

    const stats = calculateWeeklyStats(weekSessions, weekTasks);
    const insights = generateInsights(stats, weekSessions, weekTasks);

    const review: WeeklyReview = {
      id: Date.now().toString(),
      week: stats.week,
      stats,
      insights,
      reflection: '',
      goals: insights.nextWeekGoals,
      createdAt: new Date(),
      isCompleted: false,
    };

    return review;
  }, [
    getCurrentWeekRange,
    getWeekSessions,
    getWeekTasks,
    calculateWeeklyStats,
    generateInsights,
  ]);

  // Get current week's review
  const getCurrentWeekReview = useCallback(() => {
    const { start, end } = getCurrentWeekRange();
    const weekSessions = getWeekSessions(start, end);
    const weekTasks = getWeekTasks(start, end);

    if (weekSessions.length === 0 && weekTasks.length === 0) {
      return null;
    }

    const stats = calculateWeeklyStats(weekSessions, weekTasks);
    const insights = generateInsights(stats, weekSessions, weekTasks);

    return {
      stats,
      insights,
      weekSessions,
      weekTasks,
    };
  }, [
    getCurrentWeekRange,
    getWeekSessions,
    getWeekTasks,
    calculateWeeklyStats,
    generateInsights,
  ]);

  // Get weekly review history
  const getWeeklyReviewHistory = useCallback(() => {
    return weeklyReviews.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [weeklyReviews]);

  // Save weekly review
  const saveWeeklyReview = useCallback((review: WeeklyReview) => {
    setWeeklyReviews(prev => {
      const existingIndex = prev.findIndex(r => r.week === review.week);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = review;
        return updated;
      }
      return [...prev, review];
    });
  }, []);

  // Get weekly progress comparison
  const getWeeklyProgressComparison = useCallback(() => {
    if (weeklyReviews.length < 2) {
      return {
        hasComparison: false,
        message: 'Karşılaştırma için en az 2 hafta gerekli',
      };
    }

    const currentWeek = weeklyReviews[0];
    const previousWeek = weeklyReviews[1];

    const pomodoroChange =
      currentWeek.stats.totalPomodoros - previousWeek.stats.totalPomodoros;
    const taskChange =
      currentWeek.stats.completedTasks - previousWeek.stats.completedTasks;
    const productivityChange =
      currentWeek.stats.productivityScore -
      previousWeek.stats.productivityScore;

    return {
      hasComparison: true,
      pomodoroChange,
      taskChange,
      productivityChange,
      isImproving: pomodoroChange > 0 && taskChange > 0,
    };
  }, [weeklyReviews]);

  // Get weekly insights summary
  const getWeeklyInsightsSummary = useCallback(() => {
    const currentReview = getCurrentWeekReview();
    if (!currentReview) {
      return {
        message: 'Bu hafta henüz yeterli veri yok',
        suggestions: ['Daha fazla pomodoro yapın', 'Görevlerinizi tamamlayın'],
      };
    }

    const { stats, insights } = currentReview;

    return {
      message: `Bu hafta ${stats.totalPomodoros} pomodoro ve ${stats.completedTasks} görev tamamladınız`,
      achievements: insights.achievements,
      challenges: insights.challenges,
      recommendations: insights.recommendations,
      nextWeekGoals: insights.nextWeekGoals,
    };
  }, [getCurrentWeekReview]);

  return {
    getCurrentWeekReview,
    generateWeeklyReview,
    getWeeklyReviewHistory,
    saveWeeklyReview,
    getWeeklyProgressComparison,
    getWeeklyInsightsSummary,
    weeklyReviews,
  };
};
