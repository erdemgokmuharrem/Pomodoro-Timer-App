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
  useSmartDuration,
  DurationRecommendation,
} from '../../hooks/useSmartDuration';

interface SmartDurationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SmartDurationModal: React.FC<SmartDurationModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    recommendations,
    settings,
    loading,
    error,
    getRecommendations,
    getTaskRecommendation,
    applyRecommendation,
    updateSettings,
    learnFromSession,
    getInsights,
  } = useSmartDuration();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<DurationRecommendation | null>(null);
  const [activeTab, setActiveTab] = useState<
    'recommendations' | 'settings' | 'insights'
  >('recommendations');

  const insights = getInsights();

  useEffect(() => {
    if (visible) {
      getRecommendations();
    }
  }, [visible, getRecommendations]);

  const handleApplyRecommendation = async (recommendationId: string) => {
    try {
      const success = await applyRecommendation(recommendationId);
      if (success) {
        Alert.alert('Başarılı', 'Süre önerisi uygulandı');
      } else {
        Alert.alert('Hata', 'Süre önerisi uygulanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderRecommendationItem = ({
    item,
  }: {
    item: DurationRecommendation;
  }) => (
    <View style={styles.recommendationItem}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationDuration}>
          {item.recommendedDuration} dk
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

      <Text style={styles.recommendationReasoning}>{item.reasoning}</Text>

      <View style={styles.factorsContainer}>
        <Text style={styles.factorsTitle}>Faktörler:</Text>
        <View style={styles.factorsGrid}>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Karmaşıklık</Text>
            <Text style={styles.factorValue}>
              {Math.round(item.factors.taskComplexity * 100)}%
            </Text>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Enerji</Text>
            <Text style={styles.factorValue}>
              {Math.round(item.factors.userEnergy * 100)}%
            </Text>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Geçmiş</Text>
            <Text style={styles.factorValue}>
              {Math.round(item.factors.historicalPerformance * 100)}%
            </Text>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Saat</Text>
            <Text style={styles.factorValue}>
              {Math.round(item.factors.timeOfDay * 100)}%
            </Text>
          </View>
        </View>
      </View>

      {item.alternatives.length > 0 && (
        <View style={styles.alternativesContainer}>
          <Text style={styles.alternativesTitle}>Alternatifler:</Text>
          {item.alternatives.map((alt, index) => (
            <View key={index} style={styles.alternativeItem}>
              <Text style={styles.alternativeDuration}>{alt.duration} dk</Text>
              <Text style={styles.alternativeReasoning}>{alt.reasoning}</Text>
              <Text style={styles.alternativeConfidence}>
                Güven: {Math.round(alt.confidence * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => handleApplyRecommendation(item.id)}
      >
        <Text style={styles.applyButtonText}>Uygula</Text>
      </TouchableOpacity>
    </View>
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

  const insights = getInsights();

  const settingsData = [
    {
      key: 'enableAI',
      label: 'AI Önerileri',
      value: settings.enableAI,
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
      key: 'showReasoning',
      label: 'Açıklamaları Göster',
      value: settings.showReasoning,
      type: 'boolean',
    },
    {
      key: 'confidenceThreshold',
      label: 'Güven Eşiği',
      value: Math.round(settings.confidenceThreshold * 100),
      type: 'number',
    },
    {
      key: 'updateFrequency',
      label: 'Güncelleme Sıklığı (saat)',
      value: settings.updateFrequency,
      type: 'number',
    },
    {
      key: 'maxHistoryDays',
      label: 'Maksimum Geçmiş (gün)',
      value: settings.maxHistoryDays,
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
          <Text style={styles.title}>Akıllı Süre Önerileri</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
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

          {activeTab === 'recommendations' && (
            <View>
              <Text style={styles.sectionTitle}>AI Süre Önerileri</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>
                    Öneriler hesaplanıyor...
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
              <Text style={styles.sectionTitle}>AI Ayarları</Text>
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
              <Text style={styles.sectionTitle}>AI İstatistikleri</Text>
              {insights ? (
                <View style={styles.insightsContainer}>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.totalRecommendations}
                    </Text>
                    <Text style={styles.insightLabel}>Toplam Öneri</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {Math.round(insights.averageConfidence * 100)}%
                    </Text>
                    <Text style={styles.insightLabel}>Ortalama Güven</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {Math.round(insights.averageRecommendedDuration)} dk
                    </Text>
                    <Text style={styles.insightLabel}>Ortalama Süre</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.highConfidenceCount}
                    </Text>
                    <Text style={styles.insightLabel}>Yüksek Güven</Text>
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
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 12,
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
  recommendationDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
  },
  confidenceText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  recommendationReasoning: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  factorsContainer: {
    marginBottom: 12,
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factorItem: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
    alignItems: 'center',
  },
  factorLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  factorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  alternativesContainer: {
    marginBottom: 12,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  alternativeItem: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  alternativeDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  alternativeReasoning: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  alternativeConfidence: {
    fontSize: 12,
    color: '#999999',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
    color: '#4CAF50',
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
