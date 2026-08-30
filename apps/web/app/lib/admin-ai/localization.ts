import type { LocalizedString } from './types';

export function getLocalizedValue(value: LocalizedString, locale: string) {
  return locale.startsWith('es') ? value.es : value.en;
}
