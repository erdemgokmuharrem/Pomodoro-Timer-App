import { formatTime, getDaysBetween, calculateProgress } from '../timeUtils';

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('should format seconds correctly to MM:SS', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(125)).toBe('02:05');
      expect(formatTime(3661)).toBe('61:01'); // 1 hour 1 minute 1 second
    });

    it('should handle edge cases', () => {
      expect(formatTime(-1)).toBe('-1:-1'); // Negative number
      expect(formatTime(0.5)).toBe('00:00'); // Decimal number
    });
  });

  describe('getDaysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-01');
      expect(getDaysBetween(date1, date2)).toBe(0);

      const date3 = new Date('2024-01-01');
      const date4 = new Date('2024-01-02');
      expect(getDaysBetween(date3, date4)).toBe(1);

      const date5 = new Date('2024-01-01');
      const date6 = new Date('2024-01-05');
      expect(getDaysBetween(date5, date6)).toBe(4);
    });

    it('should handle dates in different order', () => {
      const date1 = new Date('2024-01-05');
      const date2 = new Date('2024-01-01');
      expect(getDaysBetween(date1, date2)).toBe(4);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress percentage correctly', () => {
      expect(calculateProgress(1500, 1500)).toBe(0); // No progress
      expect(calculateProgress(750, 1500)).toBe(50); // Half way
      expect(calculateProgress(0, 1500)).toBe(100); // Complete
      expect(calculateProgress(300, 1500)).toBe(80); // 1200/1500 = 0.8 = 80%
    });

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 0)).toBe(0); // Division by zero
      expect(calculateProgress(100, 0)).toBe(0); // Division by zero
      expect(calculateProgress(-100, 1500)).toBe(107); // Negative time left
    });
  });
});
