import { Period } from "@/types";
import { PeriodConfig, Break, getPeriodConfig } from "@/data/periodConfigs";

/**
 * Converts time string "HH:MM" to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Gets current time in "HH:MM" format
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Check if current time is during a break
 */
export const isBreakTime = (config: PeriodConfig, currentTime?: string): Break | null => {
  const time = currentTime || getCurrentTime();
  const currentMinutes = timeToMinutes(time);

  for (const breakPeriod of config.breaks) {
    const startMinutes = timeToMinutes(breakPeriod.startTime);
    const endMinutes = timeToMinutes(breakPeriod.endTime);

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return breakPeriod;
    }
  }

  return null;
};

/**
 * Detects which period is currently active based on current time
 * Returns the period or null if no period is active (e.g., during break)
 */
export const getCurrentPeriod = (config: PeriodConfig, currentTime?: string): Period | null => {
  const time = currentTime || getCurrentTime();
  const currentMinutes = timeToMinutes(time);

  for (const period of config.periods) {
    const startMinutes = timeToMinutes(period.startTime);
    const endMinutes = timeToMinutes(period.endTime);

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return period;
    }
  }

  return null;
};

/**
 * Gets the next upcoming period based on current time
 */
export const getNextPeriod = (config: PeriodConfig, currentTime?: string): Period | null => {
  const time = currentTime || getCurrentTime();
  const currentMinutes = timeToMinutes(time);

  for (const period of config.periods) {
    const startMinutes = timeToMinutes(period.startTime);
    
    if (currentMinutes < startMinutes) {
      return period;
    }
  }

  return null;
};

/**
 * Gets default selected period (current or next)
 */
export const getDefaultPeriod = (config: PeriodConfig): Period | null => {
  const current = getCurrentPeriod(config);
  if (current !== null) return current;
  
  return getNextPeriod(config);
};

/**
 * Format period display text
 */
export const formatPeriodTime = (period: Period): string => {
  return `${period.name} (${period.startTime} - ${period.endTime})`;
};

/**
 * Check if given time is within college hours
 */
export const isWithinCollegeHours = (config: PeriodConfig, currentTime?: string): boolean => {
  const time = currentTime || getCurrentTime();
  const currentMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(config.collegeStart);
  const endMinutes = timeToMinutes(config.collegeEnd);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Get the period range display string (e.g., "Period 1 - Period 3: 8:30 AM - 10:45 AM")
 */
export const getPeriodRangeDisplay = (periods: Period[], startId: number, endId: number): string => {
  const startPeriod = periods.find(p => p.id === startId);
  const endPeriod = periods.find(p => p.id === endId);
  
  if (!startPeriod || !endPeriod) return "";
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  if (startId === endId) {
    return `${startPeriod.name}: ${formatTime(startPeriod.startTime)} - ${formatTime(startPeriod.endTime)}`;
  }

  return `${startPeriod.name} - ${endPeriod.name}: ${formatTime(startPeriod.startTime)} - ${formatTime(endPeriod.endTime)}`;
};
