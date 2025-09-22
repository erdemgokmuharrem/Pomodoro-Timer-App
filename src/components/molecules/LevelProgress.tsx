import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGamification } from '../../hooks/useGamification';
import Card from '../atoms/Card';

const LevelProgress: React.FC = () => {
  const { userStats, getProgressToNextLevel } = useGamification();
  const progress = getProgressToNextLevel();

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.levelInfo}>
          <Text style={styles.levelText}>Level {userStats.level}</Text>
          <Text style={styles.xpText}>{userStats.totalXp} XP</Text>
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakText}>🔥 {userStats.currentStreak}</Text>
          <Text style={styles.streakLabel}>gün seri</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress.percentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {progress.current} / {progress.next} XP
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    alignItems: 'flex-start',
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  xpText: {
    fontSize: 14,
    color: '#64748B',
  },
  streakInfo: {
    alignItems: 'flex-end',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  streakLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
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
  progressText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default LevelProgress;
