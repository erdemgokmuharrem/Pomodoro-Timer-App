import { useState, useEffect, useCallback } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useAutoRescheduleStore } from '../store/useAutoRescheduleStore';

export interface EnergyRecommendation {
  id: string;
  type: 'task' | 'break' | 'activity' | 'environment';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  energyLevel: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
  benefits: string[];
  icon: string;
  action?: () => void;
}

export interface EnergyPattern {
  timeOfDay: number; // 0-24
  energyLevel: 'low' | 'medium' | 'high';
  productivity: number; // 0-1
  focus: number; // 0-1
  motivation: number; // 0-1
}

export const useEnergyAnalysis = () => {
  const { sessions, tasks } = usePomodoroStore();
  const { energyLevel, calculateEnergyLevel } = useAutoRescheduleStore();

  const [energyPatterns, setEnergyPatterns] = useState<EnergyPattern[]>([]);
  const currentHour = new Date().getHours();
  const [recommendations, setRecommendations] = useState<
    EnergyRecommendation[]
  >([]);

  // Analyze energy patterns from historical data
  const analyzeEnergyPatterns = useCallback(() => {
    if (!sessions) return [];
    const patterns: EnergyPattern[] = [];

    // Group sessions by hour of day
    const sessionsByHour = sessions.reduce(
      (acc, session) => {
        const hour = new Date(session.startTime).getHours();
        if (!acc[hour]) acc[hour] = [];
        acc[hour].push(session);
        return acc;
      },
      {} as Record<number, typeof sessions>
    );

    // Calculate energy patterns for each hour
    Object.entries(sessionsByHour).forEach(([hour, hourSessions]) => {
      const hourNum = parseInt(hour);
      const completedSessions = (hourSessions || []).filter(s => s.isCompleted);
      const totalDuration = completedSessions.reduce(
        (sum, s) => sum + s.duration,
        0
      );
      const avgInterruptions =
        completedSessions.reduce((sum, s) => sum + s.interruptions, 0) /
        completedSessions.length;

      // Calculate productivity score (0-1)
      const productivity = Math.min(
        1,
        totalDuration / (completedSessions.length * 25)
      );

      // Calculate focus score (0-1) - lower interruptions = higher focus
      const focus = Math.max(0, 1 - avgInterruptions / 3);

      // Calculate motivation score (0-1) - based on completion rate
      const motivation = completedSessions.length / hourSessions.length;

      // Determine energy level
      let energyLevel: 'low' | 'medium' | 'high';
      const avgScore = (productivity + focus + motivation) / 3;
      if (avgScore >= 0.7) energyLevel = 'high';
      else if (avgScore >= 0.4) energyLevel = 'medium';
      else energyLevel = 'low';

      patterns.push({
        timeOfDay: hourNum,
        energyLevel,
        productivity,
        focus,
        motivation,
      });
    });

    setEnergyPatterns(patterns);
    return patterns;
  }, [sessions]);

  // Generate energy-based recommendations
  const generateRecommendations = useCallback(() => {
    const currentHour = new Date().getHours();
    const currentEnergy = energyLevel.level;
    const recs: EnergyRecommendation[] = [];

    // Time-based recommendations
    if (currentHour >= 6 && currentHour <= 10) {
      // Morning - high energy tasks
      recs.push({
        id: 'morning-focus',
        type: 'task',
        title: 'Sabah Odaklanma',
        description:
          'Sabah saatleri en yüksek enerji zamanınız. Zor görevlerle başlayın.',
        priority: 'high',
        energyLevel: 'high',
        estimatedDuration: 25,
        benefits: ['Yüksek konsantrasyon', 'Daha az kesinti', 'Hızlı ilerleme'],
        icon: '🌅',
      });
    } else if (currentHour >= 11 && currentHour <= 14) {
      // Midday - balanced tasks
      recs.push({
        id: 'midday-balance',
        type: 'task',
        title: 'Öğle Dengesi',
        description:
          'Öğle saatleri dengeli enerji zamanı. Orta zorlukta görevler yapın.',
        priority: 'medium',
        energyLevel: 'medium',
        estimatedDuration: 25,
        benefits: ['Dengeli yaklaşım', 'Sürdürülebilir tempo'],
        icon: '☀️',
      });
    } else if (currentHour >= 15 && currentHour <= 18) {
      // Afternoon - easy tasks
      recs.push({
        id: 'afternoon-easy',
        type: 'task',
        title: 'Öğleden Sonra Kolay',
        description:
          'Öğleden sonra enerji düşüyor. Kolay görevlerle devam edin.',
        priority: 'low',
        energyLevel: 'low',
        estimatedDuration: 15,
        benefits: ['Düşük enerji ile çalışma', 'Yorgunluk önleme'],
        icon: '🌤️',
      });
    } else if (currentHour >= 19 && currentHour <= 22) {
      // Evening - review and planning
      recs.push({
        id: 'evening-review',
        type: 'activity',
        title: 'Akşam Değerlendirme',
        description: 'Akşam saatleri değerlendirme ve planlama için ideal.',
        priority: 'medium',
        energyLevel: 'medium',
        estimatedDuration: 20,
        benefits: ['Günü değerlendirme', 'Yarın planlama', 'Öğrenme'],
        icon: '🌙',
      });
    }

    // Energy level-based recommendations
    if (currentEnergy === 'low') {
      recs.push({
        id: 'low-energy-break',
        type: 'break',
        title: 'Enerji Yenileme',
        description:
          'Düşük enerji seviyesi. Kısa bir mola alın ve enerji toplayın.',
        priority: 'high',
        energyLevel: 'low',
        estimatedDuration: 10,
        benefits: ['Enerji yenileme', 'Stres azaltma', 'Odaklanma artırma'],
        icon: '🔋',
      });

      recs.push({
        id: 'low-energy-easy',
        type: 'task',
        title: 'Kolay Görevler',
        description: 'Düşük enerjide kolay görevlerle devam edin.',
        priority: 'medium',
        energyLevel: 'low',
        estimatedDuration: 15,
        benefits: ['Düşük enerji ile çalışma', 'Motivasyon koruma'],
        icon: '📝',
      });
    } else if (currentEnergy === 'high') {
      recs.push({
        id: 'high-energy-challenge',
        type: 'task',
        title: 'Zorlu Görevler',
        description: 'Yüksek enerji seviyesi. Zorlu görevlerle meydan okuyun.',
        priority: 'high',
        energyLevel: 'high',
        estimatedDuration: 25,
        benefits: ['Zorlu görevler', 'Hızlı ilerleme', 'Yüksek verimlilik'],
        icon: '🚀',
      });

      recs.push({
        id: 'high-energy-focus',
        type: 'environment',
        title: 'Odaklanma Ortamı',
        description: 'Yüksek enerji ile odaklanma için ideal ortam oluşturun.',
        priority: 'medium',
        energyLevel: 'high',
        estimatedDuration: 5,
        benefits: [
          'Sessiz ortam',
          'Dikkat dağıtıcıları kaldırma',
          'Odaklanma artırma',
        ],
        icon: '🎯',
      });
    }

    // Activity-based recommendations
    recs.push({
      id: 'stretching-break',
      type: 'activity',
      title: 'Germe Egzersizi',
      description: 'Uzun süre oturduktan sonra germe egzersizi yapın.',
      priority: 'medium',
      energyLevel: 'medium',
      estimatedDuration: 5,
      benefits: [
        'Kan dolaşımı artırma',
        'Kas gerginliği azaltma',
        'Enerji yenileme',
      ],
      icon: '🤸',
    });

    recs.push({
      id: 'breathing-exercise',
      type: 'activity',
      title: 'Nefes Egzersizi',
      description: 'Derin nefes egzersizi ile stresi azaltın ve odaklanın.',
      priority: 'medium',
      energyLevel: 'medium',
      estimatedDuration: 3,
      benefits: ['Stres azaltma', 'Odaklanma artırma', 'Enerji yenileme'],
      icon: '🫁',
    });

    setRecommendations(recs);
    return recs;
  }, [energyLevel, currentHour]);

  // Get task recommendations based on energy
  const getTaskRecommendations = useCallback(() => {
    if (!tasks) return [];
    const availableTasks = tasks.filter(task => !task.isCompleted);
    const currentEnergy = energyLevel.level;

    let recommendedTasks = availableTasks;

    if (currentEnergy === 'low') {
      // Low energy - recommend easy tasks
      recommendedTasks = availableTasks.filter(
        task => task.estimatedPomodoros <= 2
      );
    } else if (currentEnergy === 'high') {
      // High energy - recommend challenging tasks
      recommendedTasks = availableTasks.filter(
        task => task.estimatedPomodoros >= 3
      );
    }

    // Sort by priority
    recommendedTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return recommendedTasks.slice(0, 3); // Return top 3 recommendations
  }, [tasks, energyLevel]);

  // Get break recommendations
  const getBreakRecommendations = useCallback(() => {
    const currentEnergy = energyLevel.level;
    const breakRecs: EnergyRecommendation[] = [];

    if (currentEnergy === 'low') {
      breakRecs.push({
        id: 'power-nap',
        type: 'break',
        title: 'Kısa Şekerleme',
        description: '10-15 dakika kısa şekerleme ile enerji toplayın.',
        priority: 'high',
        energyLevel: 'low',
        estimatedDuration: 15,
        benefits: [
          'Enerji yenileme',
          'Zihinsel tazelenme',
          'Performans artırma',
        ],
        icon: '😴',
      });
    } else if (currentEnergy === 'high') {
      breakRecs.push({
        id: 'active-break',
        type: 'break',
        title: 'Aktif Mola',
        description: 'Yüksek enerji ile kısa yürüyüş veya egzersiz yapın.',
        priority: 'medium',
        energyLevel: 'high',
        estimatedDuration: 10,
        benefits: [
          'Kan dolaşımı artırma',
          'Enerji koruma',
          'Odaklanma artırma',
        ],
        icon: '🚶',
      });
    }

    return breakRecs;
  }, [energyLevel]);

  // Update energy analysis
  useEffect(() => {
    analyzeEnergyPatterns();
    generateRecommendations();
  }, [analyzeEnergyPatterns, generateRecommendations]);

  return {
    energyLevel,
    energyPatterns,
    recommendations,
    getTaskRecommendations,
    getBreakRecommendations,
    analyzeEnergyPatterns,
    generateRecommendations,
  };
};
