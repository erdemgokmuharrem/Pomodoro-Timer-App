import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from './usePomodoroStore';

export interface AutoRescheduleSettings {
  enabled: boolean;
  autoStartNextTask: boolean;
  autoStartBreak: boolean;
  breakBeforeNextTask: boolean;
  priorityBased: boolean; // Yüksek öncelikli görevleri öncele
  energyBased: boolean; // Enerji seviyesine göre görev seçimi
  maxConsecutivePomodoros: number; // Maksimum ardışık pomodoro sayısı
}

export interface EnergyLevel {
  level: 'low' | 'medium' | 'high';
  timestamp: Date;
  factors: {
    timeOfDay: number; // 0-1, sabah yüksek, akşam düşük
    recentActivity: number; // 0-1, son aktivitelere göre
    breakQuality: number; // 0-1, son molanın kalitesi
  };
}

interface AutoRescheduleState {
  settings: AutoRescheduleSettings;
  energyLevel: EnergyLevel;
  consecutivePomodoros: number;
  lastBreakTime: Date | null;
  
  // Actions
  updateSettings: (settings: Partial<AutoRescheduleSettings>) => void;
  updateEnergyLevel: (level: EnergyLevel) => void;
  incrementConsecutivePomodoros: () => void;
  resetConsecutivePomodoros: () => void;
  setLastBreakTime: (time: Date) => void;
  
  // Auto-reschedule logic
  getNextTask: (availableTasks: Task[]) => Task | null;
  shouldStartBreak: () => boolean;
  shouldStartNextTask: () => boolean;
  calculateEnergyLevel: () => EnergyLevel;
}

const defaultSettings: AutoRescheduleSettings = {
  enabled: true,
  autoStartNextTask: true,
  autoStartBreak: false,
  breakBeforeNextTask: true,
  priorityBased: true,
  energyBased: true,
  maxConsecutivePomodoros: 4,
};

const defaultEnergyLevel: EnergyLevel = {
  level: 'medium',
  timestamp: new Date(),
  factors: {
    timeOfDay: 0.7,
    recentActivity: 0.5,
    breakQuality: 0.5,
  },
};

export const useAutoRescheduleStore = create<AutoRescheduleState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      energyLevel: defaultEnergyLevel,
      consecutivePomodoros: 0,
      lastBreakTime: null,

      updateSettings: (newSettings) => {
        set({
          settings: { ...get().settings, ...newSettings },
        });
      },

      updateEnergyLevel: (level) => {
        set({ energyLevel: level });
      },

      incrementConsecutivePomodoros: () => {
        set({ consecutivePomodoros: get().consecutivePomodoros + 1 });
      },

      resetConsecutivePomodoros: () => {
        set({ consecutivePomodoros: 0 });
      },

      setLastBreakTime: (time) => {
        set({ lastBreakTime: time });
      },

      getNextTask: (availableTasks: Task[]) => {
        const state = get();
        if (!state.settings.enabled || availableTasks.length === 0) {
          return null;
        }

        let filteredTasks = availableTasks.filter(task => !task.isCompleted);

        if (filteredTasks.length === 0) {
          return null;
        }

        // Priority-based selection
        if (state.settings.priorityBased) {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          filteredTasks.sort((a, b) => 
            priorityOrder[b.priority] - priorityOrder[a.priority]
          );
        }

        // Energy-based selection
        if (state.settings.energyBased) {
          const energyLevel = state.energyLevel.level;
          
          if (energyLevel === 'low') {
            // Düşük enerjide kolay görevleri öncele
            filteredTasks = filteredTasks.filter(task => 
              task.estimatedPomodoros <= 2
            );
          } else if (energyLevel === 'high') {
            // Yüksek enerjide zor görevleri öncele
            filteredTasks = filteredTasks.filter(task => 
              task.estimatedPomodoros >= 3
            );
          }
        }

        return filteredTasks[0] || null;
      },

      shouldStartBreak: () => {
        const state = get();
        return state.settings.enabled && 
               state.settings.autoStartBreak &&
               state.consecutivePomodoros >= state.settings.maxConsecutivePomodoros;
      },

      shouldStartNextTask: () => {
        const state = get();
        return state.settings.enabled && 
               state.settings.autoStartNextTask &&
               !state.shouldStartBreak();
      },

      calculateEnergyLevel: () => {
        const now = new Date();
        const hour = now.getHours();
        
        // Time of day factor (sabah yüksek, öğleden sonra düşük, akşam orta)
        let timeOfDay = 0.5;
        if (hour >= 6 && hour <= 10) timeOfDay = 0.9; // Sabah
        else if (hour >= 11 && hour <= 14) timeOfDay = 0.7; // Öğle
        else if (hour >= 15 && hour <= 18) timeOfDay = 0.4; // Öğleden sonra
        else if (hour >= 19 && hour <= 22) timeOfDay = 0.6; // Akşam
        else timeOfDay = 0.3; // Gece

        // Recent activity factor (son pomodoro sayısına göre)
        const state = get();
        const recentActivity = Math.max(0, 1 - (state.consecutivePomodoros * 0.2));

        // Break quality factor (son molanın kalitesi)
        let breakQuality = 0.5;
        if (state.lastBreakTime) {
          const breakDuration = now.getTime() - state.lastBreakTime.getTime();
          const breakMinutes = breakDuration / (1000 * 60);
          
          if (breakMinutes >= 15) breakQuality = 0.9; // Uzun mola
          else if (breakMinutes >= 5) breakQuality = 0.7; // Normal mola
          else breakQuality = 0.3; // Kısa mola
        }

        // Overall energy level calculation
        const overallScore = (timeOfDay + recentActivity + breakQuality) / 3;
        
        let level: 'low' | 'medium' | 'high';
        if (overallScore >= 0.7) level = 'high';
        else if (overallScore >= 0.4) level = 'medium';
        else level = 'low';

        const newEnergyLevel: EnergyLevel = {
          level,
          timestamp: now,
          factors: {
            timeOfDay,
            recentActivity,
            breakQuality,
          },
        };

        set({ energyLevel: newEnergyLevel });
        return newEnergyLevel;
      },
    }),
    {
      name: 'auto-reschedule-storage',
      partialize: (state) => ({
        settings: state.settings,
        energyLevel: state.energyLevel,
        consecutivePomodoros: state.consecutivePomodoros,
        lastBreakTime: state.lastBreakTime,
      }),
    }
  )
);
