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
  Image,
} from 'react-native';
import { useFocusRoomsStore, FocusRoom, FocusRoomMember } from '../../store/useFocusRoomsStore';

interface FocusRoomsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FocusRoomsModal: React.FC<FocusRoomsModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    currentRoom,
    availableRooms,
    myRooms,
    joinedRooms,
    settings,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startRoom,
    endRoom,
    sendMessage,
    sendEncouragement,
    shareAchievement,
    searchRooms,
    getRecommendedRooms,
    getTrendingRooms,
    loadRooms,
  } = useFocusRoomsStore();

  const [activeTab, setActiveTab] = useState<'discover' | 'create' | 'myRooms' | 'active'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomDuration, setNewRoomDuration] = useState(25);
  const [newRoomCategory, setNewRoomCategory] = useState<'study' | 'work' | 'creative' | 'fitness' | 'meditation' | 'other'>('study');
  const [newRoomTheme, setNewRoomTheme] = useState<'forest' | 'ocean' | 'mountain' | 'city' | 'space' | 'library' | 'cafe'>('forest');
  const [newMessage, setNewMessage] = useState('');
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [achievementMessage, setAchievementMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<FocusRoom | null>(null);
  const [filteredRooms, setFilteredRooms] = useState<FocusRoom[]>([]);

  const categories = [
    { id: 'study', name: 'Çalışma', icon: '📚' },
    { id: 'work', name: 'İş', icon: '💼' },
    { id: 'creative', name: 'Yaratıcılık', icon: '🎨' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'meditation', name: 'Meditasyon', icon: '🧘' },
    { id: 'other', name: 'Diğer', icon: '🌟' },
  ];

  const themes = [
    { id: 'forest', name: 'Orman', icon: '🌲' },
    { id: 'ocean', name: 'Okyanus', icon: '🌊' },
    { id: 'mountain', name: 'Dağ', icon: '⛰️' },
    { id: 'city', name: 'Şehir', icon: '🏙️' },
    { id: 'space', name: 'Uzay', icon: '🚀' },
    { id: 'library', name: 'Kütüphane', icon: '📖' },
    { id: 'cafe', name: 'Kafe', icon: '☕' },
  ];

  useEffect(() => {
    if (visible) {
      loadRooms();
    }
  }, [visible, loadRooms]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery || selectedCategory || selectedTheme) {
        const results = await searchRooms(searchQuery, selectedCategory, selectedTheme);
        setFilteredRooms(results);
      } else {
        setFilteredRooms(availableRooms);
      }
    };
    performSearch();
  }, [searchQuery, selectedCategory, selectedTheme, availableRooms, searchRooms]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Hata', 'Lütfen oda adı girin');
      return;
    }

    try {
      const roomId = await createRoom({
        name: newRoomName.trim(),
        description: newRoomDescription.trim(),
        maxMembers: settings.defaultMaxMembers,
        isActive: false,
        isPublic: true,
        category: newRoomCategory,
        theme: newRoomTheme,
        duration: newRoomDuration,
        currentPhase: 'waiting',
        settings: {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStart: false,
          soundEnabled: true,
          backgroundMusicEnabled: settings.enableBackgroundMusic,
          chatEnabled: true,
          videoEnabled: settings.enableVideo,
          screenSharingEnabled: settings.enableScreenSharing,
          allowGuests: true,
          requireApproval: false,
        },
      });

      if (roomId) {
        Alert.alert('Başarılı', 'Focus Room oluşturuldu');
        setNewRoomName('');
        setNewRoomDescription('');
        setActiveTab('myRooms');
      }
    } catch (err) {
      Alert.alert('Hata', 'Oda oluşturulamadı');
    }
  };

  const handleJoinRoom = async (room: FocusRoom) => {
    try {
      const success = await joinRoom(room.id, {
        name: 'You', // In real app, get from user profile
        isOnline: true,
      });

      if (success) {
        setSelectedRoom(room);
        setActiveTab('active');
        Alert.alert('Başarılı', 'Focus Room\'a katıldınız');
      }
    } catch (err) {
      Alert.alert('Hata', 'Odaya katılamadınız');
    }
  };

  const handleStartRoom = async () => {
    if (!selectedRoom) return;

    try {
      const success = await startRoom(selectedRoom.id);
      if (success) {
        Alert.alert('Başarılı', 'Focus Room başlatıldı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Oda başlatılamadı');
    }
  };

  const handleEndRoom = async () => {
    if (!selectedRoom) return;

    try {
      const success = await endRoom(selectedRoom.id);
      if (success) {
        setSelectedRoom(null);
        setActiveTab('discover');
        Alert.alert('Başarılı', 'Focus Room sonlandırıldı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Oda sonlandırılamadı');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      await sendMessage(selectedRoom.id, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    }
  };

  const handleSendEncouragement = async () => {
    if (!encouragementMessage.trim() || !selectedRoom) return;

    try {
      await sendEncouragement(selectedRoom.id, encouragementMessage.trim());
      setEncouragementMessage('');
      Alert.alert('Başarılı', 'Teşvik mesajı gönderildi! 💪');
    } catch (err) {
      Alert.alert('Hata', 'Teşvik mesajı gönderilemedi');
    }
  };

  const handleShareAchievement = async () => {
    if (!achievementMessage.trim() || !selectedRoom) return;

    try {
      await shareAchievement(selectedRoom.id, achievementMessage.trim());
      setAchievementMessage('');
      Alert.alert('Başarılı', 'Başarınız paylaşıldı! 🎉');
    } catch (err) {
      Alert.alert('Hata', 'Başarı paylaşılamadı');
    }
  };

  const renderRoomItem = ({ item }: { item: FocusRoom }) => (
    <TouchableOpacity style={styles.roomItem} onPress={() => handleJoinRoom(item)}>
      <View style={styles.roomHeader}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.roomCategory}>
            {categories.find(c => c.id === item.category)?.icon} {categories.find(c => c.id === item.category)?.name}
          </Text>
          <Text style={styles.roomTheme}>
            {themes.find(t => t.id === item.theme)?.icon} {themes.find(t => t.id === item.theme)?.name}
          </Text>
        </View>
        <View style={styles.roomStats}>
          <Text style={styles.roomMembers}>{item.members.length}/{item.maxMembers}</Text>
          <Text style={styles.roomStatus}>
            {item.isActive ? '🟢 Aktif' : '⚪ Beklemede'}
          </Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.roomDescription}>{item.description}</Text>
      )}
      <View style={styles.roomFooter}>
        <Text style={styles.roomDuration}>{item.duration} dakika</Text>
        <Text style={styles.roomRules}>
          {item.rules.focusLevel === 'strict' ? '🔒 Sıkı' : 
           item.rules.focusLevel === 'moderate' ? '⚖️ Orta' : '😌 Rahat'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMemberItem = ({ item }: { item: FocusRoomMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.name} {item.isHost && '👑'} {item.isModerator && '🛡️'}
        </Text>
        <Text style={styles.memberStatus}>
          {item.isOnline ? '🟢 Çevrimiçi' : '⚪ Çevrimdışı'} • {item.focusStreak} gün streak
        </Text>
        {item.currentTask && (
          <Text style={styles.memberTask}>Görev: {item.currentTask}</Text>
        )}
      </View>
    </View>
  );

  const renderMessageItem = ({ item }: { item: any }) => (
    <View style={[
      styles.messageItem,
      item.userId === 'current-user-id' && styles.messageItemOwn,
      item.type === 'encouragement' && styles.encouragementMessage,
      item.type === 'achievement' && styles.achievementMessage
    ]}>
      <Text style={styles.messageUserName}>{item.userName}</Text>
      <Text style={[
        styles.messageText,
        item.type === 'encouragement' && styles.encouragementText,
        item.type === 'achievement' && styles.achievementText
      ]}>
        {item.message}
      </Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  const encouragementSuggestions = [
    '💪 Sen harikasın!',
    '🔥 Odaklanma gücün muhteşem!',
    '⭐ Bu seansı birlikte tamamlayalım!',
    '🚀 Harika gidiyoruz!',
    '💯 Mükemmel performans!',
    '🎯 Hedefimize odaklanalım!',
  ];

  const achievementSuggestions = [
    'İlk pomodoro tamamlandı! 🎉',
    '5 günlük streak! 🔥',
    'Günlük hedefe ulaştım! ⭐',
    'Yeni seviye açıldı! 🚀',
    'Mükemmel odaklanma! 💯',
    'Takım çalışması harika! 🤝',
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Focus Rooms</Text>
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
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
              Keşfet
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'create' && styles.activeTab]}
            onPress={() => setActiveTab('create')}
          >
            <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
              Oluştur
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myRooms' && styles.activeTab]}
            onPress={() => setActiveTab('myRooms')}
          >
            <Text style={[styles.tabText, activeTab === 'myRooms' && styles.activeTabText]}>
              Odalarım
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Aktif
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
                  placeholder="Oda ara..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Category Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Theme Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeContainer}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeButton,
                      selectedTheme === theme.id && styles.themeButtonActive
                    ]}
                    onPress={() => setSelectedTheme(selectedTheme === theme.id ? '' : theme.id)}
                  >
                    <Text style={styles.themeIcon}>{theme.icon}</Text>
                    <Text style={[
                      styles.themeText,
                      selectedTheme === theme.id && styles.themeTextActive
                    ]}>
                      {theme.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionTitle}>Mevcut Odalar</Text>
              <FlatList
                data={filteredRooms}
                renderItem={renderRoomItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'create' && (
            <View>
              <Text style={styles.sectionTitle}>Yeni Focus Room Oluştur</Text>
              
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Oda Adı"
                  value={newRoomName}
                  onChangeText={setNewRoomName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Açıklama (opsiyonel)"
                  value={newRoomDescription}
                  onChangeText={setNewRoomDescription}
                  multiline
                />
                
                {/* Category Selection */}
                <Text style={styles.formLabel}>Kategori</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        newRoomCategory === category.id && styles.categoryOptionActive
                      ]}
                      onPress={() => setNewRoomCategory(category.id as any)}
                    >
                      <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                      <Text style={[
                        styles.categoryOptionText,
                        newRoomCategory === category.id && styles.categoryOptionTextActive
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Theme Selection */}
                <Text style={styles.formLabel}>Tema</Text>
                <View style={styles.themeGrid}>
                  {themes.map((theme) => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[
                        styles.themeOption,
                        newRoomTheme === theme.id && styles.themeOptionActive
                      ]}
                      onPress={() => setNewRoomTheme(theme.id as any)}
                    >
                      <Text style={styles.themeOptionIcon}>{theme.icon}</Text>
                      <Text style={[
                        styles.themeOptionText,
                        newRoomTheme === theme.id && styles.themeOptionTextActive
                      ]}>
                        {theme.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>Süre: {newRoomDuration} dakika</Text>
                  <View style={styles.durationButtons}>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() => setNewRoomDuration(Math.max(15, newRoomDuration - 5))}
                    >
                      <Text style={styles.durationButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() => setNewRoomDuration(Math.min(120, newRoomDuration + 5))}
                    >
                      <Text style={styles.durationButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateRoom}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.createButtonText}>Focus Room Oluştur</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'myRooms' && (
            <View>
              <Text style={styles.sectionTitle}>Oluşturduğum Odalar</Text>
              <FlatList
                data={myRooms}
                renderItem={renderRoomItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'active' && selectedRoom && (
            <View>
              <Text style={styles.sectionTitle}>Aktif Room: {selectedRoom.name}</Text>
              
              {/* Room Controls */}
              <View style={styles.roomControls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    selectedRoom.isActive ? styles.endButton : styles.startButton
                  ]}
                  onPress={selectedRoom.isActive ? handleEndRoom : handleStartRoom}
                >
                  <Text style={styles.controlButtonText}>
                    {selectedRoom.isActive ? 'Odayı Sonlandır' : 'Odayı Başlat'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Members */}
              <Text style={styles.subsectionTitle}>Üyeler ({selectedRoom.members.length})</Text>
              <FlatList
                data={selectedRoom.members}
                renderItem={renderMemberItem}
                keyExtractor={(item) => item.id}
                style={styles.membersList}
              />

              {/* Chat */}
              {selectedRoom.settings.chatEnabled && (
                <View>
                  <Text style={styles.subsectionTitle}>Sohbet</Text>
                  <View style={styles.chatContainer}>
                    <FlatList
                      data={selectedRoom.chat.messages}
                      renderItem={renderMessageItem}
                      keyExtractor={(item) => item.id}
                      style={styles.messagesList}
                    />
                    <View style={styles.messageInputContainer}>
                      <TextInput
                        style={styles.messageInput}
                        placeholder="Mesaj yazın..."
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendMessage}
                      >
                        <Text style={styles.sendButtonText}>Gönder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Encouragements */}
              <View>
                <Text style={styles.subsectionTitle}>Teşvik Mesajları</Text>
                <View style={styles.encouragementContainer}>
                  <TextInput
                    style={styles.encouragementInput}
                    placeholder="Oda üyelerini teşvik edin..."
                    value={encouragementMessage}
                    onChangeText={setEncouragementMessage}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.encouragementButton}
                    onPress={handleSendEncouragement}
                  >
                    <Text style={styles.encouragementButtonText}>💪 Teşvik Et</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.suggestionsTitle}>Hızlı Teşvikler:</Text>
                <View style={styles.suggestionsContainer}>
                  {encouragementSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => setEncouragementMessage(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Achievements */}
              <View>
                <Text style={styles.subsectionTitle}>Başarı Paylaşımı</Text>
                <View style={styles.achievementContainer}>
                  <TextInput
                    style={styles.achievementInput}
                    placeholder="Başarınızı paylaşın..."
                    value={achievementMessage}
                    onChangeText={setAchievementMessage}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.achievementButton}
                    onPress={handleShareAchievement}
                  >
                    <Text style={styles.achievementButtonText}>🎉 Paylaş</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.suggestionsTitle}>Hızlı Başarılar:</Text>
                <View style={styles.suggestionsContainer}>
                  {achievementSuggestions.map((achievement, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => setAchievementMessage(achievement)}
                    >
                      <Text style={styles.suggestionText}>{achievement}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Statistics */}
              <Text style={styles.subsectionTitle}>İstatistikler</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedRoom.statistics.totalSessions}</Text>
                  <Text style={styles.statLabel}>Toplam Oturum</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedRoom.statistics.totalFocusTime}</Text>
                  <Text style={styles.statLabel}>Odaklanma Süresi (dk)</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedRoom.statistics.activeMembers}</Text>
                  <Text style={styles.statLabel}>Aktif Üye</Text>
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
    borderBottomColor: '#9C27B0',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#9C27B0',
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
    color: '#333333',
    marginTop: 20,
    marginBottom: 12,
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
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
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
  themeContainer: {
    marginBottom: 16,
  },
  themeButton: {
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
  themeButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  themeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  themeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  themeTextActive: {
    color: 'white',
  },
  list: {
    marginBottom: 20,
  },
  roomItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  roomCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  roomTheme: {
    fontSize: 14,
    color: '#666666',
  },
  roomStats: {
    alignItems: 'flex-end',
  },
  roomMembers: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: 4,
  },
  roomStatus: {
    fontSize: 12,
    color: '#666666',
  },
  roomDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomDuration: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '500',
  },
  roomRules: {
    fontSize: 12,
    color: '#999999',
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
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
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
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  themeOption: {
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
  themeOptionActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  themeOptionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  themeOptionText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  themeOptionTextActive: {
    color: 'white',
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
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  roomControls: {
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#9C27B0',
  },
  endButton: {
    backgroundColor: '#D32F2F',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  membersList: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  memberStatus: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  memberTask: {
    fontSize: 12,
    color: '#999999',
  },
  chatContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  messagesList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  messageItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageItemOwn: {
    backgroundColor: '#E3F2FD',
  },
  encouragementMessage: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 3,
    borderLeftColor: '#9C27B0',
  },
  achievementMessage: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  messageUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  encouragementText: {
    color: '#9C27B0',
    fontWeight: '500',
  },
  achievementText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 12,
    color: '#999999',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  encouragementContainer: {
    marginBottom: 16,
  },
  encouragementInput: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  encouragementButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  encouragementButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementContainer: {
    marginBottom: 16,
  },
  achievementInput: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  achievementButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  achievementButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  suggestionText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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
