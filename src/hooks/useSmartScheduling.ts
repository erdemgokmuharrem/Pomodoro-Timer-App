import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface SmartSchedule {
  id: string;
  title: string;
  description: string;
  type: 'pomodoro' | 'break' | 'deep_work' | 'meeting' | 'learning' | 'creative';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDuration: number; // minutes
  optimalStartTime: Date;
  optimalEndTime: Date;
  energyLevel: 'high' | 'medium' | 'low';
  focusLevel: 'high' | 'medium' | 'low';
  context: string[];
  dependencies: string[];
  flexibility: number; // 0-1, how flexible the timing is
  confidence: number; // 0-1, AI confidence in the schedule
  reasoning: string;
  createdAt: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
}

export interface ScheduleOptimization {
  id: string;
  type: 'time_optimization' | 'energy_optimization' | 'context_optimization' | 'dependency_optimization';
  title: string;
  description: string;
  currentSchedule: SmartSchedule;
  optimizedSchedule: SmartSchedule;
  improvements: string[];
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  confidence: number;
  reasoning: string;
  createdAt: Date;
}

export interface ScheduleConflict {
  id: string;
  type: 'overlap' | 'energy_conflict' | 'context_conflict' | 'dependency_conflict' | 'deadline_conflict';
  title: string;
  description: string;
  conflictingSchedules: SmartSchedule[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestions: string[];
  autoResolvable: boolean;
  createdAt: Date;
}

export interface SmartSchedulingSettings {
  enableSmartScheduling: boolean;
  autoSchedule: boolean;
  respectEnergyLevels: boolean;
  respectFocusLevels: boolean;
  considerContext: boolean;
  optimizeForDeadlines: boolean;
  bufferTime: number; // minutes between tasks
  maxDailyHours: number;
  preferredStartTime: number; // hour
  preferredEndTime: number; // hour
  breakFrequency: number; // minutes
  deepWorkBlocks: number; // hours per day
  learningTime: number; // minutes per day
  creativeTime: number; // minutes per day
  meetingTime: number; // minutes per day
}

export const useSmartScheduling = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP } = useGamificationStore();
  
  const [schedules, setSchedules] = useState<SmartSchedule[]>([]);
  const [optimizations, setOptimizations] = useState<ScheduleOptimization[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [settings, setSettings] = useState<SmartSchedulingSettings>({
    enableSmartScheduling: true,
    autoSchedule: false,
    respectEnergyLevels: true,
    respectFocusLevels: true,
    considerContext: true,
    optimizeForDeadlines: true,
    bufferTime: 15,
    maxDailyHours: 8,
    preferredStartTime: 9,
    preferredEndTime: 17,
    breakFrequency: 25,
    deepWorkBlocks: 2,
    learningTime: 60,
    creativeTime: 30,
    meetingTime: 120,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze user patterns for optimal scheduling
  const analyzeUserPatterns = () => {
    const hourlyProductivity: { [hour: number]: number } = {};
    const dailyProductivity: { [day: number]: number } = {};
    const taskTypePerformance: { [type: string]: number } = {};

    completedPomodoros.forEach(pomodoro => {
      const hour = new Date(pomodoro.completedAt).getHours();
      const day = new Date(pomodoro.completedAt).getDay();
      
      if (!hourlyProductivity[hour]) hourlyProductivity[hour] = 0;
      if (!dailyProductivity[day]) dailyProductivity[day] = 0;
      
      hourlyProductivity[hour] += pomodoro.completed ? 1 : 0;
      dailyProductivity[day] += pomodoro.completed ? 1 : 0;
    });

    // Find optimal hours
    const optimalHours = Object.keys(hourlyProductivity)
      .filter(hour => hourlyProductivity[parseInt(hour)] > 0.7)
      .map(Number)
      .sort((a, b) => hourlyProductivity[b] - hourlyProductivity[a]);

    // Find optimal days
    const optimalDays = Object.keys(dailyProductivity)
      .filter(day => dailyProductivity[parseInt(day)] > 0.7)
      .map(Number);

    return {
      hourlyProductivity,
      dailyProductivity,
      optimalHours,
      optimalDays,
      peakHours: optimalHours.slice(0, 3),
      lowEnergyHours: Object.keys(hourlyProductivity)
        .filter(hour => hourlyProductivity[parseInt(hour)] < 0.3)
        .map(Number),
    };
  };

  // Calculate energy levels throughout the day
  const calculateEnergyLevels = () => {
    const patterns = analyzeUserPatterns();
    const energyMap: { [hour: number]: 'high' | 'medium' | 'low' } = {};

    for (let hour = 0; hour < 24; hour++) {
      const productivity = patterns.hourlyProductivity[hour] || 0;
      if (productivity > 0.7) {
        energyMap[hour] = 'high';
      } else if (productivity > 0.4) {
        energyMap[hour] = 'medium';
      } else {
        energyMap[hour] = 'low';
      }
    }

    return energyMap;
  };

  // Calculate focus levels for different task types
  const calculateFocusLevels = (taskType: string): 'high' | 'medium' | 'low' => {
    // This would be based on historical performance with similar tasks
    const taskPerformance = tasks.filter(task => 
      task.title.toLowerCase().includes(taskType.toLowerCase()) ||
      task.description?.toLowerCase().includes(taskType.toLowerCase())
    );

    if (taskPerformance.length === 0) return 'medium';

    const completionRate = taskPerformance.filter(task => 
      completedPomodoros.some(p => p.taskId === task.id && p.completed)
    ).length / taskPerformance.length;

    if (completionRate > 0.8) return 'high';
    if (completionRate > 0.5) return 'medium';
    return 'low';
  };

  // Generate smart schedule for a task
  const generateSmartSchedule = (task: any): SmartSchedule => {
    const patterns = analyzeUserPatterns();
    const energyLevels = calculateEnergyLevels();
    const focusLevel = calculateFocusLevels(task.title);

    // Find optimal time slot
    const optimalHour = patterns.peakHours[0] || settings.preferredStartTime;
    const optimalStartTime = new Date();
    optimalStartTime.setHours(optimalHour, 0, 0, 0);

    // Calculate duration based on task complexity and user patterns
    const baseDuration = task.estimatedTime || 25;
    const complexityMultiplier = task.priority === 'high' ? 1.2 : 1;
    const estimatedDuration = Math.round(baseDuration * complexityMultiplier);

    const optimalEndTime = new Date(optimalStartTime.getTime() + estimatedDuration * 60 * 1000);

    // Determine energy level for the time slot
    const energyLevel = energyLevels[optimalHour] || 'medium';

    // Generate reasoning
    const reasoning = `Optimal zamanlama: ${optimalHour}:00-${optimalHour + Math.ceil(estimatedDuration / 60)}:00 saatleri arasında, enerji seviyesi: ${energyLevel}, odak seviyesi: ${focusLevel}`;

    return {
      id: `schedule-${Date.now()}-${Math.random()}`,
      title: task.title,
      description: task.description || '',
      type: determineTaskType(task),
      priority: task.priority || 'medium',
      estimatedDuration,
      optimalStartTime,
      optimalEndTime,
      energyLevel,
      focusLevel,
      context: extractContext(task),
      dependencies: [],
      flexibility: 0.7,
      confidence: 0.8,
      reasoning,
      createdAt: new Date(),
      status: 'scheduled',
    };
  };

  // Determine task type based on content
  const determineTaskType = (task: any): SmartSchedule['type'] => {
    const title = task.title.toLowerCase();
    const description = (task.description || '').toLowerCase();

    if (title.includes('meeting') || title.includes('toplantı')) return 'meeting';
    if (title.includes('learn') || title.includes('öğren') || title.includes('study')) return 'learning';
    if (title.includes('creative') || title.includes('yaratıcı') || title.includes('design')) return 'creative';
    if (title.includes('deep') || title.includes('derin') || title.includes('focus')) return 'deep_work';
    if (title.includes('break') || title.includes('mola')) return 'break';
    return 'pomodoro';
  };

  // Extract context from task
  const extractContext = (task: any): string[] => {
    const context: string[] = [];
    const title = task.title.toLowerCase();
    const description = (task.description || '').toLowerCase();

    if (title.includes('urgent') || title.includes('acil')) context.push('urgent');
    if (title.includes('important') || title.includes('önemli')) context.push('important');
    if (title.includes('deadline') || title.includes('son tarih')) context.push('deadline');
    if (title.includes('review') || title.includes('gözden geçir')) context.push('review');
    if (title.includes('plan') || title.includes('planla')) context.push('planning');

    return context;
  };

  // Optimize existing schedule
  const optimizeSchedule = (schedule: SmartSchedule): ScheduleOptimization => {
    const patterns = analyzeUserPatterns();
    const energyLevels = calculateEnergyLevels();

    // Find better time slot
    const currentHour = schedule.optimalStartTime.getHours();
    const currentEnergy = energyLevels[currentHour] || 'medium';
    
    // Look for higher energy time slots
    const betterHours = patterns.peakHours.filter(hour => 
      energyLevels[hour] === 'high' && hour !== currentHour
    );

    let optimizedSchedule = { ...schedule };
    let improvements: string[] = [];
    let impact: 'high' | 'medium' | 'low' = 'low';

    if (betterHours.length > 0) {
      const newHour = betterHours[0];
      optimizedSchedule.optimalStartTime = new Date(schedule.optimalStartTime);
      optimizedSchedule.optimalStartTime.setHours(newHour, 0, 0, 0);
      optimizedSchedule.optimalEndTime = new Date(optimizedSchedule.optimalStartTime.getTime() + schedule.estimatedDuration * 60 * 1000);
      optimizedSchedule.energyLevel = 'high';
      improvements.push(`Daha yüksek enerji seviyesi olan ${newHour}:00 saatine taşındı`);
      impact = 'high';
    }

    // Check for context optimization
    if (schedule.context.includes('urgent') && schedule.priority !== 'urgent') {
      optimizedSchedule.priority = 'urgent';
      improvements.push('Acil görev olarak önceliklendirildi');
      impact = 'medium';
    }

    // Check for duration optimization
    if (schedule.estimatedDuration > 60 && schedule.type === 'pomodoro') {
      optimizedSchedule.estimatedDuration = Math.min(schedule.estimatedDuration, 45);
      improvements.push('Daha kısa süreye optimize edildi');
      impact = 'medium';
    }

    const reasoning = improvements.length > 0 
      ? `Optimizasyon: ${improvements.join(', ')}`
      : 'Mevcut zamanlama optimal';

    return {
      id: `optimization-${Date.now()}-${Math.random()}`,
      type: 'time_optimization',
      title: 'Zamanlama Optimizasyonu',
      description: 'Mevcut zamanlamanızı daha verimli hale getirmek için öneriler',
      currentSchedule: schedule,
      optimizedSchedule,
      improvements,
      impact,
      effort: 'low',
      confidence: 0.8,
      reasoning,
      createdAt: new Date(),
    };
  };

  // Detect schedule conflicts
  const detectConflicts = (): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
    const sortedSchedules = schedules.sort((a, b) => 
      a.optimalStartTime.getTime() - b.optimalStartTime.getTime()
    );

    // Check for time overlaps
    for (let i = 0; i < sortedSchedules.length - 1; i++) {
      const current = sortedSchedules[i];
      const next = sortedSchedules[i + 1];

      if (current.optimalEndTime > next.optimalStartTime) {
        conflicts.push({
          id: `conflict-overlap-${Date.now()}`,
          type: 'overlap',
          title: 'Zaman Çakışması',
          description: `${current.title} ve ${next.title} görevleri aynı zamanda planlanmış`,
          conflictingSchedules: [current, next],
          severity: 'high',
          suggestions: [
            'Görevlerden birini daha sonraya erteleyin',
            'Görevlerden birinin süresini kısaltın',
            'Görevleri birleştirin'
          ],
          autoResolvable: true,
          createdAt: new Date(),
        });
      }
    }

    // Check for energy conflicts
    const energyLevels = calculateEnergyLevels();
    schedules.forEach(schedule => {
      const hour = schedule.optimalStartTime.getHours();
      const energyLevel = energyLevels[hour] || 'medium';
      
      if (schedule.type === 'deep_work' && energyLevel === 'low') {
        conflicts.push({
          id: `conflict-energy-${schedule.id}`,
          type: 'energy_conflict',
          title: 'Enerji Seviyesi Uyumsuzluğu',
          description: `${schedule.title} derin çalışma için düşük enerji saatinde planlanmış`,
          conflictingSchedules: [schedule],
          severity: 'medium',
          suggestions: [
            'Daha yüksek enerji saatine taşıyın',
            'Görev türünü değiştirin',
            'Enerji seviyenizi artırın'
          ],
          autoResolvable: true,
          createdAt: new Date(),
        });
      }
    });

    return conflicts;
  };

  // Auto-schedule tasks
  const autoScheduleTasks = async (): Promise<SmartSchedule[]> => {
    try {
      setLoading(true);
      setError(null);

      const unscheduledTasks = tasks.filter(task => 
        !schedules.some(schedule => schedule.title === task.title)
      );

      const newSchedules: SmartSchedule[] = [];
      const patterns = analyzeUserPatterns();
      let currentTime = new Date();
      currentTime.setHours(settings.preferredStartTime, 0, 0, 0);

      for (const task of unscheduledTasks) {
        const schedule = generateSmartSchedule(task);
        
        // Adjust time to avoid conflicts
        while (schedules.some(s => 
          s.optimalStartTime <= schedule.optimalStartTime && 
          s.optimalEndTime > schedule.optimalStartTime
        )) {
          schedule.optimalStartTime.setMinutes(schedule.optimalStartTime.getMinutes() + 30);
          schedule.optimalEndTime = new Date(schedule.optimalStartTime.getTime() + schedule.estimatedDuration * 60 * 1000);
        }

        newSchedules.push(schedule);
      }

      setSchedules(prev => [...prev, ...newSchedules]);
      return newSchedules;
    } catch (err) {
      setError('Failed to auto-schedule tasks');
      console.error('Auto-schedule error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generate optimizations
  const generateOptimizations = async (): Promise<ScheduleOptimization[]> => {
    try {
      const newOptimizations: ScheduleOptimization[] = [];

      schedules.forEach(schedule => {
        const optimization = optimizeSchedule(schedule);
        if (optimization.improvements.length > 0) {
          newOptimizations.push(optimization);
        }
      });

      setOptimizations(prev => [...prev, ...newOptimizations]);
      return newOptimizations;
    } catch (err) {
      setError('Failed to generate optimizations');
      console.error('Generate optimizations error:', err);
      return [];
    }
  };

  // Detect conflicts
  const detectScheduleConflicts = async (): Promise<ScheduleConflict[]> => {
    try {
      const newConflicts = detectConflicts();
      setConflicts(prev => [...prev, ...newConflicts]);
      return newConflicts;
    } catch (err) {
      setError('Failed to detect conflicts');
      console.error('Detect conflicts error:', err);
      return [];
    }
  };

  // Apply optimization
  const applyOptimization = async (optimizationId: string): Promise<boolean> => {
    try {
      const optimization = optimizations.find(o => o.id === optimizationId);
      if (!optimization) return false;

      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === optimization.currentSchedule.id 
            ? optimization.optimizedSchedule 
            : schedule
        )
      );

      // Remove the optimization
      setOptimizations(prev => prev.filter(o => o.id !== optimizationId));
      return true;
    } catch (err) {
      console.error('Apply optimization error:', err);
      return false;
    }
  };

  // Resolve conflict
  const resolveConflict = async (conflictId: string, resolution: string): Promise<boolean> => {
    try {
      const conflict = conflicts.find(c => c.id === conflictId);
      if (!conflict) return false;

      // In a real app, this would implement the resolution logic
      console.log(`Resolving conflict ${conflictId} with resolution: ${resolution}`);
      
      // Remove the conflict
      setConflicts(prev => prev.filter(c => c.id !== conflictId));
      return true;
    } catch (err) {
      console.error('Resolve conflict error:', err);
      return false;
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<SmartSchedulingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get scheduling insights
  const getSchedulingInsights = () => {
    const totalSchedules = schedules.length;
    const completedSchedules = schedules.filter(s => s.status === 'completed').length;
    const completionRate = totalSchedules > 0 ? completedSchedules / totalSchedules : 0;
    const totalOptimizations = optimizations.length;
    const totalConflicts = conflicts.length;
    const avgConfidence = schedules.length > 0 
      ? schedules.reduce((sum, s) => sum + s.confidence, 0) / schedules.length 
      : 0;

    return {
      totalSchedules,
      completedSchedules,
      completionRate,
      totalOptimizations,
      totalConflicts,
      averageConfidence: avgConfidence,
      smartSchedulingEnabled: settings.enableSmartScheduling,
      autoScheduleEnabled: settings.autoSchedule,
    };
  };

  // Auto-generate schedules and optimizations
  useEffect(() => {
    if (settings.enableSmartScheduling && tasks.length > 0) {
      autoScheduleTasks();
      generateOptimizations();
      detectScheduleConflicts();
    }
  }, [tasks, settings.enableSmartScheduling]);

  return {
    schedules,
    optimizations,
    conflicts,
    settings,
    loading,
    error,
    autoScheduleTasks,
    generateOptimizations,
    detectScheduleConflicts,
    applyOptimization,
    resolveConflict,
    updateSettings,
    getSchedulingInsights,
  };
};
