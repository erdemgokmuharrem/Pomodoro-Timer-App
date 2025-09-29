import { Audio } from 'expo-av';

export type SoundType =
  | 'pomodoro_complete'
  | 'break_complete'
  | 'tick'
  | 'start'
  | 'pause';

class SoundService {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set audio mode for better performance
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log('Sound service initialized');
    } catch (error) {
      console.error('Error initializing sound service:', error);
    }
  }

  async loadSounds(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Load different sound types
      // Note: In a real app, you would have actual sound files
      // For now, we'll use system sounds or create simple beeps

      const soundConfigs = [
        { type: 'pomodoro_complete' as SoundType, uri: 'default' },
        { type: 'break_complete' as SoundType, uri: 'default' },
        { type: 'tick' as SoundType, uri: 'default' },
        { type: 'start' as SoundType, uri: 'default' },
        { type: 'pause' as SoundType, uri: 'default' },
      ];

      for (const config of soundConfigs) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: config.uri },
            { shouldPlay: false, isLooping: false }
          );
          this.sounds.set(config.type, sound);
        } catch (error) {
          console.warn(`Could not load sound for ${config.type}:`, error);
        }
      }

      console.log('Sounds loaded successfully');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  }

  async playSound(type: SoundType): Promise<void> {
    if (!this.isEnabled || !this.isInitialized) return;

    try {
      const sound = this.sounds.get(type);
      if (sound) {
        await sound.replayAsync();
      } else {
        // Fallback to system sound
        await this.playSystemSound(type);
      }
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
      // Don't throw error for sound failures, just log them
      // Sound failures shouldn't break the app
    }
  }

  private async playSystemSound(type: SoundType): Promise<void> {
    try {
      // Use system notification sound as fallback
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'default' },
        { shouldPlay: true, isLooping: false }
      );

      // Clean up after playing
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing system sound:', error);
    }
  }

  async playPomodoroComplete(): Promise<void> {
    await this.playSound('pomodoro_complete');
  }

  async playBreakComplete(): Promise<void> {
    await this.playSound('break_complete');
  }

  async playTick(): Promise<void> {
    await this.playSound('tick');
  }

  async playStart(): Promise<void> {
    await this.playSound('start');
  }

  async playPause(): Promise<void> {
    await this.playSound('pause');
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  async unloadSounds(): Promise<void> {
    try {
      for (const [type, sound] of this.sounds) {
        await sound.unloadAsync();
      }
      this.sounds.clear();
      console.log('Sounds unloaded');
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  }

  // Create custom sound patterns for different events
  async playPomodoroCompletePattern(): Promise<void> {
    if (!this.isEnabled) return;

    // Play a sequence of sounds for pomodoro completion
    await this.playSound('pomodoro_complete');
    setTimeout(() => this.playSound('pomodoro_complete'), 500);
    setTimeout(() => this.playSound('pomodoro_complete'), 1000);
  }

  async playBreakCompletePattern(): Promise<void> {
    if (!this.isEnabled) return;

    // Play a different pattern for break completion
    await this.playSound('break_complete');
    setTimeout(() => this.playSound('break_complete'), 300);
  }

  // Volume control
  async setVolume(volume: number): Promise<void> {
    try {
      for (const [type, sound] of this.sounds) {
        await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }
}

export const soundService = new SoundService();
