import { useState, useCallback, useMemo } from 'react';
import { usePomodoroStore, Task } from '../store/usePomodoroStore';
import { useTagStore } from '../store/useTagStore';

export interface ContextFilter {
  id: string;
  name: string;
  type: 'tag' | 'priority' | 'duration' | 'status' | 'date';
  value: string | number | boolean;
  color?: string;
  icon?: string;
}

export interface FilterGroup {
  id: string;
  name: string;
  filters: ContextFilter[];
  isActive: boolean;
}

export const useContextFilters = () => {
  const { tasks } = usePomodoroStore();
  const { tags } = useTagStore();

  const [activeFilters, setActiveFilters] = useState<ContextFilter[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);

  // Create filter groups based on available data
  const createFilterGroups = useCallback(() => {
    const groups: FilterGroup[] = [];

    // Tag filters
    if (tags && tags.length > 0) {
      const tagFilters: ContextFilter[] = tags.map(tag => ({
        id: `tag-${tag.id}`,
        name: tag.name,
        type: 'tag',
        value: tag.id,
        color: tag.color,
        icon: tag.emoji,
      }));

      groups.push({
        id: 'tags',
        name: 'Etiketler',
        filters: tagFilters,
        isActive: false,
      });
    }

    // Priority filters
    const priorityFilters: ContextFilter[] = [
      {
        id: 'priority-high',
        name: 'Yüksek Öncelik',
        type: 'priority',
        value: 'high',
        color: '#EF4444',
        icon: '🔴',
      },
      {
        id: 'priority-medium',
        name: 'Orta Öncelik',
        type: 'priority',
        value: 'medium',
        color: '#F59E0B',
        icon: '🟡',
      },
      {
        id: 'priority-low',
        name: 'Düşük Öncelik',
        type: 'priority',
        value: 'low',
        color: '#10B981',
        icon: '🟢',
      },
    ];

    groups.push({
      id: 'priorities',
      name: 'Öncelikler',
      filters: priorityFilters,
      isActive: false,
    });

    // Duration filters
    const durationFilters: ContextFilter[] = [
      {
        id: 'duration-short',
        name: 'Kısa (1-2 pomodoro)',
        type: 'duration',
        value: 'short',
        color: '#3B82F6',
        icon: '⏱️',
      },
      {
        id: 'duration-medium',
        name: 'Orta (3-4 pomodoro)',
        type: 'duration',
        value: 'medium',
        color: '#8B5CF6',
        icon: '⏰',
      },
      {
        id: 'duration-long',
        name: 'Uzun (5+ pomodoro)',
        type: 'duration',
        value: 'long',
        color: '#EF4444',
        icon: '⏳',
      },
    ];

    groups.push({
      id: 'durations',
      name: 'Süreler',
      filters: durationFilters,
      isActive: false,
    });

    // Status filters
    const statusFilters: ContextFilter[] = [
      {
        id: 'status-completed',
        name: 'Tamamlanan',
        type: 'status',
        value: 'completed',
        color: '#10B981',
        icon: '✅',
      },
      {
        id: 'status-pending',
        name: 'Bekleyen',
        type: 'status',
        value: 'pending',
        color: '#F59E0B',
        icon: '⏳',
      },
      {
        id: 'status-in-progress',
        name: 'Devam Eden',
        type: 'status',
        value: 'in-progress',
        color: '#3B82F6',
        icon: '🔄',
      },
    ];

    groups.push({
      id: 'statuses',
      name: 'Durumlar',
      filters: statusFilters,
      isActive: false,
    });

    // Date filters
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const dateFilters: ContextFilter[] = [
      {
        id: 'date-today',
        name: 'Bugün',
        type: 'date',
        value: 'today',
        color: '#3B82F6',
        icon: '📅',
      },
      {
        id: 'date-yesterday',
        name: 'Dün',
        type: 'date',
        value: 'yesterday',
        color: '#6B7280',
        icon: '📆',
      },
      {
        id: 'date-this-week',
        name: 'Bu Hafta',
        type: 'date',
        value: 'this-week',
        color: '#8B5CF6',
        icon: '📊',
      },
    ];

    groups.push({
      id: 'dates',
      name: 'Tarihler',
      filters: dateFilters,
      isActive: false,
    });

    setFilterGroups(groups);
    return groups;
  }, [tags]);

  // Filter tasks based on active filters
  const filteredTasks = useMemo(() => {
    if (!tasks || activeFilters.length === 0) {
      return tasks || [];
    }

    return (tasks || []).filter(task => {
      return activeFilters.every(filter => {
        switch (filter.type) {
          case 'tag':
            return task.tags.includes(filter.value as string);

          case 'priority':
            return task.priority === filter.value;

          case 'duration':
            const estimatedPomodoros = task.estimatedPomodoros;
            switch (filter.value) {
              case 'short':
                return estimatedPomodoros <= 2;
              case 'medium':
                return estimatedPomodoros >= 3 && estimatedPomodoros <= 4;
              case 'long':
                return estimatedPomodoros >= 5;
              default:
                return true;
            }

          case 'status':
            switch (filter.value) {
              case 'completed':
                return task.isCompleted;
              case 'pending':
                return !task.isCompleted && task.completedPomodoros === 0;
              case 'in-progress':
                return !task.isCompleted && task.completedPomodoros > 0;
              default:
                return true;
            }

          case 'date':
            const taskDate = new Date(task.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const thisWeek = new Date(today);
            thisWeek.setDate(thisWeek.getDate() - 7);

            switch (filter.value) {
              case 'today':
                return taskDate.toDateString() === today.toDateString();
              case 'yesterday':
                return taskDate.toDateString() === yesterday.toDateString();
              case 'this-week':
                return taskDate >= thisWeek;
              default:
                return true;
            }

          default:
            return true;
        }
      });
    });
  }, [tasks, activeFilters]);

  // Add filter
  const addFilter = useCallback((filter: ContextFilter) => {
    setActiveFilters(prev => {
      const exists = prev.some(f => f.id === filter.id);
      if (exists) return prev;
      return [...prev, filter];
    });
  }, []);

  // Remove filter
  const removeFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);

  // Toggle filter
  const toggleFilter = useCallback(
    (filter: ContextFilter) => {
      const exists = activeFilters.some(f => f.id === filter.id);
      if (exists) {
        removeFilter(filter.id);
      } else {
        addFilter(filter);
      }
    },
    [activeFilters, addFilter, removeFilter]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  // Get filter statistics
  const getFilterStats = useCallback(() => {
    const totalTasks = tasks?.length || 0;
    const filteredCount = filteredTasks.length;
    const activeFilterCount = activeFilters.length;

    return {
      totalTasks,
      filteredCount,
      activeFilterCount,
      isFiltered: activeFilterCount > 0,
    };
  }, [tasks, filteredTasks, activeFilters]);

  // Get quick filter suggestions
  const getQuickFilterSuggestions = useCallback(() => {
    const suggestions: ContextFilter[] = [];

    // Most used tags
    if (tags && tags.length > 0) {
      const mostUsedTags = tags
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 3);

      mostUsedTags.forEach(tag => {
        suggestions.push({
          id: `suggestion-tag-${tag.id}`,
          name: tag.name,
          type: 'tag',
          value: tag.id,
          color: tag.color,
          icon: tag.emoji,
        });
      });
    }

    // High priority tasks
    const highPriorityTasks =
      tasks?.filter(task => task.priority === 'high' && !task.isCompleted) ||
      [];
    if (highPriorityTasks.length > 0) {
      suggestions.push({
        id: 'suggestion-high-priority',
        name: 'Yüksek Öncelik',
        type: 'priority',
        value: 'high',
        color: '#EF4444',
        icon: '🔴',
      });
    }

    // Today's tasks
    const today = new Date().toDateString();
    const todayTasks =
      tasks?.filter(
        task => new Date(task.createdAt).toDateString() === today
      ) || [];
    if (todayTasks.length > 0) {
      suggestions.push({
        id: 'suggestion-today',
        name: 'Bugün',
        type: 'date',
        value: 'today',
        color: '#3B82F6',
        icon: '📅',
      });
    }

    return suggestions;
  }, [tags, tasks]);

  // Initialize filter groups
  useState(() => {
    createFilterGroups();
  });

  return {
    activeFilters,
    filterGroups,
    filteredTasks,
    addFilter,
    removeFilter,
    toggleFilter,
    clearAllFilters,
    getFilterStats,
    getQuickFilterSuggestions,
    createFilterGroups,
  };
};
