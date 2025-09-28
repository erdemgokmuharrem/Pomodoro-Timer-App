import { useState } from 'react';

export interface Plant {
  id: string;
  name: string;
  type: string;
  stage: 'seed' | 'sprout' | 'growing' | 'mature' | 'blooming';
  level: number;
  experience: number;
  maxExperience: number;
  health: number;
  happiness: number;
  waterLevel: number;
  nutrients: number;
  sunlightLevel: number;
  size: { width: number; height: number };
  lastWatered: Date;
  lastFertilized: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Garden {
  id: string;
  name: string;
  theme: string;
  coins: number;
  gems: number;
  level: number;
  experience: number;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  temperature: number;
  humidity: number;
  lightLevel: number;
}

export interface GardenSettings {
  enableVirtualGarden: boolean;
  autoWatering: boolean;
  autoFertilizing: boolean;
  notifications: boolean;
  soundEffects: boolean;
  animations: boolean;
}

export const useVirtualGarden = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [gardens] = useState<Garden[]>([]);
  const [settings, setSettings] = useState<GardenSettings>({
    enableVirtualGarden: true,
    autoWatering: false,
    autoFertilizing: false,
    notifications: true,
    soundEffects: true,
    animations: true,
  });
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Water plant
  const waterPlant = (plantId: string): boolean => {
    try {
      setPlants(prev =>
        (prev || []).map(plant =>
          plant.id === plantId
            ? {
                ...plant,
                waterLevel: Math.min(100, plant.waterLevel + 30),
                lastWatered: new Date(),
                health: Math.min(100, plant.health + 5),
                happiness: Math.min(100, plant.happiness + 3),
              }
            : plant
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // Fertilize plant
  const fertilizePlant = (plantId: string): boolean => {
    try {
      setPlants(prev =>
        (prev || []).map(plant =>
          plant.id === plantId
            ? {
                ...plant,
                nutrients: Math.min(100, plant.nutrients + 25),
                lastFertilized: new Date(),
                health: Math.min(100, plant.health + 3),
                happiness: Math.min(100, plant.happiness + 2),
              }
            : plant
        )
      );
      return true;
    } catch {
      return false;
    }
  };

  // Get garden insights
  const getGardenInsights = () => {
    const totalPlants = (plants || []).length;
    const healthyPlants = (plants || []).filter(p => p.health > 80).length;
    const bloomingPlants = (plants || []).filter(
      p => p.stage === 'blooming'
    ).length;
    const totalCoins = (gardens || []).reduce((sum, g) => sum + g.coins, 0);
    const totalGems = (gardens || []).reduce((sum, g) => sum + g.gems, 0);

    return {
      totalPlants,
      healthyPlants,
      bloomingPlants,
      totalCoins,
      totalGems,
    };
  };

  // Update settings
  const updateSettings = (newSettings: Partial<GardenSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    plants,
    gardens,
    settings,
    loading,
    error,
    waterPlant,
    fertilizePlant,
    getGardenInsights,
    updateSettings,
  };
};
