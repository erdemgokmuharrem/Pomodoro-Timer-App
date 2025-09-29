import { useState, useEffect, useCallback } from 'react';
import { AnalyticsEngine, AnalyticsEvent, UserMetrics, DashboardData } from '../analytics/analyticsEngine';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export const useAnalytics = () => {
  const { sessions, tasks } = usePomodoroStore();
  const { userStats } = useGamificationStore();
  
  const [analyticsEngine] = useState(() => new AnalyticsEngine(sessions, tasks));
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate metrics
  const calculateMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newMetrics = analyticsEngine.calculateUserMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate metrics');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsEngine]);

  // Generate dashboard data
  const generateDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = analyticsEngine.generateDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [analyticsEngine]);

  // Track custom events
  const trackEvent = useCallback((type: string, properties: Record<string, any> = {}) => {
    analyticsEngine.trackEvent(type, properties);
  }, [analyticsEngine]);

  // Track pomodoro events
  const trackPomodoroStart = useCallback((taskId?: string) => {
    trackEvent('pomodoro_start', { taskId });
  }, [trackEvent]);

  const trackPomodoroComplete = useCallback((taskId?: string, duration?: number) => {
    trackEvent('pomodoro_complete', { taskId, duration });
  }, [trackEvent]);

  const trackPomodoroPause = useCallback((taskId?: string, reason?: string) => {
    trackEvent('pomodoro_pause', { taskId, reason });
  }, [trackEvent]);

  const trackBreakStart = useCallback((isLongBreak?: boolean) => {
    trackEvent('break_start', { isLongBreak });
  }, [trackEvent]);

  const trackBreakComplete = useCallback((isLongBreak?: boolean, duration?: number) => {
    trackEvent('break_complete', { isLongBreak, duration });
  }, [trackEvent]);

  const trackTaskCreate = useCallback((taskId: string, priority: string, estimatedPomodoros: number) => {
    trackEvent('task_create', { taskId, priority, estimatedPomodoros });
  }, [trackEvent]);

  const trackTaskComplete = useCallback((taskId: string, actualPomodoros: number) => {
    trackEvent('task_complete', { taskId, actualPomodoros });
  }, [trackEvent]);

  const trackInterruption = useCallback((reason: string, duration?: number) => {
    trackEvent('interruption', { reason, duration });
  }, [trackEvent]);

  // Export data
  const exportData = useCallback((format: 'json' | 'csv' = 'json') => {
    return analyticsEngine.exportData(format);
  }, [analyticsEngine]);

  // Get productivity insights
  const getProductivityInsights = useCallback(() => {
    if (!metrics) return [];
    
    const insights = [];
    
    if (metrics.productivity.completionRate > 0.8) {
      insights.push({
        type: 'success',
        title: 'Yüksek Tamamlanma Oranı',
        description: `Tamamlanma oranınız %${(metrics.productivity.completionRate * 100).toFixed(1)}`,
      });
    }
    
    if (metrics.patterns.workStreak > 7) {
      insights.push({
        type: 'achievement',
        title: 'Uzun Çalışma Serisi',
        description: `${metrics.patterns.workStreak} gün üst üste çalışıyorsunuz!`,
      });
    }
    
    if (metrics.performance.focusScore < 60) {
      insights.push({
        type: 'warning',
        title: 'Odaklanma Skoru Düşük',
        description: 'Kesintileri azaltmaya odaklanın',
      });
    }
    
    return insights;
  }, [metrics]);

  // Get performance trends
  const getPerformanceTrends = useCallback(() => {
    if (!dashboardData) return null;
    
    return {
      productivity: dashboardData.trends.productivity,
      focus: dashboardData.trends.focus,
      energy: dashboardData.trends.energy,
      mood: dashboardData.trends.mood,
    };
  }, [dashboardData]);

  // Get goal progress
  const getGoalProgress = useCallback(() => {
    if (!metrics) return null;
    
    return {
      daily: {
        current: dashboardData?.overview.todayPomodoros || 0,
        target: metrics.goals.dailyGoal,
        progress: Math.min(100, ((dashboardData?.overview.todayPomodoros || 0) / metrics.goals.dailyGoal) * 100),
      },
      weekly: {
        current: dashboardData?.overview.weekPomodoros || 0,
        target: metrics.goals.weeklyGoal,
        progress: Math.min(100, ((dashboardData?.overview.weekPomodoros || 0) / metrics.goals.weeklyGoal) * 100),
      },
      monthly: {
        current: dashboardData?.overview.monthPomodoros || 0,
        target: metrics.goals.monthlyGoal,
        progress: Math.min(100, ((dashboardData?.overview.monthPomodoros || 0) / metrics.goals.monthlyGoal) * 100),
      },
    };
  }, [metrics, dashboardData]);

  // Get recommendations
  const getRecommendations = useCallback(() => {
    if (!dashboardData) return [];
    
    return dashboardData.recommendations;
  }, [dashboardData]);

  // Get insights
  const getInsights = useCallback(() => {
    if (!dashboardData) return [];
    
    return dashboardData.insights;
  }, [dashboardData]);

  // Auto-calculate metrics when data changes
  useEffect(() => {
    if (sessions.length > 0 || tasks.length > 0) {
      calculateMetrics();
      generateDashboardData();
    }
  }, [sessions.length, tasks.length, calculateMetrics, generateDashboardData]);

  return {
    // State
    metrics,
    dashboardData,
    isLoading,
    error,
    
    // Actions
    calculateMetrics,
    generateDashboardData,
    trackEvent,
    trackPomodoroStart,
    trackPomodoroComplete,
    trackPomodoroPause,
    trackBreakStart,
    trackBreakComplete,
    trackTaskCreate,
    trackTaskComplete,
    trackInterruption,
    exportData,
    
    // Getters
    getProductivityInsights,
    getPerformanceTrends,
    getGoalProgress,
    getRecommendations,
    getInsights,
  };
};
