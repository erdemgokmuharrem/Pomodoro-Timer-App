import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface DurationRecommendation {
  id: string;
  taskId: string;
  recommendedDuration: number; // minutes
  confidence: number; // 0-1
  reasoning: string;
  factors: {
    taskComplexity: number;
    userEnergy: number;
    historicalPerformance: number;
    timeOfDay: number;
    dayOfWeek: number;
    previousSessions: number;
    breakDuration: number;
    focusStreak: number;
  };
  alternatives: Array<{
    duration: number;
    confidence: number;
    reasoning: string;
  }>;
  createdAt: Date;
}

export interface SmartDurationSettings {
  enableAI: boolean;
  learningEnabled: boolean;
  confidenceThreshold: number;
  autoApply: boolean;
  showReasoning: boolean;
  updateFrequency: number; // hours
  maxHistoryDays: number;
}

export const useSmartDuration = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP } = useGamificationStore();
  
  const [recommendations, setRecommendations] = useState<DurationRecommendation[]>([]);
  const [settings, setSettings] = useState<SmartDurationSettings>({
    enableAI: true,
    learningEnabled: true,
    confidenceThreshold: 0.7,
    autoApply: false,
    showReasoning: true,
    updateFrequency: 24,
    maxHistoryDays: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze task complexity
  const analyzeTaskComplexity = (task: any): number => {
    let complexity = 0.5; // Base complexity

    // Title length factor
    if (task.title.length > 50) complexity += 0.1;
    if (task.title.length > 100) complexity += 0.1;

    // Description factor
    if (task.description && task.description.length > 100) complexity += 0.1;
    if (task.description && task.description.length > 300) complexity += 0.1;

    // Priority factor
    if (task.priority === 'high') complexity += 0.2;
    if (task.priority === 'medium') complexity += 0.1;

    // Tags factor
    if (task.tags && task.tags.length > 3) complexity += 0.1;
    if (task.tags && task.tags.includes('complex')) complexity += 0.2;
    if (task.tags && task.tags.includes('urgent')) complexity += 0.1;

    // Estimated time factor
    if (task.estimatedTime) {
      if (task.estimatedTime > 60) complexity += 0.2;
      if (task.estimatedTime > 120) complexity += 0.1;
    }

    return Math.min(1, Math.max(0, complexity));
  };

  // Analyze user energy level
  const analyzeUserEnergy = (): number => {
    const now = new Date();
    const hour = now.getHours();
    
    // Time-based energy patterns
    let energy = 0.5;
    
    if (hour >= 9 && hour <= 11) energy = 0.9; // Morning peak
    else if (hour >= 14 && hour <= 16) energy = 0.8; // Afternoon peak
    else if (hour >= 20 && hour <= 22) energy = 0.7; // Evening
    else if (hour >= 6 && hour <= 8) energy = 0.6; // Early morning
    else if (hour >= 12 && hour <= 13) energy = 0.4; // Lunch time
    else if (hour >= 18 && hour <= 19) energy = 0.5; // Evening transition
    else energy = 0.3; // Low energy times

    // Adjust based on user level (more experienced = better energy management)
    const levelBonus = Math.min(0.2, userLevel * 0.02);
    energy += levelBonus;

    return Math.min(1, Math.max(0, energy));
  };

  // Analyze historical performance
  const analyzeHistoricalPerformance = (taskId: string): number => {
    const taskSessions = completedPomodoros.filter(p => p.taskId === taskId);
    
    if (taskSessions.length === 0) return 0.5; // Default for new tasks

    const completionRate = taskSessions.filter(p => p.completed).length / taskSessions.length;
    const averageDuration = taskSessions.reduce((sum, p) => sum + p.duration, 0) / taskSessions.length;
    
    // Performance score based on completion rate and duration consistency
    let performance = completionRate;
    
    // Bonus for consistent durations
    const durationVariance = taskSessions.reduce((sum, p) => 
      sum + Math.pow(p.duration - averageDuration, 2), 0) / taskSessions.length;
    const consistencyBonus = Math.max(0, 0.2 - durationVariance / 100);
    performance += consistencyBonus;

    return Math.min(1, Math.max(0, performance));
  };

  // Get time of day factor
  const getTimeOfDayFactor = (): number => {
    const now = new Date();
    const hour = now.getHours();
    
    // Focus-friendly hours get higher scores
    if (hour >= 9 && hour <= 11) return 1.0;
    if (hour >= 14 && hour <= 16) return 0.9;
    if (hour >= 20 && hour <= 22) return 0.8;
    if (hour >= 6 && hour <= 8) return 0.7;
    if (hour >= 12 && hour <= 13) return 0.4; // Lunch time
    if (hour >= 18 && hour <= 19) return 0.6;
    return 0.5;
  };

  // Get day of week factor
  const getDayOfWeekFactor = (): number => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Weekdays are generally better for focus
    if (dayOfWeek >= 1 && dayOfWeek <= 5) return 1.0;
    if (dayOfWeek === 0) return 0.7; // Sunday
    return 0.8; // Saturday
  };

  // Calculate recommended duration
  const calculateRecommendedDuration = (task: any): DurationRecommendation => {
    const complexity = analyzeTaskComplexity(task);
    const energy = analyzeUserEnergy();
    const historicalPerformance = analyzeHistoricalPerformance(task.id);
    const timeOfDay = getTimeOfDayFactor();
    const dayOfWeek = getDayOfWeekFactor();
    
    // Get recent session count for this task
    const recentSessions = completedPomodoros.filter(p => 
      p.taskId === task.id && 
      (Date.now() - new Date(p.completedAt).getTime()) < 24 * 60 * 60 * 1000
    ).length;
    
    // Get current focus streak
    const focusStreak = completedPomodoros.filter(p => 
      p.completed && 
      (Date.now() - new Date(p.completedAt).getTime()) < 2 * 60 * 60 * 1000
    ).length;

    // Base duration calculation
    let baseDuration = 25; // Default pomodoro duration
    
    // Adjust based on complexity
    if (complexity > 0.8) baseDuration = 45; // Complex tasks need longer sessions
    else if (complexity > 0.6) baseDuration = 35;
    else if (complexity < 0.3) baseDuration = 15; // Simple tasks can be shorter

    // Adjust based on energy
    if (energy > 0.8) baseDuration *= 1.2; // High energy = longer sessions
    else if (energy < 0.4) baseDuration *= 0.7; // Low energy = shorter sessions

    // Adjust based on historical performance
    if (historicalPerformance > 0.8) baseDuration *= 1.1; // Good performance = slightly longer
    else if (historicalPerformance < 0.4) baseDuration *= 0.8; // Poor performance = shorter

    // Adjust based on time factors
    baseDuration *= timeOfDay;
    baseDuration *= dayOfWeek;

    // Adjust based on recent sessions (fatigue factor)
    if (recentSessions > 3) baseDuration *= 0.8; // Reduce if too many recent sessions
    if (focusStreak > 5) baseDuration *= 0.9; // Slight reduction for long streaks

    // Round to nearest 5 minutes
    const recommendedDuration = Math.round(baseDuration / 5) * 5;
    const finalDuration = Math.max(10, Math.min(60, recommendedDuration)); // Clamp between 10-60 minutes

    // Calculate confidence
    const confidence = Math.min(1, 
      (complexity * 0.3) + 
      (energy * 0.2) + 
      (historicalPerformance * 0.3) + 
      (timeOfDay * 0.1) + 
      (dayOfWeek * 0.1)
    );

    // Generate reasoning
    const reasoning = generateReasoning(complexity, energy, historicalPerformance, timeOfDay, dayOfWeek);

    // Generate alternatives
    const alternatives = generateAlternatives(finalDuration, complexity, energy);

    return {
      id: `rec-${Date.now()}`,
      taskId: task.id,
      recommendedDuration: finalDuration,
      confidence,
      reasoning,
      factors: {
        taskComplexity: complexity,
        userEnergy: energy,
        historicalPerformance,
        timeOfDay,
        dayOfWeek,
        previousSessions: recentSessions,
        breakDuration: 5, // Default break duration
        focusStreak,
      },
      alternatives,
      createdAt: new Date(),
    };
  };

  // Generate reasoning text
  const generateReasoning = (
    complexity: number, 
    energy: number, 
    historicalPerformance: number, 
    timeOfDay: number, 
    dayOfWeek: number
  ): string => {
    const reasons = [];
    
    if (complexity > 0.7) {
      reasons.push('Bu görev karmaşık görünüyor');
    } else if (complexity < 0.3) {
      reasons.push('Bu görev basit görünüyor');
    }
    
    if (energy > 0.8) {
      reasons.push('Şu anda yüksek enerji seviyesindesiniz');
    } else if (energy < 0.4) {
      reasons.push('Enerji seviyeniz düşük, kısa seanslar daha iyi olabilir');
    }
    
    if (historicalPerformance > 0.8) {
      reasons.push('Bu görevde geçmişte başarılı oldunuz');
    } else if (historicalPerformance < 0.4) {
      reasons.push('Bu görevde geçmişte zorlandınız');
    }
    
    if (timeOfDay > 0.8) {
      reasons.push('Odaklanma için ideal saatler');
    } else if (timeOfDay < 0.5) {
      reasons.push('Odaklanma için zor saatler');
    }
    
    if (dayOfWeek < 0.8) {
      reasons.push('Hafta sonu, daha esnek süreler önerilir');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Standart süre önerisi';
  };

  // Generate alternative durations
  const generateAlternatives = (baseDuration: number, complexity: number, energy: number): Array<{
    duration: number;
    confidence: number;
    reasoning: string;
  }> => {
    const alternatives = [];
    
    // Shorter alternative
    const shorterDuration = Math.max(10, baseDuration - 10);
    if (shorterDuration !== baseDuration) {
      alternatives.push({
        duration: shorterDuration,
        confidence: Math.max(0.3, 0.8 - complexity * 0.3),
        reasoning: 'Daha kısa süre, daha az yorucu',
      });
    }
    
    // Longer alternative
    const longerDuration = Math.min(60, baseDuration + 15);
    if (longerDuration !== baseDuration && energy > 0.6) {
      alternatives.push({
        duration: longerDuration,
        confidence: Math.max(0.3, energy * 0.8),
        reasoning: 'Yüksek enerji ile daha uzun seans',
      });
    }
    
    return alternatives;
  };

  // Get recommendations for all tasks
  const getRecommendations = async (): Promise<DurationRecommendation[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const newRecommendations = tasks.map(task => calculateRecommendedDuration(task));
      setRecommendations(newRecommendations);
      
      return newRecommendations;
    } catch (err) {
      setError('Failed to get duration recommendations');
      console.error('Get recommendations error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get recommendation for specific task
  const getTaskRecommendation = async (taskId: string): Promise<DurationRecommendation | null> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return null;
      
      const recommendation = calculateRecommendedDuration(task);
      return recommendation;
    } catch (err) {
      console.error('Get task recommendation error:', err);
      return null;
    }
  };

  // Apply recommendation
  const applyRecommendation = async (recommendationId: string): Promise<boolean> => {
    try {
      const recommendation = recommendations.find(r => r.id === recommendationId);
      if (!recommendation) return false;
      
      // In a real app, this would update the task's estimated duration
      console.log(`Applied recommendation: ${recommendation.recommendedDuration} minutes`);
      return true;
    } catch (err) {
      console.error('Apply recommendation error:', err);
      return false;
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<SmartDurationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Learn from session results
  const learnFromSession = async (taskId: string, actualDuration: number, completed: boolean) => {
    try {
      if (!settings.learningEnabled) return;
      
      // In a real app, this would update the AI model with feedback
      console.log(`Learning from session: Task ${taskId}, Duration ${actualDuration}, Completed ${completed}`);
    } catch (err) {
      console.error('Learn from session error:', err);
    }
  };

  // Get insights
  const getInsights = () => {
    if (recommendations.length === 0) return null;
    
    const avgConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length;
    const avgDuration = recommendations.reduce((sum, r) => sum + r.recommendedDuration, 0) / recommendations.length;
    
    return {
      averageConfidence: avgConfidence,
      averageRecommendedDuration: avgDuration,
      totalRecommendations: recommendations.length,
      highConfidenceCount: recommendations.filter(r => r.confidence > 0.8).length,
    };
  };

  // Auto-update recommendations
  useEffect(() => {
    if (settings.enableAI && tasks.length > 0) {
      getRecommendations();
    }
  }, [tasks, settings.enableAI]);

  return {
    recommendations,
    settings,
    loading,
    error,
    getRecommendations,
    getTaskRecommendation,
    applyRecommendation,
    updateSettings,
    learnFromSession,
    getInsights,
  };
};
