import { useRef, useEffect } from 'react';
import { AudioPlayer, useAudioPlayer } from 'expo-audio';
import { useSoundStore } from '../store/useSoundStore';

export const useSound = () => {
  const soundRef = useRef<AudioPlayer | null>(null);
  const { settings } = useSoundStore();

  const playSound = async (soundFile: string) => {
    try { 
      if (soundRef.current) {
        soundRef.current.remove();
      }

      const player = new AudioPlayer(soundFile);
      soundRef.current = player;
      
      await player.play();
      
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          player.remove();
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playPomodoroComplete = async () => {
    if (settings.soundEffectsEnabled) {
      console.log('🔔 Pomodoro complete sound');
    }
  };

  const playBreakComplete = async () => {
    console.log('🔔 Break complete sound');
  };

  const playTick = async () => {
    console.log('⏰ Tick sound');
  };

  const playStart = async () => {
    console.log('▶️ Start sound');
  };

  const playPause = async () => {
    console.log('⏸️ Pause sound');
  };

  const playStop = async () => {
    console.log('⏹️ Stop sound');
  };

  return {
    playSound,
    playPomodoroComplete,
    playBreakComplete,
    playTick,
    playStart,
    playPause,
    playStop,
  };
};