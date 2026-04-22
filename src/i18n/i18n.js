import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import resources from './languages';

const LANGUAGE_MAP = {
  pt: 'pt',
  en: 'en'
};

function getDeviceLanguage() {
  const locales = RNLocalize.getLocales();

  if (locales?.length) {
    const { languageCode, countryCode } = locales[0];
    const locale = `${languageCode}-${countryCode}`;

    return LANGUAGE_MAP[locale] || LANGUAGE_MAP[languageCode] || 'en';
  }

  return 'en';
}

// 🔑 transform into i18next format
const formattedResources = Object.keys(resources).reduce((acc, lang) => {
  acc[lang] = { translation: resources[lang] };
  return acc;
}, {});

i18n
  .use(initReactI18next)
  .init({
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    resources: formattedResources,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;