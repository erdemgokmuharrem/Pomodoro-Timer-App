import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {
  useSocialChallengesStore,
  SocialChallenge,
  ChallengeParticipant,
} from '../../store/useSocialChallengesStore';

interface SocialChallengesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SocialChallengesModal: React.FC<SocialChallengesModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    activeChallenges,
    myChallenges,
    completedChallenges,
    myTeams,
    settings,
    loading,
    error,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    updateProgress,
    createTeam,
    searchChallenges,
    getRecommendedChallenges,
    getTrendingChallenges,
    getChallengesByCategory,
    getChallengeLeaderboard,
    loadChallenges,
  } = useSocialChallengesStore();

  const [activeTab, setActiveTab] = useState<
    'discover' | 'create' | 'myChallenges' | 'teams'
  >('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDescription, setNewChallengeDescription] = useState('');
  const [newChallengeType, setNewChallengeType] = useState<
    | 'pomodoro_count'
    | 'focus_time'
    | 'streak'
    | 'completion_rate'
    | 'social'
    | 'creative'
  >('pomodoro_count');
  const [newChallengeCategory, setNewChallengeCategory] = useState<
    'daily' | 'weekly' | 'monthly' | 'special' | 'community'
  >('daily');
  const [newChallengeDifficulty, setNewChallengeDifficulty] = useState<
    'easy' | 'medium' | 'hard' | 'expert'
  >('medium');
  const [newChallengeTarget, setNewChallengeTarget] = useState(10);
  const [newChallengeDuration, setNewChallengeDuration] = useState(7); // days
  const [filteredChallenges, setFilteredChallenges] = useState<
    SocialChallenge[]
  >([]);
  const [selectedChallenge, setSelectedChallenge] =
    useState<SocialChallenge | null>(null);

  const categories = [
    { id: 'daily', name: 'Günlük', icon: '📅' },
    { id: 'weekly', name: 'Haftalık', icon: '📊' },
    { id: 'monthly', name: 'Aylık', icon: '🗓️' },
    { id: 'special', name: 'Özel', icon: '🎯' },
    { id: 'community', name: 'Topluluk', icon: '👥' },
  ];

  const difficulties = [
    { id: 'easy', name: 'Kolay', color: '#4CAF50' },
    { id: 'medium', name: 'Orta', color: '#FF9800' },
    { id: 'hard', name: 'Zor', color: '#F44336' },
    { id: 'expert', name: 'Uzman', color: '#9C27B0' },
  ];

  const challengeTypes = [
    { id: 'pomodoro_count', name: 'Pomodoro Sayısı', icon: '🍅' },
    { id: 'focus_time', name: 'Odaklanma Süresi', icon: '⏰' },
    { id: 'streak', name: 'Streak', icon: '🔥' },
    { id: 'completion_rate', name: 'Tamamlanma Oranı', icon: '📈' },
    { id: 'social', name: 'Sosyal', icon: '👥' },
    { id: 'creative', name: 'Yaratıcılık', icon: '🎨' },
  ];

  useEffect(() => {
    if (visible) {
      loadChallenges();
    }
  }, [visible, loadChallenges]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery || selectedCategory || selectedDifficulty) {
        const results = await searchChallenges(
          searchQuery,
          selectedCategory,
          selectedDifficulty
        );
        setFilteredChallenges(results);
      } else {
        setFilteredChallenges(activeChallenges);
      }
    };
    performSearch();
  }, [
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    activeChallenges,
    searchChallenges,
  ]);

  const handleCreateChallenge = async () => {
    if (!newChallengeTitle.trim()) {
      Alert.alert('Hata', 'Lütfen challenge başlığı girin');
      return;
    }

    try {
      const challengeId = await createChallenge({
        title: newChallengeTitle.trim(),
        description: newChallengeDescription.trim(),
        type: newChallengeType,
        category: newChallengeCategory,
        difficulty: newChallengeDifficulty,
        startDate: new Date(),
        endDate: new Date(
          Date.now() + newChallengeDuration * 24 * 60 * 60 * 1000
        ),
        isActive: true,
        isPublic: true,
        creatorId: 'current-user-id', // In real app, get from auth
        maxParticipants: 100,
        targetValue: newChallengeTarget,
        unit:
          newChallengeType === 'pomodoro_count'
            ? 'pomodoro'
            : newChallengeType === 'focus_time'
              ? 'dakika'
              : newChallengeType === 'streak'
                ? 'gün'
                : 'oran',
        rewards: {
          first: ['Champion Badge', '1000 Coins'],
          top10: ['Elite Badge', '500 Coins'],
          top50: ['Advanced Badge', '200 Coins'],
          completion: ['Completion Badge', '100 Coins'],
          participation: ['Participation Badge', '50 Coins'],
        },
        rules: {
          minLevel: 1,
          requiredTags: [],
          prohibitedContent: [],
          teamSize: 1,
          allowTeams: false,
        },
      });

      if (challengeId) {
        Alert.alert('Başarılı', 'Social Challenge oluşturuldu');
        setNewChallengeTitle('');
        setNewChallengeDescription('');
        setActiveTab('myChallenges');
      }
    } catch (err) {
      Alert.alert('Hata', 'Challenge oluşturulamadı');
    }
  };

  const handleJoinChallenge = async (challenge: SocialChallenge) => {
    try {
      const success = await joinChallenge(challenge.id, {
        name: 'You', // In real app, get from user profile
        currentProgress: 0,
        targetProgress: challenge.targetValue,
      });

      if (success) {
        setSelectedChallenge(challenge);
        Alert.alert('Başarılı', "Challenge'a katıldınız");
      }
    } catch (err) {
      Alert.alert('Hata', "Challenge'a katılamadınız");
    }
  };

  const handleUpdateProgress = async (
    challengeId: string,
    progress: number
  ) => {
    try {
      const success = await updateProgress(
        challengeId,
        'current-user-id',
        progress
      );
      if (success) {
        Alert.alert('Başarılı', 'İlerleme güncellendi');
      }
    } catch (err) {
      Alert.alert('Hata', 'İlerleme güncellenemedi');
    }
  };

  const renderChallengeItem = ({ item }: { item: SocialChallenge }) => (
    <TouchableOpacity
      style={styles.challengeItem}
      onPress={() => setSelectedChallenge(item)}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{item.title}</Text>
          <Text style={styles.challengeDescription}>{item.description}</Text>
          <View style={styles.challengeMeta}>
            <Text style={styles.challengeCategory}>
              {categories.find(c => c.id === item.category)?.icon}{' '}
              {categories.find(c => c.id === item.category)?.name}
            </Text>
            <Text
              style={[
                styles.challengeDifficulty,
                {
                  color: difficulties.find(d => d.id === item.difficulty)
                    ?.color,
                },
              ]}
            >
              {difficulties.find(d => d.id === item.difficulty)?.name}
            </Text>
          </View>
        </View>
        <View style={styles.challengeStats}>
          <Text style={styles.challengeParticipants}>
            {item.participants.length}/{item.maxParticipants}
          </Text>
          <Text style={styles.challengeStatus}>
            {item.isActive ? '🟢 Aktif' : '⚪ Tamamlandı'}
          </Text>
        </View>
      </View>
      <View style={styles.challengeFooter}>
        <Text style={styles.challengeTarget}>
          Hedef: {item.targetValue} {item.unit}
        </Text>
        <Text style={styles.challengeDuration}>
          {Math.ceil(
            (item.endDate.getTime() - item.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )}{' '}
          gün
        </Text>
      </View>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinChallenge(item)}
      >
        <Text style={styles.joinButtonText}>Katıl</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderParticipantItem = ({ item }: { item: ChallengeParticipant }) => (
    <View style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <Text style={styles.participantAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.name}</Text>
        <Text style={styles.participantProgress}>
          {item.currentProgress}/{item.targetProgress} (
          {Math.round((item.currentProgress / item.targetProgress) * 100)}%)
        </Text>
      </View>
      <View style={styles.participantRank}>
        <Text style={styles.participantRankText}>#{item.rank}</Text>
      </View>
    </View>
  );

  const renderTeamItem = ({ item }: { item: any }) => (
    <View style={styles.teamItem}>
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamDescription}>{item.description}</Text>
        <Text style={styles.teamStats}>
          {item.members.length}/{item.maxMembers} üye • {item.totalProgress}{' '}
          puan
        </Text>
      </View>
      <View style={styles.teamRank}>
        <Text style={styles.teamRankText}>#{item.rank}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Social Challenges</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'discover' && styles.activeTabText,
              ]}
            >
              Keşfet
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
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'myChallenges' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('myChallenges')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'myChallenges' && styles.activeTabText,
              ]}
            >
              Challenge'larım
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'teams' && styles.activeTab]}
            onPress={() => setActiveTab('teams')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'teams' && styles.activeTabText,
              ]}
            >
              Takımlar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {activeTab === 'discover' && (
            <View>
              {/* Search */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Challenge ara..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Category Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
              >
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id &&
                        styles.categoryButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? '' : category.id
                      )
                    }
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category.id &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Difficulty Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.difficultyContainer}
              >
                {difficulties.map(difficulty => (
                  <TouchableOpacity
                    key={difficulty.id}
                    style={[
                      styles.difficultyButton,
                      selectedDifficulty === difficulty.id &&
                        styles.difficultyButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedDifficulty(
                        selectedDifficulty === difficulty.id
                          ? ''
                          : difficulty.id
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        {
                          color:
                            selectedDifficulty === difficulty.id
                              ? 'white'
                              : difficulty.color,
                        },
                      ]}
                    >
                      {difficulty.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>Mevcut Challenge'lar</Text>
              <FlatList
                data={filteredChallenges}
                renderItem={renderChallengeItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'create' && (
            <View>
              <Text style={styles.sectionTitle}>Yeni Challenge Oluştur</Text>

              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Challenge Başlığı"
                  value={newChallengeTitle}
                  onChangeText={setNewChallengeTitle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Açıklama"
                  value={newChallengeDescription}
                  onChangeText={setNewChallengeDescription}
                  multiline
                />

                {/* Type Selection */}
                <Text style={styles.formLabel}>Challenge Türü</Text>
                <View style={styles.typeGrid}>
                  {challengeTypes.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        newChallengeType === type.id && styles.typeOptionActive,
                      ]}
                      onPress={() => setNewChallengeType(type.id as any)}
                    >
                      <Text style={styles.typeOptionIcon}>{type.icon}</Text>
                      <Text
                        style={[
                          styles.typeOptionText,
                          newChallengeType === type.id &&
                            styles.typeOptionTextActive,
                        ]}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Category Selection */}
                <Text style={styles.formLabel}>Kategori</Text>
                <View style={styles.categoryGrid}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        newChallengeCategory === category.id &&
                          styles.categoryOptionActive,
                      ]}
                      onPress={() =>
                        setNewChallengeCategory(category.id as any)
                      }
                    >
                      <Text style={styles.categoryOptionIcon}>
                        {category.icon}
                      </Text>
                      <Text
                        style={[
                          styles.categoryOptionText,
                          newChallengeCategory === category.id &&
                            styles.categoryOptionTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Difficulty Selection */}
                <Text style={styles.formLabel}>Zorluk</Text>
                <View style={styles.difficultyGrid}>
                  {difficulties.map(difficulty => (
                    <TouchableOpacity
                      key={difficulty.id}
                      style={[
                        styles.difficultyOption,
                        newChallengeDifficulty === difficulty.id &&
                          styles.difficultyOptionActive,
                      ]}
                      onPress={() =>
                        setNewChallengeDifficulty(difficulty.id as any)
                      }
                    >
                      <Text
                        style={[
                          styles.difficultyOptionText,
                          {
                            color:
                              newChallengeDifficulty === difficulty.id
                                ? 'white'
                                : difficulty.color,
                          },
                        ]}
                      >
                        {difficulty.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.targetContainer}>
                  <Text style={styles.targetLabel}>
                    Hedef: {newChallengeTarget}
                  </Text>
                  <View style={styles.targetButtons}>
                    <TouchableOpacity
                      style={styles.targetButton}
                      onPress={() =>
                        setNewChallengeTarget(
                          Math.max(1, newChallengeTarget - 1)
                        )
                      }
                    >
                      <Text style={styles.targetButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.targetButton}
                      onPress={() =>
                        setNewChallengeTarget(newChallengeTarget + 1)
                      }
                    >
                      <Text style={styles.targetButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>
                    Süre: {newChallengeDuration} gün
                  </Text>
                  <View style={styles.durationButtons}>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() =>
                        setNewChallengeDuration(
                          Math.max(1, newChallengeDuration - 1)
                        )
                      }
                    >
                      <Text style={styles.durationButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() =>
                        setNewChallengeDuration(newChallengeDuration + 1)
                      }
                    >
                      <Text style={styles.durationButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateChallenge}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.createButtonText}>
                      Challenge Oluştur
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'myChallenges' && (
            <View>
              <Text style={styles.sectionTitle}>Challenge'larım</Text>
              <FlatList
                data={myChallenges}
                renderItem={renderChallengeItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'teams' && (
            <View>
              <Text style={styles.sectionTitle}>Takımlarım</Text>
              <FlatList
                data={myTeams}
                renderItem={renderTeamItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
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
    fontSize: 12,
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  difficultyContainer: {
    marginBottom: 16,
  },
  difficultyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  difficultyButtonActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    marginBottom: 20,
  },
  challengeItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  challengeInfo: {
    flex: 1,
    marginRight: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  challengeMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeCategory: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '500',
  },
  challengeDifficulty: {
    fontSize: 12,
    fontWeight: '500',
  },
  challengeStats: {
    alignItems: 'flex-end',
  },
  challengeParticipants: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
    marginBottom: 4,
  },
  challengeStatus: {
    fontSize: 12,
    color: '#666666',
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTarget: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  challengeDuration: {
    fontSize: 12,
    color: '#666666',
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
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
  },
  typeOptionActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  typeOptionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: 'white',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
  },
  categoryOptionActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  categoryOptionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: 'white',
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  difficultyOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
    alignItems: 'center',
  },
  difficultyOptionActive: {
    backgroundColor: '#E91E63',
    borderColor: '#E91E63',
  },
  difficultyOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  targetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  targetLabel: {
    fontSize: 16,
    color: '#333333',
  },
  targetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  targetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    color: '#333333',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#E91E63',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  participantProgress: {
    fontSize: 14,
    color: '#666666',
  },
  participantRank: {
    alignItems: 'flex-end',
  },
  participantRankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  teamStats: {
    fontSize: 12,
    color: '#999999',
  },
  teamRank: {
    alignItems: 'flex-end',
  },
  teamRankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
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
