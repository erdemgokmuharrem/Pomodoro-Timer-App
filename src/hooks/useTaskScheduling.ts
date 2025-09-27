import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  energyLevel: number; // 0-1
  focusScore: number; // 0-1
  availability: 'free' | 'busy' | 'low_energy' | 'break_needed';
  recommendedTasks: string[]; // task IDs
  reasoning: string;
}

export interface SchedulingRecommendation {
  id: string;
  taskId: string;
  recommendedTimeSlots: TimeSlot[];
  confidence: number; // 0-1
  reasoning: string;
  factors: {
    taskComplexity: number;
    userEnergy: number;
    historicalPerformance: number;
    timeOfDay: number;
    dayOfWeek: number;
    deadline: number; // days until deadline
    priority: number;
    dependencies: string[]; // dependent task IDs
  };
  alternatives: Array<{
    timeSlot: TimeSlot;
    confidence: number;
    reasoning: string;
  }>;
  createdAt: Date;
}

export interface SchedulingSettings {
  enableAI: boolean;
  workingHours: {
    start: number; // hour (0-23)
    end: number; // hour (0-23)
  };
  breakDuration: number; // minutes
  maxSessionDuration: number; // minutes
  energyThreshold: number; // 0-1
  learningEnabled: boolean;
  autoSchedule: boolean;
  respectDeadlines: boolean;
  bufferTime: number; // minutes between tasks
}

export const useTaskScheduling = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { } = useGamificationStore();

  const [recommendations, setRecommendations] = useState<
    SchedulingRecommendation[]
  >([]);
  const [timeSlots] = useState<TimeSlot[]>([]);
  const [settings, setSettings] = useState<SchedulingSettings>({
    enableAI: true,
    workingHours: { start: 9, end: 18 },
    breakDuration: 15,
    maxSessionDuration: 120,
    energyThreshold: 0.6,
    learningEnabled: true,
    autoSchedule: false,
    respectDeadlines: true,
    bufferTime: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze user's energy patterns
  const analyzeEnergyPatterns = (): { [hour: number]: number } => {
    const energyPatterns: { [hour: number]: number } = {};

    // Default energy patterns based on circadian rhythms
    for (let hour = 0; hour < 24; hour++) {
      // hour variable is used in the loop
      if (hour >= 9 && hour <= 11)
        energyPatterns[hour] = 0.9; // Morning peak
      else if (hour >= 14 && hour <= 16)
        energyPatterns[hour] = 0.8; // Afternoon peak
      else if (hour >= 20 && hour <= 22)
        energyPatterns[hour] = 0.7; // Evening
      else if (hour >= 6 && hour <= 8)
        energyPatterns[hour] = 0.6; // Early morning
      else if (hour >= 12 && hour <= 13)
        energyPatterns[hour] = 0.4; // Lunch dip
      else if (hour >= 18 && hour <= 19)
        energyPatterns[hour] = 0.5; // Evening transition
      else energyPatterns[hour] = 0.3; // Low energy times
    }

    // Adjust based on user's historical performance
    const historicalData = (completedPomodoros || []).filter(
      (p: { completedAt: string; completed: boolean }) =>
        Date.now() - new Date(p.completedAt).getTime() <
        30 * 24 * 60 * 60 * 1000 // Last 30 days
    );

    historicalData.forEach((pomodoro: { completedAt: string }) => {
      const hour = new Date(pomodoro.completedAt).getHours();
      const performance = pomodoro.completed ? 1 : 0;

      if (energyPatterns[hour] !== undefined) {
        energyPatterns[hour] = (energyPatterns[hour] + performance) / 2; // Average with historical data
      }
    });

    return energyPatterns;
  };

  // Generate time slots for a day
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const energyPatterns = analyzeEnergyPatterns();
    const { start, end } = settings.workingHours;

    for (let hour = start; hour < end; hour++) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(hour + 1, 0, 0, 0);

      const energyLevel = energyPatterns[hour] || 0.5;
      const focusScore = energyLevel * 0.8 + Math.random() * 0.2; // Add some variation

      let availability: TimeSlot['availability'] = 'free';
      if (energyLevel < settings.energyThreshold) {
        availability = 'low_energy';
      } else if (hour % 4 === 0) {
        // Every 4 hours suggest break
        availability = 'break_needed';
      }

      slots.push({
        id: `slot-${date.getTime()}-${hour}`,
        startTime,
        endTime,
        duration: 60,
        energyLevel,
        focusScore,
        availability,
        recommendedTasks: [],
        reasoning: generateSlotReasoning(energyLevel, hour),
      });
    }

    return slots;
  };

  // Generate reasoning for time slot
  const generateSlotReasoning = (energyLevel: number, hour: number): string => {
    if (energyLevel > 0.8) {
      return 'Yüksek enerji - karmaşık görevler için ideal';
    } else if (energyLevel > 0.6) {
      return 'İyi enerji - çoğu görev için uygun';
    } else if (energyLevel > 0.4) {
      return 'Orta enerji - basit görevler için uygun';
    } else {
      return 'Düşük enerji - dinlenme veya hafif görevler önerilir';
    }
  };

  // Analyze task complexity
  const analyzeTaskComplexity = (task: { title: string; description?: string; priority?: string; tags?: string[]; estimatedTime?: number }): number => {
    let complexity = 0.5; // Base complexity

    // Title and description length
    if (task.title.length > 50) complexity += 0.1;
    if (task.description && task.description.length > 100) complexity += 0.1;

    // Priority factor
    if (task.priority === 'high') complexity += 0.2;
    if (task.priority === 'medium') complexity += 0.1;

    // Tags factor
    if (task.tags && task.tags.includes('complex')) complexity += 0.2;
    if (task.tags && task.tags.includes('urgent')) complexity += 0.1;

    // Estimated time factor
    if (task.estimatedTime) {
      if (task.estimatedTime > 120) complexity += 0.2;
      if (task.estimatedTime > 60) complexity += 0.1;
    }

    // Deadline factor
    if (task.deadline) {
      const daysUntilDeadline =
        (new Date(task.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24);
      if (daysUntilDeadline < 1) complexity += 0.3;
      else if (daysUntilDeadline < 3) complexity += 0.2;
      else if (daysUntilDeadline < 7) complexity += 0.1;
    }

    return Math.min(1, Math.max(0, complexity));
  };

  // Calculate optimal time slots for a task
  const calculateOptimalTimeSlots = (
    task: { id: string; title: string; estimatedTime: number; priority: string; complexity: number },
    availableSlots: TimeSlot[]
  ): TimeSlot[] => {
    const complexity = analyzeTaskComplexity(task);
    const taskDuration = task.estimatedTime || 25; // Default to 25 minutes

    // Filter slots based on task requirements
    const suitableSlots = availableSlots.filter(slot => {
      // Check if slot has enough energy for task complexity
      if (complexity > 0.7 && slot.energyLevel < 0.7) return false;
      if (complexity > 0.5 && slot.energyLevel < 0.5) return false;

      // Check if slot duration is sufficient
      if (slot.duration < taskDuration) return false;

      // Check availability
      if (slot.availability === 'busy') return false;

      return true;
    });

    // Score and sort slots
    const scoredSlots = suitableSlots.map(slot => {
      const score = slot.energyLevel * 0.4 + slot.focusScore * 0.3;

      // Bonus for high energy slots with complex tasks
      if (complexity > 0.7 && slot.energyLevel > 0.8) score += 0.2;

      // Bonus for morning slots (generally better for focus)
      if (slot.startTime.getHours() >= 9 && slot.startTime.getHours() <= 11)
        score += 0.1;

      // Penalty for low energy slots
      if (slot.availability === 'low_energy') score -= 0.2;

      return { ...slot, score };
    });

    // Sort by score and return top 3
    return scoredSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...slot }) => slot);
  };

  // Generate scheduling recommendation for a task
  const generateSchedulingRecommendation = (
    task: { id: string; title: string; estimatedTime: number; priority: string; complexity: number }
  ): SchedulingRecommendation => {
    const today = new Date();
    const availableSlots = generateTimeSlots(today);
    const optimalSlots = calculateOptimalTimeSlots(task, availableSlots);

    const complexity = analyzeTaskComplexity(task);
    const energyLevel =
      availableSlots.reduce((sum, slot) => sum + slot.energyLevel, 0) /
      availableSlots.length;
    const timeOfDay = today.getHours() / 24;
    const dayOfWeek = today.getDay() / 7;

    // Calculate deadline factor
    let deadline = 1;
    if (task.deadline) {
      const daysUntilDeadline =
        (new Date(task.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24);
      deadline = Math.max(0, daysUntilDeadline / 7); // Normalize to 0-1
    }

    // Calculate priority factor
    let priority = 0.5;
    if (task.priority === 'high') priority = 0.9;
    else if (task.priority === 'medium') priority = 0.7;
    else if (task.priority === 'low') priority = 0.3;

    // Calculate confidence
    const confidence = Math.min(
      1,
      complexity * 0.2 +
        energyLevel * 0.3 +
        timeOfDay * 0.1 +
        dayOfWeek * 0.1 +
        deadline * 0.2 +
        priority * 0.1
    );

    // Generate reasoning
    const reasoning = generateSchedulingReasoning(
      complexity,
      energyLevel,
      optimalSlots[0]
    );

    // Generate alternatives
    const alternatives = optimalSlots.slice(1).map(slot => ({
      timeSlot: slot,
      confidence: Math.max(0.3, confidence - 0.2),
      reasoning: `Alternatif zaman: ${slot.startTime.toLocaleTimeString(
        'tr-TR',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )}`,
    }));

    return {
      id: `scheduling-${Date.now()}`,
      taskId: task.id,
      recommendedTimeSlots: optimalSlots,
      confidence,
      reasoning,
      factors: {
        taskComplexity: complexity,
        userEnergy: energyLevel,
        historicalPerformance: 0.7, // Default, would be calculated from historical data
        timeOfDay,
        dayOfWeek,
        deadline,
        priority,
        dependencies: [], // Would be calculated from task relationships
      },
      alternatives,
      createdAt: new Date(),
    };
  };

  // Generate reasoning text
  const generateSchedulingReasoning = (
    complexity: number,
    energyLevel: number,
    bestSlot: TimeSlot
  ): string => {
    const reasons = [];

    if (complexity > 0.7) {
      reasons.push('Karmaşık görev için yüksek enerji gerekiyor');
    } else if (complexity < 0.3) {
      reasons.push('Basit görev, düşük enerji ile de yapılabilir');
    }

    if (energyLevel > 0.8) {
      reasons.push('Bu saatlerde enerji seviyeniz yüksek');
    } else if (energyLevel < 0.4) {
      reasons.push('Bu saatlerde enerji seviyeniz düşük');
    }

    if (
      bestSlot.startTime.getHours() >= 9 &&
      bestSlot.startTime.getHours() <= 11
    ) {
      reasons.push('Sabah saatleri odaklanma için ideal');
    } else if (
      bestSlot.startTime.getHours() >= 14 &&
      bestSlot.startTime.getHours() <= 16
    ) {
      reasons.push('Öğleden sonra ikinci enerji zirvesi');
    }

    return reasons.length > 0
      ? reasons.join(', ')
      : 'Standart zamanlama önerisi';
  };

  // Get scheduling recommendations for all tasks
  const getSchedulingRecommendations = async (): Promise<
    SchedulingRecommendation[]
  > => {
    try {
      setLoading(true);
      setError(null);

      const newRecommendations = (tasks || []).map(task =>
        generateSchedulingRecommendation(task)
      );
      setRecommendations(newRecommendations);

      return newRecommendations;
    } catch (err) {
      setError('Failed to get scheduling recommendations');
      // console.error('Get scheduling recommendations error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get recommendation for specific task
  const getTaskSchedulingRecommendation = async (
    taskId: string
  ): Promise<SchedulingRecommendation | null> => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return null;

      const recommendation = generateSchedulingRecommendation(task);
      return recommendation;
    } catch (err) {
      // console.error('Get task scheduling recommendation error:', err);
      return null;
    }
  };

  // Apply scheduling recommendation
  const applySchedulingRecommendation = async (
    recommendationId: string,
    timeSlotId: string
  ): Promise<boolean> => {
    try {
      const recommendation = recommendations.find(
        r => r.id === recommendationId
      );
      if (!recommendation) return false;

      const timeSlot = recommendation.recommendedTimeSlots.find(
        slot => slot.id === timeSlotId
      );
      if (!timeSlot) return false;

      // In a real app, this would update the task's scheduled time
      // console.log(`Applied scheduling: Task ${recommendation.taskId} scheduled for ${timeSlot.startTime}`);
      return true;
    } catch (err) {
      // console.error('Apply scheduling recommendation error:', err);
      return false;
    }
  };

  // Auto-schedule all tasks
  const autoScheduleTasks = async (): Promise<boolean> => {
    try {
      if (!settings.autoSchedule) return false;

      const recommendations = await getSchedulingRecommendations();
      let scheduledCount = 0;

      for (const recommendation of recommendations) {
        if (recommendation.confidence > settings.energyThreshold) {
          const success = await applySchedulingRecommendation(
            recommendation.id,
            recommendation.recommendedTimeSlots[0].id
          );
          if (success) scheduledCount++;
        }
      }

      // console.log(`Auto-scheduled ${scheduledCount} tasks`);
      return scheduledCount > 0;
    } catch (err) {
      // console.error('Auto-schedule tasks error:', err);
      return false;
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<SchedulingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Learn from scheduling results
  const learnFromScheduling = async (
    taskId: string,
    scheduledTime: Date,
    completed: boolean,
    actualDuration: number
  ) => {
    try {
      if (!settings.learningEnabled) return;

      // In a real app, this would update the AI model with feedback
      // console.log(
        `Learning from scheduling: Task ${taskId}, Time ${scheduledTime}, Completed ${completed}, Duration ${actualDuration}`
      );
    } catch (err) {
      // console.error('Learn from scheduling error:', err);
    }
  };

  // Get scheduling insights
  const getSchedulingInsights = () => {
    if (recommendations.length === 0) return null;

    const avgConfidence =
      recommendations.reduce((sum, r) => sum + r.confidence, 0) /
      recommendations.length;
    const highConfidenceCount = (recommendations || []).filter(
      r => r.confidence > 0.8
    ).length;
    const morningSlots = (recommendations || []).filter(
      r =>
        r.recommendedTimeSlots[0]?.startTime.getHours() >= 9 &&
        r.recommendedTimeSlots[0]?.startTime.getHours() <= 11
    ).length;

    return {
      averageConfidence: avgConfidence,
      totalRecommendations: recommendations.length,
      highConfidenceCount,
      morningSlotsCount: morningSlots,
      autoScheduleEnabled: settings.autoSchedule,
    };
  };

  // Auto-update recommendations
  useEffect(() => {
    if (settings.enableAI && (tasks || []).length > 0) {
      getSchedulingRecommendations();
    }
  }, [tasks, settings.enableAI]);

  return {
    recommendations,
    timeSlots,
    settings,
    loading,
    error,
    getSchedulingRecommendations,
    getTaskSchedulingRecommendation,
    applySchedulingRecommendation,
    autoScheduleTasks,
    updateSettings,
    learnFromScheduling,
    getSchedulingInsights,
  };
};
