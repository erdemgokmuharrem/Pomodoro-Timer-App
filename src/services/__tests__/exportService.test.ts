import { exportService } from '../exportService';
import { PomodoroSession, Task } from '../../store/usePomodoroStore';
import { UserStats } from '../../store/useGamificationStore';

describe('ExportService', () => {
  const mockSessions: PomodoroSession[] = [
    {
      id: '1',
      taskId: 'task1',
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:25:00Z'),
      duration: 25,
      isCompleted: true,
      isBreak: false,
      interruptions: 0,
      interruptionList: [],
    },
    {
      id: '2',
      taskId: undefined,
      startTime: new Date('2024-01-01T10:30:00Z'),
      endTime: new Date('2024-01-01T10:35:00Z'),
      duration: 5,
      isCompleted: true,
      isBreak: true,
      interruptions: 0,
      interruptionList: [],
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 'task1',
      title: 'Test Task',
      description: 'Test Description',
      estimatedPomodoros: 2,
      completedPomodoros: 1,
      priority: 'high',
      tags: ['work', 'urgent'],
      isCompleted: false,
      createdAt: new Date('2024-01-01T09:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
    },
  ];

  const mockUserStats: UserStats = {
    level: 5,
    xp: 1250,
    totalXp: 1250,
    currentStreak: 7,
    longestStreak: 15,
    totalPomodoros: 25,
    totalTasks: 10,
    totalFocusTime: 625,
    badges: [],
    achievements: [],
    lastActiveDate: '2024-01-01',
  };

  const mockSettings = {
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  };

  const mockExportData = {
    sessions: mockSessions,
    tasks: mockTasks,
    userStats: mockUserStats,
    settings: mockSettings,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };

  describe('exportToJSON', () => {
    it('should export data to JSON format', () => {
      const result = exportService.exportToJSON(mockExportData);
      const parsed = JSON.parse(result);

      expect(parsed.sessions).toHaveLength(2);
      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.userStats.level).toBe(5);
      expect(parsed.settings.pomodoroDuration).toBe(25);
      expect(parsed.version).toBe('1.0.0');
    });

    it('should format dates correctly in JSON', () => {
      const result = exportService.exportToJSON(mockExportData);
      const parsed = JSON.parse(result);

      expect(parsed.sessions[0].startTime).toBe('2024-01-01T10:00:00.000Z');
      expect(parsed.sessions[0].endTime).toBe('2024-01-01T10:25:00.000Z');
      expect(parsed.tasks[0].createdAt).toBe('2024-01-01T09:00:00.000Z');
    });
  });

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      const result = exportService.exportToCSV(mockExportData);
      
      expect(result).toContain('Pomodoro+ Export Data');
      expect(result).toContain('=== POMODORO SESSIONS ===');
      expect(result).toContain('=== TASKS ===');
      expect(result).toContain('=== USER STATISTICS ===');
      expect(result).toContain('=== BADGES ===');
    });

    it('should include session data in CSV', () => {
      const result = exportService.exportToCSV(mockExportData);
      
      expect(result).toContain('1,task1');
      expect(result).toContain('25');
      expect(result).toContain('Yes');
      expect(result).toContain('No');
    });

    it('should include task data in CSV', () => {
      const result = exportService.exportToCSV(mockExportData);
      
      expect(result).toContain('task1');
      expect(result).toContain('"Test Task"');
      expect(result).toContain('"Test Description"');
      expect(result).toContain('2');
      expect(result).toContain('1');
      expect(result).toContain('high');
    });

    it('should include user statistics in CSV', () => {
      const result = exportService.exportToCSV(mockExportData);
      
      expect(result).toContain('Level,5');
      expect(result).toContain('Total XP,1250');
      expect(result).toContain('Current Streak,7');
      expect(result).toContain('Total Pomodoros,25');
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel format', () => {
      const result = exportService.exportToExcel(mockExportData);
      
      expect(result).toContain('Pomodoro+ Export Report');
      expect(result).toContain('=== SUMMARY STATISTICS ===');
      expect(result).toContain('=== DAILY STATISTICS ===');
    });

    it('should calculate summary statistics correctly', () => {
      const result = exportService.exportToExcel(mockExportData);
      
      expect(result).toContain('Total Focus Time: 30 minutes');
      expect(result).toContain('Average Session Length: 15.0 minutes');
      expect(result).toContain('Completion Rate: 100.0%');
    });

    it('should include daily statistics', () => {
      const result = exportService.exportToExcel(mockExportData);
      
      expect(result).toContain('Date,Sessions,Pomodoros,Focus Time (min),Tasks Completed');
    });
  });

  describe('generateFileName', () => {
    it('should generate correct JSON filename', () => {
      const filename = exportService.generateFileName('json');
      expect(filename).toMatch(/^pomodoro-export-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should generate correct CSV filename', () => {
      const filename = exportService.generateFileName('csv');
      expect(filename).toMatch(/^pomodoro-export-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate correct Excel filename', () => {
      const filename = exportService.generateFileName('excel');
      expect(filename).toMatch(/^pomodoro-export-\d{4}-\d{2}-\d{2}\.excel$/);
    });
  });

  describe('prepareExportData', () => {
    it('should prepare export data correctly', () => {
      const result = exportService.prepareExportData(
        mockSessions,
        mockTasks,
        mockUserStats,
        mockSettings
      );

      expect(result.sessions).toEqual(mockSessions);
      expect(result.tasks).toEqual(mockTasks);
      expect(result.userStats).toEqual(mockUserStats);
      expect(result.settings).toEqual(mockSettings);
      expect(result.version).toBe('1.0.0');
      expect(result.exportDate).toBeDefined();
    });
  });

  describe('exportData', () => {
    it('should export JSON data successfully', async () => {
      const result = await exportService.exportData(mockExportData, 'json');
      
      expect(result.content).toBeDefined();
      expect(result.fileName).toMatch(/\.json$/);
      expect(result.filePath).toBeDefined();
    });

    it('should export CSV data successfully', async () => {
      const result = await exportService.exportData(mockExportData, 'csv');
      
      expect(result.content).toBeDefined();
      expect(result.fileName).toMatch(/\.csv$/);
      expect(result.filePath).toBeDefined();
    });

    it('should export Excel data successfully', async () => {
      const result = await exportService.exportData(mockExportData, 'excel');
      
      expect(result.content).toBeDefined();
      expect(result.fileName).toMatch(/\.excel$/);
      expect(result.filePath).toBeDefined();
    });

    it('should throw error for unsupported format', async () => {
      await expect(
        exportService.exportData(mockExportData, 'unsupported' as any)
      ).rejects.toThrow('Unsupported export format: unsupported');
    });
  });
});
