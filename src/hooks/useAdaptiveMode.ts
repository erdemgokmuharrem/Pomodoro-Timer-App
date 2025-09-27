import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface UserBehaviorPattern {
  id: string;
  type: 'time_preference' | 'task_complexity' | 'focus_duration' | 'break_frequency' | 'energy_level' | 'productivity_peak';
  pattern: any;
  confidence: number; // 0-1
  lastUpdated: Date;
  frequency: number; // how often this pattern occurs
}

export interface AdaptiveRecommendation {
  id: string;
  type: 'ui_layout' | 'feature_priority' | 'notification_timing' | 'theme_preference' | 'workflow_suggestion';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  implementation: {
    component: string;
    changes: any;
    priority: 'high' | 'medium' | 'low';
  };
  createdAt: Date;
}

export interface AdaptiveSettings {
  enableAdaptiveMode: boolean;
  learningEnabled: boolean;
  autoApply: boolean;
  sensitivity: number; // 0-1, how sensitive to changes
  updateFrequency: number; // hours
  respectUserChoices: boolean;
  showReasoning: boolean;
  maxRecommendations: number;
}

export const useAdaptiveMode = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP } = useGamificationStore();
  
  const [behaviorPatterns, setBehaviorPatterns] = useState<UserBehaviorPattern[]>([]);
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [settings, setSettings] = useState<AdaptiveSettings>({
    enableAdaptiveMode: true,
    learningEnabled: true,
    autoApply: false,
    sensitivity: 0.7,
    updateFrequency: 24,
    respectUserChoices: true,
    showReasoning: true,
    maxRecommendations: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze time preferences
  const analyzeTimePreferences = (): UserBehaviorPattern => {
    const timeData = completedPomodoros.map(p => ({
      hour: new Date(p.completedAt).getHours(),
      day: new Date(p.completedAt).getDay(),
      completed: p.completed,
    }));

    // Find most productive hours
    const hourlyProductivity: { [hour: number]: number } = {};
    timeData.forEach(data => {
      if (!hourlyProductivity[data.hour]) hourlyProductivity[data.hour] = 0;
      hourlyProductivity[data.hour] += data.completed ? 1 : 0;
    });

    const bestHour = Object.keys(hourlyProductivity).reduce((a, b) => 
      hourlyProductivity[parseInt(a)] > hourlyProductivity[parseInt(b)] ? a : b
    );

    return {
      id: 'time-preference',
      type: 'time_preference',
      pattern: {
        preferredHours: [parseInt(bestHour)],
        productivityMap: hourlyProductivity,
        peakHours: Object.keys(hourlyProductivity)
          .filter(hour => hourlyProductivity[parseInt(hour)] > 0.7)
          .map(Number),
      },
      confidence: 0.8,
      lastUpdated: new Date(),
      frequency: timeData.length,
    };
  };

  // Analyze task complexity preferences
  const analyzeTaskComplexityPreferences = (): UserBehaviorPattern => {
    const complexityData = tasks.map(task => {
      let complexity = 0.5;
      
      // Calculate complexity based on task properties
      if (task.title.length > 50) complexity += 0.1;
      if (task.description && task.description.length > 100) complexity += 0.1;
      if (task.priority === 'high') complexity += 0.2;
      if (task.priority === 'medium') complexity += 0.1;
      if (task.estimatedTime && task.estimatedTime > 60) complexity += 0.1;
      
      return {
        complexity,
        completed: completedPomodoros.some(p => p.taskId === task.id && p.completed),
        duration: task.estimatedTime || 25,
      };
    });

    const avgComplexity = complexityData.reduce((sum, data) => sum + data.complexity, 0) / complexityData.length;
    const completionRate = complexityData.filter(data => data.completed).length / complexityData.length;

    return {
      id: 'task-complexity',
      type: 'task_complexity',
      pattern: {
        averageComplexity: avgComplexity,
        preferredComplexity: avgComplexity,
        completionRate,
        complexityDistribution: complexityData.map(data => data.complexity),
      },
      confidence: 0.7,
      lastUpdated: new Date(),
      frequency: complexityData.length,
    };
  };

  // Analyze focus duration patterns
  const analyzeFocusDurationPatterns = (): UserBehaviorPattern => {
    const durationData = completedPomodoros.map(p => ({
      duration: p.duration,
      completed: p.completed,
      timeOfDay: new Date(p.completedAt).getHours(),
    }));

    const avgDuration = durationData.reduce((sum, data) => sum + data.duration, 0) / durationData.length;
    const successfulDurations = durationData.filter(data => data.completed).map(data => data.duration);
    const optimalDuration = successfulDurations.length > 0 
      ? successfulDurations.reduce((sum, d) => sum + d, 0) / successfulDurations.length 
      : avgDuration;

    return {
      id: 'focus-duration',
      type: 'focus_duration',
      pattern: {
        averageDuration: avgDuration,
        optimalDuration,
        durationVariation: Math.abs(avgDuration - optimalDuration),
        timeBasedDuration: durationData.reduce((acc, data) => {
          if (!acc[data.timeOfDay]) acc[data.timeOfDay] = [];
          acc[data.timeOfDay].push(data.duration);
          return acc;
        }, {} as { [hour: number]: number[] }),
      },
      confidence: 0.8,
      lastUpdated: new Date(),
      frequency: durationData.length,
    };
  };

  // Analyze break frequency patterns
  const analyzeBreakFrequencyPatterns = (): UserBehaviorPattern => {
    const breakData = completedPomodoros
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
      .map((p, index, array) => {
        if (index === 0) return null;
        const prevPomodoro = array[index - 1];
        const timeDiff = new Date(p.completedAt).getTime() - new Date(prevPomodoro.completedAt).getTime();
        return {
          breakDuration: timeDiff / (1000 * 60), // minutes
          wasBreak: timeDiff > 5 * 60 * 1000, // more than 5 minutes
          completed: p.completed,
        };
      })
      .filter(Boolean);

    const avgBreakDuration = breakData.reduce((sum, data) => sum + data.breakDuration, 0) / breakData.length;
    const breakFrequency = breakData.filter(data => data.wasBreak).length / breakData.length;

    return {
      id: 'break-frequency',
      type: 'break_frequency',
      pattern: {
        averageBreakDuration: avgBreakDuration,
        breakFrequency,
        optimalBreakDuration: avgBreakDuration,
        breakPattern: breakData.map(data => ({
          duration: data.breakDuration,
          wasBreak: data.wasBreak,
        })),
      },
      confidence: 0.6,
      lastUpdated: new Date(),
      frequency: breakData.length,
    };
  };

  // Analyze energy level patterns
  const analyzeEnergyLevelPatterns = (): UserBehaviorPattern => {
    const energyData = completedPomodoros.map(p => ({
      hour: new Date(p.completedAt).getHours(),
      day: new Date(p.completedAt).getDay(),
      completed: p.completed,
      duration: p.duration,
    }));

    // Calculate energy levels based on completion rate and duration
    const hourlyEnergy: { [hour: number]: number } = {};
    energyData.forEach(data => {
      if (!hourlyEnergy[data.hour]) hourlyEnergy[data.hour] = 0;
      const energyScore = data.completed ? 1 : 0.3;
      hourlyEnergy[data.hour] = (hourlyEnergy[data.hour] + energyScore) / 2;
    });

    const peakEnergyHours = Object.keys(hourlyEnergy)
      .filter(hour => hourlyEnergy[parseInt(hour)] > 0.7)
      .map(Number);

    return {
      id: 'energy-level',
      type: 'energy_level',
      pattern: {
        hourlyEnergy,
        peakEnergyHours,
        averageEnergy: Object.values(hourlyEnergy).reduce((sum, energy) => sum + energy, 0) / Object.values(hourlyEnergy).length,
        energyPattern: hourlyEnergy,
      },
      confidence: 0.8,
      lastUpdated: new Date(),
      frequency: energyData.length,
    };
  };

  // Analyze productivity peaks
  const analyzeProductivityPeaks = (): UserBehaviorPattern => {
    const productivityData = completedPomodoros.map(p => ({
      date: new Date(p.completedAt).toDateString(),
      hour: new Date(p.completedAt).getHours(),
      day: new Date(p.completedAt).getDay(),
      completed: p.completed,
      duration: p.duration,
    }));

    // Group by day and calculate daily productivity
    const dailyProductivity: { [date: string]: number } = {};
    productivityData.forEach(data => {
      if (!dailyProductivity[data.date]) dailyProductivity[data.date] = 0;
      dailyProductivity[data.date] += data.completed ? 1 : 0;
    });

    const avgDailyProductivity = Object.values(dailyProductivity).reduce((sum, prod) => sum + prod, 0) / Object.values(dailyProductivity).length;
    const bestDays = Object.keys(dailyProductivity)
      .filter(date => dailyProductivity[date] > avgDailyProductivity * 1.2);

    return {
      id: 'productivity-peak',
      type: 'productivity_peak',
      pattern: {
        dailyProductivity,
        averageDailyProductivity: avgDailyProductivity,
        bestDays,
        productivityTrend: Object.values(dailyProductivity),
      },
      confidence: 0.7,
      lastUpdated: new Date(),
      frequency: Object.keys(dailyProductivity).length,
    };
  };

  // Generate adaptive recommendations
  const generateAdaptiveRecommendations = (): AdaptiveRecommendation[] => {
    const recommendations: AdaptiveRecommendation[] = [];

    // UI Layout recommendations
    const timePattern = behaviorPatterns.find(p => p.type === 'time_preference');
    if (timePattern && timePattern.pattern.peakHours.length > 0) {
      recommendations.push({
        id: 'ui-layout-1',
        type: 'ui_layout',
        title: 'Zaman Bazlı UI Düzeni',
        description: 'En verimli saatlerinize göre arayüz düzenini optimize edin',
        confidence: timePattern.confidence,
        reasoning: `Analiz sonucunda ${timePattern.pattern.peakHours.join(', ')} saatlerinde daha verimli olduğunuz tespit edildi`,
        implementation: {
          component: 'DashboardLayout',
          changes: {
            showTimeBasedCards: true,
            highlightPeakHours: timePattern.pattern.peakHours,
            adaptiveTheme: true,
          },
          priority: 'high',
        },
        createdAt: new Date(),
      });
    }

    // Feature priority recommendations
    const complexityPattern = behaviorPatterns.find(p => p.type === 'task_complexity');
    if (complexityPattern && complexityPattern.pattern.averageComplexity > 0.7) {
      recommendations.push({
        id: 'feature-priority-1',
        type: 'feature_priority',
        title: 'Karmaşık Görev Odaklı Özellikler',
        description: 'Karmaşık görevlerle çalıştığınız için gelişmiş özellikleri önceliklendirin',
        confidence: complexityPattern.confidence,
        reasoning: 'Görevlerinizin ortalama karmaşıklığı yüksek, bu nedenle gelişmiş planlama özellikleri önerilir',
        implementation: {
          component: 'FeaturePriority',
          changes: {
            prioritizeAdvancedFeatures: true,
            showComplexityAnalysis: true,
            enableAutoSplit: true,
            showTaskDependencies: true,
          },
          priority: 'high',
        },
        createdAt: new Date(),
      });
    }

    // Notification timing recommendations
    const energyPattern = behaviorPatterns.find(p => p.type === 'energy_level');
    if (energyPattern && energyPattern.pattern.peakEnergyHours.length > 0) {
      recommendations.push({
        id: 'notification-timing-1',
        type: 'notification_timing',
        title: 'Akıllı Bildirim Zamanlaması',
        description: 'Enerji seviyenize göre bildirim zamanlarını optimize edin',
        confidence: energyPattern.confidence,
        reasoning: `Enerji seviyenizin yüksek olduğu saatler: ${energyPattern.pattern.peakEnergyHours.join(', ')}`,
        implementation: {
          component: 'NotificationSystem',
          changes: {
            optimalNotificationHours: energyPattern.pattern.peakEnergyHours,
            reduceNotificationsDuringLowEnergy: true,
            adaptiveNotificationFrequency: true,
          },
          priority: 'medium',
        },
        createdAt: new Date(),
      });
    }

    // Theme preference recommendations
    const focusPattern = behaviorPatterns.find(p => p.type === 'focus_duration');
    if (focusPattern && focusPattern.pattern.optimalDuration > 30) {
      recommendations.push({
        id: 'theme-preference-1',
        type: 'theme_preference',
        title: 'Uzun Odaklanma Teması',
        description: 'Uzun odaklanma seansları için göz yorgunluğunu azaltan tema',
        confidence: focusPattern.confidence,
        reasoning: 'Ortalama odaklanma süreniz 30 dakikadan fazla, göz yorgunluğunu azaltmak için koyu tema önerilir',
        implementation: {
          component: 'ThemeProvider',
          changes: {
            preferDarkTheme: true,
            reduceBlueLight: true,
            adaptiveBrightness: true,
            focusModeColors: true,
          },
          priority: 'medium',
        },
        createdAt: new Date(),
      });
    }

    // Workflow suggestions
    const breakPattern = behaviorPatterns.find(p => p.type === 'break_frequency');
    if (breakPattern && breakPattern.pattern.breakFrequency < 0.3) {
      recommendations.push({
        id: 'workflow-suggestion-1',
        type: 'workflow_suggestion',
        title: 'Daha Sık Mola Önerisi',
        description: 'Mola sıklığınız düşük, daha sık mola almanız önerilir',
        confidence: breakPattern.confidence,
        reasoning: 'Mola sıklığınız %30\'un altında, bu durum yorgunluğa ve verimlilik kaybına neden olabilir',
        implementation: {
          component: 'BreakReminder',
          changes: {
            increaseBreakReminders: true,
            suggestMicroBreaks: true,
            adaptiveBreakTiming: true,
            breakActivitySuggestions: true,
          },
          priority: 'high',
        },
        createdAt: new Date(),
      });
    }

    return recommendations.slice(0, settings.maxRecommendations);
  };

  // Analyze all behavior patterns
  const analyzeBehaviorPatterns = async (): Promise<UserBehaviorPattern[]> => {
    try {
      setLoading(true);
      setError(null);

      const patterns = [
        analyzeTimePreferences(),
        analyzeTaskComplexityPreferences(),
        analyzeFocusDurationPatterns(),
        analyzeBreakFrequencyPatterns(),
        analyzeEnergyLevelPatterns(),
        analyzeProductivityPeaks(),
      ];

      setBehaviorPatterns(patterns);
      return patterns;
    } catch (err) {
      setError('Failed to analyze behavior patterns');
      console.error('Analyze behavior patterns error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generate recommendations
  const generateRecommendations = async (): Promise<AdaptiveRecommendation[]> => {
    try {
      const patterns = await analyzeBehaviorPatterns();
      const newRecommendations = generateAdaptiveRecommendations();
      setRecommendations(newRecommendations);
      return newRecommendations;
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Generate recommendations error:', err);
      return [];
    }
  };

  // Apply recommendation
  const applyRecommendation = async (recommendationId: string): Promise<boolean> => {
    try {
      const recommendation = recommendations.find(r => r.id === recommendationId);
      if (!recommendation) return false;

      // In a real app, this would apply the recommendation
      console.log(`Applied recommendation: ${recommendation.title}`);
      return true;
    } catch (err) {
      console.error('Apply recommendation error:', err);
      return false;
    }
  };

  // Learn from user interaction
  const learnFromInteraction = async (interaction: {
    type: string;
    component: string;
    action: string;
    result: 'positive' | 'negative' | 'neutral';
    timestamp: Date;
  }) => {
    try {
      if (!settings.learningEnabled) return;

      // In a real app, this would update the learning model
      console.log(`Learning from interaction: ${interaction.type} - ${interaction.result}`);
    } catch (err) {
      console.error('Learn from interaction error:', err);
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<AdaptiveSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get adaptive insights
  const getAdaptiveInsights = () => {
    if (behaviorPatterns.length === 0) return null;

    const totalPatterns = behaviorPatterns.length;
    const highConfidencePatterns = behaviorPatterns.filter(p => p.confidence > 0.8).length;
    const avgConfidence = behaviorPatterns.reduce((sum, p) => sum + p.confidence, 0) / totalPatterns;
    const totalRecommendations = recommendations.length;
    const highPriorityRecommendations = recommendations.filter(r => r.implementation.priority === 'high').length;

    return {
      totalPatterns,
      highConfidencePatterns,
      averageConfidence: avgConfidence,
      totalRecommendations,
      highPriorityRecommendations,
      learningEnabled: settings.learningEnabled,
      adaptiveModeEnabled: settings.enableAdaptiveMode,
    };
  };

  // Auto-update patterns and recommendations
  useEffect(() => {
    if (settings.enableAdaptiveMode && completedPomodoros.length > 0) {
      generateRecommendations();
    }
  }, [completedPomodoros, settings.enableAdaptiveMode]);

  return {
    behaviorPatterns,
    recommendations,
    settings,
    loading,
    error,
    analyzeBehaviorPatterns,
    generateRecommendations,
    applyRecommendation,
    learnFromInteraction,
    updateSettings,
    getAdaptiveInsights,
  };
};
