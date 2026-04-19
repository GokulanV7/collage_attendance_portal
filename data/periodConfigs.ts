import { Period } from "@/types";

export interface Break {
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
}

export interface PeriodConfig {
  duration: 45 | 60;
  collegeStart: string;
  collegeEnd: string;
  periods: Period[];
  breaks: Break[];
}

export const PERIOD_CONFIG_45MIN: PeriodConfig = {
  duration: 45,
  collegeStart: "08:30",
  collegeEnd: "16:30",
  periods: [
    { id: 1, name: "Period 1", startTime: "08:30", endTime: "09:15" },
    { id: 2, name: "Period 2", startTime: "09:15", endTime: "10:00" },
    { id: 3, name: "Period 3", startTime: "10:15", endTime: "11:00" },
    { id: 4, name: "Period 4", startTime: "11:00", endTime: "11:45" },
    { id: 5, name: "Period 5", startTime: "12:30", endTime: "13:15" },
    { id: 6, name: "Period 6", startTime: "13:15", endTime: "14:00" },
    { id: 7, name: "Period 7", startTime: "14:15", endTime: "15:00" },
    { id: 8, name: "Period 8", startTime: "15:00", endTime: "15:45" },
  ],
  breaks: [
    { name: "Tea Break", startTime: "10:00", endTime: "10:15", duration: 15 },
    { name: "Lunch Break", startTime: "11:45", endTime: "12:30", duration: 45 },
    { name: "Tea Break", startTime: "14:00", endTime: "14:15", duration: 15 },
  ],
};

export const PERIOD_CONFIG_1HOUR: PeriodConfig = {
  duration: 60,
  collegeStart: "08:30",
  collegeEnd: "16:30",
  periods: [
    { id: 1, name: "Period 1", startTime: "08:30", endTime: "09:30" },
    { id: 2, name: "Period 2", startTime: "09:30", endTime: "10:30" },
    { id: 3, name: "Period 3", startTime: "10:45", endTime: "11:45" },
    { id: 4, name: "Period 4", startTime: "11:45", endTime: "12:45" },
    { id: 5, name: "Period 5", startTime: "13:30", endTime: "14:30" },
    { id: 6, name: "Period 6", startTime: "14:30", endTime: "15:30" },
    { id: 7, name: "Period 7", startTime: "15:30", endTime: "16:30" },
  ],
  breaks: [
    { name: "Tea Break", startTime: "10:30", endTime: "10:45", duration: 15 },
    { name: "Lunch Break", startTime: "12:45", endTime: "13:30", duration: 45 },
  ],
};

export const getPeriodConfig = (duration: number): PeriodConfig => {
  return duration === 60 ? PERIOD_CONFIG_1HOUR : PERIOD_CONFIG_45MIN;
};

export const formatTimeForDisplay = (time: string): string => {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const amPm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${amPm}`;
};
