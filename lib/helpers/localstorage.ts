import type { CardRecord } from "@/app/actions/cards";

const isBrowser = typeof window !== "undefined";

export class LocalStorage {
  static setItem(key: string, value: string) {
    if (!isBrowser) return;
    window.localStorage.setItem(key, value);
  }

  static getItem(key: string) {
    if (!isBrowser) return null;
    return window.localStorage.getItem(key);
  }

  static removeItem(key: string) {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
  }

  static setItemArray(key: string, value: CardRecord[]) {
    if (!isBrowser) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  static getItemArray(key: string): CardRecord[] {
    if (!isBrowser) return [];
    const stored = window.localStorage.getItem(key);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? (parsed as CardRecord[]) : [];
    } catch (error) {
      console.error("Error parsing localStorage value", error);
      return [];
    }
  }
}
