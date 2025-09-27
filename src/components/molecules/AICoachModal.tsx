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
import { useAICoach, CoachMessage, CoachInsight } from '../../hooks/useAICoach';

interface AICoachModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    messages,
    insights,
    settings,
    loading,
    error,
    generateDailyMessages,
    generateDailyInsights,
    markMessageAsRead,
    dismissMessage,
    executeMessageAction,
    updateSettings,
    getCoachInsights,
  } = useAICoach();

  const [activeTab, setActiveTab] = useState<
    'messages' | 'insights' | 'settings'
  >('messages');
  const [selectedMessage, setSelectedMessage] = useState<CoachMessage | null>(
    null
  );
  const [selectedInsight, setSelectedInsight] = useState<CoachInsight | null>(
    null
  );

  const coachInsights = getCoachInsights();

  useEffect(() => {
    if (visible) {
      generateDailyMessages();
      generateDailyInsights();
    }
  }, [visible, generateDailyMessages, generateDailyInsights]);

  const handleMessageAction = async (messageId: string) => {
    try {
      await executeMessageAction(messageId);
      markMessageAsRead(messageId);
    } catch (err) {
      Alert.alert('Hata', 'Aksiyon gerçekleştirilemedi');
    }
  };

  const handleDismissMessage = (messageId: string) => {
    dismissMessage(messageId);
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderMessageItem = ({ item }: { item: CoachMessage }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        !item.read && styles.unreadMessage,
        item.priority === 'high' && styles.highPriorityMessage,
        item.priority === 'medium' && styles.mediumPriorityMessage,
        item.priority === 'low' && styles.lowPriorityMessage,
      ]}
      onPress={() => setSelectedMessage(item)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageTypeContainer}>
          <Text style={styles.messageTypeIcon}>
            {item.type === 'motivation' && '💪'}
            {item.type === 'advice' && '💡'}
            {item.type === 'celebration' && '🎉'}
            {item.type === 'warning' && '⚠️'}
            {item.type === 'reminder' && '⏰'}
            {item.type === 'insight' && '🔍'}
          </Text>
          <Text style={styles.messageType}>
            {item.type === 'motivation' && 'Motivasyon'}
            {item.type === 'advice' && 'Tavsiye'}
            {item.type === 'celebration' && 'Kutlama'}
            {item.type === 'warning' && 'Uyarı'}
            {item.type === 'reminder' && 'Hatırlatma'}
            {item.type === 'insight' && 'İçgörü'}
          </Text>
        </View>
        <View style={styles.messageMeta}>
          <Text style={styles.messagePriority}>
            {item.priority === 'high' && '🔴 Yüksek'}
            {item.priority === 'medium' && '🟡 Orta'}
            {item.priority === 'low' && '🟢 Düşük'}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      </View>

      <Text style={styles.messageTitle}>{item.title}</Text>
      <Text style={styles.messageContent} numberOfLines={3}>
        {item.content}
      </Text>

      <View style={styles.messageFooter}>
        <Text style={styles.messageCategory}>
          {item.category === 'productivity' && '📈 Verimlilik'}
          {item.category === 'wellness' && '💚 Sağlık'}
          {item.category === 'goal_achievement' && '🎯 Hedef'}
          {item.category === 'habit_building' && '🔄 Alışkanlık'}
          {item.category === 'time_management' && '⏰ Zaman'}
        </Text>
        <Text style={styles.messageTime}>
          {item.createdAt.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {item.actionable && (
        <View style={styles.messageActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMessageAction(item.id)}
          >
            <Text style={styles.actionButtonText}>
              {item.actionText || 'Aksiyon Al'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismissMessage(item.id)}
          >
            <Text style={styles.dismissButtonText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderInsightItem = ({ item }: { item: CoachInsight }) => (
    <TouchableOpacity
      style={styles.insightItem}
      onPress={() => setSelectedInsight(item)}
    >
      <View style={styles.insightHeader}>
        <Text style={styles.insightTypeIcon}>
          {item.type === 'performance' && '📊'}
          {item.type === 'pattern' && '🔍'}
          {item.type === 'trend' && '📈'}
          {item.type === 'recommendation' && '💡'}
          {item.type === 'achievement' && '🏆'}
        </Text>
        <View style={styles.insightMeta}>
          <Text style={styles.insightType}>
            {item.type === 'performance' && 'Performans'}
            {item.type === 'pattern' && 'Kalıp'}
            {item.type === 'trend' && 'Trend'}
            {item.type === 'recommendation' && 'Öneri'}
            {item.type === 'achievement' && 'Başarı'}
          </Text>
          <Text style={styles.insightConfidence}>
            Güven: {Math.round(item.confidence * 100)}%
          </Text>
        </View>
      </View>

      <Text style={styles.insightTitle}>{item.title}</Text>
      <Text style={styles.insightDescription}>{item.description}</Text>

      <View style={styles.insightFooter}>
        <Text style={styles.insightDate}>
          {item.createdAt.toLocaleDateString('tr-TR')}
        </Text>
        {item.actionable && (
          <Text style={styles.insightActionable}>Aksiyon Alınabilir</Text>
        )}
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

  const coachInsights = getCoachInsights();

  const settingsData = [
    {
      key: 'enableAICoach',
      label: 'AI Koç',
      value: settings.enableAICoach,
      type: 'boolean',
    },
    {
      key: 'personality',
      label: 'Kişilik',
      value: settings.personality,
      type: 'select',
      options: [
        { value: 'motivational', label: 'Motivasyonel' },
        { value: 'analytical', label: 'Analitik' },
        { value: 'supportive', label: 'Destekleyici' },
        { value: 'challenging', label: 'Meydan Okuyucu' },
        { value: 'balanced', label: 'Dengeli' },
      ],
    },
    {
      key: 'frequency',
      label: 'Mesaj Sıklığı',
      value: settings.frequency,
      type: 'select',
      options: [
        { value: 'low', label: 'Düşük' },
        { value: 'medium', label: 'Orta' },
        { value: 'high', label: 'Yüksek' },
      ],
    },
    {
      key: 'showCelebrations',
      label: 'Kutlamaları Göster',
      value: settings.showCelebrations,
      type: 'boolean',
    },
    {
      key: 'showWarnings',
      label: 'Uyarıları Göster',
      value: settings.showWarnings,
      type: 'boolean',
    },
    {
      key: 'showInsights',
      label: 'İçgörüleri Göster',
      value: settings.showInsights,
      type: 'boolean',
    },
    {
      key: 'respectQuietHours',
      label: 'Sessiz Saatleri Dikkate Al',
      value: settings.respectQuietHours,
      type: 'boolean',
    },
    {
      key: 'maxMessagesPerDay',
      label: 'Günlük Maksimum Mesaj',
      value: settings.maxMessagesPerDay,
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
          <Text style={styles.title}>AI Koç</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
            onPress={() => setActiveTab('messages')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'messages' && styles.activeTabText,
              ]}
            >
              Mesajlar ({coachInsights.unreadMessages})
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
              İçgörüler
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

          {activeTab === 'messages' && (
            <View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {coachInsights.totalMessages}
                  </Text>
                  <Text style={styles.statLabel}>Toplam Mesaj</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {coachInsights.unreadMessages}
                  </Text>
                  <Text style={styles.statLabel}>Okunmamış</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {coachInsights.todayMessages}
                  </Text>
                  <Text style={styles.statLabel}>Bugün</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>AI Koç Mesajları</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF5722" />
                  <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={messages}
                  renderItem={renderMessageItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'insights' && (
            <View>
              <Text style={styles.sectionTitle}>AI İçgörüleri</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF5722" />
                  <Text style={styles.loadingText}>
                    İçgörüler analiz ediliyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={coachInsights}
                  renderItem={renderInsightItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>AI Koç Ayarları</Text>
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
    borderBottomColor: '#FF5722',
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF5722',
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
    color: '#FF5722',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  list: {
    marginBottom: 20,
  },
  messageItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unreadMessage: {
    borderColor: '#FF5722',
    backgroundColor: '#FFF3E0',
  },
  highPriorityMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  mediumPriorityMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  lowPriorityMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  messageType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagePriority: {
    fontSize: 12,
    color: '#666666',
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageCategory: {
    fontSize: 12,
    color: '#666666',
  },
  messageTime: {
    fontSize: 12,
    color: '#999999',
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  dismissButtonText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
  },
  insightItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTypeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  insightMeta: {
    flex: 1,
  },
  insightType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
    marginBottom: 2,
  },
  insightConfidence: {
    fontSize: 12,
    color: '#666666',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightDate: {
    fontSize: 12,
    color: '#999999',
  },
  insightActionable: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
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
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
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
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
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
    backgroundColor: '#FF5722',
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
