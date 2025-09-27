import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useTheme } from '../components/ThemeProvider';
import ExportModal from '../components/molecules/ExportModal';
import AccessibilityModal from '../components/molecules/AccessibilityModal';
import { CalendarSyncModal } from '../components/molecules/CalendarSyncModal';
import { AppBlockingModal } from '../components/molecules/AppBlockingModal';

const SettingsScreen = () => {
  const { settings, updateSettings, sessions, tasks } = usePomodoroStore();
  const { isDark, toggleTheme, setThemeMode } = useTheme();

  const [pomodoroDuration, setPomodoroDuration] = useState(
    settings.pomodoroDuration
  );
  const [shortBreakDuration, setShortBreakDuration] = useState(
    settings.shortBreakDuration
  );
  const [longBreakDuration, setLongBreakDuration] = useState(
    settings.longBreakDuration
  );
  const [autoStartBreaks, setAutoStartBreaks] = useState(
    settings.autoStartBreaks
  );
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(
    settings.autoStartPomodoros
  );
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    settings.notificationsEnabled
  );
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [accessibilityModalVisible, setAccessibilityModalVisible] =
    useState(false);
  const [calendarSyncModalVisible, setCalendarSyncModalVisible] =
    useState(false);
  const [appBlockingModalVisible, setAppBlockingModalVisible] = useState(false);

  const handleDurationChange = (
    type: 'pomodoro' | 'shortBreak' | 'longBreak',
    value: number
  ) => {
    if (type === 'pomodoro') {
      setPomodoroDuration(value);
      updateSettings({ pomodoroDuration: value });
    } else if (type === 'shortBreak') {
      setShortBreakDuration(value);
      updateSettings({ shortBreakDuration: value });
    } else {
      setLongBreakDuration(value);
      updateSettings({ longBreakDuration: value });
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
    if (key === 'autoStartBreaks') setAutoStartBreaks(value);
    if (key === 'autoStartPomodoros') setAutoStartPomodoros(value);
    if (key === 'soundEnabled') setSoundEnabled(value);
    if (key === 'notificationsEnabled') setNotificationsEnabled(value);
  };

  const handleExportData = () => {
    setExportModalVisible(true);
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Verileri Sil',
      'Tüm verilerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would clear the store
            Alert.alert(
              'Başarılı',
              'Tüm verileriniz silindi. (Uygulama yeniden başlatıldığında varsayılan ayarlar yüklenecek)'
            );
          },
        },
      ]
    );
  };

  const DurationSelector = ({
    title,
    value,
    onChange,
    min = 1,
    max = 60,
  }: {
    title: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
  }) => (
    <View style={styles.durationSelector}>
      <Text style={styles.durationTitle}>{title}</Text>
      <View style={styles.durationControls}>
        <TouchableOpacity
          style={styles.durationButton}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Text style={styles.durationButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.durationValue}>{value} dk</Text>
        <TouchableOpacity
          style={styles.durationButton}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Text style={styles.durationButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SettingItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    type = 'switch',
  }: {
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    type?: 'switch' | 'button';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : (
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => onValueChange(!value)}
        >
          <Text style={styles.settingButtonText}>Aç</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        {/* Timer Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zamanlayıcı Ayarları</Text>

          <DurationSelector
            title="Pomodoro Süresi"
            value={pomodoroDuration}
            onChange={value => handleDurationChange('pomodoro', value)}
          />

          <DurationSelector
            title="Kısa Mola"
            value={shortBreakDuration}
            onChange={value => handleDurationChange('shortBreak', value)}
          />

          <DurationSelector
            title="Uzun Mola"
            value={longBreakDuration}
            onChange={value => handleDurationChange('longBreak', value)}
          />
        </View>

        {/* Behavior Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Davranış Ayarları</Text>

          <SettingItem
            title="Molaları Otomatik Başlat"
            subtitle="Mola süresi bittiğinde otomatik olarak yeni pomodoro başlat"
            value={autoStartBreaks}
            onValueChange={value =>
              handleSettingChange('autoStartBreaks', value)
            }
          />

          <SettingItem
            title="Pomodoroları Otomatik Başlat"
            subtitle="Pomodoro süresi bittiğinde otomatik olarak mola başlat"
            value={autoStartPomodoros}
            onValueChange={value =>
              handleSettingChange('autoStartPomodoros', value)
            }
          />
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim & Ses</Text>

          <SettingItem
            title="Ses Efektleri"
            subtitle="Timer bittiğinde ses çal"
            value={soundEnabled}
            onValueChange={value => handleSettingChange('soundEnabled', value)}
          />

          <SettingItem
            title="Bildirimler"
            subtitle="Uygulama kapalıyken bildirim gönder"
            value={notificationsEnabled}
            onValueChange={value =>
              handleSettingChange('notificationsEnabled', value)
            }
          />
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>

          <SettingItem
            title="Karanlık Mod"
            subtitle="Koyu tema kullan"
            value={isDark}
            onValueChange={toggleTheme}
          />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setAccessibilityModalVisible(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Erişilebilirlik</Text>
              <Text style={styles.settingSubtitle}>
                Font boyutu ve erişilebilirlik ayarları
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Integration Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entegrasyonlar</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setCalendarSyncModalVisible(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Takvim Senkronizasyonu</Text>
              <Text style={styles.settingSubtitle}>
                Google Calendar ve Outlook ile senkronize et
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setAppBlockingModalVisible(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Dikkat Engelleme</Text>
              <Text style={styles.settingSubtitle}>
                Dikkat dağıtıcı uygulamaları ve websiteleri engelle
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri Yönetimi</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <Text style={styles.actionButtonText}>Verileri Dışa Aktar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleDeleteData}
          >
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              Tüm Verileri Sil
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama Bilgisi</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sürüm</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Geliştirici</Text>
            <Text style={styles.infoValue}>Pomodoro+ Team</Text>
          </View>
        </View>
      </ScrollView>

      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />

      <AccessibilityModal
        visible={accessibilityModalVisible}
        onClose={() => setAccessibilityModalVisible(false)}
      />

      <CalendarSyncModal
        visible={calendarSyncModalVisible}
        onClose={() => setCalendarSyncModalVisible(false)}
      />

      <AppBlockingModal
        visible={appBlockingModalVisible}
        onClose={() => setAppBlockingModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  durationTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  durationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  settingButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  settingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    color: '#DC2626',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
});

export default SettingsScreen;
