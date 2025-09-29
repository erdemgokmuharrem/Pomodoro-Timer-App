// Advanced analytics and monitoring system
import { Task, PomodoroSession } from '../types';

export interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: Date;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface UserMetrics {
  productivity: {
    totalPomodoros: number;
    completedTasks: number;
    focusTime: number;
    averageSessionLength: number;
    completionRate: number;
  };
  patterns: {
    mostProductiveHours: number[];
    preferredBreakTimes: number[];
    workStreak: number;
    consistencyScore: number;
  };
  performance: {
    focusScore: number;
    interruptionRate: number;
    energyLevel: number;
    moodScore: number;
  };
  goals: {
    dailyGoal: number;
    weeklyGoal: number;
    monthlyGoal: number;
    progress: number;
  };
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'pattern' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  data: any;
  timestamp: Date;
}

export interface DashboardData {
  overview: {
    todayPomodoros: number;
    weekPomodoros: number;
    monthPomodoros: number;
    currentStreak: number;
    focusTime: number;
  };
  trends: {
    productivity: number[];
    focus: number[];
    energy: number[];
    mood: number[];
  };
  insights: AnalyticsInsight[];
  recommendations: string[];
}

export class AnalyticsEngine {
  private events: AnalyticsEvent[] = [];
  private sessions: PomodoroSession[] = [];
  private tasks: Task[] = [];

  constructor(sessions: PomodoroSession[], tasks: Task[]) {
    this.sessions = sessions;
    this.tasks = tasks;
  }

  // Track custom events
  trackEvent(type: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      timestamp: new Date(),
      properties,
    };

    this.events.push(event);
    this.processEvent(event);
  }

  // Calculate comprehensive user metrics
  calculateUserMetrics(): UserMetrics {
    const completedSessions = this.sessions.filter(
      s => s.isCompleted && !s.isBreak
    );
    const completedTasks = this.tasks.filter(t => t.isCompleted);

    return {
      productivity: {
        totalPomodoros: completedSessions.length,
        completedTasks: completedTasks.length,
        focusTime: completedSessions.reduce((sum, s) => sum + s.duration, 0),
        averageSessionLength:
          completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + s.duration, 0) /
              completedSessions.length
            : 0,
        completionRate:
          this.sessions.length > 0
            ? completedSessions.length / this.sessions.length
            : 0,
      },
      patterns: {
        mostProductiveHours: this.calculateMostProductiveHours(),
        preferredBreakTimes: this.calculatePreferredBreakTimes(),
        workStreak: this.calculateWorkStreak(),
        consistencyScore: this.calculateConsistencyScore(),
      },
      performance: {
        focusScore: this.calculateFocusScore(),
        interruptionRate: this.calculateInterruptionRate(),
        energyLevel: this.calculateEnergyLevel(),
        moodScore: this.calculateMoodScore(),
      },
      goals: {
        dailyGoal: 6,
        weeklyGoal: 30,
        monthlyGoal: 120,
        progress: this.calculateGoalProgress(),
      },
    };
  }

  // Generate insights from data
  generateInsights(): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    const metrics = this.calculateUserMetrics();

    // Productivity insights
    if (metrics.productivity.completionRate > 0.8) {
      insights.push({
        id: 'high-completion-rate',
        type: 'trend',
        title: 'Yüksek Tamamlanma Oranı',
        description: `Tamamlanma oranınız %${(metrics.productivity.completionRate * 100).toFixed(1)}. Mükemmel!`,
        confidence: 0.9,
        actionable: false,
        data: { completionRate: metrics.productivity.completionRate },
        timestamp: new Date(),
      });
    }

    // Focus insights
    if (metrics.performance.focusScore < 60) {
      insights.push({
        id: 'low-focus-score',
        type: 'warning',
        title: 'Düşük Odaklanma Skoru',
        description:
          'Odaklanma skorunuz düşük. Kesintileri azaltmaya odaklanın.',
        confidence: 0.8,
        actionable: true,
        data: { focusScore: metrics.performance.focusScore },
        timestamp: new Date(),
      });
    }

    // Consistency insights
    if (metrics.patterns.consistencyScore < 0.6) {
      insights.push({
        id: 'inconsistent-schedule',
        type: 'pattern',
        title: 'Tutarsız Çalışma Programı',
        description:
          'Çalışma programınızda tutarsızlık var. Düzenli saatlerde çalışmayı deneyin.',
        confidence: 0.7,
        actionable: true,
        data: { consistencyScore: metrics.patterns.consistencyScore },
        timestamp: new Date(),
      });
    }

    // Energy insights
    if (metrics.performance.energyLevel < 50) {
      insights.push({
        id: 'low-energy',
        type: 'recommendation',
        title: 'Düşük Enerji Seviyesi',
        description:
          'Enerji seviyeniz düşük. Daha fazla mola almayı ve dinlenmeyi deneyin.',
        confidence: 0.8,
        actionable: true,
        data: { energyLevel: metrics.performance.energyLevel },
        timestamp: new Date(),
      });
    }

    return insights;
  }

  // Generate dashboard data
  generateDashboardData(): DashboardData {
    const metrics = this.calculateUserMetrics();
    const insights = this.generateInsights();

    return {
      overview: {
        todayPomodoros: this.getTodayPomodoros(),
        weekPomodoros: this.getWeekPomodoros(),
        monthPomodoros: this.getMonthPomodoros(),
        currentStreak: metrics.patterns.workStreak,
        focusTime: metrics.productivity.focusTime,
      },
      trends: {
        productivity: this.calculateProductivityTrend(),
        focus: this.calculateFocusTrend(),
        energy: this.calculateEnergyTrend(),
        mood: this.calculateMoodTrend(),
      },
      insights,
      recommendations: this.generateRecommendations(),
    };
  }

  // Export data for external analysis
  exportData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      sessions: this.sessions,
      tasks: this.tasks,
      events: this.events,
      metrics: this.calculateUserMetrics(),
      insights: this.generateInsights(),
      exportDate: new Date().toISOString(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return this.convertToCSV(data);
    }
  }

  // Private helper methods
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private processEvent(event: AnalyticsEvent): void {
    // Process event for real-time insights
    console.log('Processing event:', event);
  }

  private calculateMostProductiveHours(): number[] {
    const hourCounts = new Array(24).fill(0);

    this.sessions
      .filter(s => s.isCompleted && !s.isBreak)
      .forEach(session => {
        const hour = new Date(session.startTime).getHours();
        hourCounts[hour]++;
      });

    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private calculatePreferredBreakTimes(): number[] {
    const breakDurations = this.sessions
      .filter(s => s.isBreak && s.isCompleted)
      .map(s => s.duration);

    if (breakDurations.length === 0) return [5, 15];

    const average =
      breakDurations.reduce((sum, d) => sum + d, 0) / breakDurations.length;
    return [Math.round(average), Math.round(average * 2)];
  }

  private calculateWorkStreak(): number {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const hasWork = this.sessions.some(s => {
        const sessionDate = new Date(s.startTime);
        return (
          sessionDate.toDateString() === date.toDateString() && s.isCompleted
        );
      });

      if (hasWork) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateConsistencyScore(): number {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = this.sessions.filter(
      s => new Date(s.startTime) > lastWeek
    );

    if (recentSessions.length === 0) return 0;

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

    return Math.max(0, 1 - variance / (averageActivity + 1));
  }

  private calculateFocusScore(): number {
    const completedSessions = this.sessions.filter(
      s => s.isCompleted && !s.isBreak
    );
    if (completedSessions.length === 0) return 0;

    const totalInterruptions = completedSessions.reduce(
      (sum, s) => sum + s.interruptions,
      0
    );
    const averageInterruptions = totalInterruptions / completedSessions.length;

    return Math.max(0, 100 - averageInterruptions * 10);
  }

  private calculateInterruptionRate(): number {
    const completedSessions = this.sessions.filter(s => s.isCompleted);
    if (completedSessions.length === 0) return 0;

    const totalInterruptions = completedSessions.reduce(
      (sum, s) => sum + s.interruptions,
      0
    );
    return totalInterruptions / completedSessions.length;
  }

  private calculateEnergyLevel(): number {
    const focusScore = this.calculateFocusScore();
    const consistencyScore = this.calculateConsistencyScore();
    const workStreak = this.calculateWorkStreak();

    return (focusScore + consistencyScore * 100 + workStreak * 5) / 3;
  }

  private calculateMoodScore(): number {
    const completionRate =
      this.sessions.length > 0
        ? this.sessions.filter(s => s.isCompleted).length / this.sessions.length
        : 0;

    const workStreak = this.calculateWorkStreak();

    return (completionRate * 100 + workStreak * 10) / 2;
  }

  private calculateGoalProgress(): number {
    const todayPomodoros = this.getTodayPomodoros();
    return Math.min(100, (todayPomodoros / 6) * 100);
  }

  private getTodayPomodoros(): number {
    const today = new Date().toDateString();
    return this.sessions.filter(
      s =>
        new Date(s.startTime).toDateString() === today &&
        s.isCompleted &&
        !s.isBreak
    ).length;
  }

  private getWeekPomodoros(): number {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.sessions.filter(
      s => new Date(s.startTime) > weekAgo && s.isCompleted && !s.isBreak
    ).length;
  }

  private getMonthPomodoros(): number {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.sessions.filter(
      s => new Date(s.startTime) > monthAgo && s.isCompleted && !s.isBreak
    ).length;
  }

  private calculateProductivityTrend(): number[] {
    // Calculate productivity for last 7 days
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayPomodoros = this.sessions.filter(
        s =>
          new Date(s.startTime).toDateString() === date.toDateString() &&
          s.isCompleted &&
          !s.isBreak
      ).length;
      trend.push(dayPomodoros);
    }
    return trend;
  }

  private calculateFocusTrend(): number[] {
    // Calculate focus score for last 7 days
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const daySessions = this.sessions.filter(
        s =>
          new Date(s.startTime).toDateString() === date.toDateString() &&
          s.isCompleted
      );

      if (daySessions.length === 0) {
        trend.push(0);
      } else {
        const totalInterruptions = daySessions.reduce(
          (sum, s) => sum + s.interruptions,
          0
        );
        const focusScore = Math.max(
          0,
          100 - (totalInterruptions / daySessions.length) * 10
        );
        trend.push(focusScore);
      }
    }
    return trend;
  }

  private calculateEnergyTrend(): number[] {
    // Simplified energy trend calculation
    return this.calculateProductivityTrend().map(pomodoros => pomodoros * 20);
  }

  private calculateMoodTrend(): number[] {
    // Simplified mood trend calculation
    return this.calculateProductivityTrend().map(pomodoros =>
      Math.min(100, pomodoros * 25)
    );
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const metrics = this.calculateUserMetrics();

    if (metrics.performance.focusScore < 70) {
      recommendations.push(
        'Kesintileri azaltmak için çalışma ortamınızı düzenleyin'
      );
    }

    if (metrics.patterns.consistencyScore < 0.6) {
      recommendations.push('Düzenli çalışma saatleri belirleyin');
    }

    if (metrics.productivity.completionRate < 0.7) {
      recommendations.push('Görevleri daha küçük parçalara bölün');
    }

    if (metrics.patterns.workStreak < 3) {
      recommendations.push('Günlük çalışma rutini oluşturun');
    }

    return recommendations;
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion
    const lines = [];
    lines.push('Metric,Value');
    lines.push(`Total Pomodoros,${data.metrics.productivity.totalPomodoros}`);
    lines.push(`Completed Tasks,${data.metrics.productivity.completedTasks}`);
    lines.push(`Focus Time,${data.metrics.productivity.focusTime}`);
    lines.push(`Focus Score,${data.metrics.performance.focusScore}`);
    lines.push(`Work Streak,${data.metrics.patterns.workStreak}`);
    lines.push(`Consistency Score,${data.metrics.patterns.consistencyScore}`);
    return lines.join('\n');
  }
}
