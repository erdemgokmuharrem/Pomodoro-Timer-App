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

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { tasks, dailyGoal, sessions, settings } = usePomodoroStore();
  const { formattedTime, isRunning, isBreak } = usePomodoroTimer();
  const [modalVisible, setModalVisible] = useState(false);

  const handleStartPomodoro = () => {
    navigation.navigate('Timer');
  };

  const handleAddTask = () => {
    setModalVisible(true);
  };

  // Calculate daily progress
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(session => 
    session.startTime.toDateString() === today && session.isCompleted
  );
  const completedPomodoros = todaySessions.length;
  const progressPercentage = (completedPomodoros / dailyGoal) * 100;

  // Get today's tasks
  const todayTasks = tasks.filter(task => !task.isCompleted).slice(0, 3);

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
});

export default DashboardScreen;
