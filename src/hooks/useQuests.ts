import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface Quest {
  id: string;
  title: string;
  description: string;
  type:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'special'
    | 'achievement'
    | 'challenge';
  category:
    | 'productivity'
    | 'wellness'
    | 'learning'
    | 'social'
    | 'creative'
    | 'exploration';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  status: 'locked' | 'available' | 'active' | 'completed' | 'expired';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  progress: QuestProgress;
  timeLimit?: Date;
  prerequisites?: string[];
  tags: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestRequirement {
  id: string;
  type:
    | 'pomodoro_count'
    | 'pomodoro_duration'
    | 'task_completion'
    | 'streak_days'
    | 'xp_earned'
    | 'level_reached'
    | 'badge_earned'
    | 'time_spent'
    | 'focus_sessions'
    | 'break_taken';
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface QuestReward {
  id: string;
  type: 'xp' | 'badge' | 'title' | 'unlock' | 'currency' | 'item';
  name: string;
  description: string;
  value: number;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface QuestProgress {
  current: number;
  total: number;
  percentage: number;
  completedRequirements: number;
  totalRequirements: number;
  estimatedTimeRemaining?: number; // minutes
  lastUpdated: Date;
}

export interface QuestSeries {
  id: string;
  title: string;
  description: string;
  quests: string[]; // Quest IDs
  rewards: QuestReward[];
  progress: number; // 0-1
  status: 'locked' | 'available' | 'active' | 'completed';
  unlockConditions: QuestRequirement[];
  createdAt: Date;
}

export interface QuestSettings {
  enableQuests: boolean;
  autoAcceptQuests: boolean;
  showQuestNotifications: boolean;
  questDifficulty: 'easy' | 'medium' | 'hard' | 'all';
  preferredCategories: string[];
  maxActiveQuests: number;
  questRefreshInterval: number; // hours
  showProgressNotifications: boolean;
  enableQuestSeries: boolean;
}

export const useQuests = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP, badges } = useGamificationStore();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [questSeries, setQuestSeries] = useState<QuestSeries[]>([]);
  const [settings, setSettings] = useState<QuestSettings>({
    enableQuests: true,
    autoAcceptQuests: false,
    showQuestNotifications: true,
    questDifficulty: 'all',
    preferredCategories: ['productivity', 'wellness', 'learning'],
    maxActiveQuests: 5,
    questRefreshInterval: 24,
    showProgressNotifications: true,
    enableQuestSeries: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate daily quests
  const generateDailyQuests = (): Quest[] => {
    const dailyQuests: Quest[] = [
      {
        id: `daily-${Date.now()}-1`,
        title: 'Günün İlk Pomodorosu',
        description: 'Bugün ilk pomodoro seansınızı tamamlayın',
        type: 'daily',
        category: 'productivity',
        difficulty: 'easy',
        status: 'available',
        requirements: [
          {
            id: 'req-1',
            type: 'pomodoro_count',
            description: '1 pomodoro seansı tamamla',
            target: 1,
            current: 0,
            unit: 'seans',
            completed: false,
          },
        ],
        rewards: [
          {
            id: 'reward-1',
            type: 'xp',
            name: 'Deneyim Puanı',
            description: '50 XP kazanın',
            value: 50,
            icon: '⭐',
            rarity: 'common',
          },
        ],
        progress: {
          current: 0,
          total: 1,
          percentage: 0,
          completedRequirements: 0,
          totalRequirements: 1,
          lastUpdated: new Date(),
        },
        timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000),
        tags: ['günlük', 'başlangıç'],
        rarity: 'common',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `daily-${Date.now()}-2`,
        title: 'Odaklanma Ustası',
        description: '3 pomodoro seansını kesintisiz tamamlayın',
        type: 'daily',
        category: 'productivity',
        difficulty: 'medium',
        status: 'available',
        requirements: [
          {
            id: 'req-2',
            type: 'pomodoro_count',
            description: '3 pomodoro seansı tamamla',
            target: 3,
            current: 0,
            unit: 'seans',
            completed: false,
          },
        ],
        rewards: [
          {
            id: 'reward-2',
            type: 'xp',
            name: 'Deneyim Puanı',
            description: '150 XP kazanın',
            value: 150,
            icon: '⭐',
            rarity: 'uncommon',
          },
          {
            id: 'reward-3',
            type: 'badge',
            name: 'Odaklanma Ustası',
            description: 'Günlük odaklanma rozeti',
            value: 1,
            icon: '🎯',
            rarity: 'uncommon',
          },
        ],
        progress: {
          current: 0,
          total: 3,
          percentage: 0,
          completedRequirements: 0,
          totalRequirements: 1,
          lastUpdated: new Date(),
        },
        timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000),
        tags: ['günlük', 'odaklanma'],
        rarity: 'uncommon',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `daily-${Date.now()}-3`,
        title: 'Mola Zamanı',
        description: '5 dakikalık mola alın',
        type: 'daily',
        category: 'wellness',
        difficulty: 'easy',
        status: 'available',
        requirements: [
          {
            id: 'req-3',
            type: 'break_taken',
            description: '5 dakika mola al',
            target: 5,
            current: 0,
            unit: 'dakika',
            completed: false,
          },
        ],
        rewards: [
          {
            id: 'reward-4',
            type: 'xp',
            name: 'Deneyim Puanı',
            description: '25 XP kazanın',
            value: 25,
            icon: '⭐',
            rarity: 'common',
          },
        ],
        progress: {
          current: 0,
          total: 5,
          percentage: 0,
          completedRequirements: 0,
          totalRequirements: 1,
          lastUpdated: new Date(),
        },
        timeLimit: new Date(Date.now() + 24 * 60 * 60 * 1000),
        tags: ['günlük', 'sağlık'],
        rarity: 'common',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return dailyQuests;
  };

  // Generate weekly quests
  const generateWeeklyQuests = (): Quest[] => {
    const weeklyQuests: Quest[] = [
      {
        id: `weekly-${Date.now()}-1`,
        title: 'Haftalık Maraton',
        description: 'Bu hafta 20 pomodoro seansı tamamlayın',
        type: 'weekly',
        category: 'productivity',
        difficulty: 'hard',
        status: 'available',
        requirements: [
          {
            id: 'req-4',
            type: 'pomodoro_count',
            description: '20 pomodoro seansı tamamla',
            target: 20,
            current: 0,
            unit: 'seans',
            completed: false,
          },
        ],
        rewards: [
          {
            id: 'reward-5',
            type: 'xp',
            name: 'Deneyim Puanı',
            description: '500 XP kazanın',
            value: 500,
            icon: '⭐',
            rarity: 'rare',
          },
          {
            id: 'reward-6',
            type: 'badge',
            name: 'Haftalık Maratoncu',
            description: 'Haftalık verimlilik rozeti',
            value: 1,
            icon: '🏃‍♂️',
            rarity: 'rare',
          },
        ],
        progress: {
          current: 0,
          total: 20,
          percentage: 0,
          completedRequirements: 0,
          totalRequirements: 1,
          lastUpdated: new Date(),
        },
        timeLimit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['haftalık', 'maraton'],
        rarity: 'rare',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `weekly-${Date.now()}-2`,
        title: 'Öğrenme Aşkı',
        description: 'Bu hafta 5 saat öğrenme zamanı ayırın',
        type: 'weekly',
        category: 'learning',
        difficulty: 'medium',
        status: 'available',
        requirements: [
          {
            id: 'req-5',
            type: 'time_spent',
            description: '5 saat öğrenme zamanı',
            target: 300, // 5 hours in minutes
            current: 0,
            unit: 'dakika',
            completed: false,
          },
        ],
        rewards: [
          {
            id: 'reward-7',
            type: 'xp',
            name: 'Deneyim Puanı',
            description: '300 XP kazanın',
            value: 300,
            icon: '⭐',
            rarity: 'uncommon',
          },
          {
            id: 'reward-8',
            type: 'badge',
            name: 'Öğrenme Tutkunu',
            description: 'Haftalık öğrenme rozeti',
            value: 1,
            icon: '📚',
            rarity: 'uncommon',
          },
        ],
        progress: {
          current: 0,
          total: 300,
          percentage: 0,
          completedRequirements: 0,
          totalRequirements: 1,
          lastUpdated: new Date(),
        },
        timeLimit: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['haftalık', 'öğrenme'],
        rarity: 'uncommon',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return weeklyQuests;
  };

  // Generate special quests
  const generateSpecialQuests = (): Quest[] => {
    const specialQuests: Quest[] = [
      {
        id: `special-${Date.now()}-1`,
        title: 'İlk Adım',
        description: 'İlk pomodoro seansınızı tamamlayın',
        type: 'special',
        category: 'productivity',
        difficulty: 'easy',
        status: (completedPomodoros || []).length > 0 ? 'completed' : 'available',
        requirements: [
          {
            id: 'req-6',
            type: 'pomodoro_count',
            description: '1 pomodoro seansı tamamla',
            target: 1,
            current: Math.min((completedPomodoros || []).length, 1),
            unit: 'seans',
            completed: (completedPomodoros || []).length > 0,
          },
        ],
        rewards: [
          {
            id: 'reward-9',
            type: 'xp',
            name: 'Deneyim Puanı',
            description: '100 XP kazanın',
            value: 100,
            icon: '⭐',
            rarity: 'common',
          },
          {
            id: 'reward-10',
            type: 'badge',
            name: 'İlk Adım',
            description: 'İlk pomodoro rozeti',
            value: 1,
            icon: '👶',
            rarity: 'common',
          },
        ],
        progress: {
          current: Math.min((completedPomodoros || []).length, 1),
          total: 1,
          percentage: Math.min((completedPomodoros || []).length, 1) * 100,
          completedRequirements: (completedPomodoros || []).length > 0 ? 1 : 0,
          totalRequirements: 1,
          lastUpdated: new Date(),
        },
        tags: ['özel', 'başlangıç'],
        rarity: 'common',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `special-${Date.now()}-2`,
        title: 'Seviye Atlama',
        description: "Seviye 5'e ulaşın",
        type: 'special',
        category: 'achievement',
        difficulty: 'medium',
        status: userLevel >= 5 ? 'completed' : 'available',
        requirements: [
          {
            id: 'req-7',
            type: 'level_reached',
            description: "Seviye 5'e ulaş",
            target: 5,
            current: userLevel,
            unit: 'seviye',
            completed: userLevel >= 5,
          },
        ],
        rewards: [
          {
            id: 'reward-11',
            type: 'xp',
            name: 'Deneyim Puanı',
            description: '250 XP kazanın',
            value: 250,
            icon: '⭐',
            rarity: 'uncommon',
          },
          {
            id: 'reward-12',
            type: 'badge',
            name: 'Seviye Ustası',
            description: 'Seviye atlama rozeti',
            value: 1,
            icon: '📈',
            rarity: 'uncommon',
          },
        ],
        progress: {
          current: userLevel,
          total: 5,
          percentage: (userLevel / 5) * 100,
          completedRequirements: userLevel >= 5 ? 1 : 0,
          totalRequirements: 1,
          lastUpdated: new Date(),
        },
        tags: ['özel', 'seviye'],
        rarity: 'uncommon',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return specialQuests;
  };

  // Update quest progress
  const updateQuestProgress = (questId: string): boolean => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.status !== 'active') return false;

    let progressUpdated = false;
    const updatedRequirements = quest.requirements.map(req => {
      let current = req.current;
      let completed = req.completed;

      switch (req.type) {
        case 'pomodoro_count':
          current = (completedPomodoros || []).filter(p => p.completed).length;
          completed = current >= req.target;
          break;
        case 'pomodoro_duration':
          current = (completedPomodoros || []).reduce((sum, p) => sum + p.duration, 0);
          completed = current >= req.target;
          break;
        case 'task_completion':
          current = (tasks || []).filter(t => t.completed).length;
          completed = current >= req.target;
          break;
        case 'streak_days':
          // Calculate current streak
          current = calculateStreak();
          completed = current >= req.target;
          break;
        case 'xp_earned':
          current = totalXP;
          completed = current >= req.target;
          break;
        case 'level_reached':
          current = userLevel;
          completed = current >= req.target;
          break;
        case 'badge_earned':
          current = (badges || []).length;
          completed = current >= req.target;
          break;
        case 'time_spent':
          current = (completedPomodoros || []).reduce((sum, p) => sum + p.duration, 0);
          completed = current >= req.target;
          break;
        case 'focus_sessions':
          current = (completedPomodoros || []).filter(p => p.completed).length;
          completed = current >= req.target;
          break;
        case 'break_taken':
          // This would need to be tracked separately
          current = 0;
          completed = current >= req.target;
          break;
      }

      if (current !== req.current) {
        progressUpdated = true;
      }

      return {
        ...req,
        current,
        completed,
      };
    });

    if (progressUpdated) {
      const completedRequirements = updatedRequirements.filter(
        req => req.completed
      ).length;
      const totalRequirements = updatedRequirements.length;
      const isCompleted = completedRequirements === totalRequirements;

      const updatedQuest = {
        ...quest,
        requirements: updatedRequirements,
        progress: {
          current: updatedRequirements.reduce(
            (sum, req) => sum + req.current,
            0
          ),
          total: updatedRequirements.reduce((sum, req) => sum + req.target, 0),
          percentage: (completedRequirements / totalRequirements) * 100,
          completedRequirements,
          totalRequirements,
          lastUpdated: new Date(),
        },
        status: isCompleted ? 'completed' : 'active',
        updatedAt: new Date(),
      };

      setQuests(prev => prev.map(q => (q.id === questId ? updatedQuest : q)));
      return true;
    }

    return false;
  };

  // Calculate current streak
  const calculateStreak = (): number => {
    const sortedPomodoros = completedPomodoros.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const pomodoro of sortedPomodoros) {
      const pomodoroDate = new Date(pomodoro.completedAt);
      pomodoroDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - pomodoroDate.getTime()) / (1000 * 60 * 60 * 24)
      );

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

  // Accept quest
  const acceptQuest = async (questId: string): Promise<boolean> => {
    try {
      const quest = quests.find(q => q.id === questId);
      if (!quest || quest.status !== 'available') return false;

      // Check if max active quests reached
      const activeQuests = (quests || []).filter(q => q.status === 'active').length;
      if (activeQuests >= settings.maxActiveQuests) {
        Alert.alert('Uyarı', 'Maksimum aktif görev sayısına ulaştınız');
        return false;
      }

      setQuests(prev =>
        prev.map(q =>
          q.id === questId
            ? { ...q, status: 'active', updatedAt: new Date() }
            : q
        )
      );
      return true;
    } catch (err) {
      console.error('Accept quest error:', err);
      return false;
    }
  };

  // Complete quest
  const completeQuest = async (questId: string): Promise<boolean> => {
    try {
      const quest = quests.find(q => q.id === questId);
      if (!quest || quest.status !== 'completed') return false;

      // Award rewards
      quest.rewards.forEach(reward => {
        console.log(`Awarded: ${reward.name} (${reward.value})`);
        // In a real app, this would update the user's rewards
      });

      setQuests(prev =>
        prev.map(q =>
          q.id === questId
            ? { ...q, status: 'completed', updatedAt: new Date() }
            : q
        )
      );
      return true;
    } catch (err) {
      console.error('Complete quest error:', err);
      return false;
    }
  };

  // Generate new quests
  const generateNewQuests = async (): Promise<Quest[]> => {
    try {
      setLoading(true);
      setError(null);

      const newQuests = [
        ...generateDailyQuests(),
        ...generateWeeklyQuests(),
        ...generateSpecialQuests(),
      ];

      setQuests(prev => [...prev, ...newQuests]);
      return newQuests;
    } catch (err) {
      setError('Failed to generate new quests');
      console.error('Generate new quests error:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<QuestSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get quest insights
  const getQuestInsights = () => {
    const totalQuests = (quests || []).length;
    const activeQuests = (quests || []).filter(q => q.status === 'active').length;
    const completedQuests = (quests || []).filter(q => q.status === 'completed').length;
    const availableQuests = (quests || []).filter(q => q.status === 'available').length;
    const completionRate = totalQuests > 0 ? completedQuests / totalQuests : 0;

    return {
      totalQuests,
      activeQuests,
      completedQuests,
      availableQuests,
      completionRate,
      questsEnabled: settings.enableQuests,
      maxActiveQuests: settings.maxActiveQuests,
    };
  };

  // Auto-update quest progress
  useEffect(() => {
    if (settings.enableQuests) {
      quests.forEach(quest => {
        if (quest.status === 'active') {
          updateQuestProgress(quest.id);
        }
      });
    }
  }, [completedPomodoros, tasks, userLevel, totalXP, badges]);

  // Auto-generate quests
  useEffect(() => {
    if (settings.enableQuests && (quests || []).length === 0) {
      generateNewQuests();
    }
  }, [settings.enableQuests]);

  return {
    quests,
    questSeries,
    settings,
    loading,
    error,
    acceptQuest,
    completeQuest,
    generateNewQuests,
    updateQuestProgress,
    updateSettings,
    getQuestInsights,
  };
};
