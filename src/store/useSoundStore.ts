import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SoundOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'nature' | 'ambient' | 'focus' | 'white_noise';
  file?: string; // For future audio file support
}

export interface SoundSettings {
  backgroundSound: SoundOption | null;
  backgroundVolume: number; // 0-1
  soundEffectsEnabled: boolean;
  backgroundSoundEnabled: boolean;
}

interface SoundState {
  settings: SoundSettings;
  availableSounds: SoundOption[];
  
  // Actions
  setBackgroundSound: (sound: SoundOption | null) => void;
  setBackgroundVolume: (volume: number) => void;
  toggleSoundEffects: () => void;
  toggleBackgroundSound: () => void;
  updateSettings: (settings: Partial<SoundSettings>) => void;
}

const defaultSounds: SoundOption[] = [
  // Nature Sounds
  {
    id: 'rain',
    name: 'Yağmur',
    description: 'Rahatlatıcı yağmur sesi',
    emoji: '🌧️',
    category: 'nature',
  },
  {
    id: 'ocean',
    name: 'Okyanus',
    description: 'Dalga sesleri',
    emoji: '🌊',
    category: 'nature',
  },
  {
    id: 'forest',
    name: 'Orman',
    description: 'Kuş sesleri ve doğa',
    emoji: '🌲',
    category: 'nature',
  },
  {
    id: 'thunder',
    name: 'Gök Gürültüsü',
    description: 'Uzak gök gürültüsü',
    emoji: '⛈️',
    category: 'nature',
  },
  
  // Ambient Sounds
  {
    id: 'cafe',
    name: 'Kafe',
    description: 'Kafe ortamı sesleri',
    emoji: '☕',
    category: 'ambient',
  },
  {
    id: 'library',
    name: 'Kütüphane',
    description: 'Sessiz kütüphane ortamı',
    emoji: '📚',
    category: 'ambient',
  },
  {
    id: 'fireplace',
    name: 'Şömine',
    description: 'Şömine çıtırtısı',
    emoji: '🔥',
    category: 'ambient',
  },
  
  // Focus Sounds
  {
    id: 'alpha_waves',
    name: 'Alpha Dalgaları',
    description: '8-12 Hz alpha dalgaları',
    emoji: '🧠',
    category: 'focus',
  },
  {
    id: 'beta_waves',
    name: 'Beta Dalgaları',
    description: '13-30 Hz beta dalgaları',
    emoji: '⚡',
    category: 'focus',
  },
  {
    id: 'theta_waves',
    name: 'Theta Dalgaları',
    description: '4-8 Hz theta dalgaları',
    emoji: '🌙',
    category: 'focus',
  },
  
  // White Noise
  {
    id: 'white_noise',
    name: 'Beyaz Gürültü',
    description: 'Klasik beyaz gürültü',
    emoji: '📻',
    category: 'white_noise',
  },
  {
    id: 'pink_noise',
    name: 'Pembe Gürültü',
    description: 'Daha yumuşak gürültü',
    emoji: '🌸',
    category: 'white_noise',
  },
  {
    id: 'brown_noise',
    name: 'Kahverengi Gürültü',
    description: 'En derin gürültü',
    emoji: '🤎',
    category: 'white_noise',
  },
];

const defaultSettings: SoundSettings = {
  backgroundSound: null,
  backgroundVolume: 0.3,
  soundEffectsEnabled: true,
  backgroundSoundEnabled: false,
};

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      availableSounds: defaultSounds,

      setBackgroundSound: (sound) => {
        const currentSettings = get().settings || defaultSettings;
        set({
          settings: {
            ...currentSettings,
            backgroundSound: sound,
          },
        });
      },

      setBackgroundVolume: (volume) => {
        const currentSettings = get().settings || defaultSettings;
        set({
          settings: {
            ...currentSettings,
            backgroundVolume: Math.max(0, Math.min(1, volume)),
          },
        });
      },

      toggleSoundEffects: () => {
        const currentSettings = get().settings || defaultSettings;
        set({
          settings: {
            ...currentSettings,
            soundEffectsEnabled: !currentSettings.soundEffectsEnabled,
          },
        });
      },

      toggleBackgroundSound: () => {
        const currentSettings = get().settings || defaultSettings;
        set({
          settings: {
            ...currentSettings,
            backgroundSoundEnabled: !currentSettings.backgroundSoundEnabled,
          },
        });
      },

      updateSettings: (newSettings) => {
        const currentSettings = get().settings || defaultSettings;
        set({
          settings: {
            ...currentSettings,
            ...newSettings,
          },
        });
      },
    }),
    {
      name: 'sound-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
