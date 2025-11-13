'use client';

import { useEffect, useRef, useState } from 'react';

type AutoSaveStatus = 'idle' | 'saving' | 'error';

export interface UseAutoSaveOptions<T> {
  onSave: (values: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
  serialize?: (values: T) => string;
  onError?: (error: unknown) => void;
}

const defaultSerialize = <T,>(value: T) => JSON.stringify(value);

/**
 * Debounces persistence so UI surfaces can auto-save without manual buttons.
 * Returns the current status so callers can render subtle indicators.
 */
export const useAutoSave = <T,>(
  values: T,
  { onSave, delay = 800, enabled = true, serialize = defaultSerialize, onError }: UseAutoSaveOptions<T>
): AutoSaveStatus => {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSerializedRef = useRef<string | null>(null);
  const didInitRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const serialized = serialize(values);

    if (!didInitRef.current) {
      didInitRef.current = true;
      lastSerializedRef.current = serialized;
      return;
    }

    if (serialized === lastSerializedRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await onSave(values);
        lastSerializedRef.current = serialize(values);
        if (mountedRef.current) {
          setStatus('idle');
        }
      } catch (error) {
        console.error('Auto-save failed', error);
        onError?.(error);
        if (mountedRef.current) {
          setStatus('error');
        }
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [values, delay, enabled, onSave, serialize, onError]);

  return status;
};

