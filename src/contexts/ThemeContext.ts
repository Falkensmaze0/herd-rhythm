import React, { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';
export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
export function useTheme() {
  return useContext(ThemeContext);
}
