// Ortak tip tanımları
export type ThemeMode = 'light' | 'dark' | 'system';

export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed';

export type BreakType = 'short' | 'long';

export type InterruptionReason =
  | 'phone'
  | 'email'
  | 'social'
  | 'other'
  | 'urgent';

export type SoundType =
  | 'pomodoro_complete'
  | 'break_complete'
  | 'tick'
  | 'start'
  | 'pause';

export type ExportFormat = 'json' | 'csv' | 'excel';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type BadgeCategory = 'daily' | 'weekly' | 'monthly' | 'special';

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event types
export interface BaseEvent {
  id: string;
  timestamp: Date;
  type: string;
}

export interface PomodoroEvent extends BaseEvent {
  type:
    | 'pomodoro_start'
    | 'pomodoro_complete'
    | 'pomodoro_pause'
    | 'pomodoro_stop';
  sessionId: string;
  taskId?: string;
}

export interface BreakEvent extends BaseEvent {
  type: 'break_start' | 'break_complete';
  breakType: BreakType;
  duration: number;
}

export interface InterruptionEvent extends BaseEvent {
  type: 'interruption';
  sessionId: string;
  reason: InterruptionReason;
  description?: string;
  duration: number;
}
