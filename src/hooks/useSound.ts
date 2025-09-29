import { useRef, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useSoundStore } from '../store/useSoundStore';

export const useSound = () => {
  const player = useAudioPlayer();
  const { settings } = useSoundStore();

  const playSound = async (soundFile: string) => {
    try {
      await player.loadAsync(soundFile);
      await player.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playPomodoroComplete = () => {
    if (settings.enabled) {
      playSound('pomodoro-complete.mp3');
    }
  };

  const playBreakComplete = () => {
    if (settings.enabled) {
      playSound('break-complete.mp3');
    }
  };

  const playTick = () => {
    if (settings.enabled) {
      playSound('tick.mp3');
    }
  };

  const playStart = () => {
    if (settings.enabled) {
      playSound('start.mp3');
    }
  };

  const playPause = () => {
    if (settings.enabled) {
      playSound('pause.mp3');
    }
  };

  const playBackgroundSound = async (soundFile: string) => {
    try {
      if (settings.backgroundSoundEnabled) {
        await player.loadAsync(soundFile);
        await player.setIsLoopingAsync(true);
        await player.play();
      }
    } catch (error) {
      console.error('Error playing background sound:', error);
    }
  };

  const stopBackgroundSound = async () => {
    try {
      await player.pauseAsync();
    } catch (error) {
      console.error('Error stopping background sound:', error);
    }
  };

  return {
    playPomodoroComplete,
    playBreakComplete,
    playTick,
    playStart,
    playPause,
    playBackgroundSound,
    stopBackgroundSound,
  };
};
