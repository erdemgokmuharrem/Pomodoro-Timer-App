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
  useLeagueStore,
  LeaguePlayer,
  LeagueTier,
  LeagueMatch,
} from '../../store/useLeagueStore';

interface LeagueSystemModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LeagueSystemModal: React.FC<LeagueSystemModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    currentSeason,
    myPlayer,
    leaderboard,
    recentMatches,
    availableTiers,
    settings,
    loading,
    error,
    createPlayer,
    updatePlayer,
    getLeaderboard,
    getPlayerRank,
    getTierInfo,
    startMatch,
    endMatch,
    unlockAchievement,
    awardBadge,
    loadLeagueData,
  } = useLeagueStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'leaderboard' | 'matches' | 'tiers' | 'achievements'
  >('overview');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<LeaguePlayer[]>([]);
  const [myRank, setMyRank] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      loadLeagueData();
    }
  }, [visible, loadLeagueData]);

  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (selectedTier) {
        const data = await getLeaderboard(selectedTier, 50);
        setLeaderboardData(data);
      } else {
        const data = await getLeaderboard(undefined, 50);
        setLeaderboardData(data);
      }
    };

    loadLeaderboardData();
  }, [selectedTier, getLeaderboard]);

  useEffect(() => {
    const loadMyRank = async () => {
      if (myPlayer) {
        const rank = await getPlayerRank(myPlayer.id);
        setMyRank(rank);
      }
    };

    loadMyRank();
  }, [myPlayer, getPlayerRank]);

  const handleCreatePlayer = async () => {
    if (myPlayer) {
      Alert.alert('Bilgi', 'Zaten bir lig oyuncususunuz!');
      return;
    }

    try {
      const playerId = await createPlayer({
        name: 'You', // In real app, get from user profile
        avatar: undefined,
      });

      if (playerId) {
        Alert.alert('Başarılı', 'Lig oyuncusu oluşturuldu!');
      }
    } catch (err) {
      Alert.alert('Hata', 'Lig oyuncusu oluşturulamadı');
    }
  };

  const handleStartMatch = async () => {
    if (!myPlayer) {
      Alert.alert('Hata', 'Önce lig oyuncusu oluşturmalısınız');
      return;
    }

    try {
      const matchId = await startMatch({
        players: [myPlayer],
        duration: 25, // 25 minutes
        type: 'pomodoro',
      });

      if (matchId) {
        Alert.alert('Başarılı', 'Lig maçı başlatıldı!');
      }
    } catch (err) {
      Alert.alert('Hata', 'Lig maçı başlatılamadı');
    }
  };

  const handleEndMatch = async (matchId: string) => {
    try {
      const success = await endMatch(matchId, { [myPlayer?.id || '']: 100 });
      if (success) {
        Alert.alert('Başarılı', 'Lig maçı tamamlandı!');
      }
    } catch (err) {
      Alert.alert('Hata', 'Lig maçı tamamlanamadı');
    }
  };

  const handleUnlockAchievement = async (achievement: string) => {
    if (!myPlayer) return;

    try {
      await unlockAchievement(myPlayer.id, achievement);
      Alert.alert('Başarılı', `Başarı açıldı: ${achievement}! 🎉`);
    } catch (err) {
      Alert.alert('Hata', 'Başarı açılamadı');
    }
  };

  const handleAwardBadge = async (badge: string) => {
    if (!myPlayer) return;

    try {
      await awardBadge(myPlayer.id, badge);
      Alert.alert('Başarılı', `Rozet kazanıldı: ${badge}! 🏆`);
    } catch (err) {
      Alert.alert('Hata', 'Rozet kazanılamadı');
    }
  };

  const renderPlayerItem = ({
    item,
    index,
  }: {
    item: LeaguePlayer;
    index: number;
  }) => (
    <View
      style={[
        styles.playerItem,
        myPlayer?.id === item.id && styles.myPlayerItem,
      ]}
    >
      <View style={styles.playerRank}>
        <Text style={styles.playerRankText}>#{index + 1}</Text>
      </View>
      <View style={styles.playerAvatar}>
        <Text style={styles.playerAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {item.name} {myPlayer?.id === item.id && '(Siz)'}
        </Text>
        <Text style={styles.playerTier}>
          {availableTiers.find(tier => tier.id === item.currentTier)?.icon}{' '}
          {availableTiers.find(tier => tier.id === item.currentTier)?.name}
        </Text>
        <Text style={styles.playerStats}>
          {item.totalPoints} puan • {item.streak} gün streak
        </Text>
      </View>
      <View style={styles.playerPoints}>
        <Text style={styles.playerPointsText}>{item.totalPoints}</Text>
        <Text style={styles.playerPointsLabel}>puan</Text>
      </View>
    </View>
  );

  const renderTierItem = ({ item }: { item: LeagueTier }) => (
    <TouchableOpacity
      style={[
        styles.tierItem,
        selectedTier === item.id && styles.tierItemActive,
        myPlayer?.currentTier === item.id && styles.myTierItem,
      ]}
      onPress={() => setSelectedTier(selectedTier === item.id ? '' : item.id)}
    >
      <View style={styles.tierHeader}>
        <Text style={styles.tierIcon}>{item.icon}</Text>
        <View style={styles.tierInfo}>
          <Text style={styles.tierName}>{item.name}</Text>
          <Text style={styles.tierRange}>
            {item.minPoints} - {item.maxPoints} puan
          </Text>
        </View>
        {myPlayer?.currentTier === item.id && (
          <Text style={styles.currentTierBadge}>Mevcut</Text>
        )}
      </View>
      <Text style={styles.tierBenefits}>{item.benefits.join(' • ')}</Text>
    </TouchableOpacity>
  );

  const renderMatchItem = ({ item }: { item: LeagueMatch }) => (
    <View style={styles.matchItem}>
      <View style={styles.matchHeader}>
        <Text style={styles.matchType}>
          {item.type === 'pomodoro'
            ? '🍅 Pomodoro'
            : item.type === 'focus_time'
              ? '⏰ Odaklanma'
              : item.type === 'streak'
                ? '🔥 Streak'
                : '💪 Combo'}
        </Text>
        <Text style={styles.matchStatus}>
          {item.isActive ? '🟢 Aktif' : '⚪ Tamamlandı'}
        </Text>
      </View>
      <Text style={styles.matchDuration}>
        {Math.floor(item.duration / 60)} dakika
      </Text>
      <Text style={styles.matchPlayers}>{item.players.length} oyuncu</Text>
      {item.winner && (
        <Text style={styles.matchWinner}>
          🏆 Kazanan: {item.players.find(p => p.id === item.winner)?.name}
        </Text>
      )}
      {item.isActive && myPlayer && (
        <TouchableOpacity
          style={styles.endMatchButton}
          onPress={() => handleEndMatch(item.id)}
        >
          <Text style={styles.endMatchButtonText}>Maçı Bitir</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAchievementItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.achievementItem}
      onPress={() => handleUnlockAchievement(item)}
    >
      <Text style={styles.achievementIcon}>🏆</Text>
      <Text style={styles.achievementName}>{item}</Text>
    </TouchableOpacity>
  );

  const renderBadgeItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.badgeItem}
      onPress={() => handleAwardBadge(item)}
    >
      <Text style={styles.badgeIcon}>🥇</Text>
      <Text style={styles.badgeName}>{item}</Text>
    </TouchableOpacity>
  );

  const availableAchievements = [
    'İlk Pomodoro',
    '5 Günlük Streak',
    '10 Günlük Streak',
    '25 Günlük Streak',
    '50 Günlük Streak',
    '100 Pomodoro',
    '500 Pomodoro',
    '1000 Pomodoro',
    'Günlük Hedef',
    'Haftalık Hedef',
    'Aylık Hedef',
    'Lig Şampiyonu',
  ];

  const availableBadges = [
    'Bronze Badge',
    'Silver Badge',
    'Gold Badge',
    'Platinum Badge',
    'Diamond Badge',
    'Master Badge',
    'Grandmaster Badge',
    'Streak Master',
    'Focus Master',
    'Team Player',
    'Leader',
    'Mentor',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Lig Sistemi</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Genel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'leaderboard' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'leaderboard' && styles.activeTabText,
              ]}
            >
              Sıralama
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
            onPress={() => setActiveTab('matches')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'matches' && styles.activeTabText,
              ]}
            >
              Maçlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tiers' && styles.activeTab]}
            onPress={() => setActiveTab('tiers')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'tiers' && styles.activeTabText,
              ]}
            >
              Seviyeler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'achievements' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'achievements' && styles.activeTabText,
              ]}
            >
              Başarılar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {activeTab === 'overview' && (
            <View>
              {!myPlayer ? (
                <View style={styles.createPlayerContainer}>
                  <Text style={styles.createPlayerTitle}>
                    Lig Sistemine Katıl
                  </Text>
                  <Text style={styles.createPlayerDescription}>
                    Rekabetçi gamification ile odaklanma gücünüzü test edin!
                  </Text>
                  <TouchableOpacity
                    style={styles.createPlayerButton}
                    onPress={handleCreatePlayer}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.createPlayerButtonText}>
                        Lig Oyuncusu Oluştur
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.sectionTitle}>Profiliniz</Text>
                  <View style={styles.playerCard}>
                    <View style={styles.playerCardHeader}>
                      <View style={styles.playerCardAvatar}>
                        <Text style={styles.playerCardAvatarText}>
                          {myPlayer.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.playerCardInfo}>
                        <Text style={styles.playerCardName}>
                          {myPlayer.name}
                        </Text>
                        <Text style={styles.playerCardTier}>
                          {
                            availableTiers.find(
                              tier => tier.id === myPlayer.currentTier
                            )?.icon
                          }{' '}
                          {
                            availableTiers.find(
                              tier => tier.id === myPlayer.currentTier
                            )?.name
                          }
                        </Text>
                        <Text style={styles.playerCardRank}>
                          #{myRank} sırada
                        </Text>
                      </View>
                    </View>
                    <View style={styles.playerCardStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                          {myPlayer.totalPoints}
                        </Text>
                        <Text style={styles.statLabel}>Toplam Puan</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{myPlayer.streak}</Text>
                        <Text style={styles.statLabel}>Günlük Streak</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                          {myPlayer.totalPomodoros}
                        </Text>
                        <Text style={styles.statLabel}>Pomodoro</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.startMatchButton}
                    onPress={handleStartMatch}
                  >
                    <Text style={styles.startMatchButtonText}>
                      Lig Maçı Başlat
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activeTab === 'leaderboard' && (
            <View>
              <Text style={styles.sectionTitle}>Liderlik Tablosu</Text>
              <FlatList
                data={leaderboardData}
                renderItem={renderPlayerItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'matches' && (
            <View>
              <Text style={styles.sectionTitle}>Son Maçlar</Text>
              <FlatList
                data={recentMatches}
                renderItem={renderMatchItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'tiers' && (
            <View>
              <Text style={styles.sectionTitle}>Lig Seviyeleri</Text>
              <FlatList
                data={availableTiers}
                renderItem={renderTierItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'achievements' && (
            <View>
              <Text style={styles.sectionTitle}>Başarılar</Text>
              <View style={styles.achievementsGrid}>
                {availableAchievements.map((achievement, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.achievementItem}
                    onPress={() => handleUnlockAchievement(achievement)}
                  >
                    <Text style={styles.achievementIcon}>🏆</Text>
                    <Text style={styles.achievementName}>{achievement}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Rozetler</Text>
              <View style={styles.badgesGrid}>
                {availableBadges.map((badge, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.badgeItem}
                    onPress={() => handleAwardBadge(badge)}
                  >
                    <Text style={styles.badgeIcon}>🥇</Text>
                    <Text style={styles.badgeName}>{badge}</Text>
                  </TouchableOpacity>
                ))}
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
    borderBottomColor: '#FF6B35',
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B35',
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
  createPlayerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  createPlayerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  createPlayerDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  createPlayerButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  createPlayerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  playerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  playerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playerCardAvatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerCardInfo: {
    flex: 1,
  },
  playerCardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  playerCardTier: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 4,
  },
  playerCardRank: {
    fontSize: 14,
    color: '#666666',
  },
  playerCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  startMatchButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  startMatchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  myPlayerItem: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  playerRank: {
    width: 40,
    alignItems: 'center',
  },
  playerRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  playerTier: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 2,
  },
  playerStats: {
    fontSize: 12,
    color: '#666666',
  },
  playerPoints: {
    alignItems: 'flex-end',
  },
  playerPointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  playerPointsLabel: {
    fontSize: 12,
    color: '#666666',
  },
  tierItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tierItemActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF3E0',
  },
  myTierItem: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF3E0',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  tierRange: {
    fontSize: 14,
    color: '#666666',
  },
  currentTierBadge: {
    backgroundColor: '#FF6B35',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  tierBenefits: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  matchItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  matchStatus: {
    fontSize: 14,
    color: '#666666',
  },
  matchDuration: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  matchPlayers: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  matchWinner: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    marginBottom: 8,
  },
  endMatchButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  endMatchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  achievementName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  badgeName: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
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
