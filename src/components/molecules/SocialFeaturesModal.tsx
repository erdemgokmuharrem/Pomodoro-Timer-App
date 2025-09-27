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
  TextInput,
  FlatList,
} from 'react-native';
import {
  useSocialFeatures,
  User,
  FriendRequest,
  SessionInvite,
} from '../../hooks/useSocialFeatures';

interface SocialFeaturesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SocialFeaturesModal: React.FC<SocialFeaturesModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    users,
    friends,
    friendRequests,
    sessionInvites,
    settings,
    loading,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    sendSessionInvite,
    acceptSessionInvite,
    rejectSessionInvite,
    getFriendsList,
    getPendingFriendRequests,
    getSentFriendRequests,
    getPendingSessionInvites,
    getSocialInsights,
    updateSettings,
  } = useSocialFeatures();

  const [activeTab, setActiveTab] = useState<
    'friends' | 'requests' | 'invites' | 'search' | 'settings'
  >('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (visible && activeTab === 'search') {
      handleSearch();
    }
  }, [visible, activeTab]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const success = await sendFriendRequest(
        userId,
        'Merhaba! Arkadaş olmak ister misin?'
      );
      if (success) {
        Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi!');
      } else {
        Alert.alert('Hata', 'Arkadaşlık isteği gönderilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      const success = await acceptFriendRequest(requestId);
      if (success) {
        Alert.alert('Başarılı', 'Arkadaşlık isteği kabul edildi!');
      } else {
        Alert.alert('Hata', 'Arkadaşlık isteği kabul edilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      const success = await rejectFriendRequest(requestId);
      if (success) {
        Alert.alert('Başarılı', 'Arkadaşlık isteği reddedildi');
      } else {
        Alert.alert('Hata', 'Arkadaşlık isteği reddedilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      const success = await removeFriend(friendshipId);
      if (success) {
        Alert.alert('Başarılı', 'Arkadaş listeden çıkarıldı');
      } else {
        Alert.alert('Hata', 'Arkadaş çıkarılamadı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleAcceptSessionInvite = async (inviteId: string) => {
    try {
      const success = await acceptSessionInvite(inviteId);
      if (success) {
        Alert.alert('Başarılı', 'Seans daveti kabul edildi!');
      } else {
        Alert.alert('Hata', 'Seans daveti kabul edilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleRejectSessionInvite = async (inviteId: string) => {
    try {
      const success = await rejectSessionInvite(inviteId);
      if (success) {
        Alert.alert('Başarılı', 'Seans daveti reddedildi');
      } else {
        Alert.alert('Hata', 'Seans daveti reddedilemedi');
      }
    } catch (err) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const handleUpdateSettings = (newSettings: any) => {
    updateSettings(newSettings);
    Alert.alert('Başarılı', 'Ayarlar güncellendi');
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
          {item.bio && <Text style={styles.userBio}>{item.bio}</Text>}
        </View>
        <View style={styles.userStatus}>
          <View
            style={[
              styles.statusIndicator,
              item.status === 'online' && styles.statusOnline,
              item.status === 'busy' && styles.statusBusy,
              item.status === 'away' && styles.statusAway,
              item.status === 'offline' && styles.statusOffline,
            ]}
          />
          <Text style={styles.statusText}>
            {item.status === 'online' && 'Çevrimiçi'}
            {item.status === 'busy' && 'Meşgul'}
            {item.status === 'away' && 'Uzakta'}
            {item.status === 'offline' && 'Çevrimdışı'}
          </Text>
        </View>
      </View>

      <View style={styles.userStats}>
        <Text style={styles.userStat}>Seviye {item.level}</Text>
        <Text style={styles.userStat}>{item.xp} XP</Text>
        <Text style={styles.userStat}>
          {item.stats.totalPomodoros} Pomodoro
        </Text>
        <Text style={styles.userStat}>{item.stats.currentStreak} Seri</Text>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={() => handleSendFriendRequest(item.id)}
        >
          <Text style={styles.addFriendButtonText}>Arkadaş Ekle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={() =>
            sendSessionInvite('session-123', item.id, 'Birlikte çalışalım!')
          }
        >
          <Text style={styles.inviteButtonText}>Davet Et</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFriendRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestFrom}>
          {users.find(u => u.id === item.fromUserId)?.displayName ||
            'Bilinmeyen Kullanıcı'}
        </Text>
        <Text style={styles.requestDate}>
          {item.createdAt.toLocaleDateString('tr-TR')}
        </Text>
      </View>

      {item.message && (
        <Text style={styles.requestMessage}>{item.message}</Text>
      )}

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptFriendRequest(item.id)}
        >
          <Text style={styles.acceptButtonText}>Kabul Et</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectFriendRequest(item.id)}
        >
          <Text style={styles.rejectButtonText}>Reddet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSessionInviteItem = ({ item }: { item: SessionInvite }) => (
    <View style={styles.inviteItem}>
      <View style={styles.inviteHeader}>
        <Text style={styles.inviteFrom}>
          {users.find(u => u.id === item.fromUserId)?.displayName ||
            'Bilinmeyen Kullanıcı'}
        </Text>
        <Text style={styles.inviteDate}>
          {item.createdAt.toLocaleDateString('tr-TR')}
        </Text>
      </View>

      <Text style={styles.inviteSession}>Seans ID: {item.sessionId}</Text>
      {item.message && <Text style={styles.inviteMessage}>{item.message}</Text>}

      <View style={styles.inviteActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptSessionInvite(item.id)}
        >
          <Text style={styles.acceptButtonText}>Kabul Et</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectSessionInvite(item.id)}
        >
          <Text style={styles.rejectButtonText}>Reddet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const insights = getSocialInsights();
  const friendsList = getFriendsList();
  const pendingRequests = getPendingFriendRequests();
  const sentRequests = getSentFriendRequests();
  const pendingInvites = getPendingSessionInvites();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sosyal Özellikler</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'friends' && styles.activeTabText,
              ]}
            >
              Arkadaşlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
            onPress={() => setActiveTab('requests')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && styles.activeTabText,
              ]}
            >
              İstekler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'invites' && styles.activeTab]}
            onPress={() => setActiveTab('invites')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'invites' && styles.activeTabText,
              ]}
            >
              Davetler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'search' && styles.activeTabText,
              ]}
            >
              Ara
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

          {activeTab === 'friends' && (
            <View>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{insights.totalFriends}</Text>
                  <Text style={styles.statLabel}>Arkadaş</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {insights.onlineFriends}
                  </Text>
                  <Text style={styles.statLabel}>Çevrimiçi</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {insights.activeFriends}
                  </Text>
                  <Text style={styles.statLabel}>Aktif</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Arkadaşlarım</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>
                    Arkadaşlar yükleniyor...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={friendsList}
                  renderItem={renderUserItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'requests' && (
            <View>
              <Text style={styles.sectionTitle}>Arkadaşlık İstekleri</Text>

              <Text style={styles.subsectionTitle}>
                Gelen İstekler ({pendingRequests.length})
              </Text>
              <FlatList
                data={pendingRequests}
                renderItem={renderFriendRequestItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />

              <Text style={styles.subsectionTitle}>
                Gönderilen İstekler ({sentRequests.length})
              </Text>
              <FlatList
                data={sentRequests}
                renderItem={({ item }) => (
                  <View style={styles.sentRequestItem}>
                    <Text style={styles.sentRequestTo}>
                      {users.find(u => u.id === item.toUserId)?.displayName ||
                        'Bilinmeyen Kullanıcı'}
                    </Text>
                    <Text style={styles.sentRequestStatus}>
                      {item.status === 'pending' && 'Beklemede'}
                      {item.status === 'accepted' && 'Kabul Edildi'}
                      {item.status === 'rejected' && 'Reddedildi'}
                    </Text>
                  </View>
                )}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'invites' && (
            <View>
              <Text style={styles.sectionTitle}>Seans Davetleri</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Davetler yükleniyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={pendingInvites}
                  renderItem={renderSessionInviteItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'search' && (
            <View>
              <Text style={styles.sectionTitle}>Kullanıcı Ara</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Kullanıcı adı veya isim ara..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Text style={styles.searchButtonText}>Ara</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Arama Sonuçları</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Arama yapılıyor...</Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  renderItem={renderUserItem}
                  keyExtractor={item => item.id}
                  style={styles.list}
                />
              )}
            </View>
          )}

          {activeTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>Sosyal Ayarlar</Text>
              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Arkadaşlık İstekleri</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.allowFriendRequests && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        allowFriendRequests: !settings.allowFriendRequests,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.allowFriendRequests &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.allowFriendRequests ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Seans Davetleri</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.allowSessionInvites && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        allowSessionInvites: !settings.allowSessionInvites,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.allowSessionInvites &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.allowSessionInvites ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Çevrimiçi Durumu</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.showOnlineStatus && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        showOnlineStatus: !settings.showOnlineStatus,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.showOnlineStatus &&
                          styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.showOnlineStatus ? 'Açık' : 'Kapalı'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.settingItem}>
                  <Text style={styles.settingLabel}>Aktivite Paylaşımı</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      settings.showActivity && styles.toggleButtonActive,
                    ]}
                    onPress={() =>
                      handleUpdateSettings({
                        showActivity: !settings.showActivity,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        settings.showActivity && styles.toggleButtonTextActive,
                      ]}
                    >
                      {settings.showActivity ? 'Açık' : 'Kapalı'}
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
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
  userItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 12,
    color: '#666666',
  },
  userStatus: {
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CCCCCC',
    marginBottom: 4,
  },
  statusOnline: {
    backgroundColor: '#4CAF50',
  },
  statusBusy: {
    backgroundColor: '#FF9800',
  },
  statusAway: {
    backgroundColor: '#FFC107',
  },
  statusOffline: {
    backgroundColor: '#CCCCCC',
  },
  statusText: {
    fontSize: 10,
    color: '#666666',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  userStat: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addFriendButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
  },
  addFriendButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  requestItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestFrom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  requestDate: {
    fontSize: 12,
    color: '#666666',
  },
  requestMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  rejectButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  sentRequestItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentRequestTo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  sentRequestStatus: {
    fontSize: 12,
    color: '#666666',
  },
  inviteItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inviteFrom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  inviteDate: {
    fontSize: 12,
    color: '#666666',
  },
  inviteSession: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  inviteMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
