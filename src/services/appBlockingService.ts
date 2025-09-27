import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Linking } from 'react-native';

export interface BlockedApp {
  id: string;
  name: string;
  packageName: string;
  icon?: string;
  category: 'social' | 'entertainment' | 'news' | 'shopping' | 'other';
  isBlocked: boolean;
}

export interface BlockedWebsite {
  id: string;
  name: string;
  url: string;
  category: 'social' | 'entertainment' | 'news' | 'shopping' | 'other';
  isBlocked: boolean;
}

export interface BlockingSettings {
  enabled: boolean;
  blockDuringPomodoro: boolean;
  blockDuringBreaks: boolean;
  strictMode: boolean; // Block even if app is in background
  allowlist: string[]; // Apps that are always allowed
  schedule: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
}

class AppBlockingService {
  private settings: BlockingSettings = {
    enabled: false,
    blockDuringPomodoro: true,
    blockDuringBreaks: false,
    strictMode: false,
    allowlist: [],
    schedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
      days: [1, 2, 3, 4, 5], // Monday to Friday
    },
  };

  private blockedApps: BlockedApp[] = [];
  private blockedWebsites: BlockedWebsite[] = [];

  async initialize(): Promise<void> {
    try {
      // Load settings
      const savedSettings = await AsyncStorage.getItem('appBlockingSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }

      // Load blocked apps
      const savedApps = await AsyncStorage.getItem('blockedApps');
      if (savedApps) {
        this.blockedApps = JSON.parse(savedApps);
      } else {
        // Initialize with common distracting apps
        this.blockedApps = this.getDefaultBlockedApps();
        await this.saveBlockedApps();
      }

      // Load blocked websites
      const savedWebsites = await AsyncStorage.getItem('blockedWebsites');
      if (savedWebsites) {
        this.blockedWebsites = JSON.parse(savedWebsites);
      } else {
        // Initialize with common distracting websites
        this.blockedWebsites = this.getDefaultBlockedWebsites();
        await this.saveBlockedWebsites();
      }
    } catch (error) {
      console.error('App blocking service initialization failed:', error);
    }
  }

  private getDefaultBlockedApps(): BlockedApp[] {
    return [
      {
        id: 'instagram',
        name: 'Instagram',
        packageName: 'com.instagram.android',
        category: 'social',
        isBlocked: true,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        packageName: 'com.facebook.katana',
        category: 'social',
        isBlocked: true,
      },
      {
        id: 'twitter',
        name: 'Twitter',
        packageName: 'com.twitter.android',
        category: 'social',
        isBlocked: true,
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        packageName: 'com.zhiliaoapp.musically',
        category: 'entertainment',
        isBlocked: true,
      },
      {
        id: 'youtube',
        name: 'YouTube',
        packageName: 'com.google.android.youtube',
        category: 'entertainment',
        isBlocked: true,
      },
      {
        id: 'netflix',
        name: 'Netflix',
        packageName: 'com.netflix.mediaclient',
        category: 'entertainment',
        isBlocked: true,
      },
    ];
  }

  private getDefaultBlockedWebsites(): BlockedWebsite[] {
    return [
      {
        id: 'facebook-web',
        name: 'Facebook',
        url: 'facebook.com',
        category: 'social',
        isBlocked: true,
      },
      {
        id: 'instagram-web',
        name: 'Instagram',
        url: 'instagram.com',
        category: 'social',
        isBlocked: true,
      },
      {
        id: 'twitter-web',
        name: 'Twitter',
        url: 'twitter.com',
        category: 'social',
        isBlocked: true,
      },
      {
        id: 'youtube-web',
        name: 'YouTube',
        url: 'youtube.com',
        category: 'entertainment',
        isBlocked: true,
      },
      {
        id: 'reddit',
        name: 'Reddit',
        url: 'reddit.com',
        category: 'entertainment',
        isBlocked: true,
      },
    ];
  }

  // Settings management
  async updateSettings(newSettings: Partial<BlockingSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await AsyncStorage.setItem(
      'appBlockingSettings',
      JSON.stringify(this.settings)
    );
  }

  getSettings(): BlockingSettings {
    return { ...this.settings };
  }

  // App management
  async addBlockedApp(app: Omit<BlockedApp, 'id'>): Promise<void> {
    const newApp: BlockedApp = {
      ...app,
      id: `app-${Date.now()}`,
    };
    this.blockedApps.push(newApp);
    await this.saveBlockedApps();
  }

  async removeBlockedApp(appId: string): Promise<void> {
    this.blockedApps = this.blockedApps.filter(app => app.id !== appId);
    await this.saveBlockedApps();
  }

  async updateBlockedApp(
    appId: string,
    updates: Partial<BlockedApp>
  ): Promise<void> {
    const index = this.blockedApps.findIndex(app => app.id === appId);
    if (index !== -1) {
      this.blockedApps[index] = { ...this.blockedApps[index], ...updates };
      await this.saveBlockedApps();
    }
  }

  getBlockedApps(): BlockedApp[] {
    return [...this.blockedApps];
  }

  private async saveBlockedApps(): Promise<void> {
    await AsyncStorage.setItem('blockedApps', JSON.stringify(this.blockedApps));
  }

  // Website management
  async addBlockedWebsite(website: Omit<BlockedWebsite, 'id'>): Promise<void> {
    const newWebsite: BlockedWebsite = {
      ...website,
      id: `website-${Date.now()}`,
    };
    this.blockedWebsites.push(newWebsite);
    await this.saveBlockedWebsites();
  }

  async removeBlockedWebsite(websiteId: string): Promise<void> {
    this.blockedWebsites = this.blockedWebsites.filter(
      website => website.id !== websiteId
    );
    await this.saveBlockedWebsites();
  }

  async updateBlockedWebsite(
    websiteId: string,
    updates: Partial<BlockedWebsite>
  ): Promise<void> {
    const index = this.blockedWebsites.findIndex(
      website => website.id === websiteId
    );
    if (index !== -1) {
      this.blockedWebsites[index] = {
        ...this.blockedWebsites[index],
        ...updates,
      };
      await this.saveBlockedWebsites();
    }
  }

  getBlockedWebsites(): BlockedWebsite[] {
    return [...this.blockedWebsites];
  }

  private async saveBlockedWebsites(): Promise<void> {
    await AsyncStorage.setItem(
      'blockedWebsites',
      JSON.stringify(this.blockedWebsites)
    );
  }

  // Blocking logic
  isBlockingActive(): boolean {
    if (!this.settings.enabled) return false;

    // Check schedule
    if (this.settings.schedule.enabled) {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.toTimeString().slice(0, 5);

      if (!this.settings.schedule.days.includes(currentDay)) {
        return false;
      }

      if (
        currentTime < this.settings.schedule.startTime ||
        currentTime > this.settings.schedule.endTime
      ) {
        return false;
      }
    }

    return true;
  }

  shouldBlockApp(
    packageName: string,
    isPomodoroActive: boolean,
    isBreakActive: boolean
  ): boolean {
    if (!this.isBlockingActive()) return false;

    // Check if app is in allowlist
    if (this.settings.allowlist.includes(packageName)) return false;

    // Check if app is blocked
    const blockedApp = this.blockedApps.find(
      app => app.packageName === packageName && app.isBlocked
    );

    if (!blockedApp) return false;

    // Check blocking conditions
    if (isPomodoroActive && this.settings.blockDuringPomodoro) return true;
    if (isBreakActive && this.settings.blockDuringBreaks) return true;

    return false;
  }

  shouldBlockWebsite(
    url: string,
    isPomodoroActive: boolean,
    isBreakActive: boolean
  ): boolean {
    if (!this.isBlockingActive()) return false;

    // Check if website is blocked
    const blockedWebsite = this.blockedWebsites.find(
      website => url.includes(website.url) && website.isBlocked
    );

    if (!blockedWebsite) return false;

    // Check blocking conditions
    if (isPomodoroActive && this.settings.blockDuringPomodoro) return true;
    if (isBreakActive && this.settings.blockDuringBreaks) return true;

    return false;
  }

  // App detection (simplified for demo)
  async getInstalledApps(): Promise<BlockedApp[]> {
    // In a real implementation, this would use native modules to get installed apps
    // For now, return a mock list
    return [
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        packageName: 'com.whatsapp',
        category: 'social',
        isBlocked: false,
      },
      {
        id: 'telegram',
        name: 'Telegram',
        packageName: 'org.telegram.messenger',
        category: 'social',
        isBlocked: false,
      },
      {
        id: 'spotify',
        name: 'Spotify',
        packageName: 'com.spotify.music',
        category: 'entertainment',
        isBlocked: false,
      },
    ];
  }

  // Blocking actions
  async blockApp(packageName: string): Promise<boolean> {
    try {
      // In a real implementation, this would use device admin or accessibility services
      // to block the app from opening
      console.log(`Blocking app: ${packageName}`);
      return true;
    } catch (error) {
      console.error('Failed to block app:', error);
      return false;
    }
  }

  async unblockApp(packageName: string): Promise<boolean> {
    try {
      console.log(`Unblocking app: ${packageName}`);
      return true;
    } catch (error) {
      console.error('Failed to unblock app:', error);
      return false;
    }
  }

  // Statistics
  async getBlockingStats(): Promise<{
    totalBlocks: number;
    blocksToday: number;
    mostBlockedApps: { name: string; count: number }[];
    mostBlockedWebsites: { name: string; count: number }[];
  }> {
    try {
      const stats = await AsyncStorage.getItem('blockingStats');
      if (stats) {
        return JSON.parse(stats);
      }
      return {
        totalBlocks: 0,
        blocksToday: 0,
        mostBlockedApps: [],
        mostBlockedWebsites: [],
      };
    } catch (error) {
      console.error('Failed to get blocking stats:', error);
      return {
        totalBlocks: 0,
        blocksToday: 0,
        mostBlockedApps: [],
        mostBlockedWebsites: [],
      };
    }
  }

  async recordBlock(appName: string, websiteName?: string): Promise<void> {
    try {
      const stats = await this.getBlockingStats();
      stats.totalBlocks += 1;
      stats.blocksToday += 1;

      if (appName) {
        const existingApp = stats.mostBlockedApps.find(
          (app: any) => app.name === appName
        );
        if (existingApp) {
          existingApp.count += 1;
        } else {
          stats.mostBlockedApps.push({ name: appName, count: 1 });
        }
      }

      if (websiteName) {
        const existingWebsite = stats.mostBlockedWebsites.find(
          (site: any) => site.name === websiteName
        );
        if (existingWebsite) {
          existingWebsite.count += 1;
        } else {
          stats.mostBlockedWebsites.push({ name: websiteName, count: 1 });
        }
      }

      await AsyncStorage.setItem('blockingStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to record block:', error);
    }
  }
}

export const appBlockingService = new AppBlockingService();
