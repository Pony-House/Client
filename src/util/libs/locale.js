import { objType } from 'for-promise/utils/lib.mjs';

// Locale
export const defaultLocale = 'en';

export const appLocale = () => {
  if (navigator && navigator.language === 'string' && navigator.language.length > 0)
    return navigator.language;
  else return defaultLocale;
};

if (__ENV_APP__.MODE === 'development') {
  global.appLocale = appLocale;
}
