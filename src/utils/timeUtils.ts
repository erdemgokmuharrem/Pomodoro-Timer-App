/**
 * Saniyeyi dakika:saniye formatına çevirir (örn: 125 -> "02:05")
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 */
export const getDaysBetween = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Pomodoro progress yüzdesini hesaplar
 */
export const calculateProgress = (
  timeLeft: number,
  totalDuration: number
): number => {
  if (totalDuration <= 0) return 0;
  const elapsed = totalDuration - timeLeft;
  return Math.round((elapsed / totalDuration) * 100);
};
