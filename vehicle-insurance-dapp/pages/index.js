import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
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
    {
      icon: FiTruck,
      title: t("index.feat_0_title"),
      description: t("index.feat_0_desc"),
    },
    {
      icon: FiShield,
      title: t("index.feat_1_title"),
      description: t("index.feat_1_desc"),
    },
    {
      icon: FiZap,
      title: t("index.feat_2_title"),
      description: t("index.feat_2_desc"),
    },
    {
      icon: FiDatabase,
      title: t("index.feat_3_title"),
      description: t("index.feat_3_desc"),
    },
    {
      icon: FiCpu,
      title: t("index.feat_4_title"),
      description: t("index.feat_4_desc"),
    },
    {
      icon: FiLock,
      title: t("index.feat_5_title"),
      description: t("index.feat_5_desc"),
    },
  ];

  const insuranceTypes = [
    {
      name: t("index.type_0_name"),
      code: "TNDS",
      description: t("index.type_0_desc"),
      features: [
        t("index.type_0_feat_0"),
        t("index.type_0_feat_1"),
        t("index.type_0_feat_2"),
        t("index.type_0_feat_3"),
        t("index.type_0_feat_4"),
      ],
      popular: false,
      color: "from-red-600 to-orange-500",
      badge: t("index.type_0_badge"),
    },
    {
      name: t("index.type_1_name"),
      code: "VCX",
      description: t("index.type_1_desc"),
      features: [
        t("index.type_1_feat_0"),
        t("index.type_1_feat_1"),
        t("index.type_1_feat_2"),
        t("index.type_1_feat_3"),
        t("index.type_1_feat_4"),
      ],
      popular: true,
      color: "from-purple-500 to-pink-500",
      badge: t("index.type_1_badge"),
    },
    {
      name: t("index.type_2_name"),
      code: "NTX",
      description: t("index.type_2_desc"),
      features: [
        t("index.type_2_feat_0"),
        t("index.type_2_feat_1"),
        t("index.type_2_feat_2"),
        t("index.type_2_feat_3"),
        t("index.type_2_feat_4"),
      ],
      popular: false,
      color: "from-emerald-500 to-teal-500",
      badge: t("index.type_2_badge"),
    },
    {
      name: t("index.type_3_name"),
      code: "TNLX",
      description: t("index.type_3_desc"),
      features: [
        t("index.type_3_feat_0"),
        t("index.type_3_feat_1"),
        t("index.type_3_feat_2"),
        t("index.type_3_feat_3"),
        t("index.type_3_feat_4"),
      ],
      popular: false,
      color: "from-orange-500 to-red-500",
      badge: t("index.type_3_badge"),
    },
  ];

  const testimonials = [
    {
      name: t("index.review_0_name"),
      role: t("index.review_0_role"),
      avatar: "NVA",
      content: t("index.review_0_content"),
      rating: 5,
    },
    {
      name: t("index.review_1_name"),
      role: t("index.review_1_role"),
      avatar: "TTB",
      content: t("index.review_1_content"),
      rating: 5,
    },
    {
      name: t("index.review_2_name"),
      role: t("index.review_2_role"),
      avatar: "LMC",
      content: t("index.review_2_content"),
      rating: 5,
    },
  ];

  const stats = [
    { number: "1,200+", label: t("index.stat_0") },
    { number: "850+", label: t("index.stat_1") },
    { number: "320+", label: t("index.stat_2") },
    { number: "99.9%", label: t("index.stat_3") },
  ];

  const claimSteps = [
    {
      step: "01",
      title: t("index.step_0_title"),
      description: t("index.step_0_desc"),
      icon: FiFileText,
      color: "from-red-600 to-orange-500",
    },
    {
      step: "02",
      title: t("index.step_1_title"),
      description: t("index.step_1_desc"),
      icon: FiActivity,
      color: "from-orange-500 to-teal-500",
    },
    {
      step: "03",
      title: t("index.step_2_title"),
      description: t("index.step_2_desc"),
      icon: FiDatabase,
      color: "from-teal-500 to-emerald-500",
    },
    {
      step: "04",
      title: t("index.step_3_title"),
      description: t("index.step_3_desc"),
      icon: FiShield,
      color: "from-emerald-500 to-green-500",
    },
    {
      step: "05",
      title: t("index.step_4_title"),
      description: t("index.step_4_desc"),
      icon: FiCreditCard,
      color: "from-green-500 to-lime-500",
    },
  ];

  return (
    <>
      <Head>
        <title>VehicleChain - {t("index.hero_title")} {t("index.hero_title2")}</title>
        <meta
          name="description"
          content={t("index.hero_desc")}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0000 0%, #1a0000 20%, #2d0000 45%, #1a0008 70%, #0a0005 100%)" }}>
        {/* Navigation */}
        <nav
          className={`fixed w-full z-50 transition-all duration-300 ${
            scrollY > 50
              ? "bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-lg"
              : "bg-white/10 backdrop-blur-md border-b border-white/20"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiTruck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">
                    VehicleChain
                  </span>
                  <p className="text-xs text-red-300 leading-none">{t("index.logo_tagline")}</p>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <a
                    href="#features"
                    className="text-white/80 hover:text-white transition-colors font-medium"
                  >
                    {t("index.nav_features")}
                  </a>
                  <a
                    href="#plans"
                    className="text-white/80 hover:text-white transition-colors font-medium"
                  >
                    {t("index.nav_types")}
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-white/80 hover:text-white transition-colors font-medium"
                  >
                    {t("index.nav_process")}
                  </a>
                  <a
                    href="#testimonials"
                    className="text-white/80 hover:text-white transition-colors font-medium"
                  >
                    {t("index.nav_reviews")}
                  </a>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-3">
                {/* Language Switcher for landing page (dark variant uses sidebar style) */}
                <LanguageSwitcher variant="landing" />
                <Link href="/dashboard">
                  <button className="bg-gradient-to-r from-orange-500 to-red-700 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105">
                    {t("index.nav_launch")}
                  </button>
                </Link>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-white/20">
              <div className="px-4 pt-3 pb-4 space-y-1">
                <a
                  href="#features"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {t("index.nav_features")}
                </a>
                <a
                  href="#plans"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {t("index.nav_types")}
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {t("index.nav_process")}
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {t("index.nav_reviews")}
                </a>
                <div className="pt-2 pb-1 border-t border-white/20 space-y-2">
                  <LanguageSwitcher variant="landing" />
                  <Link href="/dashboard">
                    <button className="w-full bg-gradient-to-r from-orange-500 to-red-700 text-white px-4 py-3 rounded-xl font-semibold">
                      {t("index.nav_launch")}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm font-medium">
                  {t("index.hero_badge")}
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                {t("index.hero_title")}
                <span className="block bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  {t("index.hero_title2")}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed">
                {t("index.hero_desc")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/plans">
                  <button className="group bg-gradient-to-r from-orange-500 to-red-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                    <FiTruck className="group-hover:scale-110 transition-transform" />
                    <span>{t("index.cta_register")}</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/policies">
                  <button className="group bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                    <FiFileText />
                    <span>{t("index.cta_contracts")}</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/60 font-medium text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("index.features_title")}
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                {t("index.features_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:border-orange-400/40"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/25">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("index.how_title")}
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                {t("index.how_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {claimSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {index < 4 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0 -translate-x-1/2"></div>
                  )}
                  <div className="relative mb-6 z-10">
                    <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md mx-auto" style={{ left: "60%" }}>
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance Types / Plans */}
        <section id="plans" className="py-20 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("index.types_title")}
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                {t("index.types_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insuranceTypes.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? "border-orange-400 ring-2 ring-orange-400/50 shadow-xl shadow-orange-500/20"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className={`bg-gradient-to-r ${plan.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                      {plan.badge}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mb-4 mt-2 shadow-lg`}>
                    <FiShield className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="text-xs font-mono text-white/40 mb-3">{plan.code}</div>

                  <p className="text-white/60 text-sm mb-5 leading-relaxed">
                    {plan.description}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-white/70 text-sm">
                        <FiCheck className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/plans">
                    <button
                      className={`w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? `bg-gradient-to-r ${plan.color} hover:shadow-lg`
                          : "bg-white/15 hover:bg-white/25"
                      }`}
                    >
                      {t("index.register_btn", { code: plan.code })}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t("index.testimonials_title")}
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                {t("index.testimonials_subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:border-orange-400/30"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-700 flex items-center justify-center mr-4 font-bold text-white text-sm shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        {testimonial.name}
                      </h4>
                      <p className="text-white/50 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                        style={{ fill: "currentColor" }}
                      />
                    ))}
                  </div>

                  <p className="text-white/80 italic leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-red-700">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <FiTruck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("index.cta_title")}
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t("index.cta_desc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/plans">
                <button className="group bg-white text-red-400 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <FiTruck />
                  <span>{t("index.cta_register")}</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/policies">
                <button className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/8 hover:text-red-400 transition-all duration-300 flex items-center space-x-2">
                  <FiFileText />
                  <span>{t("index.cta_contracts")}</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-600 rounded-xl flex items-center justify-center">
                    <FiTruck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">VehicleChain</span>
                    <p className="text-xs text-red-300">{t("index.footer_tagline")}</p>
                  </div>
                </div>
                <p className="text-white/60 mb-6 max-w-md leading-relaxed">
                  {t("index.footer_desc")}
                </p>
                <div className="flex items-center space-x-2 text-sm text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span>{t("index.footer_active")}</span>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">{t("index.footer_product")}</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      {t("index.footer_nav_features")}
                    </a>
                  </li>
                  <li>
                    <a href="#plans" className="hover:text-white transition-colors">
                      {t("index.footer_nav_types")}
                    </a>
                  </li>
                  <li>
                    <Link href="/plans" className="hover:text-white transition-colors">
                      {t("index.footer_register")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/claims" className="hover:text-white transition-colors">
                      {t("index.footer_claims")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">{t("index.footer_support")}</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      {t("index.footer_docs")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      {t("index.footer_help")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      {t("index.footer_contact")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      {t("index.footer_sys_status")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-white/60 text-sm">
                {t("index.footer_copyright")}
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  {t("index.footer_privacy")}
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  {t("index.footer_terms")}
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Cookie
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}


