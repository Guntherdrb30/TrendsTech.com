export const widgetLocales = ['es', 'en'] as const;
export type WidgetLocale = (typeof widgetLocales)[number];
export const widgetDefaultLocale: WidgetLocale = 'es';
