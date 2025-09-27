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
  Image,
} from 'react-native';
import {
  useAvatarCustomization,
  AvatarItem,
  AvatarOutfit,
} from '../../hooks/useAvatarCustomization';

interface AvatarCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AvatarCustomizationModal: React.FC<
  AvatarCustomizationModalProps
> = ({ visible, onClose }) => {
  const {
    avatar,
    items,
    outfits,
    settings,
    loading,
    error,
    updateAvatarAppearance,
    purchaseItem,
    equipItem,
    unequipItem,
    createOutfit,
    applyOutfit,
    updateAvatarMood,
    updateAvatarAnimation,
    updateSettings,
    getAvatarInsights,
  } = useAvatarCustomization();

  const [activeTab, setActiveTab] = useState<
    'avatar' | 'items' | 'outfits' | 'shop' | 'settings'
  >('avatar');
  const [selectedItem, setSelectedItem] = useState<AvatarItem | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<AvatarOutfit | null>(
    null
  );
  const [customizationMode, setCustomizationMode] = useState<
    'appearance' | 'clothing' | 'expressions' | 'animations'
  >('appearance');

  useEffect(() => {
    if (visible) {
      // Initialize avatar if needed
    }
  }, [visible]);

  const handlePurchaseItem = async (itemId: string) => {
    try {
      const success = await purchaseItem(itemId);
      if (success) {
        Alert.alert('Başarılı', 'Eşya satın alındı!');
      } else {
        Alert.alert('Hata', 'Eşya satın alınamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleEquipItem = async (itemId: string) => {
    try {
      const success = await equipItem(itemId);
      if (success) {
        Alert.alert('Başarılı', 'Eşya giyildi!');
      } else {
        Alert.alert('Hata', 'Eşya giyilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUnequipItem = async (itemId: string) => {
    try {
      const success = await unequipItem(itemId);
      if (success) {
        Alert.alert('Başarılı', 'Eşya çıkarıldı!');
      } else {
        Alert.alert('Hata', 'Eşya çıkarılamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleApplyOutfit = async (outfitId: string) => {
    try {
      const success = await applyOutfit(outfitId);
      if (success) {
        Alert.alert('Başarılı', 'Kıyafet uygulandı!');
      } else {
        Alert.alert('Hata', 'Kıyafet uygulanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleCreateOutfit = async () => {
    try {
      const newOutfit = await createOutfit({
        name: 'Yeni Kıyafet',
        description: 'Özel olarak oluşturulan kıyafet',
        items: items.filter(item => item.equipped).map(item => item.id),
        theme: 'casual',
        season: 'all',
        occasion: 'work',
        colors: ['#FFFFFF', '#000000'],
        tags: ['custom', 'personal'],
      });

      if (newOutfit) {
        Alert.alert('Başarılı', 'Yeni kıyafet oluşturuldu!');
      } else {
        Alert.alert('Hata', 'Kıyafet oluşturulamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderItemCard = ({ item }: { item: AvatarItem }) => (
    <TouchableOpacity
      style={[
        styles.itemCard,
        item.purchased && styles.purchasedItem,
        item.equipped && styles.equippedItem,
        item.favorite && styles.favoriteItem,
      ]}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemPreview}>{item.preview}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>
            {item.category === 'hair' && '💇 Saç'}
            {item.category === 'eyes' && '👁️ Gözler'}
            {item.category === 'clothing' && '👕 Kıyafet'}
            {item.category === 'accessories' && '🎩 Aksesuar'}
            {item.category === 'expressions' && '😊 İfadeler'}
            {item.category === 'animations' && '🎬 Animasyonlar'}
            {item.category === 'backgrounds' && '🖼️ Arka Planlar'}
          </Text>
        </View>
        <View style={styles.itemStatus}>
          <Text style={styles.itemRarity}>
            {item.rarity === 'common' && '⚪ Yaygın'}
            {item.rarity === 'uncommon' && '🟢 Nadir'}
            {item.rarity === 'rare' && '🔵 Ender'}
            {item.rarity === 'epic' && '🟣 Epik'}
            {item.rarity === 'legendary' && '🟡 Efsanevi'}
          </Text>
          <Text style={styles.itemCost}>
            {item.currency === 'coins' && '💰'}
            {item.currency === 'gems' && '💎'}
            {item.currency === 'xp' && '⭐'}
            {item.cost}
          </Text>
        </View>
      </View>

      <Text style={styles.itemDescription}>{item.description}</Text>

      <View style={styles.itemStats}>
        <Text style={styles.statsLabel}>Özellikler:</Text>
        <View style={styles.statsList}>
          <Text style={styles.statItem}>😊 {item.stats.happiness}</Text>
          <Text style={styles.statItem}>💪 {item.stats.confidence}</Text>
          <Text style={styles.statItem}>🎨 {item.stats.creativity}</Text>
          <Text style={styles.statItem}>🎯 {item.stats.focus}</Text>
        </View>
      </View>

      {item.effects.xpBonus > 0 && (
        <View style={styles.itemEffects}>
          <Text style={styles.effectsLabel}>Bonuslar:</Text>
          <View style={styles.effectsList}>
            {item.effects.xpBonus > 0 && (
              <Text style={styles.effectItem}>
                ⭐ XP +{item.effects.xpBonus}%
              </Text>
            )}
            {item.effects.coinBonus > 0 && (
              <Text style={styles.effectItem}>
                💰 Para +{item.effects.coinBonus}%
              </Text>
            )}
            {item.effects.moodBonus > 0 && (
              <Text style={styles.effectItem}>
                😊 Ruh Hali +{item.effects.moodBonus}%
              </Text>
            )}
            {item.effects.productivityBonus > 0 && (
              <Text style={styles.effectItem}>
                📈 Verimlilik +{item.effects.productivityBonus}%
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.itemActions}>
        {!item.purchased ? (
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => handlePurchaseItem(item.id)}
          >
            <Text style={styles.purchaseButtonText}>Satın Al</Text>
          </TouchableOpacity>
        ) : !item.equipped ? (
          <TouchableOpacity
            style={styles.equipButton}
            onPress={() => handleEquipItem(item.id)}
          >
            <Text style={styles.equipButtonText}>Giy</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.unequipButton}
            onPress={() => handleUnequipItem(item.id)}
          >
            <Text style={styles.unequipButtonText}>Çıkar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderOutfitCard = ({ item }: { item: AvatarOutfit }) => (
    <TouchableOpacity
      style={[
        styles.outfitCard,
        item.theme === 'formal' && styles.formalOutfit,
        item.theme === 'casual' && styles.casualOutfit,
        item.theme === 'sporty' && styles.sportyOutfit,
        item.theme === 'creative' && styles.creativeOutfit,
      ]}
      onPress={() => setSelectedOutfit(item)}
    >
      <View style={styles.outfitHeader}>
        <Text style={styles.outfitName}>{item.name}</Text>
        <Text style={styles.outfitTheme}>
          {item.theme === 'casual' && '👕 Günlük'}
          {item.theme === 'formal' && '👔 Resmi'}
          {item.theme === 'sporty' && '🏃 Spor'}
          {item.theme === 'creative' && '🎨 Yaratıcı'}
          {item.theme === 'professional' && '💼 Profesyonel'}
          {item.theme === 'party' && '🎉 Parti'}
          {item.theme === 'seasonal' && '🌿 Mevsimsel'}
        </Text>
      </View>

      <Text style={styles.outfitDescription}>{item.description}</Text>

      <View style={styles.outfitStats}>
        <Text style={styles.statsLabel}>Özellikler:</Text>
        <View style={styles.statsList}>
          <Text style={styles.statItem}>😊 {item.stats.happiness}</Text>
          <Text style={styles.statItem}>💪 {item.stats.confidence}</Text>
          <Text style={styles.statItem}>🎨 {item.stats.creativity}</Text>
          <Text style={styles.statItem}>🎯 {item.stats.focus}</Text>
        </View>
      </View>

      {item.effects.xpBonus > 0 && (
        <View style={styles.outfitEffects}>
          <Text style={styles.effectsLabel}>Bonuslar:</Text>
          <View style={styles.effectsList}>
            {item.effects.xpBonus > 0 && (
              <Text style={styles.effectItem}>
                ⭐ XP +{item.effects.xpBonus}%
              </Text>
            )}
            {item.effects.coinBonus > 0 && (
              <Text style={styles.effectItem}>
                💰 Para +{item.effects.coinBonus}%
              </Text>
            )}
            {item.effects.moodBonus > 0 && (
              <Text style={styles.effectItem}>
                😊 Ruh Hali +{item.effects.moodBonus}%
              </Text>
            )}
            {item.effects.productivityBonus > 0 && (
              <Text style={styles.effectItem}>
                📈 Verimlilik +{item.effects.productivityBonus}%
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.outfitActions}>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => handleApplyOutfit(item.id)}
        >
          <Text style={styles.applyButtonText}>Uygula</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const insights = getAvatarInsights();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Avatar Kişiselleştirme</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'avatar' && styles.activeTab]}
            onPress={() => setActiveTab('avatar')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'avatar' && styles.activeTabText,
              ]}
            >
              Avatar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'items' && styles.activeTabText,
              ]}
            >
              Eşyalar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outfits' && styles.activeTab]}
            onPress={() => setActiveTab('outfits')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'outfits' && styles.activeTabText,
              ]}
            >
              Kıyafetler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shop' && styles.activeTab]}
            onPress={() => setActiveTab('shop')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'shop' && styles.activeTabText,
              ]}
            >
              Mağaza
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

          {activeTab === 'avatar' && (
            <View>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPreview}>
                  <Text style={styles.avatarEmoji}>👤</Text>
                  <Text style={styles.avatarName}>
                    {avatar?.name || 'Avatar'}
                  </Text>
                  <Text style={styles.avatarLevel}>
                    Seviye {avatar?.level || 1}
                  </Text>
                </View>

                <View style={styles.avatarStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {insights.avatarLevel}
                    </Text>
                    <Text style={styles.statLabel}>Seviye</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {insights.avatarExperience}
                    </Text>
                    <Text style={styles.statLabel}>Deneyim</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {insights.equippedItems}
                    </Text>
                    <Text style={styles.statLabel}>Giyili</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {insights.totalOutfits}
                    </Text>
                    <Text style={styles.statLabel}>Kıyafet</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Kişiselleştirme</Text>
              <View style={styles.customizationTabs}>
                <TouchableOpacity
                  style={[
                    styles.customizationTab,
                    customizationMode === 'appearance' &&
                      styles.activeCustomizationTab,
                  ]}
                  onPress={() => setCustomizationMode('appearance')}
                >
                  <Text
                    style={[
                      styles.customizationTabText,
                      customizationMode === 'appearance' &&
                        styles.activeCustomizationTabText,
                    ]}
                  >
                    Görünüm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.customizationTab,
                    customizationMode === 'clothing' &&
                      styles.activeCustomizationTab,
                  ]}
                  onPress={() => setCustomizationMode('clothing')}
                >
                  <Text
                    style={[
                      styles.customizationTabText,
                      customizationMode === 'clothing' &&
                        styles.activeCustomizationTabText,
                    ]}
                  >
                    Kıyafet
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.customizationTab,
                    customizationMode === 'expressions' &&
                      styles.activeCustomizationTab,
                  ]}
                  onPress={() => setCustomizationMode('expressions')}
                >
                  <Text
                    style={[
                      styles.customizationTabText,
                      customizationMode === 'expressions' &&
                        styles.activeCustomizationTabText,
                    ]}
                  >
                    İfadeler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.customizationTab,
                    customizationMode === 'animations' &&
                      styles.activeCustomizationTab,
                  ]}
                  onPress={() => setCustomizationMode('animations')}
                >
                  <Text
                    style={[
                      styles.customizationTabText,
                      customizationMode === 'animations' &&
                        styles.activeCustomizationTabText,
                    ]}
                  >
                    Animasyonlar
                  </Text>
                </TouchableOpacity>
              </View>

              {customizationMode === 'appearance' && (
                <View style={styles.customizationContent}>
                  <Text style={styles.customizationTitle}>
                    Görünüm Ayarları
                  </Text>
                  <View style={styles.customizationOptions}>
                    <View style={styles.optionGroup}>
                      <Text style={styles.optionLabel}>Cilt Tonu</Text>
                      <View style={styles.colorOptions}>
                        {[
                          '#FDBCB4',
                          '#F4C2A1',
                          '#E8A87C',
                          '#D08B5B',
                          '#B87333',
                        ].map((color, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                            ]}
                            onPress={() =>
                              updateAvatarAppearance({ skinTone: color })
                            }
                          />
                        ))}
                      </View>
                    </View>
                    <View style={styles.optionGroup}>
                      <Text style={styles.optionLabel}>Saç Rengi</Text>
                      <View style={styles.colorOptions}>
                        {[
                          '#8B4513',
                          '#A0522D',
                          '#D2691E',
                          '#CD853F',
                          '#DEB887',
                        ].map((color, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.colorOption,
                              { backgroundColor: color },
                            ]}
                            onPress={() =>
                              updateAvatarAppearance({ hairColor: color })
                            }
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {customizationMode === 'expressions' && (
                <View style={styles.customizationContent}>
                  <Text style={styles.customizationTitle}>İfadeler</Text>
                  <View style={styles.expressionGrid}>
                    {avatar?.expressions &&
                      Object.entries(avatar.expressions).map(([key, value]) => (
                        <TouchableOpacity
                          key={key}
                          style={styles.expressionButton}
                          onPress={() => updateAvatarMood(key)}
                        >
                          <Text style={styles.expressionEmoji}>{value}</Text>
                          <Text style={styles.expressionLabel}>
                            {key === 'happy' && 'Mutlu'}
                            {key === 'sad' && 'Üzgün'}
                            {key === 'angry' && 'Kızgın'}
                            {key === 'surprised' && 'Şaşkın'}
                            {key === 'focused' && 'Odaklanmış'}
                            {key === 'tired' && 'Yorgun'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}

              {customizationMode === 'animations' && (
                <View style={styles.customizationContent}>
                  <Text style={styles.customizationTitle}>Animasyonlar</Text>
                  <View style={styles.animationGrid}>
                    {avatar?.animations &&
                      Object.entries(avatar.animations).map(([key, value]) => (
                        <TouchableOpacity
                          key={key}
                          style={styles.animationButton}
                          onPress={() => updateAvatarAnimation(key)}
                        >
                          <Text style={styles.animationEmoji}>
                            {key === 'idle' && '🧍'}
                            {key === 'walking' && '🚶'}
                            {key === 'running' && '🏃'}
                            {key === 'working' && '💻'}
                            {key === 'celebrating' && '🎉'}
                            {key === 'thinking' && '🤔'}
                          </Text>
                          <Text style={styles.animationLabel}>
                            {key === 'idle' && 'Bekleme'}
                            {key === 'walking' && 'Yürüme'}
                            {key === 'running' && 'Koşma'}
                            {key === 'working' && 'Çalışma'}
                            {key === 'celebrating' && 'Kutlama'}
                            {key === 'thinking' && 'Düşünme'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {activeTab === 'items' && (
            <View>
              <Text style={styles.sectionTitle}>Eşyalarım</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Eşyalar yükleniyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={items}
                  renderItem={renderItemCard}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'outfits' && (
            <View>
              <View style={styles.outfitHeader}>
                <Text style={styles.sectionTitle}>Kıyafetlerim</Text>
                <TouchableOpacity
                  style={styles.createOutfitButton}
                  onPress={handleCreateOutfit}
                >
                  <Text style={styles.createOutfitButtonText}>
                    + Yeni Kıyafet
                  </Text>
                </TouchableOpacity>
              </View>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>
                    Kıyafetler yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={outfits}
                  renderItem={renderOutfitCard}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'shop' && (
            <View>
              <Text style={styles.sectionTitle}>Avatar Mağazası</Text>
              <View style={styles.shopInfo}>
                <Text style={styles.shopBalance}>💰 Para: 1000</Text>
                <Text style={styles.shopBalance}>💎 Gems: 50</Text>
                <Text style={styles.shopBalance}>
                  ⭐ XP: {insights.avatarExperience}
                </Text>
              </View>
              <FlatList
                data={items}
                renderItem={renderItemCard}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Avatar Ayarları</Text>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Avatar Animasyonları</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.avatarAnimations && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        avatarAnimations: !settings.avatarAnimations,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.avatarAnimations &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.avatarAnimations ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Avatar İfadeleri</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.avatarExpressions && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        avatarExpressions: !settings.avatarExpressions,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.avatarExpressions &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.avatarExpressions ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Ruh Hali Takibi</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.avatarMoodTracking && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        avatarMoodTracking: !settings.avatarMoodTracking,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.avatarMoodTracking &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.avatarMoodTracking ? 'Açık' : 'Kapalı'}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginVertical: 16,
  },
  avatarContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  avatarLevel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  avatarStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  customizationTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  customizationTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeCustomizationTab: {
    borderBottomColor: '#4CAF50',
  },
  customizationTabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeCustomizationTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  customizationContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  customizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  customizationOptions: {
    gap: 16,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  expressionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  expressionButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  expressionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  expressionLabel: {
    fontSize: 12,
    color: '#666666',
  },
  animationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  animationButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  animationEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  animationLabel: {
    fontSize: 12,
    color: '#666666',
  },
  list: {
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  purchasedItem: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  equippedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  favoriteItem: {
    borderColor: '#FF9800',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPreview: {
    fontSize: 32,
    marginRight: 12,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 14,
    color: '#666666',
  },
  itemStatus: {
    alignItems: 'flex-end',
  },
  itemRarity: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  itemCost: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  itemStats: {
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  statsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemEffects: {
    marginBottom: 8,
  },
  effectsLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  effectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  effectItem: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemActions: {
    alignItems: 'center',
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  equipButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  equipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  unequipButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  unequipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  outfitCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formalOutfit: {
    borderColor: '#9C27B0',
  },
  casualOutfit: {
    borderColor: '#4CAF50',
  },
  sportyOutfit: {
    borderColor: '#FF9800',
  },
  creativeOutfit: {
    borderColor: '#E91E63',
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  outfitTheme: {
    fontSize: 12,
    color: '#666666',
  },
  outfitDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  outfitStats: {
    marginBottom: 8,
  },
  outfitEffects: {
    marginBottom: 8,
  },
  outfitActions: {
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createOutfitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  createOutfitButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  shopInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shopBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
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
