import { Period } from "@/types";
import { periods } from "@/data/mockStaffAndPeriods";

/**
 * Converts time string "HH:MM" to minutes since midnight
 */
const timeToMinutes = (time: string): number => {
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
 * Detects which period is currently active based on current time
 * Returns the period ID or null if no period is active
 */
export const getCurrentPeriod = (): number | null => {
  const currentTime = getCurrentTime();
  const currentMinutes = timeToMinutes(currentTime);

  for (const period of periods) {
    const startMinutes = timeToMinutes(period.startTime);
    const endMinutes = timeToMinutes(period.endTime);

    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return period.id;
    }
  }

  return null;
};

/**
 * Gets the next upcoming period based on current time
 */
export const getNextPeriod = (): number | null => {
  const currentTime = getCurrentTime();
  const currentMinutes = timeToMinutes(currentTime);

  for (const period of periods) {
    const startMinutes = timeToMinutes(period.startTime);
    
    if (currentMinutes < startMinutes) {
      return period.id;
    }
  }

  return null;
};

/**
 * Gets default selected period (current or next)
 */
export const getDefaultPeriod = (): number | null => {
  const current = getCurrentPeriod();
  if (current !== null) return current;
  
  return getNextPeriod();
};

/**
 * Format period display text
 */
export const formatPeriodTime = (period: Period): string => {
  return `${period.name} (${period.startTime} - ${period.endTime})`;
};
