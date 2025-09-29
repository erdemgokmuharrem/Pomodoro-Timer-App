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
  TextInput,
  FlatList,
} from 'react-native';
import {
  useReflectJournal,
  JournalEntry,
  JournalPrompt,
} from '../../hooks/useReflectJournal';

interface ReflectJournalModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ReflectJournalModal: React.FC<ReflectJournalModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    entries,
    prompts,
    settings,
    loading,
    error,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getJournalEntryByDate,
    getJournalInsights,
    exportJournalData,
    importJournalData,
    updateSettings,
  } = useReflectJournal();

  const [activeTab, setActiveTab] = useState<
    'today' | 'calendar' | 'history' | 'insights' | 'settings'
  >('today');
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalData, setJournalData] = useState<Partial<JournalEntry>>({});

  useEffect(() => {
    if (visible) {
      const todayEntry = getJournalEntryByDate(new Date());
      if (todayEntry) {
        setCurrentEntry(todayEntry);
        setJournalData(todayEntry);
      } else {
        setCurrentEntry(null);
        setJournalData({
          mood: 'neutral',
          energy: 5,
          focus: 5,
          productivity: 5,
          stress: 5,
          satisfaction: 5,
          reflection: '',
          achievements: [],
          challenges: [],
          lessons: [],
          goals: [],
          gratitude: [],
          insights: [],
          tags: [],
          activities: [],
        });
      }
    }
  }, [visible]);

  const handleSaveEntry = async () => {
    try {
      if (currentEntry) {
        const success = await updateJournalEntry(currentEntry.id, journalData);
        if (success) {
          Alert.alert('Başarılı', 'Günlük kaydı güncellendi!');
        } else {
          Alert.alert('Hata', 'Günlük kaydı güncellenemedi');
        }
      } else {
        const newEntry = await createJournalEntry(journalData);
        if (newEntry) {
          setCurrentEntry(newEntry);
          Alert.alert('Başarılı', 'Yeni günlük kaydı oluşturuldu!');
        } else {
          Alert.alert('Hata', 'Günlük kaydı oluşturulamadı');
        }
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleExportData = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const data = await exportJournalData(format);
      if (data) {
        Alert.alert(
          'Başarılı',
          `${format.toUpperCase()} formatında veri dışa aktarıldı`
        );
      } else {
        Alert.alert('Hata', 'Veri dışa aktarılamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderMoodSelector = () => (
    <View style={styles.moodSelector}>
      <Text style={styles.sectionTitle}>Bugün nasıl hissediyorsun?</Text>
      <View style={styles.moodOptions}>
        {[
          { key: 'excellent', emoji: '😄', label: 'Mükemmel' },
          { key: 'good', emoji: '😊', label: 'İyi' },
          { key: 'neutral', emoji: '😐', label: 'Normal' },
          { key: 'poor', emoji: '😔', label: 'Kötü' },
          { key: 'terrible', emoji: '😢', label: 'Berbat' },
        ].map(mood => (
          <TouchableOpacity
            key={mood.key}
            style={[
              styles.moodOption,
              journalData.mood === mood.key && styles.selectedMoodOption,
            ]}
            onPress={() =>
              setJournalData(prev => ({ ...prev, mood: mood.key as any }))
            }
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderScaleSelector = (
    title: string,
    value: number,
    onValueChange: (value: number) => void
  ) => (
    <View style={styles.scaleSelector}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.scaleContainer}>
        <Text style={styles.scaleLabel}>1</Text>
        <View style={styles.scaleBar}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(scale => (
            <TouchableOpacity
              key={scale}
              style={[
                styles.scaleOption,
                value >= scale && styles.selectedScaleOption,
              ]}
              onPress={() => onValueChange(scale)}
            />
          ))}
        </View>
        <Text style={styles.scaleLabel}>10</Text>
      </View>
      <Text style={styles.scaleValue}>{value}/10</Text>
    </View>
  );

  const renderTextInput = (
    title: string,
    value: string,
    onChangeText: (text: string) => void,
    multiline = false
  ) => (
    <View style={styles.textInputContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TextInput
        style={[styles.textInput, multiline && styles.multilineTextInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={`${title} yazın...`}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
    </View>
  );

  const renderListInput = (
    title: string,
    items: string[],
    onAdd: (item: string) => void,
    onRemove: (index: number) => void
  ) => (
    <View style={styles.listInputContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.listItems}>
        {items.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{item}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TextInput
        style={styles.addItemInput}
        placeholder={`${title} ekle...`}
        onSubmitEditing={e => {
          if (e.nativeEvent.text.trim()) {
            onAdd(e.nativeEvent.text.trim());
            e.nativeEvent.text = '';
          }
        }}
      />
    </View>
  );

  const renderEntryItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.entryItem}
      onPress={() => {
        setCurrentEntry(item);
        setJournalData(item);
        setActiveTab('today');
      }}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {item.date.toLocaleDateString('tr-TR')}
        </Text>
        <Text style={styles.entryMood}>
          {item.mood === 'excellent' && '😄'}
          {item.mood === 'good' && '😊'}
          {item.mood === 'neutral' && '😐'}
          {item.mood === 'poor' && '😔'}
          {item.mood === 'terrible' && '😢'}
        </Text>
      </View>
      <Text style={styles.entryReflection} numberOfLines={2}>
        {item.reflection || 'Refleksiyon yazılmamış'}
      </Text>
      <View style={styles.entryStats}>
        <Text style={styles.entryStat}>⚡ {item.energy}/10</Text>
        <Text style={styles.entryStat}>🎯 {item.focus}/10</Text>
        <Text style={styles.entryStat}>📈 {item.productivity}/10</Text>
        <Text style={styles.entryStat}>😌 {item.satisfaction}/10</Text>
      </View>
    </TouchableOpacity>
  );

  const insights = getJournalInsights();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reflect Journal</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'today' && styles.activeTab]}
            onPress={() => setActiveTab('today')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'today' && styles.activeTabText,
              ]}
            >
              Bugün
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calendar' && styles.activeTab]}
            onPress={() => setActiveTab('calendar')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'calendar' && styles.activeTabText,
              ]}
            >
              Takvim
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'history' && styles.activeTabText,
              ]}
            >
              Geçmiş
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

          {activeTab === 'today' && (
            <View>
              {renderMoodSelector()}

              {renderScaleSelector(
                'Enerji Seviyen',
                journalData.energy || 5,
                value => setJournalData(prev => ({ ...prev, energy: value }))
              )}

              {renderScaleSelector(
                'Odaklanma Seviyen',
                journalData.focus || 5,
                value => setJournalData(prev => ({ ...prev, focus: value }))
              )}

              {renderScaleSelector(
                'Verimlilik Seviyen',
                journalData.productivity || 5,
                value =>
                  setJournalData(prev => ({ ...prev, productivity: value }))
              )}

              {renderScaleSelector(
                'Stres Seviyen',
                journalData.stress || 5,
                value => setJournalData(prev => ({ ...prev, stress: value }))
              )}

              {renderScaleSelector(
                'Memnuniyet Seviyen',
                journalData.satisfaction || 5,
                value =>
                  setJournalData(prev => ({ ...prev, satisfaction: value }))
              )}

              {renderTextInput(
                'Bugünkü Refleksiyon',
                journalData.reflection || '',
                text => setJournalData(prev => ({ ...prev, reflection: text })),
                true
              )}

              {renderListInput(
                'Başarılar',
                journalData.achievements || [],
                item =>
                  setJournalData(prev => ({
                    ...prev,
                    achievements: [...(prev.achievements || []), item],
                  })),
                index =>
                  setJournalData(prev => ({
                    ...prev,
                    achievements: (prev.achievements || []).filter(
                      (_, i) => i !== index
                    ),
                  }))
              )}

              {renderListInput(
                'Zorluklar',
                journalData.challenges || [],
                item =>
                  setJournalData(prev => ({
                    ...prev,
                    challenges: [...(prev.challenges || []), item],
                  })),
                index =>
                  setJournalData(prev => ({
                    ...prev,
                    challenges: (prev.challenges || []).filter(
                      (_, i) => i !== index
                    ),
                  }))
              )}

              {renderListInput(
                'Öğrendiklerim',
                journalData.lessons || [],
                item =>
                  setJournalData(prev => ({
                    ...prev,
                    lessons: [...(prev.lessons || []), item],
                  })),
                index =>
                  setJournalData(prev => ({
                    ...prev,
                    lessons: (prev.lessons || []).filter((_, i) => i !== index),
                  }))
              )}

              {renderListInput(
                'Yarınki Hedefler',
                journalData.goals || [],
                item =>
                  setJournalData(prev => ({
                    ...prev,
                    goals: [...(prev.goals || []), item],
                  })),
                index =>
                  setJournalData(prev => ({
                    ...prev,
                    goals: (prev.goals || []).filter((_, i) => i !== index),
                  }))
              )}

              {renderListInput(
                'Minnettar Olduklarım',
                journalData.gratitude || [],
                item =>
                  setJournalData(prev => ({
                    ...prev,
                    gratitude: [...(prev.gratitude || []), item],
                  })),
                index =>
                  setJournalData(prev => ({
                    ...prev,
                    gratitude: (prev.gratitude || []).filter(
                      (_, i) => i !== index
                    ),
                  }))
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveEntry}
              >
                <Text style={styles.saveButtonText}>
                  {currentEntry ? 'Güncelle' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === 'history' && (
            <View>
              <Text style={styles.sectionTitle}>Günlük Geçmişi</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>
                    Günlük kayıtları yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={entries}
                  renderItem={renderEntryItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'calendar' && (
            <View>
              <Text style={styles.sectionTitle}>Günlük Takvimi</Text>
              <View style={styles.calendarContainer}>
                <Text style={styles.calendarTitle}>
                  {new Date().toLocaleDateString('tr-TR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>

                <View style={styles.calendarHeader}>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(
                    day => (
                      <Text key={day} style={styles.calendarHeaderText}>
                        {day}
                      </Text>
                    )
                  )}
                </View>

                <View style={styles.calendarGrid}>
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 6; // Adjust for first day of month
                    const hasEntry = hasEntryForDate(new Date(2024, 0, day));
                    const mood = getMoodForDate(new Date(2024, 0, day));

                    const getMoodColor = (mood: string | null) => {
                      switch (mood) {
                        case 'excellent':
                          return '#4CAF50';
                        case 'good':
                          return '#8BC34A';
                        case 'neutral':
                          return '#FFC107';
                        case 'poor':
                          return '#FF9800';
                        case 'terrible':
                          return '#F44336';
                        default:
                          return '#E0E0E0';
                      }
                    };

                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.calendarDay,
                          hasEntry && styles.calendarDayWithEntry,
                          { backgroundColor: getMoodColor(mood) },
                        ]}
                        onPress={() => {
                          if (day > 0) {
                            const date = new Date(2024, 0, day);
                            setSelectedDate(date);
                            setActiveTab('today');
                          }
                        }}
                      >
                        <Text style={styles.calendarDayText}>
                          {day > 0 ? day : ''}
                        </Text>
                        {hasEntry && <View style={styles.calendarDayDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.calendarLegend}>
                  <Text style={styles.calendarLegendTitle}>Ruh Hali:</Text>
                  <View style={styles.calendarLegendItems}>
                    <View style={styles.calendarLegendItem}>
                      <View
                        style={[
                          styles.calendarLegendColor,
                          { backgroundColor: '#4CAF50' },
                        ]}
                      />
                      <Text style={styles.calendarLegendText}>Mükemmel</Text>
                    </View>
                    <View style={styles.calendarLegendItem}>
                      <View
                        style={[
                          styles.calendarLegendColor,
                          { backgroundColor: '#8BC34A' },
                        ]}
                      />
                      <Text style={styles.calendarLegendText}>İyi</Text>
                    </View>
                    <View style={styles.calendarLegendItem}>
                      <View
                        style={[
                          styles.calendarLegendColor,
                          { backgroundColor: '#FFC107' },
                        ]}
                      />
                      <Text style={styles.calendarLegendText}>Normal</Text>
                    </View>
                    <View style={styles.calendarLegendItem}>
                      <View
                        style={[
                          styles.calendarLegendColor,
                          { backgroundColor: '#FF9800' },
                        ]}
                      />
                      <Text style={styles.calendarLegendText}>Kötü</Text>
                    </View>
                    <View style={styles.calendarLegendItem}>
                      <View
                        style={[
                          styles.calendarLegendColor,
                          { backgroundColor: '#F44336' },
                        ]}
                      />
                      <Text style={styles.calendarLegendText}>Berbat</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'insights' && (
            <View>
              <Text style={styles.sectionTitle}>Günlük İçgörüleri</Text>

              <View style={styles.insightsContainer}>
                <View style={styles.insightItem}>
                  <Text style={styles.insightNumber}>
                    {insights.totalEntries}
                  </Text>
                  <Text style={styles.insightLabel}>Toplam Kayıt</Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightNumber}>
                    {insights.averageMood.toFixed(1)}
                  </Text>
                  <Text style={styles.insightLabel}>Ortalama Ruh Hali</Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightNumber}>
                    {insights.averageEnergy.toFixed(1)}
                  </Text>
                  <Text style={styles.insightLabel}>Ortalama Enerji</Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightNumber}>
                    {insights.averageFocus.toFixed(1)}
                  </Text>
                  <Text style={styles.insightLabel}>Ortalama Odak</Text>
                </View>
              </View>

              <View style={styles.exportContainer}>
                <Text style={styles.sectionTitle}>Veri Dışa Aktarma</Text>
                <View style={styles.exportButtons}>
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleExportData('json')}
                  >
                    <Text style={styles.exportButtonText}>JSON</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={() => handleExportData('csv')}
                  >
                    <Text style={styles.exportButtonText}>CSV</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Günlük Ayarları</Text>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Günlük Hatırlatıcı</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.dailyReminder && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        dailyReminder: !settings.dailyReminder,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.dailyReminder && styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.dailyReminder ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Otomatik Kaydet</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.autoSave && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({ autoSave: !settings.autoSave })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.autoSave && styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.autoSave ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Gizlilik</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.privacy === 'private' &&
                        styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        privacy:
                          settings.privacy === 'private' ? 'public' : 'private',
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.privacy === 'private' &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.privacy === 'private' ? 'Özel' : 'Genel'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    fontSize: 10,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginVertical: 12,
  },
  moodSelector: {
    marginBottom: 20,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedMoodOption: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666666',
  },
  scaleSelector: {
    marginBottom: 20,
  },
  scaleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  scaleLabel: {
    fontSize: 12,
    color: '#666666',
    marginHorizontal: 8,
  },
  scaleBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  scaleOption: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedScaleOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  scaleValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
  },
  textInputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  multilineTextInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  listInputContainer: {
    marginBottom: 20,
  },
  listItems: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addItemInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    marginBottom: 20,
  },
  entryItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  entryMood: {
    fontSize: 24,
  },
  entryReflection: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  entryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  entryStat: {
    fontSize: 12,
    color: '#666666',
  },
  calendarContainer: {
    padding: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333333',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666666',
    textAlign: 'center',
    width: 40,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  calendarDayWithEntry: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  calendarDayDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  calendarLegend: {
    marginTop: 16,
  },
  calendarLegendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  calendarLegendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarLegendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  calendarLegendText: {
    fontSize: 12,
    color: '#666666',
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  insightItem: {
    alignItems: 'center',
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
  },
  exportContainer: {
    marginBottom: 20,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
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
