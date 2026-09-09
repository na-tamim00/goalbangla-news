export const locales = ['bn', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'bn';

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}