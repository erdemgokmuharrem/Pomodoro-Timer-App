import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncAction } from '../store/useOfflineStore';

export interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items to cache
}

export class OfflineService {
  private static instance: OfflineService;
  private cacheConfigs: Map<string, CacheConfig> = new Map();

  private constructor() {}

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Configure cache for different data types
  configureCaching(config: CacheConfig): void {
    this.cacheConfigs.set(config.key, config);
  }

  // Cache data with TTL support
  async cacheData<T>(key: string, data: T): Promise<void> {
    try {
      const config = this.cacheConfigs.get(key);
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl: config?.ttl,
      };

      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));

      // Handle max size if configured
      if (config?.maxSize) {
        await this.enforceMaxSize(key, config.maxSize);
      }
    } catch (error) {
      console.error(`Failed to cache data for key ${key}:`, error);
    }
  }

  // Retrieve cached data with TTL check
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cachedItem = await AsyncStorage.getItem(`cache_${key}`);
      if (!cachedItem) return null;

      const { data, timestamp, ttl } = JSON.parse(cachedItem);

      // Check if data has expired
      if (ttl && Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Failed to get cached data for key ${key}:`, error);
      return null;
    }
  }

  // Clear specific cache
  async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error(`Failed to clear cache for key ${key}:`, error);
    }
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  // Get cache size info
  async getCacheInfo(): Promise<{ totalItems: number; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));

      let totalSize = 0;
      for (const key of cacheKeys) {
        const item = await AsyncStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }

      return {
        totalItems: cacheKeys.length,
        totalSize,
      };
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return { totalItems: 0, totalSize: 0 };
    }
  }

  // Enforce maximum cache size
  private async enforceMaxSize(key: string, maxSize: number): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const relevantKeys = keys.filter(k => k.startsWith(`cache_${key}`));

      if (relevantKeys.length <= maxSize) return;

      // Get all items with timestamps
      const items = await Promise.all(
        relevantKeys.map(async k => {
          const item = await AsyncStorage.getItem(k);
          return {
            key: k,
            timestamp: item ? JSON.parse(item).timestamp : 0,
          };
        })
      );

      // Sort by timestamp (oldest first) and remove excess items
      items.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = items.slice(0, items.length - maxSize);

      await AsyncStorage.multiRemove(toRemove.map(item => item.key));
    } catch (error) {
      console.error(`Failed to enforce max size for ${key}:`, error);
    }
  }

  // Background sync simulation
  async syncInBackground(actions: SyncAction[]): Promise<SyncAction[]> {
    const failedActions: SyncAction[] = [];

    for (const action of actions) {
      try {
        await this.simulateServerSync(action);
        console.log(`Successfully synced action: ${action.type}`);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        failedActions.push(action);
      }
    }

    return failedActions;
  }

  // Simulate server synchronization
  private async simulateServerSync(action: SyncAction): Promise<void> {
    // Simulate network delay
    await new Promise(resolve =>
      setTimeout(resolve, 500 + Math.random() * 1000)
    );

    // Simulate occasional failures
    if (Math.random() < 0.05) {
      // 5% failure rate
      throw new Error('Network error');
    }

    // Log what would be synced to server
    console.log(`Syncing to server:`, {
      type: action.type,
      payload: action.payload,
      timestamp: action.timestamp,
    });
  }

  // Preload essential data for offline use
  async preloadEssentialData(): Promise<void> {
    try {
      // Cache configurations for different data types
      this.configureCaching({
        key: 'user_settings',
        ttl: 24 * 60 * 60 * 1000, // 24 hours
      });

      this.configureCaching({
        key: 'badges',
        ttl: 12 * 60 * 60 * 1000, // 12 hours
      });

      this.configureCaching({
        key: 'achievements',
        ttl: 12 * 60 * 60 * 1000, // 12 hours
      });

      console.log('Essential data preloading configured');
    } catch (error) {
      console.error('Failed to preload essential data:', error);
    }
  }
}

// Export singleton instance
export const offlineService = OfflineService.getInstance();
