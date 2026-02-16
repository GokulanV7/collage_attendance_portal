/**
 * Safe sessionStorage utility wrapper
 * Provides error handling for sessionStorage operations
 */

export const safeSessionStorage = {
  /**
   * Safely get an item from sessionStorage
   */
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from sessionStorage (${key}):`, error);
      return null;
    }
  },

  /**
   * Safely set an item in sessionStorage
   */
  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing to sessionStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Safely remove an item from sessionStorage
   */
  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Safely clear all items from sessionStorage
   */
  clear: (): boolean => {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
      return false;
    }
  },

  /**
   * Safely get and parse JSON from sessionStorage
   */
  getJSON: <T>(key: string, defaultValue: T): T => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading/parsing JSON from sessionStorage (${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * Safely stringify and set JSON in sessionStorage
   */
  setJSON: <T>(key: string, value: T): boolean => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error stringifying/writing JSON to sessionStorage (${key}):`, error);
      return false;
    }
  },
};
