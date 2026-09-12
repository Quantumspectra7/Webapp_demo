"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Wallet,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { QuickSessionModal } from "@/components/onboarding/QuickSessionModal";

export default function GetStartedPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleStart = () => {
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#fff8f2] text-[#1d1b18] flex flex-col justify-between selection:bg-[#c75d3e] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#ede3d8] bg-white/70 backdrop-blur-md px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#c75d3e] flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            GV
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[20px] font-bold tracking-tight text-[#241b16] leading-none">
              GramVest
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#786d65] mt-0.5">
              Feasibility Radar · Punjab
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-bold text-[#786d65] hover:text-[#1d1b18] px-3 py-1.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] transition-all cursor-pointer"
          >
            Sign in
          </button>
          <Link
            href="/onboarding"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Start Analysis</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#c75d3e]/10 border border-[#c75d3e]/20 text-xs font-bold text-[#c75d3e] mb-6">
          <Sparkles size={13} />
          <span>Rural Commercial Feasibility Engine</span>
        </div>

        {/* Headline & Subtext per Section 5 */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#241b16] tracking-tight max-w-3xl leading-[1.15]">
          Let’s see if your business idea makes sense here.
        </h1>
        <p className="text-base sm:text-lg text-[#786d65] mt-4 max-w-2xl leading-relaxed">
          GramVest combines local market signals, competition, business risks and financing
          estimates to build your feasibility picture.
        </p>

        {/* 3-Part Visual: 01 WHERE, 02 WHAT, 03 HOW MUCH YOU CAN INVEST */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mt-12 mb-10 text-left">
          {/* 01 WHERE */}
          <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-2xs hover:border-[#c75d3e]/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-[#c75d3e] bg-[#c75d3e]/10 px-2.5 py-1 rounded-lg">
                01
              </span>
              <MapPin size={20} className="text-[#c75d3e]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#241b16] mb-1">WHERE</h3>
            <p className="text-xs text-[#786d65] leading-relaxed">
              Your village, town, or block in Punjab. We identify local customer access, mandi
              distances, and nearby hubs.
            </p>
          </div>

          {/* 02 WHAT */}
          <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-2xs hover:border-[#c75d3e]/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-[#c75d3e] bg-[#c75d3e]/10 px-2.5 py-1 rounded-lg">
                02
              </span>
              <Briefcase size={20} className="text-[#c75d3e]" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#241b16] mb-1">WHAT</h3>
            <p className="text-xs text-[#786d65] leading-relaxed">
              Dairy, agro-processing, services, or your custom idea. We benchmark unit economics and
              real operating margins.
            </p>
          </div>

          {/* 03 HOW MUCH YOU CAN INVEST */}
          <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-2xs hover:border-[#c75d3e]/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-bold text-[#c75d3e] bg-[#c75d3e]/10 px-2.5 py-1 rounded-lg">
                03
              </span>
              <Wallet size={20} className="text-[#c75d3e]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#241b16] mb-1">
              HOW MUCH YOU CAN INVEST
            </h3>
            <p className="text-xs text-[#786d65] leading-relaxed">
              Your own comfortable contribution. We calculate indicative project scope, debt
              servicing, and scheme subsidies.
            </p>
          </div>
        </div>

        {/* Primary CTA Area */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-base sm:text-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Start My Analysis</span>
            <ArrowRight size={20} />
          </Link>

          <p className="text-xs text-[#786d65] flex items-center gap-1.5 font-medium">
            <Clock size={13} className="text-[#c75d3e]" />
            <span>Usually takes 2–3 minutes</span>
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-xs text-[#786d65] hover:text-[#241b16] underline font-medium cursor-pointer"
            >
              Sign in with mobile
            </button>
            <span className="text-[#ede3d8]">·</span>
            <Link
              href="/onboarding"
              className="text-xs text-[#786d65] hover:text-[#241b16] underline font-medium"
            >
              Continue as Guest
            </Link>
          </div>
        </div>

        {/* Reassurance Banner */}
        <div className="mt-12 p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex items-center gap-2 text-xs text-[#786d65] max-w-lg">
          <ShieldCheck size={16} className="text-[#3a6b4c] shrink-0" />
          <span>
            Independent rural feasibility radar. No PAN, Aadhaar, or bank credentials collected.
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ede3d8] bg-white/40 py-6 px-6 sm:px-12 text-center text-xs text-[#786d65]">
        <p>GramVest · Hyper-Local Business Feasibility & Financial Advisory for Rural Punjab</p>
      </footer>

      {/* Quick Session Modal */}
      <QuickSessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onContinue={handleStart}
      />
    </div>
  );
}
