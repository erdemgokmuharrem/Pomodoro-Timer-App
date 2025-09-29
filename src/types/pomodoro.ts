import {
  Priority,
  InterruptionReason,
  PomodoroStatus,
  BreakType,
} from './common';

// Task interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  priority: Priority;
  tags: string[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interruption interface
export interface Interruption {
  id: string;
  sessionId: string;
  timestamp: Date;
  reason: InterruptionReason;
  description?: string;
  duration: number; // in seconds
}

// Pomodoro session interface
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

// Pomodoro settings interface
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

// Pomodoro state interface
export interface PomodoroState {
  // Current session
  currentSession: PomodoroSession | null;
  isRunning: boolean;
  timeLeft: number; // in seconds
  isBreak: boolean;
  status: PomodoroStatus;

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
}

// Pomodoro actions interface
export interface PomodoroActions {
  // Timer actions
  startPomodoro: (taskId?: string) => void;
  pausePomodoro: () => void;
  stopPomodoro: () => void;
  completePomodoro: () => void;
  startBreak: (isLongBreak?: boolean) => void;
  completeBreak: () => void;
  tick: () => void;
  resetTimer: () => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;

  // Settings actions
  updateSettings: (settings: Partial<PomodoroSettings>) => void;

  // Interruption actions
  addInterruption: (
    sessionId: string,
    reason: InterruptionReason,
    description?: string
  ) => void;
  removeInterruption: (interruptionId: string) => void;
}

// Timer hook return type
export interface UsePomodoroTimerReturn {
  // State
  isRunning: boolean;
  timeLeft: number;
  isBreak: boolean;
  currentSession: PomodoroSession | null;
  formattedTime: string;
  progress: number;
  statusText: string;
  backgroundColor: string;

  // Actions
  start: (taskId?: string) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  startBreak: (isLongBreak?: boolean) => Promise<void>;

  // Utils
  formatTime: (seconds: number) => string;
  getProgress: () => number;
}
