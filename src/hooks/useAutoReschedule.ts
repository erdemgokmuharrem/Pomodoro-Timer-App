import { useEffect, useCallback } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useAutoRescheduleStore } from '../store/useAutoRescheduleStore';
import { useGamificationStore } from '../store/useGamificationStore';

export const useAutoReschedule = () => {
  const {
    currentSession,
    isRunning,
    isBreak,
    tasks,
    currentTask,
    completePomodoro,
    startPomodoro,
    startBreak,
    completeBreak,
  } = usePomodoroStore();

  const {
    settings,
    energyLevel,
    consecutivePomodoros,
    getNextTask,
    shouldStartBreak,
    shouldStartNextTask,
    calculateEnergyLevel,
    incrementConsecutivePomodoros,
    resetConsecutivePomodoros,
    setLastBreakTime,
    updateEnergyLevel,
  } = useAutoRescheduleStore();

  const { addXp, checkBadges } = useGamificationStore();

  // Pomodoro tamamlandığında otomatik işlemler
  const handlePomodoroComplete = useCallback(() => {
    if (!settings.enabled) return;

    // Enerji seviyesini güncelle
    const newEnergyLevel = calculateEnergyLevel();
    updateEnergyLevel(newEnergyLevel);

    // Ardışık pomodoro sayısını artır
    incrementConsecutivePomodoros();

    // XP kazan
    addXp(25, 'pomodoro_completed');

    // Rozet kontrolü
    checkBadges();

    // Mola gerekli mi kontrol et
    if (shouldStartBreak()) {
      const isLongBreak =
        consecutivePomodoros >= settings.maxConsecutivePomodoros;
      startBreak(isLongBreak);
      resetConsecutivePomodoros();
      setLastBreakTime(new Date());
      return;
    }

    // Sonraki görevi başlat
    if (shouldStartNextTask()) {
      if (!tasks) return;
      const availableTasks = tasks.filter(task => !task.isCompleted);
      const nextTask = getNextTask(availableTasks);

      if (nextTask) {
        // Kısa bir gecikme ile sonraki görevi başlat
        setTimeout(() => {
          startPomodoro(nextTask.id);
        }, 2000); // 2 saniye gecikme
      }
    }
  }, [
    settings,
    consecutivePomodoros,
    tasks,
    getNextTask,
    shouldStartBreak,
    shouldStartNextTask,
    calculateEnergyLevel,
    updateEnergyLevel,
    incrementConsecutivePomodoros,
    resetConsecutivePomodoros,
    setLastBreakTime,
    addXp,
    checkBadges,
    startPomodoro,
    startBreak,
  ]);

  // Mola tamamlandığında otomatik işlemler
  const handleBreakComplete = useCallback(() => {
    if (!settings.enabled) return;

    // Enerji seviyesini güncelle
    const newEnergyLevel = calculateEnergyLevel();
    updateEnergyLevel(newEnergyLevel);

    // Sonraki görevi başlat
    if (shouldStartNextTask()) {
      if (!tasks) return;
      const availableTasks = tasks.filter(task => !task.isCompleted);
      const nextTask = getNextTask(availableTasks);

      if (nextTask) {
        setTimeout(() => {
          startPomodoro(nextTask.id);
        }, 1000); // 1 saniye gecikme
      }
    }
  }, [
    settings,
    tasks,
    getNextTask,
    shouldStartNextTask,
    calculateEnergyLevel,
    updateEnergyLevel,
    startPomodoro,
  ]);

  // Timer tamamlandığında otomatik işlemleri tetikle
  useEffect(() => {
    if (!isRunning && currentSession && !isBreak) {
      // Pomodoro tamamlandı
      handlePomodoroComplete();
    } else if (!isRunning && isBreak) {
      // Mola tamamlandı
      handleBreakComplete();
    }
  }, [
    isRunning,
    currentSession,
    isBreak,
    handlePomodoroComplete,
    handleBreakComplete,
  ]);

  // Enerji seviyesine göre öneriler
  const getEnergyRecommendations = useCallback(() => {
    const recommendations = [];

    if (energyLevel.level === 'low') {
      recommendations.push({
        type: 'break',
        message: 'Düşük enerji seviyesi. Kısa bir mola almanızı öneriyoruz.',
        action: 'startBreak',
      });
      recommendations.push({
        type: 'task',
        message: 'Kolay görevlerle başlayın (1-2 pomodoro).',
        action: 'filterEasyTasks',
      });
    } else if (energyLevel.level === 'high') {
      recommendations.push({
        type: 'task',
        message: 'Yüksek enerji! Zor görevlerle devam edebilirsiniz.',
        action: 'filterHardTasks',
      });
      recommendations.push({
        type: 'focus',
        message: 'Odaklanma için sessiz bir ortam seçin.',
        action: 'enableFocusMode',
      });
    } else {
      recommendations.push({
        type: 'balanced',
        message:
          'Dengeli enerji seviyesi. Her türlü görevle devam edebilirsiniz.',
        action: 'continue',
      });
    }

    return recommendations;
  }, [energyLevel]);

  // Akıllı görev önerileri
  const getSmartTaskSuggestions = useCallback(() => {
    if (!tasks) return { tasks: [], message: 'Görev bulunamadı' };
    const availableTasks = tasks.filter(task => !task.isCompleted);

    if (availableTasks.length === 0) {
      return {
        message: 'Tüm görevler tamamlandı! 🎉',
        suggestions: [],
      };
    }

    const nextTask = getNextTask(availableTasks);
    const suggestions = [];

    if (nextTask) {
      suggestions.push({
        task: nextTask,
        reason: 'Öncelik sırasına göre önerilen',
        energyMatch:
          energyLevel.level === 'high'
            ? nextTask.estimatedPomodoros >= 3
            : true,
      });
    }

    // Enerji seviyesine göre alternatif öneriler
    if (energyLevel.level === 'low') {
      const easyTasks = availableTasks.filter(
        task => task.estimatedPomodoros <= 2
      );
      if (easyTasks.length > 0) {
        suggestions.push({
          task: easyTasks[0],
          reason: 'Düşük enerji için kolay görev',
          energyMatch: true,
        });
      }
    }

    return {
      message: `Sonraki önerilen görev: ${nextTask?.title || 'Yok'}`,
      suggestions,
    };
  }, [tasks, getNextTask, energyLevel]);

  return {
    settings,
    energyLevel,
    consecutivePomodoros,
    getEnergyRecommendations,
    getSmartTaskSuggestions,
    handlePomodoroComplete,
    handleBreakComplete,
  };
};
