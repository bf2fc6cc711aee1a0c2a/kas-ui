import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';
import httpBackend from 'i18next-http-backend';
import Pseudo from 'i18next-pseudo';
import dayjs from 'dayjs';
import * as relativeTime from 'dayjs/plugin/relativeTime';

// import locales for any languages you're supporting (English is included by default)
import 'dayjs/locale/ja';

const params = new URLSearchParams(window.location.search);
const pseudolocalizationEnabled = params.get('pseudolocalization') === 'true';

declare const window: Window & {
  windowError: string;
};

i18n
  .use(new Pseudo({ enabled: pseudolocalizationEnabled, wrapped: true }))
  // fetch json files
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(httpBackend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(detector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init(
    {
      backend: {
        loadPath: `${__webpack_public_path__}locales/{{lng}}/{{ns}}.json`,
      },
      fallbackLng: 'en',
      load: 'all',
      debug: process.env.NODE_ENV === 'development',
      detection: { caches: [] },
      contextSeparator: '~',
      // add any namespaces you're using here for loading purposes
      ns: ['public'],
      defaultNS: 'public',
      nsSeparator: ':',
      keySeparator: '.',
      postProcess: ['pseudo'],
      interpolation: {
        format: function (value, format, lng, options) {
          options = options || {};
          if (format === 'number') {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat#Browser_compatibility
            return new Intl.NumberFormat(lng).format(value);
          }
          if (value instanceof Date) {
            if (format === 'fromNow') {
              return dayjs(value).fromNow(options.omitSuffix === true);
            }
            return dayjs(value).format(format);
          }
          return value;
        },
        escapeValue: false, // not needed for react as it escapes by default
      },
      react: {
        useSuspense: true,
        wait: true,
      },
      saveMissing: true,
      missingKeyHandler: function (lng, ns, key) {
        // window.windowError = `Missing i18n key "${key}" in namespace "${ns}" and language "${lng}."`;
        // eslint-disable-next-line no-console
        // console.error(window.windowError); // we use these in OpenShift to break tests
      },
    },
    () => {
      dayjs.locale(i18n.language);
    }
  );

i18n.on('languageChanged', function (lng) {
  dayjs.locale(lng);
});

export default i18n;
