/**
 * Safe LocalStorage Wrapper for Sandboxed Iframes
 * Prevents SecurityErrors in restricted browser iframe environments (e.g. Pi App Studio, AI Studio)
 * by falling back to high-performance in-memory state.
 */

class SafeStorage {
  private memoryStore: Record<string, string> = {};

  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage.getItem failed for key "${key}". Falling back to memory storage.`, e);
    }
    return this.memoryStore[key] || null;
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage.setItem failed for key "${key}". Falling back to memory storage.`, e);
    }
    this.memoryStore[key] = value;
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[SafeStorage] localStorage.removeItem failed for key "${key}". Falling back to memory storage.`, e);
    }
    delete this.memoryStore[key];
  }

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn('[SafeStorage] localStorage.clear failed. Falling back to memory storage.', e);
    }
    this.memoryStore = {};
  }
}

export const safeStorage = new SafeStorage();
