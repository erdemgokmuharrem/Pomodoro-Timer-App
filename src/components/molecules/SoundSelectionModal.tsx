import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSoundStore, SoundOption } from '../../store/useSoundStore';
import Card from '../atoms/Card';

interface SoundSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

const SoundSelectionModal: React.FC<SoundSelectionModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    settings,
    availableSounds,
    setBackgroundSound,
    setBackgroundVolume,
    toggleBackgroundSound,
  } = useSoundStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Null checks
  const safeSettings = settings || {
    backgroundSound: null,
    backgroundVolume: 0.3,
    soundEffectsEnabled: true,
    backgroundSoundEnabled: false,
  };
  const safeAvailableSounds = availableSounds || [];

  const categories = [
    { id: 'all', name: 'Tümü', emoji: '🎵' },
    { id: 'nature', name: 'Doğa', emoji: '🌿' },
    { id: 'ambient', name: 'Ortam', emoji: '🏠' },
    { id: 'focus', name: 'Odaklanma', emoji: '🧠' },
    { id: 'white_noise', name: 'Gürültü', emoji: '📻' },
  ];

  const filteredSounds =
    selectedCategory === 'all'
      ? safeAvailableSounds
      : safeAvailableSounds.filter(
          sound => sound && sound.category === selectedCategory
        );

  const handleSoundSelect = (sound: SoundOption) => {
    if (!sound) return;
    setBackgroundSound(sound);
    if (!safeSettings.backgroundSoundEnabled) {
      toggleBackgroundSound();
    }
  };

  const handleVolumeChange = (value: number) => {
    setBackgroundVolume(value);
  };

  const SoundItem = ({ sound }: { sound: SoundOption }) => {
    if (!sound) return null;
    const isSelected = safeSettings.backgroundSound?.id === sound.id;

    return (
      <TouchableOpacity
        style={[styles.soundItem, isSelected && styles.soundItemSelected]}
        onPress={() => handleSoundSelect(sound)}
      >
        <View style={styles.soundInfo}>
          <Text style={styles.soundEmoji}>{sound.emoji}</Text>
          <View style={styles.soundDetails}>
            <Text
              style={[styles.soundName, isSelected && styles.soundNameSelected]}
            >
              {sound.name}
            </Text>
            <Text
              style={[
                styles.soundDescription,
                isSelected && styles.soundDescriptionSelected,
              ]}
            >
              {sound.description}
            </Text>
          </View>
        </View>
        {isSelected && <Text style={styles.selectedIcon}>✓</Text>}
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.title}>Ses Seçimi</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneButton}>Tamam</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Volume Control */}
          {safeSettings.backgroundSound && (
            <Card style={styles.volumeCard}>
              <Text style={styles.volumeTitle}>Ses Seviyesi</Text>
              <View style={styles.volumeContainer}>
                <Text style={styles.volumeLabel}>Sessiz</Text>
                <Slider
                  style={styles.volumeSlider}
                  minimumValue={0}
                  maximumValue={1}
                  value={safeSettings.backgroundVolume}
                  onValueChange={handleVolumeChange}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#E2E8F0"
                  thumbStyle={styles.volumeThumb}
                />
                <Text style={styles.volumeLabel}>Yüksek</Text>
              </View>
              <Text style={styles.volumeValue}>
                {Math.round(safeSettings.backgroundVolume * 100)}%
              </Text>
            </Card>
          )}

          {/* Category Filter */}
          <Card style={styles.categoryCard}>
            <Text style={styles.categoryTitle}>Kategoriler</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id &&
                        styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryName,
                        selectedCategory === category.id &&
                          styles.categoryNameActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>

          {/* Sound List */}
          <Card style={styles.soundsCard}>
            <Text style={styles.soundsTitle}>Sesler</Text>
            <View style={styles.soundsList}>
              {filteredSounds.map(sound => (
                <SoundItem key={sound.id} sound={sound} />
              ))}
            </View>
          </Card>

          {/* Info */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 İpucu</Text>
            <Text style={styles.infoText}>
              Arka plan sesleri odaklanmanızı artırabilir. Alpha dalgaları ve
              beyaz gürültü özellikle konsantrasyon için önerilir.
            </Text>
          </Card>
        </ScrollView>
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
  doneButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  volumeCard: {
    marginBottom: 16,
  },
  volumeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  volumeThumb: {
    backgroundColor: '#3B82F6',
    width: 20,
    height: 20,
  },
  volumeLabel: {
    fontSize: 12,
    color: '#64748B',
    minWidth: 40,
  },
  volumeValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  categoryCard: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  categoryNameActive: {
    color: 'white',
  },
  soundsCard: {
    marginBottom: 16,
  },
  soundsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  soundsList: {
    gap: 8,
  },
  soundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  soundItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  soundEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  soundDetails: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  soundNameSelected: {
    color: '#3B82F6',
  },
  soundDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  soundDescriptionSelected: {
    color: '#1E40AF',
  },
  selectedIcon: {
    fontSize: 20,
    color: '#3B82F6',
    fontWeight: 'bold',
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

export default SoundSelectionModal;
