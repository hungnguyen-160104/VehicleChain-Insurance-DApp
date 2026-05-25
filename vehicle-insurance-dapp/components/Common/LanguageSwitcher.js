import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiGlobe, FiChevronDown, FiCheck } from "react-icons/fi";

const LANGUAGES = [
  {
    code: "vi",
    label: "Tiếng Việt",
    flag: "🇻🇳",
    short: "VI",
  },
  {
    code: "en",
    label: "English",
    flag: "🇬🇧",
    short: "EN",
  },
  {
    code: "fr",
    label: "Français",
    flag: "🇫🇷",
    short: "FR",
  },
];

const LanguageSwitcher = ({ variant = "header" }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Close dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = async (langCode) => {
    await i18n.changeLanguage(langCode);
    if (typeof window !== "undefined") {
      localStorage.setItem("vehiclechain_lang", langCode);
    }
    setOpen(false);
  };

  // Variant dùng trong Sidebar (nền trắng, dropdown mở lên trên)
  if (variant === "sidebar") {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-gray-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-2">
            <FiGlobe className="h-4 w-4 text-red-500 group-hover:text-red-600" />
            <span className="text-sm font-semibold">
              {currentLang.flag} {currentLang.label}
            </span>
          </div>
          <FiChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ${
                  lang.code === currentLang.code
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </span>
                {lang.code === currentLang.code && (
                  <FiCheck className="h-4 w-4 text-red-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variant dùng trong Landing page navbar (light theme)
  if (variant === "landing") {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-all duration-200 text-gray-700 group"
        >
          <FiGlobe className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold tracking-wide">
            {currentLang.flag} {currentLang.short}
          </span>
          <FiChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Language
              </p>
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ${
                  lang.code === currentLang.code
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-semibold">{lang.label}</span>
                </span>
                {lang.code === currentLang.code && (
                  <FiCheck className="h-4 w-4 text-red-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variant dùng trong Header (light theme)
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 group"
        style={{ border: "1px solid #e5e7eb" }}
        title="Đổi ngôn ngữ"
      >
        <FiGlobe className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold tracking-wide">
          {currentLang.flag} {currentLang.short}
        </span>
        <FiChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-lg overflow-hidden z-50 bg-white"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Language</p>
          </div>

          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ${
                lang.code === currentLang.code
                  ? "text-red-600"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
              style={lang.code === currentLang.code ? { background: "rgba(200,16,46,0.06)" } : {}}
            >
              <span className="flex items-center space-x-2.5">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-semibold">{lang.label}</span>
              </span>
              {lang.code === currentLang.code && (
                <FiCheck className="h-4 w-4 text-red-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
