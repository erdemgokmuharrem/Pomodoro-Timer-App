import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface CoachMessage {
  id: string;
  type: 'motivation' | 'advice' | 'celebration' | 'warning' | 'reminder' | 'insight';
  title: string;
  content: string;
  tone: 'encouraging' | 'supportive' | 'celebratory' | 'concerned' | 'analytical';
  priority: 'high' | 'medium' | 'low';
  category: 'productivity' | 'wellness' | 'goal_achievement' | 'habit_building' | 'time_management';
  actionable: boolean;
  actionText?: string;
  actionType?: 'navigate' | 'open_modal' | 'start_activity' | 'view_insights';
  actionData?: any;
  createdAt: Date;
  expiresAt?: Date;
  read: boolean;
}

export interface CoachInsight {
  id: string;
  type: 'performance' | 'pattern' | 'trend' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  data: any;
  confidence: number;
  actionable: boolean;
  createdAt: Date;
}

export interface CoachSettings {
  enableAICoach: boolean;
  personality: 'motivational' | 'analytical' | 'supportive' | 'challenging' | 'balanced';
  frequency: 'low' | 'medium' | 'high';
  categories: string[];
  showCelebrations: boolean;
  showWarnings: boolean;
  showInsights: boolean;
  respectQuietHours: boolean;
  quietHoursStart: number; // hour
  quietHoursEnd: number; // hour
  maxMessagesPerDay: number;
}

export const useAICoach = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP, badges } = useGamificationStore();
  
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [insights, setInsights] = useState<CoachInsight[]>([]);
  const [settings, setSettings] = useState<CoachSettings>({
    enableAICoach: true,
    personality: 'balanced',
    frequency: 'medium',
    categories: ['productivity', 'wellness', 'goal_achievement', 'habit_building', 'time_management'],
    showCelebrations: true,
    showWarnings: true,
    showInsights: true,
    respectQuietHours: true,
    quietHoursStart: 22,
    quietHoursEnd: 8,
    maxMessagesPerDay: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze user performance
  const analyzePerformance = () => {
    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentPomodoros = completedPomodoros.filter(p => 
      new Date(p.completedAt) >= last7Days
    );
    const historicalPomodoros = completedPomodoros.filter(p => 
      new Date(p.completedAt) >= last30Days
    );

    const todayPomodoros = completedPomodoros.filter(p => 
      new Date(p.completedAt).toDateString() === today.toDateString()
    );

    const completionRate = recentPomodoros.length > 0 
      ? recentPomodoros.filter(p => p.completed).length / recentPomodoros.length 
      : 0;

    const avgDuration = recentPomodoros.length > 0
      ? recentPomodoros.reduce((sum, p) => sum + p.duration, 0) / recentPomodoros.length
      : 0;

    const streak = calculateStreak();
    const productivity = calculateProductivity();

    return {
      todayPomodoros: todayPomodoros.length,
      recentPomodoros: recentPomodoros.length,
      historicalPomodoros: historicalPomodoros.length,
      completionRate,
      avgDuration,
      streak,
      productivity,
      level: userLevel,
      xp: totalXP,
      badges: badges.length,
    };
  };

  // Calculate current streak
  const calculateStreak = (): number => {
    const sortedPomodoros = completedPomodoros
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const pomodoro of sortedPomodoros) {
      const pomodoroDate = new Date(pomodoro.completedAt);
      pomodoroDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate.getTime() - pomodoroDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === streak) {
        if (pomodoro.completed) {
          streak++;
        } else {
          break;
        }
      } else if (dayDiff === streak + 1) {
        if (pomodoro.completed) {
          streak++;
        } else {
          break;
        }
      } else if (dayDiff > streak + 1) {
        break;
      }
    }

    return streak;
  };

  // Calculate productivity score
  const calculateProductivity = (): number => {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPomodoros = completedPomodoros.filter(p => 
      new Date(p.completedAt) >= last7Days
    );

    if (recentPomodoros.length === 0) return 0;

    const completionRate = recentPomodoros.filter(p => p.completed).length / recentPomodoros.length;
    const consistency = Math.min(1, recentPomodoros.length / 7); // Daily consistency
    const efficiency = recentPomodoros.reduce((sum, p) => sum + (p.completed ? 1 : 0), 0) / recentPomodoros.length;

    return (completionRate * 0.4 + consistency * 0.3 + efficiency * 0.3);
  };

  // Generate motivational messages
  const generateMotivationalMessages = (): CoachMessage[] => {
    const performance = analyzePerformance();
    const messages: CoachMessage[] = [];

    // Celebration messages
    if (settings.showCelebrations) {
      if (performance.streak >= 7) {
        messages.push({
          id: `celebration-${Date.now()}`,
          type: 'celebration',
          title: '🎉 Harika Streak!',
          content: `${performance.streak} günlük streak'iniz devam ediyor! Bu muhteşem bir başarı.`,
          tone: 'celebratory',
          priority: 'high',
          category: 'achievement',
          actionable: false,
          createdAt: new Date(),
          read: false,
        });
      }

      if (performance.completionRate > 0.8) {
        messages.push({
          id: `celebration-rate-${Date.now()}`,
          type: 'celebration',
          title: '⭐ Mükemmel Tamamlanma!',
          content: `Son pomodorolarınızın %${Math.round(performance.completionRate * 100)}'i başarıyla tamamlandı!`,
          tone: 'celebratory',
          priority: 'medium',
          category: 'productivity',
          actionable: false,
          createdAt: new Date(),
          read: false,
        });
      }

      if (performance.level > 5) {
        messages.push({
          id: `celebration-level-${Date.now()}`,
          type: 'celebration',
          title: '🚀 Seviye Atladınız!',
          content: `Seviye ${performance.level}'a ulaştınız! ${performance.xp} XP topladınız.`,
          tone: 'celebratory',
          priority: 'high',
          category: 'achievement',
          actionable: true,
          actionText: 'Rozetleri Gör',
          actionType: 'view_insights',
          actionData: { type: 'badges' },
          createdAt: new Date(),
          read: false,
        });
      }
    }

    // Warning messages
    if (settings.showWarnings) {
      if (performance.streak === 0 && performance.recentPomodoros === 0) {
        messages.push({
          id: `warning-streak-${Date.now()}`,
          type: 'warning',
          title: '⚠️ Streak Kaybı Riski',
          content: 'Birkaç gündür pomodoro yapmadınız. Streak\'inizi korumak için bugün bir seans başlatın!',
          tone: 'concerned',
          priority: 'high',
          category: 'habit_building',
          actionable: true,
          actionText: 'Pomodoro Başlat',
          actionType: 'start_activity',
          actionData: { type: 'pomodoro' },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          read: false,
        });
      }

      if (performance.completionRate < 0.5 && performance.recentPomodoros > 3) {
        messages.push({
          id: `warning-completion-${Date.now()}`,
          type: 'warning',
          title: '📉 Tamamlanma Oranı Düşük',
          content: 'Son pomodorolarınızın yarısı tamamlanmadı. Daha kısa seanslar deneyebilirsiniz.',
          tone: 'concerned',
          priority: 'medium',
          category: 'productivity',
          actionable: true,
          actionText: 'Süre Ayarla',
          actionType: 'open_modal',
          actionData: { modal: 'smartDuration' },
          createdAt: new Date(),
          read: false,
        });
      }
    }

    // Motivation messages
    if (performance.todayPomodoros === 0) {
      messages.push({
        id: `motivation-daily-${Date.now()}`,
        type: 'motivation',
        title: '💪 Günün İlk Pomodorosu',
        content: 'Bugün henüz pomodoro yapmadınız. İlk adımı atın ve gününüzü verimli geçirin!',
        tone: 'encouraging',
        priority: 'medium',
        category: 'productivity',
        actionable: true,
        actionText: 'Pomodoro Başlat',
        actionType: 'start_activity',
        actionData: { type: 'pomodoro' },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        read: false,
      });
    }

    // Advice messages
    if (performance.productivity < 0.6 && performance.recentPomodoros > 5) {
      messages.push({
        id: `advice-productivity-${Date.now()}`,
        type: 'advice',
        title: '🎯 Verimlilik İpuçları',
        content: 'Verimliliğinizi artırmak için daha kısa seanslar ve düzenli molalar deneyin.',
        tone: 'supportive',
        priority: 'low',
        category: 'productivity',
        actionable: true,
        actionText: 'Önerileri Gör',
        actionType: 'open_modal',
        actionData: { modal: 'adaptiveMode' },
        createdAt: new Date(),
        read: false,
      });
    }

    return messages;
  };

  // Generate insights
  const generateInsights = (): CoachInsight[] => {
    const performance = analyzePerformance();
    const insights: CoachInsight[] = [];

    // Performance insight
    if (performance.recentPomodoros > 0) {
      insights.push({
        id: `insight-performance-${Date.now()}`,
        type: 'performance',
        title: 'Son 7 Günlük Performans',
        description: `${performance.recentPomodoros} pomodoro tamamladınız, %${Math.round(performance.completionRate * 100)} başarı oranı ile.`,
        data: {
          pomodoros: performance.recentPomodoros,
          completionRate: performance.completionRate,
          avgDuration: performance.avgDuration,
        },
        confidence: 0.9,
        actionable: true,
        createdAt: new Date(),
      });
    }

    // Pattern insight
    const hourlyData = completedPomodoros.reduce((acc, p) => {
      const hour = new Date(p.completedAt).getHours();
      if (!acc[hour]) acc[hour] = { total: 0, completed: 0 };
      acc[hour].total++;
      if (p.completed) acc[hour].completed++;
      return acc;
    }, {} as { [hour: number]: { total: number; completed: number } });

    const bestHour = Object.keys(hourlyData).reduce((a, b) => {
      const aRate = hourlyData[parseInt(a)].completed / hourlyData[parseInt(a)].total;
      const bRate = hourlyData[parseInt(b)].completed / hourlyData[parseInt(b)].total;
      return aRate > bRate ? a : b;
    });

    if (bestHour) {
      insights.push({
        id: `insight-pattern-${Date.now()}`,
        type: 'pattern',
        title: 'En Verimli Saatleriniz',
        description: `${bestHour}:00-${parseInt(bestHour) + 1}:00 saatleri arasında en yüksek başarı oranınız var.`,
        data: {
          bestHour: parseInt(bestHour),
          hourlyData,
        },
        confidence: 0.8,
        actionable: true,
        createdAt: new Date(),
      });
    }

    // Trend insight
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayPomodoros = completedPomodoros.filter(p => 
        new Date(p.completedAt).toDateString() === date.toDateString()
      );
      weeklyTrend.push({
        date: date.toDateString(),
        count: dayPomodoros.length,
        completed: dayPomodoros.filter(p => p.completed).length,
      });
    }

    insights.push({
      id: `insight-trend-${Date.now()}`,
      type: 'trend',
      title: 'Haftalık Trend',
      description: 'Son 7 günlük pomodoro aktivitelerinizin analizi.',
      data: { weeklyTrend },
      confidence: 0.7,
      actionable: true,
      createdAt: new Date(),
    });

    return insights;
  };

  // Generate daily messages
  const generateDailyMessages = async (): Promise<CoachMessage[]> => {
    try {
      setLoading(true);
      setError(null);

      const newMessages = generateMotivationalMessages();
      const filteredMessages = newMessages.filter(msg => {
        // Check if message already exists
        const exists = messages.some(m => m.id === msg.id);
        if (exists) return false;

        // Check quiet hours
        if (settings.respectQuietHours) {
          const now = new Date();
          const currentHour = now.getHours();
          if (currentHour >= settings.quietHoursStart || currentHour < settings.quietHoursEnd) {
            return false;
          }
        }

        // Check message limit
        const todayMessages = messages.filter(m => 
          new Date(m.createdAt).toDateString() === new Date().toDateString()
        );
        if (todayMessages.length >= settings.maxMessagesPerDay) {
          return false;
        }

        return true;
      });

      setMessages(prev => [...prev, ...filteredMessages]);
      return filteredMessages;
    } catch (err) {
      setError('Failed to generate daily messages');
      console.error('Generate daily messages error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Generate insights
  const generateDailyInsights = async (): Promise<CoachInsight[]> => {
    try {
      const newInsights = generateInsights();
      setInsights(prev => [...prev, ...newInsights]);
      return newInsights;
    } catch (err) {
      setError('Failed to generate insights');
      console.error('Generate insights error:', err);
      return [];
    }
  };

  // Mark message as read
  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  // Dismiss message
  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Execute message action
  const executeMessageAction = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.actionable) return;

    // In a real app, this would execute the action
    console.log(`Executing action for message ${messageId}:`, message.actionType, message.actionData);
    
    // Mark as read after action
    markMessageAsRead(messageId);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<CoachSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get coach insights
  const getCoachInsights = () => {
    const performance = analyzePerformance();
    const unreadMessages = messages.filter(m => !m.read).length;
    const todayMessages = messages.filter(m => 
      new Date(m.createdAt).toDateString() === new Date().toDateString()
    ).length;

    return {
      totalMessages: messages.length,
      unreadMessages,
      todayMessages,
      insights: insights.length,
      performance,
      coachEnabled: settings.enableAICoach,
      personality: settings.personality,
    };
  };

  // Auto-generate messages and insights
  useEffect(() => {
    if (settings.enableAICoach && completedPomodoros.length > 0) {
      generateDailyMessages();
      generateDailyInsights();
    }
  }, [completedPomodoros, settings.enableAICoach]);

  return {
    messages,
    insights,
    settings,
    loading,
    error,
    generateDailyMessages,
    generateDailyInsights,
    markMessageAsRead,
    dismissMessage,
    executeMessageAction,
    updateSettings,
    getCoachInsights,
  };
};
