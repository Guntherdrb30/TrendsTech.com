import type { WidgetLanguage } from './types';

const MESSAGES: Record<WidgetLanguage, Record<string, string>> = {
  es: {
    'widget.open': 'Abrir chat',
    'widget.close': 'Cerrar chat',
    'widget.reset': 'Nueva conversacion',
    'header.title': 'Asistente virtual',
    'header.subtitle': 'Disponible ahora',
    'welcome': 'Hola, estoy aqui para ayudarte.',
    'status.typing': 'Escribiendo...',
    'input.placeholder': 'Escribe tu mensaje',
    'input.send': 'Enviar',
    'error.connection': 'No pudimos conectar. Intenta de nuevo.',
    'error.invalid': 'El widget no esta disponible en este dominio.',
    'error.unavailable': 'Servicio temporalmente no disponible.'
  },
  en: {
    'widget.open': 'Open chat',
    'widget.close': 'Close chat',
    'widget.reset': 'New conversation',
    'header.title': 'Virtual assistant',
    'header.subtitle': 'Available now',
    'welcome': 'Hi, I am here to help.',
    'status.typing': 'Typing...',
    'input.placeholder': 'Type your message',
    'input.send': 'Send',
    'error.connection': 'We could not connect. Please try again.',
    'error.invalid': 'This widget is not available on this domain.',
    'error.unavailable': 'Service temporarily unavailable.'
  }
};

export function detectLanguage(): WidgetLanguage {
  if (typeof navigator === 'undefined') {
    return 'es';
  }
  const lang = navigator.language?.toLowerCase() ?? '';
  if (lang.startsWith('en')) {
    return 'en';
  }
  return 'es';
}

export function t(language: WidgetLanguage, key: string) {
  return MESSAGES[language]?.[key] ?? MESSAGES.es[key] ?? key;
}
