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
import {
  useVirtualGarden,
  Plant,
  Garden,
  Decoration,
  GardenEvent,
} from '../../hooks/useVirtualGarden';

interface VirtualGardenModalProps {
  visible: boolean;
  onClose: () => void;
}

export const VirtualGardenModal: React.FC<VirtualGardenModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    plants,
    gardens,
    decorations,
    events,
    settings,
    loading,
    error,
    waterPlant,
    fertilizePlant,
    harvestPlant,
    plantSeed,
    createGardenEvent,
    completeGardenEvent,
    purchaseDecoration,
    placeDecoration,
    updateGardenWeather,
    updateGardenTime,
    updateSettings,
    getGardenInsights,
  } = useVirtualGarden();

  const [activeTab, setActiveTab] = useState<
    'garden' | 'plants' | 'decorations' | 'events' | 'shop' | 'settings'
  >('garden');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedDecoration, setSelectedDecoration] =
    useState<Decoration | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GardenEvent | null>(null);

  useEffect(() => {
    if (visible) {
      // Initialize garden if needed
    }
  }, [visible]);

  const handleWaterPlant = async (plantId: string) => {
    try {
      const success = await waterPlant(plantId);
      if (success) {
        Alert.alert('Başarılı', 'Bitki sulandı!');
      } else {
        Alert.alert('Hata', 'Bitki sulanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleFertilizePlant = async (plantId: string) => {
    try {
      const success = await fertilizePlant(plantId);
      if (success) {
        Alert.alert('Başarılı', 'Bitki gübrelendi!');
      } else {
        Alert.alert('Hata', 'Bitki gübrelenemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleHarvestPlant = async (plantId: string) => {
    try {
      const success = await harvestPlant(plantId);
      if (success) {
        Alert.alert('Tebrikler!', 'Bitki hasat edildi ve ödüller kazanıldı!');
      } else {
        Alert.alert('Hata', 'Bitki hasat edilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handlePlantSeed = async (seedType: string) => {
    try {
      const newPlant = await plantSeed(seedType, {
        x: Math.random() * 400,
        y: Math.random() * 300,
      });
      if (newPlant) {
        Alert.alert('Başarılı', 'Yeni tohum ekildi!');
      } else {
        Alert.alert('Hata', 'Tohum ekilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handlePurchaseDecoration = async (decorationId: string) => {
    try {
      const success = await purchaseDecoration(decorationId);
      if (success) {
        Alert.alert('Başarılı', 'Dekorasyon satın alındı!');
      } else {
        Alert.alert('Hata', 'Dekorasyon satın alınamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    try {
      const success = await completeGardenEvent(eventId);
      if (success) {
        Alert.alert('Başarılı', 'Etkinlik tamamlandı!');
      } else {
        Alert.alert('Hata', 'Etkinlik tamamlanamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity
      style={[
        styles.plantItem,
        item.health > 80 && styles.healthyPlant,
        item.health < 30 && styles.unhealthyPlant,
        item.stage === 'blooming' && styles.bloomingPlant,
      ]}
      onPress={() => setSelectedPlant(item)}
    >
      <View style={styles.plantHeader}>
        <Text style={styles.plantEmoji}>{item.emoji}</Text>
        <View style={styles.plantMeta}>
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantSpecies}>{item.species}</Text>
        </View>
        <View style={styles.plantStatus}>
          <Text style={styles.plantStage}>
            {item.stage === 'seed' && '🌱 Tohum'}
            {item.stage === 'sprout' && '🌿 Filiz'}
            {item.stage === 'young' && '🌱 Genç'}
            {item.stage === 'mature' && '🌳 Olgun'}
            {item.stage === 'blooming' && '🌸 Çiçekli'}
            {item.stage === 'fruiting' && '🍎 Meyveli'}
            {item.stage === 'ancient' && '🌲 Antik'}
          </Text>
          <Text style={styles.plantLevel}>Seviye {item.level}</Text>
        </View>
      </View>

      <Text style={styles.plantDescription}>{item.description}</Text>

      <View style={styles.plantStats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statValue}>{item.health}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>😊</Text>
          <Text style={styles.statValue}>{item.happiness}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💧</Text>
          <Text style={styles.statValue}>{item.waterLevel}%</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>☀️</Text>
          <Text style={styles.statValue}>{item.sunlightLevel}%</Text>
        </View>
      </View>

      <View style={styles.plantProgress}>
        <Text style={styles.progressLabel}>
          Deneyim: {item.experience}/{item.maxExperience}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(item.experience / item.maxExperience) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.plantActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleWaterPlant(item.id)}
        >
          <Text style={styles.actionButtonText}>💧 Sula</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleFertilizePlant(item.id)}
        >
          <Text style={styles.actionButtonText}>🌱 Gübrele</Text>
        </TouchableOpacity>
        {item.stage === 'fruiting' && (
          <TouchableOpacity
            style={styles.harvestButton}
            onPress={() => handleHarvestPlant(item.id)}
          >
            <Text style={styles.harvestButtonText}>🍎 Hasat Et</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDecorationItem = ({ item }: { item: Decoration }) => (
    <TouchableOpacity
      style={[
        styles.decorationItem,
        item.purchased && styles.purchasedDecoration,
        item.placed && styles.placedDecoration,
      ]}
      onPress={() => setSelectedDecoration(item)}
    >
      <View style={styles.decorationHeader}>
        <Text style={styles.decorationEmoji}>{item.emoji}</Text>
        <View style={styles.decorationMeta}>
          <Text style={styles.decorationName}>{item.name}</Text>
          <Text style={styles.decorationType}>
            {item.type === 'fountain' && '⛲ Çeşme'}
            {item.type === 'statue' && '🗿 Heykel'}
            {item.type === 'bench' && '🪑 Bank'}
            {item.type === 'path' && '🛤️ Yol'}
            {item.type === 'fence' && '🚧 Çit'}
            {item.type === 'light' && '💡 Işık'}
            {item.type === 'pond' && '🏞️ Gölet'}
            {item.type === 'rock' && '🪨 Kaya'}
            {item.type === 'bridge' && '🌉 Köprü'}
            {item.type === 'gazebo' && '🏛️ Gazebo'}
          </Text>
        </View>
        <View style={styles.decorationStatus}>
          <Text style={styles.decorationRarity}>
            {item.rarity === 'common' && '⚪ Yaygın'}
            {item.rarity === 'uncommon' && '🟢 Nadir'}
            {item.rarity === 'rare' && '🔵 Ender'}
            {item.rarity === 'epic' && '🟣 Epik'}
            {item.rarity === 'legendary' && '🟡 Efsanevi'}
          </Text>
          <Text style={styles.decorationCost}>💰 {item.cost}</Text>
        </View>
      </View>

      <Text style={styles.decorationDescription}>{item.description}</Text>

      <View style={styles.decorationEffects}>
        <Text style={styles.effectsLabel}>Etkiler:</Text>
        <View style={styles.effectsList}>
          {item.effects.happinessBonus > 0 && (
            <Text style={styles.effectItem}>
              😊 Mutluluk +{item.effects.happinessBonus}
            </Text>
          )}
          {item.effects.growthBonus > 0 && (
            <Text style={styles.effectItem}>
              🌱 Büyüme +{item.effects.growthBonus}
            </Text>
          )}
          {item.effects.coinBonus > 0 && (
            <Text style={styles.effectItem}>
              💰 Para +{item.effects.coinBonus}
            </Text>
          )}
          {item.effects.xpBonus > 0 && (
            <Text style={styles.effectItem}>⭐ XP +{item.effects.xpBonus}</Text>
          )}
        </View>
      </View>

      <View style={styles.decorationActions}>
        {!item.purchased ? (
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => handlePurchaseDecoration(item.id)}
          >
            <Text style={styles.purchaseButtonText}>Satın Al</Text>
          </TouchableOpacity>
        ) : !item.placed ? (
          <TouchableOpacity
            style={styles.placeButton}
            onPress={() => placeDecoration(item.id, { x: 100, y: 100 })}
          >
            <Text style={styles.placeButtonText}>Yerleştir</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.placedText}>✅ Yerleştirildi</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: GardenEvent }) => (
    <TouchableOpacity
      style={[
        styles.eventItem,
        item.completed && styles.completedEvent,
        item.priority === 'high' && styles.highPriorityEvent,
        item.priority === 'urgent' && styles.urgentEvent,
      ]}
      onPress={() => setSelectedEvent(item)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTypeIcon}>
          {item.type === 'growth' && '🌱'}
          {item.type === 'bloom' && '🌸'}
          {item.type === 'harvest' && '🍎'}
          {item.type === 'visitor' && '👥'}
          {item.type === 'weather' && '🌤️'}
          {item.type === 'pest' && '🐛'}
          {item.type === 'celebration' && '🎉'}
          {item.type === 'discovery' && '🔍'}
        </Text>
        <View style={styles.eventMeta}>
          <Text style={styles.eventType}>
            {item.type === 'growth' && 'Büyüme'}
            {item.type === 'bloom' && 'Çiçeklenme'}
            {item.type === 'harvest' && 'Hasat'}
            {item.type === 'visitor' && 'Ziyaretçi'}
            {item.type === 'weather' && 'Hava Durumu'}
            {item.type === 'pest' && 'Zararlı'}
            {item.type === 'celebration' && 'Kutlama'}
            {item.type === 'discovery' && 'Keşif'}
          </Text>
          <Text style={styles.eventPriority}>
            {item.priority === 'low' && '🟢 Düşük'}
            {item.priority === 'medium' && '🟡 Orta'}
            {item.priority === 'high' && '🟠 Yüksek'}
            {item.priority === 'urgent' && '🔴 Acil'}
          </Text>
        </View>
      </View>

      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDescription}>{item.description}</Text>

      {item.rewards && (
        <View style={styles.eventRewards}>
          <Text style={styles.rewardsLabel}>Ödüller:</Text>
          <View style={styles.rewardsList}>
            {item.rewards.xp > 0 && (
              <Text style={styles.rewardItem}>⭐ {item.rewards.xp} XP</Text>
            )}
            {item.rewards.coins > 0 && (
              <Text style={styles.rewardItem}>
                💰 {item.rewards.coins} Para
              </Text>
            )}
            {item.rewards.items?.map((item, index) => (
              <Text key={index} style={styles.rewardItem}>
                🎁 {item}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.eventFooter}>
        <Text style={styles.eventTime}>{item.duration} dakika</Text>
        <Text style={styles.eventStatus}>
          {item.completed ? '✅ Tamamlandı' : '⏳ Devam Ediyor'}
        </Text>
      </View>

      {!item.completed && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => handleCompleteEvent(item.id)}
        >
          <Text style={styles.completeButtonText}>Tamamla</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const insights = getGardenInsights();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sanal Bahçe</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'garden' && styles.activeTab]}
            onPress={() => setActiveTab('garden')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'garden' && styles.activeTabText,
              ]}
            >
              Bahçe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'plants' && styles.activeTab]}
            onPress={() => setActiveTab('plants')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'plants' && styles.activeTabText,
              ]}
            >
              Bitkiler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'decorations' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('decorations')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'decorations' && styles.activeTabText,
              ]}
            >
              Dekorasyon
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.activeTab]}
            onPress={() => setActiveTab('events')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'events' && styles.activeTabText,
              ]}
            >
              Etkinlikler
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

          {activeTab === 'garden' && (
            <View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.totalPlants}</Text>
                  <Text style={styles.statLabel}>Toplam Bitki</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {insights.healthyPlants}
                  </Text>
                  <Text style={styles.statLabel}>Sağlıklı</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {insights.bloomingPlants}
                  </Text>
                  <Text style={styles.statLabel}>Çiçekli</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.totalCoins}</Text>
                  <Text style={styles.statLabel}>Para</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Bahçe Durumu</Text>
              {gardens.length > 0 && (
                <View style={styles.gardenInfo}>
                  <Text style={styles.gardenName}>{gardens[0].name}</Text>
                  <Text style={styles.gardenTheme}>
                    {gardens[0].theme === 'forest' && '🌲 Orman Teması'}
                    {gardens[0].theme === 'desert' && '🏜️ Çöl Teması'}
                    {gardens[0].theme === 'tropical' && '🌴 Tropikal Teması'}
                    {gardens[0].theme === 'arctic' && '❄️ Arktik Teması'}
                    {gardens[0].theme === 'mystical' && '🔮 Mistik Teması'}
                    {gardens[0].theme === 'urban' && '🏙️ Şehir Teması'}
                    {gardens[0].theme === 'zen' && '🧘 Zen Teması'}
                    {gardens[0].theme === 'fairy' && '🧚‍♀️ Peri Teması'}
                  </Text>
                  <Text style={styles.gardenWeather}>
                    {gardens[0].weather === 'sunny' && '☀️ Güneşli'}
                    {gardens[0].weather === 'cloudy' && '☁️ Bulutlu'}
                    {gardens[0].weather === 'rainy' && '🌧️ Yağmurlu'}
                    {gardens[0].weather === 'snowy' && '❄️ Karlı'}
                    {gardens[0].weather === 'stormy' && '⛈️ Fırtınalı'}
                    {gardens[0].weather === 'foggy' && '🌫️ Sisli'}
                    {gardens[0].weather === 'windy' && '💨 Rüzgarlı'}
                  </Text>
                </View>
              )}

              <View style={styles.gardenActions}>
                <TouchableOpacity
                  style={styles.gardenActionButton}
                  onPress={() => handlePlantSeed('Sunflower')}
                >
                  <Text style={styles.gardenActionButtonText}>
                    🌱 Tohum Ekle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.gardenActionButton}
                  onPress={() => updateGardenWeather('rainy')}
                >
                  <Text style={styles.gardenActionButtonText}>🌧️ Yağmur</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.gardenActionButton}
                  onPress={() => updateGardenTime('evening')}
                >
                  <Text style={styles.gardenActionButtonText}>🌅 Akşam</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'plants' && (
            <View>
              <Text style={styles.sectionTitle}>Bitkilerim</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Bitkiler yükleniyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={plants}
                  renderItem={renderPlantItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'decorations' && (
            <View>
              <Text style={styles.sectionTitle}>Dekorasyonlarım</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>
                    Dekorasyonlar yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={decorations}
                  renderItem={renderDecorationItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'events' && (
            <View>
              <Text style={styles.sectionTitle}>Bahçe Etkinlikleri</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>
                    Etkinlikler yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={events}
                  renderItem={renderEventItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'shop' && (
            <View>
              <Text style={styles.sectionTitle}>Bahçe Mağazası</Text>
              <View style={styles.shopInfo}>
                <Text style={styles.shopBalance}>
                  💰 Para: {insights.totalCoins}
                </Text>
                <Text style={styles.shopBalance}>
                  💎 Gems: {insights.totalGems}
                </Text>
              </View>
              <FlatList
                data={decorations}
                renderItem={renderDecorationItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Bahçe Ayarları</Text>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Otomatik Sulama</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.autoWatering && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        autoWatering: !settings.autoWatering,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.autoWatering && styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.autoWatering ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Hava Efektleri</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.weatherEffects && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        weatherEffects: !settings.weatherEffects,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.weatherEffects &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.weatherEffects ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Ses Efektleri</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.soundEffects && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        soundEffects: !settings.soundEffects,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.soundEffects && styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.soundEffects ? 'Açık' : 'Kapalı'}
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
  plantItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  healthyPlant: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  unhealthyPlant: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
  },
  bloomingPlant: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  plantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plantEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  plantMeta: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666666',
  },
  plantStatus: {
    alignItems: 'flex-end',
  },
  plantStage: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  plantLevel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  plantDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  plantStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statValue: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  plantProgress: {
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  plantActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
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
  harvestButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    flex: 1,
  },
  harvestButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  decorationItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  purchasedDecoration: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  placedDecoration: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  decorationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  decorationEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  decorationMeta: {
    flex: 1,
  },
  decorationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  decorationType: {
    fontSize: 14,
    color: '#666666',
  },
  decorationStatus: {
    alignItems: 'flex-end',
  },
  decorationRarity: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  decorationCost: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  decorationDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  decorationEffects: {
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
  decorationActions: {
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
  placeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  placeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  placedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  eventItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedEvent: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  highPriorityEvent: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  urgentEvent: {
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventMeta: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  eventPriority: {
    fontSize: 12,
    color: '#666666',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventRewards: {
    marginBottom: 8,
  },
  rewardsLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rewardItem: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 12,
    color: '#666666',
  },
  eventStatus: {
    fontSize: 12,
    color: '#666666',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  gardenInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  gardenName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  gardenTheme: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  gardenWeather: {
    fontSize: 14,
    color: '#666666',
  },
  gardenActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gardenActionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  gardenActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    fontSize: 16,
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
