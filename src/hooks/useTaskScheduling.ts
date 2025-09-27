import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  energyLevel: number; // 0-1
  focusScore: number; // 0-1
  availability: 'available' | 'busy' | 'low_energy';
  score?: number;
}

export interface SchedulingRecommendation {
  id: string;
  taskId: string;
  title: string;
  recommendedTimeSlots: TimeSlot[];
  confidence: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number;
  bestTimeSlot?: TimeSlot;
}

export interface SchedulingSettings {
  enableAI: boolean;
  autoSchedule: boolean;
  learningEnabled: boolean;
  bufferTime: number; // minutes between tasks
}

export const useTaskScheduling = () => {
  const { tasks } = usePomodoroStore();

  const [recommendations, setRecommendations] = useState<
    SchedulingRecommendation[]
  >([]);
  const [timeSlots] = useState<TimeSlot[]>([]);
  const [settings, setSettings] = useState<SchedulingSettings>({
    enableAI: true,
    autoSchedule: false,
    learningEnabled: true,
    bufferTime: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze user's energy patterns
  const analyzeEnergyPatterns = (): { [hour: number]: number } => {
    const energyPatterns: { [hour: number]: number } = {};

    // Default energy patterns based on circadian rhythms
    for (let hour = 0; hour < 24; hour++) {
      if (hour >= 9 && hour <= 11)
        energyPatterns[hour] = 0.9; // Morning peak
      else if (hour >= 14 && hour <= 16)
        energyPatterns[hour] = 0.8; // Afternoon peak
      else if (hour >= 20 && hour <= 22)
        energyPatterns[hour] = 0.7; // Evening peak
      else if (hour >= 6 && hour <= 8)
        energyPatterns[hour] = 0.6; // Early morning
      else if (hour >= 12 && hour <= 13)
        energyPatterns[hour] = 0.4; // Lunch time
      else if (hour >= 18 && hour <= 19)
        energyPatterns[hour] = 0.5; // Dinner time
      else if (hour >= 22 || hour <= 5)
        energyPatterns[hour] = 0.3; // Night time
      else energyPatterns[hour] = 0.5; // Default
    }

    return energyPatterns;
  };

  // Analyze task complexity
  const analyzeTaskComplexity = (task: {
    title: string;
    description?: string;
    priority?: string;
    tags?: string[];
    estimatedTime?: number;
  }): number => {
    let complexity = 0.5; // Default complexity

    // Title length indicates complexity
    if (task.title.length > 50) complexity += 0.1;
    if (task.title.length > 100) complexity += 0.1;

    // Description indicates complexity
    if (task.description && task.description.length > 100) complexity += 0.1;
    if (task.description && task.description.length > 300) complexity += 0.1;

    // Priority affects complexity
    if (task.priority === 'high') complexity += 0.2;
    if (task.priority === 'medium') complexity += 0.1;

    // Tags indicate complexity
    if (task.tags && task.tags.length > 3) complexity += 0.1;

    // Estimated time affects complexity
    if (task.estimatedTime && task.estimatedTime > 120) complexity += 0.2;
    if (task.estimatedTime && task.estimatedTime > 240) complexity += 0.1;

    return Math.min(1, Math.max(0, complexity));
  };

  // Generate time slots for a day
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const energyPatterns = analyzeEnergyPatterns();
    const startHour = 8;
    const endHour = 22;
    const slotDuration = 30; // 30 minutes per slot

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + slotDuration);

        const energyLevel = energyPatterns[hour] || 0.5;
        const focusScore = energyLevel * 0.8; // Focus is generally lower than energy

        slots.push({
          id: `slot-${hour}-${minute}`,
          startTime,
          endTime,
          duration: slotDuration,
          energyLevel,
          focusScore,
          availability: energyLevel > 0.7 ? 'available' : 'low_energy',
        });
      }
    }

    return slots;
  };

  // Get scheduling recommendations
  const getSchedulingRecommendations = async (): Promise<
    SchedulingRecommendation[]
  > => {
    try {
      setLoading(true);
      setError(null);

      if (!settings.enableAI || (tasks || []).length === 0) {
        return [];
      }

      const newRecommendations = (tasks || []).map(task => {
        const complexity = analyzeTaskComplexity(task);
        const timeSlots = generateTimeSlots(new Date());
        const suitableSlots = timeSlots.filter(slot => {
          return slot.availability === 'available' && slot.energyLevel > 0.6;
        });

        const bestSlot = suitableSlots.reduce((best, current) => {
          const currentScore =
            current.energyLevel * 0.6 + current.focusScore * 0.4;
          const bestScore = best.energyLevel * 0.6 + best.focusScore * 0.4;
          return currentScore > bestScore ? current : best;
        }, suitableSlots[0]);

        return {
          id: `rec-${task.id}`,
          taskId: task.id,
          title: task.title,
          recommendedTimeSlots: suitableSlots.slice(0, 3),
          confidence: 0.8,
          reasoning: `Based on energy patterns and task complexity (${Math.round(
            complexity * 100
          )}%)`,
          priority: (complexity > 0.7 ? 'high' : complexity > 0.4 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          estimatedDuration: 25,
          bestTimeSlot: bestSlot,
        };
      });

      setRecommendations(newRecommendations);
      return newRecommendations;
    } catch {
      setError('Failed to get scheduling recommendations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get scheduling insights
  const getSchedulingInsights = () => {
    if ((recommendations || []).length === 0) return null;

    const avgConfidence =
      (recommendations || []).reduce((sum, r) => sum + r.confidence, 0) /
      (recommendations || []).length;
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
      totalRecommendations: (recommendations || []).length,
      highConfidenceCount,
      morningSlotsCount: morningSlots,
      autoScheduleEnabled: (settings || {}).autoSchedule,
    };
  };

  // Auto-update recommendations
  useEffect(() => {
    if ((settings || {}).enableAI && (tasks || []).length > 0) {
      getSchedulingRecommendations();
    }
  }, [tasks, settings]);

  return {
    recommendations,
    timeSlots,
    settings,
    loading,
    error,
    getSchedulingRecommendations,
    getSchedulingInsights,
    updateSettings: (newSettings: Partial<SchedulingSettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
    },
  };
};
