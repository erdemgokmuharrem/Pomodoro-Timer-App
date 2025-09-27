import { useState, useCallback } from 'react';

export interface BreakActivity {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  category: 'stretching' | 'breathing' | 'movement' | 'mindfulness' | 'eye-care' | 'hydration';
  difficulty: 'easy' | 'medium' | 'hard';
  equipment: string[];
  benefits: string[];
  instructions: string[];
  icon: string;
  color: string;
}

export interface BreakSession {
  id: string;
  activities: BreakActivity[];
  totalDuration: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  energyLevel: 'low' | 'medium' | 'high';
  mood: 'tired' | 'stressed' | 'neutral' | 'energized' | 'focused';
}

export const useBreakGuide = () => {
  const [breakActivities] = useState<BreakActivity[]>([
    // Stretching Activities
    {
      id: 'neck-stretch',
      name: 'Boyun Germe',
      description: 'Boyun kaslarını rahatlatmak için hafif germe egzersizleri',
      duration: 2,
      category: 'stretching',
      difficulty: 'easy',
      equipment: [],
      benefits: ['Boyun ağrısı azaltma', 'Gerginlik giderme', 'Kan dolaşımı artırma'],
      instructions: [
        'Başınızı yavaşça sağa eğin',
        '5 saniye bekleyin',
        'Sol tarafa eğin',
        '5 saniye bekleyin',
        'Öne ve arkaya eğin'
      ],
      icon: '🦒',
      color: '#10B981',
    },
    {
      id: 'shoulder-roll',
      name: 'Omuz Çevirme',
      description: 'Omuz kaslarını rahatlatmak için dairesel hareketler',
      duration: 3,
      category: 'stretching',
      difficulty: 'easy',
      equipment: [],
      benefits: ['Omuz gerginliği azaltma', 'Postür iyileştirme', 'Kan dolaşımı artırma'],
      instructions: [
        'Omuzlarınızı yukarı kaldırın',
        'Arkaya doğru dairesel hareket yapın',
        '10 kez tekrarlayın',
        'Öne doğru da yapın',
        'Derin nefes alın'
      ],
      icon: '🤸',
      color: '#10B981',
    },
    {
      id: 'back-stretch',
      name: 'Sırt Germe',
      description: 'Sırt kaslarını rahatlatmak için germe egzersizleri',
      duration: 4,
      category: 'stretching',
      difficulty: 'medium',
      equipment: [],
      benefits: ['Sırt ağrısı azaltma', 'Omurga esnekliği', 'Postür iyileştirme'],
      instructions: [
        'Kollarınızı yukarı kaldırın',
        'Sağa doğru eğilin',
        '5 saniye bekleyin',
        'Sola doğru eğilin',
        'Öne doğru eğilin'
      ],
      icon: '🧘',
      color: '#10B981',
    },

    // Breathing Activities
    {
      id: 'deep-breathing',
      name: 'Derin Nefes',
      description: 'Stresi azaltmak ve odaklanmayı artırmak için nefes egzersizi',
      duration: 3,
      category: 'breathing',
      difficulty: 'easy',
      equipment: [],
      benefits: ['Stres azaltma', 'Odaklanma artırma', 'Kalp ritmi düzenleme'],
      instructions: [
        'Rahat bir pozisyon alın',
        '4 saniye nefes alın',
        '4 saniye tutun',
        '4 saniye verin',
        '5 kez tekrarlayın'
      ],
      icon: '🫁',
      color: '#3B82F6',
    },
    {
      id: 'box-breathing',
      name: 'Kutu Nefesi',
      description: 'Askeri nefes tekniği ile stres azaltma',
      duration: 4,
      category: 'breathing',
      difficulty: 'medium',
      equipment: [],
      benefits: ['Anksiyete azaltma', 'Odaklanma artırma', 'Uyku kalitesi'],
      instructions: [
        '4 saniye nefes alın',
        '4 saniye tutun',
        '4 saniye verin',
        '4 saniye boşluk',
        '10 kez tekrarlayın'
      ],
      icon: '📦',
      color: '#3B82F6',
    },

    // Movement Activities
    {
      id: 'walking',
      name: 'Kısa Yürüyüş',
      description: 'Kan dolaşımını artırmak için hafif yürüyüş',
      duration: 5,
      category: 'movement',
      difficulty: 'easy',
      equipment: [],
      benefits: ['Kan dolaşımı artırma', 'Enerji yenileme', 'Konsantrasyon artırma'],
      instructions: [
        'Ofis içinde veya dışarıda yürüyün',
        'Rahat bir tempoda',
        'Derin nefes alın',
        'Etrafınızı gözlemleyin',
        '5 dakika devam edin'
      ],
      icon: '🚶',
      color: '#8B5CF6',
    },
    {
      id: 'jumping-jacks',
      name: 'Zıplama',
      description: 'Kalp ritmini artırmak için hafif kardiyo',
      duration: 2,
      category: 'movement',
      difficulty: 'medium',
      equipment: [],
      benefits: ['Kalp ritmi artırma', 'Enerji artırma', 'Endorfin salınımı'],
      instructions: [
        'Ayakta durun',
        'Kolları yukarı kaldırın',
        'Zıplayın ve ayakları açın',
        'Kolları aşağı indirin',
        '20 kez tekrarlayın'
      ],
      icon: '🏃',
      color: '#8B5CF6',
    },

    // Mindfulness Activities
    {
      id: 'meditation',
      name: 'Kısa Meditasyon',
      description: 'Zihni sakinleştirmek için mindfulness',
      duration: 5,
      category: 'mindfulness',
      difficulty: 'medium',
      equipment: [],
      benefits: ['Stres azaltma', 'Odaklanma artırma', 'Zihinsel berraklık'],
      instructions: [
        'Rahat bir pozisyon alın',
        'Gözlerinizi kapatın',
        'Nefesinizi takip edin',
        'Düşünceleri gözlemleyin',
        '5 dakika devam edin'
      ],
      icon: '🧘‍♀️',
      color: '#F59E0B',
    },
    {
      id: 'gratitude',
      name: 'Şükran Pratiği',
      description: 'Pozitif düşünce için şükran egzersizi',
      duration: 3,
      category: 'mindfulness',
      difficulty: 'easy',
      equipment: [],
      benefits: ['Pozitif düşünce', 'Stres azaltma', 'Motivasyon artırma'],
      instructions: [
        '3 şey düşünün',
        'Hayatınızda minnettar olduğunuz',
        'Her biri için 1 dakika',
        'Detayları hayal edin',
        'Teşekkür edin'
      ],
      icon: '🙏',
      color: '#F59E0B',
    },

    // Eye Care Activities
    {
      id: 'eye-exercise',
      name: 'Göz Egzersizi',
      description: 'Bilgisayar yorgunluğunu azaltmak için göz egzersizleri',
      duration: 2,
      category: 'eye-care',
      difficulty: 'easy',
      equipment: [],
      benefits: ['Göz yorgunluğu azaltma', 'Odaklanma artırma', 'Göz sağlığı'],
      instructions: [
        '20 saniye uzak bir noktaya bakın',
        '20 saniye yakın bir noktaya bakın',
        'Gözlerinizi kapatın',
        'Dairesel hareket yapın',
        '5 kez tekrarlayın'
      ],
      icon: '👁️',
      color: '#EF4444',
    },
    {
      id: 'eye-massage',
      name: 'Göz Masajı',
      description: 'Göz çevresi kaslarını rahatlatmak için masaj',
      duration: 2,
      category: 'eye-care',
      difficulty: 'easy',
      equipment: [],
      benefits: ['Göz gerginliği azaltma', 'Kan dolaşımı artırma', 'Rahatlama'],
      instructions: [
        'Gözlerinizi kapatın',
        'Hafifçe masaj yapın',
        'Dairesel hareketler',
        '5 dakika devam edin',
        'Derin nefes alın'
      ],
      icon: '👀',
      color: '#EF4444',
    },

    // Hydration Activities
    {
      id: 'water-break',
      name: 'Su Molası',
      description: 'Hidrasyon için su içme molası',
      duration: 2,
      category: 'hydration',
      difficulty: 'easy',
      equipment: ['Su'],
      benefits: ['Hidrasyon', 'Enerji artırma', 'Beyin fonksiyonu'],
      instructions: [
        '1 bardak su alın',
        'Yavaşça için',
        'Her yudumda düşünün',
        'Vücudunuza teşekkür edin',
        '2 dakika devam edin'
      ],
      icon: '💧',
      color: '#06B6D4',
    },
  ]);

  // Get activities by category
  const getActivitiesByCategory = useCallback((category: BreakActivity['category']) => {
    return breakActivities.filter(activity => activity.category === category);
  }, [breakActivities]);

  // Get activities by duration
  const getActivitiesByDuration = useCallback((maxDuration: number) => {
    return breakActivities.filter(activity => activity.duration <= maxDuration);
  }, [breakActivities]);

  // Get activities by difficulty
  const getActivitiesByDifficulty = useCallback((difficulty: BreakActivity['difficulty']) => {
    return breakActivities.filter(activity => activity.difficulty === difficulty);
  }, [breakActivities]);

  // Generate break session based on available time and energy
  const generateBreakSession = useCallback((
    availableTime: number,
    energyLevel: 'low' | 'medium' | 'high',
    mood: 'tired' | 'stressed' | 'neutral' | 'energized' | 'focused'
  ): BreakSession => {
    const session: BreakSession = {
      id: Date.now().toString(),
      activities: [],
      totalDuration: 0,
      startTime: new Date(),
      isCompleted: false,
      energyLevel,
      mood,
    };

    // Filter activities based on energy level and mood
    let suitableActivities = breakActivities;

    if (energyLevel === 'low') {
      suitableActivities = suitableActivities.filter(a => a.difficulty === 'easy');
    } else if (energyLevel === 'high') {
      suitableActivities = suitableActivities.filter(a => a.difficulty !== 'hard');
    }

    if (mood === 'tired') {
      suitableActivities = suitableActivities.filter(a => 
        a.category === 'breathing' || a.category === 'mindfulness'
      );
    } else if (mood === 'stressed') {
      suitableActivities = suitableActivities.filter(a => 
        a.category === 'breathing' || a.category === 'stretching'
      );
    }

    // Select activities that fit within available time
    const selectedActivities: BreakActivity[] = [];
    let remainingTime = availableTime;

    // Always include breathing if time allows
    const breathingActivity = suitableActivities.find(a => a.category === 'breathing');
    if (breathingActivity && breathingActivity.duration <= remainingTime) {
      selectedActivities.push(breathingActivity);
      remainingTime -= breathingActivity.duration;
    }

    // Add other activities
    const shuffledActivities = [...suitableActivities].sort(() => Math.random() - 0.5);
    
    for (const activity of shuffledActivities) {
      if (activity.duration <= remainingTime && !selectedActivities.includes(activity)) {
        selectedActivities.push(activity);
        remainingTime -= activity.duration;
      }
    }

    session.activities = selectedActivities;
    session.totalDuration = selectedActivities.reduce((sum, a) => sum + a.duration, 0);

    return session;
  }, [breakActivities]);

  // Get quick break suggestions
  const getQuickBreakSuggestions = useCallback((timeAvailable: number) => {
    const suggestions: BreakActivity[] = [];
    
    // Quick activities (1-2 minutes)
    if (timeAvailable >= 1) {
      suggestions.push(...breakActivities.filter(a => a.duration <= 2));
    }
    
    // Medium activities (3-5 minutes)
    if (timeAvailable >= 3) {
      suggestions.push(...breakActivities.filter(a => a.duration >= 3 && a.duration <= 5));
    }
    
    // Long activities (5+ minutes)
    if (timeAvailable >= 5) {
      suggestions.push(...breakActivities.filter(a => a.duration > 5));
    }

    return suggestions.slice(0, 6); // Return top 6 suggestions
  }, [breakActivities]);

  // Get category statistics
  const getCategoryStats = useCallback(() => {
    const stats = breakActivities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = 0;
      }
      acc[activity.category]++;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  }, [breakActivities]);

  return {
    breakActivities,
    getActivitiesByCategory,
    getActivitiesByDuration,
    getActivitiesByDifficulty,
    generateBreakSession,
    getQuickBreakSuggestions,
    getCategoryStats,
  };
};
