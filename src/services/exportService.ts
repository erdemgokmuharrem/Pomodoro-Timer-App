import { PomodoroSession, Task } from '../store/usePomodoroStore';
import { UserStats } from '../store/useGamificationStore';

export interface ExportData {
  sessions: PomodoroSession[];
  tasks: Task[];
  userStats: UserStats;
  settings: any;
  exportDate: string;
  version: string;
}

export type ExportFormat = 'json' | 'csv' | 'excel';

class ExportService {
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  private formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  exportToJSON(data: ExportData): string {
    const exportData = {
      ...data,
      sessions: data.sessions.map(session => ({
        ...session,
        startTime: this.formatDate(session.startTime),
        endTime: session.endTime ? this.formatDate(session.endTime) : null,
        interruptionList: session.interruptionList.map(interruption => ({
          ...interruption,
          timestamp: this.formatDate(interruption.timestamp),
        })),
      })),
      tasks: data.tasks.map(task => ({
        ...task,
        createdAt: this.formatDate(task.createdAt),
        updatedAt: this.formatDate(task.updatedAt),
      })),
      userStats: {
        ...data.userStats,
        badges: data.userStats.badges.map(badge => ({
          ...badge,
          unlockedAt: badge.unlockedAt ? this.formatDate(badge.unlockedAt) : null,
        })),
        achievements: data.userStats.achievements.map(achievement => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? this.formatDate(achievement.unlockedAt) : null,
        })),
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  exportToCSV(data: ExportData): string {
    const csvLines: string[] = [];
    
    // CSV Header
    csvLines.push('Pomodoro+ Export Data');
    csvLines.push(`Export Date: ${this.formatDateForDisplay(new Date())}`);
    csvLines.push('');

    // Sessions CSV
    csvLines.push('=== POMODORO SESSIONS ===');
    csvLines.push('ID,Task ID,Start Time,End Time,Duration (min),Completed,Break,Interruptions');
    
    data.sessions.forEach(session => {
      const line = [
        session.id,
        session.taskId || '',
        this.formatDateForDisplay(session.startTime),
        session.endTime ? this.formatDateForDisplay(session.endTime) : '',
        session.duration,
        session.isCompleted ? 'Yes' : 'No',
        session.isBreak ? 'Yes' : 'No',
        session.interruptions,
      ].join(',');
      csvLines.push(line);
    });

    csvLines.push('');

    // Tasks CSV
    csvLines.push('=== TASKS ===');
    csvLines.push('ID,Title,Description,Estimated Pomodoros,Completed Pomodoros,Priority,Tags,Completed,Created At,Updated At');
    
    data.tasks.forEach(task => {
      const line = [
        task.id,
        `"${task.title}"`,
        `"${task.description || ''}"`,
        task.estimatedPomodoros,
        task.completedPomodoros,
        task.priority,
        `"${task.tags.join('; ')}"`,
        task.isCompleted ? 'Yes' : 'No',
        this.formatDateForDisplay(task.createdAt),
        this.formatDateForDisplay(task.updatedAt),
      ].join(',');
      csvLines.push(line);
    });

    csvLines.push('');

    // User Stats CSV
    csvLines.push('=== USER STATISTICS ===');
    csvLines.push('Metric,Value');
    csvLines.push(`Level,${data.userStats.level}`);
    csvLines.push(`Total XP,${data.userStats.totalXp}`);
    csvLines.push(`Current Streak,${data.userStats.currentStreak}`);
    csvLines.push(`Longest Streak,${data.userStats.longestStreak}`);
    csvLines.push(`Total Pomodoros,${data.userStats.totalPomodoros}`);
    csvLines.push(`Total Tasks,${data.userStats.totalTasks}`);
    csvLines.push(`Total Focus Time (min),${data.userStats.totalFocusTime}`);
    csvLines.push(`Badges Unlocked,${data.userStats.badges.length}`);

    csvLines.push('');

    // Badges CSV
    csvLines.push('=== BADGES ===');
    csvLines.push('ID,Name,Description,Category,Rarity,Unlocked At');
    
    data.userStats.badges.forEach(badge => {
      const line = [
        badge.id,
        `"${badge.name}"`,
        `"${badge.description}"`,
        badge.category,
        badge.rarity,
        badge.unlockedAt ? this.formatDateForDisplay(badge.unlockedAt) : '',
      ].join(',');
      csvLines.push(line);
    });

    return csvLines.join('\n');
  }

  exportToExcel(data: ExportData): string {
    // For Excel format, we'll create a more structured CSV that Excel can open
    const excelLines: string[] = [];
    
    // Excel Header with metadata
    excelLines.push('Pomodoro+ Export Report');
    excelLines.push(`Generated: ${this.formatDateForDisplay(new Date())}`);
    excelLines.push(`Total Sessions: ${data.sessions.length}`);
    excelLines.push(`Total Tasks: ${data.tasks.length}`);
    excelLines.push(`User Level: ${data.userStats.level}`);
    excelLines.push(`Total XP: ${data.userStats.totalXp}`);
    excelLines.push('');

    // Summary Statistics
    excelLines.push('=== SUMMARY STATISTICS ===');
    const completedSessions = data.sessions.filter(s => s.isCompleted);
    const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionLength = completedSessions.length > 0 ? totalFocusTime / completedSessions.length : 0;
    
    excelLines.push(`Total Focus Time: ${totalFocusTime} minutes (${(totalFocusTime / 60).toFixed(1)} hours)`);
    excelLines.push(`Average Session Length: ${averageSessionLength.toFixed(1)} minutes`);
    excelLines.push(`Completion Rate: ${((completedSessions.length / data.sessions.length) * 100).toFixed(1)}%`);
    excelLines.push(`Current Streak: ${data.userStats.currentStreak} days`);
    excelLines.push(`Longest Streak: ${data.userStats.longestStreak} days`);
    excelLines.push('');

    // Daily Statistics
    excelLines.push('=== DAILY STATISTICS ===');
    excelLines.push('Date,Sessions,Pomodoros,Focus Time (min),Tasks Completed');
    
    const dailyStats = new Map<string, { sessions: number; pomodoros: number; focusTime: number; tasks: number }>();
    
    data.sessions.forEach(session => {
      const date = session.startTime.toDateString();
      const stats = dailyStats.get(date) || { sessions: 0, pomodoros: 0, focusTime: 0, tasks: 0 };
      stats.sessions++;
      if (session.isCompleted && !session.isBreak) {
        stats.pomodoros++;
        stats.focusTime += session.duration;
      }
      dailyStats.set(date, stats);
    });

    data.tasks.forEach(task => {
      if (task.isCompleted) {
        const date = task.updatedAt.toDateString();
        const stats = dailyStats.get(date) || { sessions: 0, pomodoros: 0, focusTime: 0, tasks: 0 };
        stats.tasks++;
        dailyStats.set(date, stats);
      }
    });

    Array.from(dailyStats.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .forEach(([date, stats]) => {
        const line = [
          this.formatDateForDisplay(new Date(date)),
          stats.sessions,
          stats.pomodoros,
          stats.focusTime,
          stats.tasks,
        ].join(',');
        excelLines.push(line);
      });

    return excelLines.join('\n');
  }

  generateFileName(format: ExportFormat): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    return `pomodoro-export-${dateStr}.${format}`;
  }

  async saveToFile(content: string, fileName: string): Promise<string> {
    // In a real app, you would use react-native-fs or expo-file-system
    // For now, we'll return the content and let the UI handle it
    console.log(`Saving file: ${fileName}`);
    console.log('Content preview:', content.substring(0, 200) + '...');
    
    // Return a mock file path
    return `file:///storage/emulated/0/Download/${fileName}`;
  }

  async exportData(
    data: ExportData, 
    format: ExportFormat
  ): Promise<{ content: string; fileName: string; filePath: string }> {
    let content: string;
    
    switch (format) {
      case 'json':
        content = this.exportToJSON(data);
        break;
      case 'csv':
        content = this.exportToCSV(data);
        break;
      case 'excel':
        content = this.exportToExcel(data);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    const fileName = this.generateFileName(format);
    const filePath = await this.saveToFile(content, fileName);

    return { content, fileName, filePath };
  }

  // Helper method to prepare data for export
  prepareExportData(
    sessions: PomodoroSession[],
    tasks: Task[],
    userStats: UserStats,
    settings: any
  ): ExportData {
    return {
      sessions,
      tasks,
      userStats,
      settings,
      exportDate: this.formatDate(new Date()),
      version: '1.0.0',
    };
  }
}

export const exportService = new ExportService();
