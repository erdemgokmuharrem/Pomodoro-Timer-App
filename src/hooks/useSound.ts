import { useEffect } from 'react';
import { soundService } from '../services/soundService';
import { usePomodoroStore } from '../store/usePomodoroStore';

export const useSound = () => {
  const { settings } = usePomodoroStore();

  useEffect(() => {
    // Initialize sound service
    const initializeSound = async () => {
      await soundService.initialize();
      await soundService.loadSounds();
    };

    initializeSound();

    // Set sound enabled state based on settings
    soundService.setEnabled(settings.soundEnabled);

    return () => {
      // Cleanup on unmount
      soundService.unloadSounds();
    };
  }, [settings.soundEnabled]);

  const playPomodoroComplete = async () => {
    if (settings.soundEnabled) {
      await soundService.playPomodoroCompletePattern();
    }
  };

  const playBreakComplete = async () => {
    if (settings.soundEnabled) {
      await soundService.playBreakCompletePattern();
    }
  };

  const playTick = async () => {
    if (settings.soundEnabled) {
      await soundService.playTick();
    }
  };

  const playStart = async () => {
    if (settings.soundEnabled) {
      await soundService.playStart();
    }
  };

  const playPause = async () => {
    if (settings.soundEnabled) {
      await soundService.playPause();
    }
  };

  const setVolume = async (volume: number) => {
    await soundService.setVolume(volume);
  };

  return {
    playPomodoroComplete,
    playBreakComplete,
    playTick,
    playStart,
    playPause,
    setVolume,
    isEnabled: settings.soundEnabled,
  };
};
