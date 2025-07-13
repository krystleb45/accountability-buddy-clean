// src/config/i18n.ts  (or whatever file you actually keep your theme factory in)
import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';
import type { PaletteOptions } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'highContrast';

/**
 * Define your palettes with a concrete `PaletteOptions` type
 * so it can never be undefined at runtime
 */
const palettes: Record<ThemeMode, PaletteOptions> = {
  light: {
    mode: 'light',
    primary: { main: '#1976d2', contrastText: '#fff' },
    background: { default: '#fafafa', paper: '#fff' },
    text: { primary: '#000', secondary: '#555' },
  },
  dark: {
    mode: 'dark',
    primary: { main: '#90caf9', contrastText: '#000' },
    background: { default: '#121212', paper: '#1d1d1d' },
    text: { primary: '#fff', secondary: '#aaa' },
  },
  highContrast: {
    mode: 'dark',
    primary: { main: '#ffcc00', contrastText: '#000' },
    background: { default: '#000', paper: '#000' },
    text: { primary: '#fff', secondary: '#ffcc00' },
  },
};

export function makeAppTheme(mode: ThemeMode): Theme {
  // we know `palettes[mode]` always exists
  const palette = palettes[mode];

  const base = createTheme({
    palette,
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 700 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      body1: { fontSize: '1rem', lineHeight: 1.5 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 16,
          },
        },
      },
    },
  });

  return responsiveFontSizes(base);
}
