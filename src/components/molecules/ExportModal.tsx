import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { useGamificationStore } from '../../store/useGamificationStore';
import { exportService, ExportFormat } from '../../services/exportService';
import Card from '../atoms/Card';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ visible, onClose }) => {
  const { sessions, tasks, settings } = usePomodoroStore();
  const { userStats } = useGamificationStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'Tüm veriler (önerilen)',
      icon: '📄',
    },
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Excel ile açılabilir',
      icon: '📊',
    },
    {
      value: 'excel' as const,
      label: 'Excel',
      description: 'Detaylı rapor',
      icon: '📈',
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const exportData = exportService.prepareExportData(
        sessions,
        tasks,
        userStats,
        settings
      );

      const result = await exportService.exportData(exportData, selectedFormat);

      Alert.alert(
        'Export Başarılı! 🎉',
        `Verileriniz ${result.fileName} dosyasına kaydedildi.\n\nDosya yolu: ${result.filePath}`,
        [{ text: 'Tamam', onPress: onClose }]
      );
    } catch (error) {
      // console.error('Export error:', error);
      Alert.alert(
        'Export Hatası',
        'Verileriniz export edilirken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const FormatButton = ({ format }: { format: (typeof exportFormats)[0] }) => (
    <TouchableOpacity
      style={[
        styles.formatButton,
        selectedFormat === format.value && styles.formatButtonActive,
      ]}
      onPress={() => setSelectedFormat(format.value)}
    >
      <Text style={styles.formatIcon}>{format.icon}</Text>
      <View style={styles.formatInfo}>
        <Text
          style={[
            styles.formatLabel,
            selectedFormat === format.value && styles.formatLabelActive,
          ]}
        >
          {format.label}
        </Text>
        <Text
          style={[
            styles.formatDescription,
            selectedFormat === format.value && styles.formatDescriptionActive,
          ]}
        >
          {format.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getExportStats = () => {
    const completedSessions = (sessions || []).filter(s => s.isCompleted);
    const completedTasks = (tasks || []).filter(t => t.isCompleted);
    const totalFocusTime = completedSessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );

    return {
      sessions: (sessions || []).length,
      completedSessions: completedSessions.length,
      tasks: (tasks || []).length,
      completedTasks: completedTasks.length,
      totalFocusTime,
      badges: userStats.badges.length,
      level: userStats.level,
    };
  };

  const stats = getExportStats();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Veri Dışa Aktar</Text>
          <TouchableOpacity onPress={handleExport} disabled={isExporting}>
            <Text
              style={[
                styles.exportButton,
                isExporting && styles.exportButtonDisabled,
              ]}
            >
              {isExporting ? 'Aktarılıyor...' : 'Dışa Aktar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {isExporting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>
                Verileriniz hazırlanıyor...
              </Text>
            </View>
          )}

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Export İstatistikleri</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.sessions}</Text>
                <Text style={styles.statLabel}>Toplam Oturum</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.completedSessions}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.tasks}</Text>
                <Text style={styles.statLabel}>Toplam Görev</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.completedTasks}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(stats.totalFocusTime / 60)}h
                </Text>
                <Text style={styles.statLabel}>Odaklanma</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.badges}</Text>
                <Text style={styles.statLabel}>Rozet</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Export Formatı</Text>
            <View style={styles.formatsContainer}>
              {exportFormats.map(format => (
                <FormatButton key={format.value} format={format} />
              ))}
            </View>
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Bilgi</Text>
            <Text style={styles.infoText}>
              Export edilen veriler şunları içerir:
              {'\n'}• Tüm pomodoro oturumları
              {'\n'}• Görev listesi ve ilerlemeleri
              {'\n'}• İstatistikler ve rozetler
              {'\n'}• Ayarlar ve tercihler
            </Text>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cancelButton: {
    fontSize: 16,
    color: '#64748B',
  },
  exportButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  exportButtonDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  formatsContainer: {
    gap: 12,
  },
  formatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  formatButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  formatIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  formatInfo: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  formatLabelActive: {
    color: 'white',
  },
  formatDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  formatDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default ExportModal;
