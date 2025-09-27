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
import {
  useAdaptiveMode,
  UserBehaviorPattern,
  AdaptiveRecommendation,
} from '../../hooks/useAdaptiveMode';

interface AdaptiveModeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AdaptiveModeModal: React.FC<AdaptiveModeModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    behaviorPatterns,
    recommendations,
    settings,
    loading,
    error,
    analyzeBehaviorPatterns,
    generateRecommendations,
    applyRecommendation,
    learnFromInteraction,
    updateSettings,
    getAdaptiveInsights,
  } = useAdaptiveMode();

  const [activeTab, setActiveTab] = useState<
    'patterns' | 'recommendations' | 'settings' | 'insights'
  >('patterns');
  const [selectedPattern, setSelectedPattern] =
    useState<UserBehaviorPattern | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<AdaptiveRecommendation | null>(null);

  const insights = getAdaptiveInsights();

  useEffect(() => {
    if (visible) {
      analyzeBehaviorPatterns();
      generateRecommendations();
    }
  }, [visible, analyzeBehaviorPatterns, generateRecommendations]);

  const handleApplyRecommendation = async (recommendationId: string) => {
    try {
      const success = await applyRecommendation(recommendationId);
      if (success) {
        Alert.alert('Başarılı', 'Öneri uygulandı');
      } else {
        Alert.alert('Hata', 'Öneri uygulanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderPatternItem = ({ item }: { item: UserBehaviorPattern }) => (
    <TouchableOpacity
      style={styles.patternItem}
      onPress={() => setSelectedPattern(item)}
    >
      <View style={styles.patternHeader}>
        <Text style={styles.patternType}>
          {item.type === 'time_preference' && '⏰ Zaman Tercihi'}
          {item.type === 'task_complexity' && '🧩 Görev Karmaşıklığı'}
          {item.type === 'focus_duration' && '🎯 Odaklanma Süresi'}
          {item.type === 'break_frequency' && '☕ Mola Sıklığı'}
          {item.type === 'energy_level' && '⚡ Enerji Seviyesi'}
          {item.type === 'productivity_peak' && '📈 Verimlilik Zirvesi'}
        </Text>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Güven:</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${item.confidence * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>
            {Math.round(item.confidence * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.patternDetails}>
        <Text style={styles.patternFrequency}>
          Sıklık: {item.frequency} kez
        </Text>
        <Text style={styles.patternLastUpdated}>
          Son güncelleme: {item.lastUpdated.toLocaleDateString('tr-TR')}
        </Text>
      </View>

      {item.type === 'time_preference' && (
        <View style={styles.patternData}>
          <Text style={styles.patternDataTitle}>Tercih Edilen Saatler:</Text>
          <Text style={styles.patternDataText}>
            {item.pattern.peakHours?.join(', ')} saatleri
          </Text>
        </View>
      )}

      {item.type === 'task_complexity' && (
        <View style={styles.patternData}>
          <Text style={styles.patternDataTitle}>Ortalama Karmaşıklık:</Text>
          <Text style={styles.patternDataText}>
            {Math.round(item.pattern.averageComplexity * 100)}%
          </Text>
        </View>
      )}

      {item.type === 'focus_duration' && (
        <View style={styles.patternData}>
          <Text style={styles.patternDataTitle}>Optimal Süre:</Text>
          <Text style={styles.patternDataText}>
            {Math.round(item.pattern.optimalDuration)} dakika
          </Text>
        </View>
      )}

      {item.type === 'break_frequency' && (
        <View style={styles.patternData}>
          <Text style={styles.patternDataTitle}>Mola Sıklığı:</Text>
          <Text style={styles.patternDataText}>
            {Math.round(item.pattern.breakFrequency * 100)}%
          </Text>
        </View>
      )}

      {item.type === 'energy_level' && (
        <View style={styles.patternData}>
          <Text style={styles.patternDataTitle}>Zirve Enerji Saatleri:</Text>
          <Text style={styles.patternDataText}>
            {item.pattern.peakEnergyHours?.join(', ')} saatleri
          </Text>
        </View>
      )}

      {item.type === 'productivity_peak' && (
        <View style={styles.patternData}>
          <Text style={styles.patternDataTitle}>Günlük Ortalama:</Text>
          <Text style={styles.patternDataText}>
            {Math.round(item.pattern.averageDailyProductivity)} pomodoro
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecommendationItem = ({
    item,
  }: {
    item: AdaptiveRecommendation;
  }) => (
    <TouchableOpacity
      style={styles.recommendationItem}
      onPress={() => setSelectedRecommendation(item)}
    >
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationType}>
          {item.type === 'ui_layout' && '🎨 UI Düzeni'}
          {item.type === 'feature_priority' && '⭐ Özellik Önceliği'}
          {item.type === 'notification_timing' && '🔔 Bildirim Zamanlaması'}
          {item.type === 'theme_preference' && '🎭 Tema Tercihi'}
          {item.type === 'workflow_suggestion' && '🔄 İş Akışı Önerisi'}
        </Text>
        <View style={styles.priorityContainer}>
          <Text
            style={[
              styles.priorityText,
              item.implementation.priority === 'high' && styles.priorityHigh,
              item.implementation.priority === 'medium' &&
                styles.priorityMedium,
              item.implementation.priority === 'low' && styles.priorityLow,
            ]}
          >
            {item.implementation.priority === 'high' && '🔴 Yüksek'}
            {item.implementation.priority === 'medium' && '🟡 Orta'}
            {item.implementation.priority === 'low' && '🟢 Düşük'}
          </Text>
        </View>
      </View>

      <Text style={styles.recommendationTitle}>{item.title}</Text>
      <Text style={styles.recommendationDescription}>{item.description}</Text>

      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Güven:</Text>
        <View style={styles.confidenceBar}>
          <View
            style={[
              styles.confidenceFill,
              { width: `${item.confidence * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.confidenceText}>
          {Math.round(item.confidence * 100)}%
        </Text>
      </View>

      <Text style={styles.recommendationReasoning}>{item.reasoning}</Text>

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => handleApplyRecommendation(item.id)}
      >
        <Text style={styles.applyButtonText}>Uygula</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSettingsItem = ({
    item,
  }: {
    item: { key: string; label: string; value: any; type: string };
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

  const insights = getAdaptiveInsights();

  const settingsData = [
    {
      key: 'enableAdaptiveMode',
      label: 'Adaptif Mod',
      value: settings.enableAdaptiveMode,
      type: 'boolean',
    },
    {
      key: 'learningEnabled',
      label: 'Öğrenme Modu',
      value: settings.learningEnabled,
      type: 'boolean',
    },
    {
      key: 'autoApply',
      label: 'Otomatik Uygula',
      value: settings.autoApply,
      type: 'boolean',
    },
    {
      key: 'respectUserChoices',
      label: 'Kullanıcı Tercihlerini Dikkate Al',
      value: settings.respectUserChoices,
      type: 'boolean',
    },
    {
      key: 'showReasoning',
      label: 'Açıklamaları Göster',
      value: settings.showReasoning,
      type: 'boolean',
    },
    {
      key: 'sensitivity',
      label: 'Hassasiyet',
      value: Math.round(settings.sensitivity * 100),
      type: 'number',
    },
    {
      key: 'updateFrequency',
      label: 'Güncelleme Sıklığı (saat)',
      value: settings.updateFrequency,
      type: 'number',
    },
    {
      key: 'maxRecommendations',
      label: 'Maksimum Öneri',
      value: settings.maxRecommendations,
      type: 'number',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Adaptif Mod</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'patterns' && styles.activeTab]}
            onPress={() => setActiveTab('patterns')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'patterns' && styles.activeTabText,
              ]}
            >
              Davranışlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'recommendations' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('recommendations')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'recommendations' && styles.activeTabText,
              ]}
            >
              Öneriler
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
          <TouchableOpacity
            style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
            onPress={() => setActiveTab('insights')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'insights' && styles.activeTabText,
              ]}
            >
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

          {activeTab === 'patterns' && (
            <View>
              <Text style={styles.sectionTitle}>Davranış Kalıpları</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#9C27B0" />
                  <Text style={styles.loadingText}>
                    Davranış kalıpları analiz ediliyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={behaviorPatterns}
                  renderItem={renderPatternItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'recommendations' && (
            <View>
              <Text style={styles.sectionTitle}>Adaptif Öneriler</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#9C27B0" />
                  <Text style={styles.loadingText}>
                    Öneriler oluşturuluyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={recommendations}
                  renderItem={renderRecommendationItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Adaptif Ayarlar</Text>
              <FlatList
                data={settingsData}
                renderItem={renderSettingsItem}
                keyExtractor={item => item.key}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'insights' && (
            <View>
              <Text style={styles.sectionTitle}>Adaptif İstatistikler</Text>
              {insights ? (
                <View style={styles.insightsContainer}>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.totalPatterns}
                    </Text>
                    <Text style={styles.insightLabel}>Toplam Kalıp</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.highConfidencePatterns}
                    </Text>
                    <Text style={styles.insightLabel}>Yüksek Güven</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {Math.round(insights.averageConfidence * 100)}%
                    </Text>
                    <Text style={styles.insightLabel}>Ortalama Güven</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.totalRecommendations}
                    </Text>
                    <Text style={styles.insightLabel}>Toplam Öneri</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.highPriorityRecommendations}
                    </Text>
                    <Text style={styles.insightLabel}>Yüksek Öncelik</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.adaptiveModeEnabled ? 'Açık' : 'Kapalı'}
                    </Text>
                    <Text style={styles.insightLabel}>Adaptif Mod</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>Henüz veri yok</Text>
                </View>
              )}
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
    fontSize: 12,
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
  list: {
    marginBottom: 20,
  },
  patternItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#666666',
  },
  confidenceBar: {
    width: 60,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#9C27B0',
  },
  confidenceText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '600',
  },
  patternDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patternFrequency: {
    fontSize: 12,
    color: '#666666',
  },
  patternLastUpdated: {
    fontSize: 12,
    color: '#666666',
  },
  patternData: {
    marginTop: 8,
  },
  patternDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  patternDataText: {
    fontSize: 14,
    color: '#666666',
  },
  recommendationItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
  },
  priorityContainer: {
    alignItems: 'flex-end',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityHigh: {
    color: '#D32F2F',
  },
  priorityMedium: {
    color: '#FF9800',
  },
  priorityLow: {
    color: '#4CAF50',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationReasoning: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#CCCCCC',
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
  insightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    minWidth: 150,
  },
  insightNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: '#666666',
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
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#666666',
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
