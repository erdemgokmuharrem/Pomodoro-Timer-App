import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { useSoundStore } from '../store/useSoundStore';
import { useAutoReschedule } from '../hooks/useAutoReschedule';
import InterruptionModal from '../components/molecules/InterruptionModal';
import SoundSelectionModal from '../components/molecules/SoundSelectionModal';
import { AutoRescheduleModal } from '../components/molecules/AutoRescheduleModal';
import { BreakGuideModal } from '../components/molecules/BreakGuideModal';

type TimerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Timer'
>;

const TimerScreen = () => {
  const navigation = useNavigation<TimerScreenNavigationProp>();
  const {
    isRunning,
    timeLeft,
    isBreak,
    formattedTime,
    progress,
    statusText,
    backgroundColor,
    start,
    pause,
    stop,
    startBreak,
  } = usePomodoroTimer();

  const { currentTask, settings, currentSession } = usePomodoroStore();
  const { settings: soundSettings, toggleBackgroundSound } = useSoundStore();
  const {
    settings: autoRescheduleSettings,
    energyLevel,
    consecutivePomodoros,
    getEnergyRecommendations,
    getSmartTaskSuggestions,
    handlePomodoroComplete,
    handleBreakComplete,
  } = useAutoReschedule();

  // Null check for sound settings
  const safeSoundSettings = soundSettings || {
    backgroundSound: null,
    backgroundVolume: 0.3,
    soundEffectsEnabled: true,
    backgroundSoundEnabled: false,
  };
  const [interruptionModalVisible, setInterruptionModalVisible] =
    useState(false);
  const [soundModalVisible, setSoundModalVisible] = useState(false);
  const [autoRescheduleModalVisible, setAutoRescheduleModalVisible] =
    useState(false);
  const [breakGuideModalVisible, setBreakGuideModalVisible] = useState(false);

  // Handle timer completion with alerts
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      if (isBreak) {
        Alert.alert(
          'Mola Bitti!',
          'Mola süreniz tamamlandı. Yeni pomodoro başlatmaya hazır mısınız?',
          [
            { text: 'Yeni Pomodoro', onPress: () => start() },
            { text: 'Ana Sayfa', onPress: () => navigation.goBack() },
          ]
        );
      } else {
        Alert.alert(
          'Pomodoro Tamamlandı! 🎉',
          `${settings.pomodoroDuration} dakikalık odaklanma süreniz bitti. ${settings.shortBreakDuration} dakikalık mola zamanı!`,
          [
            { text: 'Mola Başlat', onPress: () => startBreak() },
            { text: 'İptal', onPress: () => navigation.goBack() },
          ]
        );
      }
    }
  }, [timeLeft, isRunning, isBreak, start, startBreak, navigation, settings]);

  const handleStartPause = () => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const handleStop = () => {
    Alert.alert(
      'Pomodoro Durdur',
      "Bu pomodoro'yu durdurmak istediğinizden emin misiniz?",
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Durdur',
          style: 'destructive',
          onPress: () => {
            stop();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleFinishEarly = () => {
    Alert.alert(
      'Erken Bitir',
      "Bu pomodoro'yu erken bitirmek istediğinizden emin misiniz?",
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bitir',
          onPress: () => {
            pause();
            // Force complete by setting time to 0
            // This will trigger the completion logic
          },
        },
      ]
    );
  };

  const handleInterruption = () => {
    if (!currentSession) return;
    setInterruptionModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        {/* Status */}
        <Text style={styles.statusText}>{statusText}</Text>

        {/* Task Name */}
        <Text style={styles.taskName}>
          {currentTask?.title || 'Görev seçilmedi'}
        </Text>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text
            style={styles.timerText}
            accessibilityRole="timer"
            accessibilityLabel={`${isBreak ? 'Mola' : 'Pomodoro'} süresi: ${formattedTime}`}
            accessibilityLiveRegion="assertive"
          >
            {formattedTime}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.secondaryButton]}
            onPress={handleStop}
          >
            <Text style={styles.secondaryButtonText}>Durdur</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.primaryButton]}
            onPress={handleStartPause}
            accessibilityRole="button"
            accessibilityLabel={
              isRunning ? "Pomodoro'yu duraklat" : "Pomodoro'yu başlat"
            }
            accessibilityHint={
              isRunning ? 'Duraklatmak için dokunun' : 'Başlatmak için dokunun'
            }
          >
            <Text style={styles.primaryButtonText}>
              {isRunning ? 'Duraklat' : 'Başlat'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.secondaryButton]}
            onPress={handleFinishEarly}
          >
            <Text style={styles.secondaryButtonText}>Erken Bitir</Text>
          </TouchableOpacity>
        </View>

        {/* Auto Reschedule Info */}
        {autoRescheduleSettings.enabled && (
          <View style={styles.autoRescheduleInfo}>
            <Text style={styles.autoRescheduleText}>
              🤖 Otomatik:{' '}
              {energyLevel.level === 'high'
                ? 'Yüksek enerji'
                : energyLevel.level === 'low'
                  ? 'Düşük enerji'
                  : 'Orta enerji'}
            </Text>
            <Text style={styles.autoRescheduleSubText}>
              Ardışık: {consecutivePomodoros} pomodoro
            </Text>
          </View>
        )}

        {/* Sound and Interruption Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.soundButton}
            onPress={() => setSoundModalVisible(true)}
          >
            <Text style={styles.soundButtonText}>
              {safeSoundSettings.backgroundSound
                ? safeSoundSettings.backgroundSound.emoji
                : '🔇'}
              {safeSoundSettings.backgroundSound
                ? safeSoundSettings.backgroundSound.name
                : 'Ses Seç'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.autoRescheduleButton}
            onPress={() => setAutoRescheduleModalVisible(true)}
          >
            <Text style={styles.autoRescheduleButtonText}>
              🤖 Otomatik Planlama
            </Text>
          </TouchableOpacity>

          {isBreak && (
            <TouchableOpacity
              style={styles.breakGuideButton}
              onPress={() => setBreakGuideModalVisible(true)}
            >
              <Text style={styles.breakGuideButtonText}>🧘 Mola Rehberi</Text>
            </TouchableOpacity>
          )}

          {isRunning && !isBreak && (
            <TouchableOpacity
              style={styles.interruptionButton}
              onPress={handleInterruption}
            >
              <Text style={styles.interruptionButtonText}>
                ⚠️ Kesinti Kaydet
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <InterruptionModal
        visible={interruptionModalVisible}
        onClose={() => setInterruptionModalVisible(false)}
        sessionId={currentSession?.id || ''}
      />

      <SoundSelectionModal
        visible={soundModalVisible}
        onClose={() => setSoundModalVisible(false)}
      />

      <AutoRescheduleModal
        visible={autoRescheduleModalVisible}
        onClose={() => setAutoRescheduleModalVisible(false)}
      />

      <BreakGuideModal
        visible={breakGuideModalVisible}
        onClose={() => setBreakGuideModalVisible(false)}
        availableTime={isBreak ? settings.shortBreakDuration || 5 : 5}
        energyLevel={energyLevel.level}
        mood="neutral"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.9,
  },
  taskName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  timerContainer: {
    marginBottom: 60,
  },
  timerText: {
    fontSize: 72,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  controlButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: 'white',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    justifyContent: 'center',
  },
  soundButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    maxWidth: 200,
  },
  soundButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  interruptionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    maxWidth: 200,
  },
  interruptionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  autoRescheduleInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  autoRescheduleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  autoRescheduleSubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  autoRescheduleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    maxWidth: 200,
  },
  autoRescheduleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  breakGuideButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    maxWidth: 200,
  },
  breakGuideButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TimerScreen;
