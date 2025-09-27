import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import TaskModal from '../components/molecules/TaskModal';
import LevelProgress from '../components/molecules/LevelProgress';
import BadgeShowcase from '../components/molecules/BadgeShowcase';
import OfflineStatus from '../components/molecules/OfflineStatus';
import { EnergyRecommendationsModal } from '../components/molecules/EnergyRecommendationsModal';
import { WeeklyReviewModal } from '../components/molecules/WeeklyReviewModal';
import { GroupPomodoroModal } from '../components/molecules/GroupPomodoroModal';
import { PairFocusModal } from '../components/molecules/PairFocusModal';
import { FocusRoomsModal } from '../components/molecules/FocusRoomsModal';
import { LeagueSystemModal } from '../components/molecules/LeagueSystemModal';
import { SocialChallengesModal } from '../components/molecules/SocialChallengesModal';
import { SmartDurationModal } from '../components/molecules/SmartDurationModal';
import { TaskSchedulingModal } from '../components/molecules/TaskSchedulingModal';
import { AdaptiveModeModal } from '../components/molecules/AdaptiveModeModal';
import { AICoachModal } from '../components/molecules/AICoachModal';
import { SmartSchedulingModal } from '../components/molecules/SmartSchedulingModal';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { tasks, dailyGoal, sessions, settings } = usePomodoroStore();
  const { formattedTime, isRunning, isBreak } = usePomodoroTimer();
  const [modalVisible, setModalVisible] = useState(false);
  const [energyModalVisible, setEnergyModalVisible] = useState(false);
  const [weeklyReviewModalVisible, setWeeklyReviewModalVisible] = useState(false);
  const [groupPomodoroModalVisible, setGroupPomodoroModalVisible] = useState(false);
  const [pairFocusModalVisible, setPairFocusModalVisible] = useState(false);
  const [focusRoomsModalVisible, setFocusRoomsModalVisible] = useState(false);
  const [leagueSystemModalVisible, setLeagueSystemModalVisible] = useState(false);
  const [socialChallengesModalVisible, setSocialChallengesModalVisible] = useState(false);
  const [smartDurationModalVisible, setSmartDurationModalVisible] = useState(false);
  const [taskSchedulingModalVisible, setTaskSchedulingModalVisible] = useState(false);
  const [adaptiveModeModalVisible, setAdaptiveModeModalVisible] = useState(false);
  const [aiCoachModalVisible, setAICoachModalVisible] = useState(false);
  const [smartSchedulingModalVisible, setSmartSchedulingModalVisible] = useState(false);

  const handleStartPomodoro = () => {
    navigation.navigate('Timer');
  };

  const handleAddTask = () => {
    setModalVisible(true);
  };

  // Calculate daily progress
  const today = new Date().toDateString();
  const todaySessions = (sessions || []).filter(session => 
    session && session.startTime && session.startTime.toDateString() === today && session.isCompleted
  );
  const completedPomodoros = todaySessions.length;
  const progressPercentage = dailyGoal > 0 ? (completedPomodoros / dailyGoal) * 100 : 0;

  // Get today's tasks
  const todayTasks = (tasks || []).filter(task => task && !task.isCompleted).slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pomodoro+</Text>
          <Text style={styles.subtitle}>Bugün odaklanmaya hazır mısın?</Text>
        </View>

        {/* Offline Status */}
        <OfflineStatus />

        {/* Gamification */}
        <LevelProgress />
        <BadgeShowcase />

        {/* Daily Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Günlük İlerleme</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {completedPomodoros} / {dailyGoal} Pomodoro
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
          </View>
        </View>

        {/* Pomodoro Timer */}
        <View style={styles.timerCard}>
          <Text style={styles.cardTitle}>Pomodoro Timer</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {isRunning ? formattedTime : `${settings.pomodoroDuration}:00`}
            </Text>
            <TouchableOpacity 
              style={[styles.startButton, isRunning && styles.pauseButton]}
              onPress={handleStartPomodoro}
            >
              <Text style={styles.startButtonText}>
                {isRunning ? (isBreak ? 'Mola Devam' : 'Pomodoro Devam') : 'Başlat'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Energy Recommendations */}
        <View style={styles.energyCard}>
          <Text style={styles.cardTitle}>Enerji Önerileri</Text>
          <Text style={styles.energySubtitle}>
            Enerji seviyenize göre özel öneriler
          </Text>
          <TouchableOpacity 
            style={styles.energyButton}
            onPress={() => setEnergyModalVisible(true)}
          >
            <Text style={styles.energyButtonText}>
              🔋 Enerji Analizi & Öneriler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Review */}
        <View style={styles.weeklyReviewCard}>
          <Text style={styles.cardTitle}>Haftalık Değerlendirme</Text>
          <Text style={styles.weeklyReviewSubtitle}>
            AI destekli haftalık analiz ve öneriler
          </Text>
          <TouchableOpacity 
            style={styles.weeklyReviewButton}
            onPress={() => setWeeklyReviewModalVisible(true)}
          >
            <Text style={styles.weeklyReviewButtonText}>
              📊 Haftalık Analiz & Değerlendirme
            </Text>
          </TouchableOpacity>
        </View>

        {/* Group Pomodoros */}
        <View style={styles.groupPomodoroCard}>
          <Text style={styles.cardTitle}>Grup Pomodoroları</Text>
          <Text style={styles.groupPomodoroSubtitle}>
            Arkadaşlarınızla birlikte odaklanın
          </Text>
          <TouchableOpacity 
            style={styles.groupPomodoroButton}
            onPress={() => setGroupPomodoroModalVisible(true)}
          >
            <Text style={styles.groupPomodoroButtonText}>
              👥 Grup Seansları
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pair Focus */}
        <View style={styles.pairFocusCard}>
          <Text style={styles.cardTitle}>Pair Focus</Text>
          <Text style={styles.pairFocusSubtitle}>
            İkili çalışma seansları ile odaklanın
          </Text>
          <TouchableOpacity 
            style={styles.pairFocusButton}
            onPress={() => setPairFocusModalVisible(true)}
          >
            <Text style={styles.pairFocusButtonText}>
              🤝 Pair Focus
            </Text>
          </TouchableOpacity>
        </View>

        {/* Focus Rooms */}
        <View style={styles.focusRoomsCard}>
          <Text style={styles.cardTitle}>Focus Rooms</Text>
          <Text style={styles.focusRoomsSubtitle}>
            Sanal odalar ile birlikte odaklanın
          </Text>
          <TouchableOpacity 
            style={styles.focusRoomsButton}
            onPress={() => setFocusRoomsModalVisible(true)}
          >
            <Text style={styles.focusRoomsButtonText}>
              🏠 Focus Rooms
            </Text>
          </TouchableOpacity>
        </View>

        {/* League System */}
        <View style={styles.leagueSystemCard}>
          <Text style={styles.cardTitle}>Lig Sistemi</Text>
          <Text style={styles.leagueSystemSubtitle}>
            Rekabetçi gamification ile odaklanın
          </Text>
          <TouchableOpacity 
            style={styles.leagueSystemButton}
            onPress={() => setLeagueSystemModalVisible(true)}
          >
            <Text style={styles.leagueSystemButtonText}>
              🏆 Lig Sistemi
            </Text>
          </TouchableOpacity>
        </View>

        {/* Social Challenges */}
        <View style={styles.socialChallengesCard}>
          <Text style={styles.cardTitle}>Social Challenges</Text>
          <Text style={styles.socialChallengesSubtitle}>
            Topluluk yarışmaları ile motive olun
          </Text>
          <TouchableOpacity 
            style={styles.socialChallengesButton}
            onPress={() => setSocialChallengesModalVisible(true)}
          >
            <Text style={styles.socialChallengesButtonText}>
              🎯 Social Challenges
            </Text>
          </TouchableOpacity>
        </View>

        {/* Smart Duration */}
        <View style={styles.smartDurationCard}>
          <Text style={styles.cardTitle}>Akıllı Süre Önerileri</Text>
          <Text style={styles.smartDurationSubtitle}>
            AI destekli optimal süre önerileri
          </Text>
          <TouchableOpacity 
            style={styles.smartDurationButton}
            onPress={() => setSmartDurationModalVisible(true)}
          >
            <Text style={styles.smartDurationButtonText}>
              🤖 Akıllı Süre
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task Scheduling */}
        <View style={styles.taskSchedulingCard}>
          <Text style={styles.cardTitle}>Görev Zamanlama</Text>
          <Text style={styles.taskSchedulingSubtitle}>
            AI destekli optimal zamanlama önerileri
          </Text>
          <TouchableOpacity 
            style={styles.taskSchedulingButton}
            onPress={() => setTaskSchedulingModalVisible(true)}
          >
            <Text style={styles.taskSchedulingButtonText}>
              📅 Görev Zamanlama
            </Text>
          </TouchableOpacity>
        </View>

        {/* Adaptive Mode */}
        <View style={styles.adaptiveModeCard}>
          <Text style={styles.cardTitle}>Adaptif Mod</Text>
          <Text style={styles.adaptiveModeSubtitle}>
            Alışkanlıklarınıza göre uyarlanan deneyim
          </Text>
          <TouchableOpacity 
            style={styles.adaptiveModeButton}
            onPress={() => setAdaptiveModeModalVisible(true)}
          >
            <Text style={styles.adaptiveModeButtonText}>
              🧠 Adaptif Mod
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Coach */}
        <View style={styles.aiCoachCard}>
          <Text style={styles.cardTitle}>AI Koç</Text>
          <Text style={styles.aiCoachSubtitle}>
            Kişiselleştirilmiş koçluk ve motivasyon
          </Text>
          <TouchableOpacity 
            style={styles.aiCoachButton}
            onPress={() => setAICoachModalVisible(true)}
          >
            <Text style={styles.aiCoachButtonText}>
              🤖 AI Koç
            </Text>
          </TouchableOpacity>
        </View>

        {/* Smart Scheduling */}
        <View style={styles.smartSchedulingCard}>
          <Text style={styles.cardTitle}>Akıllı Zamanlama</Text>
          <Text style={styles.smartSchedulingSubtitle}>
            AI destekli otomatik zamanlama ve optimizasyon
          </Text>
          <TouchableOpacity 
            style={styles.smartSchedulingButton}
            onPress={() => setSmartSchedulingModalVisible(true)}
          >
            <Text style={styles.smartSchedulingButtonText}>
              📅 Akıllı Zamanlama
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Tasks */}
        <View style={styles.tasksCard}>
          <View style={styles.tasksHeader}>
            <Text style={styles.cardTitle}>Bugünün Görevleri</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.taskList}>
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <Text style={styles.taskText}>{task.title}</Text>
                  <Text style={styles.taskPomodoros}>
                    {task.completedPomodoros}/{task.estimatedPomodoros} pomodoro
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyTasksText}>Henüz görev eklenmemiş</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <TaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        task={null}
        mode="create"
      />
      
      <EnergyRecommendationsModal
        visible={energyModalVisible}
        onClose={() => setEnergyModalVisible(false)}
      />
      
      <WeeklyReviewModal
        visible={weeklyReviewModalVisible}
        onClose={() => setWeeklyReviewModalVisible(false)}
      />

      <GroupPomodoroModal
        visible={groupPomodoroModalVisible}
        onClose={() => setGroupPomodoroModalVisible(false)}
      />

      <PairFocusModal
        visible={pairFocusModalVisible}
        onClose={() => setPairFocusModalVisible(false)}
      />

      <FocusRoomsModal
        visible={focusRoomsModalVisible}
        onClose={() => setFocusRoomsModalVisible(false)}
      />

      <LeagueSystemModal
        visible={leagueSystemModalVisible}
        onClose={() => setLeagueSystemModalVisible(false)}
      />

      <SocialChallengesModal
        visible={socialChallengesModalVisible}
        onClose={() => setSocialChallengesModalVisible(false)}
      />

      <SmartDurationModal
        visible={smartDurationModalVisible}
        onClose={() => setSmartDurationModalVisible(false)}
      />

      <TaskSchedulingModal
        visible={taskSchedulingModalVisible}
        onClose={() => setTaskSchedulingModalVisible(false)}
      />

      <AdaptiveModeModal
        visible={adaptiveModeModalVisible}
        onClose={() => setAdaptiveModeModalVisible(false)}
      />

      <AICoachModal
        visible={aiCoachModalVisible}
        onClose={() => setAICoachModalVisible(false)}
      />

      <SmartSchedulingModal
        visible={smartSchedulingModalVisible}
        onClose={() => setSmartSchedulingModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  timerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  emptyTasksText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  tasksCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  taskText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  taskPomodoros: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  energyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  energySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  energyButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  energyButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  weeklyReviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weeklyReviewSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  weeklyReviewButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  weeklyReviewButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  groupPomodoroCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupPomodoroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  groupPomodoroButton: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#8E24AA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  groupPomodoroButtonText: {
    fontSize: 16,
    color: '#8E24AA',
    fontWeight: '600',
  },
  pairFocusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pairFocusSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  pairFocusButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pairFocusButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  focusRoomsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  focusRoomsSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  focusRoomsButton: {
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9C27B0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  focusRoomsButtonText: {
    fontSize: 16,
    color: '#9C27B0',
    fontWeight: '600',
  },
  leagueSystemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leagueSystemSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  leagueSystemButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  leagueSystemButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  socialChallengesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialChallengesSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  socialChallengesButton: {
    backgroundColor: '#FCE4EC',
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  socialChallengesButtonText: {
    fontSize: 16,
    color: '#E91E63',
    fontWeight: '600',
  },
  smartDurationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smartDurationSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  smartDurationButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  smartDurationButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  taskSchedulingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskSchedulingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  taskSchedulingButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  taskSchedulingButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  adaptiveModeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adaptiveModeSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  adaptiveModeButton: {
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#9C27B0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  adaptiveModeButtonText: {
    fontSize: 16,
    color: '#9C27B0',
    fontWeight: '600',
  },
  aiCoachCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiCoachSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  aiCoachButton: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FF5722',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  aiCoachButtonText: {
    fontSize: 16,
    color: '#FF5722',
    fontWeight: '600',
  },
  smartSchedulingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smartSchedulingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 15,
  },
  smartSchedulingButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  smartSchedulingButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default DashboardScreen;
