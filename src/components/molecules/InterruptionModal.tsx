import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { usePomodoroStore, Interruption } from '../../store/usePomodoroStore';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

interface InterruptionModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
}

const InterruptionModal: React.FC<InterruptionModalProps> = ({
  visible,
  onClose,
  sessionId,
}) => {
  const { addInterruption } = usePomodoroStore();
  const [selectedReason, setSelectedReason] = useState<
    Interruption['reason'] | null
  >(null);
  const [description, setDescription] = useState('');

  const interruptionReasons = [
    { value: 'phone' as const, label: 'Telefon', icon: '📞' },
    { value: 'email' as const, label: 'E-posta', icon: '📧' },
    { value: 'social' as const, label: 'Sosyal Medya', icon: '📱' },
    { value: 'urgent' as const, label: 'Acil Durum', icon: '🚨' },
    { value: 'other' as const, label: 'Diğer', icon: '❓' },
  ];

  const handleSave = () => {
    if (!selectedReason) {
      Alert.alert('Hata', 'Lütfen kesinti nedenini seçin');
      return;
    }

    addInterruption(sessionId, selectedReason, description.trim() || undefined);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedReason(null);
    setDescription('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const ReasonButton = ({
    reason,
  }: {
    reason: (typeof interruptionReasons)[0];
  }) => (
    <TouchableOpacity
      style={[
        styles.reasonButton,
        selectedReason === reason.value && styles.reasonButtonActive,
      ]}
      onPress={() => setSelectedReason(reason.value)}
    >
      <Text style={styles.reasonIcon}>{reason.icon}</Text>
      <Text
        style={[
          styles.reasonText,
          selectedReason === reason.value && styles.reasonTextActive,
        ]}
      >
        {reason.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Kesinti Kaydet</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Kaydet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Kesinti Nedeni</Text>
            <View style={styles.reasonsGrid}>
              {interruptionReasons.map(reason => (
                <ReasonButton key={reason.value} reason={reason} />
              ))}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama (Opsiyonel)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Kesinti hakkında detay verin..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </Card>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 İpucu</Text>
            <Text style={styles.infoText}>
              Kesintilerinizi kaydetmek, odaklanma alışkanlıklarınızı analiz
              etmenize ve gelecekte daha iyi planlama yapmanıza yardımcı olur.
            </Text>
          </View>
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
  saveButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
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
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reasonButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    alignItems: 'center',
    gap: 8,
  },
  reasonButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  reasonIcon: {
    fontSize: 24,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  reasonTextActive: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    height: 80,
    textAlignVertical: 'top',
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

export default InterruptionModal;
