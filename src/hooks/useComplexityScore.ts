import { useState, useCallback, useMemo } from 'react';
import { usePomodoroStore, Task } from '../store/usePomodoroStore';
import { useTagStore } from '../store/useTagStore';

export interface ComplexityFactors {
  duration: number; // 0-1, pomodoro sayısına göre
  priority: number; // 0-1, öncelik seviyesine göre
  tags: number; // 0-1, etiket sayısına göre
  dependencies: number; // 0-1, bağımlılık sayısına göre
  context: number; // 0-1, context karmaşıklığına göre
  cognitive: number; // 0-1, bilişsel yük
  physical: number; // 0-1, fiziksel yük
  emotional: number; // 0-1, duygusal yük
}

export interface ComplexityScore {
  overall: number; // 0-100
  factors: ComplexityFactors;
  level: 'simple' | 'moderate' | 'complex' | 'very-complex';
  recommendations: string[];
  estimatedDifficulty: number; // 1-10
  timeMultiplier: number; // Gerçek süre çarpanı
}

export interface ComplexityHistory {
  taskId: string;
  score: ComplexityScore;
  timestamp: Date;
  actualDuration: number; // Gerçek süre
  accuracy: number; // Tahmin doğruluğu
}

export const useComplexityScore = () => {
  const { tasks, sessions } = usePomodoroStore();
  const { tags } = useTagStore();
  
  const [complexityHistory, setComplexityHistory] = useState<ComplexityHistory[]>([]);

  // Calculate complexity factors for a task
  const calculateComplexityFactors = useCallback((task: Task): ComplexityFactors => {
    // Duration factor (0-1)
    const durationFactor = Math.min(1, task.estimatedPomodoros / 10); // Max at 10 pomodoros

    // Priority factor (0-1)
    const priorityFactor = task.priority === 'high' ? 0.8 : task.priority === 'medium' ? 0.5 : 0.2;

    // Tags factor (0-1)
    const tagsFactor = Math.min(1, task.tags.length / 5); // Max at 5 tags

    // Dependencies factor (0-1) - based on task relationships
    const dependenciesFactor = 0.3; // Placeholder, could be enhanced with task relationships

    // Context factor (0-1) - based on tag complexity
    const contextFactor = task.tags.some(tag => 
      ['analiz', 'araştırma', 'planlama', 'koordinasyon'].includes(tag.toLowerCase())
    ) ? 0.8 : 0.3;

    // Cognitive factor (0-1) - based on task type
    const cognitiveKeywords = ['analiz', 'araştırma', 'planlama', 'tasarım', 'yazı', 'öğrenme'];
    const cognitiveFactor = task.tags.some(tag => 
      cognitiveKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    ) ? 0.8 : 0.3;

    // Physical factor (0-1) - based on task type
    const physicalKeywords = ['temizlik', 'taşıma', 'kurulum', 'montaj', 'egzersiz'];
    const physicalFactor = task.tags.some(tag => 
      physicalKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    ) ? 0.7 : 0.2;

    // Emotional factor (0-1) - based on task type
    const emotionalKeywords = ['iletişim', 'sunum', 'toplantı', 'değerlendirme', 'feedback'];
    const emotionalFactor = task.tags.some(tag => 
      emotionalKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    ) ? 0.6 : 0.2;

    return {
      duration: durationFactor,
      priority: priorityFactor,
      tags: tagsFactor,
      dependencies: dependenciesFactor,
      context: contextFactor,
      cognitive: cognitiveFactor,
      physical: physicalFactor,
      emotional: emotionalFactor,
    };
  }, []);

  // Calculate overall complexity score
  const calculateComplexityScore = useCallback((task: Task): ComplexityScore => {
    const factors = calculateComplexityFactors(task);
    
    // Weighted average of factors
    const weights = {
      duration: 0.2,
      priority: 0.15,
      tags: 0.1,
      dependencies: 0.1,
      context: 0.15,
      cognitive: 0.15,
      physical: 0.1,
      emotional: 0.05,
    };

    const overall = Object.entries(factors).reduce((sum, [key, value]) => {
      return sum + (value * (weights as any)[key] * 100);
    }, 0);

    // Determine complexity level
    let level: ComplexityScore['level'];
    if (overall < 30) level = 'simple';
    else if (overall < 50) level = 'moderate';
    else if (overall < 70) level = 'complex';
    else level = 'very-complex';

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (factors.duration > 0.7) {
      recommendations.push('Uzun süreli görev - daha küçük parçalara bölün');
    }
    if (factors.cognitive > 0.7) {
      recommendations.push('Yüksek bilişsel yük - odaklanma için sessiz ortam');
    }
    if (factors.physical > 0.6) {
      recommendations.push('Fiziksel aktivite - enerji seviyenizi kontrol edin');
    }
    if (factors.emotional > 0.6) {
      recommendations.push('Duygusal yük - destek almayı düşünün');
    }
    if (factors.tags > 0.7) {
      recommendations.push('Çoklu etiket - öncelik sıralaması yapın');
    }
    if (factors.context > 0.7) {
      recommendations.push('Karmaşık context - detaylı planlama gerekli');
    }

    // Estimate difficulty (1-10)
    const estimatedDifficulty = Math.round((overall / 100) * 10);

    // Time multiplier based on complexity
    const timeMultiplier = 1 + (overall / 100) * 0.5; // 1.0 to 1.5x

    return {
      overall: Math.round(overall),
      factors,
      level,
      recommendations,
      estimatedDifficulty,
      timeMultiplier,
    };
  }, [calculateComplexityFactors]);

  // Get complexity score for a task
  const getTaskComplexity = useCallback((task: Task): ComplexityScore => {
    return calculateComplexityScore(task);
  }, [calculateComplexityScore]);

  // Get complexity statistics
  const getComplexityStats = useCallback(() => {
    if (!tasks || tasks.length === 0) {
      return {
        averageComplexity: 0,
        complexityDistribution: {},
        mostComplexTasks: [],
        leastComplexTasks: [],
      };
    }

    const scores = tasks.map(task => ({
      task,
      score: calculateComplexityScore(task),
    }));

    const averageComplexity = scores.reduce((sum, item) => sum + item.score.overall, 0) / scores.length;

    const complexityDistribution = scores.reduce((acc, item) => {
      const level = item.score.level;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostComplexTasks = scores
      .sort((a, b) => b.score.overall - a.score.overall)
      .slice(0, 5)
      .map(item => ({
        task: item.task,
        score: item.score.overall,
        level: item.score.level,
      }));

    const leastComplexTasks = scores
      .sort((a, b) => a.score.overall - b.score.overall)
      .slice(0, 5)
      .map(item => ({
        task: item.task,
        score: item.score.overall,
        level: item.score.level,
      }));

    return {
      averageComplexity: Math.round(averageComplexity),
      complexityDistribution,
      mostComplexTasks,
      leastComplexTasks,
    };
  }, [tasks, calculateComplexityScore]);

  // Get complexity trends
  const getComplexityTrends = useCallback(() => {
    if (complexityHistory.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        period: 'insufficient-data',
      };
    }

    const recent = complexityHistory.slice(-10);
    const older = complexityHistory.slice(-20, -10);

    const recentAvg = recent.reduce((sum, item) => sum + item.score.overall, 0) / recent.length;
    const olderAvg = older.length > 0 ? 
      older.reduce((sum, item) => sum + item.score.overall, 0) / older.length : 
      recentAvg;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
    else trend = 'stable';

    return {
      trend,
      change: Math.round(change),
      period: 'recent',
    };
  }, [complexityHistory]);

  // Update complexity history
  const updateComplexityHistory = useCallback((task: Task, actualDuration: number) => {
    const score = calculateComplexityScore(task);
    const estimatedDuration = task.estimatedPomodoros * 25; // 25 minutes per pomodoro
    const accuracy = Math.max(0, 1 - Math.abs(actualDuration - estimatedDuration) / estimatedDuration);

    const historyEntry: ComplexityHistory = {
      taskId: task.id,
      score,
      timestamp: new Date(),
      actualDuration,
      accuracy,
    };

    setComplexityHistory(prev => [...prev, historyEntry]);
  }, [calculateComplexityScore]);

  // Get complexity recommendations
  const getComplexityRecommendations = useCallback(() => {
    const stats = getComplexityStats();
    const trends = getComplexityTrends();
    const recommendations: string[] = [];

    if (stats.averageComplexity > 60) {
      recommendations.push('Genel karmaşıklık seviyesi yüksek - görevleri daha küçük parçalara bölün');
    }

    if (trends.trend === 'increasing') {
      recommendations.push('Karmaşıklık artıyor - daha basit görevler ekleyin');
    }

    if (stats.complexityDistribution['very-complex'] > 3) {
      recommendations.push('Çok karmaşık görevler fazla - bazılarını basitleştirin');
    }

    if (stats.complexityDistribution['simple'] < 2) {
      recommendations.push('Basit görevler az - denge için daha fazla basit görev ekleyin');
    }

    return recommendations;
  }, [getComplexityStats, getComplexityTrends]);

  // Get tasks by complexity level
  const getTasksByComplexity = useCallback((level: ComplexityScore['level']) => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      const score = calculateComplexityScore(task);
      return score.level === level;
    });
  }, [tasks, calculateComplexityScore]);

  // Get complexity insights
  const getComplexityInsights = useCallback(() => {
    const stats = getComplexityStats();
    const trends = getComplexityTrends();
    const recommendations = getComplexityRecommendations();

    return {
      stats,
      trends,
      recommendations,
      insights: [
        `Ortalama karmaşıklık: ${stats.averageComplexity}/100`,
        `En karmaşık görev: ${stats.mostComplexTasks[0]?.task.title || 'Yok'}`,
        `Karmaşıklık trendi: ${trends.trend === 'increasing' ? 'Artıyor' : trends.trend === 'decreasing' ? 'Azalıyor' : 'Stabil'}`,
        `Öneriler: ${recommendations.length} adet`,
      ],
    };
  }, [getComplexityStats, getComplexityTrends, getComplexityRecommendations]);

  return {
    getTaskComplexity,
    getComplexityStats,
    getComplexityTrends,
    updateComplexityHistory,
    getComplexityRecommendations,
    getTasksByComplexity,
    getComplexityInsights,
    complexityHistory,
  };
};
