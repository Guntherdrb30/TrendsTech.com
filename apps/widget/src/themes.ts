import type { WidgetBranding, WidgetTheme } from './types';

export type ResolvedTheme = 'light' | 'dark';

const DEFAULT_PRIMARY = '#2563eb';
const DEFAULT_SECONDARY = '#0ea5e9';

function normalizeHex(color?: string | null) {
  if (!color) {
    return null;
  }
  const value = color.trim();
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return hex.test(value) ? value : null;
}

export function resolveTheme(theme: WidgetTheme): ResolvedTheme {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return theme;
}

export function getThemeStyles(theme: ResolvedTheme, branding?: WidgetBranding | null) {
  const primary = normalizeHex(branding?.primaryColor) ?? DEFAULT_PRIMARY;
  const secondary = normalizeHex(branding?.secondaryColor) ?? DEFAULT_SECONDARY;

  if (theme === 'dark') {
    return {
      '--tw-primary': primary,
      '--tw-secondary': secondary,
      '--tw-bg': '#0b1220',
      '--tw-panel': '#0f172a',
      '--tw-text': '#e2e8f0',
      '--tw-muted': '#94a3b8',
      '--tw-border': '#1e293b',
      '--tw-bubble-user': primary,
      '--tw-bubble-user-text': '#ffffff',
      '--tw-bubble-agent': '#111827',
      '--tw-bubble-agent-text': '#e2e8f0',
      '--tw-shadow': '0 24px 60px rgba(15, 23, 42, 0.55)'
    } as const;
  }

  return {
    '--tw-primary': primary,
    '--tw-secondary': secondary,
    '--tw-bg': '#f8fafc',
    '--tw-panel': '#ffffff',
    '--tw-text': '#0f172a',
    '--tw-muted': '#64748b',
    '--tw-border': '#e2e8f0',
    '--tw-bubble-user': primary,
    '--tw-bubble-user-text': '#ffffff',
    '--tw-bubble-agent': '#f1f5f9',
    '--tw-bubble-agent-text': '#0f172a',
    '--tw-shadow': '0 24px 60px rgba(15, 23, 42, 0.18)'
  } as const;
}
