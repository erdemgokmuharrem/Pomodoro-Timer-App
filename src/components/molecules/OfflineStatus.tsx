import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useOfflineStore } from '../../store/useOfflineStore';

const OfflineStatus: React.FC = () => {
  const { 
    isOnline, 
    isSyncing, 
    getQueueStatus, 
    processSyncQueue 
  } = useOfflineStore();
  
  const queueStatus = getQueueStatus();

  if (isOnline && queueStatus.pending === 0 && queueStatus.failed === 0) {
    return null; // Don't show when online and no sync issues
  }

  return (
    <View style={[styles.container, isOnline ? styles.syncing : styles.offline]}>
      <View style={styles.content}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusText}>
            {!isOnline ? '📴 Çevrimdışı' : '🔄 Senkronizasyon'}
          </Text>
          {queueStatus.pending > 0 && (
            <Text style={styles.queueText}>
              {queueStatus.pending} işlem bekliyor
            </Text>
          )}
          {queueStatus.failed > 0 && (
            <Text style={styles.failedText}>
              {queueStatus.failed} işlem başarısız
            </Text>
          )}
        </View>

        {isOnline && queueStatus.pending > 0 && (
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={() => processSyncQueue()}
            disabled={isSyncing}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Senkron...' : 'Senkronize Et'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  offline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  syncing: {
    backgroundColor: '#F0F9FF',
    borderColor: '#93C5FD',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  queueText: {
    fontSize: 12,
    color: '#6B7280',
  },
  failedText: {
    fontSize: 12,
    color: '#DC2626',
  },
  syncButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OfflineStatus;
