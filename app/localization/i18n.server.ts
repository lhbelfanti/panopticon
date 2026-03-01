import { resolve } from "node:path";
import Backend from "i18next-fs-backend";
import { RemixI18Next } from "remix-i18next/server";
import i18nextOptions from "./i18n";

export const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18nextOptions.supportedLngs,
    fallbackLanguage: i18nextOptions.fallbackLng,
  },
  i18next: {
    ...i18nextOptions,
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
    },
  },
  plugins: [Backend],
});

export default i18next;
