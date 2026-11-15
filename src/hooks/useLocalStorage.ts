import { useEffect, useState } from 'react';

export function readStored<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be disabled or full. The in-memory state remains usable.
  }
}

export function useLocalStorage<T>(key: string, fallback: T, isValid: (value: unknown) => value is T) {
  const [value, setValue] = useState(() => readStored(key, fallback, isValid));
  useEffect(() => { writeStored(key, value); }, [key, value]);
  return [value, setValue] as const;
}
