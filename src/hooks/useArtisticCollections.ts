import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useGamificationStore } from '../store/useGamificationStore';

export interface ArtisticItem {
  id: string;
  title: string;
  description: string;
  type:
    | 'drawing'
    | 'painting'
    | 'sketch'
    | 'digital_art'
    | 'calligraphy'
    | 'doodle'
    | 'mandala'
    | 'pattern';
  category:
    | 'nature'
    | 'abstract'
    | 'portrait'
    | 'landscape'
    | 'geometric'
    | 'minimalist'
    | 'fantasy'
    | 'realistic';
  style:
    | 'classical'
    | 'modern'
    | 'contemporary'
    | 'vintage'
    | 'cyberpunk'
    | 'kawaii'
    | 'minimalist'
    | 'maximalist';
  colors: string[];
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  canvasData?: any; // Canvas drawing data
  metadata: {
    width: number;
    height: number;
    layers: number;
    brushStrokes: number;
    timeSpent: number; // minutes
    complexity: number; // 0-1
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  };
  status: 'draft' | 'in_progress' | 'completed' | 'published' | 'archived';
  visibility: 'private' | 'friends' | 'public';
  likes: number;
  views: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  publishedAt?: Date;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  theme:
    | 'nature'
    | 'abstract'
    | 'portrait'
    | 'landscape'
    | 'geometric'
    | 'minimalist'
    | 'fantasy'
    | 'mixed';
  style:
    | 'classical'
    | 'modern'
    | 'contemporary'
    | 'vintage'
    | 'cyberpunk'
    | 'kawaii'
    | 'minimalist'
    | 'maximalist';
  items: string[]; // ArtisticItem IDs
  coverImage?: string;
  tags: string[];
  visibility: 'private' | 'friends' | 'public';
  likes: number;
  views: number;
  shares: number;
  followers: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ArtChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special' | 'community';
  theme: string;
  constraints: string[];
  rewards: {
    xp: number;
    badges: string[];
    unlocks: string[];
  };
  participants: number;
  submissions: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  tags: string[];
  createdAt: Date;
}

export interface ArtTutorial {
  id: string;
  title: string;
  description: string;
  category:
    | 'drawing'
    | 'painting'
    | 'digital_art'
    | 'calligraphy'
    | 'doodle'
    | 'mandala'
    | 'pattern';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  steps: TutorialStep[];
  materials: string[];
  tools: string[];
  techniques: string[];
  tags: string[];
  views: number;
  likes: number;
  rating: number;
  instructor: string;
  createdAt: Date;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  duration: number; // minutes
  tips: string[];
  commonMistakes: string[];
  order: number;
}

export interface ArtisticSettings {
  enableArtisticCollections: boolean;
  autoSave: boolean;
  saveInterval: number; // minutes
  defaultCanvasSize: { width: number; height: number };
  defaultBrush: {
    size: number;
    opacity: number;
    color: string;
    type: 'pencil' | 'brush' | 'marker' | 'spray' | 'eraser';
  };
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  layersEnabled: boolean;
  maxLayers: number;
  exportFormats: string[];
  compressionQuality: number; // 0-1
  watermarkEnabled: boolean;
  watermarkText: string;
  autoBackup: boolean;
  backupInterval: number; // hours
}

export const useArtisticCollections = () => {
  const { tasks, completedPomodoros } = usePomodoroStore();
  const { userLevel, totalXP, badges } = useGamificationStore();

  const [artisticItems, setArtisticItems] = useState<ArtisticItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [challenges, setChallenges] = useState<ArtChallenge[]>([]);
  const [tutorials, setTutorials] = useState<ArtTutorial[]>([]);
  const [settings, setSettings] = useState<ArtisticSettings>({
    enableArtisticCollections: true,
    autoSave: true,
    saveInterval: 5,
    defaultCanvasSize: { width: 800, height: 600 },
    defaultBrush: {
      size: 5,
      opacity: 1,
      color: '#000000',
      type: 'pencil',
    },
    gridEnabled: false,
    snapToGrid: false,
    gridSize: 20,
    layersEnabled: true,
    maxLayers: 10,
    exportFormats: ['png', 'jpg', 'svg'],
    compressionQuality: 0.9,
    watermarkEnabled: false,
    watermarkText: '',
    autoBackup: true,
    backupInterval: 24,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate daily art challenges
  const generateDailyChallenges = (): ArtChallenge[] => {
    const dailyChallenges: ArtChallenge[] = [
      {
        id: `daily-challenge-${Date.now()}`,
        title: 'Günün Renkleri',
        description:
          'Bugünün ana renklerini kullanarak bir sanat eseri oluşturun',
        type: 'daily',
        theme: 'Renkli Gün',
        constraints: [
          'Sadece bugünün ana renklerini kullanın',
          'En az 3 farklı renk kullanın',
          'Abstrakt veya gerçekçi olabilir',
        ],
        rewards: {
          xp: 100,
          badges: ['Renk Ustası'],
          unlocks: ['Yeni Fırça Seti'],
        },
        participants: 0,
        submissions: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        difficulty: 'beginner',
        tags: ['günlük', 'renk', 'yaratıcılık'],
        createdAt: new Date(),
      },
      {
        id: `daily-challenge-${Date.now()}-2`,
        title: 'Minimalist Çizgi',
        description: 'Sadece çizgiler kullanarak bir kompozisyon oluşturun',
        type: 'daily',
        theme: 'Minimalist',
        constraints: [
          'Sadece siyah çizgiler kullanın',
          'Maksimum 10 çizgi',
          'Geometrik şekiller',
        ],
        rewards: {
          xp: 150,
          badges: ['Minimalist Usta'],
          unlocks: ['Çizgi Fırçaları'],
        },
        participants: 0,
        submissions: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        difficulty: 'intermediate',
        tags: ['günlük', 'minimalist', 'çizgi'],
        createdAt: new Date(),
      },
    ];

    return dailyChallenges;
  };

  // Generate weekly challenges
  const generateWeeklyChallenges = (): ArtChallenge[] => {
    const weeklyChallenges: ArtChallenge[] = [
      {
        id: `weekly-challenge-${Date.now()}`,
        title: 'Haftalık Seri',
        description:
          '7 gün boyunca her gün farklı bir tema ile sanat eseri oluşturun',
        type: 'weekly',
        theme: '7 Günlük Seri',
        constraints: [
          'Her gün farklı bir tema',
          'Tutarlı bir stil koruyun',
          'Günlük ilerleme paylaşın',
        ],
        rewards: {
          xp: 500,
          badges: ['Seri Ustası', 'Tutarlılık Rozeti'],
          unlocks: ['Premium Fırça Seti', 'Gelişmiş Katmanlar'],
        },
        participants: 0,
        submissions: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        difficulty: 'advanced',
        tags: ['haftalık', 'seri', 'tutarlılık'],
        createdAt: new Date(),
      },
    ];

    return weeklyChallenges;
  };

  // Generate art tutorials
  const generateTutorials = (): ArtTutorial[] => {
    const tutorials: ArtTutorial[] = [
      {
        id: `tutorial-${Date.now()}-1`,
        title: 'Temel Çizim Teknikleri',
        description: 'Başlangıç seviyesi çizim teknikleri ve temel prensipler',
        category: 'drawing',
        difficulty: 'beginner',
        duration: 30,
        steps: [
          {
            id: 'step-1',
            title: 'Temel Çizgiler',
            description: 'Düz, eğri ve zigzag çizgiler çizmeyi öğrenin',
            duration: 5,
            tips: ['Hafif dokunuş kullanın', 'Parmaklarınızı gevşetin'],
            commonMistakes: ['Çok sert basmak', 'Çizgileri çok kısa yapmak'],
            order: 1,
          },
          {
            id: 'step-2',
            title: 'Şekiller ve Formlar',
            description: 'Temel geometrik şekilleri çizmeyi öğrenin',
            duration: 10,
            tips: ['Önce hafif çizgilerle başlayın', 'Orantıları kontrol edin'],
            commonMistakes: ['Şekilleri çarpıtmak', 'Orantıları yanlış yapmak'],
            order: 2,
          },
          {
            id: 'step-3',
            title: 'Gölgelendirme',
            description: 'Basit gölgelendirme teknikleri',
            duration: 15,
            tips: ['Hafif dokunuşla başlayın', 'Kademeli olarak koyulaştırın'],
            commonMistakes: ['Çok koyu başlamak', 'Düzensiz gölgelendirme'],
            order: 3,
          },
        ],
        materials: ['Kalem', 'Silgi', 'Kağıt'],
        tools: ['Çizim tableti', 'Dijital kalem'],
        techniques: ['Çizgi çizme', 'Gölgelendirme', 'Orantı'],
        tags: ['başlangıç', 'çizim', 'temel'],
        views: 0,
        likes: 0,
        rating: 0,
        instructor: 'Sanat Akademisi',
        createdAt: new Date(),
      },
      {
        id: `tutorial-${Date.now()}-2`,
        title: 'Dijital Boyama',
        description: 'Dijital sanat ve boyama teknikleri',
        category: 'digital_art',
        difficulty: 'intermediate',
        duration: 45,
        steps: [
          {
            id: 'step-4',
            title: 'Renk Paleti Oluşturma',
            description: 'Uyumlu renk paletleri nasıl oluşturulur',
            duration: 10,
            tips: ['Renk teorisini öğrenin', 'Doğadan ilham alın'],
            commonMistakes: ['Çok fazla renk kullanmak', 'Uyumsuz renkler'],
            order: 1,
          },
          {
            id: 'step-5',
            title: 'Katman Teknikleri',
            description: 'Dijital katmanları etkili kullanma',
            duration: 20,
            tips: ['Her katman için farklı amaç', 'Blend modlarını deneyin'],
            commonMistakes: ['Çok fazla katman', 'Karışık katman düzeni'],
            order: 2,
          },
          {
            id: 'step-6',
            title: 'Fırça Teknikleri',
            description: 'Farklı fırça türleri ve kullanımları',
            duration: 15,
            tips: ['Fırça ayarlarını öğrenin', 'Farklı dokular deneyin'],
            commonMistakes: [
              'Aynı fırçayı kullanmak',
              'Fırça ayarlarını bilmemek',
            ],
            order: 3,
          },
        ],
        materials: ['Dijital tablet', 'Stylus'],
        tools: ['Photoshop', 'Procreate', 'Krita'],
        techniques: ['Katmanlar', 'Fırça kullanımı', 'Renk karışımı'],
        tags: ['dijital', 'boyama', 'katmanlar'],
        views: 0,
        likes: 0,
        rating: 0,
        instructor: 'Dijital Sanat Ustası',
        createdAt: new Date(),
      },
    ];

    return tutorials;
  };

  // Create new artistic item
  const createArtisticItem = async (
    itemData: Partial<ArtisticItem>
  ): Promise<ArtisticItem | null> => {
    try {
      setLoading(true);
      setError(null);

      const newItem: ArtisticItem = {
        id: `artistic-item-${Date.now()}-${Math.random()}`,
        title: itemData.title || 'Yeni Sanat Eseri',
        description: itemData.description || '',
        type: itemData.type || 'drawing',
        category: itemData.category || 'abstract',
        style: itemData.style || 'modern',
        colors: itemData.colors || ['#000000'],
        tags: itemData.tags || [],
        metadata: {
          width: itemData.metadata?.width || settings.defaultCanvasSize.width,
          height:
            itemData.metadata?.height || settings.defaultCanvasSize.height,
          layers: 1,
          brushStrokes: 0,
          timeSpent: 0,
          complexity: 0.5,
          difficulty: 'easy',
        },
        status: 'draft',
        visibility: 'private',
        likes: 0,
        views: 0,
        shares: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...itemData,
      };

      setArtisticItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError('Failed to create artistic item');
      console.error('Create artistic item error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update artistic item
  const updateArtisticItem = async (
    itemId: string,
    updates: Partial<ArtisticItem>
  ): Promise<boolean> => {
    try {
      setArtisticItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        )
      );
      return true;
    } catch (err) {
      console.error('Update artistic item error:', err);
      return false;
    }
  };

  // Create collection
  const createCollection = async (
    collectionData: Partial<Collection>
  ): Promise<Collection | null> => {
    try {
      const newCollection: Collection = {
        id: `collection-${Date.now()}-${Math.random()}`,
        title: collectionData.title || 'Yeni Koleksiyon',
        description: collectionData.description || '',
        theme: collectionData.theme || 'mixed',
        style: collectionData.style || 'modern',
        items: collectionData.items || [],
        tags: collectionData.tags || [],
        visibility: 'private',
        likes: 0,
        views: 0,
        shares: 0,
        followers: 0,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...collectionData,
      };

      setCollections(prev => [...prev, newCollection]);
      return newCollection;
    } catch (err) {
      setError('Failed to create collection');
      console.error('Create collection error:', err);
      return null;
    }
  };

  // Add item to collection
  const addItemToCollection = async (
    collectionId: string,
    itemId: string
  ): Promise<boolean> => {
    try {
      setCollections(prev =>
        prev.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                items: [...collection.items, itemId],
                updatedAt: new Date(),
              }
            : collection
        )
      );
      return true;
    } catch (err) {
      console.error('Add item to collection error:', err);
      return false;
    }
  };

  // Remove item from collection
  const removeItemFromCollection = async (
    collectionId: string,
    itemId: string
  ): Promise<boolean> => {
    try {
      setCollections(prev =>
        prev.map(collection =>
          collection.id === collectionId
            ? {
                ...collection,
                items: collection.items.filter(id => id !== itemId),
                updatedAt: new Date(),
              }
            : collection
        )
      );
      return true;
    } catch (err) {
      console.error('Remove item from collection error:', err);
      return false;
    }
  };

  // Join challenge
  const joinChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      setChallenges(prev =>
        prev.map(challenge =>
          challenge.id === challengeId
            ? {
                ...challenge,
                participants: challenge.participants + 1,
                status: 'active',
              }
            : challenge
        )
      );
      return true;
    } catch (err) {
      console.error('Join challenge error:', err);
      return false;
    }
  };

  // Submit to challenge
  const submitToChallenge = async (
    challengeId: string,
    itemId: string
  ): Promise<boolean> => {
    try {
      setChallenges(prev =>
        prev.map(challenge =>
          challenge.id === challengeId
            ? {
                ...challenge,
                submissions: challenge.submissions + 1,
              }
            : challenge
        )
      );
      return true;
    } catch (err) {
      console.error('Submit to challenge error:', err);
      return false;
    }
  };

  // Generate new challenges and tutorials
  const generateNewContent = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const newChallenges = [
        ...generateDailyChallenges(),
        ...generateWeeklyChallenges(),
      ];
      const newTutorials = generateTutorials();

      setChallenges(prev => [...prev, ...newChallenges]);
      setTutorials(prev => [...prev, ...newTutorials]);
    } catch (err) {
      setError('Failed to generate new content');
      console.error('Generate new content error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = (newSettings: Partial<ArtisticSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Get artistic insights
  const getArtisticInsights = () => {
    const totalItems = artisticItems.length;
    const completedItems = artisticItems.filter(
      item => item.status === 'completed'
    ).length;
    const publishedItems = artisticItems.filter(
      item => item.status === 'published'
    ).length;
    const totalCollections = collections.length;
    const publishedCollections = collections.filter(
      collection => collection.status === 'published'
    ).length;
    const activeChallenges = challenges.filter(
      challenge => challenge.status === 'active'
    ).length;
    const totalTutorials = tutorials.length;

    const totalLikes = artisticItems.reduce((sum, item) => sum + item.likes, 0);
    const totalViews = artisticItems.reduce((sum, item) => sum + item.views, 0);
    const totalShares = artisticItems.reduce(
      (sum, item) => sum + item.shares,
      0
    );

    return {
      totalItems,
      completedItems,
      publishedItems,
      totalCollections,
      publishedCollections,
      activeChallenges,
      totalTutorials,
      totalLikes,
      totalViews,
      totalShares,
      artisticCollectionsEnabled: settings.enableArtisticCollections,
    };
  };

  // Auto-generate content
  useEffect(() => {
    if (settings.enableArtisticCollections) {
      generateNewContent();
    }
  }, [settings.enableArtisticCollections]);

  return {
    artisticItems,
    collections,
    challenges,
    tutorials,
    settings,
    loading,
    error,
    createArtisticItem,
    updateArtisticItem,
    createCollection,
    addItemToCollection,
    removeItemFromCollection,
    joinChallenge,
    submitToChallenge,
    generateNewContent,
    updateSettings,
    getArtisticInsights,
  };
};
