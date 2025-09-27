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
  useArtisticCollections,
  ArtisticItem,
  Collection,
  ArtChallenge,
  ArtTutorial,
} from '../../hooks/useArtisticCollections';

interface ArtisticCollectionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ArtisticCollectionsModal: React.FC<
  ArtisticCollectionsModalProps
> = ({ visible, onClose }) => {
  const {
    artisticItems,
    collections,
    challenges,
    tutorials,
    settings,
    loading,
    error,
    createArtisticItem,
    updateArtisticItem,
    createCollection,
    addItemToCollection,
    removeItemFromCollection,
    joinChallenge,
    submitToChallenge,
    generateNewContent,
    updateSettings,
    getArtisticInsights,
  } = useArtisticCollections();

  const [activeTab, setActiveTab] = useState<
    | 'gallery'
    | 'collections'
    | 'challenges'
    | 'tutorials'
    | 'create'
    | 'settings'
  >('gallery');
  const [selectedItem, setSelectedItem] = useState<ArtisticItem | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [selectedChallenge, setSelectedChallenge] =
    useState<ArtChallenge | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<ArtTutorial | null>(
    null
  );

  useEffect(() => {
    if (visible) {
      generateNewContent();
    }
  }, [visible, generateNewContent]);

  const handleCreateArtisticItem = async () => {
    try {
      const newItem = await createArtisticItem({
        title: 'Yeni Sanat Eseri',
        description: 'Yaratıcılığınızı serbest bırakın!',
        type: 'drawing',
        category: 'abstract',
        style: 'modern',
        colors: ['#000000'],
        tags: ['yeni', 'yaratıcılık'],
      });

      if (newItem) {
        Alert.alert('Başarılı', 'Yeni sanat eseri oluşturuldu!');
      }
    } catch (err) {
      Alert.alert('Hata', 'Sanat eseri oluşturulamadı');
    }
  };

  const handleCreateCollection = async () => {
    try {
      const newCollection = await createCollection({
        title: 'Yeni Koleksiyon',
        description: 'Sanat eserlerinizi organize edin',
        theme: 'mixed',
        style: 'modern',
        tags: ['yeni', 'koleksiyon'],
      });

      if (newCollection) {
        Alert.alert('Başarılı', 'Yeni koleksiyon oluşturuldu!');
      }
    } catch (err) {
      Alert.alert('Hata', 'Koleksiyon oluşturulamadı');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const success = await joinChallenge(challengeId);
      if (success) {
        Alert.alert('Başarılı', 'Yarışmaya katıldınız!');
      } else {
        Alert.alert('Hata', 'Yarışmaya katılamadınız');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderArtisticItem = ({ item }: { item: ArtisticItem }) => (
    <TouchableOpacity
      style={[
        styles.artisticItem,
        item.status === 'completed' && styles.completedItem,
        item.status === 'published' && styles.publishedItem,
      ]}
      onPress={() => setSelectedItem(item)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTypeIcon}>
          {item.type === 'drawing' && '✏️'}
          {item.type === 'painting' && '🎨'}
          {item.type === 'sketch' && '📝'}
          {item.type === 'digital_art' && '💻'}
          {item.type === 'calligraphy' && '✍️'}
          {item.type === 'doodle' && '🖍️'}
          {item.type === 'mandala' && '🌀'}
          {item.type === 'pattern' && '🔷'}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemCategory}>
            {item.category === 'nature' && '🌿 Doğa'}
            {item.category === 'abstract' && '🎭 Soyut'}
            {item.category === 'portrait' && '👤 Portre'}
            {item.category === 'landscape' && '🏞️ Manzara'}
            {item.category === 'geometric' && '📐 Geometrik'}
            {item.category === 'minimalist' && '⚪ Minimalist'}
            {item.category === 'fantasy' && '🧙‍♀️ Fantastik'}
            {item.category === 'realistic' && '👁️ Gerçekçi'}
          </Text>
          <Text style={styles.itemStatus}>
            {item.status === 'draft' && '📝 Taslak'}
            {item.status === 'in_progress' && '⏳ Devam Ediyor'}
            {item.status === 'completed' && '✅ Tamamlandı'}
            {item.status === 'published' && '🌐 Yayınlandı'}
            {item.status === 'archived' && '📦 Arşivlendi'}
          </Text>
        </View>
      </View>

      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.itemColors}>
        <Text style={styles.colorsLabel}>Renkler:</Text>
        <View style={styles.colorPalette}>
          {item.colors.map((color, index) => (
            <View
              key={index}
              style={[styles.colorSwatch, { backgroundColor: color }]}
            />
          ))}
        </View>
      </View>

      <View style={styles.itemStats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statValue}>{item.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👁️</Text>
          <Text style={styles.statValue}>{item.views}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📤</Text>
          <Text style={styles.statValue}>{item.shares}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statValue}>{item.metadata.timeSpent}m</Text>
        </View>
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.itemDifficulty}>
          {item.metadata.difficulty === 'easy' && '🟢 Kolay'}
          {item.metadata.difficulty === 'medium' && '🟡 Orta'}
          {item.metadata.difficulty === 'hard' && '🟠 Zor'}
          {item.metadata.difficulty === 'expert' && '🔴 Uzman'}
        </Text>
        <Text style={styles.itemDate}>
          {item.createdAt.toLocaleDateString('tr-TR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCollectionItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.collectionItem}
      onPress={() => setSelectedCollection(item)}
    >
      <View style={styles.collectionHeader}>
        <Text style={styles.collectionTitle}>{item.title}</Text>
        <Text style={styles.collectionStatus}>
          {item.status === 'draft' && '📝 Taslak'}
          {item.status === 'published' && '🌐 Yayınlandı'}
          {item.status === 'archived' && '📦 Arşivlendi'}
        </Text>
      </View>

      <Text style={styles.collectionDescription}>{item.description}</Text>

      <View style={styles.collectionStats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🖼️</Text>
          <Text style={styles.statValue}>{item.items.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statValue}>{item.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👁️</Text>
          <Text style={styles.statValue}>{item.views}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{item.followers}</Text>
        </View>
      </View>

      <View style={styles.collectionFooter}>
        <Text style={styles.collectionTheme}>
          {item.theme === 'nature' && '🌿 Doğa'}
          {item.theme === 'abstract' && '🎭 Soyut'}
          {item.theme === 'portrait' && '👤 Portre'}
          {item.theme === 'landscape' && '🏞️ Manzara'}
          {item.theme === 'geometric' && '📐 Geometrik'}
          {item.theme === 'minimalist' && '⚪ Minimalist'}
          {item.theme === 'fantasy' && '🧙‍♀️ Fantastik'}
          {item.theme === 'mixed' && '🎨 Karışık'}
        </Text>
        <Text style={styles.collectionDate}>
          {item.createdAt.toLocaleDateString('tr-TR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderChallengeItem = ({ item }: { item: ArtChallenge }) => (
    <TouchableOpacity
      style={[
        styles.challengeItem,
        item.status === 'active' && styles.activeChallenge,
        item.status === 'completed' && styles.completedChallenge,
      ]}
      onPress={() => setSelectedChallenge(item)}
    >
      <View style={styles.challengeHeader}>
        <Text style={styles.challengeTypeIcon}>
          {item.type === 'daily' && '📅'}
          {item.type === 'weekly' && '📆'}
          {item.type === 'monthly' && '🗓️'}
          {item.type === 'special' && '⭐'}
          {item.type === 'community' && '👥'}
        </Text>
        <View style={styles.challengeMeta}>
          <Text style={styles.challengeType}>
            {item.type === 'daily' && 'Günlük'}
            {item.type === 'weekly' && 'Haftalık'}
            {item.type === 'monthly' && 'Aylık'}
            {item.type === 'special' && 'Özel'}
            {item.type === 'community' && 'Topluluk'}
          </Text>
          <Text style={styles.challengeDifficulty}>
            {item.difficulty === 'beginner' && '🟢 Başlangıç'}
            {item.difficulty === 'intermediate' && '🟡 Orta'}
            {item.difficulty === 'advanced' && '🟠 İleri'}
            {item.difficulty === 'expert' && '🔴 Uzman'}
          </Text>
        </View>
      </View>

      <Text style={styles.challengeTitle}>{item.title}</Text>
      <Text style={styles.challengeDescription}>{item.description}</Text>

      <View style={styles.challengeConstraints}>
        <Text style={styles.constraintsLabel}>Kısıtlamalar:</Text>
        {item.constraints.map((constraint, index) => (
          <Text key={index} style={styles.constraintItem}>
            • {constraint}
          </Text>
        ))}
      </View>

      <View style={styles.challengeRewards}>
        <Text style={styles.rewardsLabel}>Ödüller:</Text>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardIcon}>⭐</Text>
          <Text style={styles.rewardText}>{item.rewards.xp} XP</Text>
        </View>
        {item.rewards.badges.map((badge, index) => (
          <View key={index} style={styles.rewardItem}>
            <Text style={styles.rewardIcon}>🏆</Text>
            <Text style={styles.rewardText}>{badge}</Text>
          </View>
        ))}
      </View>

      <View style={styles.challengeStats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>👥</Text>
          <Text style={styles.statValue}>{item.participants}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>📤</Text>
          <Text style={styles.statValue}>{item.submissions}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏰</Text>
          <Text style={styles.statValue}>
            {Math.ceil(
              (item.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )}
            g
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinChallenge(item.id)}
      >
        <Text style={styles.joinButtonText}>Katıl</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTutorialItem = ({ item }: { item: ArtTutorial }) => (
    <TouchableOpacity
      style={styles.tutorialItem}
      onPress={() => setSelectedTutorial(item)}
    >
      <View style={styles.tutorialHeader}>
        <Text style={styles.tutorialCategoryIcon}>
          {item.category === 'drawing' && '✏️'}
          {item.category === 'painting' && '🎨'}
          {item.category === 'digital_art' && '💻'}
          {item.category === 'calligraphy' && '✍️'}
          {item.category === 'doodle' && '🖍️'}
          {item.category === 'mandala' && '🌀'}
          {item.category === 'pattern' && '🔷'}
        </Text>
        <View style={styles.tutorialMeta}>
          <Text style={styles.tutorialCategory}>
            {item.category === 'drawing' && 'Çizim'}
            {item.category === 'painting' && 'Boyama'}
            {item.category === 'digital_art' && 'Dijital Sanat'}
            {item.category === 'calligraphy' && 'Kaligrafi'}
            {item.category === 'doodle' && 'Doodle'}
            {item.category === 'mandala' && 'Mandala'}
            {item.category === 'pattern' && 'Desen'}
          </Text>
          <Text style={styles.tutorialDifficulty}>
            {item.difficulty === 'beginner' && '🟢 Başlangıç'}
            {item.difficulty === 'intermediate' && '🟡 Orta'}
            {item.difficulty === 'advanced' && '🟠 İleri'}
          </Text>
        </View>
      </View>

      <Text style={styles.tutorialTitle}>{item.title}</Text>
      <Text style={styles.tutorialDescription}>{item.description}</Text>

      <View style={styles.tutorialInfo}>
        <View style={styles.tutorialStat}>
          <Text style={styles.tutorialStatIcon}>⏱️</Text>
          <Text style={styles.tutorialStatText}>{item.duration} dk</Text>
        </View>
        <View style={styles.tutorialStat}>
          <Text style={styles.tutorialStatIcon}>👁️</Text>
          <Text style={styles.tutorialStatText}>{item.views}</Text>
        </View>
        <View style={styles.tutorialStat}>
          <Text style={styles.tutorialStatIcon}>❤️</Text>
          <Text style={styles.tutorialStatText}>{item.likes}</Text>
        </View>
        <View style={styles.tutorialStat}>
          <Text style={styles.tutorialStatIcon}>⭐</Text>
          <Text style={styles.tutorialStatText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.tutorialSteps}>
        <Text style={styles.stepsLabel}>{item.steps.length} Adım</Text>
        <Text style={styles.instructorLabel}>Eğitmen: {item.instructor}</Text>
      </View>
    </TouchableOpacity>
  );

  const insights = getArtisticInsights();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sanatsal Koleksiyonlar</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
            onPress={() => setActiveTab('gallery')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'gallery' && styles.activeTabText,
              ]}
            >
              Galeri
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'collections' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('collections')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'collections' && styles.activeTabText,
              ]}
            >
              Koleksiyonlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
            onPress={() => setActiveTab('challenges')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'challenges' && styles.activeTabText,
              ]}
            >
              Yarışmalar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tutorials' && styles.activeTab]}
            onPress={() => setActiveTab('tutorials')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'tutorials' && styles.activeTabText,
              ]}
            >
              Eğitimler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'create' && styles.activeTab]}
            onPress={() => setActiveTab('create')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'create' && styles.activeTabText,
              ]}
            >
              Oluştur
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {activeTab === 'gallery' && (
            <View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.totalItems}</Text>
                  <Text style={styles.statLabel}>Toplam Eser</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {insights.completedItems}
                  </Text>
                  <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {insights.publishedItems}
                  </Text>
                  <Text style={styles.statLabel}>Yayınlanan</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.totalLikes}</Text>
                  <Text style={styles.statLabel}>Beğeni</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Sanat Galerisi</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E91E63" />
                  <Text style={styles.loadingText}>Galeri yükleniyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={artisticItems}
                  renderItem={renderArtisticItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'collections' && (
            <View>
              <Text style={styles.sectionTitle}>Koleksiyonlarım</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E91E63" />
                  <Text style={styles.loadingText}>
                    Koleksiyonlar yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={collections}
                  renderItem={renderCollectionItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'challenges' && (
            <View>
              <Text style={styles.sectionTitle}>Sanat Yarışmaları</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E91E63" />
                  <Text style={styles.loadingText}>
                    Yarışmalar yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={challenges}
                  renderItem={renderChallengeItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'tutorials' && (
            <View>
              <Text style={styles.sectionTitle}>Sanat Eğitimleri</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#E91E63" />
                  <Text style={styles.loadingText}>
                    Eğitimler yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={tutorials}
                  renderItem={renderTutorialItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'create' && (
            <View>
              <Text style={styles.sectionTitle}>Yeni Oluştur</Text>
              <View style={styles.createOptions}>
                <TouchableOpacity
                  style={styles.createOption}
                  onPress={handleCreateArtisticItem}
                >
                  <Text style={styles.createOptionIcon}>🎨</Text>
                  <Text style={styles.createOptionTitle}>Sanat Eseri</Text>
                  <Text style={styles.createOptionDescription}>
                    Yeni bir sanat eseri oluşturun
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.createOption}
                  onPress={handleCreateCollection}
                >
                  <Text style={styles.createOptionIcon}>📚</Text>
                  <Text style={styles.createOptionTitle}>Koleksiyon</Text>
                  <Text style={styles.createOptionDescription}>
                    Sanat eserlerinizi organize edin
                  </Text>
                </TouchableOpacity>
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
    borderBottomColor: '#E91E63',
  },
  tabText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E91E63',
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
    color: '#E91E63',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  list: {
    marginBottom: 20,
  },
  artisticItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedItem: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  publishedItem: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  itemCategory: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  itemStatus: {
    fontSize: 12,
    color: '#666666',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  itemColors: {
    marginBottom: 8,
  },
  colorsLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 4,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemStats: {
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
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDifficulty: {
    fontSize: 12,
    color: '#666666',
  },
  itemDate: {
    fontSize: 12,
    color: '#999999',
  },
  collectionItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  collectionStatus: {
    fontSize: 12,
    color: '#666666',
  },
  collectionDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  collectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  collectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collectionTheme: {
    fontSize: 12,
    color: '#666666',
  },
  collectionDate: {
    fontSize: 12,
    color: '#999999',
  },
  challengeItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeChallenge: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  completedChallenge: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTypeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  challengeMeta: {
    flex: 1,
  },
  challengeType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E91E63',
    marginBottom: 2,
  },
  challengeDifficulty: {
    fontSize: 12,
    color: '#666666',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  challengeConstraints: {
    marginBottom: 8,
  },
  constraintsLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  constraintItem: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  challengeRewards: {
    marginBottom: 8,
  },
  rewardsLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rewardIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  rewardText: {
    fontSize: 12,
    color: '#666666',
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  joinButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tutorialItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tutorialCategoryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tutorialMeta: {
    flex: 1,
  },
  tutorialCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E91E63',
    marginBottom: 2,
  },
  tutorialDifficulty: {
    fontSize: 12,
    color: '#666666',
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  tutorialInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  tutorialStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorialStatIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  tutorialStatText: {
    fontSize: 12,
    color: '#666666',
  },
  tutorialSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsLabel: {
    fontSize: 12,
    color: '#666666',
  },
  instructorLabel: {
    fontSize: 12,
    color: '#999999',
  },
  createOptions: {
    gap: 16,
  },
  createOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  createOptionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  createOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  createOptionDescription: {
    fontSize: 14,
    color: '#666666',
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
