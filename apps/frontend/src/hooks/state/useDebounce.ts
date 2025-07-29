import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 *
 * Delays updating the returned value until after `delay` ms have passed
 * without the incoming `value` changing.
 */
export default function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    // Schedule update after `delay`
    const timeoutId = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    // Clear on value or delay change / unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debounced;
}
