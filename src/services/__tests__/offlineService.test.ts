import { OfflineService, offlineService } from '../offlineService';
import { SyncAction } from '../../store/useOfflineStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

const mockAsyncStorage = require('@react-native-async-storage/async-storage');

describe('OfflineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = OfflineService.getInstance();
    const instance2 = OfflineService.getInstance();
    expect(instance1).toBe(instance2);
    expect(instance1).toBe(offlineService);
  });

  it('should cache data correctly', async () => {
    const testData = { test: 'data' };
    mockAsyncStorage.setItem.mockResolvedValueOnce(undefined);

    await offlineService.cacheData('test_key', testData);

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      'cache_test_key',
      expect.stringContaining('"test":"data"')
    );
  });

  it('should retrieve cached data correctly', async () => {
    const testData = { test: 'data' };
    const cachedItem = {
      data: testData,
      timestamp: Date.now(),
      ttl: null,
    };

    mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cachedItem));

    const result = await offlineService.getCachedData('test_key');
    expect(result).toEqual(testData);
  });

  it('should handle TTL expiration', async () => {
    const testData = { test: 'data' };
    const expiredItem = {
      data: testData,
      timestamp: Date.now() - 10000, // 10 seconds ago
      ttl: 5000, // 5 second TTL
    };

    mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(expiredItem));
    mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

    const result = await offlineService.getCachedData('test_key');
    expect(result).toBeNull();
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cache_test_key');
  });

  it('should clear specific cache', async () => {
    mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined);

    await offlineService.clearCache('test_key');

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('cache_test_key');
  });

  it('should clear all cache', async () => {
    const allKeys = ['cache_key1', 'cache_key2', 'other_key'];
    mockAsyncStorage.getAllKeys.mockResolvedValueOnce(allKeys);
    mockAsyncStorage.multiRemove.mockResolvedValueOnce(undefined);

    await offlineService.clearAllCache();

    expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
      'cache_key1',
      'cache_key2',
    ]);
  });

  it('should get cache info', async () => {
    const allKeys = ['cache_key1', 'cache_key2', 'other_key'];
    mockAsyncStorage.getAllKeys.mockResolvedValueOnce(allKeys);
    mockAsyncStorage.getItem
      .mockResolvedValueOnce('{"data":"test1"}') // 16 bytes
      .mockResolvedValueOnce('{"data":"test2"}'); // 16 bytes

    const info = await offlineService.getCacheInfo();

    expect(info.totalItems).toBe(2);
    expect(info.totalSize).toBe(32); // 16 + 16
  });

  it('should sync actions in background', async () => {
    const actions: SyncAction[] = [
      {
        id: '1',
        type: 'CREATE_TASK',
        payload: { title: 'Test Task' },
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
      },
      {
        id: '2',
        type: 'UPDATE_TASK',
        payload: { id: '1', updates: { title: 'Updated Task' } },
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
      },
    ];

    // Mock successful sync
    jest
      .spyOn(offlineService as any, 'simulateServerSync')
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const failedActions = await offlineService.syncInBackground(actions);

    expect(failedActions).toHaveLength(0);
  });

  it('should handle failed sync actions', async () => {
    const actions: SyncAction[] = [
      {
        id: '1',
        type: 'CREATE_TASK',
        payload: { title: 'Test Task' },
        timestamp: new Date(),
        retryCount: 0,
        maxRetries: 3,
      },
    ];

    // Mock failed sync
    jest
      .spyOn(offlineService as any, 'simulateServerSync')
      .mockRejectedValueOnce(new Error('Network error'));

    const failedActions = await offlineService.syncInBackground(actions);

    expect(failedActions).toHaveLength(1);
    expect(failedActions[0].id).toBe('1');
  });

  it('should configure caching', () => {
    offlineService.configureCaching({
      key: 'test_cache',
      ttl: 60000,
      maxSize: 100,
    });

    // Since configureCaching is private, we test it indirectly
    expect(() =>
      offlineService.configureCaching({
        key: 'test_cache',
        ttl: 60000,
        maxSize: 100,
      })
    ).not.toThrow();
  });

  it('should preload essential data', async () => {
    const configureCachingSpy = jest.spyOn(offlineService, 'configureCaching');

    await offlineService.preloadEssentialData();

    expect(configureCachingSpy).toHaveBeenCalledTimes(3);
    expect(configureCachingSpy).toHaveBeenCalledWith({
      key: 'user_settings',
      ttl: 24 * 60 * 60 * 1000,
    });
  });
});
