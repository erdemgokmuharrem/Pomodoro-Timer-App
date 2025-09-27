import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useAutoRescheduleStore } from '../../store/useAutoRescheduleStore';
import { useTheme } from '../../hooks/useTheme';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

interface AutoRescheduleModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AutoRescheduleModal: React.FC<AutoRescheduleModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { settings, updateSettings, energyLevel, consecutivePomodoros } =
    useAutoRescheduleStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
    Alert.alert('Başarılı', 'Otomatik yeniden planlama ayarları güncellendi!');
  };

  const handleReset = () => {
    setLocalSettings({
      enabled: true,
      autoStartNextTask: true,
      autoStartBreak: false,
      breakBeforeNextTask: true,
      priorityBased: true,
      energyBased: true,
      maxConsecutivePomodoros: 4,
    });
  };

  const getEnergyLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getEnergyLevelText = (level: string) => {
    switch (level) {
      case 'high':
        return 'Yüksek Enerji';
      case 'medium':
        return 'Orta Enerji';
      case 'low':
        return 'Düşük Enerji';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: theme.colors.text,
            }}
          >
            Otomatik Yeniden Planlama
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.primary,
              }}
            >
              Kapat
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Enerji Seviyesi Göstergesi */}
          <Card style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 10,
              }}
            >
              Mevcut Enerji Seviyesi
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: getEnergyLevelColor(energyLevel.level),
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                {getEnergyLevelText(energyLevel.level)}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
              }}
            >
              Ardışık Pomodoro: {consecutivePomodoros}
            </Text>
          </Card>

          {/* Ana Ayarlar */}
          <Card style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 15,
              }}
            >
              Ana Ayarlar
            </Text>

            {/* Otomatik Yeniden Planlama */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 5,
                  }}
                >
                  Otomatik Yeniden Planlama
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Pomodoro tamamlandığında otomatik işlemler
                </Text>
              </View>
              <Switch
                value={localSettings.enabled}
                onValueChange={value =>
                  setLocalSettings({
                    ...localSettings,
                    enabled: value,
                  })
                }
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  localSettings.enabled
                    ? theme.colors.background
                    : theme.colors.textSecondary
                }
              />
            </View>

            {/* Otomatik Sonraki Görev */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 5,
                  }}
                >
                  Otomatik Sonraki Görev
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Pomodoro tamamlandığında sonraki görevi başlat
                </Text>
              </View>
              <Switch
                value={localSettings.autoStartNextTask}
                onValueChange={value =>
                  setLocalSettings({
                    ...localSettings,
                    autoStartNextTask: value,
                  })
                }
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  localSettings.autoStartNextTask
                    ? theme.colors.background
                    : theme.colors.textSecondary
                }
              />
            </View>

            {/* Otomatik Mola */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 5,
                  }}
                >
                  Otomatik Mola
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Belirli sayıda pomodoro sonrası otomatik mola
                </Text>
              </View>
              <Switch
                value={localSettings.autoStartBreak}
                onValueChange={value =>
                  setLocalSettings({
                    ...localSettings,
                    autoStartBreak: value,
                  })
                }
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  localSettings.autoStartBreak
                    ? theme.colors.background
                    : theme.colors.textSecondary
                }
              />
            </View>
          </Card>

          {/* Akıllı Seçim Ayarları */}
          <Card style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 15,
              }}
            >
              Akıllı Seçim Ayarları
            </Text>

            {/* Öncelik Bazlı Seçim */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 5,
                  }}
                >
                  Öncelik Bazlı Seçim
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Yüksek öncelikli görevleri öncele
                </Text>
              </View>
              <Switch
                value={localSettings.priorityBased}
                onValueChange={value =>
                  setLocalSettings({
                    ...localSettings,
                    priorityBased: value,
                  })
                }
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  localSettings.priorityBased
                    ? theme.colors.background
                    : theme.colors.textSecondary
                }
              />
            </View>

            {/* Enerji Bazlı Seçim */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 5,
                  }}
                >
                  Enerji Bazlı Seçim
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Enerji seviyesine göre görev seçimi
                </Text>
              </View>
              <Switch
                value={localSettings.energyBased}
                onValueChange={value =>
                  setLocalSettings({
                    ...localSettings,
                    energyBased: value,
                  })
                }
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  localSettings.energyBased
                    ? theme.colors.background
                    : theme.colors.textSecondary
                }
              />
            </View>
          </Card>

          {/* Maksimum Ardışık Pomodoro */}
          <Card style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 15,
              }}
            >
              Maksimum Ardışık Pomodoro
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginBottom: 10,
              }}
            >
              Bu sayıdan sonra otomatik mola başlatılır
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setLocalSettings({
                    ...localSettings,
                    maxConsecutivePomodoros: Math.max(
                      1,
                      localSettings.maxConsecutivePomodoros - 1
                    ),
                  })
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.background, fontSize: 20 }}>
                  -
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: theme.colors.text,
                  marginHorizontal: 20,
                }}
              >
                {localSettings.maxConsecutivePomodoros}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setLocalSettings({
                    ...localSettings,
                    maxConsecutivePomodoros: Math.min(
                      10,
                      localSettings.maxConsecutivePomodoros + 1
                    ),
                  })
                }
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.background, fontSize: 20 }}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>

        {/* Footer Buttons */}
        <View
          style={{
            flexDirection: 'row',
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <Button
            title="Sıfırla"
            onPress={handleReset}
            variant="secondary"
            style={{ flex: 1, marginRight: 10 }}
          />
          <Button
            title="Kaydet"
            onPress={handleSave}
            style={{ flex: 1, marginLeft: 10 }}
          />
        </View>
      </View>
    </Modal>
  );
};
