import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tag {
  id: string;
  name: string;
  color: string;
  emoji: string;
  category: 'work' | 'personal' | 'health' | 'learning' | 'other';
  usageCount: number;
  createdAt: Date;
}

interface TagState {
  tags: Tag[];
  recentTags: Tag[];

  // Actions
  addTag: (
    name: string,
    color: string,
    emoji: string,
    category: Tag['category']
  ) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  incrementUsage: (tagName: string) => void;
  getTagsByCategory: (category: Tag['category']) => Tag[];
  getMostUsedTags: (limit?: number) => Tag[];
}

const defaultTags: Tag[] = [
  {
    id: 'work-1',
    name: 'İş',
    color: '#3B82F6',
    emoji: '💼',
    category: 'work',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'personal-1',
    name: 'Kişisel',
    color: '#10B981',
    emoji: '👤',
    category: 'personal',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'health-1',
    name: 'Sağlık',
    color: '#EF4444',
    emoji: '🏥',
    category: 'health',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'learning-1',
    name: 'Öğrenme',
    color: '#8B5CF6',
    emoji: '📚',
    category: 'learning',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'urgent-1',
    name: 'Acil',
    color: '#F59E0B',
    emoji: '🚨',
    category: 'work',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'meeting-1',
    name: 'Toplantı',
    color: '#06B6D4',
    emoji: '🤝',
    category: 'work',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'project-1',
    name: 'Proje',
    color: '#84CC16',
    emoji: '🚀',
    category: 'work',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'exercise-1',
    name: 'Egzersiz',
    color: '#F97316',
    emoji: '💪',
    category: 'health',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'reading-1',
    name: 'Okuma',
    color: '#EC4899',
    emoji: '📖',
    category: 'learning',
    usageCount: 0,
    createdAt: new Date(),
  },
  {
    id: 'family-1',
    name: 'Aile',
    color: '#14B8A6',
    emoji: '👨‍👩‍👧‍👦',
    category: 'personal',
    usageCount: 0,
    createdAt: new Date(),
  },
];

const tagColors = [
  '#3B82F6',
  '#10B981',
  '#EF4444',
  '#8B5CF6',
  '#F59E0B',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
  '#F43F5E',
  '#0EA5E9',
  '#22C55E',
  '#A855F7',
];

const tagEmojis = [
  '💼',
  '👤',
  '🏥',
  '📚',
  '🚨',
  '🤝',
  '🚀',
  '💪',
  '📖',
  '👨‍👩‍👧‍👦',
  '💡',
  '🎯',
  '⭐',
  '🔥',
  '💎',
  '🌟',
  '🎨',
  '🎵',
  '🍕',
  '☕',
];

export const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tags: defaultTags,
      recentTags: [],

      addTag: (name, color, emoji, category) => {
        const newTag: Tag = {
          id: Date.now().toString(),
          name,
          color,
          emoji,
          category,
          usageCount: 0,
          createdAt: new Date(),
        };

        set({
          tags: [...get().tags, newTag],
        });
      },

      updateTag: (id, updates) => {
        set({
          tags: get().tags.map(tag =>
            tag.id === id ? { ...tag, ...updates } : tag
          ),
        });
      },

      deleteTag: id => {
        set({
          tags: get().tags.filter(tag => tag.id !== id),
        });
      },

      incrementUsage: tagName => {
        const state = get();
        const updatedTags = state.tags.map(tag =>
          tag.name === tagName
            ? { ...tag, usageCount: tag.usageCount + 1 }
            : tag
        );

        // Update recent tags
        const tag = updatedTags.find(t => t.name === tagName);
        if (tag) {
          const recentTags = state.recentTags.filter(t => t.name !== tagName);
          recentTags.unshift(tag);
          set({
            tags: updatedTags,
            recentTags: recentTags.slice(0, 10), // Keep only 10 recent tags
          });
        } else {
          set({ tags: updatedTags });
        }
      },

      getTagsByCategory: category => {
        return get().tags.filter(tag => tag.category === category);
      },

      getMostUsedTags: (limit = 10) => {
        return get()
          .tags.sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit);
      },
    }),
    {
      name: 'tag-storage',
      partialize: state => ({ tags: state.tags, recentTags: state.recentTags }),
    }
  )
);
