import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useNotifications } from './useNotifications';
import { useSound } from './useSound';
import { useGamification } from './useGamification';
import { useAutoReschedule } from './useAutoReschedule';

export const usePomodoroTimer = () => {
  const {
    isRunning,
    timeLeft,
    isBreak,
    currentSession,
    settings,
    tick,
    startPomodoro,
    pausePomodoro,
    stopPomodoro,
    completePomodoro,
    startBreak,
    completeBreak,
  } = usePomodoroStore();

  const {
    schedulePomodoroNotification,
    scheduleBreakNotification,
    cancelAllNotifications,
    sendLocalNotification,
  } = useNotifications();

  const {
    playPomodoroComplete,
    playBreakComplete,
    playTick,
    playStart,
    playPause,
  } = useSound();

  const { awardPomodoroXp, awardTaskXp } = useGamification();

  const {
    handlePomodoroComplete,
    handleBreakComplete,
    settings: autoRescheduleSettings,
  } = useAutoReschedule();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(async () => {
        tick();
        // Play tick sound every 10 seconds
        if (timeLeft % 10 === 0) {
          await playTick();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, tick, playTick]);

  // Handle timer completion with auto-reschedule
  useEffect(() => {
    if (timeLeft === 0 && !isRunning) {
      // Use setTimeout to avoid race conditions
      const timeoutId = setTimeout(() => {
        if (isBreak) {
          // Break completed - trigger auto-reschedule
          handleBreakComplete();
        } else {
          // Pomodoro completed - trigger auto-reschedule
          handlePomodoroComplete();
        }
      }, 100); // Small delay to ensure state is stable

      return () => clearTimeout(timeoutId);
    }
  }, [
    timeLeft,
    isRunning,
    isBreak,
    handlePomodoroComplete,
    handleBreakComplete,
  ]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      // Use setTimeout to avoid race conditions
      const timeoutId = setTimeout(async () => {
        if (isBreak) {
          completeBreak();
          await playBreakComplete();
        } else {
          completePomodoro();
          await playPomodoroComplete();
          // Award XP for completing pomodoro
          awardPomodoroXp();
        }
      }, 100); // Small delay to ensure state is stable

      return () => clearTimeout(timeoutId);
    }
  }, [
    timeLeft,
    isRunning,
    isBreak,
    completeBreak,
    completePomodoro,
    playBreakComplete,
    playPomodoroComplete,
    awardPomodoroXp,
  ]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!settings) return 0;
    const totalTime = isBreak
      ? (settings.longBreakDuration || settings.shortBreakDuration || 5) * 60
      : (settings.pomodoroDuration || 25) * 60;
    return totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  };

  const handleStart = async (taskId?: string) => {
    if (!settings) return;

    if (isBreak) {
      startBreak();
      // Schedule break notification
      await scheduleBreakNotification(settings.shortBreakDuration || 5, false);
    } else {
      startPomodoro(taskId);
      // Schedule pomodoro notification
      await schedulePomodoroNotification(
        settings.pomodoroDuration || 25,
        currentSession?.taskId
      );
    }
    // Play start sound
    await playStart();
  };

  const handlePause = async () => {
    pausePomodoro();
    // Play pause sound
    await playPause();
  };

  const handleStop = async () => {
    stopPomodoro();
    // Cancel all scheduled notifications
    await cancelAllNotifications();
  };

  const handleStartBreak = async (isLongBreak = false) => {
    if (!settings) return;

    startBreak(isLongBreak);
    // Schedule break notification
    const duration = isLongBreak
      ? settings.longBreakDuration || 15
      : settings.shortBreakDuration || 5;
    await scheduleBreakNotification(duration, isLongBreak);
  };

  const getStatusText = (): string => {
    if (isBreak) {
      return 'Mola Zamanı';
    }
    return 'Odaklanma Zamanı';
  };

  const getBackgroundColor = (): string => {
    if (isBreak) {
      return '#10B981'; // Green for break
    }
    return '#EF4444'; // Red for focus
  };

  return {
    // State
    isRunning,
    timeLeft,
    isBreak,
    currentSession,
    formattedTime: formatTime(timeLeft),
    progress: getProgress(),
    statusText: getStatusText(),
    backgroundColor: getBackgroundColor(),

    // Actions
    start: handleStart,
    pause: handlePause,
    stop: handleStop,
    startBreak: handleStartBreak,

    // Utils
    formatTime,
    getProgress,
  };
};
