import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface JournalEntry {
  id: string;
  date: Date;
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  energy: number; // 1-10 scale
  focus: number; // 1-10 scale
  productivity: number; // 1-10 scale
  stress: number; // 1-10 scale
  satisfaction: number; // 1-10 scale
  reflection: string;
  achievements: string[];
  challenges: string[];
  lessons: string[];
  goals: string[];
  gratitude: string[];
  insights: string[];
  tags: string[];
  weather?: string;
  location?: string;
  activities: string[];
  pomodorosCompleted: number;
  tasksCompleted: number;
  interruptions: number;
  breaks: number;
  focusTime: number; // minutes
  breakTime: number; // minutes
  totalTime: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalPrompt {
  id: string;
  category:
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'reflection'
    | 'gratitude'
    | 'goals'
    | 'challenges';
  question: string;
  type: 'text' | 'rating' | 'multiple_choice' | 'yes_no' | 'scale';
  options?: string[];
  required: boolean;
  order: number;
}

export interface JournalSettings {
  enableReflectJournal: boolean;
  dailyReminder: boolean;
  reminderTime: string; // HH:MM format
  prompts: JournalPrompt[];
  autoSave: boolean;
  privacy: 'private' | 'friends' | 'public';
  sharing: boolean;
  exportFormat: 'json' | 'csv' | 'pdf';
  backup: boolean;
  cloudSync: boolean;
}

export const useReflectJournal = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP, badges } = useGamificationStore();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  const [settings, setSettings] = useState<JournalSettings>({
    enableReflectJournal: true,
    dailyReminder: true,
    reminderTime: '21:00',
    prompts: [],
    autoSave: true,
    privacy: 'private',
    sharing: false,
    exportFormat: 'json',
    backup: true,
    cloudSync: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate default prompts
  const generateDefaultPrompts = (): JournalPrompt[] => {
    return [
      {
        id: 'prompt-1',
        category: 'daily',
        question: 'Bugün nasıl hissediyorsun?',
        type: 'rating',
        required: true,
        order: 1,
      },
      {
        id: 'prompt-2',
        category: 'daily',
        question: 'Bugün en çok neyle gurur duyuyorsun?',
        type: 'text',
        required: false,
        order: 2,
      },
      {
        id: 'prompt-3',
        category: 'daily',
        question: 'Bugün hangi zorluklarla karşılaştın?',
        type: 'text',
        required: false,
        order: 3,
      },
      {
        id: 'prompt-4',
        category: 'gratitude',
        question: 'Bugün için minnettar olduğun 3 şey nedir?',
        type: 'text',
        required: false,
        order: 4,
      },
      {
        id: 'prompt-5',
        category: 'goals',
        question: 'Yarın için hedefin nedir?',
        type: 'text',
        required: false,
        order: 5,
      },
      {
        id: 'prompt-6',
        category: 'reflection',
        question: 'Bugünkü çalışma seanslarından ne öğrendin?',
        type: 'text',
        required: false,
        order: 6,
      },
      {
        id: 'prompt-7',
        category: 'daily',
        question: 'Enerji seviyen nasıldı? (1-10)',
        type: 'scale',
        required: true,
        order: 7,
      },
      {
        id: 'prompt-8',
        category: 'daily',
        question: 'Odaklanma seviyen nasıldı? (1-10)',
        type: 'scale',
        required: true,
        order: 8,
      },
      {
        id: 'prompt-9',
        category: 'daily',
        question: 'Verimlilik seviyen nasıldı? (1-10)',
        type: 'scale',
        required: true,
        order: 9,
      },
      {
        id: 'prompt-10',
        category: 'daily',
        question: 'Stres seviyen nasıldı? (1-10)',
        type: 'scale',
        required: true,
        order: 10,
      },
    ];
  };

  // Create journal entry
  const createJournalEntry = async (
    entryData: Partial<JournalEntry>
  ): Promise<JournalEntry | null> => {
    try {
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}-${Math.random()}`,
        date: new Date(),
        mood: 'neutral',
        energy: 5,
        focus: 5,
        productivity: 5,
        stress: 5,
        satisfaction: 5,
        reflection: '',
        achievements: [],
        challenges: [],
        lessons: [],
        goals: [],
        gratitude: [],
        insights: [],
        tags: [],
        activities: [],
        pomodorosCompleted: completedPomodoros.length,
        tasksCompleted: (tasks || []).filter(task => task.status === 'completed')
          .length,
        interruptions: 0,
        breaks: 0,
        focusTime: 0,
        breakTime: 0,
        totalTime: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...entryData,
      };

      setEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      console.error('Create journal entry error:', err);
      return null;
    }
  };

  // Update journal entry
  const updateJournalEntry = async (
    entryId: string,
    updates: Partial<JournalEntry>
  ): Promise<boolean> => {
    try {
      setEntries(prev =>
        prev.map(entry =>
          entry.id === entryId
            ? { ...entry, ...updates, updatedAt: new Date() }
            : entry
        )
      );
      return true;
    } catch (err) {
      console.error('Update journal entry error:', err);
      return false;
    }
  };

  // Delete journal entry
  const deleteJournalEntry = async (entryId: string): Promise<boolean> => {
    try {
      setEntries(prev => (prev || []).filter(entry => entry.id !== entryId));
      return true;
    } catch (err) {
      console.error('Delete journal entry error:', err);
      return false;
    }
  };

  // Get journal entry by date
  const getJournalEntryByDate = (date: Date): JournalEntry | null => {
    const dateStr = date.toDateString();
    return entries.find(entry => entry.date.toDateString() === dateStr) || null;
  };

  // Get journal insights
  const getJournalInsights = () => {
    const totalEntries = entries.length;
    const averageMood =
      entries.reduce((sum, entry) => {
        const moodValues = {
          excellent: 5,
          good: 4,
          neutral: 3,
          poor: 2,
          terrible: 1,
        };
        return sum + moodValues[entry.mood];
      }, 0) / totalEntries || 0;

    const averageEnergy =
      entries.reduce((sum, entry) => sum + entry.energy, 0) / totalEntries || 0;
    const averageFocus =
      entries.reduce((sum, entry) => sum + entry.focus, 0) / totalEntries || 0;
    const averageProductivity =
      entries.reduce((sum, entry) => sum + entry.productivity, 0) /
        totalEntries || 0;
    const averageStress =
      entries.reduce((sum, entry) => sum + entry.stress, 0) / totalEntries || 0;
    const averageSatisfaction =
      entries.reduce((sum, entry) => sum + entry.satisfaction, 0) /
        totalEntries || 0;

    const totalPomodoros = entries.reduce(
      (sum, entry) => sum + entry.pomodorosCompleted,
      0
    );
    const totalTasks = entries.reduce(
      (sum, entry) => sum + entry.tasksCompleted,
      0
    );
    const totalFocusTime = entries.reduce(
      (sum, entry) => sum + entry.focusTime,
      0
    );
    const totalBreakTime = entries.reduce(
      (sum, entry) => sum + entry.breakTime,
      0
    );

    const moodTrend = entries.slice(-7).map(entry => {
      const moodValues = {
        excellent: 5,
        good: 4,
        neutral: 3,
        poor: 2,
        terrible: 1,
      };
      return moodValues[entry.mood];
    });

    const energyTrend = entries.slice(-7).map(entry => entry.energy);
    const focusTrend = entries.slice(-7).map(entry => entry.focus);
    const productivityTrend = entries
      .slice(-7)
      .map(entry => entry.productivity);

    return {
      totalEntries,
      averageMood,
      averageEnergy,
      averageFocus,
      averageProductivity,
      averageStress,
      averageSatisfaction,
      totalPomodoros,
      totalTasks,
      totalFocusTime,
      totalBreakTime,
      moodTrend,
      energyTrend,
      focusTrend,
      productivityTrend,
      journalEnabled: settings.enableReflectJournal,
    };
  };

  // Export journal data
  const exportJournalData = async (
    format: 'json' | 'csv' | 'pdf'
  ): Promise<string | null> => {
    try {
      if (format === 'json') {
        return JSON.stringify(entries, null, 2);
      } else if (format === 'csv') {
        const csvHeaders = [
          'Date',
          'Mood',
          'Energy',
          'Focus',
          'Productivity',
          'Stress',
          'Satisfaction',
          'Reflection',
          'Achievements',
          'Challenges',
          'Lessons',
          'Goals',
          'Gratitude',
          'Insights',
          'Tags',
          'Activities',
          'Pomodoros',
          'Tasks',
          'Interruptions',
          'Breaks',
          'Focus Time',
          'Break Time',
          'Total Time',
        ];

        const csvRows = entries.map(entry => [
          entry.date.toISOString(),
          entry.mood,
          entry.energy,
          entry.focus,
          entry.productivity,
          entry.stress,
          entry.satisfaction,
          entry.reflection,
          entry.achievements.join(';'),
          entry.challenges.join(';'),
          entry.lessons.join(';'),
          entry.goals.join(';'),
          entry.gratitude.join(';'),
          entry.insights.join(';'),
          entry.tags.join(';'),
          entry.activities.join(';'),
          entry.pomodorosCompleted,
          entry.tasksCompleted,
          entry.interruptions,
          entry.breaks,
          entry.focusTime,
          entry.breakTime,
          entry.totalTime,
        ]);

        return [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');
      }

      return null;
    } catch (err) {
      console.error('Export journal data error:', err);
      return null;
    }
  };

  // Import journal data
  const importJournalData = async (
    data: string,
    format: 'json' | 'csv'
  ): Promise<boolean> => {
    try {
      if (format === 'json') {
        const importedEntries = JSON.parse(data);
        setEntries(prev => [...prev, ...importedEntries]);
        return true;
      } else if (format === 'csv') {
        // CSV parsing logic would go here
        return true;
      }

      return false;
    } catch (err) {
      console.error('Import journal data error:', err);
      return false;
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<JournalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Initialize journal
  useEffect(() => {
    if (settings.enableReflectJournal && prompts.length === 0) {
      const defaultPrompts = generateDefaultPrompts();
      setPrompts(defaultPrompts);
    }
  }, [settings.enableReflectJournal]);

  return {
    entries,
    prompts,
    settings,
    loading,
    error,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getJournalEntryByDate,
    getJournalInsights,
    exportJournalData,
    importJournalData,
    updateSettings,
  };
};
