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

  // Variant dùng trong Sidebar (nền tối, dropdown mở lên trên)
  if (variant === "sidebar") {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-red-100 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-2">
            <FiGlobe className="h-4 w-4 text-red-300 group-hover:text-red-200" />
            <span className="text-sm font-semibold">
              {currentLang.flag} {currentLang.label}
            </span>
          </div>
          <FiChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute bottom-full mb-2 left-0 right-0 bg-slate-800 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ${
                  lang.code === currentLang.code
                    ? "bg-red-700/30 text-red-300"
                    : "text-red-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </span>
                {lang.code === currentLang.code && (
                  <FiCheck className="h-4 w-4 text-red-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variant dùng trong Landing page navbar (nền tối, dropdown mở xuống)
  if (variant === "landing") {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200 text-white group"
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
          <div className="absolute right-0 top-full mt-2 w-44 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
            <div className="px-4 py-2.5 border-b border-white/10">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Language
              </p>
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ${
                  lang.code === currentLang.code
                    ? "bg-red-700/30 text-red-300"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-semibold">{lang.label}</span>
                </span>
                {lang.code === currentLang.code && (
                  <FiCheck className="h-4 w-4 text-red-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variant dùng trong Header (dark glass header)
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl transition-all duration-200 text-white/70 hover:text-white group"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
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
        <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
          style={{ background: "rgba(15,0,0,0.90)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Language</p>
          </div>

          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-150 ${
                lang.code === currentLang.code
                  ? "text-red-300"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
              style={lang.code === currentLang.code ? { background: "rgba(200,16,46,0.18)" } : {}}
            >
              <span className="flex items-center space-x-2.5">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-semibold">{lang.label}</span>
              </span>
              {lang.code === currentLang.code && (
                <FiCheck className="h-4 w-4 text-red-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

