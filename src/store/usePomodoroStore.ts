import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useOfflineStore } from './useOfflineStore';

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interruption {
  id: string;
  sessionId: string;
  timestamp: Date;
  reason: 'phone' | 'email' | 'social' | 'other' | 'urgent';
  description?: string;
  duration: number; // in seconds
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  isCompleted: boolean;
  isBreak: boolean;
  interruptions: number;
  interruptionList: Interruption[];
}

export interface PomodoroSettings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  longBreakInterval: number; // pomodoros between long breaks
}

interface PomodoroState {
  // Current session
  currentSession: PomodoroSession | null;
  isRunning: boolean;
  timeLeft: number; // in seconds
  isBreak: boolean;

  // Tasks
  tasks: Task[];
  currentTask: Task | null;

  // Settings
  settings: PomodoroSettings;

  // Statistics
  sessions: PomodoroSession[];
  dailyGoal: number; // pomodoros per day
  currentStreak: number;
  longestStreak: number;

  // Actions
  startPomodoro: (taskId?: string) => void;
  pausePomodoro: () => void;
  stopPomodoro: () => void;
  completePomodoro: () => void;
  startBreak: (isLongBreak?: boolean) => void;
  completeBreak: () => void;

  // Interruption actions
  addInterruption: (
    sessionId: string,
    reason: Interruption['reason'],
    description?: string
  ) => void;
  removeInterruption: (interruptionId: string) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;

  // Settings actions
  updateSettings: (settings: Partial<PomodoroSettings>) => void;

  // Timer actions
  tick: () => void;
  resetTimer: () => void;
}

const defaultSettings: PomodoroSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
  longBreakInterval: 4,
};

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      isRunning: false,
      timeLeft: defaultSettings.pomodoroDuration * 60,
      isBreak: false,
      tasks: [],
      currentTask: null,
      settings: defaultSettings,
      sessions: [],
      dailyGoal: 6,
      currentStreak: 0,
      longestStreak: 0,

      // Timer actions
      startPomodoro: (taskId?: string) => {
        const state = get();
        const task = taskId ? state.tasks.find(t => t.id === taskId) : null;

        const session: PomodoroSession = {
          id: Date.now().toString(),
          taskId,
          startTime: new Date(),
          duration: state.settings.pomodoroDuration,
          isCompleted: false,
          isBreak: false,
          interruptions: 0,
          interruptionList: [],
        };

        set({
          currentSession: session,
          isRunning: true,
          timeLeft: state.settings.pomodoroDuration * 60,
          isBreak: false,
          currentTask: task || null,
        });
      },

      pausePomodoro: () => {
        set({ isRunning: false });
      },

      stopPomodoro: () => {
        set({
          currentSession: null,
          isRunning: false,
          currentTask: null,
        });
      },

      completePomodoro: () => {
        const state = get();
        if (!state.currentSession) return;

        const completedSession: PomodoroSession = {
          ...state.currentSession,
          endTime: new Date(),
          isCompleted: true,
        };

        // Update task if exists
        if (state.currentTask) {
          const updatedTask = {
            ...state.currentTask,
            completedPomodoros: state.currentTask.completedPomodoros + 1,
            updatedAt: new Date(),
          };

          set({
            tasks: state.tasks.map(t =>
              t.id === updatedTask.id ? updatedTask : t
            ),
            currentTask: updatedTask,
          });
        }

        set({
          sessions: [...state.sessions, completedSession],
          currentSession: null,
          isRunning: false,
        });
      },

      startBreak: (isLongBreak = false) => {
        const state = get();
        const breakDuration = isLongBreak
          ? state.settings.longBreakDuration
          : state.settings.shortBreakDuration;

        set({
          isBreak: true,
          timeLeft: breakDuration * 60,
          isRunning: true,
        });
      },

      completeBreak: () => {
        set({
          isBreak: false,
          isRunning: false,
        });
      },

      // Task actions
      addTask: taskData => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({
          tasks: [...get().tasks, newTask],
        });

        // Add to offline sync queue
        useOfflineStore.getState().addToSyncQueue({
          type: 'CREATE_TASK',
          payload: newTask,
          maxRetries: 3,
        });
      },

      updateTask: (id, updates) => {
        const updatedTask = { ...updates, updatedAt: new Date() };
        set({
          tasks: get().tasks.map(task =>
            task.id === id ? { ...task, ...updatedTask } : task
          ),
        });

        // Add to offline sync queue
        useOfflineStore.getState().addToSyncQueue({
          type: 'UPDATE_TASK',
          payload: { id, updates: updatedTask },
          maxRetries: 3,
        });
      },

      deleteTask: id => {
        set({
          tasks: get().tasks.filter(task => task.id !== id),
        });

        // Add to offline sync queue
        useOfflineStore.getState().addToSyncQueue({
          type: 'DELETE_TASK',
          payload: { id },
          maxRetries: 3,
        });
      },

      setCurrentTask: task => {
        set({ currentTask: task });
      },

      // Settings actions
      updateSettings: newSettings => {
        set({
          settings: { ...get().settings, ...newSettings },
        });
      },

      // Timer tick
      tick: () => {
        const state = get();
        if (!state.isRunning || state.timeLeft <= 0) return;

        const newTimeLeft = state.timeLeft - 1;

        if (newTimeLeft <= 0) {
          // Timer finished
          if (state.isBreak) {
            state.completeBreak();
          } else {
            state.completePomodoro();
          }
        } else {
          set({ timeLeft: newTimeLeft });
        }
      },

      resetTimer: () => {
        const state = get();
        const duration = state.isBreak
          ? state.settings.longBreakDuration ||
            state.settings.shortBreakDuration
          : state.settings.pomodoroDuration;

        set({ timeLeft: duration * 60 });
      },

      // Interruption actions
      addInterruption: (
        sessionId: string,
        reason: Interruption['reason'],
        description?: string
      ) => {
        const state = get();
        const interruption: Interruption = {
          id: Date.now().toString(),
          sessionId,
          timestamp: new Date(),
          reason,
          description,
          duration: 0, // Will be calculated when interruption ends
        };

        // Update current session if it matches
        if (state.currentSession?.id === sessionId) {
          const updatedSession = {
            ...state.currentSession,
            interruptions: state.currentSession.interruptions + 1,
            interruptionList: [
              ...state.currentSession.interruptionList,
              interruption,
            ],
          };
          set({ currentSession: updatedSession });
        }

        // Update sessions array
        set({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  interruptions: session.interruptions + 1,
                  interruptionList: [...session.interruptionList, interruption],
                }
              : session
          ),
        });
      },

      removeInterruption: (interruptionId: string) => {
        const state = get();

        // Update current session if it has this interruption
        if (state.currentSession) {
          const updatedInterruptionList =
            state.currentSession.interruptionList.filter(
              i => i.id !== interruptionId
            );
          const updatedSession = {
            ...state.currentSession,
            interruptions: updatedInterruptionList.length,
            interruptionList: updatedInterruptionList,
          };
          set({ currentSession: updatedSession });
        }

        // Update sessions array
        set({
          sessions: state.sessions.map(session => {
            const updatedInterruptionList = session.interruptionList.filter(
              i => i.id !== interruptionId
            );
            return {
              ...session,
              interruptions: updatedInterruptionList.length,
              interruptionList: updatedInterruptionList,
            };
          }),
        });
      },
    }),
    {
      name: 'pomodoro-storage',
      partialize: state => ({
        tasks: state.tasks,
        settings: state.settings,
        sessions: state.sessions,
        dailyGoal: state.dailyGoal,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
      }),
    }
  )
);
