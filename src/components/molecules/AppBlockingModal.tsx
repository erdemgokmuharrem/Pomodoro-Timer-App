import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAppBlocking } from '../../hooks/useAppBlocking';
import { BlockedApp, BlockedWebsite } from '../../services/appBlockingService';

interface AppBlockingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AppBlockingModal: React.FC<AppBlockingModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    blockedApps,
    blockedWebsites,
    installedApps,
    addBlockedApp,
    removeBlockedApp,
    updateBlockedApp,
    addBlockedWebsite,
    removeBlockedWebsite,
    updateBlockedWebsite,
    stats,
    refreshStats,
    loading,
    error,
  } = useAppBlocking();

  const [activeTab, setActiveTab] = useState<'apps' | 'websites' | 'settings' | 'stats'>('apps');
  const [newWebsiteUrl, setNewWebsiteUrl] = useState('');
  const [newWebsiteName, setNewWebsiteName] = useState('');

  useEffect(() => {
    if (visible) {
      refreshStats();
    }
  }, [visible, refreshStats]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings(settings);
      onClose();
    } catch (err) {
      Alert.alert('Hata', 'Ayarlar kaydedilemedi');
    }
  };

  const handleAddWebsite = async () => {
    if (!newWebsiteUrl.trim() || !newWebsiteName.trim()) {
      Alert.alert('Hata', 'Lütfen website adı ve URL girin');
      return;
    }

    try {
      await addBlockedWebsite({
        name: newWebsiteName.trim(),
        url: newWebsiteUrl.trim(),
        category: 'other',
        isBlocked: true,
      });
      setNewWebsiteUrl('');
      setNewWebsiteName('');
    } catch (err) {
      Alert.alert('Hata', 'Website eklenemedi');
    }
  };

  const handleToggleApp = async (appId: string, isBlocked: boolean) => {
    try {
      await updateBlockedApp(appId, { isBlocked });
    } catch (err) {
      Alert.alert('Hata', 'Uygulama durumu güncellenemedi');
    }
  };

  const handleToggleWebsite = async (websiteId: string, isBlocked: boolean) => {
    try {
      await updateBlockedWebsite(websiteId, { isBlocked });
    } catch (err) {
      Alert.alert('Hata', 'Website durumu güncellenemedi');
    }
  };

  const handleRemoveApp = async (appId: string) => {
    Alert.alert(
      'Uygulamayı Kaldır',
      'Bu uygulamayı engellenenler listesinden kaldırmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kaldır', style: 'destructive', onPress: () => removeBlockedApp(appId) },
      ]
    );
  };

  const handleRemoveWebsite = async (websiteId: string) => {
    Alert.alert(
      'Websiteyi Kaldır',
      'Bu websiteyi engellenenler listesinden kaldırmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Kaldır', style: 'destructive', onPress: () => removeBlockedWebsite(websiteId) },
      ]
    );
  };

  const renderAppItem = ({ item }: { item: BlockedApp }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName}>{item.name}</Text>
        <Text style={styles.listItemCategory}>{item.category}</Text>
      </View>
      <View style={styles.listItemActions}>
        <Switch
          value={item.isBlocked}
          onValueChange={(value) => handleToggleApp(item.id, value)}
          trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
          thumbColor={item.isBlocked ? '#FFFFFF' : '#FFFFFF'}
        />
        <TouchableOpacity
          onPress={() => handleRemoveApp(item.id)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWebsiteItem = ({ item }: { item: BlockedWebsite }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemName}>{item.name}</Text>
        <Text style={styles.listItemUrl}>{item.url}</Text>
      </View>
      <View style={styles.listItemActions}>
        <Switch
          value={item.isBlocked}
          onValueChange={(value) => handleToggleWebsite(item.id, value)}
          trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
          thumbColor={item.isBlocked ? '#FFFFFF' : '#FFFFFF'}
        />
        <TouchableOpacity
          onPress={() => handleRemoveWebsite(item.id)}
          style={styles.removeButton}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.totalBlocks}</Text>
        <Text style={styles.statLabel}>Toplam Engelleme</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.blocksToday}</Text>
        <Text style={styles.statLabel}>Bugün</Text>
      </View>
      
      {stats.mostBlockedApps.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>En Çok Engellenen Uygulamalar</Text>
          {stats.mostBlockedApps.slice(0, 5).map((app, index) => (
            <View key={index} style={styles.statsItem}>
              <Text style={styles.statsItemName}>{app.name}</Text>
              <Text style={styles.statsItemCount}>{app.count} kez</Text>
            </View>
          ))}
        </View>
      )}
      
      {stats.mostBlockedWebsites.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>En Çok Engellenen Websiteler</Text>
          {stats.mostBlockedWebsites.slice(0, 5).map((website, index) => (
            <View key={index} style={styles.statsItem}>
              <Text style={styles.statsItemName}>{website.name}</Text>
              <Text style={styles.statsItemCount}>{website.count} kez</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dikkat Engelleme</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'apps' && styles.activeTab]}
            onPress={() => setActiveTab('apps')}
          >
            <Text style={[styles.tabText, activeTab === 'apps' && styles.activeTabText]}>
              Uygulamalar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'websites' && styles.activeTab]}
            onPress={() => setActiveTab('websites')}
          >
            <Text style={[styles.tabText, activeTab === 'websites' && styles.activeTabText]}>
              Websiteler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
              Ayarlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              İstatistikler
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {activeTab === 'apps' && (
            <View>
              <Text style={styles.sectionTitle}>Engellenen Uygulamalar</Text>
              <FlatList
                data={blockedApps}
                renderItem={renderAppItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'websites' && (
            <View>
              <Text style={styles.sectionTitle}>Engellenen Websiteler</Text>
              
              {/* Add Website Form */}
              <View style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Website Adı"
                  value={newWebsiteName}
                  onChangeText={setNewWebsiteName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="URL (örn: facebook.com)"
                  value={newWebsiteUrl}
                  onChangeText={setNewWebsiteUrl}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddWebsite}>
                  <Text style={styles.addButtonText}>Ekle</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={blockedWebsites}
                renderItem={renderWebsiteItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Engelleme Ayarları</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Engelleme Aktif</Text>
                  <Text style={styles.settingDescription}>
                    Dikkat dağıtıcı uygulamaları ve websiteleri engelle
                  </Text>
                </View>
                <Switch
                  value={settings.enabled}
                  onValueChange={(value) => updateSettings({ enabled: value })}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={settings.enabled ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Pomodoro Sırasında Engelle</Text>
                  <Text style={styles.settingDescription}>
                    Pomodoro seansı sırasında dikkat dağıtıcıları engelle
                  </Text>
                </View>
                <Switch
                  value={settings.blockDuringPomodoro}
                  onValueChange={(value) => updateSettings({ blockDuringPomodoro: value })}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={settings.blockDuringPomodoro ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Mola Sırasında Engelle</Text>
                  <Text style={styles.settingDescription}>
                    Mola sırasında dikkat dağıtıcıları engelle
                  </Text>
                </View>
                <Switch
                  value={settings.blockDuringBreaks}
                  onValueChange={(value) => updateSettings({ blockDuringBreaks: value })}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={settings.blockDuringBreaks ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingName}>Katı Mod</Text>
                  <Text style={styles.settingDescription}>
                    Uygulama arka planda olsa bile engelle
                  </Text>
                </View>
                <Switch
                  value={settings.strictMode}
                  onValueChange={(value) => updateSettings({ strictMode: value })}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={settings.strictMode ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
          )}

          {activeTab === 'stats' && renderStats()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginVertical: 16,
  },
  list: {
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  listItemCategory: {
    fontSize: 14,
    color: '#666666',
  },
  listItemUrl: {
    fontSize: 14,
    color: '#666666',
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  statsContainer: {
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  statsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statsItemName: {
    fontSize: 14,
    color: '#333333',
  },
  statsItemCount: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
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
