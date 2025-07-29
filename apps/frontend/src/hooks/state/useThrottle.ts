import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for throttling a function.
 *
 * Ensures the provided function is only called at most once
 * every `delay` milliseconds, with trailing invocation.
 *
 * @template T - The type of the callback function.
 * @param callback - The function to throttle.
 * @param delay - The throttle interval in milliseconds.
 * @returns A throttled version of the provided function.
 */
function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  const lastCall = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedCallback = useRef(callback);

  // Always keep the latest callback in ref
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastCall.current);

      if (remaining <= 0) {
        // It's been longer than `delay`: call immediately
        lastCall.current = now;
        savedCallback.current(...args);
      } else if (!timeout.current) {
        // Otherwise schedule a trailing call
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeout.current = null;
          savedCallback.current(...args);
        }, remaining);
      }
    },
    [delay],
  ); // only re-create if `delay` changes

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return throttledFn;
}

export default useThrottle;
