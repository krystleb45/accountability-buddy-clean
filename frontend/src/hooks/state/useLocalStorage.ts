// src/hooks/state/useLocalStorage.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with TypeScript support.
 *
 * Lazily initializes state from localStorage, falling back to
 * `initialValue`. Supports functions for lazy defaults.
 *
 * @template T - The type of the stored value.
 * @param key - The key under which to store the value in localStorage.
 * @param initialValue - The initial value or a function returning it.
 * @returns [storedValue, setValue, removeItem]
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Helper to get the initial value (SSR‐safe)
  const getInitial = (): T => {
    // Lazy default resolution
    const defaultValue =
      typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;

    if (typeof window === 'undefined') {
      // SSR: just return the default
      return defaultValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : defaultValue;
    } catch (err) {
      console.error(`useLocalStorage: error reading key "${key}"`, err);
      return defaultValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(getInitial);

  // Write to localStorage whenever storedValue changes
  const setValue = (value: T | ((val: T) => T)): void => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (err) {
      console.error(`useLocalStorage: error setting key "${key}"`, err);
    }
  };

  // Remove the item and reset to initial
  const removeItem = (): void => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(getInitial());
    } catch (err) {
      console.error(`useLocalStorage: error removing key "${key}"`, err);
    }
  };

  // Listen for other tabs updating localStorage
  useEffect(() => {
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === key) {
        try {
          setStoredValue(
            event.newValue !== null ? (JSON.parse(event.newValue) as T) : getInitial(),
          );
        } catch {
          setStoredValue(getInitial());
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [key]);

  return [storedValue, setValue, removeItem];
}

export default useLocalStorage;
