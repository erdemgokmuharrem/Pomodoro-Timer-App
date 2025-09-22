import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface SyncAction {
  id: string;
  type: 'CREATE_SESSION' | 'UPDATE_SESSION' | 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'UPDATE_SETTINGS' | 'UNLOCK_BADGE' | 'UNLOCK_ACHIEVEMENT';
  payload: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  isOnline: boolean;
  syncQueue: SyncAction[];
  lastSyncTime: Date | null;
  isSyncing: boolean;
}

interface OfflineActions {
  setOnlineStatus: (isOnline: boolean) => void;
  addToSyncQueue: (action: Omit<SyncAction, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromSyncQueue: (actionId: string) => void;
  processSyncQueue: () => Promise<void>;
  retryFailedAction: (actionId: string) => void;
  clearSyncQueue: () => void;
  getQueueStatus: () => { pending: number; failed: number };
}

export const useOfflineStore = create<OfflineState & OfflineActions>()(
  persist(
    (set, get) => ({
      isOnline: true,
      syncQueue: [],
      lastSyncTime: null,
      isSyncing: false,

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        // Automatically process sync queue when coming back online
        if (isOnline && get().syncQueue.length > 0) {
          get().processSyncQueue();
        }
      },

      addToSyncQueue: (action) => {
        const newAction: SyncAction = {
          ...action,
          id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          retryCount: 0,
          maxRetries: action.maxRetries || 3,
        };

        set((state) => ({
          syncQueue: [...state.syncQueue, newAction],
        }));

        // Try to sync immediately if online
        if (get().isOnline) {
          get().processSyncQueue();
        }
      },

      removeFromSyncQueue: (actionId) => {
        set((state) => ({
          syncQueue: state.syncQueue.filter(action => action.id !== actionId),
        }));
      },

      processSyncQueue: async () => {
        const state = get();
        if (state.isSyncing || !state.isOnline || state.syncQueue.length === 0) {
          return;
        }

        set({ isSyncing: true });

        try {
          // Process actions in order
          for (const action of state.syncQueue) {
            try {
              await syncActionToServer(action);
              get().removeFromSyncQueue(action.id);
            } catch (error) {
              console.error(`Failed to sync action ${action.id}:`, error);
              
              // Retry logic
              if (action.retryCount < action.maxRetries) {
                set((state) => ({
                  syncQueue: state.syncQueue.map(a => 
                    a.id === action.id 
                      ? { ...a, retryCount: a.retryCount + 1 }
                      : a
                  ),
                }));
              } else {
                // Max retries reached, you might want to handle this differently
                console.error(`Max retries reached for action ${action.id}, removing from queue`);
                get().removeFromSyncQueue(action.id);
              }
            }
          }

          set({ lastSyncTime: new Date() });
        } finally {
          set({ isSyncing: false });
        }
      },

      retryFailedAction: (actionId) => {
        set((state) => ({
          syncQueue: state.syncQueue.map(action => 
            action.id === actionId 
              ? { ...action, retryCount: 0 }
              : action
          ),
        }));

        if (get().isOnline) {
          get().processSyncQueue();
        }
      },

      clearSyncQueue: () => {
        set({ syncQueue: [] });
      },

      getQueueStatus: () => {
        const queue = get().syncQueue;
        return {
          pending: queue.filter(a => a.retryCount < a.maxRetries).length,
          failed: queue.filter(a => a.retryCount >= a.maxRetries).length,
        };
      },
    }),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        syncQueue: state.syncQueue,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Mock sync function - in real implementation, this would call your backend API
const syncActionToServer = async (action: SyncAction): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Syncing action ${action.type} with payload:`, action.payload);
  
  // Simulate occasional failures for testing
  if (Math.random() < 0.1) {
    throw new Error('Network error');
  }
  
  // In real implementation, you would:
  // - Make HTTP request to your backend
  // - Handle different action types appropriately
  // - Return success/failure status
};

// Network monitoring hook
export const useNetworkStatus = () => {
  const setOnlineStatus = useOfflineStore((state) => state.setOnlineStatus);
  
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnlineStatus(state.isConnected ?? false);
    });

    return unsubscribe;
  }, [setOnlineStatus]);

  return useOfflineStore((state) => state.isOnline);
};
