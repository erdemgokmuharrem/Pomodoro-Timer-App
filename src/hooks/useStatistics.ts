import { useMemo } from 'react';
import { usePomodoroStore, PomodoroSession, Task } from '../store/usePomodoroStore';

export interface DailyStats {
  date: string;
  pomodoros: number;
  hours: number;
  tasks: number;
}

export interface WeeklyStats {
  totalPomodoros: number;
  totalHours: number;
  averagePerDay: number;
  currentStreak: number;
  longestStreak: number;
  completedTasks: number;
}

export interface TaskStats {
  taskId: string;
  taskName: string;
  pomodoros: number;
  hours: number;
  percentage: number;
}

export const useStatistics = () => {
  const { sessions, tasks, dailyGoal } = usePomodoroStore();

  const dailyStats = useMemo((): DailyStats[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last7Days.map(date => {
      const daySessions = sessions.filter(session => 
        session.startTime.toDateString() === date && session.isCompleted
      );
      
      const dayTasks = tasks.filter(task => {
        const taskSessions = sessions.filter(session => 
          session.taskId === task.id && 
          session.startTime.toDateString() === date &&
          session.isCompleted
        );
        return taskSessions.length > 0;
      });

      return {
        date: new Date(date).toLocaleDateString('tr-TR', { 
          weekday: 'short',
          day: 'numeric'
        }),
        pomodoros: daySessions.length,
        hours: daySessions.reduce((total, session) => total + session.duration, 0) / 60,
        tasks: dayTasks.length,
      };
    });
  }, [sessions, tasks]);

  const weeklyStats = useMemo((): WeeklyStats => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    const weekSessions = sessions.filter(session => 
      last7Days.includes(session.startTime.toDateString()) && session.isCompleted
    );

    const totalPomodoros = weekSessions.length;
    const totalHours = weekSessions.reduce((total, session) => total + session.duration, 0) / 60;
    const averagePerDay = totalPomodoros / 7;

    // Calculate streak
    const today = new Date().toDateString();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check current streak
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      const daySessions = sessions.filter(session => 
        session.startTime.toDateString() === dateStr && session.isCompleted
      );
      
      if (daySessions.length > 0) {
        if (i === 0 || tempStreak > 0) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    const completedTasks = tasks.filter(task => task.isCompleted).length;

    return {
      totalPomodoros,
      totalHours,
      averagePerDay,
      currentStreak,
      longestStreak,
      completedTasks,
    };
  }, [sessions, tasks]);

  const taskStats = useMemo((): TaskStats[] => {
    const taskStatsMap = new Map<string, { pomodoros: number; hours: number }>();

    sessions.forEach(session => {
      if (session.isCompleted && session.taskId) {
        const existing = taskStatsMap.get(session.taskId) || { pomodoros: 0, hours: 0 };
        taskStatsMap.set(session.taskId, {
          pomodoros: existing.pomodoros + 1,
          hours: existing.hours + session.duration / 60,
        });
      }
    });

    const totalPomodoros = Array.from(taskStatsMap.values())
      .reduce((total, stat) => total + stat.pomodoros, 0);

    return Array.from(taskStatsMap.entries()).map(([taskId, stats]) => {
      const task = tasks.find(t => t.id === taskId);
      return {
        taskId,
        taskName: task?.title || 'Bilinmeyen Görev',
        pomodoros: stats.pomodoros,
        hours: stats.hours,
        percentage: totalPomodoros > 0 ? (stats.pomodoros / totalPomodoros) * 100 : 0,
      };
    }).sort((a, b) => b.pomodoros - a.pomodoros);
  }, [sessions, tasks]);

  const focusScore = useMemo(() => {
    // Calculate focus score based on completion rate and consistency
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    });

    const weekSessions = sessions.filter(session => 
      last7Days.includes(session.startTime.toDateString()) && session.isCompleted
    );

    const completionRate = weekSessions.length / (dailyGoal * 7);
    const consistency = weeklyStats.currentStreak / 7;
    
    return Math.min(100, Math.round((completionRate * 0.7 + consistency * 0.3) * 100));
  }, [sessions, dailyGoal, weeklyStats.currentStreak]);

  const productivityTrend = useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    return last14Days.map(date => {
      const daySessions = sessions.filter(session => 
        session.startTime.toDateString() === date && session.isCompleted
      );
      
      return {
        date: new Date(date).toLocaleDateString('tr-TR', { 
          month: 'short',
          day: 'numeric'
        }),
        pomodoros: daySessions.length,
      };
    });
  }, [sessions]);

  return {
    dailyStats,
    weeklyStats,
    taskStats,
    focusScore,
    productivityTrend,
  };
};
