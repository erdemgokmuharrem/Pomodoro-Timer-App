import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStatistics } from '../hooks/useStatistics';

const StatisticsScreen = () => {
  const { dailyStats, weeklyStats, taskStats, focusScore, productivityTrend } = useStatistics();

  const getBarHeight = (value: number, max: number) => {
    return max > 0 ? (value / max) * 100 : 0;
  };

  const maxPomodoros = Math.max(...dailyStats.map(stat => stat.pomodoros), 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>İstatistikler</Text>
          <Text style={styles.subtitle}>Bu haftaki performansınız</Text>
        </View>

        {/* Weekly Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Haftalık Özet</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{weeklyStats.totalPomodoros}</Text>
              <Text style={styles.overviewLabel}>Toplam Pomodoro</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{weeklyStats.totalHours.toFixed(1)}h</Text>
              <Text style={styles.overviewLabel}>Toplam Süre</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{weeklyStats.averagePerDay.toFixed(1)}</Text>
              <Text style={styles.overviewLabel}>Günlük Ortalama</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{weeklyStats.currentStreak}</Text>
              <Text style={styles.overviewLabel}>Mevcut Seri</Text>
            </View>
          </View>
        </View>

        {/* Daily Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Günlük Dağılım</Text>
          <View style={styles.chartContainer}>
            {dailyStats.map((stat, index) => (
              <View key={index} style={styles.chartBar}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: getBarHeight(stat.pomodoros, maxPomodoros),
                      backgroundColor: stat.pomodoros > 0 ? '#3B82F6' : '#E2E8F0'
                    }
                  ]} 
                />
                <Text style={styles.barLabel}>{stat.date}</Text>
                <Text style={styles.barValue}>{stat.pomodoros}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Task Distribution */}
        <View style={styles.taskCard}>
          <Text style={styles.cardTitle}>Görev Dağılımı</Text>
          <View style={styles.taskList}>
            {taskStats.length > 0 ? (
              taskStats.map((task, index) => (
                <View key={index} style={styles.taskItem}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName}>{task.taskName}</Text>
                    <Text style={styles.taskPomodoros}>{task.pomodoros} pomodoro</Text>
                  </View>
                  <View style={styles.taskProgress}>
                    <View style={styles.taskProgressBar}>
                      <View 
                        style={[
                          styles.taskProgressFill, 
                          { width: `${task.percentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.taskPercentage}>{task.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Henüz tamamlanan görev yok</Text>
            )}
          </View>
        </View>

        {/* Focus Score */}
        <View style={styles.focusCard}>
          <Text style={styles.cardTitle}>Focus Score</Text>
          <View style={styles.focusContainer}>
            <View style={styles.focusScore}>
              <Text style={styles.focusScoreValue}>{focusScore}</Text>
              <Text style={styles.focusScoreLabel}>/ 100</Text>
            </View>
            <Text style={styles.focusDescription}>
              {focusScore >= 80 ? 'Mükemmel odaklanma! 🎯' :
               focusScore >= 60 ? 'İyi performans! 👍' :
               focusScore >= 40 ? 'Gelişim alanı var 📈' :
               'Daha fazla odaklanmaya ihtiyaç var 💪'}
            </Text>
          </View>
        </View>

        {/* Streak Info */}
        <View style={styles.streakCard}>
          <Text style={styles.cardTitle}>Seri Bilgileri</Text>
          <View style={styles.streakInfo}>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{weeklyStats.currentStreak}</Text>
              <Text style={styles.streakLabel}>Mevcut Seri</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>{weeklyStats.longestStreak}</Text>
              <Text style={styles.streakLabel}>En Uzun Seri</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  overviewCard: {
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
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  chartCard: {
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
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: '100%',
    minHeight: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
  },
  taskCard: {
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
  taskList: {
    gap: 12,
  },
  taskItem: {
    gap: 8,
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskName: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  taskPomodoros: {
    fontSize: 12,
    color: '#64748B',
  },
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  taskPercentage: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    minWidth: 30,
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  focusCard: {
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
  focusContainer: {
    alignItems: 'center',
  },
  focusScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  focusScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  focusScoreLabel: {
    fontSize: 24,
    color: '#64748B',
    marginLeft: 4,
  },
  focusDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default StatisticsScreen;
