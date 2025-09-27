import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface Avatar {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  skinTone: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  eyeShape: string;
  noseShape: string;
  mouthShape: string;
  faceShape: string;
  bodyType: string;
  height: number; // 1-10 scale
  weight: number; // 1-10 scale
  clothing: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string[];
  };
  expressions: {
    happy: string;
    sad: string;
    angry: string;
    surprised: string;
    focused: string;
    tired: string;
  };
  animations: {
    idle: string;
    walking: string;
    running: string;
    working: string;
    celebrating: string;
    thinking: string;
  };
  customization: {
    colors: { [key: string]: string };
    patterns: { [key: string]: string };
    textures: { [key: string]: string };
  };
  level: number;
  experience: number;
  unlockedItems: string[];
  currentOutfit: string;
  favoriteOutfits: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AvatarItem {
  id: string;
  name: string;
  category:
    | 'hair'
    | 'eyes'
    | 'clothing'
    | 'accessories'
    | 'expressions'
    | 'animations'
    | 'backgrounds';
  subcategory: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number;
  currency: 'coins' | 'gems' | 'xp';
  unlockLevel: number;
  unlockRequirements: string[];
  description: string;
  preview: string;
  colors: string[];
  patterns: string[];
  textures: string[];
  tags: string[];
  stats: {
    happiness: number;
    confidence: number;
    creativity: number;
    focus: number;
  };
  effects: {
    xpBonus: number;
    coinBonus: number;
    moodBonus: number;
    productivityBonus: number;
  };
  purchased: boolean;
  equipped: boolean;
  favorite: boolean;
}

export interface AvatarOutfit {
  id: string;
  name: string;
  description: string;
  items: string[]; // AvatarItem IDs
  theme:
    | 'casual'
    | 'formal'
    | 'sporty'
    | 'creative'
    | 'professional'
    | 'party'
    | 'seasonal';
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all';
  occasion: 'work' | 'study' | 'exercise' | 'social' | 'relax' | 'special';
  stats: {
    happiness: number;
    confidence: number;
    creativity: number;
    focus: number;
  };
  effects: {
    xpBonus: number;
    coinBonus: number;
    moodBonus: number;
    productivityBonus: number;
  };
  colors: string[];
  tags: string[];
  createdAt: Date;
}

export interface AvatarSettings {
  enableAvatarCustomization: boolean;
  autoOutfitChange: boolean;
  outfitChangeFrequency: number; // hours
  showAvatarInNotifications: boolean;
  avatarAnimations: boolean;
  avatarExpressions: boolean;
  avatarInteractions: boolean;
  avatarMoodTracking: boolean;
  avatarProgressSharing: boolean;
  avatarSocialFeatures: boolean;
  defaultAvatar: string;
  avatarPrivacy: 'public' | 'friends' | 'private';
  avatarSharing: boolean;
}

export const useAvatarCustomization = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP, badges } = useGamificationStore();

  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [items, setItems] = useState<AvatarItem[]>([]);
  const [outfits, setOutfits] = useState<AvatarOutfit[]>([]);
  const [settings, setSettings] = useState<AvatarSettings>({
    enableAvatarCustomization: true,
    autoOutfitChange: false,
    outfitChangeFrequency: 24,
    showAvatarInNotifications: true,
    avatarAnimations: true,
    avatarExpressions: true,
    avatarInteractions: true,
    avatarMoodTracking: true,
    avatarProgressSharing: true,
    avatarSocialFeatures: true,
    defaultAvatar: 'default',
    avatarPrivacy: 'friends',
    avatarSharing: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate default avatar
  const generateDefaultAvatar = (): Avatar => {
    return {
      id: `avatar-${Date.now()}`,
      name: 'Benim Avatarım',
      gender: 'non-binary',
      skinTone: '#FDBCB4',
      hairColor: '#8B4513',
      hairStyle: 'short',
      eyeColor: '#4A90E2',
      eyeShape: 'round',
      noseShape: 'medium',
      mouthShape: 'smile',
      faceShape: 'oval',
      bodyType: 'average',
      height: 5,
      weight: 5,
      clothing: {
        top: 't-shirt',
        bottom: 'jeans',
        shoes: 'sneakers',
        accessories: [],
      },
      expressions: {
        happy: '😊',
        sad: '😢',
        angry: '😠',
        surprised: '😮',
        focused: '🤔',
        tired: '😴',
      },
      animations: {
        idle: 'standing',
        walking: 'walking',
        running: 'running',
        working: 'typing',
        celebrating: 'dancing',
        thinking: 'pondering',
      },
      customization: {
        colors: {
          primary: '#4A90E2',
          secondary: '#7ED321',
          accent: '#F5A623',
        },
        patterns: {
          clothing: 'solid',
          background: 'gradient',
        },
        textures: {
          hair: 'smooth',
          skin: 'natural',
        },
      },
      level: 1,
      experience: 0,
      unlockedItems: [],
      currentOutfit: 'default',
      favoriteOutfits: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  // Generate starter items
  const generateStarterItems = (): AvatarItem[] => {
    const starterItems: AvatarItem[] = [
      {
        id: `item-${Date.now()}-1`,
        name: 'Klasik T-Shirt',
        category: 'clothing',
        subcategory: 'top',
        rarity: 'common',
        cost: 0,
        currency: 'coins',
        unlockLevel: 1,
        unlockRequirements: [],
        description: 'Rahat ve şık klasik t-shirt',
        preview: '👕',
        colors: ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'],
        patterns: ['solid', 'striped', 'polka'],
        textures: ['cotton', 'polyester'],
        tags: ['casual', 'comfortable', 'basic'],
        stats: {
          happiness: 5,
          confidence: 3,
          creativity: 2,
          focus: 4,
        },
        effects: {
          xpBonus: 0,
          coinBonus: 0,
          moodBonus: 5,
          productivityBonus: 0,
        },
        purchased: true,
        equipped: true,
        favorite: false,
      },
      {
        id: `item-${Date.now()}-2`,
        name: 'Rahat Jean',
        category: 'clothing',
        subcategory: 'bottom',
        rarity: 'common',
        cost: 0,
        currency: 'coins',
        unlockLevel: 1,
        unlockRequirements: [],
        description: 'Günlük kullanım için rahat jean',
        preview: '👖',
        colors: ['#000080', '#8B4513', '#000000'],
        patterns: ['solid', 'faded'],
        textures: ['denim'],
        tags: ['casual', 'durable', 'versatile'],
        stats: {
          happiness: 4,
          confidence: 5,
          creativity: 3,
          focus: 3,
        },
        effects: {
          xpBonus: 0,
          coinBonus: 0,
          moodBonus: 4,
          productivityBonus: 0,
        },
        purchased: true,
        equipped: true,
        favorite: false,
      },
      {
        id: `item-${Date.now()}-3`,
        name: 'Spor Ayakkabı',
        category: 'clothing',
        subcategory: 'shoes',
        rarity: 'common',
        cost: 0,
        currency: 'coins',
        unlockLevel: 1,
        unlockRequirements: [],
        description: 'Rahat ve şık spor ayakkabı',
        preview: '👟',
        colors: ['#FFFFFF', '#000000', '#FF0000', '#00FF00'],
        patterns: ['solid', 'striped'],
        textures: ['canvas', 'leather'],
        tags: ['sporty', 'comfortable', 'versatile'],
        stats: {
          happiness: 6,
          confidence: 4,
          creativity: 2,
          focus: 5,
        },
        effects: {
          xpBonus: 0,
          coinBonus: 0,
          moodBonus: 6,
          productivityBonus: 0,
        },
        purchased: true,
        equipped: true,
        favorite: false,
      },
      {
        id: `item-${Date.now()}-4`,
        name: 'Odaklanma Gözlüğü',
        category: 'accessories',
        subcategory: 'eyewear',
        rarity: 'uncommon',
        cost: 100,
        currency: 'coins',
        unlockLevel: 3,
        unlockRequirements: ['Complete 10 pomodoros'],
        description: 'Odaklanmayı artıran özel gözlük',
        preview: '👓',
        colors: ['#000000', '#8B4513', '#C0C0C0'],
        patterns: ['solid'],
        textures: ['plastic', 'metal'],
        tags: ['professional', 'focus', 'intellectual'],
        stats: {
          happiness: 3,
          confidence: 6,
          creativity: 4,
          focus: 8,
        },
        effects: {
          xpBonus: 10,
          coinBonus: 0,
          moodBonus: 3,
          productivityBonus: 15,
        },
        purchased: false,
        equipped: false,
        favorite: false,
      },
      {
        id: `item-${Date.now()}-5`,
        name: 'Başarı Rozeti',
        category: 'accessories',
        subcategory: 'badges',
        rarity: 'rare',
        cost: 500,
        currency: 'coins',
        unlockLevel: 5,
        unlockRequirements: ['Reach level 5', 'Complete 50 pomodoros'],
        description: 'Başarılarınızı gösteren özel rozet',
        preview: '🏆',
        colors: ['#FFD700', '#C0C0C0', '#CD7F32'],
        patterns: ['solid', 'gradient'],
        textures: ['metal', 'plastic'],
        tags: ['achievement', 'prestige', 'motivation'],
        stats: {
          happiness: 8,
          confidence: 9,
          creativity: 5,
          focus: 6,
        },
        effects: {
          xpBonus: 20,
          coinBonus: 10,
          moodBonus: 8,
          productivityBonus: 10,
        },
        purchased: false,
        equipped: false,
        favorite: false,
      },
    ];

    return starterItems;
  };

  // Generate starter outfits
  const generateStarterOutfits = (): AvatarOutfit[] => {
    const starterOutfits: AvatarOutfit[] = [
      {
        id: `outfit-${Date.now()}-1`,
        name: 'Günlük Kıyafet',
        description: 'Rahat ve şık günlük kıyafet',
        items: ['item-1', 'item-2', 'item-3'],
        theme: 'casual',
        season: 'all',
        occasion: 'work',
        stats: {
          happiness: 5,
          confidence: 4,
          creativity: 3,
          focus: 4,
        },
        effects: {
          xpBonus: 0,
          coinBonus: 0,
          moodBonus: 5,
          productivityBonus: 0,
        },
        colors: ['#FFFFFF', '#000080'],
        tags: ['casual', 'comfortable', 'versatile'],
        createdAt: new Date(),
      },
      {
        id: `outfit-${Date.now()}-2`,
        name: 'Odaklanma Kıyafeti',
        description: 'Verimliliği artıran özel kıyafet',
        items: ['item-1', 'item-2', 'item-3', 'item-4'],
        theme: 'professional',
        season: 'all',
        occasion: 'study',
        stats: {
          happiness: 4,
          confidence: 6,
          creativity: 4,
          focus: 8,
        },
        effects: {
          xpBonus: 15,
          coinBonus: 0,
          moodBonus: 4,
          productivityBonus: 20,
        },
        colors: ['#000000', '#FFFFFF'],
        tags: ['professional', 'focus', 'productivity'],
        createdAt: new Date(),
      },
    ];

    return starterOutfits;
  };

  // Update avatar appearance
  const updateAvatarAppearance = async (
    updates: Partial<Avatar>
  ): Promise<boolean> => {
    try {
      if (!avatar) return false;

      setAvatar(prev =>
        prev ? { ...prev, ...updates, updatedAt: new Date() } : null
      );
      return true;
    } catch (err) {
      console.error('Update avatar appearance error:', err);
      return false;
    }
  };

  // Purchase item
  const purchaseItem = async (itemId: string): Promise<boolean> => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item || item.purchased) return false;

      // Check if user has enough currency
      const hasEnoughCurrency = true; // In a real app, check user's currency
      if (!hasEnoughCurrency) return false;

      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, purchased: true } : i))
      );
      return true;
    } catch (err) {
      console.error('Purchase item error:', err);
      return false;
    }
  };

  // Equip item
  const equipItem = async (itemId: string): Promise<boolean> => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item || !item.purchased) return false;

      // Unequip other items in the same category
      setItems(prev =>
        prev.map(i =>
          i.category === item.category && i.subcategory === item.subcategory
            ? { ...i, equipped: false }
            : i
        )
      );

      // Equip the new item
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, equipped: true } : i))
      );

      // Update avatar clothing
      if (avatar) {
        const clothingUpdate: Partial<Avatar> = {};
        if (item.category === 'clothing') {
          if (item.subcategory === 'top')
            clothingUpdate.clothing = { ...avatar.clothing, top: item.name };
          if (item.subcategory === 'bottom')
            clothingUpdate.clothing = { ...avatar.clothing, bottom: item.name };
          if (item.subcategory === 'shoes')
            clothingUpdate.clothing = { ...avatar.clothing, shoes: item.name };
        }
        if (item.category === 'accessories') {
          clothingUpdate.clothing = {
            ...avatar.clothing,
            accessories: [...avatar.clothing.accessories, item.name],
          };
        }
        updateAvatarAppearance(clothingUpdate);
      }

      return true;
    } catch (err) {
      console.error('Equip item error:', err);
      return false;
    }
  };

  // Unequip item
  const unequipItem = async (itemId: string): Promise<boolean> => {
    try {
      setItems(prev =>
        prev.map(i => (i.id === itemId ? { ...i, equipped: false } : i))
      );
      return true;
    } catch (err) {
      console.error('Unequip item error:', err);
      return false;
    }
  };

  // Create outfit
  const createOutfit = async (
    outfitData: Partial<AvatarOutfit>
  ): Promise<AvatarOutfit | null> => {
    try {
      const newOutfit: AvatarOutfit = {
        id: `outfit-${Date.now()}-${Math.random()}`,
        name: outfitData.name || 'Yeni Kıyafet',
        description: outfitData.description || '',
        items: outfitData.items || [],
        theme: outfitData.theme || 'casual',
        season: outfitData.season || 'all',
        occasion: outfitData.occasion || 'work',
        stats: {
          happiness: 5,
          confidence: 5,
          creativity: 5,
          focus: 5,
        },
        effects: {
          xpBonus: 0,
          coinBonus: 0,
          moodBonus: 5,
          productivityBonus: 0,
        },
        colors: outfitData.colors || [],
        tags: outfitData.tags || [],
        createdAt: new Date(),
        ...outfitData,
      };

      setOutfits(prev => [...prev, newOutfit]);
      return newOutfit;
    } catch (err) {
      console.error('Create outfit error:', err);
      return null;
    }
  };

  // Apply outfit
  const applyOutfit = async (outfitId: string): Promise<boolean> => {
    try {
      const outfit = outfits.find(o => o.id === outfitId);
      if (!outfit) return false;

      // Equip all items in the outfit
      for (const itemId of outfit.items) {
        await equipItem(itemId);
      }

      // Update avatar current outfit
      if (avatar) {
        updateAvatarAppearance({ currentOutfit: outfit.name });
      }

      return true;
    } catch (err) {
      console.error('Apply outfit error:', err);
      return false;
    }
  };

  // Update avatar mood
  const updateAvatarMood = async (mood: string): Promise<boolean> => {
    try {
      if (!avatar) return false;

      const moodExpression =
        avatar.expressions[mood as keyof typeof avatar.expressions];
      if (moodExpression) {
        // In a real app, this would update the avatar's current expression
        console.log(`Avatar mood updated to: ${mood} (${moodExpression})`);
      }

      return true;
    } catch (err) {
      console.error('Update avatar mood error:', err);
      return false;
    }
  };

  // Update avatar animation
  const updateAvatarAnimation = async (animation: string): Promise<boolean> => {
    try {
      if (!avatar) return false;

      const animationType =
        avatar.animations[animation as keyof typeof avatar.animations];
      if (animationType) {
        // In a real app, this would update the avatar's current animation
        console.log(
          `Avatar animation updated to: ${animation} (${animationType})`
        );
      }

      return true;
    } catch (err) {
      console.error('Update avatar animation error:', err);
      return false;
    }
  };

  // Get avatar insights
  const getAvatarInsights = () => {
    const totalItems = items.length;
    const purchasedItems = items.filter(item => item.purchased).length;
    const equippedItems = items.filter(item => item.equipped).length;
    const totalOutfits = outfits.length;
    const favoriteItems = items.filter(item => item.favorite).length;
    const unlockedItems = avatar?.unlockedItems.length || 0;
    const avatarLevel = avatar?.level || 1;
    const avatarExperience = avatar?.experience || 0;

    return {
      totalItems,
      purchasedItems,
      equippedItems,
      totalOutfits,
      favoriteItems,
      unlockedItems,
      avatarLevel,
      avatarExperience,
      avatarCustomizationEnabled: settings.enableAvatarCustomization,
    };
  };

  // Initialize avatar
  useEffect(() => {
    if (settings.enableAvatarCustomization && !avatar) {
      const defaultAvatar = generateDefaultAvatar();
      const starterItems = generateStarterItems();
      const starterOutfits = generateStarterOutfits();

      setAvatar(defaultAvatar);
      setItems(starterItems);
      setOutfits(starterOutfits);
    }
  }, [settings.enableAvatarCustomization]);

  // Update settings
  const updateSettings = (newSettings: Partial<AvatarSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    avatar,
    items,
    outfits,
    settings,
    loading,
    error,
    updateAvatarAppearance,
    purchaseItem,
    equipItem,
    unequipItem,
    createOutfit,
    applyOutfit,
    updateAvatarMood,
    updateAvatarAnimation,
    updateSettings,
    getAvatarInsights,
  };
};
