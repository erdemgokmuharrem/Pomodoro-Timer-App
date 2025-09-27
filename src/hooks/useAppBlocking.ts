import { useState, useEffect, useCallback } from 'react';
import {
  appBlockingService,
  BlockedApp,
  BlockedWebsite,
  BlockingSettings,
} from '../services/appBlockingService';

export interface UseAppBlockingReturn {
  // Settings
  settings: BlockingSettings;
  updateSettings: (newSettings: Partial<BlockingSettings>) => Promise<void>;

  // Apps
  blockedApps: BlockedApp[];
  installedApps: BlockedApp[];
  addBlockedApp: (app: Omit<BlockedApp, 'id'>) => Promise<void>;
  removeBlockedApp: (appId: string) => Promise<void>;
  updateBlockedApp: (
    appId: string,
    updates: Partial<BlockedApp>
  ) => Promise<void>;

  // Websites
  blockedWebsites: BlockedWebsite[];
  addBlockedWebsite: (website: Omit<BlockedWebsite, 'id'>) => Promise<void>;
  removeBlockedWebsite: (websiteId: string) => Promise<void>;
  updateBlockedWebsite: (
    websiteId: string,
    updates: Partial<BlockedWebsite>
  ) => Promise<void>;

  // Blocking logic
  isBlockingActive: boolean;
  shouldBlockApp: (
    packageName: string,
    isPomodoroActive: boolean,
    isBreakActive: boolean
  ) => boolean;
  shouldBlockWebsite: (
    url: string,
    isPomodoroActive: boolean,
    isBreakActive: boolean
  ) => boolean;

  // Actions
  blockApp: (packageName: string) => Promise<boolean>;
  unblockApp: (packageName: string) => Promise<boolean>;
  recordBlock: (appName: string, websiteName?: string) => Promise<void>;

  // Statistics
  stats: {
    totalBlocks: number;
    blocksToday: number;
    mostBlockedApps: { name: string; count: number }[];
    mostBlockedWebsites: { name: string; count: number }[];
  };
  refreshStats: () => Promise<void>;

  // Loading states
  loading: boolean;
  error: string | null;
}

export const useAppBlocking = (): UseAppBlockingReturn => {
  const [settings, setSettings] = useState<BlockingSettings>({
    enabled: false,
    blockDuringPomodoro: true,
    blockDuringBreaks: false,
    strictMode: false,
    allowlist: [],
    schedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
      days: [1, 2, 3, 4, 5],
    },
  });

  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [blockedWebsites, setBlockedWebsites] = useState<BlockedWebsite[]>([]);
  const [installedApps, setInstalledApps] = useState<BlockedApp[]>([]);
  const [stats, setStats] = useState({
    totalBlocks: 0,
    blocksToday: 0,
    mostBlockedApps: [] as { name: string; count: number }[],
    mostBlockedWebsites: [] as { name: string; count: number }[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await appBlockingService.initialize();

        const currentSettings = appBlockingService.getSettings();
        const currentBlockedApps = appBlockingService.getBlockedApps();
        const currentBlockedWebsites = appBlockingService.getBlockedWebsites();
        const currentInstalledApps =
          await appBlockingService.getInstalledApps();
        const currentStats = await appBlockingService.getBlockingStats();

        setSettings(currentSettings);
        setBlockedApps(currentBlockedApps);
        setBlockedWebsites(currentBlockedWebsites);
        setInstalledApps(currentInstalledApps);
        setStats(currentStats);
      } catch (err) {
        setError('Failed to initialize app blocking service');
        console.error('App blocking initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Update settings
  const updateSettings = useCallback(
    async (newSettings: Partial<BlockingSettings>) => {
      try {
        await appBlockingService.updateSettings(newSettings);
        const updatedSettings = appBlockingService.getSettings();
        setSettings(updatedSettings);
      } catch (err) {
        setError('Failed to update blocking settings');
        console.error('Blocking settings update error:', err);
      }
    },
    []
  );

  // App management
  const addBlockedApp = useCallback(async (app: Omit<BlockedApp, 'id'>) => {
    try {
      await appBlockingService.addBlockedApp(app);
      const updatedApps = appBlockingService.getBlockedApps();
      setBlockedApps(updatedApps);
    } catch (err) {
      setError('Failed to add blocked app');
      console.error('Add blocked app error:', err);
    }
  }, []);

  const removeBlockedApp = useCallback(async (appId: string) => {
    try {
      await appBlockingService.removeBlockedApp(appId);
      const updatedApps = appBlockingService.getBlockedApps();
      setBlockedApps(updatedApps);
    } catch (err) {
      setError('Failed to remove blocked app');
      console.error('Remove blocked app error:', err);
    }
  }, []);

  const updateBlockedApp = useCallback(
    async (appId: string, updates: Partial<BlockedApp>) => {
      try {
        await appBlockingService.updateBlockedApp(appId, updates);
        const updatedApps = appBlockingService.getBlockedApps();
        setBlockedApps(updatedApps);
      } catch (err) {
        setError('Failed to update blocked app');
        console.error('Update blocked app error:', err);
      }
    },
    []
  );

  // Website management
  const addBlockedWebsite = useCallback(
    async (website: Omit<BlockedWebsite, 'id'>) => {
      try {
        await appBlockingService.addBlockedWebsite(website);
        const updatedWebsites = appBlockingService.getBlockedWebsites();
        setBlockedWebsites(updatedWebsites);
      } catch (err) {
        setError('Failed to add blocked website');
        console.error('Add blocked website error:', err);
      }
    },
    []
  );

  const removeBlockedWebsite = useCallback(async (websiteId: string) => {
    try {
      await appBlockingService.removeBlockedWebsite(websiteId);
      const updatedWebsites = appBlockingService.getBlockedWebsites();
      setBlockedWebsites(updatedWebsites);
    } catch (err) {
      setError('Failed to remove blocked website');
      console.error('Remove blocked website error:', err);
    }
  }, []);

  const updateBlockedWebsite = useCallback(
    async (websiteId: string, updates: Partial<BlockedWebsite>) => {
      try {
        await appBlockingService.updateBlockedWebsite(websiteId, updates);
        const updatedWebsites = appBlockingService.getBlockedWebsites();
        setBlockedWebsites(updatedWebsites);
      } catch (err) {
        setError('Failed to update blocked website');
        console.error('Update blocked website error:', err);
      }
    },
    []
  );

  // Blocking logic
  const isBlockingActive = appBlockingService.isBlockingActive();

  const shouldBlockApp = useCallback(
    (
      packageName: string,
      isPomodoroActive: boolean,
      isBreakActive: boolean
    ) => {
      return appBlockingService.shouldBlockApp(
        packageName,
        isPomodoroActive,
        isBreakActive
      );
    },
    []
  );

  const shouldBlockWebsite = useCallback(
    (url: string, isPomodoroActive: boolean, isBreakActive: boolean) => {
      return appBlockingService.shouldBlockWebsite(
        url,
        isPomodoroActive,
        isBreakActive
      );
    },
    []
  );

  // Actions
  const blockApp = useCallback(
    async (packageName: string): Promise<boolean> => {
      try {
        return await appBlockingService.blockApp(packageName);
      } catch (err) {
        setError('Failed to block app');
        console.error('Block app error:', err);
        return false;
      }
    },
    []
  );

  const unblockApp = useCallback(
    async (packageName: string): Promise<boolean> => {
      try {
        return await appBlockingService.unblockApp(packageName);
      } catch (err) {
        setError('Failed to unblock app');
        console.error('Unblock app error:', err);
        return false;
      }
    },
    []
  );

  const recordBlock = useCallback(
    async (appName: string, websiteName?: string) => {
      try {
        await appBlockingService.recordBlock(appName, websiteName);
        await refreshStats();
      } catch (err) {
        console.error('Record block error:', err);
      }
    },
    []
  );

  // Statistics
  const refreshStats = useCallback(async () => {
    try {
      const currentStats = await appBlockingService.getBlockingStats();
      setStats(currentStats);
    } catch (err) {
      console.error('Refresh stats error:', err);
    }
  }, []);

  return {
    settings,
    updateSettings,
    blockedApps,
    installedApps,
    addBlockedApp,
    removeBlockedApp,
    updateBlockedApp,
    blockedWebsites,
    addBlockedWebsite,
    removeBlockedWebsite,
    updateBlockedWebsite,
    isBlockingActive,
    shouldBlockApp,
    shouldBlockWebsite,
    blockApp,
    unblockApp,
    recordBlock,
    stats,
    refreshStats,
    loading,
    error,
  };
};
