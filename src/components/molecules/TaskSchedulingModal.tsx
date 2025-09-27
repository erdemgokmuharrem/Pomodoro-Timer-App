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
import { useTaskScheduling, SchedulingRecommendation, TimeSlot } from '../../hooks/useTaskScheduling';

interface TaskSchedulingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TaskSchedulingModal: React.FC<TaskSchedulingModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    recommendations,
    timeSlots,
    settings,
    loading,
    error,
    getSchedulingRecommendations,
    getTaskSchedulingRecommendation,
    applySchedulingRecommendation,
    autoScheduleTasks,
    updateSettings,
    getSchedulingInsights,
  } = useTaskScheduling();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'calendar' | 'settings' | 'insights'>('recommendations');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecommendation, setSelectedRecommendation] = useState<SchedulingRecommendation | null>(null);

  useEffect(() => {
    if (visible) {
      getSchedulingRecommendations();
    }
  }, [visible, getSchedulingRecommendations]);

  const handleApplyRecommendation = async (recommendationId: string, timeSlotId: string) => {
    try {
      const success = await applySchedulingRecommendation(recommendationId, timeSlotId);
      if (success) {
        Alert.alert('Başarılı', 'Görev zamanlandı');
      } else {
        Alert.alert('Hata', 'Görev zamanlanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleAutoSchedule = async () => {
    try {
      const success = await autoScheduleTasks();
      if (success) {
        Alert.alert('Başarılı', 'Görevler otomatik olarak zamanlandı');
      } else {
        Alert.alert('Bilgi', 'Otomatik zamanlama için yeterli veri yok');
      }
    } catch (err) {
      Alert.alert('Hata', 'Otomatik zamanlama başarısız');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderRecommendationItem = ({ item }: { item: SchedulingRecommendation }) => (
    <View style={styles.recommendationItem}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationTaskId}>Görev #{item.taskId.slice(-4)}</Text>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Güven:</Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceFill, 
                { width: `${item.confidence * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.confidenceText}>
            {Math.round(item.confidence * 100)}%
          </Text>
        </View>
      </View>
      
      <Text style={styles.recommendationReasoning}>{item.reasoning}</Text>
      
      <View style={styles.timeSlotsContainer}>
        <Text style={styles.timeSlotsTitle}>Önerilen Zamanlar:</Text>
        {item.recommendedTimeSlots.map((slot, index) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlotItem,
              index === 0 && styles.primaryTimeSlot
            ]}
            onPress={() => handleApplyRecommendation(item.id, slot.id)}
          >
            <View style={styles.timeSlotHeader}>
              <Text style={styles.timeSlotTime}>
                {slot.startTime.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} - {slot.endTime.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              <View style={styles.energyContainer}>
                <Text style={styles.energyLabel}>Enerji:</Text>
                <View style={styles.energyBar}>
                  <View 
                    style={[
                      styles.energyFill, 
                      { width: `${slot.energyLevel * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.energyText}>
                  {Math.round(slot.energyLevel * 100)}%
                </Text>
              </View>
            </View>
            <Text style={styles.timeSlotReasoning}>{slot.reasoning}</Text>
            <View style={styles.timeSlotStatus}>
              <Text style={[
                styles.statusText,
                slot.availability === 'free' && styles.statusFree,
                slot.availability === 'low_energy' && styles.statusLowEnergy,
                slot.availability === 'break_needed' && styles.statusBreak
              ]}>
                {slot.availability === 'free' && '✅ Müsait'}
                {slot.availability === 'low_energy' && '⚠️ Düşük Enerji'}
                {slot.availability === 'break_needed' && '☕ Mola Gerekli'}
                {slot.availability === 'busy' && '❌ Meşgul'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {item.alternatives.length > 0 && (
        <View style={styles.alternativesContainer}>
          <Text style={styles.alternativesTitle}>Alternatif Zamanlar:</Text>
          {item.alternatives.map((alt, index) => (
            <View key={index} style={styles.alternativeItem}>
              <Text style={styles.alternativeTime}>
                {alt.timeSlot.startTime.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              <Text style={styles.alternativeReasoning}>{alt.reasoning}</Text>
              <Text style={styles.alternativeConfidence}>
                Güven: {Math.round(alt.confidence * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}

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
            <Text style={styles.factorLabel}>Öncelik</Text>
            <Text style={styles.factorValue}>
              {Math.round(item.factors.priority * 100)}%
            </Text>
          </View>
          <View style={styles.factorItem}>
            <Text style={styles.factorLabel}>Deadline</Text>
            <Text style={styles.factorValue}>
              {Math.round(item.factors.deadline * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTimeSlotItem = ({ item }: { item: TimeSlot }) => (
    <View style={styles.timeSlotItem}>
      <View style={styles.timeSlotHeader}>
        <Text style={styles.timeSlotTime}>
          {item.startTime.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - {item.endTime.toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
        <View style={styles.energyContainer}>
          <Text style={styles.energyLabel}>Enerji:</Text>
          <View style={styles.energyBar}>
            <View 
              style={[
                styles.energyFill, 
                { width: `${item.energyLevel * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.energyText}>
            {Math.round(item.energyLevel * 100)}%
          </Text>
        </View>
      </View>
      <Text style={styles.timeSlotReasoning}>{item.reasoning}</Text>
      <View style={styles.timeSlotStatus}>
        <Text style={[
          styles.statusText,
          item.availability === 'free' && styles.statusFree,
          item.availability === 'low_energy' && styles.statusLowEnergy,
          item.availability === 'break_needed' && styles.statusBreak
        ]}>
          {item.availability === 'free' && '✅ Müsait'}
          {item.availability === 'low_energy' && '⚠️ Düşük Enerji'}
          {item.availability === 'break_needed' && '☕ Mola Gerekli'}
          {item.availability === 'busy' && '❌ Meşgul'}
        </Text>
      </View>
    </View>
  );

  const renderSettingsItem = ({ item }: { item: { key: string; label: string; value: any; type: string } }) => (
    <View style={styles.settingItem}>
      <Text style={styles.settingLabel}>{item.label}</Text>
      {item.type === 'boolean' ? (
        <TouchableOpacity
          style={[
            styles.toggleButton,
            item.value && styles.toggleButtonActive
          ]}
          onPress={() => handleUpdateSettings({ [item.key]: !item.value })}
        >
          <Text style={[
            styles.toggleButtonText,
            item.value && styles.toggleButtonTextActive
          ]}>
            {item.value ? 'Açık' : 'Kapalı'}
          </Text>
        </TouchableOpacity>
      ) : item.type === 'number' ? (
        <View style={styles.numberContainer}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() => handleUpdateSettings({ [item.key]: Math.max(0, item.value - 1) })}
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

  const insights = getSchedulingInsights();

  const settingsData = [
    {
      key: 'enableAI',
      label: 'AI Zamanlama',
      value: settings.enableAI,
      type: 'boolean',
    },
    {
      key: 'autoSchedule',
      label: 'Otomatik Zamanlama',
      value: settings.autoSchedule,
      type: 'boolean',
    },
    {
      key: 'respectDeadlines',
      label: 'Deadline\'ları Dikkate Al',
      value: settings.respectDeadlines,
      type: 'boolean',
    },
    {
      key: 'workingHours.start',
      label: 'Çalışma Başlangıcı (saat)',
      value: settings.workingHours.start,
      type: 'number',
    },
    {
      key: 'workingHours.end',
      label: 'Çalışma Bitişi (saat)',
      value: settings.workingHours.end,
      type: 'number',
    },
    {
      key: 'breakDuration',
      label: 'Mola Süresi (dakika)',
      value: settings.breakDuration,
      type: 'number',
    },
    {
      key: 'maxSessionDuration',
      label: 'Maksimum Seans (dakika)',
      value: settings.maxSessionDuration,
      type: 'number',
    },
    {
      key: 'energyThreshold',
      label: 'Enerji Eşiği',
      value: Math.round(settings.energyThreshold * 100),
      type: 'number',
    },
    {
      key: 'bufferTime',
      label: 'Ara Zaman (dakika)',
      value: settings.bufferTime,
      type: 'number',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Görev Zamanlama</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recommendations' && styles.activeTab]}
            onPress={() => setActiveTab('recommendations')}
          >
            <Text style={[styles.tabText, activeTab === 'recommendations' && styles.activeTabText]}>
              Öneriler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text style={[styles.tabText, activeTab === 'calendar' && styles.activeTabText]}>
              Takvim
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
            style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
            onPress={() => setActiveTab('insights')}
          >
            <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
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
              <View style={styles.autoScheduleContainer}>
                <TouchableOpacity
                  style={styles.autoScheduleButton}
                  onPress={handleAutoSchedule}
                >
                  <Text style={styles.autoScheduleButtonText}>
                    🤖 Otomatik Zamanla
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.sectionTitle}>AI Zamanlama Önerileri</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2196F3" />
                  <Text style={styles.loadingText}>Öneriler hesaplanıyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={recommendations}
                  renderItem={renderRecommendationItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'calendar' && (
            <View>
              <Text style={styles.sectionTitle}>Günlük Takvim</Text>
              <Text style={styles.dateText}>
                {selectedDate.toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <FlatList
                data={timeSlots}
                renderItem={renderTimeSlotItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Zamanlama Ayarları</Text>
              <FlatList
                data={settingsData}
                renderItem={renderSettingsItem}
                keyExtractor={(item) => item.key}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'insights' && (
            <View>
              <Text style={styles.sectionTitle}>Zamanlama İstatistikleri</Text>
              {insights ? (
                <View style={styles.insightsContainer}>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>{insights.totalRecommendations}</Text>
                    <Text style={styles.insightLabel}>Toplam Öneri</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {Math.round(insights.averageConfidence * 100)}%
                    </Text>
                    <Text style={styles.insightLabel}>Ortalama Güven</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>{insights.highConfidenceCount}</Text>
                    <Text style={styles.insightLabel}>Yüksek Güven</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>{insights.morningSlotsCount}</Text>
                    <Text style={styles.insightLabel}>Sabah Seansları</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <Text style={styles.insightNumber}>
                      {insights.autoScheduleEnabled ? 'Açık' : 'Kapalı'}
                    </Text>
                    <Text style={styles.insightLabel}>Otomatik Zamanlama</Text>
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
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
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
  autoScheduleContainer: {
    marginBottom: 16,
  },
  autoScheduleButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  autoScheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  recommendationTaskId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
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
    backgroundColor: '#2196F3',
  },
  confidenceText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  recommendationReasoning: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  timeSlotsContainer: {
    marginBottom: 12,
  },
  timeSlotsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  timeSlotItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  primaryTimeSlot: {
    borderColor: '#2196F3',
    backgroundColor: '#F3F9FF',
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSlotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  energyLabel: {
    fontSize: 12,
    color: '#666666',
  },
  energyBar: {
    width: 40,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  energyFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  energyText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  timeSlotReasoning: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  timeSlotStatus: {
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusFree: {
    color: '#4CAF50',
  },
  statusLowEnergy: {
    color: '#FF9800',
  },
  statusBreak: {
    color: '#9C27B0',
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
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  alternativeTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
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
    color: '#2196F3',
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
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
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
    backgroundColor: '#2196F3',
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
    color: '#2196F3',
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
  dateText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    textAlign: 'center',
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
