import { useGamificationStore } from '../useGamificationStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe('useGamificationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGamificationStore.setState({
      userStats: {
        level: 1,
        xp: 0,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPomodoros: 0,
        totalTasks: 0,
        totalFocusTime: 0,
        badges: [],
        achievements: [],
        lastActiveDate: new Date().toDateString(),
      },
    });
  });

  it('should have initial state', () => {
    const state = useGamificationStore.getState();
    expect(state.userStats.level).toBe(1);
    expect(state.userStats.xp).toBe(0);
    expect(state.userStats.totalPomodoros).toBe(0);
  });

  it('should add XP correctly', () => {
    const { addXp } = useGamificationStore.getState();
    addXp(50, 'test');
    
    const state = useGamificationStore.getState();
    expect(state.userStats.xp).toBe(50);
    expect(state.userStats.totalXp).toBe(50);
  });

  it('should calculate level from total XP', () => {
    const { addXp } = useGamificationStore.getState();
    addXp(400, 'test'); // Should be level 3 (sqrt(400/100) + 1 = 3)
    
    const state = useGamificationStore.getState();
    expect(state.userStats.level).toBe(3);
    expect(state.userStats.totalXp).toBe(400);
  });

  it('should update streak correctly', () => {
    const { updateStreak } = useGamificationStore.getState();
    
    // Increase streak
    updateStreak(true);
    let state = useGamificationStore.getState();
    expect(state.userStats.currentStreak).toBe(1);
    expect(state.userStats.longestStreak).toBe(1);
    
    // Increase streak again
    updateStreak(true);
    state = useGamificationStore.getState();
    expect(state.userStats.currentStreak).toBe(2);
    expect(state.userStats.longestStreak).toBe(2);
    
    // Reset streak
    updateStreak(false);
    state = useGamificationStore.getState();
    expect(state.userStats.currentStreak).toBe(0);
    expect(state.userStats.longestStreak).toBe(2); // Should keep longest
  });

  it('should get level progress correctly', () => {
    const { addXp, getLevelProgress } = useGamificationStore.getState();
    addXp(150, 'test'); // Level 2 (sqrt(150/100) + 1 = 2.22 -> 2)
    
    const progress = getLevelProgress();
    expect(progress.current).toBeGreaterThan(0);
    expect(progress.next).toBeGreaterThan(0);
    expect(progress.percentage).toBeGreaterThan(0);
    expect(progress.percentage).toBeLessThanOrEqual(100);
  });

  it('should get available badges', () => {
    const { getAvailableBadges } = useGamificationStore.getState();
    const badges = getAvailableBadges();
    
    expect(Array.isArray(badges)).toBe(true);
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0]).toHaveProperty('id');
    expect(badges[0]).toHaveProperty('name');
    expect(badges[0]).toHaveProperty('description');
  });

  it('should get unlocked badges', () => {
    const { getUnlockedBadges } = useGamificationStore.getState();
    const badges = getUnlockedBadges();
    
    expect(Array.isArray(badges)).toBe(true);
    expect(badges.length).toBe(0); // Initially no badges unlocked
  });
});