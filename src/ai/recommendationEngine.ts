// AI-powered recommendation engine
import { Task, PomodoroSession } from '../types';

export interface Recommendation {
  id: string;
  type: 'task' | 'break' | 'schedule' | 'habit';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  data?: any;
}

export interface UserBehavior {
  workingHours: number[];
  breakPatterns: number[];
  taskCompletionRate: number;
  focusScore: number;
  productivityTrend: 'increasing' | 'stable' | 'decreasing';
  preferredTaskTypes: string[];
  energyPatterns: Record<string, number>;
}

export interface ContextualData {
  currentTime: Date;
  weather?: string;
  mood?: 'positive' | 'neutral' | 'negative';
  stressLevel?: number;
  upcomingDeadlines: number;
  recentInterruptions: number;
}

export class RecommendationEngine {
  private userBehavior: UserBehavior;
  private historicalData: PomodoroSession[];
  private tasks: Task[];

  constructor(
    userBehavior: UserBehavior,
    historicalData: PomodoroSession[],
    tasks: Task[]
  ) {
    this.userBehavior = userBehavior;
    this.historicalData = historicalData;
    this.tasks = tasks;
  }

  // Generate personalized recommendations
  generateRecommendations(context: ContextualData): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Task recommendations
    recommendations.push(...this.generateTaskRecommendations(context));

    // Break recommendations
    recommendations.push(...this.generateBreakRecommendations(context));

    // Schedule recommendations
    recommendations.push(...this.generateScheduleRecommendations(context));

    // Habit recommendations
    recommendations.push(...this.generateHabitRecommendations(context));

    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 recommendations
  }

  // Generate task-specific recommendations
  private generateTaskRecommendations(
    context: ContextualData
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const currentHour = context.currentTime.getHours();

    // Energy-based task recommendations
    if (this.userBehavior.workingHours.includes(currentHour)) {
      const highEnergyTasks = this.tasks.filter(
        task =>
          !task.isCompleted &&
          task.priority === 'high' &&
          task.estimatedPomodoros <= 3
      );

      if (highEnergyTasks.length > 0) {
        recommendations.push({
          id: 'high-energy-task',
          type: 'task',
          title: 'Yüksek Enerji Görevi',
          description:
            'Şu anda enerji seviyeniz yüksek. Zorlu görevlere odaklanın.',
          confidence: 0.8,
          priority: 'high',
          action: 'Start high-priority task',
          data: { taskIds: highEnergyTasks.map(t => t.id) },
        });
      }
    }

    // Deadline-based recommendations
    if (context.upcomingDeadlines > 0) {
      const urgentTasks = this.tasks.filter(
        task =>
          !task.isCompleted &&
          task.priority === 'high' &&
          this.isTaskUrgent(task)
      );

      if (urgentTasks.length > 0) {
        recommendations.push({
          id: 'urgent-deadline',
          type: 'task',
          title: 'Acil Görev',
          description:
            "Yaklaşan deadline'lar var. Acil görevlere öncelik verin.",
          confidence: 0.9,
          priority: 'high',
          action: 'Focus on urgent tasks',
          data: { taskIds: urgentTasks.map(t => t.id) },
        });
      }
    }

    // Focus improvement recommendations
    if (this.userBehavior.focusScore < 70) {
      recommendations.push({
        id: 'focus-improvement',
        type: 'task',
        title: 'Odaklanma Geliştirme',
        description:
          'Odaklanma skorunuz düşük. Kısa, basit görevlerle başlayın.',
        confidence: 0.7,
        priority: 'medium',
        action: 'Start with simple tasks',
        data: {
          taskIds: this.tasks
            .filter(t => !t.isCompleted && t.estimatedPomodoros <= 2)
            .map(t => t.id),
        },
      });
    }

    return recommendations;
  }

  // Generate break recommendations
  private generateBreakRecommendations(
    context: ContextualData
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const recentSessions = this.getRecentSessions(2); // Last 2 hours

    // Long session break recommendation
    if (recentSessions.length > 0) {
      const lastSession = recentSessions[recentSessions.length - 1];
      const sessionDuration = this.calculateSessionDuration(lastSession);

      if (sessionDuration > 45) {
        recommendations.push({
          id: 'long-session-break',
          type: 'break',
          title: 'Uzun Seans Molası',
          description: '45 dakikadan fazla çalıştınız. Uzun bir mola alın.',
          confidence: 0.9,
          priority: 'high',
          action: 'Take a long break',
          data: { duration: 15, type: 'long' },
        });
      }
    }

    // Stress-based break recommendation
    if (context.stressLevel && context.stressLevel > 7) {
      recommendations.push({
        id: 'stress-break',
        type: 'break',
        title: 'Stres Molası',
        description: 'Stres seviyeniz yüksek. Rahatlatıcı bir mola alın.',
        confidence: 0.8,
        priority: 'high',
        action: 'Take a stress-relief break',
        data: { duration: 10, type: 'relaxation' },
      });
    }

    // Weather-based recommendations
    if (context.weather === 'sunny') {
      recommendations.push({
        id: 'outdoor-break',
        type: 'break',
        title: 'Açık Hava Molası',
        description: 'Güzel bir gün! Kısa bir yürüyüş yapın.',
        confidence: 0.6,
        priority: 'medium',
        action: 'Take an outdoor break',
        data: { duration: 5, type: 'outdoor' },
      });
    }

    return recommendations;
  }

  // Generate schedule recommendations
  private generateScheduleRecommendations(
    context: ContextualData
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Optimal work time recommendations
    const currentHour = context.currentTime.getHours();
    const isOptimalTime = this.userBehavior.workingHours.includes(currentHour);

    if (!isOptimalTime) {
      const nextOptimalHour = this.findNextOptimalHour(currentHour);
      recommendations.push({
        id: 'optimal-time',
        type: 'schedule',
        title: 'Optimal Çalışma Zamanı',
        description: `En verimli çalışma saatiniz ${nextOptimalHour}:00. O zamana kadar hafif görevler yapın.`,
        confidence: 0.7,
        priority: 'medium',
        action: 'Wait for optimal time',
        data: { optimalHour: nextOptimalHour },
      });
    }

    // Productivity trend recommendations
    if (this.userBehavior.productivityTrend === 'decreasing') {
      recommendations.push({
        id: 'productivity-decline',
        type: 'schedule',
        title: 'Verimlilik Düşüşü',
        description:
          'Son dönemde verimliliğiniz düşüyor. Çalışma rutininizi gözden geçirin.',
        confidence: 0.8,
        priority: 'high',
        action: 'Review work routine',
        data: { trend: 'decreasing' },
      });
    }

    return recommendations;
  }

  // Generate habit recommendations
  private generateHabitRecommendations(
    context: ContextualData
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Consistency recommendations
    const consistencyScore = this.calculateConsistencyScore();
    if (consistencyScore < 0.6) {
      recommendations.push({
        id: 'consistency-improvement',
        type: 'habit',
        title: 'Tutarlılık Geliştirme',
        description:
          'Çalışma tutarlılığınızı artırın. Her gün aynı saatte başlayın.',
        confidence: 0.7,
        priority: 'medium',
        action: 'Set consistent schedule',
        data: { consistencyScore },
      });
    }

    // Break habit recommendations
    const breakConsistency = this.calculateBreakConsistency();
    if (breakConsistency < 0.5) {
      recommendations.push({
        id: 'break-habits',
        type: 'habit',
        title: 'Mola Alışkanlıkları',
        description: 'Düzenli molalar almayı alışkanlık haline getirin.',
        confidence: 0.6,
        priority: 'medium',
        action: 'Develop break habits',
        data: { breakConsistency },
      });
    }

    return recommendations;
  }

  // Helper methods
  private getRecentSessions(hours: number): PomodoroSession[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.historicalData.filter(
      session => new Date(session.startTime) > cutoffTime
    );
  }

  private calculateSessionDuration(session: PomodoroSession): number {
    if (!session.endTime) return 0;
    return (
      (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
    );
  }

  private isTaskUrgent(task: Task): boolean {
    // Simple urgency calculation based on creation date and priority
    const daysSinceCreation =
      (Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation > 3 && task.priority === 'high';
  }

  private findNextOptimalHour(currentHour: number): number {
    const optimalHours = this.userBehavior.workingHours.sort((a, b) => a - b);
    const nextHour = optimalHours.find(hour => hour > currentHour);
    return nextHour || optimalHours[0];
  }

  private calculateConsistencyScore(): number {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = this.historicalData.filter(
      session => new Date(session.startTime) > lastWeek
    );

    if (recentSessions.length === 0) return 0;

    // Calculate consistency based on daily activity
    const dailyActivity = new Array(7).fill(0);
    recentSessions.forEach(session => {
      const dayOfWeek = new Date(session.startTime).getDay();
      dailyActivity[dayOfWeek]++;
    });

    const averageActivity =
      dailyActivity.reduce((sum, count) => sum + count, 0) / 7;
    const variance =
      dailyActivity.reduce(
        (sum, count) => sum + Math.pow(count - averageActivity, 2),
        0
      ) / 7;
    const consistency = 1 - variance / (averageActivity + 1);

    return Math.max(0, Math.min(1, consistency));
  }

  private calculateBreakConsistency(): number {
    const recentSessions = this.getRecentSessions(24); // Last 24 hours
    const breakSessions = recentSessions.filter(session => session.isBreak);

    if (recentSessions.length === 0) return 0;

    const breakRatio = breakSessions.length / recentSessions.length;
    const expectedBreakRatio = 0.2; // 20% breaks expected

    return 1 - Math.abs(breakRatio - expectedBreakRatio);
  }
}
