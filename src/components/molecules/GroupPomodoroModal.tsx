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
import { useGroupPomodoroStore, GroupPomodoroSession, GroupMember } from '../../store/useGroupPomodoroStore';

interface GroupPomodoroModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GroupPomodoroModal: React.FC<GroupPomodoroModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    currentSession,
    availableSessions,
    mySessions,
    settings,
    loading,
    error,
    createSession,
    joinSession,
    leaveSession,
    startSession,
    endSession,
    sendMessage,
    loadSessions,
  } = useGroupPomodoroStore();

  const [activeTab, setActiveTab] = useState<'join' | 'create' | 'active'>('join');
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState(25);
  const [newMessage, setNewMessage] = useState('');
  const [selectedSession, setSelectedSession] = useState<GroupPomodoroSession | null>(null);

  useEffect(() => {
    if (visible) {
      loadSessions();
    }
  }, [visible, loadSessions]);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      Alert.alert('Hata', 'Lütfen oturum adı girin');
      return;
    }

    try {
      const sessionId = await createSession({
        name: newSessionName.trim(),
        description: newSessionDescription.trim(),
        maxMembers: settings.defaultMaxMembers,
        isActive: false,
        duration: newSessionDuration,
        currentPhase: 'waiting',
        settings: {
          pomodoroDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStart: false,
          soundEnabled: true,
          chatEnabled: true,
        },
      });

      if (sessionId) {
        Alert.alert('Başarılı', 'Oturum oluşturuldu');
        setNewSessionName('');
        setNewSessionDescription('');
        setActiveTab('active');
      }
    } catch (err) {
      Alert.alert('Hata', 'Oturum oluşturulamadı');
    }
  };

  const handleJoinSession = async (session: GroupPomodoroSession) => {
    try {
      const success = await joinSession(session.id, {
        name: 'You', // In real app, get from user profile
        isOnline: true,
      });

      if (success) {
        setSelectedSession(session);
        setActiveTab('active');
        Alert.alert('Başarılı', 'Oturuma katıldınız');
      }
    } catch (err) {
      Alert.alert('Hata', 'Oturuma katılamadınız');
    }
  };

  const handleStartSession = async () => {
    if (!selectedSession) return;

    try {
      const success = await startSession(selectedSession.id);
      if (success) {
        Alert.alert('Başarılı', 'Oturum başlatıldı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Oturum başlatılamadı');
    }
  };

  const handleEndSession = async () => {
    if (!selectedSession) return;

    try {
      const success = await endSession(selectedSession.id);
      if (success) {
        setSelectedSession(null);
        setActiveTab('join');
        Alert.alert('Başarılı', 'Oturum sonlandırıldı');
      }
    } catch (err) {
      Alert.alert('Hata', 'Oturum sonlandırılamadı');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSession) return;

    try {
      await sendMessage(selectedSession.id, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      Alert.alert('Hata', 'Mesaj gönderilemedi');
    }
  };

  const renderSessionItem = ({ item }: { item: GroupPomodoroSession }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.sessionDescription}>{item.description}</Text>
        )}
        <Text style={styles.sessionDetails}>
          {item.members.length}/{item.maxMembers} üye • {item.duration} dakika
        </Text>
      </View>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinSession(item)}
        disabled={item.members.length >= item.maxMembers}
      >
        <Text style={[
          styles.joinButtonText,
          item.members.length >= item.maxMembers && styles.joinButtonTextDisabled
        ]}>
          {item.members.length >= item.maxMembers ? 'Dolu' : 'Katıl'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMemberItem = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberStatus}>
          {item.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'} • {item.pomodoroCount} pomodoro
        </Text>
      </View>
    </View>
  );

  const renderMessageItem = ({ item }: { item: any }) => (
    <View style={[
      styles.messageItem,
      item.userId === 'current-user-id' && styles.messageItemOwn
    ]}>
      <Text style={styles.messageUserName}>{item.userName}</Text>
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Grup Pomodoroları</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'join' && styles.activeTab]}
            onPress={() => setActiveTab('join')}
          >
            <Text style={[styles.tabText, activeTab === 'join' && styles.activeTabText]}>
              Katıl
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

          {activeTab === 'join' && (
            <View>
              <Text style={styles.sectionTitle}>Mevcut Oturumlar</Text>
              <FlatList
                data={availableSessions}
                renderItem={renderSessionItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
              />
            </View>
          )}

          {activeTab === 'create' && (
            <View>
              <Text style={styles.sectionTitle}>Yeni Oturum Oluştur</Text>
              
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Oturum Adı"
                  value={newSessionName}
                  onChangeText={setNewSessionName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Açıklama (opsiyonel)"
                  value={newSessionDescription}
                  onChangeText={setNewSessionDescription}
                  multiline
                />
                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>Süre: {newSessionDuration} dakika</Text>
                  <View style={styles.durationButtons}>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() => setNewSessionDuration(Math.max(15, newSessionDuration - 5))}
                    >
                      <Text style={styles.durationButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.durationButton}
                      onPress={() => setNewSessionDuration(Math.min(60, newSessionDuration + 5))}
                    >
                      <Text style={styles.durationButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateSession}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.createButtonText}>Oturum Oluştur</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'active' && selectedSession && (
            <View>
              <Text style={styles.sectionTitle}>Aktif Oturum: {selectedSession.name}</Text>
              
              {/* Session Controls */}
              <View style={styles.sessionControls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    selectedSession.isActive ? styles.endButton : styles.startButton
                  ]}
                  onPress={selectedSession.isActive ? handleEndSession : handleStartSession}
                >
                  <Text style={styles.controlButtonText}>
                    {selectedSession.isActive ? 'Oturumu Sonlandır' : 'Oturumu Başlat'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Members */}
              <Text style={styles.subsectionTitle}>Üyeler ({selectedSession.members.length})</Text>
              <FlatList
                data={selectedSession.members}
                renderItem={renderMemberItem}
                keyExtractor={(item) => item.id}
                style={styles.membersList}
              />

              {/* Chat */}
              {selectedSession.settings.chatEnabled && (
                <View>
                  <Text style={styles.subsectionTitle}>Sohbet</Text>
                  <View style={styles.chatContainer}>
                    <FlatList
                      data={selectedSession.chat.messages}
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

              {/* Statistics */}
              <Text style={styles.subsectionTitle}>İstatistikler</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedSession.statistics.totalPomodoros}</Text>
                  <Text style={styles.statLabel}>Toplam Pomodoro</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedSession.statistics.totalFocusTime}</Text>
                  <Text style={styles.statLabel}>Odaklanma Süresi (dk)</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{selectedSession.statistics.completionRate.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>Tamamlanma Oranı</Text>
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
    fontSize: 14,
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
    color: '#333333',
    marginTop: 20,
    marginBottom: 12,
  },
  list: {
    marginBottom: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  sessionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 12,
    color: '#999999',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButtonTextDisabled: {
    color: '#CCCCCC',
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
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionControls: {
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#4CAF50',
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
