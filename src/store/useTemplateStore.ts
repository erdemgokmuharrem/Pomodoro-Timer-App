import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  estimatedPomodoros: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  category: string;
  icon: string;
  color: string;
  usageCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  isDefault: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface TemplateState {
  templates: TaskTemplate[];
  categories: TemplateCategory[];
  
  // Actions
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount' | 'lastUsed'>) => void;
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
  deleteTemplate: (id: string) => void;
  useTemplate: (id: string) => TaskTemplate | null;
  getTemplatesByCategory: (categoryId: string) => TaskTemplate[];
  getMostUsedTemplates: (limit?: number) => TaskTemplate[];
  getRecentTemplates: (limit?: number) => TaskTemplate[];
  searchTemplates: (query: string) => TaskTemplate[];
}

const defaultCategories: TemplateCategory[] = [
  {
    id: 'work',
    name: 'İş',
    icon: '💼',
    color: '#3B82F6',
    description: 'İş ile ilgili görevler',
  },
  {
    id: 'study',
    name: 'Öğrenme',
    icon: '📚',
    color: '#10B981',
    description: 'Eğitim ve öğrenme görevleri',
  },
  {
    id: 'personal',
    name: 'Kişisel',
    icon: '🏠',
    color: '#8B5CF6',
    description: 'Kişisel görevler ve projeler',
  },
  {
    id: 'health',
    name: 'Sağlık',
    icon: '🏃',
    color: '#EF4444',
    description: 'Sağlık ve fitness görevleri',
  },
  {
    id: 'creative',
    name: 'Yaratıcılık',
    icon: '🎨',
    color: '#F59E0B',
    description: 'Yaratıcı projeler ve hobiler',
  },
];

const defaultTemplates: TaskTemplate[] = [
  // Work templates
  {
    id: 'work-email',
    name: 'E-posta Kontrolü',
    description: 'Gelen e-postaları kontrol et ve yanıtla',
    estimatedPomodoros: 1,
    priority: 'medium',
    tags: ['e-posta', 'iletişim'],
    category: 'work',
    icon: '📧',
    color: '#3B82F6',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: 'work-meeting',
    name: 'Toplantı Hazırlığı',
    description: 'Toplantı için gerekli materyalleri hazırla',
    estimatedPomodoros: 2,
    priority: 'high',
    tags: ['toplantı', 'hazırlık'],
    category: 'work',
    icon: '👥',
    color: '#3B82F6',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: 'work-report',
    name: 'Rapor Yazma',
    description: 'Aylık raporu hazırla ve gözden geçir',
    estimatedPomodoros: 4,
    priority: 'high',
    tags: ['rapor', 'analiz'],
    category: 'work',
    icon: '📊',
    color: '#3B82F6',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },

  // Study templates
  {
    id: 'study-reading',
    name: 'Kitap Okuma',
    description: 'Belirlenen kitabı oku ve notlar al',
    estimatedPomodoros: 3,
    priority: 'medium',
    tags: ['okuma', 'öğrenme'],
    category: 'study',
    icon: '📖',
    color: '#10B981',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: 'study-practice',
    name: 'Pratik Yapma',
    description: 'Öğrendiklerini pratik et ve uygula',
    estimatedPomodoros: 2,
    priority: 'high',
    tags: ['pratik', 'uygulama'],
    category: 'study',
    icon: '💻',
    color: '#10B981',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: 'study-review',
    name: 'Konu Tekrarı',
    description: 'Daha önce öğrenilen konuları tekrar et',
    estimatedPomodoros: 2,
    priority: 'medium',
    tags: ['tekrar', 'gözden geçirme'],
    category: 'study',
    icon: '🔄',
    color: '#10B981',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },

  // Personal templates
  {
    id: 'personal-cleaning',
    name: 'Ev Temizliği',
    description: 'Ev temizliği ve düzenleme işleri',
    estimatedPomodoros: 3,
    priority: 'low',
    tags: ['temizlik', 'ev'],
    category: 'personal',
    icon: '🧹',
    color: '#8B5CF6',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: 'personal-planning',
    name: 'Haftalık Planlama',
    description: 'Gelecek hafta için planlar yap',
    estimatedPomodoros: 2,
    priority: 'medium',
    tags: ['planlama', 'organizasyon'],
    category: 'personal',
    icon: '📅',
    color: '#8B5CF6',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },

  // Health templates
  {
    id: 'health-exercise',
    name: 'Egzersiz',
    description: 'Fiziksel egzersiz ve antrenman',
    estimatedPomodoros: 2,
    priority: 'high',
    tags: ['egzersiz', 'sağlık'],
    category: 'health',
    icon: '🏃',
    color: '#EF4444',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: 'health-meditation',
    name: 'Meditasyon',
    description: 'Meditasyon ve nefes egzersizleri',
    estimatedPomodoros: 1,
    priority: 'medium',
    tags: ['meditasyon', 'rahatlama'],
    category: 'health',
    icon: '🧘',
    color: '#EF4444',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },

  // Creative templates
  {
    id: 'creative-writing',
    name: 'Yazı Yazma',
    description: 'Yaratıcı yazı veya blog yazısı',
    estimatedPomodoros: 3,
    priority: 'medium',
    tags: ['yazı', 'yaratıcılık'],
    category: 'creative',
    icon: '✍️',
    color: '#F59E0B',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
  {
    id: 'creative-design',
    name: 'Tasarım Çalışması',
    description: 'Grafik tasarım veya UI/UX çalışması',
    estimatedPomodoros: 4,
    priority: 'high',
    tags: ['tasarım', 'yaratıcılık'],
    category: 'creative',
    icon: '🎨',
    color: '#F59E0B',
    usageCount: 0,
    lastUsed: null,
    createdAt: new Date(),
    isDefault: true,
  },
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: defaultTemplates,
      categories: defaultCategories,

      addTemplate: (templateData) => {
        const newTemplate: TaskTemplate = {
          ...templateData,
          id: Date.now().toString(),
          createdAt: new Date(),
          usageCount: 0,
          lastUsed: null,
        };

        set({
          templates: [...get().templates, newTemplate],
        });
      },

      updateTemplate: (id, updates) => {
        set({
          templates: get().templates.map(template =>
            template.id === id
              ? { ...template, ...updates }
              : template
          ),
        });
      },

      deleteTemplate: (id) => {
        set({
          templates: get().templates.filter(template => template.id !== id),
        });
      },

      useTemplate: (id) => {
        const template = get().templates.find(t => t.id === id);
        if (!template) return null;

        // Update usage statistics
        const updatedTemplate = {
          ...template,
          usageCount: template.usageCount + 1,
          lastUsed: new Date(),
        };

        set({
          templates: get().templates.map(t =>
            t.id === id ? updatedTemplate : t
          ),
        });

        return updatedTemplate;
      },

      getTemplatesByCategory: (categoryId) => {
        return get().templates.filter(template => template.category === categoryId);
      },

      getMostUsedTemplates: (limit = 5) => {
        return get().templates
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, limit);
      },

      getRecentTemplates: (limit = 5) => {
        return get().templates
          .filter(template => template.lastUsed)
          .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
          .slice(0, limit);
      },

      searchTemplates: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().templates.filter(template =>
          template.name.toLowerCase().includes(lowercaseQuery) ||
          template.description.toLowerCase().includes(lowercaseQuery) ||
          template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
      },
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({
        templates: state.templates,
        categories: state.categories,
      }),
    }
  )
);
