import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useGamificationStore } from '../../store/useGamificationStore';
import Card from '../atoms/Card';

const LevelProgress: React.FC = () => {
  const { level, xp, xpToNextLevel, totalXp } = useGamificationStore();
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const progressPercentage = xpToNextLevel > 0 ? (xp / xpToNextLevel) * 100 : 0;

  return (
    <>
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Seviye {level}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.xpText}>{totalXp} XP</Text>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setHelpModalVisible(true)}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progressPercentage, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {xp} / {xpToNextLevel} XP
          </Text>
        </View>
      </Card>

      {/* Help Modal */}
      <Modal
        visible={helpModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>XP Nasıl Kazanılır? 🎯</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setHelpModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.xpMethod}>
              <Text style={styles.xpMethodTitle}>🍅 Pomodoro Tamamlama</Text>
              <Text style={styles.xpMethodDescription}>
                Her pomodoro tamamladığınızda{' '}
                <Text style={styles.xpAmount}>+25 XP</Text> kazanırsınız.
              </Text>
            </View>

            <View style={styles.xpMethod}>
              <Text style={styles.xpMethodTitle}>✅ Görev Tamamlama</Text>
              <Text style={styles.xpMethodDescription}>
                Her görev tamamladığınızda{' '}
                <Text style={styles.xpAmount}>+10 XP</Text> kazanırsınız.
              </Text>
            </View>

            <View style={styles.xpMethod}>
              <Text style={styles.xpMethodTitle}>🔥 Streak Bonusu</Text>
              <Text style={styles.xpMethodDescription}>
                Günlük streak'iniz için ekstra{' '}
                <Text style={styles.xpAmount}>+5 XP/gün</Text> kazanırsınız.
              </Text>
            </View>

            <View style={styles.xpMethod}>
              <Text style={styles.xpMethodTitle}>🏆 Rozet Açma</Text>
              <Text style={styles.xpMethodDescription}>
                Yeni rozetler açtığınızda{' '}
                <Text style={styles.xpAmount}>+50-500 XP</Text> kazanırsınız.
              </Text>
            </View>

            <View style={styles.xpMethod}>
              <Text style={styles.xpMethodTitle}>🧠 Odaklanma Bonusu</Text>
              <Text style={styles.xpMethodDescription}>
                Yüksek odaklanma skorları için ekstra{' '}
                <Text style={styles.xpAmount}>+10-50 XP</Text> kazanırsınız.
              </Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 İpucu</Text>
              <Text style={styles.tipText}>
                Düzenli olarak pomodoro yaparak hem seviyenizi yükseltin hem de
                odaklanma alışkanlığınızı güçlendirin!
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  helpButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: 'bold',
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  xpMethod: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  xpMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  xpMethodDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  xpAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  tipCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default LevelProgress;
