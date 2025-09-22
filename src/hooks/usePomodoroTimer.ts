import { useEffect, useRef } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useNotifications } from './useNotifications';
import { useSound } from './useSound';
import { useGamification } from './useGamification';

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

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      if (isBreak) {
        completeBreak();
        playBreakComplete();
      } else {
        completePomodoro();
        playPomodoroComplete();
        // Award XP for completing pomodoro
        awardPomodoroXp();
      }
    }
  }, [timeLeft, isRunning, isBreak, completeBreak, completePomodoro, playBreakComplete, playPomodoroComplete, awardPomodoroXp]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalTime = isBreak 
      ? (settings.longBreakDuration || settings.shortBreakDuration) * 60
      : settings.pomodoroDuration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const handleStart = async (taskId?: string) => {
    if (isBreak) {
      startBreak();
      // Schedule break notification
      await scheduleBreakNotification(settings.shortBreakDuration, false);
    } else {
      startPomodoro(taskId);
      // Schedule pomodoro notification
      await schedulePomodoroNotification(settings.pomodoroDuration, currentSession?.taskId);
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
    startBreak(isLongBreak);
    // Schedule break notification
    const duration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
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
