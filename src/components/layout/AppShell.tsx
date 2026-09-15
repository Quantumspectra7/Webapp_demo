"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  RotateCcw,
  Edit3,
  Check,
  ArrowRight,
  Database,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { getTranslation } from "@/lib/i18n";

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
    reloadDemoData,
    updateProfile,
    updateLocation,
  } = useApp();

  const t = getTranslation(language);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit modal state
  const [editOwnCapital, setEditOwnCapital] = useState(profile?.ownCapitalAvailable || 100000);
  const [editVillage, setEditVillage] = useState(location?.villageOrTown || "Sidhwan Bet");
  const [editRadius, setEditRadius] = useState<5 | 10>(5);

  // Permanent Quiet Navigation strictly per structural freeze
  const navItems = [
    {
      name: t.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
      hint: "Control Center",
      stepKey: "dashboard",
    },
    {
      name: t.market,
      href: "/market",
      icon: Store,
      hint: "Reach & Saturation",
      stepKey: "market",
    },
    {
      name: t.opportunity,
      href: "/opportunity",
      icon: Compass,
      hint: "Why Here?",
      stepKey: "opportunity",
    },
    {
      name: t.risks,
      href: "/risks",
      icon: AlertTriangle,
      hint: "Threats & Mitigations",
      stepKey: "risks",
    },
    {
      name: t.feasibility,
      href: "/feasibility",
      icon: Scale,
      hint: "78 / 100 Verdict",
      stepKey: "feasibility",
    },
    {
      name: t.money,
      href: "/money",
      icon: Wallet,
      hint: "Capacity & Cash Flow",
      stepKey: "money",
    },
    {
      name: t.financing,
      href: "/financing",
      icon: Coins,
      hint: "Schemes & Subsidies",
      stepKey: "financing",
    },
    {
      name: t.advisor,
      href: "/advisor",
      icon: MessageSquareQuote,
      hint: "Gemini 3.6 AI",
      stepKey: "advisor",
    },
    {
      name: t.whatIf,
      href: "/what-if",
      icon: SlidersHorizontal,
      hint: "Stress Test",
      stepKey: "what-if",
    },
    {
      name: t.report,
      href: "/report",
      icon: FileText,
      hint: "Bank-Ready DPR",
      stepKey: "report",
    },
    {
      name: "Database (Jury)",
      href: "/database",
      icon: Database,
      hint: "PostgreSQL & MSME",
      stepKey: "database",
    },
  ];

  const handleSaveQuickEdit = async () => {
    await updateProfile({
      ownCapitalAvailable: editOwnCapital,
    });
    await updateLocation({
      villageOrTown: editVillage,
    });
    setEditModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] text-[#1d1b18] flex flex-col selection:bg-[#c75d3e] selection:text-white">
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#e7ded5] bg-[#fff8f2]/95 px-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#c75d3e] flex items-center justify-center text-white font-bold text-base shadow-sm">
            GV
          </div>
          <span className="font-serif font-bold text-[19px] text-[#241b16]">
            GramVest
          </span>
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
        className={`fixed left-0 top-0 h-full w-72 bg-[#faf4ee] z-50 flex flex-col justify-between border-r border-[#ede3d8] shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition-transform lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Logo Header */}
          <div className="p-5 border-b border-[#ede3d8] flex items-center justify-between bg-white/40">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#c75d3e] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                GV
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[20px] font-bold tracking-tight text-[#241b16] leading-none">
                  GramVest
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#786d65] mt-1">
                  Rural Decision Engine
                </span>
              </div>
            </Link>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#fcedea] text-[#c75d3e] border border-[#c75d3e]/20">
              SIH 2026
            </span>
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
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl transition-all font-medium text-[13px] ${
                    isActive
                      ? "bg-[#fcedea] text-[#c75d3e] font-bold shadow-xs border border-[#c75d3e]/20"
                      : "text-[#382f29] hover:bg-white hover:text-[#1d1b18]"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      size={17}
                      className={isActive ? "text-[#c75d3e]" : "text-[#786d65]"}
                    />
                    <span>{item.name}</span>
                  </span>
                  {item.hint && (
                    <span className="text-[11px] opacity-70 font-normal">
                      {item.hint}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#ede3d8] flex flex-col gap-1 bg-[#faf4ee]">
          <button
            onClick={() => reloadDemoData()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#56423d] hover:bg-white hover:text-[#1d1b18] text-[12px] font-medium transition-colors w-full text-left"
            title="Reset to Gurpreet Singh (Dairy Jagraon) demo baseline"
          >
            <RotateCcw size={14} className="text-[#786d65]" />
            <span>Reset Demo Scenario</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-[#ede3d8] text-[#56423d] text-[12px] font-medium">
            <span className="flex items-center gap-1.5">
              <Globe size={14} />
              <span>Language</span>
            </span>
            <div className="flex items-center gap-1 font-bold text-[11px]">
              <button
                onClick={() => setLanguage("EN")}
                className={`px-1 py-0.5 rounded transition-colors ${
                  language === "EN"
                    ? "text-[#c75d3e] font-bold"
                    : "text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                EN
              </button>
              <span className="text-[#ede3d8]">/</span>
              <button
                onClick={() => setLanguage("PA")}
                className={`px-1 py-0.5 rounded transition-colors ${
                  language === "PA"
                    ? "text-[#c75d3e] font-bold"
                    : "text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
              <span className="text-[#ede3d8]">/</span>
              <button
                onClick={() => setLanguage("HI")}
                className={`px-1 py-0.5 rounded transition-colors ${
                  language === "HI"
                    ? "text-[#c75d3e] font-bold"
                    : "text-[#786d65] hover:text-[#1d1b18]"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col">
        {/* ========================================================
            PERMANENT ANALYSIS CONTEXT STRIP
           ======================================================== */}
        <div className="sticky top-0 z-40 bg-[#fff8f2]/95 backdrop-blur-md border-b border-[#ede3d8] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          {/* Left: Location · Business · Own Capital · Radius Context */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#241b16]">
            <span className="font-bold flex items-center gap-1 text-[#c75d3e]">
              <span className="w-2 h-2 rounded-full bg-[#c75d3e] animate-pulse"></span>
              <span>{location?.villageOrTown || "Sidhwan Bet"}</span>
              <span className="text-[#786d65] font-normal">
                · {location?.block || "Jagraon"} · {location?.district || "Ludhiana"}, {location?.state || "Punjab"}
              </span>
            </span>
            <span className="hidden sm:inline text-[#ede3d8]">|</span>
            <span className="font-semibold text-[#382f29]">
              {business?.title || "Dairy Value Addition & Chilling"}
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
            <div className="flex items-center gap-0.5 bg-white border border-[#ede3d8] rounded-xl p-0.5 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setLanguage("EN")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  language === "EN" ? "bg-[#c75d3e] text-white" : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("PA")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  language === "PA" ? "bg-[#c75d3e] text-white" : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
              <button
                type="button"
                onClick={() => setLanguage("HI")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  language === "HI" ? "bg-[#c75d3e] text-white" : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                हिंदी
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditOwnCapital(profile?.ownCapitalAvailable || 100000);
                setEditVillage(location?.villageOrTown || "Sidhwan Bet");
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
                <div className="w-6 h-6 rounded-full bg-[#c75d3e] text-white text-[11px] font-bold flex items-center justify-center">
                  {profile?.initials || "GS"}
                </div>
                <ChevronDown size={13} className="text-[#786d65]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-[#ede3d8] shadow-lg p-3 z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-[#ede3d8] mb-2">
                    <p className="font-bold text-[#241b16]">{profile?.fullName || "Gurpreet Singh"}</p>
                    <p className="text-[11px] text-[#786d65]">{profile?.phone}</p>
                  </div>
                  <Link
                    href="/onboarding"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-2 py-1.5 rounded-lg text-[#382f29] hover:bg-[#faf4ee] font-medium"
                  >
                    Re-run Full Onboarding Wizard
                  </Link>
                  <Link
                    href="/report"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-2 py-1.5 rounded-lg text-[#382f29] hover:bg-[#faf4ee] font-medium"
                  >
                    View Feasibility Report
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-[1440px] w-full mx-auto">
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
