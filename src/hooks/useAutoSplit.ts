import { useState, useCallback } from 'react';
import { usePomodoroStore, Task } from '../store/usePomodoroStore';
import { useTagStore } from '../store/useTagStore';

export interface SplitRule {
  id: string;
  name: string;
  description: string;
  condition: (task: Task) => boolean;
  splitStrategy: (task: Task) => Task[];
  priority: number;
  isEnabled: boolean;
}

export interface SplitResult {
  originalTask: Task;
  splitTasks: Task[];
  splitStrategy: string;
  totalPomodoros: number;
  estimatedTime: number; // in minutes
}

export const useAutoSplit = () => {
  const { tasks, addTask, updateTask, deleteTask } = usePomodoroStore();
  const { tags } = useTagStore();

  const [splitRules, setSplitRules] = useState<SplitRule[]>([
    // Rule 1: Long tasks (5+ pomodoros)
    {
      id: 'long-task-split',
      name: 'Uzun Görev Bölme',
      description: '5+ pomodoro olan görevleri otomatik böl',
      condition: task => task.estimatedPomodoros >= 5,
      splitStrategy: task => {
        const pomodoros = task.estimatedPomodoros;
        const parts = Math.ceil(pomodoros / 3); // Max 3 pomodoro per part
        const tasks: Task[] = [];

        for (let i = 0; i < parts; i++) {
          const partPomodoros = Math.min(3, pomodoros - i * 3);
          tasks.push({
            ...task,
            id: `${task.id}-part-${i + 1}`,
            title: `${task.title} - Bölüm ${i + 1}`,
            estimatedPomodoros: partPomodoros,
            description: `${task.description}\n\nBölüm ${i + 1}/${parts}`,
            tags: [...task.tags, 'otomatik-bölünmüş'],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return tasks;
      },
      priority: 1,
      isEnabled: true,
    },

    // Rule 2: Complex tasks with multiple aspects
    {
      id: 'complex-task-split',
      name: 'Karmaşık Görev Bölme',
      description: 'Çoklu etiketli karmaşık görevleri böl',
      condition: task => task.tags.length >= 3 && task.estimatedPomodoros >= 4,
      splitStrategy: task => {
        const tasks: Task[] = [];
        const tagsPerTask = Math.ceil(task.tags.length / 2);

        // Split by tags
        for (let i = 0; i < 2; i++) {
          const startIndex = i * tagsPerTask;
          const endIndex = Math.min(startIndex + tagsPerTask, task.tags.length);
          const taskTags = task.tags.slice(startIndex, endIndex);

          tasks.push({
            ...task,
            id: `${task.id}-aspect-${i + 1}`,
            title: `${task.title} - ${taskTags[0]}`,
            estimatedPomodoros: Math.ceil(task.estimatedPomodoros / 2),
            description: `${task.description}\n\nOdak: ${taskTags.join(', ')}`,
            tags: taskTags,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        return tasks;
      },
      priority: 2,
      isEnabled: true,
    },

    // Rule 3: High priority long tasks
    {
      id: 'priority-task-split',
      name: 'Yüksek Öncelik Bölme',
      description: 'Yüksek öncelikli uzun görevleri böl',
      condition: task =>
        task.priority === 'high' && task.estimatedPomodoros >= 4,
      splitStrategy: task => {
        const tasks: Task[] = [];
        const phases = ['Planlama', 'Uygulama', 'Kontrol'];

        phases.forEach((phase, index) => {
          tasks.push({
            ...task,
            id: `${task.id}-phase-${index + 1}`,
            title: `${task.title} - ${phase}`,
            estimatedPomodoros: Math.ceil(task.estimatedPomodoros / 3),
            description: `${task.description}\n\nAşama: ${phase}`,
            tags: [...task.tags, phase.toLowerCase()],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });

        return tasks;
      },
      priority: 3,
      isEnabled: true,
    },

    // Rule 4: Learning/Study tasks
    {
      id: 'learning-task-split',
      name: 'Öğrenme Görev Bölme',
      description: 'Öğrenme görevlerini aşamalara böl',
      condition: task =>
        task.tags.some(tag =>
          ['öğrenme', 'eğitim', 'çalışma', 'okuma'].includes(tag.toLowerCase())
        ),
      splitStrategy: task => {
        const tasks: Task[] = [];
        const phases = ['Araştırma', 'Öğrenme', 'Uygulama', 'Tekrar'];

        phases.forEach((phase, index) => {
          tasks.push({
            ...task,
            id: `${task.id}-learn-${index + 1}`,
            title: `${task.title} - ${phase}`,
            estimatedPomodoros: Math.ceil(task.estimatedPomodoros / 4),
            description: `${task.description}\n\nÖğrenme Aşaması: ${phase}`,
            tags: [...task.tags, phase.toLowerCase()],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });

        return tasks;
      },
      priority: 4,
      isEnabled: true,
    },
  ]);

  // Analyze task for splitting
  const analyzeTask = useCallback(
    (task: Task): SplitResult | null => {
      const applicableRules = splitRules
        .filter(rule => rule.isEnabled && rule.condition(task))
        .sort((a, b) => a.priority - b.priority);

      if (applicableRules.length === 0) {
        return null;
      }

      const rule = applicableRules[0];
      const splitTasks = rule.splitStrategy(task);

      if (splitTasks.length <= 1) {
        return null;
      }

      const totalPomodoros = splitTasks.reduce(
        (sum, t) => sum + t.estimatedPomodoros,
        0
      );
      const estimatedTime = totalPomodoros * 25; // 25 minutes per pomodoro

      return {
        originalTask: task,
        splitTasks,
        splitStrategy: rule.name,
        totalPomodoros,
        estimatedTime,
      };
    },
    [splitRules]
  );

  // Auto-split a task
  const autoSplitTask = useCallback(
    (task: Task): SplitResult | null => {
      const splitResult = analyzeTask(task);
      if (!splitResult) return null;

      // Add split tasks
      splitResult.splitTasks.forEach(splitTask => {
        addTask(splitTask);
      });

      // Mark original task as completed (replaced by split tasks)
      updateTask(task.id, { isCompleted: true });

      return splitResult;
    },
    [analyzeTask, addTask, updateTask]
  );

  // Get split suggestions for a task
  const getSplitSuggestions = useCallback(
    (task: Task) => {
      const splitResult = analyzeTask(task);
      if (!splitResult) return null;

      return {
        canSplit: true,
        suggestedParts: splitResult.splitTasks.length,
        estimatedTime: splitResult.estimatedTime,
        strategy: splitResult.splitStrategy,
        preview: splitResult.splitTasks.map(t => ({
          title: t.title,
          pomodoros: t.estimatedPomodoros,
          tags: t.tags,
        })),
      };
    },
    [analyzeTask]
  );

  // Get tasks that can be split
  const getSplittableTasks = useCallback(() => {
    return (tasks || []).filter(task => {
      if (task.isCompleted) return false;
      return splitRules.some(rule => rule.isEnabled && rule.condition(task));
    });
  }, [tasks, splitRules]);

  // Bulk split multiple tasks
  const bulkSplitTasks = useCallback(
    (taskIds: string[]) => {
      const results: SplitResult[] = [];

      taskIds.forEach(taskId => {
        const task = tasks?.find(t => t.id === taskId);
        if (task) {
          const result = autoSplitTask(task);
          if (result) {
            results.push(result);
          }
        }
      });

      return results;
    },
    [tasks, autoSplitTask]
  );

  // Update split rules
  const updateSplitRule = useCallback(
    (ruleId: string, updates: Partial<SplitRule>) => {
      setSplitRules(prev =>
        prev.map(rule => (rule.id === ruleId ? { ...rule, ...updates } : rule))
      );
    },
    []
  );

  // Add custom split rule
  const addCustomSplitRule = useCallback((rule: Omit<SplitRule, 'id'>) => {
    const newRule: SplitRule = {
      ...rule,
      id: Date.now().toString(),
    };
    setSplitRules(prev => [...prev, newRule]);
  }, []);

  // Remove split rule
  const removeSplitRule = useCallback((ruleId: string) => {
    setSplitRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  return {
    splitRules,
    analyzeTask,
    autoSplitTask,
    getSplitSuggestions,
    getSplittableTasks,
    bulkSplitTasks,
    updateSplitRule,
    addCustomSplitRule,
    removeSplitRule,
  };
};
