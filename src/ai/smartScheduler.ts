// AI-powered smart scheduling system
import { Task, PomodoroSession } from '../types';

export interface UserPattern {
  mostProductiveHours: number[];
  preferredBreakTimes: number[];
  averageSessionLength: number;
  focusScore: number;
  energyLevel: 'low' | 'medium' | 'high';
  mood: 'positive' | 'neutral' | 'negative';
}

export interface SmartSuggestion {
  taskId: string;
  suggestedTime: Date;
  confidence: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EnergyAnalysis {
  currentLevel: number;
  predictedLevel: number;
  recommendations: string[];
  optimalTaskTypes: string[];
}

export class SmartScheduler {
  private userPatterns: UserPattern;
  private historicalData: PomodoroSession[];
  private tasks: Task[];

  constructor(
    userPatterns: UserPattern,
    historicalData: PomodoroSession[],
    tasks: Task[]
  ) {
    this.userPatterns = userPatterns;
    this.historicalData = historicalData;
    this.tasks = tasks;
  }

  // Analyze user patterns from historical data
  analyzeUserPatterns(): UserPattern {
    const patterns: Partial<UserPattern> = {
      mostProductiveHours: this.getMostProductiveHours(),
      preferredBreakTimes: this.getPreferredBreakTimes(),
      averageSessionLength: this.getAverageSessionLength(),
      focusScore: this.calculateFocusScore(),
      energyLevel: this.determineEnergyLevel(),
      mood: this.analyzeMood(),
    };

    return patterns as UserPattern;
  }

  // Generate smart task suggestions
  generateSuggestions(currentTime: Date = new Date()): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const energyAnalysis = this.analyzeEnergy(currentTime);

    this.tasks
      .filter(task => !task.isCompleted)
      .forEach(task => {
        const suggestion = this.createSuggestion(task, currentTime, energyAnalysis);
        if (suggestion) {
          suggestions.push(suggestion);
        }
      });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Analyze current energy level
  analyzeEnergy(currentTime: Date): EnergyAnalysis {
    const hour = currentTime.getHours();
    const energyLevel = this.calculateCurrentEnergyLevel(hour);
    const predictedLevel = this.predictEnergyLevel(currentTime);
    
    return {
      currentLevel: energyLevel,
      predictedLevel,
      recommendations: this.getEnergyRecommendations(energyLevel),
      optimalTaskTypes: this.getOptimalTaskTypes(energyLevel),
    };
  }

  // Smart break scheduling
  scheduleBreak(currentSession: PomodoroSession): Date {
    const sessionDuration = this.calculateSessionDuration(currentSession);
    const energyLevel = this.analyzeEnergy(new Date()).currentLevel;
    
    // Adjust break duration based on energy level and session length
    const baseBreakDuration = this.userPatterns.preferredBreakTimes[0] || 5;
    const adjustedDuration = this.adjustBreakDuration(baseBreakDuration, energyLevel, sessionDuration);
    
    return new Date(Date.now() + adjustedDuration * 60 * 1000);
  }

  // Predict optimal work times
  predictOptimalWorkTimes(days: number = 7): Date[] {
    const optimalTimes: Date[] = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      
      this.userPatterns.mostProductiveHours.forEach(hour => {
        const optimalTime = new Date(date);
        optimalTime.setHours(hour, 0, 0, 0);
        optimalTimes.push(optimalTime);
      });
    }
    
    return optimalTimes;
  }

  // Private helper methods
  private getMostProductiveHours(): number[] {
    const hourCounts = new Array(24).fill(0);
    
    this.historicalData.forEach(session => {
      if (session.isCompleted && !session.isBreak) {
        const hour = new Date(session.startTime).getHours();
        hourCounts[hour]++;
      }
    });
    
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private getPreferredBreakTimes(): number[] {
    const breakDurations = this.historicalData
      .filter(session => session.isBreak && session.isCompleted)
      .map(session => session.duration);
    
    if (breakDurations.length === 0) return [5, 15];
    
    const average = breakDurations.reduce((sum, duration) => sum + duration, 0) / breakDurations.length;
    return [Math.round(average), Math.round(average * 2)];
  }

  private getAverageSessionLength(): number {
    const completedSessions = this.historicalData.filter(session => session.isCompleted && !session.isBreak);
    if (completedSessions.length === 0) return 25;
    
    const totalDuration = completedSessions.reduce((sum, session) => sum + session.duration, 0);
    return totalDuration / completedSessions.length;
  }

  private calculateFocusScore(): number {
    const completedSessions = this.historicalData.filter(session => session.isCompleted && !session.isBreak);
    if (completedSessions.length === 0) return 0;
    
    const totalInterruptions = completedSessions.reduce((sum, session) => sum + session.interruptions, 0);
    const averageInterruptions = totalInterruptions / completedSessions.length;
    
    // Focus score: 100 - (interruptions * 10)
    return Math.max(0, 100 - (averageInterruptions * 10));
  }

  private determineEnergyLevel(): 'low' | 'medium' | 'high' {
    const focusScore = this.calculateFocusScore();
    if (focusScore >= 80) return 'high';
    if (focusScore >= 60) return 'medium';
    return 'low';
  }

  private analyzeMood(): 'positive' | 'neutral' | 'negative' {
    // Simplified mood analysis based on completion rate
    const recentSessions = this.historicalData
      .filter(session => {
        const sessionTime = new Date(session.startTime);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return sessionTime > weekAgo;
      });
    
    if (recentSessions.length === 0) return 'neutral';
    
    const completionRate = recentSessions.filter(s => s.isCompleted).length / recentSessions.length;
    
    if (completionRate >= 0.8) return 'positive';
    if (completionRate >= 0.6) return 'neutral';
    return 'negative';
  }

  private calculateCurrentEnergyLevel(hour: number): number {
    const isProductiveHour = this.userPatterns.mostProductiveHours.includes(hour);
    const baseEnergy = isProductiveHour ? 80 : 60;
    
    // Adjust based on time of day
    if (hour >= 6 && hour <= 10) return baseEnergy + 10; // Morning boost
    if (hour >= 14 && hour <= 16) return baseEnergy - 20; // Afternoon dip
    if (hour >= 20 && hour <= 22) return baseEnergy - 10; // Evening decline
    
    return baseEnergy;
  }

  private predictEnergyLevel(currentTime: Date): number {
    const currentEnergy = this.calculateCurrentEnergyLevel(currentTime.getHours());
    const trend = this.analyzeEnergyTrend();
    
    return Math.max(0, Math.min(100, currentEnergy + trend));
  }

  private analyzeEnergyTrend(): number {
    // Analyze energy trend over the last week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = this.historicalData.filter(session => 
      new Date(session.startTime) > weekAgo
    );
    
    if (recentSessions.length < 3) return 0;
    
    // Simple trend analysis
    const earlySessions = recentSessions.slice(0, Math.floor(recentSessions.length / 2));
    const lateSessions = recentSessions.slice(Math.floor(recentSessions.length / 2));
    
    const earlyAvgInterruptions = earlySessions.reduce((sum, s) => sum + s.interruptions, 0) / earlySessions.length;
    const lateAvgInterruptions = lateSessions.reduce((sum, s) => sum + s.interruptions, 0) / lateSessions.length;
    
    return (earlyAvgInterruptions - lateAvgInterruptions) * 5; // Positive if improving
  }

  private getEnergyRecommendations(energyLevel: number): string[] {
    if (energyLevel >= 80) {
      return [
        'Yüksek enerji seviyesi! Zorlu görevlere odaklanın.',
        'Kreatif işler için mükemmel zaman.',
        'Uzun pomodoro seansları yapabilirsiniz.',
      ];
    } else if (energyLevel >= 60) {
      return [
        'Orta enerji seviyesi. Dengeli görevler yapın.',
        'Kısa molalar almayı unutmayın.',
        'Kolay görevlerle başlayın.',
      ];
    } else {
      return [
        'Düşük enerji seviyesi. Dinlenme zamanı.',
        'Hafif görevler yapın veya mola alın.',
        'Enerji toplamak için kısa yürüyüş yapın.',
      ];
    }
  }

  private getOptimalTaskTypes(energyLevel: number): string[] {
    if (energyLevel >= 80) {
      return ['complex', 'creative', 'analytical'];
    } else if (energyLevel >= 60) {
      return ['routine', 'organizational', 'communication'];
    } else {
      return ['simple', 'administrative', 'review'];
    }
  }

  private createSuggestion(
    task: Task,
    currentTime: Date,
    energyAnalysis: EnergyAnalysis
  ): SmartSuggestion | null {
    const confidence = this.calculateConfidence(task, currentTime, energyAnalysis);
    
    if (confidence < 0.3) return null;
    
    const suggestedTime = this.calculateOptimalTime(task, currentTime, energyAnalysis);
    const reason = this.generateReason(task, energyAnalysis);
    const priority = this.determinePriority(task, confidence);
    
    return {
      taskId: task.id,
      suggestedTime,
      confidence,
      reason,
      priority,
    };
  }

  private calculateConfidence(
    task: Task,
    currentTime: Date,
    energyAnalysis: EnergyAnalysis
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Energy level factor
    if (energyAnalysis.currentLevel >= 80) confidence += 0.2;
    else if (energyAnalysis.currentLevel >= 60) confidence += 0.1;
    else confidence -= 0.1;
    
    // Task priority factor
    if (task.priority === 'high') confidence += 0.2;
    else if (task.priority === 'medium') confidence += 0.1;
    
    // Time factor
    const hour = currentTime.getHours();
    if (this.userPatterns.mostProductiveHours.includes(hour)) confidence += 0.2;
    
    // Task complexity factor
    if (task.estimatedPomodoros <= 2) confidence += 0.1;
    else if (task.estimatedPomodoros >= 5) confidence -= 0.1;
    
    return Math.max(0, Math.min(1, confidence));
  }

  private calculateOptimalTime(
    task: Task,
    currentTime: Date,
    energyAnalysis: EnergyAnalysis
  ): Date {
    const optimalTime = new Date(currentTime);
    
    // Adjust based on energy level and task complexity
    if (energyAnalysis.currentLevel >= 80 && task.estimatedPomodoros >= 3) {
      // High energy + complex task = start now
      return optimalTime;
    } else if (energyAnalysis.currentLevel < 60) {
      // Low energy = wait for better time
      optimalTime.setHours(optimalTime.getHours() + 1);
    }
    
    return optimalTime;
  }

  private generateReason(task: Task, energyAnalysis: EnergyAnalysis): string {
    const reasons: string[] = [];
    
    if (energyAnalysis.currentLevel >= 80) {
      reasons.push('Yüksek enerji seviyesi');
    }
    
    if (task.priority === 'high') {
      reasons.push('Yüksek öncelikli görev');
    }
    
    if (task.estimatedPomodoros <= 2) {
      reasons.push('Kısa süreli görev');
    }
    
    return reasons.join(', ') || 'Genel öneri';
  }

  private determinePriority(task: Task, confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8 || task.priority === 'high') return 'high';
    if (confidence >= 0.6 || task.priority === 'medium') return 'medium';
    return 'low';
  }

  private calculateSessionDuration(session: PomodoroSession): number {
    if (!session.endTime) return 0;
    return (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
  }

  private adjustBreakDuration(
    baseDuration: number,
    energyLevel: number,
    sessionDuration: number
  ): number {
    let adjustedDuration = baseDuration;
    
    // Adjust based on energy level
    if (energyLevel < 50) adjustedDuration *= 1.5;
    else if (energyLevel > 80) adjustedDuration *= 0.8;
    
    // Adjust based on session duration
    if (sessionDuration > 30) adjustedDuration *= 1.2;
    else if (sessionDuration < 15) adjustedDuration *= 0.8;
    
    return Math.round(adjustedDuration);
  }
}
