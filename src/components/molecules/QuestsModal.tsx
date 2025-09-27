import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useQuests, Quest, QuestSeries } from '../../hooks/useQuests';

interface QuestsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    quests,
    questSeries,
    settings,
    loading,
    error,
    acceptQuest,
    completeQuest,
    generateNewQuests,
    updateSettings,
    getQuestInsights,
  } = useQuests();

  const [activeTab, setActiveTab] = useState<
    'available' | 'active' | 'completed' | 'series' | 'settings'
  >('available');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<QuestSeries | null>(
    null
  );

  useEffect(() => {
    if (visible) {
      generateNewQuests();
    }
  }, [visible, generateNewQuests]);

  const handleAcceptQuest = async (questId: string) => {
    try {
      const success = await acceptQuest(questId);
      if (success) {
        Alert.alert('Başarılı', 'Görev kabul edildi');
      } else {
        Alert.alert('Hata', 'Görev kabul edilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      const success = await completeQuest(questId);
      if (success) {
        Alert.alert('Tebrikler!', 'Görev tamamlandı ve ödüller kazanıldı!');
      } else {
        Alert.alert('Hata', 'Görev tamamlanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderQuestItem = ({ item }: { item: Quest }) => (
    <TouchableOpacity
      style={[
        styles.questItem,
        item.status === 'completed' && styles.completedQuest,
        item.status === 'active' && styles.activeQuest,
        item.difficulty === 'legendary' && styles.legendaryQuest,
        item.difficulty === 'hard' && styles.hardQuest,
        item.difficulty === 'medium' && styles.mediumQuest,
        item.difficulty === 'easy' && styles.easyQuest,
      ]}
      onPress={() => setSelectedQuest(item)}
    >
      <View style={styles.questHeader}>
        <View style={styles.questTypeContainer}>
          <Text style={styles.questTypeIcon}>
            {item.type === 'daily' && '📅'}
            {item.type === 'weekly' && '📆'}
            {item.type === 'monthly' && '🗓️'}
            {item.type === 'special' && '⭐'}
            {item.type === 'achievement' && '🏆'}
            {item.type === 'challenge' && '🎯'}
          </Text>
          <Text style={styles.questType}>
            {item.type === 'daily' && 'Günlük'}
            {item.type === 'weekly' && 'Haftalık'}
            {item.type === 'monthly' && 'Aylık'}
            {item.type === 'special' && 'Özel'}
            {item.type === 'achievement' && 'Başarı'}
            {item.type === 'challenge' && 'Meydan Okuma'}
          </Text>
        </View>
        <View style={styles.questMeta}>
          <Text style={styles.questDifficulty}>
            {item.difficulty === 'easy' && '🟢 Kolay'}
            {item.difficulty === 'medium' && '🟡 Orta'}
            {item.difficulty === 'hard' && '🟠 Zor'}
            {item.difficulty === 'legendary' && '🔴 Efsanevi'}
          </Text>
          <Text style={styles.questRarity}>
            {item.rarity === 'common' && '⚪ Yaygın'}
            {item.rarity === 'uncommon' && '🟢 Nadir'}
            {item.rarity === 'rare' && '🔵 Ender'}
            {item.rarity === 'epic' && '🟣 Epik'}
            {item.rarity === 'legendary' && '🟡 Efsanevi'}
          </Text>
        </View>
      </View>

      <Text style={styles.questTitle}>{item.title}</Text>
      <Text style={styles.questDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.questProgress}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${item.progress.percentage}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(item.progress.percentage)}%
        </Text>
      </View>

      <View style={styles.questRequirements}>
        <Text style={styles.requirementsLabel}>Gereksinimler:</Text>
        {item.requirements.map((req, index) => (
          <View key={index} style={styles.requirementItem}>
            <Text
              style={[
                styles.requirementText,
                req.completed && styles.completedRequirement,
              ]}
            >
              {req.completed ? '✅' : '⏳'} {req.description}
            </Text>
            <Text style={styles.requirementProgress}>
              {req.current}/{req.target} {req.unit}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.questRewards}>
        <Text style={styles.rewardsLabel}>Ödüller:</Text>
        <View style={styles.rewardsList}>
          {item.rewards.map((reward, index) => (
            <View key={index} style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>{reward.icon}</Text>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardValue}>+{reward.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.questFooter}>
        <Text style={styles.questStatus}>
          {item.status === 'available' && '📋 Mevcut'}
          {item.status === 'active' && '⚡ Aktif'}
          {item.status === 'completed' && '✅ Tamamlandı'}
          {item.status === 'expired' && '⏰ Süresi Doldu'}
          {item.status === 'locked' && '🔒 Kilitli'}
        </Text>
        {item.timeLimit && (
          <Text style={styles.timeLimit}>
            ⏰ {new Date(item.timeLimit).toLocaleDateString('tr-TR')}
          </Text>
        )}
      </View>

      {item.status === 'available' && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptQuest(item.id)}
        >
          <Text style={styles.acceptButtonText}>Kabul Et</Text>
        </TouchableOpacity>
      )}

      {item.status === 'completed' && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleCompleteQuest(item.id)}
        >
          <Text style={styles.completeButtonText}>Ödülleri Al</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderSeriesItem = ({ item }: { item: QuestSeries }) => (
    <TouchableOpacity
      style={styles.seriesItem}
      onPress={() => setSelectedSeries(item)}
    >
      <View style={styles.seriesHeader}>
        <Text style={styles.seriesTitle}>{item.title}</Text>
        <Text style={styles.seriesStatus}>
          {item.status === 'locked' && '🔒 Kilitli'}
          {item.status === 'available' && '📋 Mevcut'}
          {item.status === 'active' && '⚡ Aktif'}
          {item.status === 'completed' && '✅ Tamamlandı'}
        </Text>
      </View>

      <Text style={styles.seriesDescription}>{item.description}</Text>

      <View style={styles.seriesProgress}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${item.progress * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(item.progress * 100)}%
        </Text>
      </View>

      <View style={styles.seriesRewards}>
        <Text style={styles.rewardsLabel}>Seri Ödülleri:</Text>
        <View style={styles.rewardsList}>
          {item.rewards.map((reward, index) => (
            <View key={index} style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>{reward.icon}</Text>
              <Text style={styles.rewardName}>{reward.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSettingsItem = ({
    item,
  }: {
    item: {
      key: string;
      label: string;
      value: any;
      type: string;
      options?: any[];
    };
  }) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{item.label}</Text>
      {item.type === 'boolean' ? (
        <TouchableOpacity
          style={[styles.toggleButton, item.value && styles.toggleButtonActive]}
          onPress={() => handleUpdateSettings({ [item.key]: !item.value })}
        >
          <Text
            style={[
              styles.toggleButtonText,
              item.value && styles.toggleButtonTextActive,
            ]}
          >
            {item.value ? 'Açık' : 'Kapalı'}
          </Text>
        </TouchableOpacity>
      ) : item.type === 'select' ? (
        <View style={styles.selectContainer}>
          {item.options?.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.selectOption,
                item.value === option.value && styles.selectOptionActive,
              ]}
              onPress={() => handleUpdateSettings({ [item.key]: option.value })}
            >
              <Text
                style={[
                  styles.selectOptionText,
                  item.value === option.value && styles.selectOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : item.type === 'number' ? (
        <View style={styles.numberContainer}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleUpdateSettings({ [item.key]: Math.max(0, item.value - 1) })
            }
          >
            <Text style={styles.numberButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.numberValue}>{item.value}</Text>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleUpdateSettings({ [item.key]: item.value + 1 })}
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );

  const insights = getQuestInsights();

  const settingsData = [
    {
      key: 'enableQuests',
      label: 'Görevler',
      value: settings.enableQuests,
      type: 'boolean',
    },
    {
      key: 'autoAcceptQuests',
      label: 'Otomatik Kabul',
      value: settings.autoAcceptQuests,
      type: 'boolean',
    },
    {
      key: 'showQuestNotifications',
      label: 'Bildirimleri Göster',
      value: settings.showQuestNotifications,
      type: 'boolean',
    },
    {
      key: 'questDifficulty',
      label: 'Zorluk Seviyesi',
      value: settings.questDifficulty,
      type: 'select',
      options: [
        { value: 'easy', label: 'Kolay' },
        { value: 'medium', label: 'Orta' },
        { value: 'hard', label: 'Zor' },
        { value: 'all', label: 'Hepsi' },
      ],
    },
    {
      key: 'maxActiveQuests',
      label: 'Maksimum Aktif Görev',
      value: settings.maxActiveQuests,
      type: 'number',
    },
    {
      key: 'questRefreshInterval',
      label: 'Yenileme Aralığı (saat)',
      value: settings.questRefreshInterval,
      type: 'number',
    },
    {
      key: 'showProgressNotifications',
      label: 'İlerleme Bildirimleri',
      value: settings.showProgressNotifications,
      type: 'boolean',
    },
    {
      key: 'enableQuestSeries',
      label: 'Görev Serileri',
      value: settings.enableQuestSeries,
      type: 'boolean',
    },
  ];

  const filteredQuests = quests.filter(quest => {
    switch (activeTab) {
      case 'available':
        return quest.status === 'available';
      case 'active':
        return quest.status === 'active';
      case 'completed':
        return quest.status === 'completed';
      default:
        return true;
    }
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Görevler & Maceralar</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'available' && styles.activeTabText,
              ]}
            >
              Mevcut ({insights.availableQuests})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'active' && styles.activeTabText,
              ]}
            >
              Aktif ({insights.activeQuests})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'completed' && styles.activeTabText,
              ]}
            >
              Tamamlanan ({insights.completedQuests})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'series' && styles.activeTab]}
            onPress={() => setActiveTab('series')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'series' && styles.activeTabText,
              ]}
            >
              Seriler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
            onPress={() => setActiveTab('settings')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'settings' && styles.activeTabText,
              ]}
            >
              Ayarlar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {activeTab !== 'settings' && activeTab !== 'series' && (
            <View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.totalQuests}</Text>
                  <Text style={styles.statLabel}>Toplam Görev</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.activeQuests}</Text>
                  <Text style={styles.statLabel}>Aktif</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {insights.completedQuests}
                  </Text>
                  <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(insights.completionRate * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>Başarı Oranı</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                {activeTab === 'available' && 'Mevcut Görevler'}
                {activeTab === 'active' && 'Aktif Görevler'}
                {activeTab === 'completed' && 'Tamamlanan Görevler'}
              </Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#9C27B0" />
                  <Text style={styles.loadingText}>Görevler yükleniyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredQuests}
                  renderItem={renderQuestItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'series' && (
            <View>
              <Text style={styles.sectionTitle}>Görev Serileri</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#9C27B0" />
                  <Text style={styles.loadingText}>Seriler yükleniyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={questSeries}
                  renderItem={renderSeriesItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Görev Ayarları</Text>
              <FlatList
                data={settingsData}
                renderItem={renderSettingsItem}
                keyExtractor={item => item.key}
                style={styles.list}
              />
            </View>
          )}
        </ScrollView>
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
    borderBottomColor: '#9C27B0',
  },
  tabText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#9C27B0',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  list: {
    marginBottom: 20,
  },
  questItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedQuest: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  activeQuest: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  legendaryQuest: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  hardQuest: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  mediumQuest: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  easyQuest: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  questType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
  },
  questMeta: {
    alignItems: 'flex-end',
  },
  questDifficulty: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  questRarity: {
    fontSize: 12,
    color: '#666666',
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  questProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9C27B0',
  },
  progressText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '600',
  },
  questRequirements: {
    marginBottom: 8,
  },
  requirementsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  requirementText: {
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  completedRequirement: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  requirementProgress: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  questRewards: {
    marginBottom: 8,
  },
  rewardsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rewardIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  rewardName: {
    fontSize: 12,
    color: '#1976D2',
    marginRight: 4,
  },
  rewardValue: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  questFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questStatus: {
    fontSize: 12,
    color: '#666666',
  },
  timeLimit: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  seriesItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  seriesStatus: {
    fontSize: 12,
    color: '#666666',
  },
  seriesDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  seriesProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  seriesRewards: {
    marginBottom: 8,
  },
  settingItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignSelf: 'flex-start',
  },
  toggleButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  toggleButtonText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  selectOptionActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  selectOptionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  selectOptionTextActive: {
    color: 'white',
  },
  numberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  numberValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    minWidth: 30,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
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
});
