"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Store,
  Compass,
  AlertTriangle,
  Scale,
  Wallet,
  Coins,
  MessageSquareQuote,
  SlidersHorizontal,
  FileText,
  HelpCircle,
  Globe,
  Settings2,
  ChevronDown,
  Menu,
  X,
  Edit3,
  Check,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { getTranslation, translateText, SupportedLanguage } from "@/lib/i18n";
import { triggerGoogleTranslate } from "@/components/common/GoogleTranslate";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    profile,
    location,
    business,
    language,
    setLanguage,
    updateProfile,
    updateLocation,
    applyAnalysisProfile,
    analysisProfile,
    userAccount,
    logoutUserAccount,
    isLoading,
  } = useApp();

  const t = getTranslation(language);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Route Protection: enforce completion of the 6-step analysis form before entering workspace
  useEffect(() => {
    if (isLoading) return;
    if (!userAccount?.authenticated || userAccount.isGuest) {
      router.replace("/auth");
    }
  }, [userAccount, isLoading, router]);

  // Edit modal state
  const [editOwnCapital, setEditOwnCapital] = useState(profile?.ownCapitalAvailable || 100000);
  const [editVillage, setEditVillage] = useState(location?.villageOrTown || "Khanna");
  const [editRadius, setEditRadius] = useState<5 | 10>(5);
  const [editBusinessCategory, setEditBusinessCategory] = useState(business?.id || "biz-dairy-processing");

  const handleLanguageSelect = (lang: "EN" | "PA" | "HI") => {
    setLanguage(lang);
    triggerGoogleTranslate(lang);
  };

  // Auto-translate whole page DOM when language changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const translateDom = () => {
      const root = document.getElementById("main-content");
      if (!root) return;

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "CODE", "PRE", "INPUT", "TEXTAREA"].includes(parent.tagName)) continue;

        const textNode = node as Text & { _origText?: string };
        if (textNode._origText === undefined) {
          textNode._origText = textNode.nodeValue || "";
        }

        const raw = textNode._origText;
        const trimmed = raw.trim();
        if (!trimmed || trimmed.length < 2) continue;

        if (language === "EN") {
          if (textNode.nodeValue !== textNode._origText) {
            textNode.nodeValue = textNode._origText;
          }
        } else {
          const translated = translateText(trimmed, language as SupportedLanguage);
          if (translated && translated !== trimmed) {
            const leading = raw.match(/^\s*/)?.[0] || "";
            const trailing = raw.match(/\s*$/)?.[0] || "";
            textNode.nodeValue = leading + translated + trailing;
          }
        }
      }
    };

    // Run immediately
    translateDom();

    // Re-run with slight delay for dynamic sub-renders
    const timer = setTimeout(translateDom, 150);

    // Observe mutations for any newly mounted cards/tabs
    const observer = new MutationObserver(() => {
      translateDom();
    });

    const root = document.getElementById("main-content");
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }

    if (language !== "EN") {
      const gTimer = setTimeout(() => {
        triggerGoogleTranslate(language as SupportedLanguage);
      }, 300);
      return () => {
        clearTimeout(timer);
        clearTimeout(gTimer);
        observer.disconnect();
      };
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [language, pathname]);

  // Permanent Quiet Navigation strictly per structural freeze
  const navItems = [
    {
      name: t.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
      stepKey: "dashboard",
    },
    {
      name: t.market,
      href: "/market",
      icon: Store,
      stepKey: "market",
    },
    {
      name: t.opportunity,
      href: "/opportunity",
      icon: Compass,
      stepKey: "opportunity",
    },
    {
      name: t.risks,
      href: "/risks",
      icon: AlertTriangle,
      stepKey: "risks",
    },
    {
      name: t.feasibility,
      href: "/feasibility",
      icon: Scale,
      stepKey: "feasibility",
    },
    {
      name: t.money,
      href: "/money",
      icon: Wallet,
      stepKey: "money",
    },
    {
      name: t.financing,
      href: "/financing",
      icon: Coins,
      stepKey: "financing",
    },
    {
      name: t.advisor,
      href: "/advisor",
      icon: MessageSquareQuote,
      stepKey: "advisor",
    },
    {
      name: t.whatIf,
      href: "/what-if",
      icon: SlidersHorizontal,
      stepKey: "what-if",
    },
    {
      name: t.report,
      href: "/report",
      icon: FileText,
      stepKey: "report",
    },
  ];

  const handleSaveQuickEdit = async () => {
    if (applyAnalysisProfile && analysisProfile) {
      await applyAnalysisProfile({
        ...analysisProfile,
        capital: editOwnCapital,
        location: {
          ...analysisProfile.location,
          villageOrTown: editVillage,
        },
        business: {
          ...analysisProfile.business,
          categoryId: editBusinessCategory,
          categoryName:
            editBusinessCategory === "biz-flour-mill"
              ? "Mini Flour Mill"
              : editBusinessCategory === "biz-farm-equipment"
              ? "Farm Equipment Custom Hiring"
              : "Dairy Processing",
        },
        analysisRadius: editRadius,
      });
    } else {
      await updateProfile({
        ownCapitalAvailable: editOwnCapital,
      });
      await updateLocation({
        villageOrTown: editVillage,
      });
    }
    setEditModalOpen(false);
  };

  const isRegistered =
    (userAccount && userAccount.authenticated && !userAccount.isGuest) ||
    (typeof window !== "undefined" && !!localStorage.getItem("gramvest_user_account"));

  // If unregistered, return null while useEffect redirects cleanly to /onboarding
  if (!isLoading && !isRegistered) {
    return null;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#fff8f2] text-[#1d1b18] flex flex-col selection:bg-[#c75d3e] selection:text-white">
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#e7ded5] bg-[#fff8f2]/95 px-4 backdrop-blur-md">
        <Link href="/" className="flex items-center py-1 group">
          <Image
            src="/gramvest_logo3.png"
            alt="GramVest"
            width={130}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#786d65] hover:text-[#1d1b18]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside
        suppressHydrationWarning
        className={`fixed left-0 top-0 h-full w-72 bg-[#faf4ee] z-50 flex flex-col justify-between border-r border-[#ede3d8] shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition-transform lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Logo Header */}
          <div className="px-5 py-4 border-b border-[#ede3d8] flex items-center bg-white/40">
            <Link href="/" className="flex items-center group">
              <Image
                src="/gramvest_logo3.png"
                alt="GramVest"
                width={150}
                height={52}
                className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-3 py-4 gap-1">
            <div className="px-3 pt-1 pb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#786d65] font-bold">
                Analysis Workspace
              </span>
            </div>

            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-medium text-[13px] ${
                    isActive
                      ? "bg-[#fcedea] text-[#c75d3e] font-bold shadow-xs border border-[#c75d3e]/20"
                      : "text-[#382f29] hover:bg-white hover:text-[#1d1b18]"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-[#c75d3e]" : "text-[#786d65]"}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div suppressHydrationWarning className="p-3 border-t border-[#ede3d8] flex flex-col gap-1 bg-[#faf4ee]">
          {/* Language Switcher */}
          <div className="notranslate flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-[#ede3d8] text-[#56423d] text-[12px] font-medium" translate="no">
            <span className="flex items-center gap-1.5 notranslate" translate="no">
              <Globe size={14} />
              <span>Language</span>
            </span>
            <div className="notranslate flex items-center gap-1 font-bold text-[11px]" translate="no">
              <button
                type="button"
                translate="no"
                onClick={() => handleLanguageSelect("EN")}
                className={`notranslate px-1.5 py-0.5 rounded transition-colors ${
                  language === "EN"
                    ? "text-[#c75d3e] font-bold"
                    : "text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                English
              </button>
              <span className="text-[#ede3d8]">/</span>
              <button
                type="button"
                translate="no"
                onClick={() => handleLanguageSelect("PA")}
                className={`notranslate px-1.5 py-0.5 rounded transition-colors ${
                  language === "PA"
                    ? "text-[#c75d3e] font-bold"
                    : "text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
              <span className="text-[#ede3d8]">/</span>
              <button
                type="button"
                translate="no"
                onClick={() => handleLanguageSelect("HI")}
                className={`notranslate px-1.5 py-0.5 rounded transition-colors ${
                  language === "HI"
                    ? "text-[#c75d3e] font-bold"
                    : "text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div suppressHydrationWarning className="lg:pl-72 flex-1 flex flex-col">
        {/* ========================================================
            PERMANENT ANALYSIS CONTEXT STRIP
           ======================================================== */}
        <div suppressHydrationWarning className="sticky top-0 z-40 bg-[#fff8f2]/95 backdrop-blur-md border-b border-[#ede3d8] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          {/* Left: Location · Business · Own Capital · Radius Context */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#241b16]" suppressHydrationWarning>
            <span className="font-bold flex items-center gap-1 text-[#c75d3e]">
              <span className="w-2 h-2 rounded-full bg-[#c75d3e] animate-pulse"></span>
              <span>{location?.villageOrTown || "Khanna"}</span>
              <span className="text-[#786d65] font-normal">
                · {location?.block || "Khanna"} · {location?.district || "Ludhiana"}, {location?.state || "Punjab"}
              </span>
            </span>
            <span className="hidden sm:inline text-[#ede3d8]">|</span>
            <span className="font-semibold text-[#382f29]">
              {business?.title || "Agro & Food Processing Venture"}
            </span>
            <span className="hidden sm:inline text-[#ede3d8]">|</span>
            <span className="text-[#786d65]">
              Own Capital:{" "}
              <strong className="text-[#241b16] font-mono">
                {formatCurrency(profile?.ownCapitalAvailable || 100000)}
              </strong>
            </span>
            <span className="hidden md:inline text-[#ede3d8]">|</span>
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#faf4ee] text-[#786d65] border border-[#ede3d8]">
              Radius 5 km
            </span>
          </div>

          {/* Right: Language Pill + [ Edit Analysis ] Button + Profile */}
          <div className="flex items-center gap-2">
            {/* Top Bar Language Switcher */}
            <div className="notranslate flex items-center gap-0.5 bg-white border border-[#ede3d8] rounded-xl p-0.5 shadow-2xs text-xs" translate="no">
              <button
                type="button"
                translate="no"
                onClick={() => handleLanguageSelect("EN")}
                className={`notranslate px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  language === "EN" ? "bg-[#c75d3e] text-white shadow-2xs" : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                English
              </button>
              <button
                type="button"
                translate="no"
                onClick={() => handleLanguageSelect("PA")}
                className={`notranslate px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  language === "PA" ? "bg-[#c75d3e] text-white shadow-2xs" : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
              <button
                type="button"
                translate="no"
                onClick={() => handleLanguageSelect("HI")}
                className={`notranslate px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  language === "HI" ? "bg-[#c75d3e] text-white shadow-2xs" : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                हिंदी
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditOwnCapital(profile?.ownCapitalAvailable || 100000);
                setEditVillage(location?.villageOrTown || "Khanna");
                setEditModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf4ee] border border-[#ede3d8] text-xs font-bold text-[#c75d3e] shadow-2xs transition-all cursor-pointer"
            >
              <Edit3 size={13} />
              <span>{t.editAnalysis}</span>
            </button>

            {/* User Initials Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 rounded-full border border-[#ede3d8] bg-white py-1 px-2 shadow-2xs hover:border-[#c75d3e]/30 cursor-pointer"
              >
                <div
                  suppressHydrationWarning
                  className="w-6 h-6 rounded-full bg-[#c75d3e] text-white text-[11px] font-bold flex items-center justify-center"
                >
                  {mounted ? (userAccount?.name || profile?.fullName || "User").substring(0, 2).toUpperCase() : "US"}
                </div>
                <ChevronDown size={13} className="text-[#786d65]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-[#ede3d8] shadow-lg p-3 z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-[#ede3d8] mb-2" suppressHydrationWarning>
                    <p className="font-bold text-[#241b16]">{mounted ? (userAccount?.name || profile?.fullName || "Registered User") : "Registered User"}</p>
                    <p className="text-[11px] text-[#786d65]">{mounted ? (userAccount?.phone || profile?.phone || userAccount?.contact) : ""}</p>
                    {mounted && userAccount?.email && (
                      <p className="text-[10px] text-[#786d65] truncate">{userAccount.email}</p>
                    )}
                  </div>
                  <Link
                    href="/onboarding"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-2 py-1.5 rounded-lg text-[#382f29] hover:bg-[#faf4ee] font-medium"
                  >
                    Edit Venture Analysis
                  </Link>
                  <Link
                    href="/report"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-2 py-1.5 rounded-lg text-[#382f29] hover:bg-[#faf4ee] font-medium"
                  >
                    View Feasibility Report
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logoutUserAccount();
                      router.push("/onboarding");
                    }}
                    className="w-full text-left mt-1 pt-1.5 border-t border-[#ede3d8] px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main id="main-content" className="flex-1 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ========================================================
          EDIT ANALYSIS MODAL (Triggered via Context Strip)
         ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#ede3d8] shadow-warm-lg max-w-lg w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#ede3d8] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#241b16]">
                    Edit Analysis Parameters
                  </h3>
                  <p className="text-xs text-[#786d65]">Update active scenario inputs live</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#786d65] hover:bg-[#faf4ee]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Business Model / Sector */}
              <div>
                <label className="block font-bold text-[#786d65] uppercase tracking-wider mb-1">
                  Business Model / Sector
                </label>
                <select
                  value={editBusinessCategory}
                  onChange={(e) => setEditBusinessCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ede3d8] font-semibold text-xs text-[#241b16] focus:border-[#c75d3e] focus:outline-none bg-white"
                >
                  <option value="biz-dairy-processing">Dairy Processing &amp; Bulk Milk Chiller</option>
                  <option value="biz-flour-mill">Mini Flour Mill / Atta Chakki Unit</option>
                  <option value="biz-farm-equipment">Farm Equipment Custom Hiring Center (CHC)</option>
                </select>
              </div>

              {/* Village Location */}
              <div>
                <label className="block font-bold text-[#786d65] uppercase tracking-wider mb-1">
                  Village / Operational Hub
                </label>
                <input
                  type="text"
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ede3d8] font-medium text-xs text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
              </div>

              {/* Own Capital Available */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#786d65] uppercase tracking-wider">
                    Your Own Capital (Equity Contribution)
                  </label>
                  <span className="font-bold text-[#c75d3e] font-mono text-sm">
                    {formatCurrency(editOwnCapital)}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={800000}
                  step={25000}
                  value={editOwnCapital}
                  onChange={(e) => setEditOwnCapital(Number(e.target.value))}
                  className="w-full h-2 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
                />
                <div className="flex justify-between text-[10px] text-[#786d65] mt-0.5">
                  <span>₹50,000</span>
                  <span>₹4,00,000</span>
                  <span>₹8,00,000</span>
                </div>
              </div>

              {/* Catchment Radius */}
              <div>
                <label className="block font-bold text-[#786d65] uppercase tracking-wider mb-1">
                  Primary Market Catchment Radius
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRadius(5)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      editRadius === 5
                        ? "border-[#c75d3e] bg-[#fcedea] text-[#c75d3e]"
                        : "border-[#ede3d8] bg-white text-[#786d65]"
                    }`}
                  >
                    5 km (Primary Village Catchment)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRadius(10)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      editRadius === 10
                        ? "border-[#c75d3e] bg-[#fcedea] text-[#c75d3e]"
                        : "border-[#ede3d8] bg-white text-[#786d65]"
                    }`}
                  >
                    10 km (Regional Tehsil Perimeter)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#ede3d8] flex items-center justify-between">
              <Link
                href="/onboarding"
                onClick={() => setEditModalOpen(false)}
                className="text-xs font-semibold text-[#786d65] hover:text-[#c75d3e]"
              >
                Open Full Setup Wizard →
              </Link>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#ede3d8] text-xs font-bold text-[#786d65] hover:bg-[#faf4ee]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickEdit}
                  className="px-5 py-2 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-xs font-bold shadow-warm-sm"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
