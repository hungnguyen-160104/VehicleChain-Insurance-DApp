import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  FiShield,
  FiZap,
  FiUsers,
  FiLock,
  FiTrendingUp,
  FiCheck,
  FiArrowRight,
  FiStar,
  FiGlobe,
  FiCreditCard,
  FiFileText,
  FiActivity,
  FiMenu,
  FiX,
  FiTruck,
  FiDatabase,
  FiCpu,
  FiAlertCircle,
} from "react-icons/fi";
import LanguageSwitcher from "../components/Common/LanguageSwitcher";

export default function LandingPage() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: FiTruck, title: t("index.feat_0_title"), description: t("index.feat_0_desc") },
    { icon: FiShield, title: t("index.feat_1_title"), description: t("index.feat_1_desc") },
    { icon: FiZap, title: t("index.feat_2_title"), description: t("index.feat_2_desc") },
    { icon: FiDatabase, title: t("index.feat_3_title"), description: t("index.feat_3_desc") },
    { icon: FiCpu, title: t("index.feat_4_title"), description: t("index.feat_4_desc") },
    { icon: FiLock, title: t("index.feat_5_title"), description: t("index.feat_5_desc") },
  ];

  const insuranceTypes = [
    {
      name: t("index.type_0_name"), code: "TNDS",
      description: t("index.type_0_desc"),
      features: [t("index.type_0_feat_0"), t("index.type_0_feat_1"), t("index.type_0_feat_2"), t("index.type_0_feat_3"), t("index.type_0_feat_4")],
      popular: false, color: "from-red-600 to-orange-500", badge: t("index.type_0_badge"),
    },
    {
      name: t("index.type_1_name"), code: "VCX",
      description: t("index.type_1_desc"),
      features: [t("index.type_1_feat_0"), t("index.type_1_feat_1"), t("index.type_1_feat_2"), t("index.type_1_feat_3"), t("index.type_1_feat_4")],
      popular: true, color: "from-purple-500 to-pink-500", badge: t("index.type_1_badge"),
    },
    {
      name: t("index.type_2_name"), code: "NTX",
      description: t("index.type_2_desc"),
      features: [t("index.type_2_feat_0"), t("index.type_2_feat_1"), t("index.type_2_feat_2"), t("index.type_2_feat_3"), t("index.type_2_feat_4")],
      popular: false, color: "from-emerald-500 to-teal-500", badge: t("index.type_2_badge"),
    },
    {
      name: t("index.type_3_name"), code: "TNLX",
      description: t("index.type_3_desc"),
      features: [t("index.type_3_feat_0"), t("index.type_3_feat_1"), t("index.type_3_feat_2"), t("index.type_3_feat_3"), t("index.type_3_feat_4")],
      popular: false, color: "from-orange-500 to-red-500", badge: t("index.type_3_badge"),
    },
  ];

  const testimonials = [
    { name: t("index.review_0_name"), role: t("index.review_0_role"), avatar: "NVA", content: t("index.review_0_content"), rating: 5 },
    { name: t("index.review_1_name"), role: t("index.review_1_role"), avatar: "TTB", content: t("index.review_1_content"), rating: 5 },
    { name: t("index.review_2_name"), role: t("index.review_2_role"), avatar: "LMC", content: t("index.review_2_content"), rating: 5 },
  ];

  const stats = [
    { number: "1,200+", label: t("index.stat_0") },
    { number: "850+", label: t("index.stat_1") },
    { number: "320+", label: t("index.stat_2") },
    { number: "99.9%", label: t("index.stat_3") },
  ];

  const claimSteps = [
    { step: "01", title: t("index.step_0_title"), description: t("index.step_0_desc"), icon: FiFileText, color: "from-red-600 to-orange-500" },
    { step: "02", title: t("index.step_1_title"), description: t("index.step_1_desc"), icon: FiActivity, color: "from-orange-500 to-amber-500" },
    { step: "03", title: t("index.step_2_title"), description: t("index.step_2_desc"), icon: FiDatabase, color: "from-amber-500 to-teal-500" },
    { step: "04", title: t("index.step_3_title"), description: t("index.step_3_desc"), icon: FiShield, color: "from-teal-500 to-emerald-500" },
    { step: "05", title: t("index.step_4_title"), description: t("index.step_4_desc"), icon: FiCreditCard, color: "from-emerald-500 to-green-500" },
  ];

  return (
    <>
      <Head>
        <title>VehicleChain | ĐHBK Hà Nội - {t("index.hero_title")} {t("index.hero_title2")}</title>
        <meta name="description" content={t("index.hero_desc")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/hust-logo.png" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav
          className={`fixed w-full z-50 transition-all duration-300 ${
            scrollY > 50
              ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
              : "bg-white/80 backdrop-blur-md border-b border-gray-100"
          }`}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 overflow-hidden">
                  <Image src="/hust-logo.png" alt="HUST" width={36} height={36} className="object-contain p-0.5" unoptimized />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">VehicleChain</span>
                  <p className="text-xs text-red-600 leading-none font-semibold">ĐHBK Hà Nội</p>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  {[
                    { href: "#features", label: t("index.nav_features") },
                    { href: "#plans", label: t("index.nav_types") },
                    { href: "#how-it-works", label: t("index.nav_process") },
                    { href: "#testimonials", label: t("index.nav_reviews") },
                  ].map((item) => (
                    <a key={item.href} href={item.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-3">
                <LanguageSwitcher variant="landing" />
                <Link href="/dashboard">
                  <button className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all duration-200 text-sm">
                    {t("index.nav_launch")}
                  </button>
                </Link>
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
              <div className="px-4 pt-3 pb-4 space-y-1">
                {[
                  { href: "#features", label: t("index.nav_features") },
                  { href: "#plans", label: t("index.nav_types") },
                  { href: "#how-it-works", label: t("index.nav_process") },
                  { href: "#testimonials", label: t("index.nav_reviews") },
                ].map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm">
                    {item.label}
                  </a>
                ))}
                <div className="pt-2 pb-1 border-t border-gray-100 space-y-2">
                  <LanguageSwitcher variant="landing" />
                  <Link href="/dashboard">
                    <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-xl font-semibold text-sm">
                      {t("index.nav_launch")}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-red-50">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-50 rounded-full blur-3xl"></div>
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(200,16,46,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,16,46,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white border border-red-100 rounded-full px-4 py-2 mb-8 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 text-sm font-medium">{t("index.hero_badge")}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                {t("index.hero_title")}
                <span className="block bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  {t("index.hero_title2")}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-4xl mx-auto leading-relaxed">
                {t("index.hero_desc")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/plans">
                  <button className="group bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                    <FiTruck className="group-hover:scale-110 transition-transform" />
                    <span>{t("index.cta_register")}</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/policies">
                  <button className="group bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2">
                    <FiFileText />
                    <span>{t("index.cta_contracts")}</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index}
                  className="text-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-500 font-medium text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("index.features_title")}
              </h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                {t("index.features_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index}
                  className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-red-100">
                  <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("index.how_title")}
              </h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                {t("index.how_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {claimSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {index < 4 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent z-0 -translate-x-1/2"></div>
                  )}
                  <div className="relative mb-6 z-10">
                    <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm" style={{ left: "60%" }}>
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Types / Plans */}
        <section id="plans" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("index.types_title")}
              </h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                {t("index.types_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insuranceTypes.map((plan, index) => (
                <div key={index}
                  className={`relative bg-white rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 ${
                    plan.popular
                      ? "border-red-200 ring-2 ring-red-100 shadow-lg shadow-red-50"
                      : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className={`bg-gradient-to-r ${plan.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                      {plan.badge}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mb-4 mt-2 shadow-md`}>
                    <FiShield className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="text-xs font-mono text-gray-400 mb-3">{plan.code}</div>
                  <p className="text-gray-500 text-sm mb-5 leading-relaxed">{plan.description}</p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-600 text-sm">
                        <FiCheck className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/plans">
                    <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      plan.popular
                        ? `bg-gradient-to-r ${plan.color} text-white shadow-md hover:shadow-lg`
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}>
                      {t("index.register_btn", { code: plan.code })}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {t("index.testimonials_title")}
              </h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                {t("index.testimonials_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center mr-4 font-bold text-white text-sm shadow-md">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-gray-900 font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>

                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="w-5 h-5 text-yellow-400" style={{ fill: "currentColor" }} />
                    ))}
                  </div>

                  <p className="text-gray-600 italic leading-relaxed text-sm">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <FiTruck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("index.cta_title")}
            </h2>
            <p className="text-xl text-red-100 mb-8 leading-relaxed">
              {t("index.cta_desc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/plans">
                <button className="group bg-white text-red-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-red-50 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                  <FiTruck />
                  <span>{t("index.cta_register")}</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/policies">
                <button className="group bg-transparent border-2 border-white/70 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-200 flex items-center space-x-2">
                  <FiFileText />
                  <span>{t("index.cta_contracts")}</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200 overflow-hidden">
                    <Image src="/hust-logo.png" alt="HUST" width={36} height={36} className="object-contain p-0.5" unoptimized />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">VehicleChain</span>
                    <p className="text-xs text-red-400">Đại học Bách Khoa Hà Nội</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 max-w-md leading-relaxed text-sm">
                  {t("index.footer_desc")}
                </p>
                <div className="flex items-center space-x-2 text-sm text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>{t("index.footer_active")}</span>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">{t("index.footer_product")}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#features" className="hover:text-white transition-colors">{t("index.footer_nav_features")}</a></li>
                  <li><a href="#plans" className="hover:text-white transition-colors">{t("index.footer_nav_types")}</a></li>
                  <li><Link href="/plans" className="hover:text-white transition-colors">{t("index.footer_register")}</Link></li>
                  <li><Link href="/claims" className="hover:text-white transition-colors">{t("index.footer_claims")}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4 text-sm">{t("index.footer_support")}</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">{t("index.footer_docs")}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t("index.footer_help")}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t("index.footer_contact")}</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">{t("index.footer_sys_status")}</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">{t("index.footer_copyright")}</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t("index.footer_privacy")}</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{t("index.footer_terms")}</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
