import { createContext, useCallback, useContext, useMemo } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';

export const SUPPORTED_LOCALES = ['en', 'es'];
export const DEFAULT_LOCALE = 'en';

const DICTIONARIES = { en, es };

const I18nContext = createContext(null);

function deepGet(obj, dottedKey) {
  return dottedKey.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`
  );
}

export function I18nProvider({ locale, children }) {
  const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  const t = useCallback(
    (key, vars) => {
      const dict = DICTIONARIES[safeLocale];
      let str = deepGet(dict, key);
      if (typeof str !== 'string') {
        // Fallback to the default locale, then to the key itself
        const fallback = deepGet(DICTIONARIES[DEFAULT_LOCALE], key);
        str = typeof fallback === 'string' ? fallback : key;
      }
      return interpolate(str, vars);
    },
    [safeLocale]
  );

  const value = useMemo(() => ({ locale: safeLocale, t }), [safeLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used inside I18nProvider');
  return ctx;
}

/**
 * Replace (or insert) the locale segment in a pathname.
 * `/en/earthquakes`  + 'es' → `/es/earthquakes`
 * `/dashboard`       + 'es' → `/es/dashboard`
 * `/`                + 'es' → `/es`
 */
export function replaceLang(pathname, newLang) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return `/${newLang}`;
  if (SUPPORTED_LOCALES.includes(parts[0])) {
    parts[0] = newLang;
  } else {
    parts.unshift(newLang);
  }
  return '/' + parts.join('/');
}
