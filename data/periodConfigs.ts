import { Period } from "@/types";

/**
 * Break time configuration
 */
export interface Break {
  name: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
}

/**
 * Period configuration for different durations
 */
export interface PeriodConfig {
  duration: number; // in minutes
  label: string;
  periods: Period[];
  breaks: Break[];
  collegeStart: string;
  collegeEnd: string;
}

/**
 * 45-minute period configuration
 * College hours: 8:30 AM - 4:30 PM
 * Breaks:
 * - Morning break: 10:45 - 11:05 (20 mins)
 * - Lunch: 12:35 - 1:20 (45 mins)
 * - Afternoon break: 2:50 - 3:05 (15 mins)
 */
export const PERIOD_CONFIG_45MIN: PeriodConfig = {
  duration: 45,
  label: "45 Minutes",
  collegeStart: "08:30",
  collegeEnd: "16:30",
  periods: [
    { id: 1, name: "Period 1", startTime: "08:30", endTime: "09:15" },
    { id: 2, name: "Period 2", startTime: "09:15", endTime: "10:00" },
    { id: 3, name: "Period 3", startTime: "10:00", endTime: "10:45" },
    // Morning Break: 10:45 - 11:05
    { id: 4, name: "Period 4", startTime: "11:05", endTime: "11:50" },
    { id: 5, name: "Period 5", startTime: "11:50", endTime: "12:35" },
    // Lunch: 12:35 - 13:20
    { id: 6, name: "Period 6", startTime: "13:20", endTime: "14:05" },
    { id: 7, name: "Period 7", startTime: "14:05", endTime: "14:50" },
    // Afternoon Break: 14:50 - 15:05
    { id: 8, name: "Period 8", startTime: "15:05", endTime: "15:50" },
  ],
  breaks: [
    { name: "Morning Break", startTime: "10:45", endTime: "11:05", duration: 20 },
    { name: "Lunch Break", startTime: "12:35", endTime: "13:20", duration: 45 },
    { name: "Afternoon Break", startTime: "14:50", endTime: "15:05", duration: 15 },
  ],
};

/**
 * 1-hour period configuration
 * College hours: 8:30 AM - 4:30 PM
 * Breaks:
 * - Morning break: 10:30 - 10:50 (20 mins)
 * - Lunch: 1:20 - 2:00 (40 mins)
 */
export const PERIOD_CONFIG_1HOUR: PeriodConfig = {
  duration: 60,
  label: "1 Hour",
  collegeStart: "08:30",
  collegeEnd: "16:30",
  periods: [
    { id: 1, name: "Period 1", startTime: "08:30", endTime: "09:30" },
    { id: 2, name: "Period 2", startTime: "09:30", endTime: "10:30" },
    // Morning Break: 10:30 - 10:50
    { id: 3, name: "Period 3", startTime: "10:50", endTime: "11:50" },
    { id: 4, name: "Period 4", startTime: "11:50", endTime: "12:50" },
    { id: 5, name: "Period 5", startTime: "12:50", endTime: "13:20" }, // 30 min period before lunch
    // Lunch: 13:20 - 14:00
    { id: 6, name: "Period 6", startTime: "14:00", endTime: "15:00" },
    { id: 7, name: "Period 7", startTime: "15:00", endTime: "16:00" },
  ],
  breaks: [
    { name: "Morning Break", startTime: "10:30", endTime: "10:50", duration: 20 },
    { name: "Lunch Break", startTime: "13:20", endTime: "14:00", duration: 40 },
  ],
};

/**
 * Get period configuration by duration
 */
export const getPeriodConfig = (duration: number): PeriodConfig => {
  return duration === 45 ? PERIOD_CONFIG_45MIN : PERIOD_CONFIG_1HOUR;
};

/**
 * Get all available period configurations
 */
export const getAllPeriodConfigs = (): PeriodConfig[] => {
  return [PERIOD_CONFIG_45MIN, PERIOD_CONFIG_1HOUR];
};

/**
 * Format time string for display (e.g., "09:30" -> "9:30 AM")
 */
export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

/**
 * Format period time range for display
 */
export const formatPeriodTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTimeForDisplay(startTime)} - ${formatTimeForDisplay(endTime)}`;
};
