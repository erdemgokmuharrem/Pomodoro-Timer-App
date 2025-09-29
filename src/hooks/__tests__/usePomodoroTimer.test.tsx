import { renderHook, act } from '@testing-library/react-native';
import { usePomodoroTimer } from '../usePomodoroTimer';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { useNotifications } from '../useNotifications';
import { useSound } from '../useSound';
import { useGamification } from '../useGamification';

// Mock dependencies
jest.mock('../../store/usePomodoroStore');
jest.mock('../useNotifications');
jest.mock('../useSound');
jest.mock('../useGamification');

const mockUsePomodoroStore = usePomodoroStore as jest.MockedFunction<
  typeof usePomodoroStore
>;
const mockUseNotifications = useNotifications as jest.MockedFunction<
  typeof useNotifications
>;
const mockUseSound = useSound as jest.MockedFunction<typeof useSound>;
const mockUseGamification = useGamification as jest.MockedFunction<
  typeof useGamification
>;

describe('usePomodoroTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store
    mockUsePomodoroStore.mockReturnValue({
      isRunning: false,
      timeLeft: 1500, // 25 minutes
      isBreak: false,
      currentSession: null,
      settings: {
        pomodoroDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        notificationsEnabled: true,
        longBreakInterval: 4,
      },
      tick: jest.fn(),
      startPomodoro: jest.fn(),
      pausePomodoro: jest.fn(),
      stopPomodoro: jest.fn(),
      completePomodoro: jest.fn(),
      startBreak: jest.fn(),
      completeBreak: jest.fn(),
    });

    // Mock notifications
    mockUseNotifications.mockReturnValue({
      schedulePomodoroNotification: jest.fn(),
      scheduleBreakNotification: jest.fn(),
      sendLocalNotification: jest.fn(),
      cancelAllNotifications: jest.fn(),
    });

    // Mock sound
    mockUseSound.mockReturnValue({
      playPomodoroComplete: jest.fn(),
      playBreakComplete: jest.fn(),
      playTick: jest.fn(),
      playStart: jest.fn(),
      playPause: jest.fn(),
      playBackgroundSound: jest.fn(),
      stopBackgroundSound: jest.fn(),
    });

    // Mock gamification
    mockUseGamification.mockReturnValue({
      awardPomodoroXp: jest.fn(),
      awardTaskXp: jest.fn(),
      awardStreakXp: jest.fn(),
      awardFocusXp: jest.fn(),
      updateStreak: jest.fn(),
      checkBadges: jest.fn(),
      checkAchievements: jest.fn(),
      unlockBadge: jest.fn(),
      unlockAchievement: jest.fn(),
      getLevelProgress: jest.fn(),
      getAvailableBadges: jest.fn(),
      getUnlockedBadges: jest.fn(),
    });
  });

  it('returns correct initial state', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.timeLeft).toBe(1500);
    expect(result.current.isBreak).toBe(false);
    expect(result.current.formattedTime).toBe('25:00');
    expect(result.current.progress).toBe(0);
  });

  it('formats time correctly', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    expect(result.current.formatTime(1500)).toBe('25:00');
    expect(result.current.formatTime(3661)).toBe('61:01');
    expect(result.current.formatTime(59)).toBe('00:59');
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() => usePomodoroTimer());

    // 25 minutes = 1500 seconds
    // 5 minutes passed = 1200 seconds left
    mockUsePomodoroStore.mockReturnValue({
      ...mockUsePomodoroStore(),
      timeLeft: 1200,
    });

    const { result: updatedResult } = renderHook(() => usePomodoroTimer());
    expect(updatedResult.current.progress).toBe(20); // 5/25 * 100
  });

  it('handles start action correctly', async () => {
    const mockStartPomodoro = jest.fn();
    const mockScheduleNotification = jest.fn();
    const mockPlayStart = jest.fn();

    mockUsePomodoroStore.mockReturnValue({
      ...mockUsePomodoroStore(),
      startPomodoro: mockStartPomodoro,
    });

    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      schedulePomodoroNotification: mockScheduleNotification,
    });

    mockUseSound.mockReturnValue({
      ...mockUseSound(),
      playStart: mockPlayStart,
    });

    const { result } = renderHook(() => usePomodoroTimer());

    await act(async () => {
      await result.current.start();
    });

    expect(mockStartPomodoro).toHaveBeenCalled();
    expect(mockScheduleNotification).toHaveBeenCalledWith(25, undefined);
    expect(mockPlayStart).toHaveBeenCalled();
  });

  it('handles pause action correctly', async () => {
    const mockPausePomodoro = jest.fn();
    const mockPlayPause = jest.fn();

    mockUsePomodoroStore.mockReturnValue({
      ...mockUsePomodoroStore(),
      pausePomodoro: mockPausePomodoro,
    });

    mockUseSound.mockReturnValue({
      ...mockUseSound(),
      playPause: mockPlayPause,
    });

    const { result } = renderHook(() => usePomodoroTimer());

    await act(async () => {
      await result.current.pause();
    });

    expect(mockPausePomodoro).toHaveBeenCalled();
    expect(mockPlayPause).toHaveBeenCalled();
  });

  it('handles stop action correctly', async () => {
    const mockStopPomodoro = jest.fn();
    const mockCancelNotifications = jest.fn();

    mockUsePomodoroStore.mockReturnValue({
      ...mockUsePomodoroStore(),
      stopPomodoro: mockStopPomodoro,
    });

    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      cancelAllNotifications: mockCancelNotifications,
    });

    const { result } = renderHook(() => usePomodoroTimer());

    await act(async () => {
      await result.current.stop();
    });

    expect(mockStopPomodoro).toHaveBeenCalled();
    expect(mockCancelNotifications).toHaveBeenCalled();
  });

  it('handles break start correctly', async () => {
    const mockStartBreak = jest.fn();
    const mockScheduleBreakNotification = jest.fn();

    mockUsePomodoroStore.mockReturnValue({
      ...mockUsePomodoroStore(),
      startBreak: mockStartBreak,
    });

    mockUseNotifications.mockReturnValue({
      ...mockUseNotifications(),
      scheduleBreakNotification: mockScheduleBreakNotification,
    });

    const { result } = renderHook(() => usePomodoroTimer());

    await act(async () => {
      await result.current.startBreak(true); // Long break
    });

    expect(mockStartBreak).toHaveBeenCalledWith(true);
    expect(mockScheduleBreakNotification).toHaveBeenCalledWith(15, true);
  });
});
