import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isHighContrastEnabled: boolean;
  isReduceMotionEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'auto';
}

export const useAccessibility = () => {
  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings>({
      isScreenReaderEnabled: false,
      isHighContrastEnabled: false,
      isReduceMotionEnabled: false,
      fontSize: 'medium',
      colorScheme: 'auto',
    });

  useEffect(() => {
    // Check initial accessibility state
    const checkAccessibilityState = async () => {
      try {
        const isScreenReaderEnabled =
          await AccessibilityInfo.isScreenReaderEnabled();
        const isHighContrastEnabled =
          await AccessibilityInfo.isHighTextContrastEnabled();
        const isReduceMotionEnabled =
          await AccessibilityInfo.isReduceMotionEnabled();

        setAccessibilitySettings(prev => ({
          ...prev,
          isScreenReaderEnabled,
          isHighContrastEnabled,
          isReduceMotionEnabled,
        }));
      } catch (error) {
        console.error('Error checking accessibility state:', error);
      }
    };

    checkAccessibilityState();

    // Listen for accessibility changes
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      isScreenReaderEnabled => {
        setAccessibilitySettings(prev => ({
          ...prev,
          isScreenReaderEnabled,
        }));
      }
    );

    // Note: highContrastChanged event is not available in React Native
    // We'll check this state periodically instead

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      isReduceMotionEnabled => {
        setAccessibilitySettings(prev => ({
          ...prev,
          isReduceMotionEnabled,
        }));
      }
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  const updateFontSize = (fontSize: AccessibilitySettings['fontSize']) => {
    setAccessibilitySettings(prev => ({ ...prev, fontSize }));
  };

  const updateColorScheme = (
    colorScheme: AccessibilitySettings['colorScheme']
  ) => {
    setAccessibilitySettings(prev => ({ ...prev, colorScheme }));
  };

  const getFontSizeMultiplier = () => {
    switch (accessibilitySettings.fontSize) {
      case 'small':
        return 0.9;
      case 'medium':
        return 1.0;
      case 'large':
        return 1.1;
      case 'extra-large':
        return 1.2;
      default:
        return 1.0;
    }
  };

  const getAccessibilityProps = (label?: string, hint?: string) => {
    const props: any = {};

    if (label) {
      props.accessibilityLabel = label;
    }

    if (hint) {
      props.accessibilityHint = hint;
    }

    if (accessibilitySettings.isScreenReaderEnabled) {
      props.accessibilityRole = 'button';
    }

    return props;
  };

  const getTimerAccessibilityProps = (
    timeLeft: number,
    isRunning: boolean,
    isBreak: boolean
  ) => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeText = `${minutes} dakika ${seconds} saniye`;
    const statusText = isBreak ? 'mola' : 'odaklanma';
    const runningText = isRunning ? 'çalışıyor' : 'durduruldu';

    return {
      accessibilityLabel: `${statusText} zamanı ${timeText} kaldı, ${runningText}`,
      accessibilityHint: isRunning
        ? 'Timer çalışıyor. Duraklatmak için dokunun.'
        : 'Timer durduruldu. Başlatmak için dokunun.',
      accessibilityRole: 'button' as const,
    };
  };

  const getTaskAccessibilityProps = (task: any) => {
    const progressText = `${task.completedPomodoros} bölüm ${task.estimatedPomodoros} bölümden tamamlandı`;
    const statusText = task.isCompleted ? 'tamamlandı' : 'devam ediyor';

    return {
      accessibilityLabel: `${task.title}, ${progressText}, ${statusText}`,
      accessibilityHint: 'Görevi düzenlemek için dokunun',
      accessibilityRole: 'button' as const,
    };
  };

  const getButtonAccessibilityProps = (label: string, hint?: string) => {
    return {
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: 'button' as const,
    };
  };

  const getCardAccessibilityProps = (title: string, content?: string) => {
    return {
      accessibilityLabel: title,
      accessibilityHint: content,
      accessibilityRole: 'summary' as const,
    };
  };

  const getProgressAccessibilityProps = (
    current: number,
    total: number,
    label: string
  ) => {
    const percentage = Math.round((current / total) * 100);
    return {
      accessibilityLabel: `${label}, ${current} bölüm ${total} bölümden tamamlandı, %${percentage}`,
      accessibilityRole: 'progressbar' as const,
      accessibilityValue: {
        min: 0,
        max: total,
        now: current,
        text: `${percentage}%`,
      },
    };
  };

  const announceForAccessibility = (message: string) => {
    if (accessibilitySettings.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const getHighContrastColors = () => {
    if (accessibilitySettings.isHighContrastEnabled) {
      return {
        primary: '#000000',
        secondary: '#FFFFFF',
        background: '#FFFFFF',
        surface: '#F5F5F5',
        text: '#000000',
        textSecondary: '#333333',
        border: '#000000',
        success: '#006600',
        warning: '#CC6600',
        error: '#CC0000',
      };
    }
    return null;
  };

  const getDynamicFontSize = (baseSize: number) => {
    return Math.round(baseSize * getFontSizeMultiplier());
  };

  const shouldReduceMotion = () => {
    return accessibilitySettings.isReduceMotionEnabled;
  };

  return {
    accessibilitySettings,
    updateFontSize,
    updateColorScheme,
    getFontSizeMultiplier,
    getAccessibilityProps,
    getTimerAccessibilityProps,
    getTaskAccessibilityProps,
    getButtonAccessibilityProps,
    getCardAccessibilityProps,
    getProgressAccessibilityProps,
    announceForAccessibility,
    getHighContrastColors,
    getDynamicFontSize,
    shouldReduceMotion,
  };
};
