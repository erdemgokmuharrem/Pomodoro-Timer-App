import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface Plant {
  id: string;
  name: string;
  type:
    | 'flower'
    | 'tree'
    | 'bush'
    | 'herb'
    | 'vegetable'
    | 'fruit'
    | 'succulent'
    | 'moss';
  species: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stage:
    | 'seed'
    | 'sprout'
    | 'young'
    | 'mature'
    | 'blooming'
    | 'fruiting'
    | 'ancient';
  level: number;
  experience: number;
  maxExperience: number;
  health: number;
  happiness: number;
  waterLevel: number;
  sunlightLevel: number;
  nutrients: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  emoji: string;
  description: string;
  careInstructions: string[];
  growthRequirements: {
    waterFrequency: number; // hours
    sunlightHours: number; // hours per day
    nutrientsRequired: number;
    temperatureRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
  };
  rewards: {
    xp: number;
    coins: number;
    items: string[];
    seeds: string[];
  };
  createdAt: Date;
  lastWatered?: Date;
  lastFertilized?: Date;
  lastHarvested?: Date;
  nextGrowthTime?: Date;
}

export interface Garden {
  id: string;
  name: string;
  theme:
    | 'forest'
    | 'desert'
    | 'tropical'
    | 'arctic'
    | 'mystical'
    | 'urban'
    | 'zen'
    | 'fairy';
  size: { width: number; height: number };
  plants: string[]; // Plant IDs
  decorations: string[]; // Decoration IDs
  weather:
    | 'sunny'
    | 'cloudy'
    | 'rainy'
    | 'snowy'
    | 'stormy'
    | 'foggy'
    | 'windy';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  temperature: number;
  humidity: number;
  lightLevel: number;
  musicEnabled: boolean;
  soundEffects: boolean;
  autoWatering: boolean;
  autoFertilizing: boolean;
  pestControl: boolean;
  level: number;
  experience: number;
  coins: number;
  gems: number;
  visitors: number;
  likes: number;
  shares: number;
  status: 'active' | 'maintenance' | 'locked';
  createdAt: Date;
  updatedAt: Date;
}

export interface Decoration {
  id: string;
  name: string;
  type:
    | 'fountain'
    | 'statue'
    | 'bench'
    | 'path'
    | 'fence'
    | 'light'
    | 'pond'
    | 'rock'
    | 'bridge'
    | 'gazebo';
  category: 'functional' | 'aesthetic' | 'interactive' | 'magical';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number;
  size: { width: number; height: number };
  position: { x: number; y: number };
  effects: {
    happinessBonus: number;
    growthBonus: number;
    coinBonus: number;
    xpBonus: number;
  };
  description: string;
  emoji: string;
  unlocked: boolean;
  purchased: boolean;
  placed: boolean;
}

export interface GardenEvent {
  id: string;
  type:
    | 'growth'
    | 'bloom'
    | 'harvest'
    | 'visitor'
    | 'weather'
    | 'pest'
    | 'celebration'
    | 'discovery';
  title: string;
  description: string;
  plantId?: string;
  rewards?: {
    xp: number;
    coins: number;
    items: string[];
  };
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface GardenSettings {
  enableVirtualGarden: boolean;
  autoWatering: boolean;
  autoFertilizing: boolean;
  pestControl: boolean;
  weatherEffects: boolean;
  soundEffects: boolean;
  musicEnabled: boolean;
  notifications: boolean;
  growthSpeed: number; // 1-5
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  theme:
    | 'forest'
    | 'desert'
    | 'tropical'
    | 'arctic'
    | 'mystical'
    | 'urban'
    | 'zen'
    | 'fairy';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
  temperature: number;
  humidity: number;
  lightLevel: number;
}

export const useVirtualGarden = () => {
  const { } = usePomodoroStore();
  const { } = useGamificationStore();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [events, setEvents] = useState<GardenEvent[]>([]);
  const [settings, setSettings] = useState<GardenSettings>({
    enableVirtualGarden: true,
    autoWatering: false,
    autoFertilizing: false,
    pestControl: true,
    weatherEffects: true,
    soundEffects: true,
    musicEnabled: false,
    notifications: true,
    growthSpeed: 3,
    difficulty: 'normal',
    theme: 'forest',
    season: 'spring',
    timeOfDay: 'morning',
    temperature: 22,
    humidity: 60,
    lightLevel: 80,
  });
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Generate starter plants
  const generateStarterPlants = (): Plant[] => {
    const starterPlants: Plant[] = [
      {
        id: `plant-${Date.now()}-1`,
        name: 'Başlangıç Çiçeği',
        type: 'flower',
        species: 'Sunflower',
        rarity: 'common',
        stage: 'seed',
        level: 1,
        experience: 0,
        maxExperience: 100,
        health: 100,
        happiness: 80,
        waterLevel: 50,
        sunlightLevel: 60,
        nutrients: 40,
        position: { x: 100, y: 100 },
        size: { width: 32, height: 32 },
        color: '#FFD700',
        emoji: '🌻',
        description: 'Güneş ışığını seven güzel bir çiçek',
        careInstructions: [
          'Günde 2 kez su verin',
          'Güneş ışığında tutun',
          'Haftada 1 kez gübreleyin',
        ],
        growthRequirements: {
          waterFrequency: 12,
          sunlightHours: 8,
          nutrientsRequired: 20,
          temperatureRange: { min: 18, max: 30 },
          humidityRange: { min: 40, max: 80 },
        },
        rewards: {
          xp: 50,
          coins: 25,
          items: ['Sunflower Seeds'],
          seeds: ['Sunflower Seeds'],
        },
        createdAt: new Date(),
      },
      {
        id: `plant-${Date.now()}-2`,
        name: 'Odaklanma Ağacı',
        type: 'tree',
        species: 'Focus Tree',
        rarity: 'uncommon',
        stage: 'sprout',
        level: 1,
        experience: 0,
        maxExperience: 200,
        health: 90,
        happiness: 70,
        waterLevel: 60,
        sunlightLevel: 70,
        nutrients: 50,
        position: { x: 200, y: 150 },
        size: { width: 40, height: 40 },
        color: '#228B22',
        emoji: '🌳',
        description: 'Odaklanma seanslarınızda büyüyen özel ağaç',
        careInstructions: [
          'Her pomodoro seansında büyür',
          'Düzenli su verin',
          'Güneş ışığında tutun',
        ],
        growthRequirements: {
          waterFrequency: 8,
          sunlightHours: 10,
          nutrientsRequired: 30,
          temperatureRange: { min: 15, max: 25 },
          humidityRange: { min: 50, max: 90 },
        },
        rewards: {
          xp: 100,
          coins: 50,
          items: ['Focus Seeds', 'Concentration Potion'],
          seeds: ['Focus Tree Seeds'],
        },
        createdAt: new Date(),
      },
    ];

    return starterPlants;
  };

  // Generate starter garden
  const generateStarterGarden = (): Garden => {
    return {
      id: `garden-${Date.now()}`,
      name: 'İlk Bahçem',
      theme: 'forest',
      size: { width: 800, height: 600 },
      plants: [],
      decorations: [],
      weather: 'sunny',
      season: 'spring',
      timeOfDay: 'morning',
      temperature: 22,
      humidity: 60,
      lightLevel: 80,
      musicEnabled: false,
      soundEffects: true,
      autoWatering: false,
      autoFertilizing: false,
      pestControl: true,
      level: 1,
      experience: 0,
      coins: 100,
      gems: 10,
      visitors: 0,
      likes: 0,
      shares: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  // Generate starter decorations
  const generateStarterDecorations = (): Decoration[] => {
    const starterDecorations: Decoration[] = [
      {
        id: `decoration-${Date.now()}-1`,
        name: 'Güneş Işığı Lambası',
        type: 'light',
        category: 'functional',
        rarity: 'common',
        cost: 50,
        size: { width: 24, height: 24 },
        position: { x: 50, y: 50 },
        effects: {
          happinessBonus: 10,
          growthBonus: 5,
          coinBonus: 0,
          xpBonus: 0,
        },
        description: 'Bitkilerinize ekstra ışık sağlar',
        emoji: '💡',
        unlocked: true,
        purchased: false,
        placed: false,
      },
      {
        id: `decoration-${Date.now()}-2`,
        name: 'Sulama Sistemi',
        type: 'fountain',
        category: 'functional',
        rarity: 'uncommon',
        cost: 150,
        size: { width: 32, height: 32 },
        position: { x: 100, y: 100 },
        effects: {
          happinessBonus: 15,
          growthBonus: 10,
          coinBonus: 5,
          xpBonus: 0,
        },
        description: 'Otomatik sulama sistemi',
        emoji: '⛲',
        unlocked: false,
        purchased: false,
        placed: false,
      },
    ];

    return starterDecorations;
  };

  // Water plant
  const waterPlant = async (plantId: string): Promise<boolean> => {
    try {
      setPlants(prev =>
        (prev || []).map(plant =>
          plant.id === plantId
            ? {
                ...plant,
                waterLevel: Math.min(100, plant.waterLevel + 30),
                lastWatered: new Date(),
                health: Math.min(100, plant.health + 5),
                happiness: Math.min(100, plant.happiness + 10),
              }
            : plant
        )
      );
      return true;
    } catch {
      // // console.error('Water plant error:', err);
      return false;
    }
  };

  // Fertilize plant
  const fertilizePlant = async (plantId: string): Promise<boolean> => {
    try {
      setPlants(prev =>
        (prev || []).map(plant =>
          plant.id === plantId
            ? {
                ...plant,
                nutrients: Math.min(100, plant.nutrients + 25),
                lastFertilized: new Date(),
                health: Math.min(100, plant.health + 3),
                happiness: Math.min(100, plant.happiness + 5),
              }
            : plant
        )
      );
      return true;
    } catch {
      // console.error('Fertilize plant error:', err);
      return false;
    }
  };

  // Harvest plant
  const harvestPlant = async (plantId: string): Promise<boolean> => {
    try {
      const plant = plants.find(p => p.id === plantId);
      if (!plant || plant.stage !== 'fruiting') return false;

      setPlants(prev =>
        (prev || []).map(p =>
          p.id === plantId
            ? {
                ...p,
                stage: 'mature',
                lastHarvested: new Date(),
                experience: p.experience + p.rewards.xp,
              }
            : p
        )
      );
      return true;
    } catch {
      // console.error('Harvest plant error:', err);
      return false;
    }
  };

  // Plant new seed
  const plantSeed = async (
    seedType: string,
    position: { x: number; y: number }
  ): Promise<Plant | null> => {
    try {
      const newPlant: Plant = {
        id: `plant-${Date.now()}-${Math.random()}`,
        name: `${seedType} Tohumu`,
        type: 'flower',
        species: seedType,
        rarity: 'common',
        stage: 'seed',
        level: 1,
        experience: 0,
        maxExperience: 100,
        health: 100,
        happiness: 80,
        waterLevel: 50,
        sunlightLevel: 60,
        nutrients: 40,
        position,
        size: { width: 32, height: 32 },
        color: '#FFD700',
        emoji: '🌱',
        description: 'Yeni ekilen tohum',
        careInstructions: [
          'Düzenli su verin',
          'Güneş ışığında tutun',
          'Sabırlı olun',
        ],
        growthRequirements: {
          waterFrequency: 12,
          sunlightHours: 8,
          nutrientsRequired: 20,
          temperatureRange: { min: 18, max: 30 },
          humidityRange: { min: 40, max: 80 },
        },
        rewards: {
          xp: 50,
          coins: 25,
          items: [`${seedType} Seeds`],
          seeds: [`${seedType} Seeds`],
        },
        createdAt: new Date(),
      };

      setPlants(prev => [...prev, newPlant]);
      return newPlant;
    } catch {
      // console.error('Plant seed error:', err);
      return null;
    }
  };

  // Update plant growth
  const updatePlantGrowth = (plantId: string): boolean => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return false;

    const now = new Date();
    const timeSinceLastUpdate = plant.lastWatered
      ? (now.getTime() - plant.lastWatered.getTime()) / (1000 * 60 * 60)
      : 24;

    // Check if plant needs care
    const needsWater = plant.waterLevel < 30;
    const needsFertilizer = plant.nutrients < 20;
    const needsSunlight = plant.sunlightLevel < 40;

    if (needsWater || needsFertilizer || needsSunlight) {
      // Plant health decreases
      setPlants(prev =>
        (prev || []).map(p =>
          p.id === plantId
            ? {
                ...p,
                health: Math.max(0, p.health - 5),
                happiness: Math.max(0, p.happiness - 3),
              }
            : p
        )
      );
      return false;
    }

    // Check if plant can grow
    if (plant.experience >= plant.maxExperience && plant.health > 80) {
      const nextStage = getNextStage(plant.stage);
      const nextLevel = plant.level + 1;
      const nextMaxExperience = plant.maxExperience * 1.5;

      setPlants(prev =>
        (prev || []).map(p =>
          p.id === plantId
            ? {
                ...p,
                stage: nextStage,
                level: nextLevel,
                experience: 0,
                maxExperience: nextMaxExperience,
                health: 100,
                happiness: 100,
                size: {
                  width: p.size.width * 1.2,
                  height: p.size.height * 1.2,
                },
              }
            : p
        )
      );
      return true;
    }

    return false;
  };

  // Get next growth stage
  const getNextStage = (currentStage: Plant['stage']): Plant['stage'] => {
    const stages: Plant['stage'][] = [
      'seed',
      'sprout',
      'young',
      'mature',
      'blooming',
      'fruiting',
      'ancient',
    ];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1
      ? stages[currentIndex + 1]
      : currentStage;
  };

  // Create garden event
  const createGardenEvent = (eventData: Partial<GardenEvent>): GardenEvent => {
    const newEvent: GardenEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      type: 'growth',
      title: 'Bitki Büyümesi',
      description: 'Bir bitkiniz büyüdü!',
      duration: 60,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      completed: false,
      priority: 'medium',
      ...eventData,
    };

    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  // Complete garden event
  const completeGardenEvent = async (eventId: string): Promise<boolean> => {
    try {
      setEvents(prev =>
        (prev || []).map(event =>
          event.id === eventId ? { ...event, completed: true } : event
        )
      );
      return true;
    } catch {
      // console.error('Complete garden event error:', err);
      return false;
    }
  };

  // Purchase decoration
  const purchaseDecoration = async (decorationId: string): Promise<boolean> => {
    try {
      const decoration = decorations.find(d => d.id === decorationId);
      if (!decoration || decoration.cost > gardens[0]?.coins || 0) return false;

      setDecorations(prev =>
        (prev || []).map(d => (d.id === decorationId ? { ...d, purchased: true } : d))
      );

      setGardens(prev =>
        (prev || []).map(garden => ({
          ...garden,
          coins: garden.coins - decoration.cost,
        }))
      );
      return true;
    } catch {
      // console.error('Purchase decoration error:', err);
      return false;
    }
  };

  // Place decoration
  const placeDecoration = async (
    decorationId: string,
    position: { x: number; y: number }
  ): Promise<boolean> => {
    try {
      setDecorations(prev =>
        (prev || []).map(d =>
          d.id === decorationId ? { ...d, position, placed: true } : d
        )
      );
      return true;
    } catch {
      // console.error('Place decoration error:', err);
      return false;
    }
  };

  // Update garden weather
  const updateGardenWeather = (weather: Garden['weather']): void => {
    setGardens(prev =>
      (prev || []).map(garden => ({ ...garden, weather, updatedAt: new Date() }))
    );
  };

  // Update garden time
  const updateGardenTime = (timeOfDay: Garden['timeOfDay']): void => {
    setGardens(prev =>
      (prev || []).map(garden => ({ ...garden, timeOfDay, updatedAt: new Date() }))
    );
  };

  // Update settings
  const updateSettings = (newSettings: Partial<GardenSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get garden insights
  const getGardenInsights = () => {
    const totalPlants = plants.length;
    const healthyPlants = (plants || []).filter(p => p.health > 80).length;
    const bloomingPlants = (plants || []).filter(p => p.stage === 'blooming').length;
    const totalDecorations = (decorations || []).filter(d => d.placed).length;
    const totalEvents = events.length;
    const completedEvents = (events || []).filter(e => e.completed).length;
    const totalCoins = (gardens || []).reduce((sum, g) => sum + g.coins, 0);
    const totalGems = (gardens || []).reduce((sum, g) => sum + g.gems, 0);

    return {
      totalPlants,
      healthyPlants,
      bloomingPlants,
      totalDecorations,
      totalEvents,
      completedEvents,
      totalCoins,
      totalGems,
      virtualGardenEnabled: settings.enableVirtualGarden,
      gardenLevel: gardens[0]?.level || 1,
    };
  };

  // Auto-update plant growth
  useEffect(() => {
    if (settings.enableVirtualGarden) {
      // const interval = setInterval(() => {
      //   plants.forEach(plant => {
      //     updatePlantGrowth(plant.id);
      //   });
      // }, 60000); // Check every minute

      // return () => clearInterval(interval);
    }
  }, [plants, settings.enableVirtualGarden]);

  // Initialize garden
  useEffect(() => {
    if (settings.enableVirtualGarden && gardens.length === 0) {
      const starterGarden = generateStarterGarden();
      const starterPlants = generateStarterPlants();
      const starterDecorations = generateStarterDecorations();

      setGardens([starterGarden]);
      setPlants(starterPlants);
      setDecorations(starterDecorations);
    }
  }, [settings.enableVirtualGarden]);

  return {
    plants,
    gardens,
    decorations,
    events,
    settings,
    loading,
    error,
    waterPlant,
    fertilizePlant,
    harvestPlant,
    plantSeed,
    createGardenEvent,
    completeGardenEvent,
    purchaseDecoration,
    placeDecoration,
    updateGardenWeather,
    updateGardenTime,
    updateSettings,
    getGardenInsights,
  };
};
