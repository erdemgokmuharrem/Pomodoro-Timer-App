import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  useAccessibility,
  AccessibilitySettings,
} from '../../hooks/useAccessibility';
import Card from '../atoms/Card';

interface AccessibilityModalProps {
  visible: boolean;
  onClose: () => void;
}

const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    accessibilitySettings,
    updateFontSize,
    updateColorScheme,
    getHighContrastColors,
  } = useAccessibility();

  const highContrastColors = getHighContrastColors();

  const SettingItem = ({
    title,
    subtitle,
    value,
    onValueChange,
    type = 'switch',
  }: {
    title: string;
    subtitle: string;
    value: boolean | string;
    onValueChange: (value: any) => void;
    type?: 'switch' | 'select';
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text
          style={[
            styles.settingTitle,
            highContrastColors && { color: highContrastColors.text },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.settingSubtitle,
            highContrastColors && { color: highContrastColors.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange}
          accessibilityLabel={title}
          accessibilityHint={subtitle}
        />
      ) : (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            /* Handle selection */
          }}
          accessibilityLabel={`${title}: ${value}`}
          accessibilityHint="Seçenekleri görmek için dokunun"
        >
          <Text
            style={[
              styles.selectText,
              highContrastColors && { color: highContrastColors.text },
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const FontSizeOption = ({
    size,
    label,
  }: {
    size: AccessibilitySettings['fontSize'];
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.fontSizeOption,
        accessibilitySettings.fontSize === size && styles.fontSizeOptionActive,
        highContrastColors && { borderColor: highContrastColors.border },
      ]}
      onPress={() => updateFontSize(size)}
      accessibilityLabel={`Font boyutu: ${label}`}
      accessibilityRole="button"
    >
      <Text
        style={[
          styles.fontSizeText,
          accessibilitySettings.fontSize === size && styles.fontSizeTextActive,
          highContrastColors && { color: highContrastColors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View
        style={[
          styles.container,
          highContrastColors && {
            backgroundColor: highContrastColors.background,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            highContrastColors && {
              borderBottomColor: highContrastColors.border,
            },
          ]}
        >
          <TouchableOpacity onPress={onClose}>
            <Text
              style={[
                styles.cancelButton,
                highContrastColors && { color: highContrastColors.text },
              ]}
            >
              İptal
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.title,
              highContrastColors && { color: highContrastColors.text },
            ]}
          >
            Erişilebilirlik
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <Card
            style={[
              styles.section,
              highContrastColors ? {
                backgroundColor: highContrastColors.surface,
              } : null,
            ].filter(Boolean)}
          >
            <Text
              style={[
                styles.sectionTitle,
                highContrastColors && { color: highContrastColors.text },
              ]}
            >
              Görsel Ayarlar
            </Text>

            <View style={styles.fontSizeContainer}>
              <Text
                style={[
                  styles.fontSizeLabel,
                  highContrastColors && { color: highContrastColors.text },
                ]}
              >
                Font Boyutu
              </Text>
              <View style={styles.fontSizeOptions}>
                <FontSizeOption size="small" label="Küçük" />
                <FontSizeOption size="medium" label="Orta" />
                <FontSizeOption size="large" label="Büyük" />
                <FontSizeOption size="extra-large" label="Çok Büyük" />
              </View>
            </View>
          </Card>

          <Card
            style={[
              styles.section,
              highContrastColors ? {
                backgroundColor: highContrastColors.surface,
              } : null,
            ].filter(Boolean)}
          >
            <Text
              style={[
                styles.sectionTitle,
                highContrastColors && { color: highContrastColors.text },
              ]}
            >
              Sistem Ayarları
            </Text>

            <SettingItem
              title="Yüksek Kontrast"
              subtitle="Daha belirgin renkler kullan"
              value={accessibilitySettings.isHighContrastEnabled}
              onValueChange={() => {
                /* This is read-only from system */
              }}
            />

            <SettingItem
              title="Ekran Okuyucu"
              subtitle="VoiceOver/TalkBack desteği"
              value={accessibilitySettings.isScreenReaderEnabled}
              onValueChange={() => {
                /* This is read-only from system */
              }}
            />

            <SettingItem
              title="Hareket Azaltma"
              subtitle="Animasyonları azalt"
              value={accessibilitySettings.isReduceMotionEnabled}
              onValueChange={() => {
                /* This is read-only from system */
              }}
            />
          </Card>

          <Card
            style={[
              styles.infoCard,
              highContrastColors ? {
                backgroundColor: highContrastColors.surface,
              } : null,
            ].filter(Boolean)}
          >
            <Text
              style={[
                styles.infoTitle,
                highContrastColors && { color: highContrastColors.text },
              ]}
            >
              💡 Erişilebilirlik İpuçları
            </Text>
            <Text
              style={[
                styles.infoText,
                highContrastColors && {
                  color: highContrastColors.textSecondary,
                },
              ]}
            >
              • Ekran okuyucu kullanıyorsanız, tüm öğeler için açıklayıcı
              etiketler eklenmiştir
              {'\n'}• Yüksek kontrast modu otomatik olarak algılanır
              {'\n'}• Timer sesli geri bildirim sağlar
              {'\n'}• Tüm butonlar dokunma alanı standartlarına uygundur
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
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  selectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
  },
  selectText: {
    fontSize: 14,
    color: '#1E293B',
  },
  fontSizeContainer: {
    marginBottom: 8,
  },
  fontSizeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 12,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  fontSizeOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  fontSizeTextActive: {
    color: 'white',
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

export default AccessibilityModal;
