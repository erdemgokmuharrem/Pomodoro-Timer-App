import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCalendarSync } from '../../hooks/useCalendarSync';

interface CalendarSyncModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    isGoogleConnected,
    isOutlookConnected,
    isConnected,
    connectGoogle,
    disconnectGoogle,
    connectOutlook,
    disconnectOutlook,
    loading,
    error,
    syncSettings,
  } = useCalendarSync();

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings(localSettings);
      await syncSettings();
      onClose();
    } catch (err) {
      Alert.alert('Hata', 'Ayarlar kaydedilemedi');
    }
  };

  const handleGoogleToggle = async () => {
    if (isGoogleConnected) {
      await disconnectGoogle();
    } else {
      const success = await connectGoogle();
      if (!success) {
        Alert.alert('Hata', 'Google Calendar bağlantısı kurulamadı');
      }
    }
  };

  const handleOutlookToggle = async () => {
    if (isOutlookConnected) {
      await disconnectOutlook();
    } else {
      const success = await connectOutlook();
      if (!success) {
        Alert.alert('Hata', 'Outlook Calendar bağlantısı kurulamadı');
      }
    }
  };

  const handleSyncIntervalChange = (value: number) => {
    setLocalSettings(prev => ({ ...prev, syncInterval: value }));
  };

  const handleAutoCreateToggle = (value: boolean) => {
    setLocalSettings(prev => ({ ...prev, autoCreateEvents: value }));
  };

  const handleSyncPomodorosToggle = (value: boolean) => {
    setLocalSettings(prev => ({ ...prev, syncPomodoros: value }));
  };

  const handleSyncTasksToggle = (value: boolean) => {
    setLocalSettings(prev => ({ ...prev, syncTasks: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Takvim Senkronizasyonu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Connection Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bağlantı Durumu</Text>

            <View style={styles.connectionItem}>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>Google Calendar</Text>
                <Text
                  style={[
                    styles.connectionStatus,
                    { color: isGoogleConnected ? '#4CAF50' : '#757575' },
                  ]}
                >
                  {isGoogleConnected ? 'Bağlı' : 'Bağlı Değil'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleGoogleToggle}
                disabled={loading}
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor: isGoogleConnected ? '#4CAF50' : '#E0E0E0',
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.toggleButtonText}>
                    {isGoogleConnected ? 'Bağlantıyı Kes' : 'Bağlan'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.connectionItem}>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionName}>Outlook Calendar</Text>
                <Text
                  style={[
                    styles.connectionStatus,
                    { color: isOutlookConnected ? '#4CAF50' : '#757575' },
                  ]}
                >
                  {isOutlookConnected ? 'Bağlı' : 'Bağlı Değil'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleOutlookToggle}
                disabled={loading}
                style={[
                  styles.toggleButton,
                  {
                    backgroundColor: isOutlookConnected ? '#4CAF50' : '#E0E0E0',
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.toggleButtonText}>
                    {isOutlookConnected ? 'Bağlantıyı Kes' : 'Bağlan'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sync Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Senkronizasyon Ayarları</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>
                  Otomatik Etkinlik Oluştur
                </Text>
                <Text style={styles.settingDescription}>
                  Pomodoro seansları ve görevler için otomatik takvim etkinliği
                  oluştur
                </Text>
              </View>
              <Switch
                value={localSettings.autoCreateEvents}
                onValueChange={handleAutoCreateToggle}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={
                  localSettings.autoCreateEvents ? '#FFFFFF' : '#FFFFFF'
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>
                  Pomodoro Seanslarını Senkronize Et
                </Text>
                <Text style={styles.settingDescription}>
                  Tamamlanan Pomodoro seanslarını takvimde görüntüle
                </Text>
              </View>
              <Switch
                value={localSettings.syncPomodoros}
                onValueChange={handleSyncPomodorosToggle}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={localSettings.syncPomodoros ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Görevleri Senkronize Et</Text>
                <Text style={styles.settingDescription}>
                  Planlanan görevleri takvimde görüntüle
                </Text>
              </View>
              <Switch
                value={localSettings.syncTasks}
                onValueChange={handleSyncTasksToggle}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor={localSettings.syncTasks ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Sync Interval */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Senkronizasyon Sıklığı</Text>

            <View style={styles.intervalContainer}>
              <Text style={styles.intervalLabel}>
                Her {localSettings.syncInterval} dakikada bir senkronize et
              </Text>

              <View style={styles.intervalButtons}>
                {[5, 15, 30, 60].map(interval => (
                  <TouchableOpacity
                    key={interval}
                    onPress={() => handleSyncIntervalChange(interval)}
                    style={[
                      styles.intervalButton,
                      localSettings.syncInterval === interval &&
                        styles.intervalButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.intervalButtonText,
                        localSettings.syncInterval === interval &&
                          styles.intervalButtonTextActive,
                      ]}
                    >
                      {interval}dk
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bilgi</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                • Takvim senkronizasyonu, Pomodoro seanslarınızı ve
                görevlerinizi Google Calendar veya Outlook ile senkronize eder
              </Text>
              <Text style={styles.infoText}>
                • Otomatik etkinlik oluşturma özelliği ile seanslarınız takvimde
                görünür olur
              </Text>
              <Text style={styles.infoText}>
                • Zaman çakışmalarını önlemek için mevcut etkinliklerinizi
                kontrol edin
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSaveSettings}
            style={styles.saveButton}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  connectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  connectionStatus: {
    fontSize: 14,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  intervalContainer: {
    marginTop: 8,
  },
  intervalLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  intervalButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  intervalButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  intervalButtonTextActive: {
    color: 'white',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
