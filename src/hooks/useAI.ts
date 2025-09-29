import { useState, useEffect, useCallback } from 'react';
import {
  SmartScheduler,
  SmartSuggestion,
  EnergyAnalysis,
} from '../ai/smartScheduler';
import {
  RecommendationEngine,
  Recommendation,
  ContextualData,
} from '../ai/recommendationEngine';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export const useAI = () => {
  const { tasks, sessions } = usePomodoroStore();
  const { userStats } = useGamificationStore();

  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [energyAnalysis, setEnergyAnalysis] = useState<EnergyAnalysis | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize AI systems
  const smartScheduler = new SmartScheduler(
    {
      mostProductiveHours: [9, 10, 11, 14, 15, 16],
      preferredBreakTimes: [5, 15],
      averageSessionLength: 25,
      focusScore:
        userStats.totalFocusTime > 0
          ? Math.min(100, (userStats.totalFocusTime / 1000) * 10)
          : 50,
      energyLevel:
        userStats.currentStreak > 7
          ? 'high'
          : userStats.currentStreak > 3
            ? 'medium'
            : 'low',
      mood:
        userStats.currentStreak > 5
          ? 'positive'
          : userStats.currentStreak > 2
            ? 'neutral'
            : 'negative',
    },
    sessions,
    tasks
  );

  const recommendationEngine = new RecommendationEngine(
    {
      workingHours: [9, 10, 11, 14, 15, 16],
      breakPatterns: [5, 15, 30],
      taskCompletionRate:
        tasks.length > 0
          ? tasks.filter(t => t.isCompleted).length / tasks.length
          : 0,
      focusScore:
        userStats.totalFocusTime > 0
          ? Math.min(100, (userStats.totalFocusTime / 1000) * 10)
          : 50,
      productivityTrend:
        userStats.currentStreak > 5
          ? 'increasing'
          : userStats.currentStreak > 2
            ? 'stable'
            : 'decreasing',
      preferredTaskTypes: ['work', 'study', 'creative'],
      energyPatterns: {
        morning: 80,
        afternoon: 60,
        evening: 40,
      },
    },
    sessions,
    tasks
  );

  // Generate suggestions
  const generateSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newSuggestions = smartScheduler.generateSuggestions();
      setSuggestions(newSuggestions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate suggestions'
      );
    } finally {
      setIsLoading(false);
    }
  }, [smartScheduler]);

  // Generate recommendations
  const generateRecommendations = useCallback(
    async (context?: Partial<ContextualData>) => {
      setIsLoading(true);
      setError(null);

      try {
        const contextualData: ContextualData = {
          currentTime: new Date(),
          upcomingDeadlines: tasks.filter(
            t => !t.isCompleted && t.priority === 'high'
          ).length,
          recentInterruptions: sessions
            .filter(
              s =>
                new Date(s.startTime) >
                new Date(Date.now() - 24 * 60 * 60 * 1000)
            )
            .reduce((sum, s) => sum + s.interruptions, 0),
          ...context,
        };

        const newRecommendations =
          recommendationEngine.generateRecommendations(contextualData);
        setRecommendations(newRecommendations);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to generate recommendations'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [recommendationEngine, tasks, sessions]
  );

  // Analyze energy
  const analyzeEnergy = useCallback(async () => {
    try {
      const analysis = smartScheduler.analyzeEnergy(new Date());
      setEnergyAnalysis(analysis);
    } catch (err) {
      console.error('Failed to analyze energy:', err);
    }
  }, [smartScheduler]);

  // Get optimal work times
  const getOptimalWorkTimes = useCallback(
    (days: number = 7) => {
      return smartScheduler.predictOptimalWorkTimes(days);
    },
    [smartScheduler]
  );

  // Schedule smart break
  const scheduleSmartBreak = useCallback(
    (currentSession: any) => {
      return smartScheduler.scheduleBreak(currentSession);
    },
    [smartScheduler]
  );

  // Apply recommendation
  const applyRecommendation = useCallback(
    (recommendationId: string) => {
      const recommendation = recommendations.find(
        r => r.id === recommendationId
      );
      if (!recommendation) return false;

      // Handle different recommendation types
      switch (recommendation.type) {
        case 'task':
          // Navigate to task or start task
          console.log('Applying task recommendation:', recommendation);
          return true;

        case 'break':
          // Start break
          console.log('Applying break recommendation:', recommendation);
          return true;

        case 'schedule':
          // Update schedule
          console.log('Applying schedule recommendation:', recommendation);
          return true;

        case 'habit':
          // Set habit reminder
          console.log('Applying habit recommendation:', recommendation);
          return true;

        default:
          return false;
      }
    },
    [recommendations]
  );

  // Get suggestion for specific task
  const getTaskSuggestion = useCallback(
    (taskId: string) => {
      return suggestions.find(s => s.taskId === taskId);
    },
    [suggestions]
  );

  // Get high-priority recommendations
  const getHighPriorityRecommendations = useCallback(() => {
    return recommendations.filter(r => r.priority === 'high');
  }, [recommendations]);

  // Get recommendations by type
  const getRecommendationsByType = useCallback(
    (type: Recommendation['type']) => {
      return recommendations.filter(r => r.type === type);
    },
    [recommendations]
  );

  // Auto-generate suggestions and recommendations on data change
  useEffect(() => {
    if (tasks.length > 0 || sessions.length > 0) {
      generateSuggestions();
      generateRecommendations();
      analyzeEnergy();
    }
  }, [
    tasks.length,
    sessions.length,
    generateSuggestions,
    generateRecommendations,
    analyzeEnergy,
  ]);

  return {
    // State
    suggestions,
    recommendations,
    energyAnalysis,
    isLoading,
    error,

    // Actions
    generateSuggestions,
    generateRecommendations,
    analyzeEnergy,
    applyRecommendation,

    // Getters
    getOptimalWorkTimes,
    scheduleSmartBreak,
    getTaskSuggestion,
    getHighPriorityRecommendations,
    getRecommendationsByType,
  };
};
