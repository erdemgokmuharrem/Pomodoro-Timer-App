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
import { useSmartScheduling, SmartSchedule, ScheduleOptimization, ScheduleConflict } from '../../hooks/useSmartScheduling';

interface SmartSchedulingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SmartSchedulingModal: React.FC<SmartSchedulingModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    schedules,
    optimizations,
    conflicts,
    settings,
    loading,
    error,
    autoScheduleTasks,
    generateOptimizations,
    detectScheduleConflicts,
    applyOptimization,
    resolveConflict,
    updateSettings,
    getSchedulingInsights,
  } = useSmartScheduling();

  const [activeTab, setActiveTab] = useState<'schedules' | 'optimizations' | 'conflicts' | 'settings'>('schedules');
  const [selectedSchedule, setSelectedSchedule] = useState<SmartSchedule | null>(null);
  const [selectedOptimization, setSelectedOptimization] = useState<ScheduleOptimization | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<ScheduleConflict | null>(null);

  useEffect(() => {
    if (visible) {
      autoScheduleTasks();
      generateOptimizations();
      detectScheduleConflicts();
    }
  }, [visible, autoScheduleTasks, generateOptimizations, detectScheduleConflicts]);

  const handleApplyOptimization = async (optimizationId: string) => {
    try {
      const success = await applyOptimization(optimizationId);
      if (success) {
        Alert.alert('Başarılı', 'Optimizasyon uygulandı');
      } else {
        Alert.alert('Hata', 'Optimizasyon uygulanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: string) => {
    try {
      const success = await resolveConflict(conflictId, resolution);
      if (success) {
        Alert.alert('Başarılı', 'Çakışma çözüldü');
      } else {
        Alert.alert('Hata', 'Çakışma çözülemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderScheduleItem = ({ item }: { item: SmartSchedule }) => (
    <TouchableOpacity
      style={[
        styles.scheduleItem,
        item.status === 'completed' && styles.completedSchedule,
        item.status === 'in_progress' && styles.inProgressSchedule,
        item.priority === 'urgent' && styles.urgentSchedule,
        item.priority === 'high' && styles.highPrioritySchedule,
      ]}
      onPress={() => setSelectedSchedule(item)}
    >
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleTypeContainer}>
          <Text style={styles.scheduleTypeIcon}>
            {item.type === 'pomodoro' && '🍅'}
            {item.type === 'break' && '☕'}
            {item.type === 'deep_work' && '🎯'}
            {item.type === 'meeting' && '👥'}
            {item.type === 'learning' && '📚'}
            {item.type === 'creative' && '🎨'}
          </Text>
          <Text style={styles.scheduleType}>
            {item.type === 'pomodoro' && 'Pomodoro'}
            {item.type === 'break' && 'Mola'}
            {item.type === 'deep_work' && 'Derin Çalışma'}
            {item.type === 'meeting' && 'Toplantı'}
            {item.type === 'learning' && 'Öğrenme'}
            {item.type === 'creative' && 'Yaratıcılık'}
          </Text>
        </View>
        <View style={styles.scheduleMeta}>
          <Text style={styles.schedulePriority}>
            {item.priority === 'urgent' && '🔴 Acil'}
            {item.priority === 'high' && '🟠 Yüksek'}
            {item.priority === 'medium' && '🟡 Orta'}
            {item.priority === 'low' && '🟢 Düşük'}
          </Text>
          <Text style={styles.scheduleStatus}>
            {item.status === 'scheduled' && '📅 Planlandı'}
            {item.status === 'in_progress' && '⏳ Devam Ediyor'}
            {item.status === 'completed' && '✅ Tamamlandı'}
            {item.status === 'cancelled' && '❌ İptal'}
            {item.status === 'rescheduled' && '🔄 Ertelendi'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.scheduleTitle}>{item.title}</Text>
      <Text style={styles.scheduleDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.scheduleDetails}>
        <View style={styles.scheduleTime}>
          <Text style={styles.scheduleTimeLabel}>Başlangıç:</Text>
          <Text style={styles.scheduleTimeValue}>
            {item.optimalStartTime.toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <View style={styles.scheduleTime}>
          <Text style={styles.scheduleTimeLabel}>Bitiş:</Text>
          <Text style={styles.scheduleTimeValue}>
            {item.optimalEndTime.toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <View style={styles.scheduleDuration}>
          <Text style={styles.scheduleDurationText}>
            {item.estimatedDuration} dk
          </Text>
        </View>
      </View>

      <View style={styles.scheduleFooter}>
        <View style={styles.scheduleLevels}>
          <Text style={styles.scheduleLevel}>
            ⚡ {item.energyLevel === 'high' ? 'Yüksek' : item.energyLevel === 'medium' ? 'Orta' : 'Düşük'}
          </Text>
          <Text style={styles.scheduleLevel}>
            🎯 {item.focusLevel === 'high' ? 'Yüksek' : item.focusLevel === 'medium' ? 'Orta' : 'Düşük'}
          </Text>
        </View>
        <Text style={styles.scheduleConfidence}>
          Güven: {Math.round(item.confidence * 100)}%
        </Text>
      </View>

      {item.context.length > 0 && (
        <View style={styles.scheduleContext}>
          <Text style={styles.scheduleContextLabel}>Bağlam:</Text>
          <Text style={styles.scheduleContextText}>
            {item.context.join(', ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderOptimizationItem = ({ item }: { item: ScheduleOptimization }) => (
    <TouchableOpacity
      style={[
        styles.optimizationItem,
        item.impact === 'high' && styles.highImpactOptimization,
        item.impact === 'medium' && styles.mediumImpactOptimization,
        item.impact === 'low' && styles.lowImpactOptimization,
      ]}
      onPress={() => setSelectedOptimization(item)}
    >
      <View style={styles.optimizationHeader}>
        <Text style={styles.optimizationTypeIcon}>
          {item.type === 'time_optimization' && '⏰'}
          {item.type === 'energy_optimization' && '⚡'}
          {item.type === 'context_optimization' && '🎯'}
          {item.type === 'dependency_optimization' && '🔗'}
        </Text>
        <View style={styles.optimizationMeta}>
          <Text style={styles.optimizationType}>
            {item.type === 'time_optimization' && 'Zaman Optimizasyonu'}
            {item.type === 'energy_optimization' && 'Enerji Optimizasyonu'}
            {item.type === 'context_optimization' && 'Bağlam Optimizasyonu'}
            {item.type === 'dependency_optimization' && 'Bağımlılık Optimizasyonu'}
          </Text>
          <Text style={styles.optimizationImpact}>
            {item.impact === 'high' && '🔴 Yüksek Etki'}
            {item.impact === 'medium' && '🟡 Orta Etki'}
            {item.impact === 'low' && '🟢 Düşük Etki'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.optimizationTitle}>{item.title}</Text>
      <Text style={styles.optimizationDescription}>{item.description}</Text>
      
      <View style={styles.optimizationImprovements}>
        <Text style={styles.optimizationImprovementsLabel}>İyileştirmeler:</Text>
        {item.improvements.map((improvement, index) => (
          <Text key={index} style={styles.optimizationImprovement}>
            • {improvement}
          </Text>
        ))}
      </View>

      <View style={styles.optimizationFooter}>
        <Text style={styles.optimizationConfidence}>
          Güven: {Math.round(item.confidence * 100)}%
        </Text>
        <TouchableOpacity
          style={styles.applyOptimizationButton}
          onPress={() => handleApplyOptimization(item.id)}
        >
          <Text style={styles.applyOptimizationButtonText}>Uygula</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderConflictItem = ({ item }: { item: ScheduleConflict }) => (
    <TouchableOpacity
      style={[
        styles.conflictItem,
        item.severity === 'critical' && styles.criticalConflict,
        item.severity === 'high' && styles.highSeverityConflict,
        item.severity === 'medium' && styles.mediumSeverityConflict,
        item.severity === 'low' && styles.lowSeverityConflict,
      ]}
      onPress={() => setSelectedConflict(item)}
    >
      <View style={styles.conflictHeader}>
        <Text style={styles.conflictTypeIcon}>
          {item.type === 'overlap' && '⏰'}
          {item.type === 'energy_conflict' && '⚡'}
          {item.type === 'context_conflict' && '🎯'}
          {item.type === 'dependency_conflict' && '🔗'}
          {item.type === 'deadline_conflict' && '📅'}
        </Text>
        <View style={styles.conflictMeta}>
          <Text style={styles.conflictType}>
            {item.type === 'overlap' && 'Zaman Çakışması'}
            {item.type === 'energy_conflict' && 'Enerji Çakışması'}
            {item.type === 'context_conflict' && 'Bağlam Çakışması'}
            {item.type === 'dependency_conflict' && 'Bağımlılık Çakışması'}
            {item.type === 'deadline_conflict' && 'Son Tarih Çakışması'}
          </Text>
          <Text style={styles.conflictSeverity}>
            {item.severity === 'critical' && '🔴 Kritik'}
            {item.severity === 'high' && '🟠 Yüksek'}
            {item.severity === 'medium' && '🟡 Orta'}
            {item.severity === 'low' && '🟢 Düşük'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.conflictTitle}>{item.title}</Text>
      <Text style={styles.conflictDescription}>{item.description}</Text>
      
      <View style={styles.conflictSuggestions}>
        <Text style={styles.conflictSuggestionsLabel}>Öneriler:</Text>
        {item.suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.conflictSuggestion}
            onPress={() => handleResolveConflict(item.id, suggestion)}
          >
            <Text style={styles.conflictSuggestionText}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.conflictFooter}>
        <Text style={styles.conflictAutoResolvable}>
          {item.autoResolvable ? '🤖 Otomatik Çözülebilir' : '👤 Manuel Çözüm Gerekli'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSettingsItem = ({ item }: { item: { key: string; label: string; value: any; type: string; options?: any[] } }) => (
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
      key: 'enableSmartScheduling',
      label: 'Akıllı Zamanlama',
      value: settings.enableSmartScheduling,
      type: 'boolean',
    },
    {
      key: 'autoSchedule',
      label: 'Otomatik Zamanlama',
      value: settings.autoSchedule,
      type: 'boolean',
    },
    {
      key: 'respectEnergyLevels',
      label: 'Enerji Seviyelerini Dikkate Al',
      value: settings.respectEnergyLevels,
      type: 'boolean',
    },
    {
      key: 'respectFocusLevels',
      label: 'Odak Seviyelerini Dikkate Al',
      value: settings.respectFocusLevels,
      type: 'boolean',
    },
    {
      key: 'considerContext',
      label: 'Bağlamı Dikkate Al',
      value: settings.considerContext,
      type: 'boolean',
    },
    {
      key: 'optimizeForDeadlines',
      label: 'Son Tarihler İçin Optimize Et',
      value: settings.optimizeForDeadlines,
      type: 'boolean',
    },
    {
      key: 'bufferTime',
      label: 'Ara Zaman (dakika)',
      value: settings.bufferTime,
      type: 'number',
    },
    {
      key: 'maxDailyHours',
      label: 'Maksimum Günlük Saat',
      value: settings.maxDailyHours,
      type: 'number',
    },
    {
      key: 'preferredStartTime',
      label: 'Tercih Edilen Başlangıç Saati',
      value: settings.preferredStartTime,
      type: 'number',
    },
    {
      key: 'preferredEndTime',
      label: 'Tercih Edilen Bitiş Saati',
      value: settings.preferredEndTime,
      type: 'number',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Akıllı Zamanlama</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'schedules' && styles.activeTab]}
            onPress={() => setActiveTab('schedules')}
          >
            <Text style={[styles.tabText, activeTab === 'schedules' && styles.activeTabText]}>
              Zamanlamalar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'optimizations' && styles.activeTab]}
            onPress={() => setActiveTab('optimizations')}
          >
            <Text style={[styles.tabText, activeTab === 'optimizations' && styles.activeTabText]}>
              Optimizasyonlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'conflicts' && styles.activeTab]}
            onPress={() => setActiveTab('conflicts')}
          >
            <Text style={[styles.tabText, activeTab === 'conflicts' && styles.activeTabText]}>
              Çakışmalar ({conflicts.length})
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
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {activeTab === 'schedules' && (
            <View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.totalSchedules}</Text>
                  <Text style={styles.statLabel}>Toplam Zamanlama</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.completedSchedules}</Text>
                  <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(insights.completionRate * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>Başarı Oranı</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {Math.round(insights.averageConfidence * 100)}%
                  </Text>
                  <Text style={styles.statLabel}>Ortalama Güven</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Akıllı Zamanlamalar</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Zamanlamalar oluşturuluyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={schedules}
                  renderItem={renderScheduleItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'optimizations' && (
            <View>
              <Text style={styles.sectionTitle}>Zamanlama Optimizasyonları</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Optimizasyonlar analiz ediliyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={optimizations}
                  renderItem={renderOptimizationItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'conflicts' && (
            <View>
              <Text style={styles.sectionTitle}>Zamanlama Çakışmaları</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Çakışmalar taranıyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={conflicts}
                  renderItem={renderConflictItem}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Akıllı Zamanlama Ayarları</Text>
              <FlatList
                data={settingsData}
                renderItem={renderSettingsItem}
                keyExtractor={(item) => item.key}
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
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  list: {
    marginBottom: 20,
  },
  scheduleItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedSchedule: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  inProgressSchedule: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  urgentSchedule: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  highPrioritySchedule: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  scheduleType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  scheduleMeta: {
    alignItems: 'flex-end',
  },
  schedulePriority: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  scheduleStatus: {
    fontSize: 12,
    color: '#666666',
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  scheduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTimeLabel: {
    fontSize: 12,
    color: '#666666',
    marginRight: 4,
  },
  scheduleTimeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  scheduleDuration: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scheduleDurationText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  scheduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleLevels: {
    flexDirection: 'row',
    gap: 12,
  },
  scheduleLevel: {
    fontSize: 12,
    color: '#666666',
  },
  scheduleConfidence: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  scheduleContext: {
    marginTop: 8,
  },
  scheduleContextLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  scheduleContextText: {
    fontSize: 12,
    color: '#333333',
  },
  optimizationItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  highImpactOptimization: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  mediumImpactOptimization: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  lowImpactOptimization: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  optimizationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optimizationTypeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optimizationMeta: {
    flex: 1,
  },
  optimizationType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  optimizationImpact: {
    fontSize: 12,
    color: '#666666',
  },
  optimizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  optimizationDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  optimizationImprovements: {
    marginBottom: 12,
  },
  optimizationImprovementsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  optimizationImprovement: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  optimizationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optimizationConfidence: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  applyOptimizationButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  applyOptimizationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  conflictItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  criticalConflict: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  highSeverityConflict: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  mediumSeverityConflict: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    backgroundColor: '#FFFDE7',
  },
  lowSeverityConflict: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictTypeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  conflictMeta: {
    flex: 1,
  },
  conflictType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 2,
  },
  conflictSeverity: {
    fontSize: 12,
    color: '#666666',
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  conflictDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  conflictSuggestions: {
    marginBottom: 8,
  },
  conflictSuggestionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  conflictSuggestion: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  conflictSuggestionText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  conflictFooter: {
    alignItems: 'flex-end',
  },
  conflictAutoResolvable: {
    fontSize: 12,
    color: '#666666',
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
