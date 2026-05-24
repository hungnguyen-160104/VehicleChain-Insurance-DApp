import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import trực tiếp (hoạt động cả SSR lẫn client)
import viCommon from "./public/locales/vi/common.json";
import enCommon from "./public/locales/en/common.json";
import frCommon from "./public/locales/fr/common.json";

// QUAN TRỌNG: Luôn khởi tạo với "vi" để SSR và client render GIỐNG NHAU.
// Tránh hydration mismatch khi localStorage trả về ngôn ngữ khác với SSR.
// Ngôn ngữ đã lưu được áp dụng SAU hydration qua useEffect trong _app.js.
i18n.use(initReactI18next).init({
  resources: {
    vi: { common: viCommon },
    en: { common: enCommon },
    fr: { common: frCommon },
  },
  lng: "vi",
  fallbackLng: "vi",
  ns: ["common"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
