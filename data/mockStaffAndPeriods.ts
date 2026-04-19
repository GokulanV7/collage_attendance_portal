import { Staff } from "@/types";

const STAFF_STORAGE_KEY = "attendance_staff_data";

const DEFAULT_STAFF: Staff[] = [
  { id: "STAFF001", name: "Arun Kumar", department: "CSE" },
  { id: "STAFF002", name: "Neha Sharma", department: "CSE" },
  { id: "STAFF003", name: "Priya Menon", department: "IT" },
  { id: "STAFF004", name: "Rahul Verma", department: "IT" },
  { id: "STAFF005", name: "Anita Rao", department: "ECE" },
  { id: "STAFF006", name: "Suresh Nair", department: "ECE" },
  { id: "STAFF007", name: "Vikram Singh", department: "ME" },
  { id: "STAFF008", name: "Divya Patel", department: "ME" },
  { id: "STAFF009", name: "Asha Iyer", department: "AIML" },
  { id: "STAFF010", name: "Kiran Das", department: "AIML" },
  { id: "STAFF011", name: "Nitin Goyal", department: "CSE" },
  { id: "STAFF012", name: "Meera Joseph", department: "IT" },
];

const canUseStorage = (): boolean => typeof window !== "undefined";

const readStaff = (): Staff[] => {
  if (!canUseStorage()) {
    return [...DEFAULT_STAFF];
  }

  const raw = window.localStorage.getItem(STAFF_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
    return [...DEFAULT_STAFF];
  }

  try {
    const parsed = JSON.parse(raw) as Staff[];
    if (!Array.isArray(parsed)) {
      window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return [...DEFAULT_STAFF];
    }
    return parsed;
  } catch {
    window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
    return [...DEFAULT_STAFF];
  }
};

const writeStaff = (staff: Staff[]): void => {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
};

export const getStaffData = (): Staff[] => {
  return readStaff();
};

export const validateStaffId = (staffId: string): Staff | null => {
  const id = staffId.trim().toUpperCase();
  const staff = readStaff().find((item) => item.id.toUpperCase() === id);
  return staff || null;
};

export const addStaff = (newStaff: Staff): Staff[] => {
  const id = newStaff.id.trim().toUpperCase();
  const name = newStaff.name.trim();
  const department = newStaff.department.trim().toUpperCase();

  const all = readStaff();
  if (all.some((item) => item.id.toUpperCase() === id)) {
    return all;
  }

  const updated = [...all, { id, name, department }];
  writeStaff(updated);
  return updated;
};

export const removeStaff = (staffId: string): Staff[] => {
  const id = staffId.trim().toUpperCase();
  const updated = readStaff().filter((item) => item.id.toUpperCase() !== id);
  writeStaff(updated);
  return updated;
};
