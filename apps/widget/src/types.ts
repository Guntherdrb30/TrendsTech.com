export type WidgetTheme = 'light' | 'dark' | 'system';
export type WidgetLanguage = 'es' | 'en';

export type WidgetInitOptions = {
  installId: string;
  language?: WidgetLanguage;
  theme?: WidgetTheme;
  apiBaseUrl?: string;
};

export type WidgetBranding = {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  agentName?: string | null;
  welcomeMessage?: {
    es?: string;
    en?: string;
  } | null;
};

export type InstallValidationResponse = {
  valid: boolean;
  branding?: WidgetBranding | null;
  features?: Record<string, unknown> | null;
  language?: WidgetLanguage | null;
  error?: string;
};

export type WidgetMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};
